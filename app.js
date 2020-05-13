/* Required dependencies*/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

//Basic configurations for views and mongoDB
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect('mongodb://localhost:27017/gif-paradise', { useNewUrlParser: true, useUnifiedTopology: true });


//Auth settings
//Dependencies used here:
//passport, passport-local, passport-local-mongoose,
//express-session
app.use(require('express-session')({
    secret: "Best gif website in the world!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware to pass user information , i.e, username,etc
//to all routes
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

/*
=======================
        ROUTES
=======================
*/

//Landing Page
//Most of the routes redirect here
app.get("/", (req, res) => {
    res.render("landing");
});

//Register page-GET route
//Refer comments below for isNotLoggedIn function
app.get("/register", isNotLoggedIn, (req, res) => {
    res.render("register");
});

//Register page-POST route
app.post("/register", (req, res) => {
    // Storing username to variable
    const userInfo = new User({ username: req.body.username });
    //Required function to register new user
    User.register(userInfo, req.body.password, (err, user) => {
        if (err) {
            //If error occurs err message is printed to console
            //and redirected back to register(GET) route
            console.log(err);
            res.redirect("/register");
        }
        //On successful registeration, we are redirected to
        // "/" route
        passport.authenticate("local")(req, res, () => {
            res.redirect("/");
        });
    });
});


//Login(GET) page
//Refer comments below for isNotLoggedIn function
app.get("/login", isNotLoggedIn, (req, res) => {
    res.render("login");
});

//Login(GET) page
app.post("/login", passport.authenticate("local", {
    //This is a middleware to authenticate already registered
    //user. If login is successful, we are redirected to "/"
    //else to "/login" again
    successRedirect: "/",
    failureRedirect: "/login"
}), (req, res) => {
    //Serves no real purpose
    //Can be removed if wanted
});


//Logout route
app.get("/logout", (req, res) => {
    //Redirected to "/"
    req.logout();
    res.redirect("/");
});


//Middleware to check if the user is logged in
//Can be used to check for authentication
//before adding post, viewing profile,
//commenting, etc
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}


/*
==========
IMPORTANT
========== 
This middleware checks if the user is logged in, it redirects to
homepage("/" route in this case), else the function completes it
usual task.
This is used to prevent the access of login and register page to already 
logged-in user. The user has to log out to use these pages.
*/
function isNotLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    } else {
        return next();
    }
}

//Test route for trying above middleware
//go to "/secret" route
app.get("/secret", isLoggedIn, (req, res) => {
    res.send("Secret Page yoohoo");
});

//Server setup
app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started Successfully at :3000');
});