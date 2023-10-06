const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    street: { type: String },
    city: { type: String },
    neighborhood: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Mexico' }
});

const contactSchema = new mongoose.Schema({
    phone: { type: String },
    email: { type: String }
});

const insuranceSchema = new mongoose.Schema({
    providerName: { type: String },
    policyNumber: { type: String }
});

const gynecologicalHistorySchema = new mongoose.Schema({
    pregnancies: { type: Number },
    births: { type: Number },
    cSections: { type: Number },
    miscarriages: { type: Number },
    lastMenstruationDate: { type: Date },
    contraceptiveHormonalTreatment: { type: String },
    lastMammogramDate: { type: Date },
    lastMammogramFindings: { type: String },
    lastPapSmearDate: { type: Date },
    lastPapSmearFindings: { type: String }
});

const nonPathologicalHistorySchema = new mongoose.Schema({
    surgeries: { type: String },
    traumas: { type: String },
    transfusions: { type: String },
    smoking: { type: String, enum: ['non-smoker', 'former smoker', 'current smoker'] },
    alcoholConsumption: { type: String, enum: ['never', 'occasionally', 'frequently'] },
    immunizations: { type: [String] }
});

const medicalHistorySchema = new mongoose.Schema({
    allergies: { type: [String] },
    medications: { type: [String] },
    chronicDiseases: { type: [String] },
    familyBackground: { type: String },
    gynecologicalHistory: { type: gynecologicalHistorySchema },
    nonPathologicalHistory: { type: nonPathologicalHistorySchema }
});

const patientSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    dateOfBirth: { type: Date, required: false },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    RFC: { type: String },  // Fiscal ID
    CURP: { type: String },  // Unique population ID
    photo: { type: String },  // URI to the photo location
    maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
    occupation: { type: String },
    address: { type: addressSchema },
    contact: { type: contactSchema },
    emergencyContact: {
        type: contactSchema,
        relationship: { type: String }  // Relationship to the patient
      },
    insurance: { type: insuranceSchema },
    medicalHistory: { type: medicalHistorySchema },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    height: { type: Number }, // in cm
    weight: { type: Number }, // in kg
    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }],
    notes: { type: String }, // Additional notes by the doctor
    patientStatus: { type: String, enum: ['Active', 'Inactive'] },
    creationDate: { type: Date, default: Date.now },  // Default to current time
    lastUpdateDate: { type: Date, default: Date.now },
    documents: [{
        type: { type: String },
        uri: { type: String },
        description: { type: String }
    }],
    labResults: [{
        type: String,  
        description: { type: String },  
        date: { type: Date }  
    }],
    lastVisitDate: { type: Date },
    nextAppointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' }
});


const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
