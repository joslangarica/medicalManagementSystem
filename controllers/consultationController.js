const Consultation = require('../models/Consultation');

exports.viewConsultationMoment = async (req, res, next) => {
    try {
        const consultation = await Consultation.findById(req.params.consultationId).populate('patientId').populate('doctorId');
        
        if (!consultation) {
            return res.status(404).send("Consultation not found.");
        }

        res.render('consultationViews/consultationMoment', { consultation });
    } catch (error) {
        next(error);
    }
};

exports.renderAddConsultationForm = (req, res, next) => {
    try {
        res.render('consultationViews/addConsultation');
    } catch (error) {
        next(error);
    }
};

exports.addConsultation = async (req, res, next) => {
    try {
        const { patientId, doctorId, date, notes } = req.body;

        const newConsultation = new Consultation({
            patientId,
            doctorId,
            date,
            notes
        });

        await newConsultation.save();

        res.redirect('/consultations/moment/' + newConsultation._id);
    } catch (error) {
        next(error);
    }
};