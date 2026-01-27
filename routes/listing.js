const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing, wrapAsync(listingController.createListing));

//New routes
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));

//edit routes
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));

router.get('/search', async (req, res) => {
    try {
      const query = req.query.q || '';
      
      if (!query.trim()) {
        req.flash('error', 'Please enter a search term');
        return res.redirect('/listings');
      }
      
      // Search in title, location, and country
      const searchRegex = new RegExp(query, 'i');
      
      const allListings = await Listing.find({
        $or: [
          { title: searchRegex },
          { location: searchRegex },
          { country: searchRegex }
        ]
      });
      
      // Render index page with search results
      res.render('listings/index', { 
        allListings,
        searchQuery: query
      });
      
    } catch (error) {
      console.error('Search error:', error);
      req.flash('error', 'Something went wrong');
      res.redirect('/listings');
    }
  });

module.exports = router;
