const mongoose = require('mongoose');
const config = require('../config/database');
const request = require('request');
const User = require('./user');


const LogSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now
    },
    action: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    details: {
        type: { foo: String },
    },
});

const Log = module.exports = mongoose.model('Log', LogSchema);

module.exports.getAll = function(callback) {
    Log.find({}, callback);
};
module.exports.removeTestLogs = function(callback) {
    Log.deleteMany({userid: 'Test'}, callback);
};

module.exports.addLog = function(data, callback) {
    if (data.userid == 'Test') {
        let newLog = new Log({
            userid: data.userid,
            action: data.action,
            details: data.details,
            version: 'Test',
        });
        newLog.save(callback);
    } else {
        User.getFlagAndGroup(data.userid, (d) => {
            let version = '';
                if ((d.groupname.charAt(0) == 'A' && d.flag == false)
                    || (d.groupname.charAt(0) == 'B' && d.flag == true)) {
                    version = 'v1';
                } else {
                    version = 'v2';
                }
            let newLog = new Log({
                userid: data.userid,
                action: data.action,
                details: data.details,
                version: version,
            });
            newLog.save(callback);
        });
    }
};
