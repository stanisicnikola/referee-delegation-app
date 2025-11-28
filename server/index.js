require("dotenv").config();

const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;

//ROUTERS
const userRouter = require("./routes/user");
app.use("/users", userRouter);
const teamRouter = require("./routes/team");
app.use("/teams", teamRouter);
const gameRouter = require("./routes/game");
app.use("/games", gameRouter);
const venueRouter = require("./routes/venue");
app.use("/venues", venueRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);
});
