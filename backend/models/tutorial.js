const mongoose = require('mongoose');


const TutorialSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    flag1: {
        type: Boolean,
        default: false,
    },
    flag2: {
        type: Boolean,
        default: false,
    },
    flag3: {
        type: Boolean,
        default: false,
    },
    flag4: {
        type: Boolean,
        default: false,
    },
    flag5: {
        type: Boolean,
        default: false,
    },
    flag6: {
        type: Boolean,
        default: false,
    },
});

const Tutorial = module.exports = mongoose.model('Tutorial', TutorialSchema);

module.exports.getAll = function(callback) {
    Tutorial.find({}, callback);
};

module.exports.getTut = function(userid, callback) {
    Tutorial.findOne({userid: userid}, (err, tut) => {
        if (err) {
            console.log('Failed to find tutorial flags', err);
        } else if (tut) {
            callback(tut);
        } else {
            callback('');
        }
    });
};

module.exports.addTut = function(userid, callback) {
    Tutorial.findOne({userid: userid}, (err, tut) => {
        if (err) {
            console.log('Failed to find tutorial flags', err);
        } else if (!tut) {
            let newTut = new Tutorial({
                userid: userid
            });
            newTut.save((err, succ) => {
                if (err) {
                    console.log('Failed to add tutorial flags', err);
                } if (succ) {
                    callback(succ);
                }
            });
        } else {callback('')}
    });
};

module.exports.addFlag = function(userid, flagnb, callback) {
    Tutorial.findOne({userid: userid}, (err, tut) => {
        if (err) {
            console.log('Failed to find flag', err);
        } else if (!tut) {
            let newTut = this.newTut(userid, flagnb);
            newTut.save(callback);
        } if (tut) {
            Tutorial.updateOne({userid: userid}, updateTut(flagnb), (err, succ) => {
                if (err) {
                    console.log('Failed to add flag', err);
                } if (succ) {
                    callback(succ);
                }
            });
        }
    });
};

newTut = function(userid, flagnb) {
    if (flagnb == 1) {
        return new Tutorial({
            userid: userid,
            flag1: true
        });
    }
    if (flagnb == 2) {
        return new Tutorial({
            userid: userid,
            flag2: true
        });
    }
    if (flagnb == 3) {
        return new Tutorial({
            userid: userid,
            flag3: true
        });
    }
    if (flagnb == 4) {
        return new Tutorial({
            userid: userid,
            flag4: true
        });
    }
    if (flagnb == 5) {
        return new Tutorial({
            userid: userid,
            flag5: true
        });
    }
    if (flagnb == 6) {
        return new Tutorial({
            userid: userid,
            flag6: true
        });
    }
    return {};
};

updateTut = function(flagnb) {
    if (flagnb == 1) {
        return {$set: {flag1: true}};
    }
    if (flagnb == 2) {
        return {$set: {flag2: true}};
    }
    if (flagnb == 3) {
        return {$set: {flag3: true}};
    }
    if (flagnb == 4) {
        return {$set: {flag4: true}};
    }
    if (flagnb == 5) {
        return {$set: {flag5: true}};
    }
    if (flagnb == 6) {
        return {$set: {flag6: true}};
    }
    return {};
};

