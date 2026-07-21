import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

export function ConnectedAccounts({ platforms }) {
  const { sessionToken, apiBaseUrl, connectedAccounts, setConnectedAccounts } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // 3. Connect WebSocket for Real-time OAuth updates
  useEffect(() => {
    if (!apiBaseUrl || !sessionToken) return;

    const newSocket = io(apiBaseUrl, {
      auth: { token: sessionToken },
      transports: ['websocket', 'polling']
    });

    newSocket.on('social:oauth_success', (data) => {
      if (data && data.account) {
        setConnectedAccounts(prev => {
          const exists = prev.find(a => a.provider === data.account.provider);
          if (exists) {
            return prev.map(a => a.provider === data.account.provider ? data.account : a);
          }
          return [...prev, data.account];
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [apiBaseUrl, sessionToken]);

  const handleConnect = async (providerId) => {
    if (!sessionToken || !apiBaseUrl) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/accounts/connect/${providerId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          // Send message to host OS to open the external URL since we are in an iframe
          if (window.parent !== window) {
            window.parent.postMessage({ type: 'DIGITAL_SUITE_OPEN_URL', url: data.url }, '*');
          } else {
            // Fallback for standalone web mode
            const width = 600;
            const height = 700;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;
            window.open(data.url, 'Connect', `width=${width},height=${height},top=${top},left=${left}`);
          }
        }
      }
    } catch (err) {
      console.error('Failed to initiate connection', err);
    }
  };

  const handleDisconnect = async (providerId) => {
    if (!sessionToken || !apiBaseUrl) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/accounts/disconnect/${providerId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        // Remove from local state
        setConnectedAccounts(prev => prev.filter(a => a.provider.toLowerCase() !== providerId.toLowerCase()));
      }
    } catch (err) {
      console.error('Failed to disconnect account', err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-ds-textMuted">Initializing Digital Suite Connection Hub...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ds-text">Connected Accounts</h1>
          <p className="text-ds-textMuted text-sm mt-1">Connect your accounts to power this micro-app securely.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ds-textMuted bg-ds-surface border border-ds-border px-4 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-ds-primary inline-block shadow-[0_0_8px_var(--color-primary)]"></span>
          {connectedAccounts.length} connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          // Check if this provider is found in connectedAccounts
          const accountData = connectedAccounts.find(a => a.provider.toLowerCase() === platform.id.toLowerCase());
          const isConnected = !!accountData;
          const isExpired = accountData?.isExpired;

          return (
            <div
              key={platform.id}
              className={`bg-ds-surface border rounded-xl p-5 flex items-center justify-between transition-all duration-200 ${
                isConnected && !isExpired ? 'border-ds-primary/40 shadow-lg shadow-ds-primary/5' : 
                isExpired ? 'border-orange-500/40 shadow-lg shadow-orange-500/5' : 'border-ds-border hover:border-ds-border/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${platform.bgColor} flex items-center justify-center shrink-0 shadow-md`}>
                  <platform.icon className={`w-5 h-5 ${platform.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-ds-text text-sm">{platform.name}</p>
                  {isConnected && !isExpired ? (
                    <p className="text-ds-textMuted text-xs mt-0.5 text-green-500 font-medium">✓ Securely Linked</p>
                  ) : isExpired ? (
                    <p className="text-ds-textMuted text-xs mt-0.5 text-orange-400 font-medium">⚠️ Token Expired</p>
                  ) : (
                    <p className="text-ds-textMuted text-xs mt-0.5">{platform.description}</p>
                  )}
                </div>
              </div>

              <button
                disabled={platform.disabled && !isConnected}
                onClick={() => isExpired || !isConnected ? handleConnect(platform.id) : handleDisconnect(platform.id)}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isConnected && !isExpired
                    ? 'bg-ds-surface border border-ds-border text-ds-textMuted hover:bg-ds-background hover:text-red-400 hover:border-red-500/30'
                    : isExpired
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
                    : platform.disabled
                    ? 'bg-ds-surface border border-ds-border text-ds-textMuted opacity-50 cursor-not-allowed'
                    : 'bg-ds-primary hover:bg-ds-primaryHover text-ds-background shadow-sm shadow-ds-primary/20'
                }`}
              >
                {isConnected && !isExpired ? 'Disconnect' : isExpired ? 'Reconnect' : platform.disabled ? 'Unavailable' : '+ Connect'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
