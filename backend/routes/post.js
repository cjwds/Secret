const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// 发布帖子
router.post('/create', auth, async (req, res) => {
  try {
    const newPost = new Post({
      user: req.user.id,
      content: req.body.content,
      image: req.body.image,
      tags: req.body.tags
    });
    
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有帖子
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username avatar').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户的帖子
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id }).populate('user', 'username avatar').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 点赞帖子
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 取消点赞
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id !== req.user.id);
      await post.save();
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;