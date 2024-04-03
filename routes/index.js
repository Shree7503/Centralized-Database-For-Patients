var express = require("express");
var router = express.Router();
const doctorModel = require("./users");
const patientModel = require("./patientModel");
const passport = require("passport");
const localStrategy = require("passport-local").Strategy;

const doctorStrategy = new localStrategy(doctorModel.authenticate());
const patientStrategy = new localStrategy(patientModel.authenticate());

passport.use("doctor", doctorStrategy);
passport.use("patient", patientStrategy);

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("intro");
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/login2", (req, res) => {
  res.render("login2");
});

router.get("/doctorProfile", isLoggedIn, (req, res) => {
  res.render("doctor");
});

router.get("/patientProfile", isLoggedIn, (req, res) => {
  res.render("patientProfile");
});

router.post("/register/doctor", (req, res) => {
  const doctordata = new doctorModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    hospital: req.body.hospital,
    specialization: req.body.specialty,
  });
  doctorModel
    .register(doctordata, req.body.password)
    .then(function (registeredDoctor) {
      res.redirect("/doctorProfile");
    });
});

router.post(
  "/login/doctor",
  passport.authenticate("doctor", {
    successRedirect: "/doctorProfile",
    failureRedirect: "/",
  }),
  (req, res) => {}
);

router.post("/register/patient", (req, res) => {
  const userdata = new patientModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });

  patientModel
    .register(userdata, req.body.password)
    .then(function (registeredPatient) {
      res.redirect("/patientProfile");
    });
});

router.post(
  "/login/patient",
  passport.authenticate("patient", {
    successRedirect: "/patientProfile",
    failureRedirect: "/",
  }),
  (req, res) => {}
);

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
