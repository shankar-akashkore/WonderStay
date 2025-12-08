const express = require("express");
const router = express.Router({mergeParams : true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validatereview, isLoggedIn, isAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

//Review POST
router.post("/",validatereview ,isLoggedIn, wrapAsync(reviewController.createReview));

//Review Delete
router.delete("/:reviewId",isLoggedIn,isAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;