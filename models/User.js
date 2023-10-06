 const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: ['doctor', 'patient'], required: true },
    doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
