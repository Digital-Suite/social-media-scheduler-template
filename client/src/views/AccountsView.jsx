import React, { useState } from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { FaXTwitter, FaTiktok, FaBluesky, FaGooglePlay } from 'react-icons/fa6';
import { SiThreads, SiGoogle } from 'react-icons/si';

const platforms = [
  {
    name: 'TikTok',
    icon: FaTiktok,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Short-form video content',
    followers: null,
  },
  {
    name: 'Instagram',
    icon: FaInstagram,
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    description: 'Photos, Reels & Stories',
    followers: null,
  },
  {
    name: 'Facebook',
    icon: FaFacebook,
    iconColor: 'text-white',
    bgColor: 'bg-blue-600',
    description: 'Pages, groups & ads',
    followers: null,
  },
  {
    name: 'X',
    icon: FaXTwitter,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Tweets, threads & spaces',
    followers: null,
  },
  {
    name: 'YouTube',
    icon: FaYoutube,
    iconColor: 'text-white',
    bgColor: 'bg-red-600',
    description: 'Videos, Shorts & community',
    followers: null,
  },
  {
    name: 'LinkedIn',
    icon: FaLinkedin,
    iconColor: 'text-white',
    bgColor: 'bg-blue-700',
    description: 'Professional network & B2B',
    followers: null,
  },
  {
    name: 'Threads',
    icon: SiThreads,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Text-based conversations',
    followers: null,
  },
  {
    name: 'Pinterest',
    icon: FaPinterest,
    iconColor: 'text-white',
    bgColor: 'bg-red-600',
    description: 'Visual discovery & ideas',
    followers: null,
  },
  {
    name: 'Bluesky',
    icon: FaBluesky,
    iconColor: 'text-white',
    bgColor: 'bg-blue-500',
    description: 'Decentralized social network',
    followers: null,
  },
  {
    name: 'Google Business',
    icon: SiGoogle,
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400',
    description: 'Business profile & reviews',
    followers: null,
  },
];

export function AccountsView() {
  const [connected, setConnected] = useState({});

  const handleConnect = (name) => {
    setConnected(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ds-text">Connected Accounts</h1>
          <p className="text-ds-textMuted text-sm mt-1">Connect your social media accounts to start scheduling posts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-ds-textMuted bg-ds-surface border border-ds-border px-4 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-ds-primary inline-block"></span>
          {Object.values(connected).filter(Boolean).length} / {platforms.length} connected
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const isConnected = !!connected[platform.name];
          return (
            <div
              key={platform.name}
              className={`bg-ds-surface border rounded-xl p-5 flex items-center justify-between transition-all duration-200 ${
                isConnected ? 'border-ds-primary/40 shadow-lg shadow-ds-primary/5' : 'border-ds-border hover:border-ds-border/80'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl ${platform.bgColor} flex items-center justify-center shrink-0 shadow-md`}>
                  <platform.icon className={`w-5 h-5 ${platform.iconColor}`} />
                </div>
                <div>
                  <p className="font-semibold text-ds-text text-sm">{platform.name}</p>
                  <p className="text-ds-textMuted text-xs mt-0.5">{platform.description}</p>
                </div>
              </div>

              <button
                onClick={() => handleConnect(platform.name)}
                className={`shrink-0 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isConnected
                    ? 'bg-ds-background border border-ds-border text-ds-textMuted hover:border-red-500/50 hover:text-red-400'
                    : 'bg-ds-primary hover:bg-ds-primaryHover text-ds-background shadow-sm shadow-ds-primary/20'
                }`}
              >
                {isConnected ? 'Disconnect' : '+ Connect'}
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
}
