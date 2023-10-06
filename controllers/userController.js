const User = require('../models/User');
const bcrypt = require('bcrypt'); // for hashing the password
const jwt = require('jsonwebtoken'); // for generating tokens
const Doctor = require('../models/Doctor');



exports.showRegisterForm = (req, res) => {
  res.render('authViews/register', { title: 'Register Account' });
};


exports.register = async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body; 
    const userExists = await User.findOne({ email });
    if (userExists) return next(new Error('Email already exists.'));

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ email, name, password: hashedPassword, role }); 
    await user.save();

    console.log("User:" , user)
    // If the role is a doctor, create a doctor profile
    if (role === 'doctor') {
      const doctor = new Doctor({ userId: user._id });
      await doctor.save();
      console.log('Doctor after saving:', doctor);
      user.doctorProfile = doctor._id;
      await user.save();
  }

    // Generate a token or session for authentication
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
    // Store token in HTTP-only cookie
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/doctors/createProfile');

    
  } catch (err) {
    next(err); 
  }
};
exports.showLoginForm = (req, res) => {
  res.render('authViews/login', { title: 'Login' });
};




exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error('Invalid email or password.'));

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return next(new Error('Invalid email or password.'));

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);
     // Store token in HTTP-only cookie
     res.cookie('token', token, { httpOnly: true });
     res.redirect('/doctors/dashboard');

  } catch (err) {
    next(err);
  }
};


exports.logout = (req, res) => {
  // Clear the token cookie
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.redirect('/?message=Logged out successfully');
};

// update user authentication
exports.updateAuthDetails = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('User not found.');

    user.name = req.body.name;
    user.email = req.body.email;
    
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt); 
    }

    await user.save();
    res.redirect('/doctors/dashboard'); 
  } catch (err) {
    next(err);
  }
};
