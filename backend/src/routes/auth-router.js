const express = require("express");
const router = express.Router();
const auth = require("../auth");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const Key = require("../model/Key");
const nodemailer = require("nodemailer");

const STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FAILED: 400,
  SERVER_ERROR: 500,
};

let transporter = nodemailer.createTransport({
  host: "mapsunited.live",
  port: 587,
  sendmail: true,
  newline: "unix",
});

router.get("/loggedIn", async (req, res) => {
  try {
    let userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(STATUS.SUCCESS).json({
        loggedIn: false,
        user: null,
        errorMessage: "?",
      });
    }

    const loggedInUser = await User.findOne({ _id: userId });
    console.log("loggedInUser: " + loggedInUser);

    return res.status(STATUS.SUCCESS).json({
      loggedIn: true,
      user: {
        username: loggedInUser.username,
        email: loggedInUser.email,
      },
    });
  } catch (err) {
    console.log("err: " + err);
    res.json(false);
  }
});

router.post("/register", async (req, res) => {
  try {
    // filter out the request for this information
    const { username, email, password } = req.body;

    // if these values aren't present, error and prompt the user to type in all the fields
    if (!username || !email || !password) {
      return res
        .status(STATUS.FAILED)
        .json({ errorMessage: "Please enter all required fields." });
    }

    // checking to see if there exists a user with existing email address
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(STATUS.FAILED).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    // checks to see if there exist a user with existing username
    const existingUsername = await User.findOne({ username: username });
    if (existingUsername) {
      return res.status(STATUS.FAILED).json({
        success: false,
        errorMessage: "An account with this username already exists.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    console.log("passwordHash: " + passwordHash);

    const newUser = new User({
      username,
      email,
      passwordHash,
    });

    const savedUser = await newUser.save();
    console.log("new user saved: " + savedUser._id);

    // LOGIN THE USER
    const token = auth.signToken(savedUser);
    console.log("token:" + token);

    await res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(STATUS.SUCCESS)
      .json({
        success: true,
        user: {
          username: savedUser.username,
          email: savedUser.email,
        },
      });

    console.log("token sent");
  } catch (err) {
    console.error(err);
    res.status(STATUS.SERVER_ERROR).send();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check is email is a valid account
    // if these values aren't present, error and prompt the user to type in all the fields
    if (!email || !password) {
      return res
        .status(STATUS.FAILED)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(STATUS.UNAUTHORIZED).json({
        errorMessage: "Account not found",
      });
    }

    console.log(password);
    console.log(existingUser.passwordHash);

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      return res.status(STATUS.UNAUTHORIZED).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    // LOGIN THE USER
    const token = auth.signToken(existingUser);
    console.log(token);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(STATUS.SUCCESS)
      .json({
        success: true,
        user: {
          username: existingUser.username,
          email: existingUser.email,
        },
      });
  } catch (err) {
    console.error(err);
    res.status(STATUS.SERVER_ERROR).send();
  }
});

router.get("/logout", async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .send();
});

router.post("/sendemail", async (req, res) => {
  const { email } = req.body;
  const key = Date.now();

  const existingUser = await User.findOne({ email: email });
  if (!existingUser) {
    return res.status(STATUS.FAILED).json({
      errorMessage: "Account not found.",
    });
  }

  const newKey = new Key({ key: key, email: email });
  await newKey.save();

  let resetLink =
    "https://maps-united.vercel.app/resetpassword?key=" +
    encodeURIComponent(key);

  transporter.sendMail({
    to: email,
    from: '"Maps United" <root@mapsunited>',
    subject: "Password Reset",
    text: resetLink,
    textEncoding: "quoted-printable",
  });

  res.status(STATUS.SUCCESS).send();
});

router.post("/resetpassword", async (req, res) => {
  const { password, key } = req.body;
  const keyEntry = await Key.findOne({ key: key });
  console.log(key);
  console.log(keyEntry.email);

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  console.log(passwordHash);

  const user = await User.findOneAndUpdate(
    { email: keyEntry.email },
    { passwordHash: passwordHash },
    { new: true }
  );
  console.log(user);

  await Key.deleteOne({ key: key });

  res.status(STATUS.SUCCESS).send();
});

module.exports = router;
