const User = require('../models/User');

module.exports = async (req, res, next) => {
    
    if (req.isAuthenticated) {
        try {
            const user = await User.findById(req.user._id);
            if (user && user.role === "doctor") {
                next(); // If user is authenticated and is a doctor, continue to the next middleware or route
            } else {
                const err = new Error("You are not authorized to access this page."); // Create an error object
                err.status = 403; // Set its status to 403 Forbidden
                next(err); // Propagate the error to the errorHandler
            }
        } catch(err) {
            err.message = "Server error.";
            err.status = 500;
            next(err); // Propagate the error to the errorHandler
        }
    } else {
        const err = new Error("Please log in to access this page."); // Create an error object
        err.status = 401; // Set its status to 401 Unauthorized
        next(err); // Propagate the error to the errorHandler
    }
};
