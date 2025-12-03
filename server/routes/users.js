const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { userSchemas } = require("../validators");

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize("admin"));

// Statistics (must be before /:id route)
router.get("/statistics", userController.getUserStatistics);

// CRUD operacije
router.get("/", validate(userSchemas.query, "query"), userController.getUsers);
router.get(
  "/:id",
  validate(userSchemas.params, "params"),
  userController.getUser
);
router.post("/", validate(userSchemas.create), userController.createUser);
router.put(
  "/:id",
  validate(userSchemas.params, "params"),
  validate(userSchemas.update),
  userController.updateUser
);
router.delete(
  "/:id",
  validate(userSchemas.params, "params"),
  userController.deleteUser
);

// Reset lozinke
router.put(
  "/:id/reset-password",
  validate(userSchemas.params, "params"),
  validate(userSchemas.resetPassword),
  userController.resetPassword
);

module.exports = router;
