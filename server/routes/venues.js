const express = require("express");
const router = express.Router();
const { venueController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { venueSchemas } = require("../validators");

router.use(authenticate);

router.get(
  "/",
  validate(venueSchemas.query, "query"),
  venueController.getVenues,
);
router.get("/statistics", venueController.getVenueStatistics);
router.get(
  "/:id",
  validate(venueSchemas.params, "params"),
  venueController.getVenue,
);

router.post(
  "/",
  authorize("admin"),
  validate(venueSchemas.create),
  venueController.createVenue,
);
router.put(
  "/:id",
  authorize("admin"),
  validate(venueSchemas.params, "params"),
  validate(venueSchemas.update),
  venueController.updateVenue,
);
router.delete(
  "/:id",
  authorize("admin"),
  validate(venueSchemas.params, "params"),
  venueController.deleteVenue,
);

module.exports = router;
