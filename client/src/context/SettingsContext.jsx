import React, { createContext, useContext, useState } from 'react';

export const TIMEZONES = [
  { label: 'Pacific Time (US & Canada)',   value: 'America/Los_Angeles',   offset: 'UTC-8/UTC-7'  },
  { label: 'Mountain Time (US & Canada)',  value: 'America/Denver',        offset: 'UTC-7/UTC-6'  },
  { label: 'Central Time (US & Canada)',   value: 'America/Chicago',       offset: 'UTC-6/UTC-5'  },
  { label: 'Eastern Time (US & Canada)',   value: 'America/New_York',      offset: 'UTC-5/UTC-4'  },
  { label: 'Atlantic Time (Canada)',       value: 'America/Halifax',       offset: 'UTC-4/UTC-3'  },
  { label: 'UTC',                          value: 'UTC',                   offset: 'UTC+0'        },
  { label: 'London (GMT)',                 value: 'Europe/London',         offset: 'UTC+0/UTC+1'  },
  { label: 'Paris / Berlin (CET)',         value: 'Europe/Paris',          offset: 'UTC+1/UTC+2'  },
  { label: 'Helsinki (EET)',               value: 'Europe/Helsinki',       offset: 'UTC+2/UTC+3'  },
  { label: 'Moscow (MSK)',                 value: 'Europe/Moscow',         offset: 'UTC+3'        },
  { label: 'Dubai (GST)',                  value: 'Asia/Dubai',            offset: 'UTC+4'        },
  { label: 'Karachi (PKT)',                value: 'Asia/Karachi',          offset: 'UTC+5'        },
  { label: 'Mumbai / Kolkata (IST)',       value: 'Asia/Kolkata',          offset: 'UTC+5:30'     },
  { label: 'Dhaka (BST)',                  value: 'Asia/Dhaka',            offset: 'UTC+6'        },
  { label: 'Bangkok (ICT)',                value: 'Asia/Bangkok',          offset: 'UTC+7'        },
  { label: 'Singapore / Hong Kong (SGT)', value: 'Asia/Singapore',        offset: 'UTC+8'        },
  { label: 'Tokyo (JST)',                  value: 'Asia/Tokyo',            offset: 'UTC+9'        },
  { label: 'Sydney (AEST)',                value: 'Australia/Sydney',      offset: 'UTC+10/UTC+11'},
  { label: 'Auckland (NZST)',              value: 'Pacific/Auckland',      offset: 'UTC+12/UTC+13'},
  { label: 'Honolulu (HST)',               value: 'Pacific/Honolulu',      offset: 'UTC-10'       },
  { label: 'Anchorage (AKST)',             value: 'America/Anchorage',     offset: 'UTC-9/UTC-8'  },
  { label: 'São Paulo (BRT)',              value: 'America/Sao_Paulo',     offset: 'UTC-3'        },
  { label: 'Buenos Aires (ART)',           value: 'America/Argentina/Buenos_Aires', offset: 'UTC-3' },
  { label: 'Mexico City (CST)',            value: 'America/Mexico_City',   offset: 'UTC-6/UTC-5'  },
  { label: 'Toronto (ET)',                 value: 'America/Toronto',       offset: 'UTC-5/UTC-4'  },
  { label: 'Vancouver (PT)',               value: 'America/Vancouver',     offset: 'UTC-8/UTC-7'  },
  { label: 'Istanbul (TRT)',               value: 'Europe/Istanbul',       offset: 'UTC+3'        },
  { label: 'Cairo (EET)',                  value: 'Africa/Cairo',          offset: 'UTC+2'        },
  { label: 'Johannesburg (SAST)',          value: 'Africa/Johannesburg',   offset: 'UTC+2'        },
  { label: 'Lagos (WAT)',                  value: 'Africa/Lagos',          offset: 'UTC+1'        },
  { label: 'Nairobi (EAT)',               value: 'Africa/Nairobi',        offset: 'UTC+3'        },
];

const DEFAULT_TIMEZONE = TIMEZONES.find(tz => tz.value === 'America/New_York');

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [timeFormat, setTimeFormat] = useState('24h'); // '12h' or '24h'

  return (
    <SettingsContext.Provider value={{ timezone, setTimezone, timeFormat, setTimeFormat }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
