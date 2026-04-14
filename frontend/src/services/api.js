import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加认证拦截器
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 认证相关
export const authAPI = {
  register: (userData) => API.post('/auth/register', userData),
  login: (userData) => API.post('/auth/login', userData)
};

// 用户相关
export const userAPI = {
  getUser: (id) => API.get(`/user/${id}`),
  updateUser: (userData) => API.put('/user/update', userData),
  addPhoto: (photoData) => API.post('/user/add-photo', photoData),
  addInterest: (interest) => API.post('/user/add-interest', { interest })
};

// 帖子相关
export const postAPI = {
  createPost: (postData) => API.post('/post/create', postData),
  getPosts: () => API.get('/post'),
  getUserPosts: (userId) => API.get(`/post/user/${userId}`),
  likePost: (postId) => API.post(`/post/${postId}/like`),
  unlikePost: (postId) => API.post(`/post/${postId}/unlike`)
};

export default API;