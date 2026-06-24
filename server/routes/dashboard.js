const express = require("express");
const router = express.Router();
const { dashboardController } = require("../controllers");
const { authenticate, authorize } = require("../middlewares");

router.use(authenticate);

router.get("/", authorize("admin"), dashboardController.getDashboard);

module.exports = router;
