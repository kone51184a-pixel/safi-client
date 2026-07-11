import { createContext, useContext, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('safi_client_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('safi_client_token'));

  function persist(user, token) {
    setUser(user);
    setToken(token);
    localStorage.setItem('safi_client_user', JSON.stringify(user));
    localStorage.setItem('safi_client_token', token);
  }

  async function login(phone, password) {
    const data = await api.login(phone, password);
    persist(data.user, data.token);
  }

  async function register(payload) {
    const data = await api.register(payload);
    persist(data.user, data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('safi_client_user');
    localStorage.removeItem('safi_client_token');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
