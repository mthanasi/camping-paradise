var express = require("express");
var router = express.Router();

var middleware = require("../middleware");
var { cloudinary, upload } = require("../config/cloudinary.js");

var Review = require("../models/review");
var Campground = require("../models/campground");

// get all campgrounds
router.get("/", function (req, res) {
  Campground.find({}, function (err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds,
        page: "campgrounds",
      });
    }
  });
});

// add new campground to DB
router.post(
  "/",
  middleware.isLoggedIn,
  upload.single("image"),
  function (req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }

      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;

      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;

      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username,
      };

      req.body.campground.description = req.sanitize(
        req.body.campground.description
      );
      Campground.create(req.body.campground, function (err, campground) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
        res.redirect("/campgrounds/" + campground.id);
      });
    });
  }
);

// show form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

// shows more info about one campground
router.get("/:id", function (req, res) {
  //find the campground with provided ID
  Campground.findById(req.params.id)
    .populate("comments likes")
    .populate({
      path: "reviews",
      options: { sort: { createdAt: -1 } },
    })
    .exec(function (err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      } else {
        //render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

// show form to edit campground
router.get(
  "/:id/edit",
  middleware.checkCampgroundOwnership,
  function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      res.render("campgrounds/edit", { campground: foundCampground });
    });
  }
);

// edit campground
router.put("/:id", upload.single("image"), function (req, res) {
  Campground.findById(req.params.id, async function (err, campground) {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      if (req.file) {
        try {
          await cloudinary.v2.uploader.destroy(campground.imageId);
          var result = await cloudinary.v2.uploader.upload(req.file.path);

          campground.imageId = result.public_id;
          campground.image = result.secure_url;
        } catch (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
      }
      campground.name = req.body.name;
      campground.description = req.sanitize(req.body.description);
      campground.price = req.body.price;
      campground.save();
      req.flash("success", "Successfully Updated!");
      res.redirect("/campgrounds/" + campground._id);
    }
  });
});

router.delete("/:id", function (req, res) {
  Campground.findById(req.params.id, async function (err, campground) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    } else {
      try {
        await cloudinary.v2.uploader.destroy(campground.imageId);
        campground.remove();
        req.flash("success", "Campground deleted successfully!");
        res.redirect("/campgrounds");
      } catch (err) {
        if (err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
      }

      // deletes all comments associated with the campground
      Comment.remove({ _id: { $in: campground.comments } }, function (err) {
        if (err) {
          console.log(err);
          return res.redirect("/campgrounds");
        }
        // deletes all reviews associated with the campground
        Review.remove({ _id: { $in: campground.reviews } }, function (err) {
          if (err) {
            console.log(err);
            return res.redirect("/campgrounds");
          }
          //  delete the campground
          campground.remove();
          req.flash("success", "Campground deleted successfully!");
          res.redirect("/campgrounds");
        });
      });
    }
  });
});

//  campground likes view
router.post("/:id/like", middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function (err, foundCampground) {
    if (err) {
      console.log(err);
      return res.redirect("/campgrounds");
    }

    // check if req.user._id exists in foundCampground.likes
    var foundUserLike = foundCampground.likes.some(function (like) {
      return like.equals(req.user._id);
    });

    if (foundUserLike) {
      // user already liked, removing like
      foundCampground.likes.pull(req.user._id);
    } else {
      // adding the new user like
      foundCampground.likes.push(req.user);
    }

    foundCampground.save(function (err) {
      if (err) {
        console.log(err);
        return res.redirect("/campgrounds");
      }
      return res.redirect("/campgrounds/" + foundCampground._id);
    });
  });
});

module.exports = router;
