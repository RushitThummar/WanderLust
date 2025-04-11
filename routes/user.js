const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRidirectUrl } = require("../middleware.js");

const userController = require("../controllers/user.js");

//user signin:new  route
router
  .route("/signup")
  .get(userController.renderSignUpForm)
  .post(wrapAsync(userController.signUp));

//user login:new  route
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRidirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.loginSuccess
  );

router.get("/logout", userController.logoutSuccess);

// //user demo
// app.get("/demouser", async (req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });

//   let newUser = await User.register(fakeUser, "helloworld");
//   res.send(newUser);
// });

module.exports = router;
