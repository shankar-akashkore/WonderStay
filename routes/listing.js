const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Listing = require("../models/listing.js");

const validateListing = (req,res,next) => {
    let {error} = listingsSchemas.validate(req.body);
    if(error) {
        let errMeg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(errMeg,400);
    } else {
        next();
    }
};

//index routing
router.get("/", wrapAsync(async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
}));

//New routes
router.get("/new",(req,res) => {
    res.render("listing/new");
})

//show routes
router.get("/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    res.render("listing/show" , { listing });
}));

//Create routes
router.post("/",wrapAsync(async (req,res,next) => {
    let result = listingsSchemas.validate(req.body);
    console.log(result); 
    const { error } = listingsSchemas.validate(req.body);
    if (error) {
      throw new ExpressError(error.details[0].message, 400);
    }
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    req.flash("success" , "New Listing Added!");
    res.redirect("/listings");
})
);

//edit routes
router.get("/:id/edit",wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    res.render("listing/edit" , {listing});
}));

//update routes
router.put("/:id",wrapAsync(async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    req.flash("success" , "Listing Updated!");
    res.redirect("/listings");
}));

//Delete routes
router.delete("/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}));

module.exports = router;
