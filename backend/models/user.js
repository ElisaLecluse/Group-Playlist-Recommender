const mongoose = require('mongoose');
const config = require('../config/database');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    groupname: {
        type: String,
        required: true,
    },
    trackattr: {
        type: Array,
        required: true,
    },
    meanattr: {
        type: Array,
    },
    flag: {
        type: Boolean,
        default: false
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getAll = function(callback) {
    User.find({}, callback);
};

module.exports.addUser = function(newUser, callback) {
    const query = {username : newUser.username, groupname : newUser.groupname};
    User.countDocuments(query, (err, count) => {
        if (count == 0) {
            newUser.save(callback);
        } else {
            callback('User already in database');
        }
    });
};

module.exports.getUsersByGroup = function(groupname, callback) {
    const query = {groupname: groupname};
    User.find(query, callback);
};

module.exports.getUserById = function(userid, callback) {
    User.findById(userid, callback);
};

module.exports.resetGroupTrackAttr = function(groupname, callback) {
    query = {groupname: groupname};
    update = {trackattr: []};
    User.updateMany(query, update, callback);
};

module.exports.setFlag = function(userid) {
    User.findByIdAndUpdate(userid, {flag: true}, (err) => {
        if (err) {
            console.log('Failed to set flag', err, userid);
        }
    });
};

module.exports.getFlag = function(userid, callback) {
    if (userid != 'Test') {
        User.findById(userid, (err, user) => {
            if (err) {
                console.log('User (' + userid + ') not found for flag');
            } if (user) {
                callback(user.flag);
            }
        });
    }
};

module.exports.getFlagAndGroup = function(userid, callback) {
    if (userid != 'Test') {
        User.findById(userid, (err, user) => {
            if (err) {
                console.log('User (' + userid + ') not found for flag and group');
            } if (user) {
                callback({flag: user.flag, groupname: user.groupname});
            }
        });
    }
};

module.exports.getDissimilarity = function(groupname, trackattr, callback) {
    User.getUsersByGroup(groupname, (err, users) => {
        if (err) {
            console.log('Users of group (', groupname, ') not found for similarity calculation')
        }
        if (users) {
            let sum = 0;
            for (const user of users) {
                sum += calculateEuclidean(trackattr, user.meanattr);
            }
            callback(sum/users.length);
        }
    })
};

// −1 meaning exactly opposite, to 1 meaning exactly the same
calculateCosSim = function(array1, array2) {
    let sum = 0;
    let sum1 = 0;
    let sum2 = 0;
    for (i = 0; i < array1.length; i++) {
        sum += array1[i] * array2[i];
        sum1 += Math.pow(array1[i], 2);
        sum2 += Math.pow(array2[i], 2);
    }
    return (sum / (Math.sqrt(sum1) * Math.sqrt(sum2)));
};

// dissimilarity!!
calculateEuclidean = function(array1, array2) {
    let sum = 0;
    for (i = 0; i < array1.length; i++) {
        sum += Math.pow((array1[i] - array2[i]), 2);
    }
    return Math.sqrt(sum);
};
