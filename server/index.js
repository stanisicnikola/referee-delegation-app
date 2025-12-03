const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const { errorHandler } = require("./middlewares");
const {
  authRoutes,
  userRoutes,
  refereeRoutes,
  teamRoutes,
  venueRoutes,
  competitionRoutes,
  matchRoutes,
  delegationRoutes,
  availabilityRoutes,
} = require("./routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files za uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/referees", refereeRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/delegations", delegationRoutes);
app.use("/api/availability", availabilityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
