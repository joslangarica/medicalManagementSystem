const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token;

    

    // Verify token
    try {
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded;
        req.isAuthenticated = true; // Set a variable to indicate authentication
      } else {
        req.isAuthenticated = false; // Set to false if not authenticated
        
      }
    } catch (ex) {
      req.isAuthenticated = false; // Set to false if not authenticated
      
    }

    next(); // Continue even if not authenticated
};
