const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户信息
router.put('/update', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true }).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加照片
router.post('/add-photo', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.photos.push(req.body);
    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加兴趣
router.post('/add-interest', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.interests.includes(req.body.interest)) {
      user.interests.push(req.body.interest);
      await user.save();
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;