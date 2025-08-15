/**
 * Chat Routes
 * Handles messaging, polls, and chat functionality
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  messages, 
  currentUser,
  householdMembers
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired,
  simulateFileUpload 
} from '../utils/helpers.js';

const router = express.Router({ mergeParams: true });

// Get messages for household
router.get('/', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { 
    page = 1, 
    limit = 50, 
    before, 
    after, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter messages by household
  let householdMessages = messages.filter(m => m.household_id === householdId);
  
  // Apply filters
  const filters = { type, before, after };
  householdMessages = filterItems(householdMessages, filters);
  
  // Sort messages
  householdMessages = sortItems(householdMessages, sort_by, sort_order);
  
  // Paginate
  const paginatedResult = paginate(householdMessages, page, limit);
  
  res.success(paginatedResult);
});

// Send message
router.post('/', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { content, message_type = 'text', replied_to, poll } = req.body;
  
  try {
    validateRequired(req.body, ['content']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (message_type === 'poll' && !poll) {
    return res.error('VALIDATION_ERROR', 'Poll data required for poll message type', null, 400);
  }
  
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content,
    message_type,
    replied_to: replied_to || null,
    poll: null,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Create poll if message type is poll
  if (message_type === 'poll' && poll) {
    newMessage.poll = {
      id: uuidv4(),
      question: poll.question,
      options: poll.options,
      multiple_choice: poll.multiple_choice || false,
      expires_at: poll.expires_at || null,
      votes: [],
      vote_counts: new Array(poll.options.length).fill(0),
      total_votes: 0,
    };
  }
  
  messages.unshift(newMessage); // Add to beginning for latest-first order
  
  res.success(newMessage, 'Message sent successfully');
});

// Get specific message
router.get('/:messageId', async (req, res) => {
  await delay(100);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  res.success(message);
});

// Edit message
router.put('/:messageId', async (req, res) => {
  await delay(200);
  
  const { content } = req.body;
  
  if (!content) {
    return res.error('VALIDATION_ERROR', 'Content is required', null, 400);
  }
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only edit your own messages', null, 403);
  }
  
  message.content = content;
  message.edited_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success(message, 'Message updated successfully');
});

// Delete message
router.delete('/:messageId', async (req, res) => {
  await delay(150);
  
  const messageIndex = messages.findIndex(m => m.id === req.params.messageId);
  
  if (messageIndex === -1) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  const message = messages[messageIndex];
  
  if (message.user_id !== currentUser.id) {
    return res.error('FORBIDDEN', 'You can only delete your own messages', null, 403);
  }
  
  // Soft delete - mark as deleted
  message.deleted_at = new Date().toISOString();
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message deleted successfully');
});

// Upload file/image
router.post('/upload', async (req, res) => {
  await delay(1500); // Simulate file upload
  
  const { householdId } = req.params;
  
  // Simulate file upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-file.jpg',
    size: 2048000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with file
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || 'Shared a file',
    message_type: 'text',
    replied_to: null,
    poll: null,
    file_url: uploadResult.url,
    file_name: uploadResult.filename,
    file_size: uploadResult.size,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'File uploaded and shared successfully');
});

router.post('/upload-image', async (req, res) => {
  await delay(1200); // Simulate image upload
  
  const { householdId } = req.params;
  
  // Simulate image upload
  const uploadResult = simulateFileUpload({
    originalname: 'shared-image.jpg',
    size: 1536000,
    mimetype: 'image/jpeg'
  });
  
  // Create message with image
  const newMessage = {
    id: uuidv4(),
    household_id: householdId,
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    content: req.body.caption || '📷 Shared an image',
    message_type: 'text',
    replied_to: null,
    poll: null,
    image_url: uploadResult.url,
    edited_at: null,
    deleted_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  messages.unshift(newMessage);
  
  res.success(newMessage, 'Image uploaded and shared successfully');
});

// Vote on poll
router.post('/:pollId/vote', async (req, res) => {
  await delay(250);
  
  const { selected_options } = req.body;
  
  try {
    validateRequired(req.body, ['selected_options']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(selected_options)) {
    return res.error('VALIDATION_ERROR', 'selected_options must be an array', null, 400);
  }
  
  // Find poll in messages
  let foundPoll = null;
  let foundMessage = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      foundMessage = message;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  // Check if poll has expired
  if (foundPoll.expires_at && new Date(foundPoll.expires_at) < new Date()) {
    return res.error('BAD_REQUEST', 'Poll has expired', null, 400);
  }
  
  // Remove existing vote from this user
  foundPoll.votes = foundPoll.votes.filter(vote => vote.user_id !== currentUser.id);
  
  // Add new vote
  const newVote = {
    user_id: currentUser.id,
    user_name: currentUser.full_name,
    user_avatar: currentUser.avatar_url,
    selected_options,
    voted_at: new Date().toISOString(),
  };
  
  foundPoll.votes.push(newVote);
  
  // Update vote counts
  foundPoll.vote_counts = new Array(foundPoll.options.length).fill(0);
  foundPoll.votes.forEach(vote => {
    vote.selected_options.forEach(optionIndex => {
      if (optionIndex >= 0 && optionIndex < foundPoll.vote_counts.length) {
        foundPoll.vote_counts[optionIndex]++;
      }
    });
  });
  
  foundPoll.total_votes = foundPoll.votes.length;
  foundMessage.updated_at = new Date().toISOString();
  
  res.success({
    poll_id: foundPoll.id,
    user_id: currentUser.id,
    selected_options,
    voted_at: newVote.voted_at,
    updated_vote_counts: foundPoll.vote_counts,
  }, 'Vote recorded successfully');
});

// Get poll results
router.get('/:pollId/results', async (req, res) => {
  await delay(100);
  
  // Find poll in messages
  let foundPoll = null;
  
  for (const message of messages) {
    if (message.poll && message.poll.id === req.params.pollId) {
      foundPoll = message.poll;
      break;
    }
  }
  
  if (!foundPoll) {
    return res.error('NOT_FOUND', 'Poll not found', null, 404);
  }
  
  res.success(foundPoll);
});

// Search messages
router.get('/search', async (req, res) => {
  await delay(300);
  
  const { householdId } = req.params;
  const { 
    q: query, 
    type, 
    user_id, 
    before, 
    after, 
    limit = 20 
  } = req.query;
  
  if (!query) {
    return res.error('VALIDATION_ERROR', 'Search query (q) is required', null, 400);
  }
  
  let results = messages.filter(m => 
    m.household_id === householdId && 
    m.content.toLowerCase().includes(query.toLowerCase()) &&
    !m.deleted_at
  );
  
  // Apply additional filters
  if (type) {
    results = results.filter(m => m.message_type === type);
  }
  
  if (user_id) {
    results = results.filter(m => m.user_id === user_id);
  }
  
  if (before) {
    results = results.filter(m => new Date(m.created_at) < new Date(before));
  }
  
  if (after) {
    results = results.filter(m => new Date(m.created_at) > new Date(after));
  }
  
  // Sort by relevance (simple: most recent first)
  results = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Limit results
  results = results.slice(0, parseInt(limit));
  
  res.success({
    data: results,
    meta: {
      query,
      total_results: results.length,
      limit: parseInt(limit),
    },
  });
});

// Typing indicator (mock endpoint)
router.post('/typing', async (req, res) => {
  // This would typically be handled via WebSocket
  // For mock, just acknowledge
  res.success({ success: true });
});

// Pin/unpin message
router.post('/:messageId/pin', async (req, res) => {
  await delay(200);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = true;
  message.pinned_at = new Date().toISOString();
  message.pinned_by = currentUser.id;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message pinned successfully');
});

router.delete('/:messageId/pin', async (req, res) => {
  await delay(150);
  
  const message = messages.find(m => m.id === req.params.messageId);
  
  if (!message) {
    return res.error('NOT_FOUND', 'Message not found', null, 404);
  }
  
  message.pinned = false;
  message.pinned_at = null;
  message.pinned_by = null;
  message.updated_at = new Date().toISOString();
  
  res.success({ success: true }, 'Message unpinned successfully');
});

// Get pinned messages
router.get('/pinned', async (req, res) => {
  await delay(150);
  
  const { householdId } = req.params;
  
  const pinnedMessages = messages.filter(m => 
    m.household_id === householdId && m.pinned && !m.deleted_at
  );
  
  res.success(pinnedMessages);
});

// Chat statistics
router.get('/statistics', async (req, res) => {
  await delay(200);
  
  const { householdId } = req.params;
  const { period = 'week' } = req.query;
  
  const householdMessages = messages.filter(m => m.household_id === householdId && !m.deleted_at);
  
  const messagesByUser = householdMessages.reduce((acc, msg) => {
    acc[msg.user_id] = (acc[msg.user_id] || 0) + 1;
    return acc;
  }, {});
  
  const activeUsers = Object.keys(messagesByUser).length;
  
  // Mock daily message counts
  const messagesByDay = [
    { date: '2024-01-15', count: 12 },
    { date: '2024-01-16', count: 8 },
    { date: '2024-01-17', count: 15 },
    { date: '2024-01-18', count: 6 },
    { date: '2024-01-19', count: 11 },
  ];
  
  res.success({
    total_messages: householdMessages.length,
    active_users: activeUsers,
    messages_by_user: messagesByUser,
    messages_by_day: messagesByDay,
    popular_reactions: [
      { emoji: '👍', count: 23 },
      { emoji: '😂', count: 18 },
      { emoji: '❤️', count: 15 },
    ],
  });
});

export default router;
