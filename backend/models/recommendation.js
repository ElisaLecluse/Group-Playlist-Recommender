const mongoose = require('mongoose');
const config = require('../config/database');
const request = require('request');
const Slc = require('../models/selected');
const Token = require('../models/token');
const auth = require('../routes/auth');

const RecommendationSchema = mongoose.Schema({
    selector: {
        type: String,
        required: true,
    },
    tracks: {
        type: Array,
        required: true,
    },
    version: {
        type: String,
        required: true,
    }
});

const Rec = module.exports = mongoose.model('Recommendation', RecommendationSchema);

module.exports.getAll = function(callback) {
    Rec.find({}, callback);
};
module.exports.removeTestRec = function(callback) {
    Rec.deleteMany({version: 'Test'}, callback);
};

module.exports.getUserRec = function(userid, version, callback) {
    const query = {selector : userid, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding user recommendations: ', err);
        } else if (rec) {
            callback(rec.tracks);
        } else {
            console.log('No user recommendations yet');
            callback([])
        }
    });
};

module.exports.getGroupRec = function(groupname, version, callback) {
    const query = {selector : groupname, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding group recommendations: ', err);
        } else if (rec) {
            callback(rec.tracks);
        } else {
            console.log('No group recommendations yet');
            callback([])
        }
    });
};

module.exports.addUserRec = function(userid, version, callback) {
    const query = {selector : userid, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding user recommendations: ', err);
        } else {
            Slc.getUserSelected(userid, version, (err, tracks) => {
                if (err) {
                    console.log('Failed getting selected usersongs: ', err);
                } else if (tracks) {
                    if (tracks[0]) {
                        Rec.getRecommendations(userid, [tracks[0]], 3, (err, rtracks) => {
                            if (err) {
                                console.log('Failed getting recommendations ', err);
                            } else if (rtracks) {
                                let arr = [];
                                for (const r of rtracks) {
                                    arr.push(dataToTrack(r));
                                }
                                if (rec) {
                                    Rec.updateOne(query, { $set: {tracks: arr.concat(rec.tracks)}}, err => {
                                        if (err) {
                                            console.log('Failed updating user recommendations', err);
                                        } else {
                                            callback(arr);
                                        }
                                    });
                                } else {
                                    const newRec = new Rec({selector: userid, tracks: arr, version: version});
                                    newRec.save( err => {
                                        if (err) {
                                            console.log('Failed adding user recommendations', err);
                                        } else {
                                            callback(arr);
                                        }
                                    });
                                }
                            } else {
                                callback([]);
                            }
                        });
                    }
                } else {
                    console.log('No tracks selected by user '+ userid +' yet');
                    callback([]);
                }
            });
        }
    });
};

module.exports.addGroupRec = function(userid, groupname, version, callback) {
    const query = {selector: groupname, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding recommendations: ', err);
        } else {
            Slc.getGroupSelected(groupname, version, (err, tracks) => {
                if (err) {
                    console.log('Failed getting selected groupsongs: ', err);
                } else if (tracks) {
                    Rec.getRecommendations(userid, tracks, 3, (err, rtracks) => {
                        if (err) {
                            console.log('Failed getting recommendations ', err);
                        } else if (rtracks) {
                            let arr = [];
                            for (const r of rtracks) {
                                arr.push(dataToTrack(r));
                            }
                            if (rec) {
                                Rec.updateOne(query, { $set: {tracks: arr.concat(rec.tracks)}}, err => {
                                    if (err) {
                                        console.log('Failed updating group recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            } else {
                                const newRec = new Rec({selector: groupname, tracks: arr, version: version});
                                newRec.save( err => {
                                    if (err) {
                                        console.log('Failed adding group recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            }
                        } else {
                            callback([]);
                        }
                    });
                } else {
                    console.log('No tracks selected by group '+ groupname +' yet');
                    callback([]);
                }
            });
        }
    })
};

module.exports.updateUserRec = function(userid, version, callback) {
    const query = {selector : userid, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding user recommendations: ', err);
        } else {
            Slc.getUserSelected(userid, version, (err, tracks) => {
                if (err) {
                    console.log('Failed getting selected usersongs: ', err);
                } else if (tracks) {
                    Rec.getRecommendations(userid, tracks, 10, (err, rtracks) => {
                        if (err) {
                            console.log('Failed getting recommendations ', err);
                        } else if (rtracks) {
                            let arr = [];
                            for (const r of rtracks) {
                                arr.push(dataToTrack(r));
                            }
                            if (rec) {
                                Rec.updateOne(query, { $set: {tracks: arr}}, err => {
                                    if (err) {
                                        console.log('Failed updating user recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            } else {
                                const newRec = new Rec({selector: userid, tracks: arr, version: version});
                                newRec.save( err => {
                                    if (err) {
                                        console.log('Failed adding user recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            }
                        } else {
                            callback([]);
                        }
                    });
                } else {
                    console.log('No tracks selected by user '+ userid +' yet');
                    callback([]);
                }
            });
        }
    });
};

module.exports.updateGroupRec = function(userid, groupname, version, callback) {
    const query = {selector: groupname, version: version};
    Rec.findOne(query, (err, rec) => {
        if (err) {
            console.log('Failed finding recommendations: ', err);
        } else {
            Slc.getGroupSelected(groupname, version,(err, tracks) => {
                if (err) {
                    console.log('Failed getting selected groupsongs: ', err);
                } else if (tracks) {
                    Rec.getRecommendations(userid, tracks, 10, (err, rtracks) => {
                        if (err) {
                            console.log('Failed getting recommendations ', err);
                        } else if (rtracks) {
                            let arr = [];
                            for (const r of rtracks) {
                                arr.push(dataToTrack(r));
                            }
                            if (rec) {
                                Rec.updateOne(query, { $set: {tracks: arr}}, err => {
                                    if (err) {
                                        console.log('Failed updating group recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            } else {
                                const newRec = new Rec({selector: groupname, tracks: arr, version: version});
                                newRec.save( err => {
                                    if (err) {
                                        console.log('Failed adding group recommendations', err);
                                    } else {
                                        callback(arr);
                                    }
                                });
                            }
                        } else {
                            callback([]);
                        }
                    });
                } else {
                    console.log('No tracks selected by group '+ groupname +' yet');
                    callback([]);
                }
            });
        }
    })
};

module.exports.getRecommendations = function(userid, tracks, nb, callback) {
    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            console.log('Token not found: '+ err)
        } else if (token) {
            const trackids = [];
            console.log(tracks);
            for (const t of tracks) {
                console.log(t.name);
                trackids.push(t.id);
                if (trackids.length == 5) {
                    break;
                }
            }
            var options = {
                url: 'https://api.spotify.com/v1/recommendations?limit=' + nb + '&seed_tracks=' + trackids.toString(),
                headers: { 'Authorization': 'Bearer ' + token.access_token },
                json: true
            };

            request.get(options, function(error, response, body) {
                if (error) {
                    console.log('Spotify error:', error);
                } else if (body) {
                    if (body.error) {
                        console.log(body.error);
                        auth.refreshToken(token);
                    } else {
                        callback('', body.tracks);
                    }
                }
            });
        } else {
            console.log('Token not returned');
        }
    });
};

function dataToTrack(data) {
    return {
        id: data.id,
        name: data.name,
        artists: dataToArtists(data),
        previewUrl: data.preview_url,
        userids: []
    };
}

function dataToArtists(data) {
    let artistStr = '';
    let firstflag = true;
    for (const i of data.artists) {
        if (firstflag) {
            artistStr = i.name;
            firstflag = false;
        } else {
            artistStr += ', ' + i.name;
        }
    }
    return artistStr;
}
