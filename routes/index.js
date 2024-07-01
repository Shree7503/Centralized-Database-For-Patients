var express = require("express");
const { ObjectId } = require('mongodb');
var router = express.Router();
const userModel = require("./users");
const patientModel = require("./patientModel");
const appointmentModel = require("./appointmentModel");
const prescriptionModel = require("./prescription");
const otpModel = require("./otp");
const pdf = require("./pdf")
const upload = require("./multer");
const passport = require("passport");
const nodemailer = require("nodemailer");
const base32 = require("base32");
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

router.get("/search", (req, res) => {
  res.render("search", { messages: req.flash("message") });
});

router.get("/report/:username", async (req, res)=>{
  const username = req.params.username;
  const data = await prescriptionModel.find({doctorUsername: username});
  console.log(data)
  res.render("prescription", {data});
});

router.get("/pdfReport/:id", async (req, res)=>{
  const userID = req.params.id;
  const data = await prescriptionModel.findById(userID);
  const doctor = await userModel.findOne({username: data.doctorUsername});
  const patient = await userModel.findOne({username: data.username});
  const file = await patientModel.findOne({username: data.username})
  const file1 = file.uploadedFile;
  console.log(file1);
  const file2 = file1.replace(/\.\//g, "/");
  console.log(file2)
  const medicationInfo = {
    drug: seperate(data.medication.toString()),
    dosage: seperate(data.dosage.toString()),
    frequency: seperate(data.frequency.toString()),
    info: seperate(data.instructions.toString()),
    date: data.date,
    precautions: data.precautions,
  }
  function seperate(a) {
    const cleanedString = a.replace(/\nundefined/g, '');
    return cleanedString.split(",").map(medication => medication.trim());
  }
  res.render("report", {data: medicationInfo, doctor: doctor, patient: patient, file2: file2});
});

router.get("/prescriptionForm", (req, res)=>{
  res.render("prescriptionForm", {
    message: req.flash("message")
  });
});

router.post("/submitPrescription", async (req, res)=>{
  const doctor = await userModel.findOne({username: req.session.passport.user});
  const newPrescription = new prescriptionModel({
    date: req.body.date,
    username: req.body.username,
    doctorUsername: req.session.passport.user,
    doctorName: doctor.name,
    medication: req.body.medication,
    genericName: req.body.genericName,
    strength: req.body.strength,
    form: req.body.form,
    dosage: req.body.dosage,
    frequency: req.body.frequency,
    indication: req.body.indication,
    instructions: req.body.instructions,
    duration: req.body.duration,
    precautions: req.body.precautions
  });
  await newPrescription.save();
  req.flash("message", "Prescirption Submitted!");
  res.redirect("/prescriptionForm");
});

router.get("/report-generate/:id", pdf.generatePdfPrescription);

router.post("/generateOTP", async (req, res) => {
  const secret = Math.floor(10000 + Math.random() * 90000);
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 5);
  const otpSecret = base32.encode(secret.toString());
  const otpExpiration = expirationTime;

  const newotpData = new otpModel({
    username: req.user.username,
    otpSecret: otpSecret,
    otpExpiration: otpExpiration,
  });
  await newotpData.save();

  sendEmailAlert(req.body.email, secret);
  res.redirect("/patientDashboard");
});

router.get("/updatePatient/:id", async (req, res) => {
  patientModel.findById(req.params.id).then((user) => {
    res.render("updatePatient", { user });
  });
});

router.put("/updateForm/:id", async (req, res) => {
  const updatedPatient = await patientModel.findByIdAndUpdate(
    req.params.id,
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
  const user = userModel.findOne({ username: req.session.passport.user });

  if (user.user_type === "doctor") {
    const username = req.session.username;
    getUserData(username).then((data) => {
      res.render("historyDisplay", {
        data,
        successMessage: req.flash("successMessage"),
        failureMessage: req.flash("failureMessage"),
      });
    });
  } else {
    const username = req.session.passport.user;
    getUserData(username).then((data) => {
      res.render("historyDisplay", {
        data,
        successMessage: req.flash("successMessage"),
        failureMessage: req.flash("failureMessage"),
      });
    });
  }
});

router.post("/join", async (req, res) => {
  const username = req.body.username;
  const otp = req.body.otp;
  const user = await otpModel.findOne({ username: username });

  if (user === null) {
    req.flash("message", "Incorrect Username, User not found!");
    res.redirect("/search");
  }
  const decodedotpSecret = base32.decode(user.otpSecret);
  if (
    !decodedotpSecret ||
    !user.otpExpiration ||
    user.otpExpiration < new Date()
  ) {
    req.flash("message", "OTP expired or not generated");
    res.redirect("/search");
  }
  if (otp === decodedotpSecret) {
    req.session.username = username;
    res.redirect("/displayHistory");
  } else {
    req.flash("message", "Incorrect OTP");
    res.redirect("/search");
  }
});

router.get("/viewAppointment", async (req, res) => {
  const appointments = await appointmentModel.find({
    doctorName: req.session.passport.user,
  });
  res.render("appointmentDoctor", { appointments });
});

router.post("/accept", async (req, res) => {
  const appointments = await appointmentModel.find({
    doctorName: req.session.passport.user,
  });
  console.log(appointments);
  const patient = await userModel.findOne({ username: appointments.username });
  console.log(patient);
  const doctor = await userModel.findOne({
    username: req.session.passport.user,
  });
  console.log(doctor);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "nirvancareonline@gmail.com",
      pass: "hqvxwdcgpfstjdyg",
    },
  });
  const mailOptions = {
    from: { name: doctor.name, address: "nirvancareonline@gmail.com" },
    to: req.body.email,
    subject: "Appointment Accepted",
    text: req.body.time,
  };

  transporter.sendMail(mailOptions).then(() => {
    console.log("Mail Sent");
  });

  res.redirect("/viewAppointment");
});

router.post("/reject", async (req, res) => {
  const appointments = await appointmentModel.find({
    doctorName: req.session.passport.user,
  });
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "nirvancareonline@gmail.com",
      pass: "hqvxwdcgpfstjdyg",
    },
  });

  const name = "Dr. " + req.body.name;

  const mailOptions = {
    from: { name: name, address: "nirvancareonline@gmail.com" },
    to: req.body.email,
    subject: "Appointment Rejection",
    text: req.body.reason,
  };

  transporter.sendMail(mailOptions).then(() => {
    console.log("Mail Sent");
  });

  res.redirect("/viewAppointment");
});

router.get("/appointment", isLoggedIn, async (req, res) => {
  const getDoctors = await userModel.find({ user_type: "doctor" });
  res.render("appointment", {
    getDoctors,
    successMessage: req.flash("successMessage"),
  });
});

router.delete("/deleteAppointment/:id", async (req, res)=>{
   const userID = req.params.id;
   await appointmentModel.deleteOne({_id: new ObjectId(userID)});
   res.redirect("/viewAppointment");
})

router.post("/bookAppointment" ,async (req, res) => {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const newAppointment = new appointmentModel({
    username: user.username,
    name: user.name,
    doctorName: req.body.doctorName,
    problem: req.body.problem,
    date: req.body.date,
  });

  await newAppointment.save();
  console.log(newAppointment);
  req.flash(
    "successMessage",
    "Your appointment request has been successfully forwarded to your doctor. You can expect updates via email."
  );
  res.redirect("/appointment");
});

router.post(
  "/patientForm",
  upload.single("scan"),
  isLoggedIn,
  async (req, res) => {
    try {
      formData = req.body;
     await userModel.updateOne(
        {
          username: req.body.username,
        },
        {
          $set: { insurance: req.body.insurance },
        }
      );
      const doctor = await userModel.findOne({username: req.user.username});
      console.log(req.session.passport.user);
      console.log(doctor);
      const newPatient = new patientModel({
        username: formData["username"],
        doctorName: doctor.name,
        doctorUsername: doctor.username,
        bloodGroup: formData["bloodGroup"],
        hospitalName: formData["hospital-name"],
        location: formData["location"],
        department: formData["department"],
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
    phone: req.body.number,
    address: req.body.address,
    gender: req.body.gender,
    dob: req.body.dob,
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

const getUserData = async (username) => {
  try {
    const user = await userModel.findOne({ username: username });
    if (user) {
      const data = await userModel.aggregate([
        {
          $match: {
            username: username,
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
function sendEmailAlert(email, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "nirvancareonline@gmail.com",
      pass: "hqvxwdcgpfstjdyg",
    },
  });

  const mailOptions = {
    from: { name: "NirvanCare", address: "nirvancareonline@gmail.com" },
    to: email,
    subject: "Your OTP Token",
    text: `Your OTP token is: ${token}`,
  };

  transporter.sendMail(mailOptions).then(() => {
    console.log("Mail Sent");
  });
}

setInterval(async () => {
  await otpModel.deleteMany({ otpExpiration: { $lt: new Date() } });
}, 60000);

module.exports = router;
