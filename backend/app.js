const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const parentRoutes = require("./routes/parents");
const studentRoutes = require("./routes/students");
const classRoutes = require("./routes/classes");
const academicYearRoutes = require("./routes/academicYears");
const mealPlanRoutes = require("./routes/mealPlans");
const holidayRoutes = require("./routes/holidays");
const feeAdjustmentRoutes = require("./routes/feeAdjustments");
const foodRoutes = require("./routes/foods");
const menuRoutes = require("./routes/menus");
const attendanceRoutes = require("./routes/attendance");
const occasionalMealRoutes = require("./routes/occasionalMeals");
const invoiceRoutes = require("./routes/invoices");
const paymentRoutes = require("./routes/payments");
const settingsRoutes = require("./routes/settings");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const searchRoutes = require("./routes/search");
const auditLogRoutes = require("./routes/auditLogs");
const notificationRoutes = require("./routes/notifications");
const parentPortalRoutes = require("./routes/parentPortal");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS-ka lama oggola origin-kan."));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Taysiir International Schools KM13 — Restaurant & Meal Management API is running." });
});
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/fee-adjustments", feeAdjustmentRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/occasional-meals", occasionalMealRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/parent-portal", parentPortalRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
