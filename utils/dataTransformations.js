const transformPatientData = (patient) => {
    if (!patient) return null;

    // Convert Mongoose document to plain object
    const plainPatient = patient.toObject();

    // Fields with default values
    const transformedContact = {
        phone: 'N/A',
        email: 'N/A',
        ...plainPatient.contact
    };

    const transformedEmergencyContact = {
        phone: 'N/A',
        relationship: 'N/A',
        email: 'null@null.com',
        ...plainPatient.emergencyContact
    };

    const transformedAddress = {
        street: 'N/A',
        city: 'N/A',
        neighborhood: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'Mexico',  // Default from the schema
        ...plainPatient.address
    };

    const transformedInsurance = {
        providerName: 'N/A',
        policyNumber: 'N/A',
        ...plainPatient.insurance
    };

    const transformedMedicalHistory = {
        allergies: [],
        medications: [],
        chronicDiseases: [],
        familyBackground: 'N/A',
        ...plainPatient.medicalHistory
    };

    const transformedGynecologicalHistory = {
        pregnancies: 0,
        births: 0,
        cSections: 0,
        miscarriages: 0,
        lastMenstruationDate: 'N/A',
        contraceptiveHormonalTreatment: 'N/A',
        lastMammogramDate: 'N/A',
        lastMammogramFindings: 'N/A',
        lastPapSmearDate: 'N/A',
        lastPapSmearFindings: 'N/A',
        ...transformedMedicalHistory.gynecologicalHistory
    };

    const transformedNonPathologicalHistory = {
        surgeries: 'N/A',
        traumas: 'N/A',
        transfusions: 'N/A',
        smoking: 'non-smoker',
        alcoholConsumption: 'never',
        immunizations: [],
        ...plainPatient.medicalHistory.nonPathologicalHistory
    };

    const transformedPatient = {
        doctorId: plainPatient.doctorId || null,
        firstName: plainPatient.firstName || 'N/A',
        lastName: plainPatient.lastName || 'N/A',
        dateOfBirth: plainPatient.dateOfBirth || 'N/A',
        gender: plainPatient.gender || 'N/A',
        RFC: plainPatient.RFC || 'N/A',
        CURP: plainPatient.CURP || 'N/A',
        photo: plainPatient.photo || 'N/A',
        maritalStatus: plainPatient.maritalStatus || 'single',
        occupation: plainPatient.occupation || 'N/A',
        height: plainPatient.height || null,
        weight: plainPatient.weight || null,
        appointments: plainPatient.appointments || [],
        notes: plainPatient.notes || 'N/A',
        patientStatus: plainPatient.patientStatus || 'Active',
        creationDate: plainPatient.creationDate || new Date(),
        lastUpdateDate: plainPatient.lastUpdateDate || new Date(),
        documents: plainPatient.documents || [],
        labResults: plainPatient.labResults || [],
        ...plainPatient,
        contact: transformedContact,
        emergencyContact: transformedEmergencyContact,
        address: transformedAddress,
        insurance: transformedInsurance,
        medicalHistory: {
            ...transformedMedicalHistory,
            gynecologicalHistory: transformedGynecologicalHistory,
            nonPathologicalHistory: transformedNonPathologicalHistory
        },
        age: calculateAge(plainPatient.dateOfBirth),
        genderText: getGenderText(plainPatient.gender),
        bloodTypeText: getBloodTypeText(plainPatient.bloodType)
    };

    return transformedPatient;
};




const calculateAge = (dob) => {
    if (!dob) {
        return 'N/A';
    }
    const today = new Date();
    const birthDate = new Date(dob);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
};

const getGenderText = (gender) => {
    switch (gender) {
        case 'male':
            return 'Male';
        case 'female':
            return 'Female';
        case 'other':
            return 'Other';
        default:
            return 'N/A';
    }
};

const getBloodTypeText = (bloodType) => {
    switch (bloodType) {
        case 'A+':
            return 'Blood Type A+';
        case 'A-':
            return 'Blood Type A-';
        case 'B+':
            return 'Blood Type B+';
        case 'B-':
            return 'Blood Type B-';
        case 'AB+':
            return 'Blood Type AB+';
        case 'AB-':
            return 'Blood Type AB-';
        case 'O+':
            return 'Blood Type O+';
        case 'O-':
            return 'Blood Type O-';
        default:
            return 'Unknown Blood Type';
    }
};


const hasAppointments = (appointments) => {
    return appointments && Array.isArray(appointments) && appointments.length > 0;
};



module.exports = { 
    transformPatientData,
    hasAppointments,
 };

