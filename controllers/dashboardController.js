const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const patientServices = require('../services/patientServices');
const dashboardServices = require('../services/dashboardServices');
const TimeZoneService = require('../services/timeZoneService');

const moment = require('moment');

const dataTransformations = require('../utils/dataTransformations');


exports.showDashboard = async (req, res, next) => {
  try {
      const user = await dashboardServices.getUserWithDoctorProfile(req.user._id);
      if (!user) return res.status(404).send('User not found.');

      const doctor = user.doctorProfile;
      const userDoctorId = req.user._id;

      const adjustAppointmentsTimeZone = async (appointments) => {
        if (!appointments) return [];  // Return an empty array if appointments is null or undefined
    
        const adjustedAppointments = Array.isArray(appointments) ? appointments : [appointments];
        for (let appointment of adjustedAppointments) {
            if (appointment && appointment.date) {  // Check if appointment and date exist
                appointment.date = await TimeZoneService.convertToLocalTimezone(userDoctorId, appointment.date);
            }
        }
        return adjustedAppointments;
    };
    

      const totalPatients = await dashboardServices.getTotalPatientsForDoctor(userDoctorId);
      const totalAppointments = await dashboardServices.getTotalAppointmentsForDoctor(doctor._id);
      const todayAppointments = await adjustAppointmentsTimeZone(await dashboardServices.getTodayAppointmentsForDoctor(doctor._id));
      const weekAppointments = await adjustAppointmentsTimeZone(await dashboardServices.getWeekAppointmentsForDoctor(doctor._id));
      const monthAppointments = await adjustAppointmentsTimeZone(await dashboardServices.getMonthAppointmentsForDoctor(doctor._id));
      const nextAppointment = (await adjustAppointmentsTimeZone(await dashboardServices.getNextAppointmentForDoctor(doctor._id)))[0]; 
      const nextAppointments = await adjustAppointmentsTimeZone(await dashboardServices.getNextAppointmentsForDoctor(doctor._id, 5)); // Get next 5 appointments
      const patientFrequency = await dashboardServices.getPatientFrequency(doctor._id);
      const hasAppointmentsFlag = dataTransformations.hasAppointments(todayAppointments);

      res.render('dashboard', {
          title: 'Doctor Profile',
          doctor, user,
          totalPatients,
          totalAppointments,
          todayAppointments,
          weekAppointments,
          monthAppointments,
          nextAppointment,
          nextAppointments,
          patientFrequency,
          moment,
          hasAppointments: hasAppointmentsFlag
      });

  } catch (err) {
      next(err);
  }
};
  
  
exports.showPatientsTable = async (req, res, next) => {
    try {
        const patients = await patientServices.getPatientsWithNextAppointment(req.user._id);
        const user = await patientServices.getUserWithDoctorProfile(req.user._id);
        const doctor = user.doctorProfile;

        res.render('patientViews/patients', {title: 'Patients', user, doctor, patients});
    } catch (err) {
        next(err);
    }
}

