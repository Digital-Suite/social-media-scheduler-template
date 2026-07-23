import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Building2, Plus, ArrowRight, Loader2 } from 'lucide-react';

export function WorkspaceSelectionView() {
  const { workspaces, setActiveWorkspace, createWorkspace, loading } = useWorkspace();
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingId, setCreatingId] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setCreatingId(true);
    await createWorkspace(newWorkspaceName.trim());
    // Context will setActiveWorkspace automatically from createWorkspace,
    // which unmounts this view!
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-ds-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-ds-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-ds-background relative overflow-y-auto custom-scrollbar">
      {/* Background gradients for premium feel */}
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-ds-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="min-h-full flex flex-col items-center justify-center py-24">
        <div className="z-10 text-center mb-12 max-w-2xl px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-ds-text mb-4 tracking-tight">Select your Workspace</h1>
          <p className="text-ds-textMuted text-lg">Choose a workspace to manage its connected accounts, scheduled posts, and calendar events.</p>
        </div>

        <div className="z-10 w-full max-w-5xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Existing Workspaces */}
        {workspaces.map(ws => (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws)}
            className="group relative bg-ds-surface/60 backdrop-blur-md border border-ds-border rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-ds-primary/40 overflow-hidden flex flex-col"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-ds-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="w-12 h-12 rounded-xl bg-ds-background border border-ds-border flex items-center justify-center mb-6 shrink-0 group-hover:scale-110 group-hover:border-ds-primary/30 transition-all duration-300">
              <Building2 className="w-6 h-6 text-ds-primary" />
            </div>
            
            <h3 className="text-xl font-bold text-ds-text mb-2 line-clamp-1">{ws.name}</h3>
            <p className="text-sm text-ds-textMuted mt-auto flex items-center gap-2 group-hover:text-ds-primary transition-colors">
              Enter workspace <ArrowRight className="w-4 h-4" />
            </p>
          </button>
        ))}

        {/* Create New Workspace Card */}
        <div className={`relative bg-ds-surface/30 backdrop-blur-md border border-dashed border-ds-border rounded-2xl p-6 transition-all duration-300 ${isCreating ? 'border-ds-primary/40 bg-ds-surface/60' : 'hover:border-ds-textMuted hover:bg-ds-surface/50'}`}>
          {!isCreating ? (
            <button 
              onClick={() => setIsCreating(true)}
              className="w-full h-full flex flex-col items-center justify-center min-h-[160px] gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-ds-background border border-ds-border flex items-center justify-center text-ds-textMuted transition-colors duration-300 group-hover:text-ds-text">
                <Plus className="w-6 h-6" />
              </div>
              <p className="font-medium text-ds-textMuted">Create New Workspace</p>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="w-full h-full flex flex-col justify-center min-h-[160px]">
              <label className="text-sm font-medium text-ds-text mb-2">Workspace Name</label>
              <input
                autoFocus
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-ds-background border border-ds-border rounded-lg px-4 py-3 text-ds-text placeholder:text-ds-textMuted focus:outline-none focus:border-ds-primary mb-4"
                disabled={creatingId}
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!newWorkspaceName.trim() || creatingId}
                  className="flex-1 bg-ds-primary hover:bg-ds-primaryHover text-ds-background font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {creatingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  disabled={creatingId}
                  className="px-4 py-2.5 text-sm font-medium text-ds-textMuted hover:text-ds-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
