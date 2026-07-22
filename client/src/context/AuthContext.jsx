import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [apiBaseUrl, setApiBaseUrl] = useState(null);

  const [connectedAccounts, setConnectedAccounts] = useState([]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'DIGITAL_SUITE_INIT') {
        const payload = event.data.payload;
        if (payload?.sessionToken && payload?.apiBaseUrl) {
          setSessionToken(payload.sessionToken);
          setApiBaseUrl(payload.apiBaseUrl);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!sessionToken || !apiBaseUrl) return;

    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/accounts`, {
          headers: { Authorization: `Bearer ${sessionToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setConnectedAccounts(data);
        }
      } catch (err) {
        console.error('Failed to fetch accounts', err);
      }
    };
    
    fetchAccounts();
  }, [sessionToken, apiBaseUrl]);

  return (
    <AuthContext.Provider value={{ sessionToken, apiBaseUrl, connectedAccounts, setConnectedAccounts }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
