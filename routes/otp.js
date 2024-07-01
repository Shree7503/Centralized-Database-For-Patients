const mongoose = require("mongoose");

const otpSchema = mongoose.Schema({
    username: String,
    otpSecret: String,
    otpExpiration: String
});

module.exports = mongoose.model("otp", otpSchema);