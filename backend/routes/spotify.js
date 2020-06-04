
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const router = express.Router();
const Token = require('../models/token');
const Slc = require('../models/selected');
const Rec = require('../models/recommendation');
const User = require('../models/user')
const auth = require('../routes/auth');

router.get('/track', function(req, res) {

    const userid = req.query.userid;

    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            console.log('Token not found: '+ err)
        } else if (token) {

            const trackid = req.query.trackid || null;

            var options = {
                url: 'https://api.spotify.com/v1/tracks/' + trackid,
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
                        res.send(body);
                    }
                }
            });
        }});
});

router.get('/search', function(req, res) {

    const userid = req.query.userid;

    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            console.log('Token not found: '+ err)
        } else if (token) {

            const str = req.query.str || null;

            var options = {
                url: 'https://api.spotify.com/v1/search?q=' + str + '&type=track',
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
                        res.send(body);
                    }
                }
            });
        }});

    }
);

router.get('/recommendations', function(req, res) {

    const userid = req.query.userid;

    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            console.log('Token not found: '+ err)
        } else if (token) {

            var track_id = req.query.track_id || null;

            var options = {
                url: 'https://api.spotify.com/v1/recommendations?limit=5&seed_tracks=' + track_id,
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
                        res.send(body);
                    }
                }
            });
        }});
    }
);

router.get('/userselected', function(req, res) {
    const userid = req.query.userid || '';
    const tutorial = req.query.tutorial || '';
    User.getFlagAndGroup(userid, (d) => {
        let version = '';
        if ((d.groupname.charAt(0) == 'A' && d.flag == false)
            || (d.groupname.charAt(0) == 'B' && d.flag == true)) {
            version = 'v1';
        } else {
            version = 'v2';
        }
        if (tutorial == 'true') {
            version = 'Test';
        }
        Slc.getUserSelected(userid, version, (err, slc, old) => {
            if (!err) {
                let trackids = [];
                let olds = [];
                for (const s of slc) {
                    trackids.push(s.id);
                }
                if (old) {
                    for (const o of old) {
                        olds.push(o.id);
                    }
                }
                res.send({trackids: trackids, old: olds});
            }
        })
    });
});

router.get('/update-userrec', function(req, res) {
    const userid = req.query.userid || '';
    let tutorial = req.query.tutorial || '';
    if (tutorial == 'true') {
        Rec.updateUserRec(userid, 'Test', (userrec) => {
            res.send(userrec);
        })
    } else {
        User.getFlagAndGroup(userid, (d) => {
            let version = '';
            if ((d.groupname.charAt(0) == 'A' && d.flag == false)
                || (d.groupname.charAt(0) == 'B' && d.flag == true)) {
                version = 'v1';
            } else {
                version = 'v2';
            }
            Rec.updateUserRec(userid, version, (userrec) => {
                res.send(userrec);
            })
        });
    }
});

router.get('/update-grouprec', function(req, res) {
    const userid = req.query.userid || '';
    const groupname = req.query.groupname || '';
    const tutorial = req.query.tutorial || '';
    if (tutorial == 'true') {
        Rec.updateGroupRec(userid, groupname, 'Test', (grouprec) => {
            res.send(grouprec);
        })
    } else {
        User.getFlag(userid, (flag) => {
            let version = '';
            if ((groupname.charAt(0) == 'A' && flag == false)
                || (groupname.charAt(0) == 'B' && flag == true)) {
                version = 'v1';
            } else {
                version = 'v2';
            }
            Rec.updateGroupRec(userid, groupname, version, (grouprec) => {
                res.send(grouprec);
            })
        });
    }
});

module.exports = router;
