const { name } = require("ejs");
const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
const link = "mongodb+srv://Shree7503:e3vUmbsHfvRnXT9J@nirvancare.noooghn.mongodb.net/?retryWrites=true&w=majority&appName=NirvanCare"
mongoose
  .connect(link)
  .then(() => console.log("Connected"))
  .catch((err) => console.error("Connection error:", err));

const authSchema = mongoose.Schema({
  name: String,
  username: String,
  email: String,
  password: String,
  phone: String,
  gender: String,
  user_type: String,
  address: String,
  dob: Date,
  mobile_no: Number,
  insurance: String,
});

authSchema.plugin(plm);

module.exports = mongoose.model("user", authSchema);