
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const router = express.Router();
const User = require('../models/user');
const Token = require('../models/token');
const Consent = require('../models/consent');

router.post('', function(req, res) {

    var username = req.body.username || null;
    var groupname = req.body.groupname.replace(/\s/g, '') || null;

    let newUser = new User({
        username: username,
        groupname: groupname,
        trackattr: [],
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            console.log('Failed to add user to database');
            res.status(400).send({message: err});
        } else {
            console.log('User added to database: ' + user);
            res.send(user);
        }
    });
    }
);

router.get('/remove-user', function(req, res) {
    var userid = req.query.userid || '';
    User.deleteOne({_id: userid}, (err, success) => {
        if (err) {
            console.log('Failed to remove user (' + userid + ') from database');
            res.status(400).send({message: err});
        } else {
            console.log('User removed', success, userid);
            Token.deleteOne({userid: userid}, (err, s) => {
                if (err) {
                    console.log('Failed to remove token from database, userid: ' + userid);
                    res.status(400).send({message: err});
                } else {
                    console.log('Token removed', s, userid);
                    res.send({user: success, token: s});
                }
            });
        }
    })
});

router.post('/consent', function(req, res) {
    var firstname = req.body.firstname || null;
    var lastname = req.body.lastname || null;
    var email = req.body.email || null;
    var consent = req.body.consent || false;

    let newConsent = new Consent({
        firstname: firstname,
        lastname: lastname,
        email: email,
        consent: consent
    });

    Consent.addConsent(newConsent, (err, consent) => {
        if (err) {
            console.log('Failed to add consent to database');
            res.status(400).send({message: err});
        } else {
            console.log('Consent added to database: ' + consent);
            res.send(consent);
        }
    })
});

router.get('/user', function(req, res) {
    var userid = req.query.userid;
    console.log(userid);
    User.getUserById(userid, (err, user) => {
        if (err) {
            console.log('User not found');
            res.status(404).send({message: err});
        } else {
            res.send(user);
        }
    })
});

router.get('/groupmembers', function(req, res) {
    const groupname = req.query.groupname;
    User.getUsersByGroup(groupname, (err, users) => {
        if (err) {
            console.log('Failed to find group or users in group');
            res.status(404).send({message: err});
        } else {
            res.send(users);
        }
    })
});

router.get('/token', function(req, res) {
    const userid = req.query.userid;
    console.log('USERID: ', userid);
    Token.getTokenByUser(userid, (err, token) => {
        if (err) {
            res.status(404).send({message: err});
        } if (token) {
            res.send(true);
        } else {
            console.log('SEND FALSE');
            res.send(false);
        }
    })
});

router.get('/flag', function(req, res) {
    const userid = req.query.userid;
    User.getFlag(userid, (flag) => {
        res.send(flag);
    })
});

router.get('/setflag', function(req, res) {
    const userid = req.query.userid;
    User.setFlag(userid);
    res.send({msg: 'Flag sent'});
});

router.get('/reset-trackattr', function(req, res) {
    const userid = req.query.userid || '';
    User.updateOne({_id: userid}, {trackattr: []}, (err, success) => {
        if (err) {
            console.log('Failed resetting track attributes of user', userid, err);
        } else if (success) {
            console.log('Track attributes reset of user', userid, success);
            res.send(success);
        }
    });
});

module.exports = router;
