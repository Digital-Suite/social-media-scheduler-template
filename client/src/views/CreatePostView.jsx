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
  CalendarClock
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ACCOUNTS = [
  { id: 1, name: 'Hasan Cagli', handle: '@hasancaglibusiness', platform: 'facebook', connected: true },
  { id: 2, name: 'Hasan Cagli', handle: '@hasanccagli', platform: 'tiktok', connected: true },
  { id: 3, name: 'Hasan Cagli', handle: '@hasancagli', platform: 'linkedin', connected: true },
  { id: 4, name: 'Hasan Cagli', handle: '@hasancagli', platform: 'youtube', connected: true },
  { id: 5, name: 'hasancaglix', handle: '@hasancaglix', platform: 'instagram', connected: true },
  { id: 6, name: 'HsanC_', handle: '@hsanc_', platform: 'twitter', connected: true },
];

export function CreatePostView() {
  const [selectedAccounts, setSelectedAccounts] = useState([1, 2]);
  const [caption, setCaption] = useState("Excited to announce our new Social Media Scheduler feature in the Digital Suite OS! 🚀\n\n#DigitalSuite #SaaS #Productivity");
  const [useSameCaption, setUseSameCaption] = useState(true);
  const [platformCaptions, setPlatformCaptions] = useState({});
  const [showAiMenu, setShowAiMenu] = useState(false);

  const toggleAccount = (id) => {
    setSelectedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const PlatformIcon = ({ platform }) => {
    switch (platform) {
      case 'facebook': return <div className="w-5 h-5 bg-blue-500 rounded-full text-white flex items-center justify-center p-1"><FaFacebook className="w-3 h-3" /></div>;
      case 'instagram': return <div className="w-5 h-5 bg-pink-500 rounded-full text-white flex items-center justify-center p-1"><FaInstagram className="w-3 h-3" /></div>;
      case 'twitter': return <div className="w-5 h-5 bg-gray-300 rounded-full text-black flex items-center justify-center p-1"><FaTwitter className="w-3 h-3" /></div>;
      case 'linkedin': return <div className="w-5 h-5 bg-blue-600 rounded-full text-white flex items-center justify-center p-1"><FaLinkedin className="w-3 h-3" /></div>;
      case 'youtube': return <div className="w-5 h-5 bg-red-500 rounded-full text-white flex items-center justify-center p-1"><FaYoutube className="w-3 h-3" /></div>;
      case 'tiktok': return <div className="w-5 h-5 bg-white rounded-full text-black flex items-center justify-center p-1 font-bold text-[8px]">tik</div>;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ds-text flex items-center gap-3">
            Create New Post
            <button className="flex items-center gap-1 text-xs font-medium bg-ds-surface border border-ds-border px-2 py-1 rounded-md text-ds-textMuted hover:text-ds-text">
              <FileText className="w-3 h-3" /> Guide
            </button>
          </h1>
          <p className="text-ds-textMuted text-sm mt-1">Design, caption, and schedule your content across platforms.</p>
        </div>
        
        <button className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-ds-primary hover:bg-ds-primaryHover text-ds-background font-bold transition-colors shadow-lg shadow-ds-primary/20 shrink-0">
          <CalendarClock className="w-5 h-5" />
          Schedule Post
        </button>
      </div>

      {/* Main Content Vertical Stack */}
      <div className="flex flex-col gap-6 flex-1 pb-10 w-full">
        
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

              <div className="flex flex-col items-center gap-3 mt-4 w-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-ds-border flex-1"></div>
                  <span className="text-xs text-ds-textMuted uppercase font-bold">Import</span>
                  <div className="h-px bg-ds-border flex-1"></div>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button className="flex items-center gap-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 border border-green-500/20 hover:border-green-500/40 px-4 py-2 rounded-lg text-sm font-medium text-green-400 transition-colors">
                    <Sparkles className="w-4 h-4" /> AI Generate
                  </button>
                </div>
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
                {MOCK_ACCOUNTS.map(acc => (
                  <label key={acc.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ds-surface cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedAccounts.includes(acc.id) ? 'bg-ds-primary border-ds-primary' : 'border-ds-border bg-transparent group-hover:border-gray-500'}`}>
                      {selectedAccounts.includes(acc.id) && <CheckCircle2 className="w-3 h-3 text-ds-background" />}
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-ds-surface border border-ds-border flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.name}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 ring-2 ring-ds-background rounded-full">
                        <PlatformIcon platform={acc.platform} />
                      </div>
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-sm font-medium text-ds-text leading-tight truncate">{acc.name}</span>
                      <span className="text-xs text-ds-textMuted leading-tight truncate">{acc.handle}</span>
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
                  {MOCK_ACCOUNTS.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                    <div key={acc.id} className="flex items-center gap-1.5 px-2 py-1 bg-ds-background border border-ds-border rounded-md shrink-0">
                      <PlatformIcon platform={acc.platform} />
                      <span className="text-xs font-medium text-ds-text">{acc.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
              {MOCK_ACCOUNTS.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                <div key={acc.id} className="bg-ds-background border border-ds-border rounded-xl flex flex-col relative min-h-[200px] shrink-0">
                  <div className="flex items-center justify-between p-3 border-b border-ds-border bg-ds-surface/50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={acc.platform} />
                      <span className="text-sm font-medium text-ds-text">{acc.name}</span>
                    </div>
                    <span className="text-xs font-mono text-ds-textMuted">{(platformCaptions[acc.id] || '').length}/3000</span>
                  </div>
                  <div className="relative p-4 flex-1 flex flex-col">
                    <textarea 
                      value={platformCaptions[acc.id] || ''}
                      onChange={(e) => setPlatformCaptions({...platformCaptions, [acc.id]: e.target.value})}
                      className="w-full flex-1 bg-transparent text-ds-text placeholder-ds-textMuted resize-none outline-none focus:ring-0 text-sm leading-relaxed custom-scrollbar"
                      placeholder={`Write your caption for ${acc.platform.charAt(0).toUpperCase() + acc.platform.slice(1)}...`}
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
