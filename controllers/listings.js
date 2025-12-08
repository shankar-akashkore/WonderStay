const Listing = require("../models/listing.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");


module.exports.index = async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
};

module.exports.renderNewForm = (req,res) => {
    res.render("listing/new");
};

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author"},}).populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listing/show" , { listing });
};

module.exports.createListing = async (req,res,next) => {
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
};

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exists");
        return res.redirect("/listings");
    }
    res.render("listing/edit" , {listing});
};

module.exports.updateListing = async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    req.flash("success" , "Listing Updated!");
    res.redirect("/listings");
};

module.exports.destroyListing = async (req,res) => {
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    req.flash("success" , "Listing Deleted!");
    res.redirect("/listings");
}