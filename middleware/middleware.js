const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

module.exports = function (app) {
  // Enable JSON body parsing
  app.use(express.json());

  // Enable URL-encoded body parsing
  app.use(express.urlencoded({ extended: false }));

  // Enable CORS
  app.use(cors());

  // Apply rate limiting
  app.use(limiter);
};
