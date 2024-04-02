var express = require("express");
var router = express.Router();
const doctorModel = require("./users");
const patientModel = require("./patientModel");
const passport = require("passport");
const localStrategy = require("passport-local");

passport.use(new localStrategy(doctorModel.authenticate()));
passport.use(new localStrategy(patientModel.authenticate()));

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

router.get("/profile", (req, res) => {
  res.render("doctor");
});

router.get("/patientProfile", (req, res) => {
  res.render("patientProfile");
});

router.post("/register", (req, res) => {
  const userdata = new doctorModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    hospital: req.body.hospital,
    specialization: req.body.specialty,
  });
  doctorModel
    .register(userdata, req.body.password)
    .then(function (registeredDoctor) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/profile");
      });
    });
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
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

router.post("/register1", (req, res) => {
  const userdata = new patientModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
  });

  patientModel
    .register(userdata, req.body.password)
    .then(function (registeredPatient) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/patientProfile");
      });
    });
});

router.post(
  "/login1",
  passport.authenticate("local", {
    successRedirect: "/patientProfile",
    failureRedirect: "/",
  }),
  (req, res) => {}
);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
