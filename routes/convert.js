const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");
const temp = require("../temp/temp.js")

//Main Routes - simplified for now
router.get("/:id", ensureAuth, postsController.getConvert);
router.get("/:id/downloadJSON", ensureAuth, function(req, res){
    const file = "C:/Users/Asanam/Desktop/mvc/binary-upload-boom/temp/output.json";
    res.download(file);
    console.log("Sending json to user");
}); 
router.get("/:id/downloadTXT", ensureAuth, function(req, res){
    const file = "C:/Users/Asanam/Desktop/mvc/binary-upload-boom/temp/output.txt";
    res.download(file);
    console.log("Sending txt to user");
});

module.exports = router;