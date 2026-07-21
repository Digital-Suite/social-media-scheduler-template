import React, { useState } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon,
  Sparkles,
  Search,
  Box,
  FileText,
  MessageSquare,
  Wand2,
  Hash,
  CheckCircle2,
  CalendarClock,
  ArrowLeft
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';

export function CreatePostView() {
  const { sessionToken, connectedAccounts, apiBaseUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTime = () => {
    // Current time + 30 minutes
    const date = addMinutes(new Date(), 30);
    
    // If a specific date was selected from the calendar
    if (location.state?.date) {
      const parts = location.state.date.split('-'); // yyyy-MM-dd
      date.setFullYear(parseInt(parts[0], 10));
      date.setMonth(parseInt(parts[1], 10) - 1);
      date.setDate(parseInt(parts[2], 10));
    }
    
    // Format for datetime-local input (yyyy-MM-ddThh:mm)
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [caption, setCaption] = useState("Excited to announce our new feature! 🚀\n\n#SaaS");
  const [useSameCaption, setUseSameCaption] = useState(true);
  const [platformCaptions, setPlatformCaptions] = useState({});
  const [postTime, setPostTime] = useState(getInitialTime());
  const [mediaUrl, setMediaUrl] = useState('https://www.w3schools.com/html/mov_bbb.mp4'); // Dummy video
  const [isScheduling, setIsScheduling] = useState(false);

  const toggleAccount = (id) => {
    setSelectedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSchedule = async () => {
    if (!postTime) {
      alert("Please select a date and time to schedule the post.");
      return;
    }
    if (selectedAccounts.length === 0) {
      alert("Please select at least one account.");
      return;
    }

    setIsScheduling(true);
    try {
      for (const accountId of selectedAccounts) {
        const account = connectedAccounts.find(a => a.id === accountId);
        if (!account) continue;

        const postCaption = useSameCaption ? caption : (platformCaptions[accountId] || caption);
        
        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: account.provider,
            content: postCaption,
            mediaUrl: mediaUrl,
            postTime: postTime,
            sessionToken: sessionToken,
            apiBaseUrl: apiBaseUrl
          })
        });
      }
      alert("Posts scheduled successfully!");
      navigate('/');
    } catch (err) {
      alert("Failed to schedule posts: " + err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const PlatformIcon = ({ platform }) => {
    switch (platform) {
      case 'facebook': return <div className="w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center p-1"><FaFacebook className="w-3 h-3" /></div>;
      case 'instagram': return <div className="w-5 h-5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full text-white flex items-center justify-center p-1"><FaInstagram className="w-3 h-3" /></div>;
      case 'x': return <div className="w-5 h-5 bg-black rounded-full text-white flex items-center justify-center p-1"><FaXTwitter className="w-3 h-3" /></div>;
      case 'twitter': return <div className="w-5 h-5 bg-black rounded-full text-white flex items-center justify-center p-1"><FaXTwitter className="w-3 h-3" /></div>;
      case 'linkedin': return <div className="w-5 h-5 bg-blue-700 rounded-full text-white flex items-center justify-center p-1"><FaLinkedin className="w-3 h-3" /></div>;
      case 'youtube': return <div className="w-5 h-5 bg-red-600 rounded-full text-white flex items-center justify-center p-1"><FaYoutube className="w-3 h-3" /></div>;
      case 'tiktok': return <div className="w-5 h-5 bg-black rounded-full text-white flex items-center justify-center p-1"><FaTiktok className="w-3 h-3" /></div>;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col w-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm font-medium text-ds-textMuted hover:text-ds-text self-start transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Calendar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ds-text flex items-center gap-3">
              Create New Post
            </h1>
            <p className="text-ds-textMuted text-sm mt-1">Design, caption, and schedule your content across platforms.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <input 
            type="datetime-local" 
            value={postTime}
            onChange={(e) => setPostTime(e.target.value)}
            className="bg-ds-surface border border-ds-border text-ds-text rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ds-primary"
          />
          <button 
            onClick={handleSchedule}
            disabled={isScheduling}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-ds-primary hover:bg-ds-primaryHover disabled:opacity-50 text-ds-background font-bold transition-colors shadow-lg shadow-ds-primary/20 shrink-0"
          >
            <CalendarClock className="w-5 h-5" />
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </div>
      </div>

      {/* Main Content Vertical Stack */}
      <div className="flex flex-col gap-6 flex-1 w-full">
        
          {/* Step 1: Media */}
          <div className="space-y-3 bg-ds-surface p-6 rounded-2xl border border-ds-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-ds-primary/20 text-ds-primary flex items-center justify-center text-xs font-bold">1</div>
              <h3 className="font-semibold text-ds-text">Media <span className="text-ds-textMuted font-normal">(optional)</span></h3>
            </div>
            
            <div className="border-2 border-dashed border-ds-border hover:border-ds-primary/50 transition-colors rounded-xl p-8 bg-ds-background/50 flex flex-col items-center justify-center gap-4 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button className="flex items-center gap-1.5 text-xs font-medium bg-ds-surface border border-ds-border px-3 py-1.5 rounded-lg text-ds-text hover:bg-ds-border">
                  <ImageIcon className="w-3.5 h-3.5" /> Files
                </button>
              </div>
              
              <div className="flex flex-col items-center gap-2 text-center mt-2">
                <div className="w-12 h-12 bg-ds-surface rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="w-6 h-6 text-ds-textMuted" />
                </div>
                <p className="font-medium text-ds-text text-lg">Drag & Drop</p>
                <p className="text-ds-textMuted text-sm">or click to browse</p>
              </div>


            </div>
          </div>

          {/* Step 2: Accounts */}
          <div className="space-y-3 bg-ds-surface p-6 rounded-2xl border border-ds-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-ds-primary/20 text-ds-primary flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-semibold text-ds-text">Select Accounts</h3>
              </div>
              <div className="flex gap-2">
                <button className="text-xs font-medium bg-ds-background border border-ds-border px-3 py-1.5 rounded-lg text-ds-text hover:bg-ds-border">All</button>
              </div>
            </div>
            
            <div className="bg-ds-background border border-ds-border rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {connectedAccounts.map(acc => (
                  <label 
                    key={acc.id} 
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-ds-surface cursor-pointer group"
                    onClick={(e) => {
                      e.preventDefault();
                      toggleAccount(acc.id);
                    }}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAccounts.includes(acc.id) ? 'bg-ds-primary border-ds-primary' : 'border-ds-border bg-transparent group-hover:border-gray-500'}`}>
                      {selectedAccounts.includes(acc.id) && <CheckCircle2 className="w-3 h-3 text-ds-background" />}
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-ds-surface border border-ds-border flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.metadata?.username || acc.provider}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 ring-2 ring-ds-background rounded-full">
                        <PlatformIcon platform={acc.provider} />
                      </div>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium text-ds-text leading-tight truncate">{acc.metadata?.username || 'User'}</span>
                      <span className="text-xs text-ds-textMuted leading-tight truncate">@{acc.provider}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        
        {/* Right Column: Captions */}
        <div className="bg-ds-surface p-6 rounded-2xl border border-ds-border flex flex-col h-full">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-ds-primary/20 text-ds-primary flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="font-semibold text-ds-text">Caption</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={useSameCaption} onChange={(e) => setUseSameCaption(e.target.checked)} />
                <div className="w-9 h-5 bg-ds-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ds-primary"></div>
              </label>
              <span className="text-sm font-medium text-ds-text">Use same caption for all platforms</span>
            </div>
          </div>
          
          {useSameCaption ? (
            <div className="bg-ds-background border border-ds-border rounded-xl flex flex-col relative flex-1 min-h-[300px]">
              <div className="flex items-center justify-between p-3 border-b border-ds-border bg-ds-surface/50 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-ds-text">Caption for all platforms</span>
                </div>
                <span className="text-xs font-mono text-ds-textMuted">{caption.length}/3000</span>
              </div>
              
              <div className="relative p-4 flex-1 flex flex-col">
                <textarea 
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full flex-1 bg-transparent text-ds-text placeholder-ds-textMuted resize-none outline-none focus:ring-0 text-sm leading-relaxed custom-scrollbar"
                  placeholder="Write your caption here..."
                />
              </div>

              {selectedAccounts.length > 0 && (
                <div className="p-3 border-t border-ds-border bg-ds-surface/30 rounded-b-xl flex gap-2 overflow-x-auto custom-scrollbar">
                  {connectedAccounts.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                    <div key={acc.id} className="flex items-center gap-1.5 px-2 py-1 bg-ds-background border border-ds-border rounded-md shrink-0">
                      <PlatformIcon platform={acc.provider} />
                      <span className="text-xs font-medium text-ds-text">{acc.metadata?.username || 'User'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
              {connectedAccounts.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                <div key={acc.id} className="bg-ds-background border border-ds-border rounded-xl flex flex-col relative min-h-[200px] shrink-0">
                  <div className="flex items-center justify-between p-3 border-b border-ds-border bg-ds-surface/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={acc.provider} />
                      <span className="text-sm font-medium text-ds-text">{acc.metadata?.username || 'User'}</span>
                    </div>
                    <span className="text-xs font-mono text-ds-textMuted">{(platformCaptions[acc.id] || '').length}/3000</span>
                  </div>
                  <div className="relative p-4 flex-1 flex flex-col">
                    <textarea 
                      value={platformCaptions[acc.id] || ''}
                      onChange={(e) => setPlatformCaptions({...platformCaptions, [acc.id]: e.target.value})}
                      className="w-full flex-1 bg-transparent text-ds-text placeholder-ds-textMuted resize-none outline-none focus:ring-0 text-sm leading-relaxed custom-scrollbar"
                      placeholder={`Write your caption for ${acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)}...`}
                    />
                  </div>
                </div>
              ))}
              {selectedAccounts.length === 0 && (
                <div className="flex items-center justify-center flex-1 text-ds-textMuted text-sm italic border border-ds-border border-dashed rounded-xl p-8 bg-ds-background/50">
                  Select an account to write a caption.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
