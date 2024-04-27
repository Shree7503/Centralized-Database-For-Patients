const { name } = require("ejs");
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/NirvanCare")
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Connection error:", err));

const authSchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  user_type: String,
  address: String,
  dob: Date,
  mobile_no: Number,
});

authSchema.plugin(plm);

module.exports = mongoose.model("user", authSchema);