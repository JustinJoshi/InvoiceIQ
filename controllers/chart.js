const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Chart = require("../models/Chart")
const pdf2json = require("../middleware/pdf2json");
const Invoice = require("../models/Invoice");
const Note = require("../models/Note")
const { json } = require("stream/consumers");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  makeChart: async (req, res) => {
    try {
      //get charts belonging to current user
      const userCharts = await Invoice.find({ user: req.user.id })
      const notes = await Note.find({ user: req.user.id })

      console.log(notes)

      const descriptionArr = userCharts[0].aiResponse.items

      const aiResponse = userCharts[0].aiResponse

      
      let items = []
      descriptionArr.forEach((e) => {
        items.push(e.description)
      })

      res.send(JSON.stringify({userCharts: userCharts, notes: notes}))
    }
    catch (err) {
      console.error(err)
    }
  }

};