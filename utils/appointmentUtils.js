// utils/appointmentUtils.js
const Appointment = require('../models/Appointment');

/**
 * Handles the file upload logic for the appointment.
 * @param {object} req - Express request object
 * @returns {object|null} - Document object or null
 */
const handleFileUpload = (req) => {
    if (!req.file) return null;

    const filePath = '/uploads/' + req.file.filename;
    return {
        type: req.file.mimetype,
        uri: filePath,
        description: req.body.documentDescription
    };
}

/**
 * Converts the provided date and time to UTC.
 * @param {string} userId - User ID
 * @param {string} date - Date in local time
 * @param {string} time - Time in local time
 * @returns {Date} - Date in UTC
 */
const convertToUTC = async (userId, date, time) => {
    const TimeZoneService = require('../services/timeZoneService');
    return await TimeZoneService.convertToUTC(userId, date, time);
}

const convertToUserLocalTime = async (userId, date) => {
    const TimeZoneService = require('../services/timeZoneService');
    return await TimeZoneService.convertToLocalTimezone(userId, date);
}




/**
 * Prepares the appointment data.
 * @param {object} req - Express request object
 * @param {object|null} existingAppointment - Existing appointment object or null
 * @returns {object} - Prepared appointment data
 */
const prepareAppointmentData = async (req, existingAppointment) => {
    try {
        const { 
            patientId, date, time, location, status, notes, 
            reasonForVisit, diagnosis, medicineName, dosage, 
            frequency, duration, followUpDate 
        } = req.body;

        // Essential checks upfront
        if (!patientId) {
            throw new Error('Patient ID is missing.');
        }

        const utcDate = await convertToUTC(req.user._id, date, time);
        if (!utcDate) {
            throw new Error('UTC Date conversion failed.');
        }

        const documentData = handleFileUpload(req);

        // Check if prescriptions are provided in the form
        let prescriptions = [];
        if (Array.isArray(medicineName) && medicineName.length) {
            prescriptions = medicineName.map((name, index) => ({
                medicineName: name,
                dosage: dosage ? dosage[index] : "Not specified",
                frequency: frequency ? frequency[index] : "Not specified",
                duration: duration ? duration[index] : "Not specified"
            })).filter(prescription => prescription.medicineName);
        } else if (req.body.medicineName) {
            prescriptions = [
                ...prescriptions,
                {
                    medicineName: req.body.medicineName,
                    dosage: req.body.dosage || "Not specified",
                    frequency: req.body.frequency || "Not specified",
                    duration: req.body.duration || "Not specified"
                }
            ];
        }

        const data = {
            patientId,
            date: utcDate,
            location: location || "Not specified",
            status: existingAppointment ? status : 'Scheduled',
            notes: notes || "Not specified",
            reasonForVisit: reasonForVisit || "Not specified",
            diagnosis: diagnosis || "Not specified",
            prescription: prescriptions,
            followUpDate: followUpDate ? new Date(followUpDate) : (existingAppointment ? existingAppointment.followUpDate : null)
        };

        // Handle document uploads
        if (documentData) {
            data.documents = existingAppointment && existingAppointment.documents
                ? [...existingAppointment.documents, documentData]
                : [documentData];
        }

        return data;
    } catch (err) {
        console.error('Error preparing appointment data:', err);
        throw err;
    }
};

const prepareNewPrescriptions = (req) => {
    const { medicineName, dosage, frequency, duration } = req.body;
    
    if (!medicineName) return [];

    // Check if multiple prescriptions are provided
    if (Array.isArray(medicineName) && medicineName.length) {
        return medicineName.map((name, index) => ({
            medicineName: name,
            dosage: dosage ? dosage[index] : "Not specified",
            frequency: frequency ? frequency[index] : "Not specified",
            duration: duration ? duration[index] : "Not specified"
        }));
    }

    // Handle single prescription
    return [{
        medicineName: req.body.medicineName,
        dosage: req.body.dosage || "Not specified",
        frequency: req.body.frequency || "Not specified",
        duration: req.body.duration || "Not specified"
    }];
};


const prepareEditedAppointmentData = async (req, existingAppointment) => {
    try {
        const data = await prepareAppointmentData(req, existingAppointment);

        // Prepare new prescriptions
        let newPrescriptions = prepareNewPrescriptions(req);

        // Combine existing prescriptions with new ones
        if (newPrescriptions.length > 0) {
            data.prescription = existingAppointment.prescription
                ? existingAppointment.prescription.concat(newPrescriptions)
                : newPrescriptions;
        }

        return data;
    } catch (err) {
        console.error('Error preparing edited appointment data:', err);
        throw err;
    }
};

const createOrUpdateAppointmentData = async (req, existingAppointment = null) => {
    try {
      const {
        patientId, date, time, location, status, notes,
        reasonForVisit, diagnosis, followUpDate,
        medicineName, dosage, frequency, duration
      } = req.body;
  
      if (!patientId) {
        throw new Error('Patient ID is missing.');
      }
  
      const utcDate = await convertToUTC(req.user._id, date, time);
      if (!utcDate) {
        throw new Error('UTC Date conversion failed.');
      }
  
      const documentData = handleFileUpload(req); 
  
      // Prescription handling - merge with existing prescriptions if present
      let prescriptions = [];
      if (medicineName && dosage && frequency && duration) {
        prescriptions = medicineName.map((name, index) => ({
          medicineName: name,
          dosage: dosage[index] || "Not specified",
          frequency: frequency[index] || "Not specified",
          duration: duration[index] || "Not specified"
        }));
      }
      
  
      const data = {
        patientId,
        date: utcDate,
        location: location || "Not specified",
        status: status || (existingAppointment ? existingAppointment.status : 'Scheduled'),
        notes: notes || "Not specified",
        reasonForVisit: reasonForVisit || "Not specified",
        diagnosis: diagnosis || "Not specified",
        prescription: prescriptions,
        followUpDate: followUpDate ? new Date(followUpDate) : (existingAppointment ? existingAppointment.followUpDate : null)
      };
  
      // Handling documents
      if (documentData) {
        data.documents = existingAppointment && existingAppointment.documents
          ? [...existingAppointment.documents, documentData]
          : [documentData];
      }
  
      return data;
    } catch (err) {
      console.error('Error preparing appointment data:', err);
      throw err;
    }
  };
  
  









module.exports = {
    handleFileUpload,
    convertToUTC,
    convertToUserLocalTime,
    prepareAppointmentData,
    prepareEditedAppointmentData,
    createOrUpdateAppointmentData
    
};
