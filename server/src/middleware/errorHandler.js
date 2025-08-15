/**
 * Error Handler Middleware
 * Handles and formats errors consistently
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error response
  let status = 500;
  let errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong',
      details: {},
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    errorResponse.error.code = 'VALIDATION_ERROR';
    errorResponse.error.message = err.message;
  } else if (err.name === 'NotFoundError') {
    status = 404;
    errorResponse.error.code = 'NOT_FOUND';
    errorResponse.error.message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    errorResponse.error.code = 'UNAUTHORIZED';
    errorResponse.error.message = 'Authentication required';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    errorResponse.error.code = 'FORBIDDEN';
    errorResponse.error.message = 'Access denied';
  }

  // Add request ID for debugging
  if (req.headers['x-request-id']) {
    errorResponse.error.request_id = req.headers['x-request-id'];
  }

  res.status(status).json(errorResponse);
};

// Custom error classes
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}
