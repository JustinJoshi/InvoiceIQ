const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Chart = require("../models/Chart");
const pdf2json = require("../middleware/pdf2json");
const Invoice = require("../models/Invoice");
const mongoose = require('mongoose');
const Note = require('../models/Note');

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const { toFile } = require('@anthropic-ai/sdk');

require("dotenv").config({ path: "./config/.env" });

module.exports = {
  getSourceRainbow: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("addSourceRainbow.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  addSource: async (req, res) => {
    try {
      console.log(req.body.category)
      await Chart.create({
        category: req.body.category,
        name: req.body.name,
        value: req.body.value,
        date: req.body.date,
        notes: req.body.notes,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/addSource");
    } catch (err) {
      console.log(err);
    }
  },
  getChartData: async (req, res) => {
    try {
      const chartData = await Chart.find().sort({ createdAt: "desc" }).lean();
      res.send(chartData).status(200)
      //Send user data to client
      //   Chart.find().toArray((err, result) => {
      //   if (err) return console.log(err)
      //   res.send(result).status(200)
      // })
    } catch (err) {
      console.log(err);
    }
  },
  getConvert: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const pdfDocument = await convertPdf(post.path);
      res.render("convert.ejs", { post: post, user: req.user, document: pdfDocument });
    } catch (err) {
      console.log(err);
    }
  },
  getProfile: async (req, res) => {
    try {
      const userCharts = await Invoice.find({ user: req.user.id })
      if (!userCharts[0]) {
        console.log(`userCharts is ${typeof userCharts[0]}, rendering without loading dashboard data.`);
        res.render("dashboard.ejs")
      } else {
        console.log('hi')
        const aiResponse = userCharts[0].aiResponse
        res.render("dashboard.ejs", { user: req.user, userCharts: userCharts, aiResponse: aiResponse });
      }
    } catch (err) {
      console.log(err);
    }
  },
  getRainbow: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("dashboardRainbow.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getSource: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("addSource.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createManualInvoice: async (req, res) => {
    try {
      let files = []
      req.files.forEach((e, i) => {
        files.push(e.path)
      })

      console.log(files)

      for (const pdf of files) {
        const result = await cloudinary.uploader.upload(pdf);
        console.log('File uploaded to cloudinary')


        const invoiceTemplate = {
          "_id": "",
          "invoice_number": "",
          "invoice_date": "",
          "due_date": "",
          "vendor": {
            "name": "",
            "address": "",
            "phone": "",
            "email": ""
          },
          "recipient": {
            "name": "",
            "address": "",
            "phone": ""
          },
          "items": [
            {
              "description": "",
              "quantity": 0,
              "unit_price": 0,
              "total": 0
            }
          ],
          "subtotal": 0,
          "tax_rate": 0,
          "tax_amount": 0,
          "total": 0,
          "currency": "USD",
          "payment_terms": "",
          "status": "pending"
        };

        async function fileRead() {
          const anthropic = new Anthropic({
            apiKey: process.env.API_KEY_CLAUDE
          });

          try {

            const fileBuffer = await fs.readFile(pdf);
            console.log('File read successfully, size:', fileBuffer.length, 'bytes');


            console.log('Uploading to Claude Files API...');
            const fileUpload = await anthropic.beta.files.upload({
              file: await toFile(fileBuffer, 'invoice.pdf', { type: 'application/pdf' })
            }, {
              betas: ['files-api-2025-04-14']
            });

            console.log('File uploaded successfully, ID:', fileUpload.id);


            const response = await anthropic.beta.messages.create({
              model: "claude-sonnet-4-5",
              max_tokens: 4096,
              messages: [
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Please extract the invoice data from the attached PDF and return it as a JSON object in the following format. Make sure to fill in all the fields with the actual data from the invoice:

${JSON.stringify(invoiceTemplate, null, 2)}

Return ONLY the JSON object, with no additional text or markdown formatting.

If there are multiple items, fill them into the array following the format.`
                    },
                    {
                      type: "document",
                      source: {
                        type: "file",
                        file_id: fileUpload.id
                      }
                    }
                  ]
                }
              ],
              betas: ["files-api-2025-04-14"],
            });

            console.log('Claude Response:', response);


            const jsonText = response.content[0].text;
            console.log('Raw JSON text:', jsonText);


            const cleanJson = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            if (!JSON.parse(cleanJson)) throw error

            const invoiceData = JSON.parse(cleanJson);

            await Invoice.create({
              file: result.secure_url,
              aiResponse: invoiceData,
              isManualEntry: true,
              user: req.user.id,
            });
            
            console.log('Invoice created in DB. Uploaded cloudinary ID as file');

            console.log('Successfully parsed invoice data:', invoiceData);



          } catch (error) {
            console.error('Error processing invoice with Claude:', error);
            throw error;
          }
        }

        await fileRead();
      }

      console.log("Manual upload complete!");
      res.redirect("/addSource");
    } catch (err) {
      console.log(err);
      res.status(500).send("Error processing invoices");
    }
  },
  createNote: async (req, res) => {
    try {
      const index = req.params.index;
      const note = req.body.note;

      console.log(note, "NOTE")

      console.log(index);
      const userCharts = await Invoice.find({ user: req.user.id});
      const invoice = userCharts[index];

      await Note.create({
        invoiceID : invoice._id,
        note: note,
        user: req.user.id,
      });
      console.log('Note Updated!');

      const newNote = await Note.find({ user: req.user.id })

      res.send(JSON.stringify(newNote)).status(200);

    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const filePath = req.file.path;
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        path: filePath,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  deleteNote: async (req, res) => {
    try {
      // Find post by id
      let note = await Note.findById({ _id: req.params.id });
      console.log(note)
      // Delete post from db
      await Note.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.send(JSON.stringify({ _id: req.params.id }))
    } catch (err) {
      res.send(err)
    }
  },
};
