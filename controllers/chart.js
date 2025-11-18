const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Chart = require("../models/Chart")
const pdf2json = require("../middleware/pdf2json");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  makeChart: async (req, res) => {
    try {
      //get charts belonging to current user
      const userCharts = await Chart.find({ user: req.user.id })

      let categories = []
      userCharts.forEach((e, i) => {
        categories.push(e.category)
      })

      let freq = {}
      let touched = []
      categories.forEach(((e, i) => {
        let inc = 1
        if (touched.includes(e)) {
          touched.forEach((el, index) => {
            if (el === e) {
              inc += 1
            }
          })
        }
        touched.push(e)
        freq[e] = {
          category: e,
          occurances: inc
        }
      }))
      console.log(freq, "FREQUENCY OBJECT")

      let occurancesArr = []
      Object.keys(freq).forEach((e, i) => {
        occurancesArr.push(freq[e].occurances)
      })
      console.log(Math.max(...occurancesArr))
      let maxOcc
      Object.keys(freq).forEach((e, i) => {
        if (Math.max(...occurancesArr) === freq[e].occurances) {
          console.log(freq[e], "OBJECT WITH MOST OCCURANCES")
          maxOcc = freq[e].category
        }
      })

      maxOccCharts = []
      userCharts.forEach((e, i) => {
        console.log(e)
        if (e.category === maxOcc) {
          maxOccCharts.push(e)
        }
      })



      console.log(userCharts, "CHARTS")
      res.send({ frequency: freq, max: maxOcc, charts: maxOccCharts }).status(200)
    }
    catch (err) {
      console.error(err)
    }
  }

};




