const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");


//index routing
router.get("/", wrapAsync(async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
}));

//New routes
router.get("/new", isLoggedIn,(req,res) => {
    res.render("listing/new");
})

//show routes
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author"},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listing/show" , { listing });
}));

//Create routes
router.post("/", isLoggedIn, wrapAsync(async (req,res,next) => {
    let result = listingsSchemas.validate(req.body);
    console.log(result); 
    const { error } = listingsSchemas.validate(req.body);
    if (error) {
      throw new ExpressError(error.details[0].message, 400);
    }
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success" , "New Listing Added!");
    res.redirect("/listings");
})
);

//edit routes
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    res.render("listing/edit" , {listing});
}));

//update routes
router.put("/:id", isLoggedIn,isOwner, validateListing, wrapAsync(async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    req.flash("success" , "Listing Updated!");
    res.redirect("/listings");
}));

//Delete routes
router.delete("/:id", isLoggedIn,isOwner, wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
