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

const exerciseSchema = new mongoose.Schema({
  // _id: { type: mongoose.Schema.Types.ObjectId, ref: "id" },
  userid: String,
  username: String,
  description: String,
  duration: Number,
  date: String,
});

let Exercise = mongoose.model("Exercise", exerciseSchema);

//creating a new user
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

//getting all users from the database
app.get("/api/users", async function (req, res) {
  User.find({})
    .select("username _id")
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      res.status(error.status);
    });
});

//adding exercise field
app.post("/api/users/:_id/exercises", async function (req, res) {
  const _id = req.params._id;
  let { description, duration, date } = req.body;
  // console.log("request body");
  // console.log(req.body);

  // if (!date) {
  //   date = new Date();
  // }
  // date = date ? new Date(date).toDateString() : new Date().toDateString();
  console.log(date);
  try {
    const user = await User.findById(_id);
    if (!user) return res.json({ error: "User not found" });

    const exercise = new Exercise({
      userid: user._id,
      username: user.username,
      description,
      duration,
      date: req.body.date
        ? new Date(req.body.date).toDateString()
        : new Date().toDateString(),
    });
    exercise
      .save()
      .then((exercise) => {
        res.json({
          _id: exercise.userid,
          username: exercise.username,
          description: exercise.description,
          duration: exercise.duration,
          date: exercise.date,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users/:_id/logs", async function (req, res) {
  const _id = req.params._id;
  let log;
  const user = await User.findById(_id);
  Exercise.find({ userid: _id })
    .select("-__v")
    .then((users) => {
      log = {
        username: user.username,
        count: users.length,
        _id: user._id,
        log: users,
      };

      res.send(log);
      // console.log(users);
      // console.log(log);
    });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
