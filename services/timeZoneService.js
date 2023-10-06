const User = require('../models/User'); // adjust the path based on your project structure
const Doctor = require('../models/Doctor');
const moment = require('moment-timezone');

const TimeZoneService = {

    /**
     * Convert a given date and time from a user's local timezone to UTC.
     *
     * @param {String} userId The user's ID.
     * @param {String} date The date in "YYYY-MM-DD" format.
     * @param {String} time The time in "HH:mm" format.
     * @returns {Date} The corresponding UTC time.
     */
    async convertToUTC(userId, date, time) {
        const user = await User.findById(userId).populate('doctorProfile');
        if (!user || !user.doctorProfile) {
            throw new Error("User or Doctor profile not found.");
        }

        const timezone = user.doctorProfile.timezone;
        return moment.tz(`${date} ${time}`, "YYYY-MM-DD HH:mm", timezone).utc().toDate();
    },

    /**
     * Convert a given UTC datetime to a user's local timezone.
     *
     * @param {String} userId The user's ID.
     * @param {Date} datetimeUTC The UTC datetime.
     * @returns {String} The corresponding local time in "YYYY-MM-DD HH:mm" format.
     */
    async convertToLocalTimezone(userId, datetimeUTC) {
        const user = await User.findById(userId).populate('doctorProfile');
        if (!user || !user.doctorProfile) {
            throw new Error("User or Doctor profile not found.");
        }

        const timezone = user.doctorProfile.timezone;
        return moment.utc(datetimeUTC).tz(timezone).format("YYYY-MM-DD HH:mm");
    }
};

module.exports = TimeZoneService;
