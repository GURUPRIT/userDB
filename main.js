require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection
mongoose.connect(process.env.DB_URI);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session setup
app.use(
  session({
    secret: "My secret key",
    saveUninitialized: true,
    resave: false,
  })
);

// Flash messages
app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

// Static files
const uploadsDir = path.join(__dirname, "uploads");
app.use(express.static(uploadsDir));

// View engine
app.set("view engine", "ejs");

// Routes
app.use("", require("./routes/routes"));

// Start server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
