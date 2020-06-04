
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const router = express.Router();
const Token = require('../models/token');

const client_id = '884e5796b53d43c7b7c3310737f11381'; // Your client id
const client_secret = '81efdb18fba8484db2ca0510f2021ee2'; // Your secret
// const redirect_uri = 'http://picasso.experiments.cs.kuleuven.be:3902/auth/callback'; // Your redirect uri
const redirect_uri = 'http://localhost:3902/auth/callback';
let userid = '';
let groupname = '';

//TODO: userid & groupname interference


/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

router.get('/login', function(req, res) {

    userid = req.query.userid;
    groupname = req.query.groupname;

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-top-read user-read-recently-played user-modify-playback-state user-read-playback-state user-read-currently-playing app-remote-control streaming';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});

router.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                if (!(userid && groupname)) {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'not_logged_in'
                        }));
                }

                let newToken = new Token({
                    userid: userid,
                    groupname: groupname,
                    access_token: body.access_token,
                    refresh_token: body.refresh_token,
                    expiresin: body.expires_in,
                });

                Token.addToken(newToken, (err, token) => {
                    if (err) {
                        console.log('Failed to add token to database: ' + err);
                    } else {
                        console.log('Token added to database');
                        Token.getTokenByAccessT(newToken.access_token, (err, token) => {
                            if (err) {
                                console.log('Token not found: '+ err);
                            } else {
                                console.log('Token: ' + token);
                                waitForExpire(newToken, newToken.expiresin);
                            }});
                    }
                });

                // we can also pass the token to the browser to make requests from there
                // res.redirect('/#' +
                //     querystring.stringify({
                //         access_token: access_token,
                //         refresh_token: refresh_token
                //     }));
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
        // res.redirect('http://localhost:4200');
        // res.redirect('http://picasso.experiments.cs.kuleuven.be:3901/tokencheck');
        res.redirect('http://localhost:4444/tokencheck');
    }
});

module.exports = router;

module.exports.refreshToken = function(oldToken) {
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: oldToken.refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {

            let newToken = new Token({
                userid: oldToken.userid,
                groupname: oldToken.groupname,
                access_token: body.access_token,
                refresh_token: oldToken.refresh_token,
                expiresin: body.expires_in,
            });

            Token.updateToken(newToken, (err, token) => {
                if (err) {
                    console.log('Failed to update token: ' + err);
                } else if (token) {
                    console.log('Token updated');
                    console.log('Timestamp old token:', oldToken.date);
                    Token.getTokenByAccessT(newToken.access_token, (err, ntoken) => {
                        if (err) {
                            console.log('Token not found: '+ err);
                        } else {
                            console.log('Timestamp new token:', (new Date()).toISOString());
                            console.log('Token: ' + ntoken);
                        }});
                }
            });
        }
    });
};

const auth = require('./auth');

var waitForExpire = function(token, expiresin) {
    setTimeout(() => {
        auth.refreshToken(token);
    }, expiresin * 990);
};
