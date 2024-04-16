var express = require("express");
var router = express.Router();
const userModel = require("./users");
const patientModel = require("./patientModel");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const session = require("express-session");

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */

router.get("/", function (req, res, next) {
  res.render("intro");
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

router.get("/auth", (req, res) => {
  res.render("login");
});

router.get("/doctorProfile", isLoggedIn, (req, res) => {
  res.render("doctor");
});

router.post("/patientForm", isLoggedIn, async (req, res)=>{
  try {
    formData = req.body

    const newPatient = new Patient({
      hospitalName: formData['hospital-name'],
      location: formData['location'],
      department: formData['department'],
      admissionDate: formData['admission-date'],
      dischargeDate: formData['discharge-date'],
      reasonForVisit: formData['reason-visit'],
      diagnosis: formData['diagnosis'],
      procedures: formData['procedures'],
      treatment: formData['treatment'],
      prescription: formData['prescription'],
      // uploadedFile: req.file ? req.file.path : null 
  });
  await newPatient.save();

  } catch(err){
    console.error(err);
    res.status(500).send("Internal Server Error")
  }
})

router.get("/patientProfile", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render("patientProfile", {user});
});

router.post("/register", (req, res) => {
  var userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    address: req.body.address,
    dob: req.body.dob,
    phoneNo: req.body.number,
    user_type: req.body.user_type,
  });
  userModel.register(userData, req.body.password).then(() => {
    console.log("You have registered");
    res.redirect("/auth");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth");
}

router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/auth",
  }),
  function(req, res) {
    if(req.user.user_type === "doctor") {
      res.redirect("/doctorProfile");
    } else {
      res.redirect("/patientProfile");
    }
  }
);

module.exports = router;
