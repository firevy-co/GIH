const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const documentRoutes = require("./routes/documentRoutes");
const investmentRoutes = require("./routes/investmentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const settingRoutes = require("./routes/settingRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");

const cors = require("cors");

const app = express();
require("dotenv").config();

app.use(cors());

const PORT = process.env.PORT || 5000;

app.use(express.json());

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/investments", investmentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

connectDB();


app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`)
});