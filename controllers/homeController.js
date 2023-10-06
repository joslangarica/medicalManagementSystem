exports.showHomePage = (req, res, next) => {
  try {
    res.render('home', { title: 'Home' }); 
  } catch (err) {
    next(err); // Pass the error to errorHandler
  }
};
