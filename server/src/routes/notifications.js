/**
 * Notification Routes
 * Handles notifications and device registration
 */

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { 
  notifications, 
  currentUser 
} from '../data/mockData.js';
import { 
  delay, 
  paginate, 
  filterItems, 
  sortItems, 
  validateRequired 
} from '../utils/helpers.js';

const router = express.Router();

// Mock device tokens storage
let deviceTokens = [];

// Get notifications for current user
router.get('/', async (req, res) => {
  await delay(200);
  
  const { 
    page = 1, 
    limit = 50, 
    read, 
    type,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = req.query;
  
  // Filter notifications for current user
  let userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  
  // Apply filters
  const filters = { type };
  if (read !== undefined) {
    if (read === 'true') {
      userNotifications = userNotifications.filter(n => n.read_at !== null);
    } else if (read === 'false') {
      userNotifications = userNotifications.filter(n => n.read_at === null);
    }
  }
  
  userNotifications = filterItems(userNotifications, filters);
  
  // Sort notifications
  userNotifications = sortItems(userNotifications, sort_by, sort_order);
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => n.user_id === currentUser.id && n.read_at === null).length;
  
  // Paginate
  const paginatedResult = paginate(userNotifications, page, limit);
  
  // Add unread count to meta
  paginatedResult.meta.unread_count = unreadCount;
  
  res.success(paginatedResult);
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  await delay(150);
  
  const notification = notifications.find(n => n.id === req.params.id && n.user_id === currentUser.id);
  
  if (!notification) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notification.read_at = new Date().toISOString();
  notification.updated_at = new Date().toISOString();
  
  res.success({
    id: notification.id,
    read_at: notification.read_at,
  }, 'Notification marked as read');
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  await delay(300);
  
  let marked_count = 0;
  
  notifications.forEach(notification => {
    if (notification.user_id === currentUser.id && !notification.read_at) {
      notification.read_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();
      marked_count++;
    }
  });
  
  res.success({
    marked_read_count: marked_count,
  }, `${marked_count} notifications marked as read`);
});

// Delete notification
router.delete('/:id', async (req, res) => {
  await delay(150);
  
  const notificationIndex = notifications.findIndex(n => 
    n.id === req.params.id && n.user_id === currentUser.id
  );
  
  if (notificationIndex === -1) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  notifications.splice(notificationIndex, 1);
  
  res.success({ success: true }, 'Notification deleted successfully');
});

// Delete all read notifications
router.delete('/read', async (req, res) => {
  await delay(400);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    const notification = notifications[i];
    if (notification.user_id === currentUser.id && notification.read_at) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} read notifications deleted`);
});

// Delete all notifications
router.delete('/', async (req, res) => {
  await delay(500);
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    if (notifications[i].user_id === currentUser.id) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    deleted_count,
  }, `${deleted_count} notifications deleted`);
});

// Register device for push notifications
router.post('/device', async (req, res) => {
  await delay(300);
  
  const { token, platform, active = true } = req.body;
  
  try {
    validateRequired(req.body, ['token', 'platform']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // Check if device already exists
  const existingDevice = deviceTokens.find(d => d.token === token);
  
  if (existingDevice) {
    existingDevice.active = active;
    existingDevice.last_used = new Date().toISOString();
  } else {
    const newDevice = {
      id: uuidv4(),
      user_id: currentUser.id,
      token,
      platform,
      active,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    };
    deviceTokens.push(newDevice);
  }
  
  res.success({ success: true }, 'Device registered for push notifications');
});

// Unregister device
router.delete('/device/:token', async (req, res) => {
  await delay(200);
  
  const tokenIndex = deviceTokens.findIndex(d => 
    d.token === req.params.token && d.user_id === currentUser.id
  );
  
  if (tokenIndex === -1) {
    return res.error('NOT_FOUND', 'Device token not found', null, 404);
  }
  
  deviceTokens.splice(tokenIndex, 1);
  
  res.success({ success: true }, 'Device unregistered successfully');
});

// Get registered devices
router.get('/devices', async (req, res) => {
  await delay(150);
  
 const userDevices = deviceTokens
    .filter(d => d.user_id === currentUser.id)
    .map(device => ({
      id: device.id,
      platform: device.platform,
      created_at: device.created_at,
      last_used: device.last_used,
      active: device.active,
    }));
  
  res.success(userDevices);
});

// Update device status
router.patch('/devices/:deviceId', async (req, res) => {
  await delay(200);
  
  const { active } = req.body;
  
  const device = deviceTokens.find(d => 
    d.id === req.params.deviceId && d.user_id === currentUser.id
  );
  
  if (!device) {
    return res.error('NOT_FOUND', 'Device not found', null, 404);
  }
  
  if (active !== undefined) {
    device.active = active;
    device.last_used = new Date().toISOString();
  }
  
  res.success({ success: true }, 'Device updated successfully');
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  await delay(100);
  
  // Mock preferences
  const preferences = {
    email_notifications: true,
    push_notifications: true,
    task_reminders: true,
    bill_reminders: true,
    chat_messages: true,
    household_updates: true,
    quiet_hours: {
      enabled: false,
      start_time: '22:00',
      end_time: '07:00',
    },
  };
  
  res.success(preferences);
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  await delay(250);
  
  // In a real app, preferences would be stored in database
  // For mock, just acknowledge the update
  res.success({ success: true }, 'Notification preferences updated successfully');
});

// Send notification (admin/system use)
router.post('/send', async (req, res) => {
  await delay(400);
  
  const { user_ids, title, message, type, related_id, related_table } = req.body;
  
  try {
    validateRequired(req.body, ['user_ids', 'title', 'message', 'type']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  if (!Array.isArray(user_ids)) {
    return res.error('VALIDATION_ERROR', 'user_ids must be an array', null, 400);
  }
  
  let sent_count = 0;
  
  user_ids.forEach(userId => {
    const newNotification = {
      id: uuidv4(),
      user_id: userId,
      household_id: 'system', // System notification
      title,
      message,
      type,
      related_id: related_id || null,
      related_table: related_table || null,
      read_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    notifications.unshift(newNotification);
    sent_count++;
  });
  
  res.success({
    success: true,
    sent_count,
  }, `Notification sent to ${sent_count} users`);
});

// Send household notification
router.post('/:householdId/notifications/send', async (req, res) => {
  await delay(500);
  
  const { householdId } = req.params;
  const { title, message, type, related_id, related_table } = req.body;
  
  try {
    validateRequired(req.body, ['title', 'message', 'type']);
  } catch (error) {
    return res.error('VALIDATION_ERROR', error.message, null, 400);
  }
  
  // In a real app, would get all household members
  // For mock, just send to current user
  const newNotification = {
    id: uuidv4(),
    user_id: currentUser.id,
    household_id: householdId,
    title,
    message,
    type,
    related_id: related_id || null,
    related_table: related_table || null,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  notifications.unshift(newNotification);
  
  res.success({
    success: true,
    sent_count: 1,
  }, 'Household notification sent');
});

// Bulk mark as read
router.post('/bulk-read', async (req, res) => {
  await delay(300);
  
  const { notification_ids } = req.body;
  
  if (!notification_ids || !Array.isArray(notification_ids)) {
    return res.error('VALIDATION_ERROR', 'notification_ids array is required', null, 400);
  }
  
  let marked_count = 0;
  
  notifications.forEach(notification => {
    if (
      notification_ids.includes(notification.id) && 
      notification.user_id === currentUser.id &&
      !notification.read_at
    ) {
      notification.read_at = new Date().toISOString();
      notification.updated_at = new Date().toISOString();
      marked_count++;
    }
  });
  
  res.success({
    success: true,
    marked_count,
  }, `${marked_count} notifications marked as read`);
});

// Bulk delete
router.post('/bulk-delete', async (req, res) => {
  await delay(400);
  
  const { notification_ids } = req.body;
  
  if (!notification_ids || !Array.isArray(notification_ids)) {
    return res.error('VALIDATION_ERROR', 'notification_ids array is required', null, 400);
  }
  
  let deleted_count = 0;
  
  for (let i = notifications.length - 1; i >= 0; i--) {
    const notification = notifications[i];
    if (
      notification_ids.includes(notification.id) && 
      notification.user_id === currentUser.id
    ) {
      notifications.splice(i, 1);
      deleted_count++;
    }
  }
  
  res.success({
    success: true,
    deleted_count,
  }, `${deleted_count} notifications deleted`);
});

// Get notification statistics
router.get('/statistics', async (req, res) => {
  await delay(200);
  
  const userNotifications = notifications.filter(n => n.user_id === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.read_at).length;
  
  const notificationsByType = userNotifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {});
  
  // Mock daily notification counts
  const notificationsByDay = [
    { date: '2024-01-15', count: 3 },
    { date: '2024-01-16', count: 1 },
    { date: '2024-01-17', count: 2 },
    { date: '2024-01-18', count: 0 },
    { date: '2024-01-19', count: 1 },
  ];
  
  res.success({
    total_notifications: userNotifications.length,
    unread_count: unreadCount,
    notifications_by_type: notificationsByType,
    notifications_by_day: notificationsByDay,
    average_response_time: 320, // Mock: 320 seconds
  });
});

// Test notification
router.post('/test', async (req, res) => {
  await delay(1000);
  
  const { platform } = req.body;
  
  if (!platform) {
    return res.error('VALIDATION_ERROR', 'Platform is required', null, 400);
  }
  
  // Create test notification
  const testNotification = {
    id: uuidv4(),
    user_id: currentUser.id,
    household_id: 'test',
    title: '🧪 Test Notification',
    message: `This is a test ${platform} notification from Homey!`,
    type: 'test',
    related_id: null,
    related_table: null,
    read_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  notifications.unshift(testNotification);
  
  res.success({ success: true }, `Test ${platform} notification sent`);
});

// Get delivery status (mock)
router.get('/:id/delivery-status', async (req, res) => {
  await delay(150);
  
  const notification = notifications.find(n => 
    n.id === req.params.id && n.user_id === currentUser.id
  );
  
  if (!notification) {
    return res.error('NOT_FOUND', 'Notification not found', null, 404);
  }
  
  // Mock delivery status
  res.success({
    sent_at: notification.created_at,
    delivered_at: notification.created_at, // Mock: delivered immediately
    read_at: notification.read_at,
    failed_at: null,
    error_message: null,
  });
});

export default router;
