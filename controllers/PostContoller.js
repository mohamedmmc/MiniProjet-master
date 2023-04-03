import Post from "../models/Post.js";
import jwt from "jsonwebtoken";
import Artist from "../models/Artist.js";
import mongoose from "mongoose";
import sendEmail from "../middlewares/sendEmail.js";

// create post
export async function addPost(req, res) {
  const { userId } = req.body;
  let existingUser;
  try {
    existingUser = await Artist.findById(userId);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  if (!existingUser) {
    return res.status(400).json({ message: "Unable to find the user" });
  }
  Post.create({
    title: req.body.title,
    description: req.body.description,
    image: req.file?.filename
      ? `${req.protocol}://${req.get("host")}/upload/${req.file.filename}`
      : "no image",
    userId: userId,
  })
    .then((newPost) => {
      //existingUser.posts.push(newPost);
      //existingUser.save();
      res.status(200).json(newPost);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//update post
export async function UpdatePostById(req, res) {
  const id = req.params.id;

  Post.findByIdAndUpdate(id, {
    title: req.body.title,
    description: req.body.description,
  })
    .then((docs) => {
      res.status(200).json(docs);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//get post by Id
export async function getPost(req, res) {
  const id = req.params.id;
  Post.find({ userId: id })
    .populate("userId")
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//get all posts
export async function getAllPosts(req, res) {
  const id = req.params.id;
  Post.find()
    .populate("userId")
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//delete post

export function deleteOnePost(req, res) {
  const id = req.params.id;
  Post.findByIdAndDelete(id)
    .then((doc) => {
      res.status(200).json(doc);
      console.log("Post deleted with success");
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
}

//Like a post

export async function LikePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
}
