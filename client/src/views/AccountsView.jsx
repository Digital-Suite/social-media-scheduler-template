import React from 'react';
import { 
  Share2, 
  Hash, 
  Link2,
  Store,
  AlertCircle
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';

export function AccountsView() {
  const platforms = [
    { name: 'Facebook', icon: FaFacebook, color: 'text-blue-500' },
    { name: 'Instagram', icon: FaInstagram, color: 'text-pink-500' },
    { name: 'X (Twitter)', icon: FaTwitter, color: 'text-gray-400' },
    { name: 'YouTube', icon: FaYoutube, color: 'text-red-500' },
    { name: 'TikTok', icon: Hash, color: 'text-white' },
    { name: 'LinkedIn', icon: FaLinkedin, color: 'text-blue-400' },
    { name: 'Threads', icon: Share2, color: 'text-gray-300' },
    { name: 'Pinterest', icon: Link2, color: 'text-red-400' },
    { name: 'Google Business', icon: Store, color: 'text-blue-600' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ds-text">Available Platforms</h1>
          <p className="text-ds-textMuted text-sm mt-1">Connect new social media accounts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <div 
            key={platform.name}
            className="bg-ds-surface border border-ds-border p-4 rounded-xl flex items-center justify-between hover:border-ds-primary/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <platform.icon className={`w-6 h-6 ${platform.color}`} />
              <span className="font-semibold text-ds-text">{platform.name}</span>
            </div>
            <button className="bg-ds-background border border-ds-border hover:bg-ds-primary hover:border-ds-primary hover:text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all">
              + Connect
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
