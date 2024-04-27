var express = require("express");
var router = express.Router();
const userModel = require("./users");
const patientModel = require("./patientModel");
const appointmentModel = require("./appointmentModel");
const upload = require("./multer");
const passport = require("passport");
const { default: mongoose } = require("mongoose");
const localStrategy = require("passport-local").Strategy;

passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */

router.get("/", function (req, res, next) {
  res.render("intro");
});

router.get("/aboutus", (req, res) => {
  res.render("aboutus");
});

router.get("/auth", (req, res) => {
  res.render("login", {
    messages: req.flash("successMessage"),
    error: req.flash("error"),
  });
});

router.get("/doctorDashboard", isLoggedIn, isDoctor, (req, res) => {
  res.render("doctor");
});

router.get("/doctorProfile", (req, res) => {
  res.render("doctorProfile");
});

router.get("/search", (req, res) => {
  res.render("search", { messages: req.flash("message") });
});

router.get("/updatePatient", async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.username,
  });
  getUserData(user._id).then((data) => {
    res.render("updatePatient", {
      data,
    });
  });
});

router.put("/updateForm", async (req, res) => {
  const updatedPatient = await patientModel.findOneAndUpdate(
    { username: req.session.username },
    req.body,
    {
      new: true,
    }
  );
  if (updatedPatient) {
    req.flash("successMessage", "Updation Successful!");
    res.redirect("/displayHistory");
  } else {
    req.flash("failureMessage", "Updation Unsuccessful");
  }
});

router.get("/historyForm", isLoggedIn, isDoctor, (req, res) => {
  res.render("historyInput");
});

router.get("/displayHistory", async (req, res) => {
  const username = req.session.username;
  const userID = req.session.userID;

  getUserData(userID).then((data) => {
    res.render("historyDisplay", {
      data,
      successMessage: req.flash("successMessage"),
      failureMessage: req.flash("failureMessage"),
    });
  });
});

router.post("/join", async (req, res) => {
  const username = req.body.username;
  const userID = String(req.body.userID);
  const user = await userModel.findOne({ username: req.body.username });
  if (user === null) {
    req.flash("message", "Incorrect Username or UserID");
    res.redirect("/search");
  } else {
    req.session.username = username;
    req.session.userID = userID;
    res.redirect("/displayHistory");
  }
});

router.get("/appointment", async (req, res)=>{
  const getDoctors = await userModel.find({user_type: "doctor"})
  res.render("appointment", { getDoctors });
});

router.post("/bookAppointment", (req, res)=>{
  console.log(req.body);
})

router.post(
  "/patientForm",
  upload.single("scan"),
  isLoggedIn,
  async (req, res) => {
    try {
      formData = req.body;

      const newPatient = new patientModel({
        username: formData["username"],
        hospitalName: formData["hospital-name"],
        location: formData["location"],
        department: formData["department"],
        insurance: FormData["insurance"],
        admissionDate: formData["admission-date"],
        dischargeDate: formData["discharge-date"],
        reasonForVisit: formData["reason-visit"],
        diagnosis: formData["diagnosis"],
        procedures: formData["procedures"],
        treatment: formData["treatment"],
        prescription: formData["prescription"],
        uploadedFile: `./images/uploads/${req.file.filename}`,
      });
      await newPatient.save();
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.get("/patientDashboard", isLoggedIn, async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("patientProfile", { user });
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
    req.flash(
      "successMessage",
      "Registration successful! You're all set to log in now."
    );
    res.redirect("/auth");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth");
}

function isDoctor(req, res, next) {
  if (req.user.user_type === "doctor") {
    return next();
  } else {
    res.status(401).send("Unauthorized Access");
  }
}

router.post(
  "/signin",
  passport.authenticate("local", {
    failureRedirect: "/auth",
    failureFlash: true,
  }),
  function (req, res) {
    if (req.user.user_type === "doctor") {
      res.redirect("/doctorDashboard");
    } else {
      res.redirect("/patientDashboard");
    }
  }
);

const getUserData = async (userID) => {
  try {
    const user = await userModel.findById(userID);
    if (user) {
      const data = await userModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(userID),
          },
        },
        {
          $lookup: {
            from: "patients",
            localField: "username",
            foreignField: "username",
            as: "patientDetails",
          },
        },
      ]);
      return data;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    throw new Error(`Error fetching user data: ${error.message}`);
  }
};

module.exports = router;
