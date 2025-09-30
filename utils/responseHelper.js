/**
 * Standardized Response Helper
 * Ensures consistent API response structure across all endpoints
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  // Add data if provided
  if (data !== null) {
    if (Array.isArray(data)) {
      response.data = data;
      response.count = data.length;
    } else if (typeof data === 'object' && data !== null) {
      response.data = data;
    } else {
      response.data = data;
    }
  }

  res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} type - Error type
 * @param {*} details - Additional error details (development only)
 */
const sendError = (res, message, statusCode = 400, type = 'CLIENT_ERROR', details = null) => {
  const response = {
    success: false,
    message,
    type,
    timestamp: new Date().toISOString()
  };

  // Add details in development mode only
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
  }

  res.status(statusCode).json(response);
};

/**
 * Send a validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {Array} errors - Validation errors array
 */
const sendValidationError = (res, message, errors = []) => {
  const response = {
    success: false,
    message,
    type: 'VALIDATION_ERROR',
    errors,
    timestamp: new Date().toISOString()
  };

  res.status(400).json(response);
};

/**
 * Send an unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Unauthorized')
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  const response = {
    success: false,
    message,
    type: 'UNAUTHORIZED',
    timestamp: new Date().toISOString()
  };

  res.status(401).json(response);
};

/**
 * Send a forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Forbidden')
 */
const sendForbidden = (res, message = 'Forbidden') => {
  const response = {
    success: false,
    message,
    type: 'FORBIDDEN',
    timestamp: new Date().toISOString()
  };

  res.status(403).json(response);
};

/**
 * Send a not found response
 * @param {Object} res - Express response object
 * @param {string} message - Error message (default: 'Resource not found')
 */
const sendNotFound = (res, message = 'Resource not found') => {
  const response = {
    success: false,
    message,
    type: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  };

  res.status(404).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound
};
