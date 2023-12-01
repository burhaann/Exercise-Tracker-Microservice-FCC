const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log("Your app is listening on port " + listener.address().port);
    });

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

let userModel = mongoose.model("User", userSchema);

app.post("/api/users", function (req, res) {
  // const username = req.body.username;
  console.log(req);
  console.log(req.body);

  const mongoUser = new userModel({
    username: username,
  });
  mongoUser.save();
});

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });
