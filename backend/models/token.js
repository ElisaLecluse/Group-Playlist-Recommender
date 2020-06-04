const mongoose = require('mongoose');
const config = require('../config/database');

const TokenSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    groupname: {
        type: String,
        required: true,
    },
    access_token: {
        type: String,
        required: true,
    },
    refresh_token: {
        type: String,
        required: true,
    },
    expiresin: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

const Token = module.exports = mongoose.model('Token', TokenSchema);

module.exports.getAll = function(callback) {
    Token.find({}, callback);
};

module.exports.getTokenByUser = function (userid, callback) {
    const query = {userid : userid};
    Token.findOne(query, callback);
};

module.exports.getTokenByAccessT = function (accessToken, callback) {
    const query = {access_token : accessToken};
    Token.findOne(query, callback);
};

// module.exports.addToken = function(newToken, callback) {
//     newToken.save(callback);
// };

module.exports.addToken = function(newToken, callback) {
    const query = {userid : newToken.userid};
    Token.countDocuments(query, (err, count) => {
        if (count == 0) {
            newToken.save(callback);
        } else {
            callback('Token already in database');
        }
    });
};

module.exports.updateToken = function(newToken, callback) {
    const query = {userid : newToken.userid};
    const updated = {access_token: newToken.access_token, expiresIn: newToken.expiresin};
    Token.updateOne(query, { $set: updated }, callback);
};
