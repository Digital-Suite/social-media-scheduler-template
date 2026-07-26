import React, { useState, useEffect, useMemo } from 'react';
import { Database, Search, X, Lock, Cpu, Zap, Cloud, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  Database,
  Cpu,
  Zap,
  Cloud
};

export const FALLBACK_MODELS = [
  // Local Models
  { id: 'local', name: 'Digital Suite Model', provider: 'Local Network', icon: 'Database', color: '#40b355', requiresKey: false },
  
  // OpenAI Models
  { id: 'gpt-5.5', name: 'GPT-5.5', provider: 'OpenAI', icon: 'Cpu', color: '#10a37f', requiresKey: 'openAIApiKey' },
  { id: 'gpt-5.4', name: 'GPT-5.4', provider: 'OpenAI', icon: 'Cpu', color: '#10a37f', requiresKey: 'openAIApiKey' },
  { id: 'gpt-5.4-mini', name: 'GPT-5.4-mini', provider: 'OpenAI', icon: 'Cpu', color: '#10a37f', requiresKey: 'openAIApiKey' },

  // Anthropic Models
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'Anthropic', icon: 'Cloud', color: '#d97757', requiresKey: 'anthropicApiKey' },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'Anthropic', icon: 'Cloud', color: '#d97757', requiresKey: 'anthropicApiKey' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'Anthropic', icon: 'Cloud', color: '#d97757', requiresKey: 'anthropicApiKey' },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'Anthropic', icon: 'Cloud', color: '#d97757', requiresKey: 'anthropicApiKey' },

  // Google AI Models
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', provider: 'Google AI', icon: 'Zap', color: '#3b82f6', requiresKey: 'geminiApiKey' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'Google AI', icon: 'Zap', color: '#3b82f6', requiresKey: 'geminiApiKey' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'Google AI', icon: 'Zap', color: '#3b82f6', requiresKey: 'geminiApiKey' },
];

export function ModelSelectorMenu({ models, onSelect, onClose, selectedModel }) {
  const [search, setSearch] = useState('');

  const hasKey = (model) => {
    return true; // Assume all are available in template context
  };

  const filteredModels = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase();
    let result = models;
    if (!lowerSearch) return result;
    return result.filter(m => 
      m.name.toLowerCase().includes(lowerSearch) || 
      m.provider.toLowerCase().includes(lowerSearch)
    );
  }, [search, models]);

  return (
    <div 
      className="absolute top-full left-0 mt-2 w-[340px] bg-[var(--color-surface)] border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden animate-page-enter flex flex-col"
      style={{ 
        borderColor: 'var(--color-border)', 
        zIndex: 50, 
        maxHeight: '400px' 
      }}
    >
      {/* Header & Search */}
      <div className="p-3 border-b flex flex-col gap-3 bg-[var(--color-surface-raised)]" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)]">AI Model Engine</span>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-bg)] px-3 py-2 rounded-xl border transition-all shadow-inner" style={{ borderColor: 'var(--color-border-subtle)' }}>
          <Search size={14} className="text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            autoFocus
            placeholder="Search AI models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-text-faint)]"
          />
        </div>
      </div>

      {/* List of Models */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
        {!models || models.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No models available
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No models match "{search}"
          </div>
        ) : (
          filteredModels.map((model) => {
            const available = hasKey(model);
            const Icon = ICON_MAP[model.icon] || Database;
            const isSelected = model.id === (selectedModel?.id || selectedModel);
            
            return (
              <button
                key={model.id}
                onClick={() => { 
                  if (available) {
                    onSelect(model); 
                    onClose(); 
                  }
                }}
                className={`text-left p-3 rounded-xl border flex items-center justify-between transition-all group ${
                  isSelected
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/50'
                    : available 
                      ? 'hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-primary)] cursor-pointer' 
                      : 'opacity-60 hover:opacity-100 hover:bg-[var(--color-surface-raised)] cursor-pointer grayscale hover:grayscale-0'
                }`}
                style={{ borderColor: isSelected ? 'var(--color-primary)' : 'transparent' }}
                title={available ? `Select ${model.name}` : `API Key required. Click to configure in Settings.`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${available ? 'group-hover:scale-105 shadow-sm' : ''}`}
                    style={{ background: `${model.color}15`, border: `1px solid ${model.color}30` }}
                  >
                    {available ? <Icon size={18} style={{ color: model.color }} /> : <Lock size={18} style={{ color: 'var(--color-text-muted)' }} />}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className={`text-sm font-bold truncate transition-colors ${available ? 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}>
                      {model.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-faint)] mt-0.5">
                      {model.provider}
                    </span>
                  </div>
                </div>

                {!available ? (
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-[var(--color-surface-raised)] px-2 py-1 rounded-md text-[var(--color-text-muted)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                    Requires Key
                  </span>
                ) : isSelected ? (
                  <div className="flex items-center justify-center text-[var(--color-primary)] mr-1">
                    <Check size={18} />
                  </div>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
