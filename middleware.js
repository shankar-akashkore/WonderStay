const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("./schema.js");
 
module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error","You need to logged in to access the pages!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async(req,res,next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next) => {
    let {error} = listingsSchemas.validate(req.body);
    if(error) {
        let errMeg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(errMeg,400);
    } else {
        next();
    }
};

module.exports.validatereview = (req,res,next) => {
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

module.exports.isAuthor = async(req,res,next) => {
    let { id,reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}