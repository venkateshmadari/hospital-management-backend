const express = require("express")
const router = express.Router()
const StatsController = require("../../controllers/Doctor/dashboardStatsController")

router.get("/", StatsController.dashboardStatsCount)

module.exports = router