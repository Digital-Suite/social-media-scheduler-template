import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  Copy,
  RefreshCw,
  Quote,
  X as XIcon,
  ExternalLink,
  Clock
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export function PostDetailsModal({ isOpen, posts, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (isOpen) setActiveIndex(0);
  }, [isOpen]);

  if (!posts || posts.length === 0) return null;

  const post = posts[activeIndex];
  const isGroup = posts.length > 1;

  const PlatformIcon = ({ platform }) => {
    switch (platform) {
      case 'facebook': return <FaFacebook className="w-5 h-5 text-blue-500" />;
      case 'instagram': return <FaInstagram className="w-5 h-5 text-pink-500" />;
      case 'twitter': return <FaTwitter className="w-5 h-5 text-ds-text" />;
      case 'linkedin': return <FaLinkedin className="w-5 h-5 text-blue-600" />;
      case 'youtube': return <FaYoutube className="w-5 h-5 text-red-500" />;
      case 'tiktok': return <div className="w-5 h-5 bg-white rounded-full text-black flex items-center justify-center p-1 font-bold text-[8px]">tik</div>;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-h-[90vh] bg-ds-surface border border-ds-border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isGroup ? "max-w-4xl" : "max-w-2xl"}`}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-ds-border flex items-center justify-between shrink-0 bg-ds-background z-10">
              <div>
                <h2 className="text-xl font-bold text-ds-text flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-ds-primary" />
                  Post Details
                </h2>
                <p className="text-ds-textMuted text-sm">View and manage your social media post</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-ds-surface rounded-full text-ds-textMuted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              
              {/* Vertical Tabs Sidebar */}
              {isGroup && (
                <div className="w-64 border-r border-ds-border bg-ds-background flex flex-col overflow-y-auto shrink-0 custom-scrollbar">
                  {posts.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => setActiveIndex(idx)}
                      className={`flex items-start gap-3 p-4 border-b border-ds-border/50 text-left transition-colors hover:bg-ds-surface ${activeIndex === idx ? "bg-ds-surface border-l-2 border-l-ds-primary" : "border-l-2 border-l-transparent"}`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <PlatformIcon platform={p.platform} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${activeIndex === idx ? "text-ds-primary" : "text-ds-text"}`}>
                          {p.time}
                        </span>
                        <span className="text-[10px] text-ds-textMuted font-medium uppercase tracking-wider mt-0.5">{p.status}</span>
                        <span className="text-xs text-ds-textMuted line-clamp-1 mt-1">{p.content}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Main Content Area */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-6 space-y-6 flex-1">
              
              {/* Status & Author */}
              <div className="flex items-center justify-between">
                <div className="bg-green-500/10 text-green-400 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide border border-green-500/20">
                  Published
                </div>
                <div className="flex items-center gap-2 text-ds-text font-bold">
                  <PlatformIcon platform={post.platform} />
                  {post.authorHandle}
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-ds-textMuted mb-1">Scheduled For</div>
                  <div className="text-sm font-bold text-ds-text">Apr 15, 2026, 04:00 PM</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ds-textMuted mb-1">Published At</div>
                  <div className="text-sm font-bold text-ds-text">Apr 15, 2026, 04:01 PM</div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="text-sm font-semibold text-ds-textMuted mb-2">Caption</div>
                <div className="text-sm text-ds-text whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Media */}
              <div>
                <div className="text-sm font-semibold text-ds-textMuted mb-2">Media (1)</div>
                <div className="w-full h-48 bg-ds-background border border-ds-border rounded-xl flex items-center justify-center overflow-hidden group relative">
                  <ImageIcon className="w-8 h-8 text-ds-textMuted/50" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-ds-surface text-ds-text px-4 py-2 rounded-lg text-sm font-medium shadow-lg hover:bg-ds-border transition-colors">
                      View Full Size
                    </button>
                  </div>
                </div>
              </div>


              {/* Post Logs */}
              <div>
                <div className="text-sm font-semibold text-ds-textMuted mb-2">Post Logs</div>
                <div className="bg-ds-background border border-ds-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </div>
                      <div className="text-xs text-ds-textMuted flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 4/15/2026, 11:00:02 PM
                      </div>
                    </div>
                    <button className="text-xs font-medium text-ds-primary hover:text-ds-primaryHover flex items-center gap-1.5 transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" /> View All (3)
                    </button>
                  </div>
                  <div className="text-sm font-medium text-ds-text">
                    {post.platform === 'twitter' ? 'X' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} post published successfully
                  </div>
                </div>
              </div>

                </div>
                
                {/* Footer */}
                <div className="bg-ds-background border-t border-ds-border p-4 shrink-0">
                  <div className="flex items-center justify-between text-xs text-ds-textMuted">
                    <span>Created Apr 15, 2026, 02:34 PM</span>
                    <span>Updated Apr 15, 2026, 04:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
