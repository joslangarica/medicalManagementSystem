const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const dbConnect = require('./config/dbConnect');
const middlewareConfig = require('./middleware/middleware');
const routes = require('./routes/routesIndex');
const errorHandler = require('./middleware/errorHandler');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middleware/authMiddleware');
const methodOverride = require('method-override');

// Load Environment Variables
dotenv.config();

// Validate Environment Variables
const envVars = ['PORT', 'MONGODB_URI'];
envVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Environment variable ${varName} is missing`);
  }
});

// Initialize Express App
const app = express();

// Connect to Database
dbConnect();

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Setup View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middleware Configurations
middlewareConfig(app);

app.use(express.urlencoded({ extended: true }));  // Parse the request body first.

app.use(methodOverride('_method'));  // Then Method Override Middleware.

app.use(cookieParser());

// Auth Middleware
app.use(authMiddleware);

// Middleware to make isAuthenticated available to views
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated;
  next();
});

// Use Routes
app.use(routes);

// Centralized Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 4800;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// Export App 
module.exports = app;
