const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Chart = require("../models/Chart")
const pdf2json = require("../middleware/pdf2json");
const Invoice = require("../models/Invoice")
require("dotenv").config({ path: "./config/.env" });

module.exports = {
  makeChart: async (req, res) => {
    try {
      //get charts belonging to current user
      const userCharts = await Invoice.find({ user: req.user.id })

      const descriptionArr = userCharts[0].aiResponse.items

      const aiResponse = userCharts[0].aiResponse

      
      let items = []
      descriptionArr.forEach((e) => {
        items.push(e.description)
      })

      console.log(userCharts)
      // let freq = {}
      // let touched = []
      // items.forEach(((e) => {
      //   let inc = 1
      //   if (touched.includes(e)) {
      //     touched.forEach((el) => {
      //       if (el === e) {
      //         inc += 1
      //       }
      //     })
      //   }
      //   touched.push(e)
      //   freq[e] = {
      //     category: e,
      //     occurances: inc
      //   }
      // }))
      // console.log(freq, "FREQUENCY OBJECT")

      // let occurancesArr = []
      // Object.keys(freq).forEach((e, i) => {
      //   occurancesArr.push(freq[e].occurances)
      // })
      // console.log(Math.max(...occurancesArr))
      // let maxOcc
      // Object.keys(freq).forEach((e, i) => {
      //   if (Math.max(...occurancesArr) === freq[e].occurances) {
      //     console.log(freq[e], "OBJECT WITH MOST OCCURANCES")
      //     maxOcc = freq[e].category
      //   }
      // })

      // maxOccCharts = []
      // userCharts.forEach((e, i) => {
      //   console.log(e)
      //   if (e.category === maxOcc) {
      //     maxOccCharts.push(e)
      //   }
      // })




      // res.send({ frequency: freq, max: maxOcc, charts: maxOccCharts }).status(200)
    }
    catch (err) {
      console.error(err)
    }
  }

};




