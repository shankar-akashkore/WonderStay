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
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

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

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
};

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.get("/" , (req,res) => {
    res.send("Hi this is HarHari");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/demouser",async(req,res) => {
    let fakeUser = new User({
        email:"shiva@gmail.com",
        username:"shiva",
    });

    let registeredUser = await User.register(fakeUser,"harhari");
    res.send(registeredUser);
});

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

app.use((req,res,next) => {
    next(new ExpressError("Page not found",404))
});

app.use((err,req,res,next) => {
    let status = err.status || 500;
    let message = err.message || "Something went wrong";
    res.status(status).render("error", {message})
});

app.listen(6060, () => {
    console.log("port is running 6060")
});


