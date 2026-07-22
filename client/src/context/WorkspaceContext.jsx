import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
        if (data.length > 0 && !activeWorkspace) {
          setActiveWorkspace(data[0]);
        } else if (data.length === 0) {
          // Auto-create default workspace if none exist
          const createRes = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Default Workspace' })
          });
          if (createRes.ok) {
            const newWs = await createRes.json();
            setWorkspaces([newWs]);
            setActiveWorkspace(newWs);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch workspaces', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const createWorkspace = async (name) => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const newWs = await res.json();
        setWorkspaces(prev => [...prev, newWs]);
        setActiveWorkspace(newWs);
        return newWs;
      }
    } catch (err) {
      console.error('Failed to create workspace', err);
    }
    return null;
  };

  const deleteWorkspace = async (id) => {
    try {
      const res = await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkspaces(prev => prev.filter(w => w.id !== id));
        if (activeWorkspace?.id === id) {
          setActiveWorkspace(workspaces.find(w => w.id !== id) || null);
        }
        return true;
      }
    } catch (err) {
      console.error('Failed to delete workspace', err);
    }
    return false;
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      createWorkspace,
      deleteWorkspace,
      loading
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
