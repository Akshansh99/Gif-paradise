const express = require("express");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Home Route Working");
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server Started Successfully at :3000');
});