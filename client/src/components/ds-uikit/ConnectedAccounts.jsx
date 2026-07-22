import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export function ConnectedAccounts({ platforms }) {
  const { sessionToken, apiBaseUrl, connectedAccounts, setConnectedAccounts } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [workspaceAccountIds, setWorkspaceAccountIds] = useState([]);

  useEffect(() => {
    if (activeWorkspace) {
      fetch(`/api/workspaces/${activeWorkspace.id}/accounts`)
        .then(res => res.json())
        .then(data => setWorkspaceAccountIds(data))
        .catch(console.error);
    } else {
      setWorkspaceAccountIds([]);
    }
  }, [activeWorkspace]);

  const toggleWorkspaceLink = async (accountId, isLinked) => {
    if (!activeWorkspace) return;
    const newIds = isLinked 
      ? workspaceAccountIds.filter(id => String(id) !== String(accountId))
      : [...workspaceAccountIds, String(accountId)];
    
    setWorkspaceAccountIds(newIds);
    await fetch(`/api/workspaces/${activeWorkspace.id}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountIds: newIds })
    });
  };

  // Connect WebSocket for Real-time OAuth updates
  useEffect(() => {
    if (!apiBaseUrl || !sessionToken) return;

    const newSocket = io(apiBaseUrl, {
      auth: { token: sessionToken },
      transports: ['websocket', 'polling']
    });

    newSocket.on('social:oauth_success', async (data) => {
      if (data && data.account) {
        setConnectedAccounts(prev => {
          const exists = prev.find(a => a.id === data.account.id);
          return exists ? prev.map(a => a.id === data.account.id ? data.account : a) : [...prev, data.account];
        });
        
        // Auto-link new accounts to active workspace
        if (activeWorkspace) {
          const newAccountId = String(data.account.id);
          setWorkspaceAccountIds(prev => {
            if (!prev.includes(newAccountId)) {
              const newIds = [...prev, newAccountId];
              fetch(`/api/workspaces/${activeWorkspace.id}/accounts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountIds: newIds })
              }).catch(console.error);
              return newIds;
            }
            return prev;
          });
        }
      }
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [apiBaseUrl, sessionToken, activeWorkspace]);

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

  const handleDisconnect = async (accountId) => {
    if (!sessionToken || !apiBaseUrl) return;
    
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/accounts/disconnect/${accountId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      if (res.ok) {
        // Remove from local state
        setConnectedAccounts(prev => prev.filter(a => a.id !== accountId));
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
          // Find all connected accounts for this platform
          const providerAccounts = connectedAccounts.filter(a => a.provider.toLowerCase() === platform.id.toLowerCase());
          const isConnected = providerAccounts.length > 0;
          // If any account is expired, we flag the whole provider as having an issue
          const hasExpired = providerAccounts.some(a => a.isExpired);

          return (
            <div key={platform.id} className="flex flex-col gap-2">
              <div
                className={`bg-ds-surface border rounded-xl p-5 flex items-center justify-between transition-all duration-200 ${
                  isConnected && !hasExpired ? 'border-ds-primary/40 shadow-lg shadow-ds-primary/5' : 
                  hasExpired ? 'border-orange-500/40 shadow-lg shadow-orange-500/5' : 'border-ds-border hover:border-ds-border/80'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl ${platform.bgColor} flex items-center justify-center shrink-0 shadow-md`}>
                    <platform.icon className={`w-5 h-5 ${platform.iconColor}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-ds-text text-sm">{platform.name}</p>
                    {isConnected && !hasExpired ? (
                      <p className="text-ds-textMuted text-xs mt-0.5 text-green-500 font-medium">✓ Securely Linked</p>
                    ) : hasExpired ? (
                      <p className="text-ds-textMuted text-xs mt-0.5 text-orange-400 font-medium">⚠️ Token Expired</p>
                    ) : (
                      <p className="text-ds-textMuted text-xs mt-0.5">{platform.description}</p>
                    )}
                  </div>
                </div>

                <button
                  disabled={platform.disabled}
                  onClick={() => handleConnect(platform.id)}
                  className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isConnected
                      ? 'bg-ds-surface border border-ds-border text-ds-text hover:bg-ds-primary hover:border-ds-primary hover:text-ds-background'
                      : platform.disabled
                      ? 'bg-ds-surface border border-ds-border text-ds-textMuted opacity-50 cursor-not-allowed'
                      : 'bg-ds-primary hover:bg-ds-primaryHover text-ds-background shadow-sm shadow-ds-primary/20'
                  }`}
                >
                  {isConnected ? '+ Add Another' : platform.disabled ? 'Unavailable' : '+ Connect'}
                </button>
              </div>

              {/* Render connected sub-accounts */}
              {isConnected && (
                <div className="flex flex-col gap-2 pl-4 border-l-2 border-ds-border ml-6 mt-1">
                  {providerAccounts.map((account) => {
                    const isLinked = workspaceAccountIds.includes(String(account.id));
                    return (
                      <div key={account.id} className={`flex items-center justify-between rounded-lg p-3 border transition-colors ${isLinked ? 'bg-ds-surface border-ds-primary/30' : 'bg-ds-background border-ds-border opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          {account.metadata?.picture ? (
                            <img src={account.metadata.picture} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-ds-surface flex items-center justify-center">
                              <platform.icon className={`w-4 h-4 ${platform.iconColor}`} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-ds-text">{account.metadata?.username || account.providerAccountId}</p>
                            {account.metadata?.email && <p className="text-xs text-ds-textMuted">{account.metadata.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWorkspaceLink(account.id, isLinked)}
                            className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${isLinked ? 'bg-ds-primary/10 text-ds-primary hover:bg-ds-primary/20' : 'bg-ds-surface text-ds-textMuted hover:text-ds-text'}`}
                          >
                            {isLinked ? '✓ Workspace' : '+ Workspace'}
                          </button>
                          <button
                            onClick={() => handleDisconnect(account.id)}
                            className="text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10 px-2 py-1.5 rounded-md transition-colors"
                            title="Disconnect from OS"
                          >
                            Disconnect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
