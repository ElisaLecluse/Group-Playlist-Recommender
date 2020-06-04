const mongoose = require('mongoose');
const config = require('../config/database');
const request = require('request');
const Token = require('../models/token');
const User = require('../models/user');
const Slc = require('../models/selected');
const auth = require('../routes/auth');


const GroupSongSchema = mongoose.Schema({
    groupname: {
        type: String,
        required: true,
    },
    track: {
        type: { foo: String },
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    votes: {
        type: Number
    }
});

const GroupSong = module.exports = mongoose.model('Playlist', GroupSongSchema);

module.exports.getAll = function(callback) {
    GroupSong.find({}, callback);
};
module.exports.removeTestSongs = function(callback) {
    GroupSong.deleteMany({version: 'Test'}, callback);
};

module.exports.addSong = function(newSong, userid, callback) {
    const query = {'groupname' : newSong.groupname, 'track.id': newSong.track.id, version: newSong.version};
    GroupSong.findOne(query, (err, song) => {
        if (err) {
            callback(err);
        } if (!song) {
            getTrackAttr(userid, newSong.track.id, (err, body) => {
                if (err) {
                    console.error('Track attributes error: ', err);
                } else {
                    const attr = attrToList(body);
                    newSong.track.attr = attr;
                    User.getUserById(userid, (err, user) => {
                        if (user) {
                            const updated = user.trackattr.concat([attr]);
                            User.findByIdAndUpdate(userid, { $set: {trackattr: updated, meanattr: getMedianAttr(updated)}}, err => {
                                if (err) {
                                    console.log('Failed to add attr to user: ', err);
                                } else {
                                    newSong.votes = 1;
                                    newSong.track.dissim = 0;
                                    newSong.save((err, song) => {callback(err, '', song)});
                                }
                            })
                        } else {
                            console.log('Failed finding user with id ', userid);
                        }
                    });
                }
            });
        } else {
            if (!song.track.userids.includes(userid)) {
                const attr = song.track.attr;
                const votes = song.votes + 1;
                User.getUserById(userid, (err, user) => {
                    if (user) {
                        const updated = user.trackattr.concat([attr]);
                        User.findByIdAndUpdate(userid, { $set: {trackattr: updated, meanattr: getMedianAttr(updated)}}, err => {
                            if (err) {
                                console.log('Failed to add attr to user: ', err);
                            } else {
                                const userids = song.track.userids.concat([userid]);
                                GroupSong.updateOne(query, {$set: {'track.userids': userids, 'votes': votes}}, (err, update) => {
                                    updatedSong = newSong;
                                    updatedSong.track.userids = userids;
                                    callback(err, update, updatedSong);
                                });
                            }
                        })
                    } else {
                        console.log('Failed finding user with id ', userid);
                    }
                });
            } else {
                callback('User already selected this song');
            }
        }
    });
};

module.exports.removeSong = function(song, userid, callback) {
    const query = {'groupname' : song.groupname, 'track.id': song.track.id, 'version': song.version};
    GroupSong.findOne(query, (err, oldSong) => {
        if (err) {
            callback(err)
        } else if (!oldSong) {
            callback('This song is not in the playlist')
        } else {
            const attr = oldSong.track.attr;
            const votes = oldSong.votes - 1;
            User.getUserById(userid, (err, user) => {
                if (user) {
                    const updated = [];
                    for (const a of user.trackattr) {
                        for (j = 0; j < a.length; j++) {
                            if (a[j] != attr[j]) {
                                updated.push(a);
                                break;
                            }
                        }
                    }
                    User.findByIdAndUpdate(userid, { $set: {trackattr: updated, meanattr: getMedianAttr(updated)}}, err => {
                        if (err) {
                            console.log('Failed to add attr to user: ', err);
                        } else {
                            const userids = oldSong.track.userids;
                            const index = userids.indexOf(userid);
                            if (index > -1) {
                                if (userids.length > 1) {
                                    userids.splice(index, 1);
                                    GroupSong.updateOne(query, { $set: {'track.userids': userids, 'votes': votes}}, (err, update) => {
                                        callback(err, update, song);
                                    });
                                } else {
                                    GroupSong.deleteOne(query, (err, update) => {
                                        callback(err, update, song);
                                    });
                                }
                            } else {
                                callback('User did not select this song');
                            }
                        }
                    })
                } else {
                    console.log('Failed finding user with id ', userid);
                }
            });
        }
    });
};

module.exports.updateAllDissim = function(groupname, version, callback) {
    GroupSong.getGroupSongs(groupname, version, (err, groupsongs) => {
        if (groupsongs) {
            let i = 0;
            const length = groupsongs.length;
            for (const song of groupsongs) {
                User.getDissimilarity(groupname, song.track.attr, (dissim) => {
                    GroupSong.updateOne({groupname: groupname, version: version, 'track.id': song.track.id},
                        { $set: {'track.dissim': dissim}}, (err, update) => {
                            i++;
                            if (err) {
                                console.log('Failed updating similarity: ', song);
                            } else if (i == length) {
                                callback(update);
                            }
                        });
                });
            }
        }
    });
};

getTrackAttr = function(userid, trackid, callback) {

    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            console.log('Token not found: '+ err)
        } else {

            var options = {
                url: 'https://api.spotify.com/v1/audio-features/' + trackid,
                headers: { 'Authorization': 'Bearer ' + token.access_token },
                json: true
            };

            request.get(options, function(error, response, body) {
                if (error) {
                    console.log('Spotify error:', error);
                } else if (body) {
                    if (body.error) {
                        auth.refreshToken(token);
                    } else {
                        callback('', body);
                    }
                }
            });
        }});
};

attrToList = function(attr) {
    let attrs = [];
    attrs.splice(0, 0, attr.acousticness);
    attrs.splice(1, 0, attr.danceability);
    attrs.splice(2, 0, attr.energy);
    attrs.splice(3, 0, ((attr.loudness <= -35) ? 1.0 : attr.loudness/(-35.0)));
    attrs.splice(4, 0, attr.valence);
    if (attr.tempo <= 40) {
        attrs.splice(5, 0, 0);
    } if (attr.tempo >= 220) {
        attrs.splice(5, 0, 1);
    } else {
        attrs.splice(5, 0, (attr.tempo - 40.0)/(220.0 - 40.0))
    }
    return attrs;
};

getMeanAttr = function(attrList) {
    const length = attrList.length;
    if (length == 0) {
        return [];
    }
    if (length == 1) {
        return attrList[0];
    }
    const meanList = [];
    let sum;
    // 6 = nb of track attributes
    for (j = 0; j < 6; j++) {
        sum = 0;
        for (i = 0; i < length; i++) {
            sum += attrList[i][j];
        }
        meanList.splice(j, 0, sum/(length));
    }
    return meanList;
};

getMedianAttr = function(attrList) {
    const length = attrList.length;
    if (length == 0) {
        return [];
    }
    if (length == 1) {
        return attrList[0];
    }
    const medianList = [];
    // 6 = nb of track attributes
    for (j = 0; j < 6; j++) {
        arr = [];
        for (i = 0; i < length; i++) {
            arr.push(attrList[i][j]);
        }
        medianList.splice(j, 0, median(arr));
    }
    return medianList;
};

median = arr => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

module.exports.getGroupSongs = function(groupname, version, callback) {
    const query = {groupname: groupname, version: version};
    GroupSong.find(query, callback);
};
