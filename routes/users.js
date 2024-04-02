const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/NirvanCare")
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Connection error:", err));

const userSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  hospital: String,
  specialization: String,
});
userSchema.plugin(plm);

const doctorModel = mongoose.model("User", userSchema);

module.exports = doctorModel;
