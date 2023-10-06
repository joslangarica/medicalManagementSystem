const createError = require('http-errors');

module.exports = function(err, req, res, next) {
  console.error(err.message); // Log the error message
  console.error(err.stack);   // Log the full stack trace

  let errorDetails = {
      message: "An unexpected error occurred.",
      status: 500,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  // Handle 'Invalid email or password' error
  if (err.message.includes('Invalid email or password.')) {
      errorDetails.message = err.message;
      errorDetails.status = 400;
  }

  // Handle 'Email already exists' error
  if (err.message.includes('Email already exists.')) {
      errorDetails.message = err.message;
      errorDetails.status = 400;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      errorDetails.message = messages.join(', ');
      errorDetails.status = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
      errorDetails.message = 'Invalid token.';
      errorDetails.status = 401;
  }

   // Handle unauthorized errors
   if (err.status === 401) {
    errorDetails.message = err.message;
    errorDetails.status = 401;
}

// Handle forbidden errors
if (err.status === 403) {
    errorDetails.message = err.message;
    errorDetails.status = 403;
}

  // Render the error page with error details
  res.status(errorDetails.status).render('error', { error: errorDetails });

};





