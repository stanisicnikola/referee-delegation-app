const express = require("express");
const router = express.Router();
const { userController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { userSchemas } = require("../validators");

router.use(authenticate);

router.get(
  "/statistics",
  authorize("admin", "delegate"),
  userController.getUserStatistics,
);

router.get(
  "/",
  authorize("admin"),
  validate(userSchemas.query, "query"),
  userController.getUsers,
);
router.get(
  "/:id",
  authorize("admin"),
  validate(userSchemas.params, "params"),
  userController.getUser,
);
router.post(
  "/",
  authorize("admin", "delegate"),
  validate(userSchemas.create),
  userController.createUser,
);
router.put(
  "/:id",
  authorize("admin", "delegate"),
  validate(userSchemas.params, "params"),
  validate(userSchemas.update),
  userController.updateUser,
);
router.delete(
  "/:id",
  authorize("admin", "delegate"),
  validate(userSchemas.params, "params"),
  userController.deleteUser,
);

router.put(
  "/:id/reset-password",
  authorize("admin"),
  validate(userSchemas.params, "params"),
  validate(userSchemas.resetPassword),
  userController.resetPassword,
);

module.exports = router;
