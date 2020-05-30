var mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    url: String,
    uploader: String,
    uploaderID: String
});

module.exports = mongoose.model("post", postSchema);