module.exports = (err, req, res, next) => {
  console.error('❌ Error:', err.message || err);

  let status = err.statusCode || 500;
  let message = err.message || 'Server Error';

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose Duplicate Key Error (e.g. unique email)
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with this ${field} already exists.`;
  }

  res.status(status).json({
    success: false,
    message,
  });
};
