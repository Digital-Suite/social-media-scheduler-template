import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ChevronDown, Plus, Check, Briefcase } from 'lucide-react';

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, createWorkspace, loading } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  if (loading) return null;

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;
    await createWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
    setIsCreating(false);
    setIsOpen(false);
  };

  return (
    <div className="relative border-b border-ds-border bg-ds-surface px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-ds-primary/10 flex items-center justify-center border border-ds-primary/20">
          <Briefcase className="w-4 h-4 text-ds-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-ds-textMuted font-medium uppercase tracking-wider leading-tight">Workspace</span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-sm font-bold text-ds-text hover:text-ds-primary transition-colors leading-tight"
          >
            {activeWorkspace?.name || 'No Workspace'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-6 mt-2 w-72 bg-ds-surface border border-ds-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => { setActiveWorkspace(ws); setIsOpen(false); setIsCreating(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-ds-background transition-colors ${activeWorkspace?.id === ws.id ? 'bg-ds-primary/5 text-ds-primary' : 'text-ds-text'}`}
                >
                  <span className="text-sm font-medium">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
            
            <div className="border-t border-ds-border p-2">
              {isCreating ? (
                <div className="flex items-center gap-2 px-2 py-1">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Workspace name..."
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    className="flex-1 min-w-0 bg-ds-background border border-ds-border rounded text-sm px-2 py-1 text-ds-text focus:outline-none focus:border-ds-primary"
                  />
                  <button onClick={handleCreate} className="text-xs font-bold text-ds-primary hover:text-ds-primaryHover shrink-0">Add</button>
                  <button onClick={() => setIsCreating(false)} className="text-xs text-ds-textMuted hover:text-ds-text shrink-0">Cancel</button>
                </div>
              ) : (
                <button 
                  onClick={() => setIsCreating(true)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm text-ds-textMuted hover:text-ds-text hover:bg-ds-background rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
