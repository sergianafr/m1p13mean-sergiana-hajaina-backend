const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const dashboardController = require("../controllers/dashboard.controller");

// ADMIN dashboard (global)
router.get("/admin", authMiddleware, roleMiddleware("ADMIN"), dashboardController.getAdminDashboard);

// BOUTIQUE dashboard (for the authenticated boutique's magasin)
router.get(
	"/boutique",
	authMiddleware,
	roleMiddleware("BOUTIQUE"),
	dashboardController.getBoutiqueDashboard
);

module.exports = router;
