const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/AsyncWrapper");
const passport = require("passport");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegister)
  .post(wrapAsync(users.register));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
      keepSessionInfo: true,
    }),
    users.login
  );

router.post("/logout", users.logout);

module.exports = router;
