const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');

const mongoose = require('mongoose');


exports.getUserWithDoctorProfile = async (userId) => {
    return await User.findById(userId).populate('doctorProfile');
};

exports.getTotalPatientsForDoctor = async (doctorId) => {
    return await Patient.countDocuments({ doctorId });
};

exports.getTotalAppointmentsForDoctor = async (doctorId) => {
    return await Appointment.countDocuments({ doctorId });
};

exports.getTodayAppointmentsForDoctor = async (doctorId) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    return await Appointment.countDocuments({
        doctorId, 
        status: 'Scheduled',
        date: { $gte: startOfDay, $lt: endOfDay }
    });
};

exports.getWeekAppointmentsForDoctor = async (doctorId) => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return await Appointment.countDocuments({
        doctorId,
        status: 'Scheduled',
        date: { $gte: startOfWeek, $lt: endOfWeek }
    });
};

exports.getMonthAppointmentsForDoctor = async (doctorId) => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return await Appointment.countDocuments({
        doctorId,
        status: 'Scheduled',
        date: { $gte: startOfMonth, $lt: endOfMonth }
    });
};

exports.getNextAppointmentForDoctor = async (doctorId) => {
    const now = new Date();
    return await Appointment.findOne({
        doctorId: doctorId,
        date: { $gte: now }   // Ensure the date is in the future
    }).sort({ date: 1 })  // Sort in ascending order by date so the next appointment comes first
    .populate('patientId')  
    .exec();
}

exports.getNextAppointmentsForDoctor = async (doctorId, limit = 5) => {
    const now = new Date();
    return await Appointment.find({
        doctorId: doctorId,
        date: { $gte: now }   // Ensure the date is in the future
    })
    .sort({ date: 1 })  // Sort in ascending order by date so the next appointment comes first
    .limit(limit)  // Limit to 'limit' appointments
    .populate('patientId')  // Assuming you have a patient reference in your Appointment schema
    .exec();
}


exports.getPatientFrequency = async (doctorId) => {
    try {
        // Use the aggregation framework to group and count appointments by patientId
        const patientFrequencies = await Appointment.aggregate([
            { 
                $match: { 
                    doctorId: new mongoose.Types.ObjectId(doctorId), 
                    status: 'Scheduled' // Assuming you only want to count completed appointments
                } 
            },
            { 
                $group: {
                    _id: "$patientId",
                    count: { $sum: 1 }
                } 
            },
            {
                $sort: { count: -1 }  // Sort in descending order to get patients with the highest frequency first
            }
        ]).exec();

        // Optionally, populate the patient details
        for (let freq of patientFrequencies) {
            freq.patient = await Patient.findById(freq._id);
        }

        return patientFrequencies;
    } catch (error) {
        throw error;
    }
};
