const mongoSanitize = require('express-mongo-sanitize');

const mongoMiddleware = (req, res, next) => {
  // Apply mongo-sanitize middleware to sanitize input
  mongoSanitize.sanitize(req.body);  // for POST/PUT requests
  mongoSanitize.sanitize(req.query); // for query params
  mongoSanitize.sanitize(req.params); // for route params

  next(); 
};

module.exports = mongoMiddleware;
