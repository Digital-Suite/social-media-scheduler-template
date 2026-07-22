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
  Clock,
  Clock4,
  AlertCircle
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export function PostDetailsModal({ isOpen, posts, onClose, onDelete }) {
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
      case 'x': return <FaXTwitter className="w-5 h-5 text-ds-text" />;
      case 'twitter': return <FaXTwitter className="w-5 h-5 text-ds-text" />;
      case 'linkedin': return <FaLinkedin className="w-5 h-5 text-blue-600" />;
      case 'youtube': return <FaYoutube className="w-5 h-5 text-red-500" />;
      case 'tiktok': return <FaTiktok className="w-5 h-5 text-ds-text" />;
      default: return null;
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'published') return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (status === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  const isVideo = post.mediaUrl && (post.mediaUrl.endsWith('.mp4') || post.mediaUrl.endsWith('.mov') || post.mediaUrl.endsWith('.webm'));

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
              <div className="flex items-center gap-2">
                {onDelete && post.status !== 'published' && (
                  <button 
                    onClick={() => onDelete(post.id)} 
                    className="px-3 py-1.5 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-500 text-sm font-bold transition-colors"
                  >
                    Delete Post
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-ds-surface rounded-full text-ds-textMuted hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                <div className={`font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide border ${getStatusStyle(post.status)}`}>
                  {post.status}
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
                  <div className="text-sm font-bold text-ds-text">
                    {post.postTime ? format(new Date(post.postTime), 'MMM dd, yyyy, hh:mm a') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ds-textMuted mb-1">Published At</div>
                  <div className="text-sm font-bold text-ds-text">
                    {post.status === 'published' && post.postTime ? format(new Date(post.postTime), 'MMM dd, yyyy, hh:mm a') : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="text-sm font-semibold text-ds-textMuted mb-2">Caption</div>
                {post.title && (
                  <h3 className="font-bold text-ds-text text-lg mb-2">{post.title}</h3>
                )}
                
                <p className="text-ds-text whitespace-pre-wrap leading-relaxed text-sm">
                  {post.content}
                </p>
                
                {post.hashtags && (
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-ds-border">
                    {(() => {
                      try {
                        const tags = JSON.parse(post.hashtags);
                        return tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-ds-surface border border-ds-border rounded-md text-xs font-medium text-ds-textMuted">
                            #{tag}
                          </span>
                        ));
                      } catch(e) {
                        return null;
                      }
                    })()}
                  </div>
                )}
              </div>

              {/* Media */}
              {post.mediaUrl && (
                <div>
                  <div className="text-sm font-semibold text-ds-textMuted mb-2">Media</div>
                  <div className="w-full h-48 bg-black/50 border border-ds-border rounded-xl flex items-center justify-center overflow-hidden relative">
                    {isVideo ? (
                      <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
                    ) : (
                      <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              {/* Post Logs */}
              <div>
                <div className="text-sm font-semibold text-ds-textMuted mb-2">Post Logs</div>
                <div className="bg-ds-background border border-ds-border rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {post.status === 'published' ? (
                        <div className="bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-green-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Success
                        </div>
                      ) : post.status === 'failed' ? (
                        <div className="bg-red-500/10 text-red-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-red-500/20">
                          <AlertCircle className="w-3.5 h-3.5" /> Failed
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 text-amber-500 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-amber-500/20">
                          <Clock4 className="w-3.5 h-3.5" /> Pending
                        </div>
                      )}
                      
                      <div className="text-xs text-ds-textMuted flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> 
                        {post.createdAt ? format(new Date(post.createdAt), 'MM/dd/yyyy, hh:mm:ss a') : (post.postTime ? format(new Date(post.postTime), 'MM/dd/yyyy, hh:mm:ss a') : 'N/A')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-ds-text">
                    {post.status === 'published' 
                      ? `${post.platform === 'twitter' ? 'X' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} post published successfully`
                      : post.status === 'failed' 
                        ? `Failed to publish to ${post.platform === 'twitter' ? 'X' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}`
                        : `Post is queued for ${post.platform === 'twitter' ? 'X' : post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}`
                    }
                  </div>
                </div>
              </div>

                </div>
                
                {/* Footer */}
                <div className="bg-ds-background border-t border-ds-border p-4 shrink-0">
                  <div className="flex items-center justify-between text-xs text-ds-textMuted">
                    <span>Created {post.createdAt ? format(new Date(post.createdAt), 'MMM dd, yyyy, hh:mm a') : 'N/A'}</span>
                    <span>Updated {post.postTime ? format(new Date(post.postTime), 'MMM dd, yyyy, hh:mm a') : 'N/A'}</span>
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
