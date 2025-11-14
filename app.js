const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");

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


app.get("/" , (req,res) => {
    res.send("Hi this is HarHari");
});

//index routing
app.get("/listings", async (req,res) => {
    const allListing = await Listing.find({});
    res.render("listing/index", { allListing });
});

//New routes
app.get("/listings/new",(req,res) => {
    res.render("listing/new");
})

//show routes
app.get("/listings/:id", async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/show" , { listing });
});

//Create routes
app.post("/listings",async (req,res) => {
    const newlisting = new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
});


//edit routes
app.get("/listings/:id/edit",async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listing/edit" , {listing});
});

//update routes
app.put("/listings/:id",async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
});


//Delete routes
app.delete("/listings/:id",async (req,res) => {
    let {id} = req.params;
    let deletedlisting = await Listing.findByIdAndDelete(id);
    console.log(deletedlisting);
    res.redirect("/listings");
});
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

app.listen(6060, () => {
    console.log("port is running 6060")
})

