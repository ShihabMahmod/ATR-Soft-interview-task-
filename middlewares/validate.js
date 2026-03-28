const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      throw ApiError.badRequest('Validation failed', errors);
    }

    // Update request with validated data
    if (result.data.body) req.body = result.data.body;
    if (result.data.query) req.query = result.data.query;
    if (result.data.params) req.params = result.data.params;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;