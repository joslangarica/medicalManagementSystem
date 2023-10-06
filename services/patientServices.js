const User = require('../models/User');
const Patient = require('../models/Patient'); // Assuming you forgot to require this.
const Appointment = require('../models/Appointment');

exports.getPatientsForDoctor = async (doctorId) => {
    try {
        const patients = await Patient.find({doctorId: doctorId});
        return patients;
    } catch (err) {
        throw err; // You can handle the error more gracefully depending on your needs.
    }
}

exports.getUserWithDoctorProfile = async (userId) => {
    try {
        const user = await User.findById(userId).populate('doctorProfile');
        return user;
    } catch (err) {
        throw err;
    }
}

exports.getPatientsWithNextAppointment = async (doctorId) => {
    const patients = await Patient.find({doctorId: doctorId});
    for (let patient of patients) {
        const nextAppointment = await Appointment.findOne({patientId: patient._id, date: {$gte: new Date()}})
                                            .sort({date: 1}); // ascending order to get the nearest date
        patient.nextAppointmentDate = nextAppointment ? nextAppointment.date : null;
    }
    return patients;
};

exports.getPatientNotes = async (patientId) => {
    const patient = await Patient.findById(patientId).populate('appointments').exec();
    const appointments = await Appointment.find({ patientId }).exec();

    const allNotes = [];
    allNotes.push(patient.notes);
    appointments.forEach(appointment => {
        if(appointment.notes) {
            allNotes.push(appointment.notes);
        }
    });

    return allNotes;
};



exports.getPatientPrescriptions = async (patientId) => {
    const patient = await Patient.findById(patientId)
        .populate({
            path: 'appointments',
            populate: {
                path: 'prescription'
            }
        }).exec();

    const allPrescriptions = [];

    patient.appointments.forEach(appointment => {
        if (appointment.prescription && appointment.prescription.length > 0) {
            appointment.prescription.forEach(prescription => {
                prescription.appointmentId = appointment._id; // Add appointment ID to each prescription
                allPrescriptions.push(prescription);
            });
        }
    });

    return allPrescriptions;
};




