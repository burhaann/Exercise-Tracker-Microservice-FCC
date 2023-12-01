const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // const listener = app.listen(process.env.PORT || 3000, () => {
    //   console.log("Your app is listening on port " + listener.address().port);
    // });

    console.log("Connected to database ");
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to MongoDB Atlas");
});

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

const userSchema = new mongoose.Schema({
  username: String,
});

let User = mongoose.model("User", userSchema);

app.post("/api/users", async function (req, res) {
  const username = req.body.username;
  console.log(req.body.username);
  try {
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      res.json({ username: username });
    } else {
      const mongoUser = new User({
        username: username,
      });
      mongoUser.save();
      res.json(mongoUser);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.get("/api/users", async function (req, res) {
  const allUsers = await User.find({});
  console.log("All Users");
  console.log(allUsers);
  res.send(allUsers);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
