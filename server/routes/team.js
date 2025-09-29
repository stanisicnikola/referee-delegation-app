const express = require("express");
const router = express.Router();
const { Team } = require("../models");

router.get("/", async (req, res) => {
  try {
    const teams = await Team.findAll();
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const team = req.body;
    await Team.create(team);

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const teamId = req.params.id;
    const deletedTeam = await Team.destroy({ where: { id: teamId } });

    if (deletedTeam) {
      return res.json({ message: "Tim obrisan!" });
    } else {
      return res.json({ message: "Tim ne postoji!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
