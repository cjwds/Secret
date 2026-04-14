import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

// 登录异步操作
export const login = createAsyncThunk('auth/login', async (userData, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  } catch (error) {
    // 模拟登录验证，用于预览环境
    if (!error.response) {
      // 模拟用户数据库
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = registeredUsers.find(u => 
        (u.email === userData.email || u.username === userData.email) && 
        u.password === userData.password
      );
      
      if (user) {
        const mockToken = 'mock-token-123';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, token: mockToken, message: '登录成功' };
      } else {
        return rejectWithValue('用户不存在或密码错误');
      }
    }
    return rejectWithValue(error.response.data.message);
  }
});

// 注册异步操作
export const register = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authAPI.register(userData);
    // 注册成功后不自动登录，清除token和user
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return response.data;
  } catch (error) {
    // 模拟注册成功，用于预览环境
    if (!error.response) {
      // 保存注册用户到本地存储
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const existingUser = registeredUsers.find(u => u.email === userData.email);
      
      if (existingUser) {
        return rejectWithValue('用户已存在');
      }
      
      const newUser = {
        _id: Date.now().toString(),
        username: userData.username,
        email: userData.email,
        password: userData.password
      };
      
      registeredUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
      
      return { message: '注册成功' };
    }
    return rejectWithValue(error.response.data.message);
  }
});

// 登出操作
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { type: 'auth/logout' };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // 登录
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    // 注册
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.isLoading = false;
      // 注册成功后不更新user和token，保持未登录状态
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
    
    // 登出
    builder.addCase('auth/logout', (state) => {
      state.user = null;
      state.token = null;
    });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;