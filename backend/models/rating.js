const mongoose = require('mongoose');
const config = require('../config/database');
const request = require('request');


const RatingSchema = mongoose.Schema({
    userid: {
        type: String,
        required: true,
    },
    trackid: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
});

const Rating = module.exports = mongoose.model('Rating', RatingSchema);

module.exports.getAll = function(callback) {
    Rating.find({}, callback);
};

module.exports.addRatings = function(ratings, callback) {
    const added = [];
    let i = 0;
    for (const rating of ratings.ratings) {
        let newRating = new Rating( {
            userid: ratings.userid,
            trackid: rating.id,
            rating: rating.clicked
        });
        newRating.save((err, rating) => {
            if (err) {
                console.log('Failed to add rating', rating);
            } if (rating) {
                added.push(rating);
                i++;
                if (i == ratings.ratings.length) {
                    callback(added);
                }
            }
        });
    }
};
