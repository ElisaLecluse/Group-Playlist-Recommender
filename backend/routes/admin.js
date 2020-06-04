var express = require('express');
const router = express.Router();
const User = require('../models/user');
const Token = require('../models/token');
const GroupSong = require('../models/groupsong');
const Log = require('../models/log');
const Consent = require('../models/consent');
const Rating = require('../models/rating');
const Rec = require('../models/recommendation');
const Slc = require('../models/selected');
const Tut = require('../models/tutorial');


router.get('/remove-userbyid', function(req, res) {
    User.deleteOne({_id: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-tokenbyuserid', function(req, res) {
    Token.deleteMany({userid: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-songsbygroup', function(req, res) {
    GroupSong.deleteMany({groupname: req.query.groupname}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-logsbyuserid', function(req, res) {
    Log.deleteMany({userid: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-slcbyuserid', function(req, res) {
    Slc.deleteMany({userid: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-recbyslc', function(req, res) {
    Rec.deleteMany({selector: req.query.selector}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-consentbynames', function(req, res) {
    Consent.deleteOne({firstname: req.query.firstname, lastname: req.query.lastname}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-ratingbyuserid', function(req, res) {
    Rating.deleteMany({userid: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

router.get('/remove-tutbyuserid', function(req, res) {
    Tut.deleteMany({userid: req.query.userid}, (err, success) => {
        if (err) {
            res.send(err);
        } else if (success) {
            res.send(success);
        }
    })
});

module.exports = router;
