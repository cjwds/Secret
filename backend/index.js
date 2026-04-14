const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
mongoose.connect('mongodb://localhost:27017/community').then(() => {
  console.log('数据库连接成功');
}).catch(err => {
  console.log('数据库连接失败:', err);
});

// 路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});