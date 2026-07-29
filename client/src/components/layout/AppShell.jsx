import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useDigitalSuite } from '../../hooks/useDigitalSuite';
import { Calendar, Settings } from 'lucide-react';

const APP_NAVIGATION = [
  { id: 'calendar', label: 'Calendar', path: '', icon: 'Calendar' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'Settings' }
];

export function AppShell() {
  const { isEmbedded } = useDigitalSuite(APP_NAVIGATION);

  return (
    <div className="flex h-screen bg-ds-background text-ds-text overflow-hidden">
      {!isEmbedded && <Sidebar />}
      <main className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
