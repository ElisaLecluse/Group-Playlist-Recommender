var express = require('express');
const router = express.Router();
const Log = require('../models/log');
const Tut = require('../models/tutorial');

router.post('', function(req, res) {
    if (req.body) {
        Log.addLog(req.body, (err, log) => {
            if (err) {
                console.log('Failed adding log:', err);
                res.send({msg: 'Failed adding log'})
            } if (log) {
                res.send(log);
            }
        })
    } else {
        res.send({msg: 'Failed adding log'});
    }
});

router.get('/add-tut', function(req, res) {
    if (req.query.userid) {
        Tut.addTut(req.query.userid, (succ) => res.send({msg: succ}));
    }
});

router.get('/add-tutflag', function(req, res) {
    if (req.query.userid && req.query.flagnb) {
        Tut.addFlag(req.query.userid, req.query.flagnb, (succ) => res.send({msg: succ}));
    }
});

router.get('/get-tutflags', function(req, res) {
    if (req.query.userid) {
        Tut.getTut(req.query.userid, (tut) => res.send(tut));
    }
});

module.exports = router;
