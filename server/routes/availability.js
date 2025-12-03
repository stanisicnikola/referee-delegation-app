const express = require("express");
const router = express.Router();
const { availabilityController } = require("../controllers");
const { authenticate, authorize, validate } = require("../middlewares");
const { availabilitySchemas } = require("../validators");

// All routes require authentication
router.use(authenticate);

// Routes for logged-in referee
router.get(
  "/my-availability",
  authorize("referee"),
  availabilityController.getMyAvailability
);
router.post(
  "/my-availability",
  authorize("referee"),
  validate(availabilitySchemas.setAvailability),
  availabilityController.setMyAvailability
);
router.get(
  "/my-calendar",
  authorize("referee"),
  validate(availabilitySchemas.calendarQuery, "query"),
  availabilityController.getMyCalendar
);

// Dostupni/nedostupni sudije za datum
router.get(
  "/available/:date",
  authorize("admin", "delegate"),
  availabilityController.getAvailableReferees
);
router.get(
  "/unavailable/:date",
  authorize("admin", "delegate"),
  availabilityController.getUnavailableReferees
);

// Dostupnost po sudiji
router.get(
  "/referees/:refereeId",
  validate(availabilitySchemas.refereeParams, "params"),
  availabilityController.getRefereeAvailability
);
router.post(
  "/referees/:refereeId",
  authorize("admin"),
  validate(availabilitySchemas.refereeParams, "params"),
  validate(availabilitySchemas.setAvailability),
  availabilityController.setAvailability
);
router.post(
  "/referees/:refereeId/range",
  authorize("admin"),
  validate(availabilitySchemas.refereeParams, "params"),
  validate(availabilitySchemas.setAvailabilityRange),
  availabilityController.setAvailabilityRange
);

// Kalendar
router.get(
  "/referees/:refereeId/calendar",
  validate(availabilitySchemas.refereeParams, "params"),
  validate(availabilitySchemas.calendarQuery, "query"),
  availabilityController.getCalendar
);

// Kopiraj iz prethodnog mjeseca
router.post(
  "/referees/:refereeId/copy-previous",
  authorize("admin"),
  validate(availabilitySchemas.refereeParams, "params"),
  validate(availabilitySchemas.copyPrevious),
  availabilityController.copyFromPreviousMonth
);

// Brisanje
router.delete(
  "/:id",
  authorize("admin"),
  availabilityController.deleteAvailability
);
router.delete(
  "/referees/:refereeId/date/:date",
  authorize("admin"),
  availabilityController.deleteAvailabilityByDate
);

module.exports = router;
