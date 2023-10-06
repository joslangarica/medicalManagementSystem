const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, required: true },
    location: { type: String, required: false },
    status: { type: String, enum: ['Scheduled', 'Cancelled', 'Completed'], required: true },
    creationDate: { type: Date, default: Date.now },  
    reasonForVisit: { type: String },
    diagnosis: { type: String },
    prescription: [{
        medicineName: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String }
    }],    
    notes: { type: String }, 
    documents: [{
        type: { type: String },
        uri: { type: String },
        description: { type: String }
    }],
    followUpDate: { type: Date }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
