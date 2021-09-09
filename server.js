var express = require("express"),
  app = express(),
  expressSanitizer = require("express-sanitizer"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  seedDB = require("./seeds"),
  methodOverride = require("method-override"),
  port = 3000;

//hiding Password in an environment variable
var { dbURL } = require("./config");

//requring models
var User = require("./models/user");

//requring routes
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");

//set up the connection
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connected to Camping Paradise DB.");
  })
  .catch((err) => {
    console.log("ERROR: ", err.message);
  });

// Added to fix a warning from mongoose side
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// seed the DB
// seedDB();

// require moments
app.locals.moment = require("moment");

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "When the moon hits your eye like a big pizza pie...",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || port, () => {
  console.log("Camping Paradise server is up and running");
});
