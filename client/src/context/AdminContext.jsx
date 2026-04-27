import { createContext, useContext, useState, useCallback } from 'react';

const AdminContext = createContext(null);

async function adminRequest(path, options = {}) {
  const token = sessionStorage.getItem('adminToken');
  const res = await fetch(`/api/admin${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('adminToken'));

  const login = useCallback(async (email, password) => {
    const data = await adminRequest('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    sessionStorage.setItem('adminToken', data.token);
    setToken(data.token);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('adminToken');
    setToken(null);
  }, []);

  const fetch = useCallback((path) => adminRequest(path), []);

  return (
    <AdminContext.Provider value={{ isAdmin: !!token, login, logout, fetch }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
