import React from 'react';
import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="h-screen bg-ds-background text-ds-text overflow-hidden">
      <main className="h-full overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
