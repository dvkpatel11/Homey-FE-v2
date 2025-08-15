/**
 * Mock Auth Middleware
 * Bypasses authentication and sets current user
 */

import { currentUser } from '../data/mockData.js';

export const mockAuth = (req, res, next) => {
  // Always set the current user (bypassing auth)
  req.user = currentUser;
  req.authenticated = true;
  
  // Add mock authorization header if not present
  if (!req.headers.authorization) {
    req.headers.authorization = 'Bearer mock-token-123';
  }
  
  next();
};

export const requireAdmin = (req, res, next) => {
  // In mock mode, always allow admin actions
  req.isAdmin = true;
  next();
};
