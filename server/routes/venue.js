const express = require("express");
const router = express.Router();
const { Venue } = require("../models");

router.get("/", async (req, res) => {
  try {
    const venues = await Venue.findAll();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const venue = req.body;
    await Venue.create(venue);

    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const venueId = req.params.id;
    const deletedVenue = await Venue.destroy({ where: { id: venueId } });

    if (deletedVenue) {
      return res.json({ message: "Venue deleted!" });
    } else {
      return res.json({ message: "Venue does not exist!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
