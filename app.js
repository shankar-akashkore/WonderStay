const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingsSchemas,reviewSchemas} = require("./schema.js");
const Review = require("./models/review.js");
const { wrap } = require("module");

const MONGO_URL = "mongodb://127.0.0.1:27017/WonderStay";

main().then(() => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
})
async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/" , (req,res) => {
    res.send("Hi this is HarHari");
});


const validateListing = (req,res,next) => {
    let {error} = listingsSchemas.validate(req.body);
    if(error) {
        let errMeg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMeg);
    } else {
        next();
    }
};

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

//index routing
app.get("/listings", wrapAsync(async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
}));

//New routes
app.get("/listings/new",(req,res) => {
    res.render("listing/new");
})

//show routes
app.get("/listings/:id", wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listing/show" , { listing });
}));

//Create routes
app.post("/listings",wrapAsync(async (req,res,next) => {
    let result = listingsSchemas.validate(req.body);
    console.log(result); 
    const { error } = listingsSchemas.validate(req.body);
    if (error) {
      throw new ExpressError(error.details[0].message, 400);
    }
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
})
);


//edit routes
app.get("/listings/:id/edit",wrapAsync(async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit" , {listing});
}));

//update routes
app.put("/listings/:id",wrapAsync(async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{ ...req.body.listing});
    res.redirect("/listings");
}));

//Delete routes
app.delete("/listings/:id",wrapAsync(async (req,res) => {
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
}));


//Review POST
app.post("/listings/:id/reviews",validatereview , wrapAsync(async(req,res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    console.log("new review saves");
    res.redirect(`/listings/${listing._id}`);
}));


//Review Delete
app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res) => {
    let {id,reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}))
// app.get("/testListing" , async(req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By near the Beach",
//         price: 1600,
//         location: "Panji,Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful testing");
// });

app.use((req,res,next) => {
    next(new ExpressError("Page not found",404))
})

app.use((err,req,res,next) => {
    let status = err.status || 500;
    let message = err.message || "Something went wrong";
    // let {status=500,message="page not found"} = err;
    // res.status(status).send(message);
    res.status(status).render("error", {message})
})
app.listen(6060, () => {
    console.log("port is running 6060")
})

