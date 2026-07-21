import React from 'react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin, FaPinterest } from 'react-icons/fa';
import { FaXTwitter, FaTiktok, FaBluesky, FaGooglePlay } from 'react-icons/fa6';
import { SiThreads, SiGoogle } from 'react-icons/si';
import { ConnectedAccounts } from '../components/ds-uikit/ConnectedAccounts';

const platforms = [
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: FaTiktok,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Short-form video content',
    followers: null,
  },
  {
    id: 'x',
    name: 'X',
    icon: FaXTwitter,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Temporarily unavailable',
    followers: null,
    disabled: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: FaInstagram,
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    description: 'Photos, Reels & Stories',
    followers: null,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: FaFacebook,
    iconColor: 'text-white',
    bgColor: 'bg-blue-600',
    description: 'Pages, groups & ads',
    followers: null,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: FaYoutube,
    iconColor: 'text-white',
    bgColor: 'bg-red-600',
    description: 'Videos, Shorts & community',
    followers: null,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: FaLinkedin,
    iconColor: 'text-white',
    bgColor: 'bg-blue-700',
    description: 'Professional network & B2B',
    followers: null,
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: SiThreads,
    iconColor: 'text-white',
    bgColor: 'bg-black',
    description: 'Text-based conversations',
    followers: null,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: FaPinterest,
    iconColor: 'text-white',
    bgColor: 'bg-red-600',
    description: 'Temporarily unavailable',
    followers: null,
    disabled: true,
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    icon: FaBluesky,
    iconColor: 'text-white',
    bgColor: 'bg-blue-500',
    description: 'Decentralized social network',
    followers: null,
  },
  {
    id: 'google',
    name: 'Google Business',
    icon: SiGoogle,
    iconColor: 'text-white',
    bgColor: 'bg-gradient-to-br from-blue-500 via-red-500 to-yellow-400',
    description: 'Business profile & reviews',
    followers: null,
  },
];

export function AccountsView() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ConnectedAccounts platforms={platforms} />
    </div>
  );
}

