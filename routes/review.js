const express = require("express");
const router = express.Router({mergeParams : true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Review = require("../models/review.js");
const listing = require("../models/listing.js");
const Listing = require("../models/listing.js");
const {validatereview, isLoggedIn, isAuthor } = require("../middleware.js");

//Review POST
router.post("/",validatereview ,isLoggedIn, wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; 

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saves");
    req.flash("success" , "New Review Added!");
    res.redirect(`/listings/${listing._id}`);
}));

//Review Delete
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("success" , "Review Deleted!");
    res.redirect(`/listings/${id}`);
}))

module.exports = router;