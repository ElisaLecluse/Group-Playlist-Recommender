var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const router = express.Router();
const GroupSong = require('../models/groupsong');
const Slc = require('../models/selected');
const User = require('../models/user');
const Rating = require('../models/rating');

router.post('/rating', function(req, res) {
    if (req.body) {
        Rating.addRatings(req.body, (ratings) => {
            res.send(ratings);
        })
    }
});

router.get('/final', function(req, res) {
    const groupname = req.query.groupname || '';
    const flag = req.query.flag || 'false';
    let version = '';
    if ((groupname.charAt(0) == 'A' && flag == 'false')
        || (groupname.charAt(0) == 'B' && flag == 'true')) {
        version = 'v1';
    } else {
        version = 'v2';
    }
    if (version == 'v1') {
        GroupSong.find({groupname: groupname, version: version}).sort({'votes': -1}).then(
            (groupsongs) => {
                if (groupsongs) {
                    const length = groupsongs.length;
                    const index = length - Math.round(length/3);
                    const topsongs = groupsongs.slice(0, index);
                    const lastsongs = groupsongs.slice(index, length);
                    res.send({length: length, topsongs: topsongs, lastsongs: lastsongs});
                } else {
                    console.log('Failed sending final group playlist');
                }
            }
        );
    } else {
        GroupSong.find({groupname: groupname, version: version}).sort({'votes': -1, 'track.dissim': 1}).then(
            (groupsongs) => {
                if (groupsongs) {
                    const length = groupsongs.length;
                    const index = length - Math.round(length/3);
                    const topsongs = groupsongs.slice(0, index);
                    const lastsongs = groupsongs.slice(index, length);
                    res.send({length: length, topsongs: topsongs, lastsongs: lastsongs});
                } else {
                    console.log('Failed sending final group playlist');
                }
            }
        );
    }
});

router.get('/nbslc-per-member', function(req, res) {
    const groupname = req.query.groupname || '';
    const userid = req.query.userid || '';
    User.getFlag(userid, (flag) => {
        let version = '';
        if ((groupname.charAt(0) == 'A' && flag == false)
            || (groupname.charAt(0) == 'B' && flag == true)) {
            version = 'v1';
        } else {
            version = 'v2';
        }
        Slc.getMembersSelected(groupname, version, (err, users) => {
            if (err) {
                console.log('Selected songs of group ' + req.query.groupname + ' not found');
            } else if (users) {
                let selected = [];
                for (const user of users) {
                    let sum = 0;
                    if (user.tracks) {
                        sum += user.tracks.length;
                    } if (user.oldtracks) {
                        sum += user.oldtracks.length;
                    }
                    selected.push({id: user.userid, nbslc: sum});
                }
                res.send(selected);
            }
        })
    })
});

module.exports = router;
