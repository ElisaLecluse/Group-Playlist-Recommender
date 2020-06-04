const mongoose = require('mongoose');
const config = require('../config/database');

const SelectedSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    groupname: {
        type: String,
        required: true,
    },
    tracks: {
        type: Array,
        required: true,
    },
    oldtracks: {
        type: Array,
    },
    version: {
        type: String,
        required: true,
    }
});

const Slc = module.exports = mongoose.model('Selected', SelectedSchema);

module.exports.getAll = function(callback) {
    Slc.find({}, callback);
};
module.exports.removeTestSlc = function(callback) {
    Slc.deleteMany({version: 'Test'}, callback);
};

module.exports.addSelected = function(userid, groupname, track, version, callback) {
    const query = {userid : userid, version: version};
    Slc.findOne(query, (err, user) => {
        if (err) {
            callback(err)
        } if (user) {
            const updated = user.tracks;
            if (updated.length == 4) {
                callback(null, null, '5 selected');
            }
            if (updated.length > 4) {
                const moved = updated.pop();
                const old = user.oldtracks;
                if (old) {
                    old.push(moved);
                    Slc.updateOne(query, { $set: {oldtracks: old}}, (err, success) => {
                        if (err) {
                            console.log('Failed to move selected to old', err);
                        } if (success) {
                            console.log('Success moving selected to old', success);
                        }
                    });
                } else {
                    Slc.updateOne(query, { $set: {oldtracks: [moved]}}, (err, success) => {
                        if (err) {
                            console.log('Failed to move selected to old', err);
                        } if (success) {
                            console.log('Success moving selected to old', success);
                        }
                    });
                }
            }
            updated.unshift(track);
            Slc.updateOne(query, { $set: {tracks: updated}}, callback);
        } else {
            const slc = new Slc({
                userid: userid,
                groupname: groupname,
                tracks: [track],
                version: version
            });
            slc.save(callback);
        }
    });
};

module.exports.removeSelected = function(userid, groupname, track, version, callback) {
    const query = {userid : userid, version: version};
    Slc.findOne(query, (err, user) => {
        if (err) {
            callback(err)
        } if (user) {
            const updated = [];
            for (const t of user.tracks) {
                if (t.id != track.id) {
                    updated.push(t);
                }
            }
            if (user.oldtracks && user.oldtracks.length > 0) {
                if (updated.length < 5) {
                    updated.push(user.oldtracks.pop());
                    Slc.updateOne(query, { $set: {oldtracks: user.oldtracks}}, (err, success) => {
                        if (err) {
                            console.log('Failed to remove selected from old', err);
                        } if (success) {
                            console.log('Success removing selected from old', success);
                        }
                    });
                } else {
                    const olds = [];
                    for (const o of user.oldtracks) {
                        if (o.id != track.id) {
                            olds.push(o);
                        }
                    }
                    Slc.updateOne(query, { $set: {oldtracks: olds}}, (err, success) => {
                        if (err) {
                            console.log('Failed to remove selected from old', err);
                        } if (success) {
                            console.log('Success removing selected from old', success);
                        }
                    });
                }
            }
            if (updated.length < 5) {
                callback(null, null, 'not 5 selected')
            }
            Slc.updateOne(query, { $set: {tracks: updated}}, callback)
        } else {
            console.log('User\'s selected songs are not in database (id ', userid, ')');
        }
    });
};

module.exports.getUserSelected = function(userid, version, callback) {
    const query = {userid: userid, version: version};
    Slc.findOne(query, (err, user) => {
        if (err) {
            callback(err);
        } else if (user) {
            callback('', user.tracks, user.oldtracks);
        } else {
            console.log('User\'s selected songs are not in database (id ', userid, ')');
            callback('', []);
        }
    });
};

module.exports.getGroupSelected = function(groupname, version, callback) {
    const query = {groupname: groupname, version: version};
    Slc.find(query, (err, users) => {
        if (err) {
            callback(err);
        } if (users) {
            console.log('Group members selection:', version, groupname, users);
            const selected = [];
            for (const u of users) {
                selected.push(u.tracks[0]);
            }
            callback('', selected);
        } else {
            console.log('Group\'s selected songs are not in database (groupname ', groupname, ')')
        }
    });
};

module.exports.getMembersSelected = function(groupname, version, callback) {
    const query = {groupname: groupname, version: version};
    Slc.find(query, callback);
};


