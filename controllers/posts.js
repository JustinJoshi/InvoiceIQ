const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Chart = require("../models/Chart")
const pdf2json = require("../middleware/pdf2json");
require("dotenv").config({ path: "./config/.env" });

module.exports = {
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
      const posts = await Post.find({ user: req.user.id });
      res.render("dashboard.ejs", { posts: posts, user: req.user });
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
};
