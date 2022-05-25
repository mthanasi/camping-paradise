var express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  passport = require("passport"),
  flash = require("connect-flash"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer");

var port = 3000 || process.env.PORT;

// DB seeding
// var seedDB = require("./config/seeds");
// seedDB();

// models
var User = require("./models/user"),
  Comment = require("./models/comment"),
  Campground = require("./models/campground");

// routes
var indexRoutes = require("./routes/index"),
  reviewRoutes = require("./routes/reviews"),
  commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds");

// mongoose setup
var { DB_URL, PASSPORT_SECRET } = require("./config/setup");

mongoose
  .connect(DB_URL, {
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

// mongoose warning fix
mongoose.set("useFindAndModify", false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require("moment");

// auth passport setup
app.use(
  require("express-session")({
    secret: PASSPORT_SECRET,
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
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(port, () => {
  console.log("Camping Paradise server is up and running");
});
