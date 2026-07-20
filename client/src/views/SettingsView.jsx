import React, { useState } from 'react';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';
import { useSettings, TIMEZONES } from '../context/SettingsContext';

export function SettingsView() {
  const { timezone, setTimezone } = useSettings();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const filtered = TIMEZONES.filter(tz =>
    tz.label.toLowerCase().includes(search.toLowerCase()) ||
    tz.offset.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (tz) => {
    setTimezone(tz);
    setIsOpen(false);
    setSearch('');
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ds-text">Settings</h1>
        <p className="text-ds-textMuted text-sm mt-1">Manage your preferences and account configuration.</p>
      </div>

      {/* Timezone Card */}
      <div className="bg-ds-surface border border-ds-border rounded-2xl">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-ds-border rounded-t-2xl">
          <div className="w-9 h-9 rounded-xl bg-ds-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-ds-primary" />
          </div>
          <div>
            <p className="font-semibold text-ds-text text-sm">Timezone</p>
            <p className="text-xs text-ds-textMuted mt-0.5">All scheduled posts will use this timezone.</p>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Current Selection Display */}
          <div className="flex items-center justify-between bg-ds-background border border-ds-border rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ds-text">{timezone.label}</p>
              <p className="text-xs text-ds-textMuted mt-0.5">{timezone.offset} · {timezone.value}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-ds-primary/10 text-ds-primary rounded-md">Active</span>
          </div>

          {/* Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-ds-background border border-ds-border rounded-xl text-sm text-ds-text hover:border-ds-primary/50 transition-colors"
            >
              <span className="text-ds-textMuted">Change timezone…</span>
              <ChevronDown className={`w-4 h-4 text-ds-textMuted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="absolute z-20 top-full mt-2 w-full bg-ds-surface border border-ds-border rounded-xl shadow-2xl overflow-hidden">
                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-ds-border">
                  <Search className="w-4 h-4 text-ds-textMuted shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search timezones..."
                    className="flex-1 bg-transparent text-sm text-ds-text placeholder-ds-textMuted outline-none"
                  />
                </div>

                {/* List */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {filtered.length === 0 ? (
                    <p className="text-center text-ds-textMuted text-sm py-6">No timezones found.</p>
                  ) : (
                    filtered.map(tz => (
                      <button
                        key={tz.value}
                        onClick={() => handleSelect(tz)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-ds-background transition-colors ${timezone.value === tz.value ? 'bg-ds-primary/5' : ''}`}
                      >
                        <div>
                          <p className={`text-sm font-medium ${timezone.value === tz.value ? 'text-ds-primary' : 'text-ds-text'}`}>{tz.label}</p>
                          <p className="text-xs text-ds-textMuted">{tz.offset}</p>
                        </div>
                        {timezone.value === tz.value && (
                          <Check className="w-4 h-4 text-ds-primary shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 border-t border-ds-border flex justify-end">
          <button
            onClick={handleSave}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              saved
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-ds-primary hover:bg-ds-primaryHover text-ds-background shadow-sm shadow-ds-primary/20'
            }`}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
