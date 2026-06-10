import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('access_token'));

  // =========================
  // SIGN OUT
  // =========================
  const signOut = async () => {
    const refresh = localStorage.getItem('refresh_token');

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    setAccessToken(null);
    setUser(null);
    setProfile(null);

    try {
      if (refresh) {
        await api.post('/logout/', { refresh });
      }
    } catch (err) {
      console.warn('Logout blacklist skipped', err);
    }
  };

  // =========================
  // FETCH PROFILE
  // =========================
  const fetchProfile = async (token) => {
    try {
      const { data } = await api.get('/users/me/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.is_active === false) {
        await signOut();
        return null;
      }

      setProfile(data);
      setUser(data);
      return data;
    } catch (err) {
      console.error('Failed to fetch profile', err);
      await signOut();
      return null;
    }
  };

  // =========================
  // SIGN IN (FIXED)
  // =========================
  const signIn = async (email, password) => {
    try {
      const { data } = await api.post('/token/', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      setAccessToken(data.access);

      const profileData = await fetchProfile(data.access);

      return { error: null, data: profileData };
    } catch (error) {
      console.error('Login error', error);
      return {
        error: error.response?.data || { detail: 'Invalid credentials' },
        data: null,
      };
    }
  };

  // =========================
  // SIGN UP
  // =========================
  const signUp = async (email, password, name, role = 'PARTICIPANT') => {
    try {
      const { data } = await api.post('/register/', {
        email,
        password,
        name,
        role,
      });

      return { data, error: null };
    } catch (error) {
      console.error('Registration error', error);
      return {
        data: null,
        error: error.response?.data || { detail: 'Registration failed' },
      };
    }
  };

  // =========================
  // INIT AUTH
  // =========================
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');

      if (token) {
        setAccessToken(token);
        await fetchProfile(token);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
