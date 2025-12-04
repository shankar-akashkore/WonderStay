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
const listing = require("./models/listing.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
 

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

