const User = require('../models/User');
const Doctor = require('../models/Doctor');


// render the create doctor profile form
exports.showInitialProfileCreation = async (req, res) => {
  res.render('doctorViews/doctorProfileCreate', { title: 'Create Doctor Profile' }); // Render the form
};


// handle form submission doctorsProfile
exports.createProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return next(new Error('User not found.'));

    const doctor = await Doctor.findById(user.doctorProfile);
    if (!doctor) return next(new Error('Doctor profile not found.'));

    // Update doctor's fields based on form input

    doctor.speciality = req.body.speciality;
    doctor.officeNumber = req.body.officeNumber;
    doctor.cellphone = req.body.cellphone;
    doctor.dateOfBirth = req.body.dateOfBirth;

    // Capture and store timezone and IP address
    doctor.timezone = req.body.timezone;  // Assuming the form field name for timezone 
    // Get the IP address
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    doctor.lastIP = ip;

    await doctor.save();

    res.redirect('/doctors/doctorProfile');  // Redirecting to the dashboard after saving.
  } catch (error) {
    next(error);
  }
};



exports.showProfileForm = async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(req.user._id).populate('doctorProfile');
  if (!user) {
    return res.status(404).send('User not found.');
  }

  const doctor = user.doctorProfile;
  if (!doctor) {
    return res.redirect(''); 
  }

  res.render('doctorViews/doctorProfile', { title: 'Doctor Profile', doctor, user });
};


// render the edit form with current details
exports.showProfileEditForm = async (req, res) => {
  const user = await User.findById(req.user._id).populate('doctorProfile');
  const doctor = user.doctorProfile;
  if (!doctor) return res.status(404).send('Doctor profile not found.');
  res.render('doctorViews/doctorProfileEdit', { title: 'Edit Profile', doctor, user });
};



//  handle form submission and update the doctor's profile
exports.updateProfile = async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('doctorProfile');
  const doctor = user.doctorProfile;

  if (!doctor) return next(new Error('Doctor profile not found.'));

  // Validate and update dateOfBirth
  if (!req.body.dateOfBirth) return next(new Error('Date of birth is required.'));

  // Convert date to the required format
  const dob = new Date(req.body.dateOfBirth);
  doctor.dateOfBirth = `${dob.getFullYear()}-${String(dob.getMonth() + 1).padStart(2, '0')}-${String(dob.getDate()).padStart(2, '0')}`;

  // Validate and update workingHours
  if (req.body.workingHours) {
    // Make sure all days are valid
    if (!req.body.workingHours.every(hour => ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(hour.day))) {
      return next(new Error('Invalid working hours provided.'));
    }
    doctor.workingHours = req.body.workingHours;
  }
  
    // Map nested fields
    doctor.qualifications = req.body.qualifications ? req.body.qualifications.map(q => ({
      title: q.title,
      institution: q.institution,
      yearOfCompletion: q.yearOfCompletion
    })) : [];
  
    doctor.certifications = req.body.certifications ? req.body.certifications.map(c => ({
      name: c.name,
      issuingAuthority: c.issuingAuthority,
      yearOfIssue: c.yearOfIssue
    })) : [];
  
    doctor.schools = req.body.schools ? req.body.schools.map(s => ({
      name: s.name,
      degree: s.degree,
      yearOfGraduation: s.yearOfGraduation
    })) : [];


  // Update fields based on form input
  doctor.speciality = req.body.speciality;
  doctor.officeNumber = req.body.officeNumber;
  doctor.cellphone = req.body.cellphone;

  doctor.professionalLicense = req.body.professionalLicense;
  
  // Validate and update timezone
  const validTimezones = [
    "America/Tijuana",
    "America/Hermosillo",
    "America/Chihuahua",
    "America/Mexico_City",
    "America/Cancun",
    "America/Mazatlan",
    "America/Ojinaga"
  ];

  if (req.body.timezone && validTimezones.includes(req.body.timezone)) {
    doctor.timezone = req.body.timezone;
  } else {
    return next(new Error('Invalid timezone provided.'));
  }


// Update the profile picture if a new file was uploaded
  if (req.file) {
    doctor.profilePicture = '/uploads/' + req.file.filename; 
  }

  await doctor.save();
  res.redirect('./doctorProfile'); 


};



