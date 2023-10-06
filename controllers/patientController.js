const Patient = require('../models/Patient');
const TimeZoneService = require('../services/timeZoneService');
const { transformPatientData } = require('../utils/dataTransformations'); 
const patientServices = require('../services/patientServices');




exports.showAddPatientForm = (req, res) => {
  if (!req.user) {  // Check if doctor (user) is not logged in
    return res.status(403).send('Access Denied. Please log in as a doctor.');
}
res.render('patientViews/addPatient', {title: 'Add Patient'});
};



exports.addPatient = async (req, res, next) => {
  try {
    // Extracting doctor ID from the authenticated user
    const doctorId = req.user._id;

    // Creating the patient object
    const patient = new Patient({
      doctorId: doctorId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      RFC: req.body.RFC,
      CURP: req.body.CURP,
      photo: req.body.photo,
      maritalStatus: req.body.maritalStatus,
      occupation: req.body.occupation,
      address: {
        street: req.body.street,
        city: req.body.city,
        neighborhood: req.body.neighborhood,
        state: req.body.state,
        zipCode: req.body.zipCode,
        country: req.body.country
      },
      contact: {
        phone: req.body.phone,
        email: req.body.email
      },
      emergencyContact: {
        phone: req.body.emergencyPhone,
        email: req.body.emergencyEmail,
        relationship: req.body.relationship
      },
      insurance: {
        providerName: req.body.providerName,
        policyNumber: req.body.policyNumber
      },
      medicalHistory: {
        allergies: req.body.allergies ? req.body.allergies.split(",") : [],
        medications: req.body.medications ? req.body.medications.split(",") : [],
        chronicDiseases: req.body.chronicDiseases ? req.body.chronicDiseases.split(",") : [],
        familyBackground: req.body.familyBackground,
        gynecologicalHistory: {
            pregnancies: req.body.pregnancies,
            births: req.body.births,
            cSections: req.body.cSections,
            miscarriages: req.body.miscarriages,
            lastMenstruationDate: req.body.lastMenstruationDate,
            contraceptiveHormonalTreatment: req.body.contraceptiveHormonalTreatment,
            lastMammogramDate: req.body.lastMammogramDate,
            lastMammogramFindings: req.body.lastMammogramFindings,
            lastPapSmearDate: req.body.lastPapSmearDate,
            lastPapSmearFindings: req.body.lastPapSmearFindings
        },
        nonPathologicalHistory: {
            surgeries: req.body.surgeries,
            traumas: req.body.traumas,
            transfusions: req.body.transfusions,
            smoking: req.body.smoking,
            alcoholConsumption: req.body.alcoholConsumption,
            immunizations: req.body.immunizations ? req.body.immunizations.split(",") : []
        }
      },
      bloodType: req.body.bloodType,
      height: req.body.height,
      weight: req.body.weight,
      appointments: req.body.appointments,  // This assumes appointments are passed as an array of IDs
      notes: req.body.notes,
      patientStatus: req.body.patientStatus,
      creationDate: req.body.creationDate,  // This field will automatically default to the current time if not provided
      lastUpdateDate: req.body.lastUpdateDate,  // Same as above
      documents: req.body.documents,  // Assuming it's passed as an array of URIs
      labResults: req.body.labResults,  // Assuming it's passed as an array of objects with type, description, and date fields
      lastVisitDate: req.body.lastVisitDate,
      nextAppointment: req.body.nextAppointment
    });

    if (req.file) {
      patient.photo = '/uploads/' + req.file.filename; 
    }

    // Saving the patient to the database
    await patient.save();

    res.redirect('/patients'); 
  } catch (err) {
    next(err);
  }
};






exports.showEditPatientForm = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    console.log("patient", patient)
    if (!patient) {
      return res.status(404).send('Patient not found');
    }

    if(String(patient.doctorId) !== String(req.user._id)) {
      return res.status(403).send('Access denied. This patient is not under your care.');
    }

    const transformedPatient = transformPatientData(patient);
    console.log("transformedPatient", transformedPatient)
    res.render('patientViews/editPatientProfile', { title: 'Edit Patient Profile', patient: transformedPatient });
  } catch (err) {
    next(err);
  }
};





exports.showPatientProfile = async (req, res, next) => {
  try {
    const patientId = req.params.patientId;
    const patient = await Patient.findById(patientId).populate('appointments');

    if (!patient) {
      return res.status(404).send('Patient not found.');
    }

    const appointments = patient.appointments;

    if (!appointments || !Array.isArray(appointments)) {
      return res.status(400).send('No appointments found or appointments data is malformed.');
    }

    const doctorId = req.user._id;
    for (const appointment of appointments) {
      const convertedDate = await TimeZoneService.convertToLocalTimezone(doctorId, appointment.date);
      appointment.date = convertedDate;
    }

    // Initialize an empty array to hold all prescriptions.
    const mergedPrescriptions = [];

    // Iterate through all appointments to collect prescriptions.
    for (const appointment of appointments) {
      if (Array.isArray(appointment.prescription)) {
        for (const prescription of appointment.prescription) {
          mergedPrescriptions.push({
            ...prescription._doc,  // Spread operator to copy all properties from prescription
            appointmentDate: appointment.date, // Add appointment date to each prescription
            appointmentId: appointment._id
          });
        }
      }
    }

   

    // Transform patient data and render the view.
    const transformedPatient = transformPatientData(patient);
    res.render('patientViews/patientProfile', { title: 'Patient Profile', patient: transformedPatient, appointments, allPrescriptions: mergedPrescriptions });
    
  } catch (err) {
    next(err);
  }
};





exports.editPatient = async (req, res, next) => {
  try {
      const patientId = req.params.id;  // Assuming you pass the patient's ID in the URL

      // Find patient by ID
      const patient = await Patient.findById(patientId);
      if (!patient) {
          // Handle patient not found error
          return res.status(404).send({ message: "Patient not found." });
      }

      // Ensure that the doctor updating the patient is the one who created it (optional)
      if (String(patient.doctorId) !== String(req.user._id)) {
          return res.status(403).send({ message: "Unauthorized to edit this patient." });
      }

      // Update patient details
      patient.firstName = req.body.firstName;
      patient.lastName = req.body.lastName;
      patient.dateOfBirth = req.body.dateOfBirth;
      patient.gender = req.body.gender;
      patient.maritalStatus = req.body.maritalStatus;
      patient.occupation = req.body.occupation;
      patient.address = {
          street: req.body.street,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zipCode
      };
      patient.contact = {
          phone: req.body.phone,
          email: req.body.email
      };
      patient.emergencyContact = {
          phone: req.body.emergencyPhone,
          email: req.body.emergencyEmail
      };
      patient.insurance = {
          providerName: req.body.providerName,
          policyNumber: req.body.policyNumber
      };
      patient.medicalHistory = {
          allergies: req.body.allergies ? req.body.allergies.split(",") : [],
          medications: req.body.medications ? req.body.medications.split(",") : [],
          chronicDiseases: req.body.chronicDiseases ? req.body.chronicDiseases.split(",") : [],
          familyBackground: req.body.familyBackground,
          gynecologicalHistory: {
              pregnancies: req.body.pregnancies,
              // ... add other gynecologicalHistory fields here
          },
          nonPathologicalHistory: {
              surgeries: req.body.surgeries,
              traumas: req.body.traumas,
              transfusions: req.body.transfusions,
              smoking: req.body.smoking,
              alcoholConsumption: req.body.alcoholConsumption,
              immunizations: req.body.immunizations ? req.body.immunizations.split(",") : []
          }
      };

      // Save updated patient details
      await patient.save();

      // Redirecting to the updated patient's profile or a specific page
      res.redirect(`/patients/${patientId}`);

  } catch (err) {
      next(err);
  }
};
