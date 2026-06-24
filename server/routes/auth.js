const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { authSchemas } = require("../validators");

router.post("/login", validate(authSchemas.login), authController.login);
router.post(
  "/forgot-password",
  validate(authSchemas.forgotPassword),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validate(authSchemas.resetPassword),
  authController.resetPassword,
);

router.get("/me", authenticate, authController.getMe);
router.put(
  "/me",
  authenticate,
  validate(authSchemas.updateMe),
  authController.updateMe,
);
router.put(
  "/change-password",
  authenticate,
  validate(authSchemas.changePassword),
  authController.changePassword,
);

router.post("/verify-password", authenticate, authController.verifyPassword);
router.delete("/me", authenticate, authController.deleteMe);

router.post(
  "/register",
  authenticate,
  authorize("admin"),
  validate(authSchemas.register),
  authController.register,
);

router.post(
  "/register-referee",
  authenticate,
  authorize("admin"),
  validate(authSchemas.registerReferee),
  authController.registerReferee,
);

module.exports = router;
