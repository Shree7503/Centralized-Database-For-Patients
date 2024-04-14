var express = require("express");
var router = express.Router();
const userModel = require("./users");
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

router.get("/patientProfile", isLoggedIn, (req, res) => {
  res.render("patientProfile");
});

router.post("/register", (req, res) => {
  var userData = new userModel({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
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
