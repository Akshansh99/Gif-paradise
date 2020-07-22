/*
MODEL FOR USER AUTHENTICATION
mongoose and passport-local-mongoose used here
*/

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const post = require("./post");


const userSchema = new mongoose.Schema({
    googleId: String,
    googleName: String,
    username: String,
    password: String,
    posts: [post.schema.obj]
});

userSchema.plugin(passportLocalMongoose);
//console.log(post.schema.obj);
module.exports = mongoose.model("User", userSchema);