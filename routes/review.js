const express = require("express");
const router = express.Router({mergeParams : true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
const Listing = require("../models/listing.js");

const validatereview = (req,res,next) => {
    if(!req.body.review){
        throw new ExpressError("Review is required",400);
    }
    let {error} = reviewSchemas.validate(req.body);
    if(error) {
        let errMeg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(errMeg,400);
    } else {
        next();
    }
};

//Review POST
router.post("/",validatereview , wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saves");
    res.redirect(`/listings/${listing._id}`);
}));

//Review Delete
router.delete("/:reviewId",wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))

module.exports = router;