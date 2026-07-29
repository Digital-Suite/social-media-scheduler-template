import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  FileEdit, 
  BarChart2, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  ChevronDown 
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper for Tailwind class merging
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Sidebar() {
  const mainLinks = [
    { name: 'Calendar', to: '/', icon: Calendar },
  ];

  const configLinks = [
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-ds-surface border-r border-ds-border flex flex-col hidden md:flex shrink-0 sticky top-0">
      


      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-6">
        
        {/* Main Section */}
        <div>
          <div className="text-xs font-bold text-ds-textMuted uppercase tracking-wider mb-2 px-3">
            Main
          </div>
          <nav className="space-y-1">
            {mainLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-ds-primary/10 text-ds-primary" 
                    : "text-ds-textMuted hover:bg-ds-border/50 hover:text-ds-text"
                )}
              >
                <link.icon className={cn("w-5 h-5")} />
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Configuration Section */}
        <div>
          <div className="text-xs font-bold text-ds-textMuted uppercase tracking-wider mb-2 px-3">
            Configuration
          </div>
          <nav className="space-y-1">
            {configLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.to}
                className={({ isActive }) => cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                  isActive 
                    ? "bg-ds-primary/10 text-ds-primary" 
                    : "text-ds-textMuted hover:bg-ds-border/50 hover:text-ds-text"
                )}
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </div>
                {link.badge && (
                  <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
    </aside>
  );
}
