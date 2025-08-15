/**
 * Response Formatter Middleware
 * Ensures consistent API response format
 */

export const responseFormatter = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to format responses
  res.json = function(data) {
    // If data is already in API format, return as-is
    if (data && (data.data !== undefined || data.error !== undefined)) {
      return originalJson.call(this, data);
    }

    // Format successful responses
    const formattedResponse = {
      data,
      message: res.locals.message || null,
      meta: res.locals.meta || null,
    };

    return originalJson.call(this, formattedResponse);
  };

  // Helper methods for responses
  res.success = function(data, message = null, meta = null) {
    return this.json({
      data,
      message,
      meta,
    });
  };

  res.error = function(code, message, details = null, status = 400) {
    this.status(status);
    return this.json({
      error: {
        code,
        message,
        details,
      },
    });
  };

  next();
};
