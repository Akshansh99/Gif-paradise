const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));


//Landing page 
app.get("/", (req, res) => {
    res.render("landing");
});

//register page
app.get("/register", (req, res) => {
    res.render("register");
});


//Login page
app.get("/login", (req, res) => {
    res.render("login");
});




app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started Successfully at :3000');
});