const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

const TimeZoneService = require('../services/timeZoneService');
const { handleFileUpload, convertToUTC, convertToUserLocalTime, prepareAppointmentData, prepareEditedAppointmentData, createOrUpdateAppointmentData } = require('../utils/appointmentUtils');

exports.viewCalendar = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('doctorProfile');
        const doctorId = user.doctorProfile._id; // Get the doctor ID from the populated field

      // Fetch appointments for the doctor from the database
      const appointments = await Appointment.find({ doctorId }).populate('patientId');
      const totalAppointments = await Appointment.countDocuments({ doctorId: doctorId });
     
      // Format the appointments for the view
      const appointmentsForView = appointments.map(appointment => ({
        patientName: appointment.patientId.firstName, //
        date: appointment.date
      }));
     
      // Render the view with the appointments data
      res.render('calendar', { appointments: appointmentsForView });
    } catch (error) {
      next(error);
    }
};


exports.renderScheduleAppointment = async (req, res, next) => {
    try {
        const doctorId = req.user._id;
        const selectedPatientId = req.params.patientId;  // Extract the patientId from URL params

        const patients = await Patient.find({ doctorId: doctorId });

        let selectedPatient = null;

        if (selectedPatientId) {
            selectedPatient = await Patient.findById(selectedPatientId);
        }

        const availableTimeSlots = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00','14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

        res.render('appointmentViews/appointmentSchedule', {
            patients,
            availableTimeSlots,
            selectedPatient  // Pass the selected patient to the view
        });

    } catch(err) {
        next(err);
    }
};


// Method to render the edit form
exports.renderEditAppointmentForm = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        console.log("appointment", appointment);
        if (!appointment) {
            return res.status(404).send("Appointment not found.");
        }
        res.render('appointmentViews/editAppointment', { appointment });
    } catch(err) {
        next(err);
    }

    

};





// Method to view appointment details
exports.viewAppointmentDetails = async (req, res, next) => {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId).populate('patientId').populate('doctorId');
        console.log('patientId', appointment.patientId);
        if (!appointment) {
            return res.status(404).send("Appointment not found.");
        }

        // Use utility function to convert to local time
        const localDateTime = await convertToUserLocalTime(req.user._id, appointment.date);
        
        // Attach this converted date and time to the appointment object
        appointment.date = localDateTime;

        res.render('appointmentViews/appointmentDetails', { appointment });
    } catch(err) {
        next(err);
    }
};


// Method to handle deleting the appointment
exports.deleteAppointment = async (req, res, next) => {
    try {
        // Fetch the appointment by ID to check if it exists
        const existingAppointment = await Appointment.findById(req.params.appointmentId);
        
        if (!existingAppointment) {
            return res.status(404).send("Appointment not found.");
        }

        // Remove the appointment ID from the doctor's list of appointments 
        await Doctor.findByIdAndUpdate(existingAppointment.doctorId, { $pull: { appointments: existingAppointment._id } }, { new: true });

        // Remove the appointment ID from the patient's list of appointments and also possibly remove the related documents
        const patientUpdates = { $pull: { appointments: existingAppointment._id } };
        if (existingAppointment.documents && existingAppointment.documents.length > 0) {
            patientUpdates.$pull.documents = { $in: existingAppointment.documents.map(doc => ({ type: doc.type, uri: doc.uri, description: doc.description })) };
        }

        await Patient.findByIdAndUpdate(existingAppointment.patientId, patientUpdates, { new: true });

        // Delete the actual appointment
        await Appointment.findByIdAndRemove(req.params.appointmentId);

        // Send a success response AND redirect to the patient section
        //return res.status(200).redirect('/patients');  
        return res.status(200).redirect(`/patients/${existingAppointment.patientId}`);


        

    } catch (err) {
        next(err); // Pass any errors to the error handler middleware
    }
};


exports.createOrUpdateAppointment = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate('doctorProfile');
  
      if (!user.doctorProfile) {
        return res.status(400).send("User doesn't have a doctor profile.");
      }
  
      const appointmentId = req.params.appointmentId;
      let existingAppointment = null;
  
      if (appointmentId) {
        existingAppointment = await Appointment.findById(appointmentId);
        if (!existingAppointment) {
          return res.status(404).send("Appointment not found.");
        }
      }
  
      const appointmentData = await createOrUpdateAppointmentData(req, existingAppointment);
  
      let appointment;
  
      if (existingAppointment) {
        // Fetch existing appointment
        appointment = await Appointment.findById(appointmentId);
  
        // Update existing appointment properties with new data
        Object.assign(appointment, appointmentData);
  
        // Save the updated appointment
        await appointment.save();
      } else {
        // Create a new appointment.
        appointment = new Appointment({
          ...appointmentData,
          doctorId: user.doctorProfile._id
        });
        await appointment.save();
  
        // Update the doctor's appointments.
        await Doctor.findByIdAndUpdate(user.doctorProfile._id, { $push: { appointments: appointment._id } }, { new: true });
  
        // Update the patient's appointments (only for new appointments).
        const patientUpdates = { $push: { appointments: appointment._id } };
        if (appointmentData.documents && appointmentData.documents.length > 0) {
          const newDocument = appointmentData.documents[0];
          patientUpdates.$push.documents = { type: newDocument.uri, description: newDocument.description };
        }
  
        await Patient.findByIdAndUpdate(appointmentData.patientId, patientUpdates, { new: true });
      }
  
      return res.status(200).redirect(`/patients/${appointmentData.patientId}`);
  
    } catch (err) {
      console.error("Error in createOrUpdateAppointment:", err);
      return res.status(500).send("An error occurred while handling the appointment.");
    }
  };
  