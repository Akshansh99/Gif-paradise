var mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    url: String,
    uploader: String,
    uploaderID: String,
    category: String,
    views: Number
});

module.exports = mongoose.model("post", postSchema);