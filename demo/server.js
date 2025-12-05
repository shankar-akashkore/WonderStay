const { name } = require("ejs");
const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");

app.use(session({secret : "mysupersecretstring", resave: false, saveUninitialized: true}));
app.use(flash());

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname, "views"));

app.use((req,res,next) => {
    res.locals.successMsg = req.flash("success");
    res.locals.errorMsg = req.flash("error");
    next();
});

app.get("/test",(req,res) => {
    res.send("test successful");
});

app.get("/user",(req,res) => {
    let {name = "Harhari"} = req.query;
    req.session.name = name;
    if(name === "Harhari"){
        req.flash("error","user not register");
    } else {
        req.flash("success","user rigester successfully");
    }
    res.redirect("/hello")
});

app.get("/hello",(req,res) => {
    res.render("page.ejs",{name : req.session.name});
});

// app.get("/countset",(req,res) => {
//     if(req.session.count){
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`You have sent a request ${req.session.count} times`);
// })

app.listen(5005,() => {
    console.log("Port is running");
});