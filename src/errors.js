/**
 * Base API Error class for Australia Post SDK
 */
export class ApiError extends Error {
  constructor(message, status = 500, code = null, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details
    };
  }
}

/**
 * Configuration error - invalid or missing options
 */
export class ConfigurationError extends ApiError {
  constructor(message) {
    super(message, 400, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

/**
 * Authentication error (401, 403)
 */
export class AuthenticationError extends ApiError {
  constructor(message, status = 401, details = null) {
    super(message, status, 'AUTHENTICATION_ERROR', details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error (400) - invalid request data
 */
export class ValidationError extends ApiError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(resource, id) {
    super(`${resource} with id '${id}' not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
  constructor(retryAfter = null) {
    super('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Server error (5xx)
 */
export class ServerError extends ApiError {
  constructor(message = 'Internal server error', status = 500) {
    super(message, status, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

/**
 * Transform axios/API error to specific error type
 * @param {Error} error - The original error
 * @returns {ApiError} Specific error type
 */
export function transformError(error) {
  // Handle axios errors
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.errors?.[0]?.message || data?.message || error.message;
    const code = data?.errors?.[0]?.code || null;
    const details = data?.errors || null;

    switch (status) {
      case 400:
        return new ValidationError(message, details);
      case 401:
      case 403:
        return new AuthenticationError(message, status, details);
      case 404:
        return new NotFoundError('Resource', 'unknown');
      case 429: {
        const retryAfter = error.response.headers?.['retry-after'];
        return new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : null);
      }
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, status);
      default:
        return new ApiError(message, status, code, details);
    }
  }

  // Handle network errors
  if (error.request) {
    return new ApiError('Network error: Unable to reach the API', 0, 'NETWORK_ERROR');
  }

  // Handle other errors
  return new ApiError(error.message || 'Unknown error occurred');
}
