import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { CalendarView } from './views/CalendarView';
import { AccountsView } from './views/AccountsView';
import { CreatePostView } from './views/CreatePostView';
import { SettingsView } from './views/SettingsView';
import { SettingsProvider } from './context/SettingsContext';

import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';

function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <WorkspaceProvider>
          <BrowserRouter>
            <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<CalendarView />} />
              <Route path="/accounts" element={<AccountsView />} />
              <Route path="/create" element={<CreatePostView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="*" element={<div className="p-8 text-ds-textMuted">Coming Soon</div>} />
            </Route>
          </Routes>
          </BrowserRouter>
        </WorkspaceProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
