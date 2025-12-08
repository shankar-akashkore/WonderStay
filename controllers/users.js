const User = require("../models/user.js");
 
module.exports.renderSignupForm = (req,res) => {
    res.render("user/signup");
};

module.exports.signup = async(req,res) => {
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        console.log(registeredUser);
        req.login(registeredUser,(err) => {
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to WonderStay");
            res.redirect("/listings");
        });
    } catch(e) {
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req,res) => {
    res.render("user/login");
};

module.exports.login =  async (req, res) => {
    req.flash("success", "Welcome back!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success","You have been Logout!");
        res.redirect("/listings");
    });
};