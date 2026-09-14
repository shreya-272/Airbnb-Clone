/**
 * Custom application error class with HTTP status codes
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async handler wrapper to automatically catch unhandled promises
 * and pass them to the global error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Express Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field "${err.path}": "${err.value}"`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `Validation failed: ${errors.join('. ')}`;
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate record found for unique field(s): ${fields}`;
  }

  // Handle JSON SyntaxError (malformed JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload in request body';
  }

  // Log server-level 500 errors
  if (statusCode >= 500) {
    console.error(`[Server Error ${statusCode}]`, err);
  } else {
    console.warn(`[Client Error ${statusCode}] ${req.method} ${req.originalUrl}: ${message}`);
  }

  // Consistent JSON error response structure
  return res.status(statusCode).json({
    success: false,
    status: statusCode >= 500 ? 'error' : 'fail',
    statusCode,
    message,
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 ? { stack: err.stack } : {}),
  });
};

export default {
  AppError,
  asyncHandler,
  errorHandler,
};
