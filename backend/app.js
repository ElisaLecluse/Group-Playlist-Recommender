var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/database');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server, {pingTimeout: 600000});
var fs = require('fs');

const Consent = require('./models/consent');
const GroupSong = require('./models/groupsong');
const Log = require('./models/log');
const Rating = require('./models/rating');
const User = require('./models/user');
const Token = require('./models/token');
const Rec = require('./models/recommendation');
const Slc = require('./models/selected');
const Tut = require('./models/tutorial');


mongoose.connect(config.database);
mongoose.connection.on('connected', () => {console.log('connected to database ' + config.database)});
mongoose.connection.on('error', (err) => {console.log('Database error: ' + err)});

io.on('connection', function (socket) {
    socket.emit('user connected');

    socket.on('init', function (data) {
        User.getFlagAndGroup(data.userid, (d) => {
            let version = '';
            if ((d.groupname.charAt(0) == 'A' && d.flag == false)
                || (d.groupname.charAt(0) == 'B' && d.flag == true)) {
                version = 'v1';
            } else {
                version = 'v2';
            }
            if (data.tutorial) {
                version = 'Test';
            }
            if (version == 'v1') {
                GroupSong.find({groupname: data.groupname, version: version}).sort({'votes': -1}).exec(
                    function (err, groupsongs) {
                        emitInitPlaylist(err, groupsongs, data.userid, data.groupname, version, socket);
                        console.log('TIME BASED RANKING', d.groupname, d.flag, version);
                    }
                );
            } else {
                GroupSong.find({groupname: data.groupname, version: version}).sort({'votes': -1, 'track.dissim': 1}).exec(
                    function (err, groupsongs) {
                        emitInitPlaylist(err, groupsongs, data.userid, data.groupname, version, socket);
                        console.log('EUCLIDEAN RANKING', d.groupname, d.flag, version);
                    }
                );
            }

            socket.on('add song', function (data) {

                let newGroupSong = new GroupSong({
                    groupname: data.groupname,
                    track: data.track,
                    version: version,
                });

                GroupSong.addSong(newGroupSong, data.userid,(err, modified, groupsong) => {
                    if (err) {
                        console.log('Failed to add song to playlist: ', newGroupSong, err);
                    }
                    if (modified) {
                        console.log('Callback added song: ', modified);
                    }
                    if (groupsong) {
                        console.log('Song added to playlist: ', groupsong);
                        Slc.addSelected(data.userid, data.groupname, data.track, version, (err, slc, trigger) => {
                            if (err) {
                                console.log('Failed adding selected user song');
                            } else if (trigger) {
                                socket.emit('5 selected', {userid: data.userid});
                            } else if (slc) {
                                emitSortedPlaylist(data.groupname, data.userid, version, d.flag);
                                Rec.addUserRec(data.userid, version, (userrec) => {
                                    if (userrec) {
                                        socket.emit('userrec', {userid: data.userid, userrec: userrec, version: version});
                                    } else {
                                        console.log('Failed adding user song recommendations');
                                    }
                                });
                                Rec.addGroupRec(data.userid, data.groupname, version, (grouprec) => {
                                    if (grouprec) {
                                        io.sockets.emit('grouprec', {groupname: data.groupname, grouprec: grouprec, version: version});
                                    } else {
                                        console.log('Failed adding group song recommendations');
                                    }
                                });
                            }
                        });
                    }
                });
            });

            socket.on('remove song', function (data) {

                let groupSong = {
                    groupname: data.groupname,
                    track: data.track,
                    version: version,
                };

                GroupSong.removeSong(groupSong, data.userid, (err, modified, groupsong) => {
                    if (err) {
                        console.log('Failed to remove song from playlist: ', groupSong, err);
                    }
                    if (modified) {
                        console.log('Callback removed song: ', modified);
                    }
                    if (groupsong) {
                        Slc.removeSelected(data.userid, data.groupname, data.track, version, (err, slc, trigger) => {
                            if (err) {
                                console.log('Failed removing selected user song');
                            } else if (trigger) {
                                socket.emit('5 not selected', {userid: data.userid});
                            } else {
                                console.log('Song removed from playlist: ', groupsong);
                                emitSortedPlaylist(data.groupname, data.userid, version, d.flag);
                            }
                        });
                    }
                });
            });

        });
    });

    socket.on('user left', function (data) {
        socket.broadcast.emit('user left', {groupname: data.groupname});
        User.resetGroupTrackAttr(data.groupname, (err, success) => {
            if (err) {
                console.log('Failed resetting track attributes of group', data.groupname, err);
            } else if (success) {
                console.log('Track attributes reset of group', data.groupname, success);
            }
        });
    })

});

emitSortedPlaylist = function(groupname, userid, version, flag) {
    GroupSong.updateAllDissim(groupname, version, (update) => {
        if (update) {
            if (version == 'v1') {
                GroupSong.find({groupname: groupname, version: version}).sort({'votes': -1}).exec(
                    function (err, groupsongs) {
                        if (groupsongs) {
                            io.sockets.emit('playlist', {groupname: groupname, playlist: groupsongs, version: version});
                            console.log('TIME BASED RANKING', groupname, flag, version);
                        } else {
                            console.log('Failed ranking groupsongs ', err);
                        }
                    }
                );
            } else {
                GroupSong.find({groupname: groupname, version: version}).sort({'votes': -1, 'track.dissim': 1}).exec(
                    function (err, groupsongs) {
                        if (groupsongs) {
                            io.sockets.emit('playlist', {groupname: groupname, playlist: groupsongs, version: version});
                            console.log('EUCLIDEAN RANKING', groupname, flag, version);
                        } else {
                            console.log('Failed ranking groupsongs ', err);
                        }
                    }
                );
            }
        }
    });
};

emitInitPlaylist = function(err, groupsongs, userid, groupname, version, socket) {
    if (groupsongs) {
        User.getUserById(userid, (err, user) => {
            if (err) {
                console.log('User was not find with this id: ', userid);
            } if (user) {
                Rec.getUserRec(userid, version,userrec => {
                    Rec.getGroupRec(groupname, version, grouprec => {
                        socket.emit('init',
                            {   groupname: groupname,
                                playlist: groupsongs,
                                userrec: userrec,
                                grouprec: grouprec      });
                        socket.broadcast.emit('new user',
                            {   userid: userid,
                                username: user.username,
                                groupname: groupname   });
                    })
                })
            }
        });
    } else {
        console.log('Failed ranking groupsongs ', err);
    }
};

app.get('/groupsongs', function(req, res) {
    GroupSong.getAll((err, groupsongs) => {
        if (err) {
            res.send(err);
        } else if (groupsongs) {
            res.send(groupsongs);
        }
    });
});
app.get('/songs-per-group', function(req, res) {
    GroupSong.find({groupname: req.query.groupname, version: 'v1'}).sort({'votes': -1}).exec(
        function (err, songs) {
            if (songs) {
                const arr1 = [];
                for (const s of songs) {
                    arr1.push(' ' + s.track.name + ' - ' + s.track.artists)
                }
                GroupSong.find({groupname: req.query.groupname, version: 'v2'}).sort({'votes': -1}).exec(
                    function (err, songs) {
                        if (songs) {
                            const arr2 = [];
                            for (const s of songs) {
                                arr2.push(s.track.name + ' - ' + s.track.artists)
                            }
                            const string = 'Playlist 1: <br>' + arr1.join('<br>')
                                + '<br> <br> Playlist 2: <br>' + arr2.join('<br>');
                            res.send(string);
                        } else {
                            res.send(err);
                        }
                    }
                );
            } else {
                res.send(err);
            }
        }
    );
});
app.get('/remove-test-songs', function(req, res) {
    GroupSong.removeTestSongs((err, songs) => {
        if (err) {
            res.send(err);
        } else if (songs) {
            res.send('Test songs successfully removed', songs);
        }
    })
});
app.get('/consents', function(req, res) {
    Consent.getAll((err, consents) => {
        if (err) {
            res.send(err);
        } else if (consents) {
            res.send(consents);
        }
    });
});
app.get('/logs', function(req, res) {
    Log.getAll((err, logs) => {
        if (err) {
            res.send(err);
        } else if (logs) {
            res.send(logs);
        }
    });
});
app.get('/remove-test-logs', function(req, res) {
    Log.removeTestLogs((err, logs) => {
        if (err) {
            res.send(err);
        } else if (logs) {
            res.send('Test logs successfully removed', logs);
        }
    })
});
app.get('/ratings', function(req, res) {
    Rating.getAll((err, ratings) => {
        if (err) {
            res.send(err);
        } else if (ratings) {
            res.send(ratings);
        }
    });
});
app.get('/recommendations', function(req, res) {
    Rec.getAll((err, recs) => {
        if (err) {
            res.send(err);
        } else if (recs) {
            res.send(recs);
        }
    });
});
app.get('/remove-test-rec', function(req, res) {
    Rec.removeTestRec((err, rec) => {
        if (err) {
            res.send(err);
        } else if (rec) {
            res.send('Test recommendations successfully removed', rec);
        }
    })
});
app.get('/selections', function(req, res) {
    Slc.getAll((err, slc) => {
        if (err) {
            res.send(err);
        } else if (slc) {
            res.send(slc);
        }
    });
});
app.get('/remove-test-slc', function(req, res) {
    Slc.removeTestSlc((err, slc) => {
        if (err) {
            res.send(err);
        } else if (slc) {
            res.send('Test selections successfully removed', slc);
        }
    })
});
app.get('/tokens', function(req, res) {
    Token.getAll((err, tokens) => {
        if (err) {
            res.send(err);
        } else if (tokens) {
            res.send(tokens);
        }
    });
});
app.get('/users', function(req, res) {
    User.getAll((err, users) => {
        if (err) {
            res.send(err);
        } else if (users) {
            res.send(users);
        }
    });
});
app.get('/tuts', function(req, res) {
    Tut.getAll((err, tut) => {
        if (err) {
            res.send(err);
        } else if (tut) {
            res.send(tut);
        }
    });
});

const admin = require('./routes/admin');
const auth = require('./routes/auth');
const spotify = require('./routes/spotify');
const login = require('./routes/login');
const playlist = require('./routes/playlist');
const logging = require('./routes/logging');

app.use(bodyParser());
app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

app.use('/admin', admin);
app.use('/auth', auth);
app.use('/spotify', spotify);
app.use('/login', login);
app.use('/playlist', playlist);
app.use('/log', logging);

app.get('/overview', function(req, res) {
    fs.readFile('./index.html', (err, html) => {
        if (err) {
            throw err;
        } else if (html) {
            console.log(html);
            res.writeHeader(200, {"Content-Type": "text/html"});
            res.write(html);
            res.end();
        }
    })
});

console.log('Backend listening on 3902');
server.listen(3902);
