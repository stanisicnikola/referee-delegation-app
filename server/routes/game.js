const express = require("express");
const router = express.Router();
const { Game } = require("../models");

router.get("/", async (req, res) => {
  try {
    const games = await Game.findAll();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const game = req.body;
    await Game.create(game);

    res.json(game);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const gameId = req.params.id;
    const deletedGame = await Game.destroy({ where: { id: gameId } });

    if (deletedGame) {
      return res.json({ message: "Game deleted!" });
    } else {
      return res.json({ message: "Game does not exist!" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
