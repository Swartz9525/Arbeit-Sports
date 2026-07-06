import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { loginSuccess, logoutSuccess, setLoading } from '../features/auth/store/authSlice';
import api from '../services/api';

export function useAuth() {
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const loadMe = async () => {
    dispatch(setLoading(true));
    try {
      const res = await api.get('/auth/me');
      dispatch(loginSuccess(res.data));
    } catch (err) {
      dispatch(logoutSuccess());
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    loadMe,
  };
}
