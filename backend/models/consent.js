const mongoose = require('mongoose');
const config = require('../config/database');
const request = require('request');


const ConsentSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    consent: {
        type: Boolean,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Consent = module.exports = mongoose.model('Consent', ConsentSchema);

module.exports.getAll = function(callback) {
    Consent.find({}, callback);
};

module.exports.addConsent = function(consent, callback) {
    consent.save(callback);
};
