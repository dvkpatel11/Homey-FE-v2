/**
 * Task Routes
 * Handles task management, assignments, and swaps
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  tasks, 
  householdMembers, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router();

// Get tasks for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    status, 
    assigned_to, 
    category, 
    due_after, 
    due_before,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter tasks by household
  let householdTasks = tasks.filter(t => t.household_id === householdId);
  
  // Apply filters
  const filters = { status, assigned_to, category, due_after, due_before };
  householdTasks = filterItems(householdTasks, filters);
  
  // Handle assigned_to filter specially
  if (assigned_to) {
    householdTasks = householdTasks.filter(task => 
      task.assignments.some(assignment => assignment.assigned_to === assigned_to)
    );
  }
  
  // Sort tasks
  householdTasks = sortItems(householdTasks, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdTasks, page, limit);
  
  res.success(paginatedResult);
});

// Create new task
router.post('/', async (req, res) => {
  await delay(400);
  
  const { householdId } = req.params;
  const { 
    title, 
    description, 
    due_date, 
    is_recurring = false, 
    recurrence_pattern, 
    recurrence_interval,
    category,
    assigned_to = []
  } = req.body;
  
  try {
    validateRequired(req.body, ['title']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (is_recurring && !recurrence_pattern) {
    return res.error('VALIDATION_ERROR', 'Recurrence pattern required for recurring tasks', null, 400);
  }
  
  const newTask = {
    id: uuidv4(),
    household_id: householdId,
    title,
    description: description || null,
    due_date: due_date || null,
    is_recurring,
    recurrence_pattern: recurrence_pattern || null,
    recurrence_interval: recurrence_interval || null,
    category: category || null,
    status: 'pending',
    created_by: currentUser.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assignments: [],
    swap_requests: [],
  };
  
  // Create assignments
  if (assigned_to.length > 0) {
    newTask.assignments = assigned_to.map(userId => {
      const member = householdMembers.find(m => m.user_id === userId);
      return {
        id: uuidv4(),
        assigned_to: userId,
        assigned_to_name: member?.full_name || 'Unknown User',
        assigned_to_avatar: member?.avatar_url || null,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      };
    });
  }
  
  tasks.push(newTask);
  
  res.success(newTask, 'Task created successfully');
});

// Get specific task
router.get('/:id', async (req, res) => {
  await delay(100);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  res.success(task);
});

// Update task
router.put('/:id', async (req, res) => {
  await delay(300);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const task = tasks[taskIndex];
  
  // Update fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] !== undefined && key !== 'id') {
      task[key] = req.body[key];
    }
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success(task, 'Task updated successfully');
});

// Delete task
router.delete('/:id', async (req, res) => {
  await delay(200);
  
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  tasks.splice(taskIndex, 1);
  
  res.success({ success: true }, 'Task deleted successfully');
});

// Assign task to users
router.post('/:id/assign', async (req, res) => {
  await delay(250);
  
  const { user_ids } = req.body;
  
  if (!user_ids || !Array.isArray(user_ids)) {
    return res.error('VALIDATION_ERROR', 'user_ids array is required', null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Clear existing assignments and create new ones
  task.assignments = user_ids.map(userId => {
    const member = householdMembers.find(m => m.user_id === userId);
    return {
      id: uuidv4(),
      assigned_to: userId,
      assigned_to_name: member?.full_name || 'Unknown User',
      assigned_to_avatar: member?.avatar_url || null,
      assigned_at: new Date().toISOString(),
      completed_at: null,
    };
  });
  
  task.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Task assigned successfully');
});

// Mark task as complete
router.put('/:id/complete', async (req, res) => {
  await delay(200);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'completed';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as completed
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
  }, 'Task completed successfully');
});

// Mark task as incomplete
router.put('/:id/uncomplete', async (req, res) => {
  await delay(150);
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  task.status = 'pending';
  task.updated_at = new Date().toISOString();
  
  // Mark user's assignment as incomplete
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = null;
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: null,
    completed_by: currentUser.id,
  }, 'Task marked as incomplete');
});

// Complete task with photo
router.post('/:id/complete/with-photo', async (req, res) => {
  await delay(1000); // Simulate photo upload
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'task-completion.jpg',
    size: 1024000,
    mimetype: 'image/jpeg'
  });
  
  task.status = 'completed';
  task.completion_photo = uploadResult.url;
  task.updated_at = new Date().toISOString();
  
  const userAssignment = task.assignments.find(a => a.assigned_to === currentUser.id);
  if (userAssignment) {
    userAssignment.completed_at = new Date().toISOString();
  }
  
  res.success({
    id: task.id,
    status: task.status,
    completed_at: new Date().toISOString(),
    completed_by: currentUser.id,
    photo_url: uploadResult.url,
  }, 'Task completed with photo');
});

// Request task swap
router.post('/:id/swap/request', async (req, res) => {
  await delay(300);
  
  const { to_user_id, notes } = req.body;
  
  try {
    validateRequired(req.body, ['to_user_id']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  const task = tasks.find(t => t.id === req.params.id);
  
  if (!task) {
    return res.error('NOT_FOUND', 'Task not found', null, 404);
  }
  
  const swapRequest = {
    id: uuidv4(),
    task_id: req.params.id,
    from_user_id: currentUser.id,
    to_user_id,
    status: 'pending',
    notes: notes || null,
    requested_at: new Date().toISOString(),
    responded_at: null,
  };
  
  task.swap_requests.push(swapRequest);
  task.updated_at = new Date().toISOString();
  
  res.success(swapRequest, 'Swap request created successfully');
});

// Accept swap request
router.put('/swaps/:swapId/accept', async (req, res) => {
  await delay(250);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'accepted';
  foundSwap.responded_at = new Date().toISOString();
  
  // Update task assignment
  const fromAssignment = foundTask.assignments.find(a => a.assigned_to === foundSwap.from_user_id);
  const toMember = householdMembers.find(m => m.user_id === foundSwap.to_user_id);
  
  if (fromAssignment && toMember) {
    fromAssignment.assigned_to = foundSwap.to_user_id;
    fromAssignment.assigned_to_name = toMember.full_name;
    fromAssignment.assigned_to_avatar = toMember.avatar_url;
    fromAssignment.assigned_at = new Date().toISOString();
  }
  
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request accepted');
});

// Decline swap request
router.put('/swaps/:swapId/decline', async (req, res) => {
  await delay(200);
  
  // Find swap request across all tasks
  let foundSwap = null;
  let foundTask = null;
  
  for (const task of tasks) {
    const swap = task.swap_requests.find(s => s.id === req.params.swapId);
    if (swap) {
      foundSwap = swap;
      foundTask = task;
      break;
    }
  }
  
  if (!foundSwap) {
    return res.error('NOT_FOUND', 'Swap request not found', null, 404);
  }
  
  foundSwap.status = 'declined';
  foundSwap.responded_at = new Date().toISOString();
  foundTask.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Swap request declined');
});

// Get task swaps for household
router.get('/swaps', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const swaps = [];
  tasks.filter(t => t.household_id === householdId).forEach(task => {
    task.swap_requests.forEach(swap => {
      const fromMember = householdMembers.find(m => m.user_id === swap.from_user_id);
      const toMember = householdMembers.find(m => m.user_id === swap.to_user_id);
      
      swaps.push({
        id: swap.id,
        task: {
          id: task.id,
          title: task.title,
          due_date: task.due_date,
        },
        from_user: {
          id: swap.from_user_id,
          name: fromMember?.full_name || 'Unknown',
          avatar_url: fromMember?.avatar_url || null,
        },
        to_user: {
          id: swap.to_user_id,
          name: toMember?.full_name || 'Unknown',
          avatar_url: toMember?.avatar_url || null,
        },
        status: swap.status,
        notes: swap.notes,
        requested_at: swap.requested_at,
      });
    });
  });
  
  res.success(swaps);
});

// Bulk operations
router.post('/bulk-complete', async (req, res) => {
  await delay(500);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let completed_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = 'completed';
      task.updated_at = new Date().toISOString();
      completed_count++;
    }
  });
  
  res.success({ 
    success: true, 
    completed_count 
  }, `${completed_count} tasks completed`);
});

router.post('/bulk-assign', async (req, res) => {
  await delay(400);
  
  const { task_ids, user_id } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids) || !user_id) {
    return res.error('VALIDATION_ERROR', 'task_ids array and user_id are required', null, 400);
  }
  
  const member = householdMembers.find(m => m.user_id === user_id);
  let assigned_count = 0;
  
  task_ids.forEach(taskId => {
    const task = tasks.find(t => t.id === taskId);
    if (task && member) {
      task.assignments = [{
        id: uuidv4(),
        assigned_to: user_id,
        assigned_to_name: member.full_name,
        assigned_to_avatar: member.avatar_url,
        assigned_at: new Date().toISOString(),
        completed_at: null,
      }];
      task.updated_at = new Date().toISOString();
      assigned_count++;
    }
  });
  
  res.success({ 
    success: true, 
    assigned_count 
  }, `${assigned_count} tasks assigned`);
});

router.post('/bulk-delete', async (req, res) => {
  await delay(300);
  
  const { task_ids } = req.body;
  
  if (!task_ids || !Array.isArray(task_ids)) {
    return res.error('VALIDATION_ERROR', 'task_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  // Remove tasks in reverse order to maintain indices
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (task_ids.includes(tasks[i].id)) {
      tasks.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({ 
    success: true, 
    deleted_count 
  }, `${deleted_count} tasks deleted`);
});

export default router;
