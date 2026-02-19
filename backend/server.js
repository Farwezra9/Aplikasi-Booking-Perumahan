require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
require("./config/db");
const app = express(); 

// middleware dasar
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static folder upload
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

/* ================== ROUTES ================== */
const authRoutes = require("./routes/auth");
const rumahRoutes = require("./routes/rumah");
const dashboardRoutes = require("./routes/dashboard");
const blokRoutes = require("./routes/blok");
const bookingRoutes = require("./routes/booking");
const usersRoutes = require("./routes/user");

app.use("/api/auth", authRoutes);
app.use("/api/rumah", rumahRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/blok", blokRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/users", usersRoutes);

/* ================== SERVER ================== */
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});