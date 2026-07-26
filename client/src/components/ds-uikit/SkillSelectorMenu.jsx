import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';

export function SkillSelectorMenu({ skills, onSelect, onClose }) {
  const [search, setSearch] = useState('');

  const filteredSkills = useMemo(() => {
    if (!search.trim()) return skills;
    const lower = search.toLowerCase();
    return skills.filter(s => 
      s.name?.toLowerCase().includes(lower) || 
      s.category?.toLowerCase().includes(lower) ||
      s.description?.toLowerCase().includes(lower)
    );
  }, [skills, search]);

  return (
    <div 
      className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface)] border rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-page-enter flex flex-col"
      style={{ 
        borderColor: 'var(--color-border)', 
        zIndex: 50, 
        maxHeight: '50vh' 
      }}
    >
      {/* Header & Search */}
      <div className="p-3 border-b flex items-center gap-3 bg-[var(--color-surface-raised)] transition-colors" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex-1 flex items-center gap-2 bg-[var(--color-bg)] px-3 py-2 rounded-xl border transition-all duration-300" style={{ borderColor: 'transparent' }}>
          <Icons.Search size={16} className="text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            autoFocus
            placeholder="Search skills and personas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--color-text)] placeholder-[var(--color-text-faint)]"
          />
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
          <Icons.X size={18} />
        </button>
      </div>

      {/* Grid of Skills */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {!skills || skills.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)] flex flex-col items-center">
            <Icons.ShoppingBag size={24} className="mb-2 opacity-50" />
            <p>No skills installed yet.</p>
            <p className="text-xs opacity-70 mt-1">Visit the Marketplace to expand capabilities.</p>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            No skills match "{search}"
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {filteredSkills.map((skill) => {
              const Icon = Icons[skill.icon] || Icons.Wand2;
              return (
                <button
                  key={skill.id}
                  onClick={() => { 
                    // Assume all skills are active in template context
                    onSelect(skill); 
                    onClose(); 
                  }}
                  className={`text-left p-3 rounded-xl border flex items-start gap-3 transition-all hover:bg-[var(--color-surface-raised)] hover:border-[var(--color-primary)] hover:shadow-sm group cursor-pointer`}
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <div 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}
                    style={{ background: `${skill.accentColor || 'var(--color-primary)'}18` }}
                  >
                    <Icon size={20} style={{ color: skill.accentColor || 'var(--color-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`text-sm font-semibold text-[var(--color-text)] truncate transition-colors group-hover:text-[var(--color-primary)]`}>
                        {skill.name}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                      {skill.shortDescription || skill.short_description || skill.description || 'Specialized AI capability'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
