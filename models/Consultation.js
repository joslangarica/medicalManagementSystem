const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    date: { type: Date, default: Date.now, required: true },
    diagnosis: { type: String, required: false },
    prescribedMedication: [{
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String }
    }],
    treatmentRecommendation: { type: String },
    notes: { type: String },
    followUpRequired: { type: Boolean, default: false },
    nextAppointmentDate: { type: Date },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
});

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;
