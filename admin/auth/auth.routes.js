import {
  verifySuperAdmin,
  verifyLogin,
} from "../../helper/middleware/authenticate.js";
import {
  registerUser,
  registerAdminUser,
  forgetPassword,
  resetPassword,
  changePassword,
} from "./auth.controllers.js";
import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import "../../helper/config/passportConfig.js";

/**
 * @route GET /auth
 * @group Auth - Operations related to auth
 * @returns {object} 200 - An array of auth
 * @returns {Error} 500 - Internal server error
 */

const authRouter = express.Router();

// Local Authentication (Email and Password)
authRouter.post("/login", (req, res, next) => {
  // #swagger.tags = ['Auth']
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Login failed" });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }

      // Generate JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      // Set the token as a cookie in the response
      res.cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      // Send the token as a response
      return res.json({ message: "Login successful", token: token });
    });
  })(req, res, next);
});

// Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false,
  })
);

// GitHub OAuth
authRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
authRouter.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: false,
  })
);

// Logout
authRouter.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }

    // Clear the session cookie
    res.clearCookie("connect.sid", { path: "/" });

    // Optionally, clear any other cookies
    res.clearCookie("access_token");

    // Send a response indicating successful logout
    res.json({ message: "Logout successful" });
  });
});

authRouter.post("/register", registerUser);
// authRouter.post("/login", loginUser);
// authRouter.post("/logout", verifyLogin, logoutUser);
authRouter.post("/register-admin", verifySuperAdmin, registerAdminUser);
authRouter.post("/forget-password", forgetPassword);
authRouter.post("/reset-password/:resetToken", resetPassword);
authRouter.post("/change-password", verifyLogin, changePassword);

export default authRouter;
