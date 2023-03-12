const express = require("express");
const router = express.Router({ mergeParams: true }); // To get access to the params id, add mergeParams property to the .Router()
const wrapAsync = require("../utils/AsyncWrapper");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");

router.post("/", isLoggedIn, validateReview, wrapAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviews.deleteReview)
);

module.exports = router;
