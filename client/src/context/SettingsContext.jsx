import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDigitalSuite } from '../hooks/useDigitalSuite';

export const TIMEZONES = [
  { label: 'UTC', value: 'UTC', offset: 'UTC+0' },
  { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles', offset: 'UTC-8/UTC-7' },
  { label: 'Mountain Time (US & Canada)', value: 'America/Denver', offset: 'UTC-7/UTC-6' },
  { label: 'Central Time (US & Canada)', value: 'America/Chicago', offset: 'UTC-6/UTC-5' },
  { label: 'Eastern Time (US & Canada)', value: 'America/New_York', offset: 'UTC-5/UTC-4' },
  { label: 'London (GMT)', value: 'Europe/London', offset: 'UTC+0/UTC+1' },
  { label: 'Paris / Berlin (CET)', value: 'Europe/Paris', offset: 'UTC+1/UTC+2' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo', offset: 'UTC+9' },
  { label: 'Sydney (AEST)', value: 'Australia/Sydney', offset: 'UTC+10/UTC+11' }
];

const DEFAULT_TIMEZONE = TIMEZONES.find(tz => tz.value === 'UTC');

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [timeFormat, setTimeFormat] = useState('12h');

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'DIGITAL_SUITE_INIT') {
        const payload = event.data.payload;
        if (payload?.workspace?.timezone) {
          const tz = TIMEZONES.find(t => t.value === payload.workspace.timezone) || { label: payload.workspace.timezone, value: payload.workspace.timezone, offset: '' };
          setTimezone(tz);
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <SettingsContext.Provider value={{ timezone, setTimezone, timeFormat, setTimeFormat }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
