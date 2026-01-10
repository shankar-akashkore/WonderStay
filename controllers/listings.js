const { response } = require("express");
const Listing = require("../models/listing.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({accessToken: mapToken});

// module.exports.index = async (req,res) => {
//     const allListing = await Listing.find({});
//     res.render("listing/index", { allListing });
// };

module.exports.index = async (req,res) => {
    const {category} = req.query;
    let allListing;
    if(category){
        allListing = await Listing.find({category});
    } else {
        allListing = await Listing.find({});
    }

    res.render("listing/index", {
        allListing,
        currentCategory: category || ""
    });
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
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send()
    
    let url = req.file.path;
    let filename = req.file.filename;
    const { error } = listingsSchemas.validate(req.body);
    if (error) {
      throw new ExpressError(error.details[0].message, 400);
    }
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url, filename};
    newlisting.geometry = response.body.features[0].geometry
    let saveListing = await newlisting.save();
    console.log(saveListing);
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
    let listing = await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    
    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
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