var express = require("express");
var router = express.Router({ mergeParams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

// show form to add new comment
router.get("/new", middleware.isLoggedIn, function (req, res) {
  // find campground by id
  Campground.findById(req.params.id, function (err, campground) {
    if (err || !campground) {
      req.flash("error", "Campground not found");
      res.redirect("back");
    } else {
      res.render("comments/new", { campground: campground });
    }
  });
});

// addd new comment
router.post("/", middleware.isLoggedIn, function (req, res) {
  //lookup campground using ID
  Campground.findById(req.params.id, function (err, campground) {
    if (err || !campground) {
      req.flash("error", "Campground not found");
      res.redirect("back");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Something went wrong");
          console.log(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          // console.log(comment);
          req.flash("success", "Successfully added comment");
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// show form to edit comment
router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "Campground not found");
        return res.redirect("back");
      }

      Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
          res.redirect("back");
        } else {
          res.render("comments/edit", {
            camp_id: req.params.id,
            comment: foundComment,
          });
        }
      });
    });
  }
);

// edit comment
router.put(
  "/:comment_id",
  middleware.checkCommentOwnership,
  function (req, res) {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment,
      function (err) {
        if (err) {
          res.redirect("back");
        } else {
          res.redirect("/campgrounds/" + req.params.id);
        }
      }
    );
  }
);

// delete comment
router.delete(
  "/:comment_id",
  middleware.checkCommentOwnership,
  function (req, res) {
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function (err) {
      if (err) {
        res.redirect("back");
      } else {
        req.flash("success", "Comment deleted");
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  }
);

module.exports = router;
