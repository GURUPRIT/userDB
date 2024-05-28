const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// Define the uploads directory
const uploadsDir = "/uploads"; // Change this to your actual uploads directory

// Multer setup for file storage
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "." + uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload = multer({
  storage: storage,
}).single("image");

// Route to add a new user
router.post("/add", upload, async (req, res) => {
  const user = new User({
    name: req.body.name,
    summary: req.body.summary,
    image: req.file.filename,
  });
  try {
    await user.save();
    req.session.message = {
      type: "success",
      message: "User added successfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

// Route to display the home page
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", {
      title: "Home Page",
      users: users,
      uploadsDir: uploadsDir,
    });
  } catch (err) {
    res.json({ message: err.message });
  }
});

// Route to display the form for adding a new user
router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// Route to edit a user (converted to async/await)
router.get("/edit/:id", async (req, res) => {
  let id = req.params.id;
  try {
    const user = await User.findById(id);
    if (user == null) {
      res.redirect("/");
    } else {
      res.render("edit_users", {
        title: "Edit Users",
        user: user,
      });
    }
  } catch (err) {
    res.redirect("/");
  }
});

// Route to update a user
router.post("/update/:id", upload, async (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.error(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  try {
    await User.findByIdAndUpdate(id, {
      name: req.body.name,
      summary: req.body.summary,
      image: new_image,
    });

    req.session.message = {
      type: "success",
      message: "User updated successfully!",
    };
    res.redirect("/");
  } catch (err) {
    res.json({ message: err.message, type: "danger" });
  }
});

router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndDelete(id);

    if (user && user.image) {
      fs.unlinkSync("./uploads/" + user.image);
    }

    req.session.message = {
      type: "success",
      message: "User deleted successfully!",
    };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.session.message = {
      type: "danger",
      message: "An error occurred while deleting the user.",
    };
    res.redirect("/");
  }
});

module.exports = router;
