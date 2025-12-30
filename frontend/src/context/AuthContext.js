import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        admin: null,
        token: null,
        error: action.payload
      };
    case 'UPDATE_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        loading: false,
        admin: action.payload.admin,
        error: null
      };
    case 'UPDATE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  admin: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token validity
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          admin: response.data.admin,
          token: localStorage.getItem('token')
        }
      });
    } catch (error) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      dispatch({ type: 'LOGOUT' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await api.post('/auth/login', credentials);
      const { token, admin } = response.data;

      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { admin, token }
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('🔄 Updating profile with data:', {
        ...profileData,
        currentPassword: profileData.currentPassword ? '[HIDDEN]' : undefined,
        newPassword: profileData.newPassword ? '[HIDDEN]' : undefined
      });

      dispatch({ type: 'UPDATE_START' });

      const response = await api.put('/auth/me', profileData);
      console.log('✅ Profile update response:', response.data);

      const { admin } = response.data;

      dispatch({
        type: 'UPDATE_SUCCESS',
        payload: { admin }
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Profile update error:', error);
      console.error('❌ Error response:', error.response?.data);

      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({
        type: 'UPDATE_FAILURE',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
