import { useCallback, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiCall, showToast = true) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong';
      setError(errorMessage);
      if (showToast) {
        toast.error(errorMessage);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return request(() => api.get(url, config));
  }, [request]);

  const post = useCallback((url, data, config = {}) => {
    return request(() => api.post(url, data, config));
  }, [request]);

  const put = useCallback((url, data, config = {}) => {
    return request(() => api.put(url, data, config));
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request(() => api.delete(url, config));
  }, [request]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    request
  };
};