/* Required dependencies*/
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const post = require("./models/post")

//Basic configurations for views and mongoDB
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
// mongoose.connect('mongodb://localhost:27017/gif-paradise', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://Gif-paradise:gifparadise123@cluster0-2h4su.mongodb.net/test?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to DB!')
}).catch(err => {
    console.log('Error:', err.message);
});

//Auth settings
//Dependencies used here:
//passport, passport-local, passport-local-mongoose,
//express-session
app.use(express.static(__dirname + "/public"));
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
app.get("/", async(req, res) => {
    // post.find({}, (err, postcreated) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("landing", {
    //             post: postcreated
    //         });
    //     }
    // });

    try {
        const postFound = await post.find({});
        // console.log(postFound);
        res.render("landing", {
            post: postFound
        });

    } catch (err) {
        console.log(err);
    }


});

//CATEGORY ROUTES 
app.post("/categories", (req, res) => {
    console.log(req.body.category);
    post.find({
        category: req.body.category
    }, (err, allPosts) => {
        if (err) {
            console.log(err);
        } else {
            res.render("category/category", {
                posts: allPosts
            });
        }
    });
    // post.find({
    //     category: req.body.
    // })

});

//Finding gifs by their unique ids
app.get("/posts/:id/:title", async(req, res) => {

    // post.findById(req.params.id, (err, foundPost) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("gifs/show", {
    //             post: foundPost
    //         });
    //     }
    // });


    try {
        const foundPost = await post.findById(req.params.id);
        const updateViews = await post.findOneAndUpdate({ "_id": req.params.id }, { $inc: { "views": 1 } }, { returnNewDocument: true });
        // console.log(updateViews);
        res.render("gifs/show", {
            post: foundPost,
            viewUp: updateViews
        })
    } catch (err) {
        console.log(err);
    }

});

//Adding new posts
//Get route
app.get("/add", isLoggedIn, (req, res) => {
    res.render("./gifs/new");
});

//Adding new posts
//Post route
app.post("/add", async(req, res) => {
    const postObject = {
            title: req.body.title,
            url: req.body.url,
            uploader: req.user.username,
            uploaderID: req.user._id,
            category: req.body.category,
            views: 1
        }
        // console.log(req.body.category);

    //================================
    //ASYNC AWAIT (Best)
    //===============================
    try {
        const userLogged = await User.findById(req.user._id);
        const postcreate = await post.create(postObject);
        const postMade = await userLogged.posts.push(postcreate);
        const postLinked = await userLogged.save();
        // console.log(postLinked);
        res.redirect("/");
    } catch (err) {
        console.log(err);
    }

    //=============================
    //PROMISES (Better)
    //============================
    // const id = req.user._id;
    // User.findById(req.user._id)
    //     .then(user => {
    //         post.create(postObject).
    //         then(postAdded => {
    //                 user.posts.push(postAdded);
    //                 console.log(postAdded);
    //                 user.save();
    //             })
    //             .catch(err1 => {
    //                 console.log(err1);
    //             })
    //     })
    //     .then(postLinked => {
    //         console.log(postLinked);
    //         res.redirect("/");
    //     })
    //     .catch(err => {
    //         console.log(err);
    //     })


});

//===========================
//CALLBACKS(Worst)
//===========================

// User.findById(req.user._id, (err, user) => {
//     if (err) {
//         console.log(err);
//     } else {
//         post.create(postObject, (err, postAdded) => {
//             if (err) {
//                 console.log(err);
//             } else {
//                 user.posts.push(postAdded);
//                 user.save((err, postLinked) => {
//                     if (err) console.log(err);
//                     else console.log(postLinked);
//                 });
//                 console.log(postAdded);
//                 res.redirect("/");
//             }
//         });
//     }
// });


//Register page-GET route
//Refer comments below for isNotLoggedIn function
app.get("/register", isNotLoggedIn, (req, res) => {
    res.render("register");
});

//Register page-POST route
app.post("/register", async(req, res) => {
    // Storing username to variable
    const userInfo = new User({
        username: req.body.username
    });
    //Required function to register new user
    // User.register(userInfo, req.body.password, (err, user) => {
    //     if (err) {
    //         //If error occurs err message is printed to console
    //         //and redirected back to register(GET) route
    //         console.log(err);
    //         res.redirect("/register");
    //     }
    //     //On successful registeration, we are redirected to
    //     // "/" route
    //     passport.authenticate("local")(req, res, () => {
    //         res.redirect("/");
    //     });
    // });

    try {
        const userRegister = await User.register(userInfo, req.body.password);
        const authSuccess = await passport.authenticate("local");
        res.redirect("/");
    } catch (err) {
        res.redirect("/register");
        console.log(err);
    }
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

//Profile page for a user 
app.get("/user/:userID/:username", async(req, res) => {
    // User.findById(req.params.userID, (err, foundUser) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("user/profile", {
    //             user: foundUser
    //         });
    //         // console.log(foundUser);
    //     }
    // });

    try {
        const foundUser = await User.findById(req.params.userID);
        res.render("user/profile", {
            user: foundUser
        });
        console.log(foundUser);
    } catch (err) {
        console.log(err);
    }

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