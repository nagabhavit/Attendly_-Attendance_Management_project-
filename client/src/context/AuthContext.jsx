import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, demoMode, tokenStore } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const handleSession = ({ token, user }) => {
    tokenStore.set(token);
    setUser(user);
  };

  const login = async (creds) => handleSession(await api.login(creds));
  const register = async (payload) => handleSession(await api.register(payload));

  const startDemo = async () => {
    demoMode.enable();
    handleSession(await api.login({}));
  };

  const logout = useCallback(() => {
    tokenStore.clear();
    if (demoMode.enabled()) demoMode.disable();
    setUser(null);
  }, []);

  const updateTarget = async (targetPercentage) => {
    const { user } = await api.updateMe({ targetPercentage });
    setUser(user);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, startDemo, logout, updateTarget, isDemo: demoMode.enabled() }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
