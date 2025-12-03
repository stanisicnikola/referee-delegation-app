const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { authSchemas } = require("../validators");

// Public routes
router.post("/login", validate(authSchemas.login), authController.login);

// Protected routes
router.get("/me", authenticate, authController.getMe);
router.put(
  "/change-password",
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword
);

// Admin only routes
router.post(
  "/register",
  authenticate,
  authorize("admin"),
  validate(authSchemas.register),
  authController.register
);

router.post(
  "/register-referee",
  authenticate,
  authorize("admin"),
  validate(authSchemas.registerReferee),
  authController.registerReferee
);

module.exports = router;
