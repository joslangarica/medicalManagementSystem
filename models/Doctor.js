const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
    start: { type: String },
    end: { type: String },
});

const qualificationSchema = new mongoose.Schema({
    title: { type: String },
    institution: { type: String },
    yearOfCompletion: { type: Date },
});

const certificationSchema = new mongoose.Schema({
    name: { type: String },
    issuingAuthority: { type: String },
    yearOfIssue: { type: Date },
});

const schoolSchema = new mongoose.Schema({
    name: { type: String },
    degree: { type: String },
    yearOfGraduation: { type: Date },
});

const doctorSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    speciality: { type: String, required: false },
    officeNumber: { type: String, required: false },
    cellphone: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    professionalLicense: { type: String, required: false },
    qualifications: [qualificationSchema],
    certifications: [certificationSchema],
    schools: [schoolSchema],
    profilePicture: { type: String },
    workingHours: [workingHoursSchema],
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    timezone: { type: String, default: 'UTC' },  // 'UTC' by default
    lastIP: { type: String }  // To store the user's IP address
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
