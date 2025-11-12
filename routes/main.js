const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");
const chartController = require("../controllers/chart")
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", homeController.getIndex);
router.get("/dashboard", ensureAuth, postsController.getProfile);
router.get("/dashboardRainbow", ensureAuth, postsController.getRainbow);
router.get("/dashboardChart", ensureAuth, postsController.getChartData)
router.get("/makeChart", ensureAuth, chartController.makeChart)
router.get("/addSource", ensureAuth, postsController.getSource);
router.get("/feed", ensureAuth, postsController.getFeed);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
