import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon,
  CheckCircle2,
  CalendarClock,
  ArrowLeft,
  X as XIcon,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  MessageSquare
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, addMinutes } from 'date-fns';

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

const PostPreview = ({ account, title, caption, hashtags, mediaUrl }) => {
  const isIg = account?.provider === 'instagram';
  const isFb = account?.provider === 'facebook';
  const isX = account?.provider === 'x' || account?.provider === 'twitter';
  const isLi = account?.provider === 'linkedin';

  const authorName = account?.metadata?.name || account?.metadata?.username || 'Your Name';
  const authorHandle = account?.metadata?.handle || account?.metadata?.username || 'username';
  // FIX: Using .picture instead of .avatar_url
  const avatarUrl = account?.metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorHandle}`;

  const hashtagString = hashtags.length > 0 ? '\n\n' + hashtags.map(t => `#${t}`).join(' ') : '';
  const finalCaption = (caption || '') + hashtagString;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-gray-900 mx-auto w-full max-w-[360px] text-sm font-sans flex flex-col mt-4">
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[13px] text-gray-900">{authorName}</span>
            {(isX || isIg) && <span className="text-gray-500 text-[12px]">@{authorHandle}</span>}
            {(isFb || isLi) && <span className="text-gray-500 text-[11px]">Just now</span>}
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      {/* Body / Media */}
      {(isFb || isLi || isX || (!isIg)) && title && (
        <div className="px-3 pb-2 font-semibold text-[14px]">
          {title}
        </div>
      )}
      {(isFb || isLi || isX || (!isIg)) && (
        <div className="px-3 pb-2 whitespace-pre-wrap text-[13px]">
          {finalCaption || <span className="text-gray-400 italic">Write a caption...</span>}
        </div>
      )}

      {mediaUrl ? (
        <div className="w-full bg-gray-100 flex items-center justify-center min-h-[200px]">
          {mediaUrl.match(/\.(mp4|webm|mov)$/i) ? (
            <video src={mediaUrl} className="w-full max-h-[400px] object-cover" controls />
          ) : (
            <img src={mediaUrl} className="w-full max-h-[400px] object-cover" />
          )}
        </div>
      ) : (
        <div className="w-full bg-gray-50 border-y border-gray-100 flex items-center justify-center min-h-[200px] text-gray-400 text-xs">
          No media uploaded
        </div>
      )}

      {/* IG Body is below media */}
      {isIg && (
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-gray-800" />
              <MessageCircle className="w-6 h-6 transform -scale-x-100 text-gray-800" />
              <Share2 className="w-5 h-5 text-gray-800" />
            </div>
            <Bookmark className="w-6 h-6 text-gray-800" />
          </div>
          <div className="font-bold text-[13px] mb-1">0 likes</div>
          <div className="text-[13px]">
            <span className="font-bold mr-1">{authorName}</span>
            <span className="whitespace-pre-wrap">{finalCaption || <span className="text-gray-400 italic">Write a caption...</span>}</span>
          </div>
        </div>
      )}

      {/* FB / Li Footer Actions */}
      {(isFb || isLi) && (
        <div className="px-3 py-2 flex items-center justify-around text-gray-500 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer"><Heart className="w-4 h-4"/> <span className="text-[12px] font-medium">Like</span></div>
          <div className="flex items-center gap-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer"><MessageSquare className="w-4 h-4"/> <span className="text-[12px] font-medium">Comment</span></div>
          <div className="flex items-center gap-1.5 hover:bg-gray-100 px-3 py-1.5 rounded-lg cursor-pointer"><Share2 className="w-4 h-4"/> <span className="text-[12px] font-medium">Share</span></div>
        </div>
      )}
    </div>
  );
};

export function CreatePostView() {
  const { sessionToken, connectedAccounts, apiBaseUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getInitialTime = () => {
    const date = addMinutes(new Date(), 30);
    if (location.state?.date) {
      const parts = location.state.date.split('-'); 
      date.setFullYear(parseInt(parts[0], 10));
      date.setMonth(parseInt(parts[1], 10) - 1);
      date.setDate(parseInt(parts[2], 10));
    }
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [useSameCaption, setUseSameCaption] = useState(true);
  const [platformCaptions, setPlatformCaptions] = useState({});
  const [platformTitles, setPlatformTitles] = useState({});
  const [postTime, setPostTime] = useState(getInitialTime());
  const [mediaUrl, setMediaUrl] = useState(''); 
  const [isUploading, setIsUploading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const fileInputRef = useRef(null);

  // New state for Preview Tab
  const [activePreviewId, setActivePreviewId] = useState(null);

  useEffect(() => {
    // Keep active preview tab in sync with selected accounts
    if (selectedAccounts.length > 0 && !selectedAccounts.includes(activePreviewId)) {
      setActivePreviewId(selectedAccounts[0]);
    } else if (selectedAccounts.length === 0) {
      setActivePreviewId(null);
    }
  }, [selectedAccounts, activePreviewId]);

  const toggleAccount = (id) => {
    setSelectedAccounts(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setMediaUrl(data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !hashtags.includes(newTag) && hashtags.length < 5) {
        setHashtags([...hashtags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setHashtags(hashtags.filter(t => t !== tagToRemove));
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

        const postTitle = useSameCaption ? title : (platformTitles[accountId] || title);
        const postCaption = useSameCaption ? caption : (platformCaptions[accountId] || caption);
        
        const localDate = new Date(postTime);
        const utcPostTime = localDate.toISOString().slice(0, 19).replace('T', ' ');

        await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: account.provider,
            title: postTitle,
            content: postCaption,
            hashtags: hashtags.length > 0 ? hashtags : undefined,
            mediaUrl: mediaUrl,
            postTime: utcPostTime,
            sessionToken: sessionToken,
            apiBaseUrl: apiBaseUrl,
            authorName: account.metadata?.name || account.metadata?.username || null,
            authorHandle: account.metadata?.handle || account.metadata?.username || null,
            // FIX: Ensure picture is extracted properly
            authorAvatarUrl: account.metadata?.picture || null,
            accountId: account.id
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

  const activePreviewAccount = connectedAccounts.find(a => a.id === activePreviewId);
  const previewTitle = useSameCaption ? title : (platformTitles[activePreviewId] || title);
  const previewCaption = useSameCaption ? caption : (platformCaptions[activePreviewId] || caption);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden custom-scrollbar bg-ds-background relative">
      
      {/* Header Block (Fixed) */}
      <div className="shrink-0 p-6 lg:p-8 border-b border-ds-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-ds-surface/30 backdrop-blur-md sticky top-0 z-20">
        <div className="flex flex-col gap-1">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-sm font-medium text-ds-textMuted hover:text-ds-text self-start transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Calendar
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-ds-text tracking-tight">Create New Post</h1>
          <p className="text-ds-textMuted text-sm">Design, caption, and schedule your content across platforms.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input 
            type="datetime-local" 
            value={postTime}
            onChange={(e) => setPostTime(e.target.value)}
            className="bg-ds-surface border border-ds-border text-ds-text rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-ds-primary shadow-sm"
          />
          <button 
            onClick={handleSchedule}
            disabled={isScheduling}
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-ds-primary hover:bg-ds-primaryHover disabled:opacity-50 text-ds-background font-bold transition-all shadow-[0_0_15px_var(--color-primary-light)] hover:shadow-[0_0_25px_var(--color-primary)] shrink-0"
          >
            <CalendarClock className="w-5 h-5" />
            {isScheduling ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </div>
      </div>

      {/* Main Content (Split Grid) */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_450px]">
          
          {/* Left Column: Editor Workspace */}
          <div className="h-full overflow-y-auto custom-scrollbar p-6 lg:p-8 flex flex-col gap-8">
            
            {/* Step 1: Media */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-ds-primary/10 text-ds-primary border border-ds-primary/20 flex items-center justify-center text-sm font-bold shadow-sm">1</div>
                <h3 className="text-lg font-semibold text-ds-text">Media <span className="text-ds-textMuted font-normal text-sm ml-1">(optional)</span></h3>
              </div>
              
              <div 
                onClick={() => !mediaUrl && !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed ${mediaUrl ? 'border-transparent' : 'border-ds-border hover:border-ds-primary/50 cursor-pointer'} transition-colors rounded-2xl p-0 bg-ds-surface/30 flex flex-col items-center justify-center relative overflow-hidden min-h-[240px] shadow-sm`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="video/*,image/*" 
                  onChange={handleFileUpload}
                />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-ds-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-ds-primary border-t-transparent rounded-full animate-spin shadow-[0_0_10px_var(--color-primary)]"></div>
                      <span className="text-sm font-medium text-ds-text">Uploading...</span>
                    </div>
                  </div>
                )}

                {mediaUrl ? (
                  <div className="w-full h-full relative group flex items-center justify-center bg-black rounded-xl overflow-hidden">
                    {(mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.mov')) ? (
                      <video src={mediaUrl} controls className="w-full h-full max-h-[400px] object-contain" />
                    ) : (
                      <img src={mediaUrl} alt="Preview" className="w-full h-full max-h-[400px] object-contain" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMediaUrl(''); }}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl backdrop-blur-sm transition-colors shadow-lg"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button className="flex items-center gap-1.5 text-xs font-medium bg-ds-surface border border-ds-border px-4 py-2 rounded-xl text-ds-text hover:bg-ds-border shadow-sm transition-colors">
                        <ImageIcon className="w-4 h-4" /> Browse Files
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center gap-3 text-center mt-2 pointer-events-none">
                      <div className="w-16 h-16 bg-ds-surface rounded-full flex items-center justify-center mb-2 shadow-sm border border-ds-border/50">
                        <UploadCloud className="w-8 h-8 text-ds-textMuted" />
                      </div>
                      <p className="font-semibold text-ds-text text-xl tracking-tight">Drag & Drop Media</p>
                      <p className="text-ds-textMuted text-sm font-medium">Supports JPG, PNG, MP4</p>
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Step 2: Accounts */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ds-primary/10 text-ds-primary border border-ds-primary/20 flex items-center justify-center text-sm font-bold shadow-sm">2</div>
                  <h3 className="text-lg font-semibold text-ds-text">Select Accounts</h3>
                </div>
                <button 
                  onClick={() => setSelectedAccounts(connectedAccounts.map(a => a.id))}
                  className="text-xs font-medium bg-ds-surface border border-ds-border px-4 py-1.5 rounded-lg text-ds-text hover:bg-ds-border transition-colors shadow-sm"
                >
                  Select All
                </button>
              </div>
              
              <div className="bg-ds-surface border border-ds-border rounded-2xl p-4 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {connectedAccounts.map(acc => (
                    <label 
                      key={acc.id} 
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer group transition-all ${selectedAccounts.includes(acc.id) ? 'bg-ds-primary/5 border border-ds-primary/30' : 'hover:bg-ds-background border border-transparent'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleAccount(acc.id);
                      }}
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shadow-sm shrink-0 ${selectedAccounts.includes(acc.id) ? 'bg-ds-primary border-ds-primary' : 'border-ds-border bg-ds-background group-hover:border-ds-textMuted'}`}>
                        {selectedAccounts.includes(acc.id) && <CheckCircle2 className="w-3.5 h-3.5 text-ds-background" />}
                      </div>
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-ds-background border border-ds-border flex items-center justify-center overflow-hidden shadow-sm">
                          {/* FIX: Using picture instead of avatar_url */}
                          <img src={acc.metadata?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${acc.metadata?.username || acc.provider}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 ring-2 ring-ds-surface rounded-full shadow-sm">
                          <PlatformIcon platform={acc.provider} />
                        </div>
                      </div>
                      <div className="flex flex-col truncate w-full">
                        <span className="text-sm font-semibold text-ds-text leading-tight truncate">{acc.metadata?.name || acc.metadata?.username || 'User'}</span>
                        <span className="text-xs text-ds-textMuted leading-tight truncate mt-0.5">@{acc.metadata?.handle || acc.metadata?.username || acc.provider}</span>
                      </div>
                    </label>
                  ))}
                  {connectedAccounts.length === 0 && (
                     <div className="col-span-full py-6 text-center text-ds-textMuted text-sm bg-ds-background/50 rounded-xl border border-dashed border-ds-border">
                       No accounts connected. Please go to Accounts to link them first.
                     </div>
                  )}
                </div>
              </div>
            </section>

            {/* Step 3: Caption */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ds-primary/10 text-ds-primary border border-ds-primary/20 flex items-center justify-center text-sm font-bold shadow-sm">3</div>
                  <h3 className="text-lg font-semibold text-ds-text">Caption</h3>
                </div>
                <div className="flex items-center gap-2 bg-ds-surface px-4 py-2 rounded-xl border border-ds-border shadow-sm">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={useSameCaption} onChange={(e) => setUseSameCaption(e.target.checked)} />
                    <div className="w-9 h-5 bg-ds-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ds-primary shadow-inner"></div>
                  </label>
                  <span className="text-sm font-medium text-ds-text">Same for all platforms</span>
                </div>
              </div>
              
              {useSameCaption ? (
                <div className="bg-ds-surface border border-ds-border rounded-2xl flex flex-col relative min-h-[350px] shadow-sm">
                  <div className="p-4 border-b border-ds-border bg-ds-background/30 rounded-t-2xl">
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title (optional, heavily utilized by YouTube & LinkedIn)"
                      className="w-full bg-transparent text-ds-text font-bold placeholder-ds-textMuted outline-none text-[15px]"
                    />
                  </div>
                  <div className="relative p-5 flex-1 flex flex-col">
                    <textarea 
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full flex-1 bg-transparent text-ds-text placeholder-ds-textMuted resize-none outline-none focus:ring-0 text-[15px] leading-relaxed custom-scrollbar min-h-[150px]"
                      placeholder="Write your perfect caption here..."
                    />
                  </div>
                  <div className="p-4 border-t border-ds-border bg-ds-background/30">
                    <div className="flex flex-wrap gap-2 items-center">
                      {hashtags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-ds-primary/10 text-ds-primary border border-ds-primary/20 rounded-lg text-xs font-semibold shadow-sm transition-all hover:bg-ds-primary/15">
                          #{tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-ds-primaryHover transition-colors"><XIcon className="w-3.5 h-3.5" /></button>
                        </span>
                      ))}
                      {hashtags.length < 5 && (
                        <input 
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={addTag}
                          placeholder={hashtags.length === 0 ? "Add hashtags (press Enter)" : "Add tag..."}
                          className="bg-ds-background border border-ds-border rounded-lg px-3 py-1.5 text-sm text-ds-text placeholder-ds-textMuted outline-none focus:border-ds-primary transition-colors flex-1 min-w-[150px] shadow-sm"
                        />
                      )}
                    </div>
                    <div className="text-[11px] font-medium text-ds-textMuted mt-3 text-right">
                      {caption.length}/3000 chars · {hashtags.length}/5 tags
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {connectedAccounts.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                    <div key={acc.id} className="bg-ds-surface border border-ds-border rounded-2xl flex flex-col relative shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-ds-border bg-ds-background/50 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                          <PlatformIcon platform={acc.provider} />
                          <span className="text-sm font-bold text-ds-text">{acc.metadata?.name || acc.metadata?.username || 'User'}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 border-b border-ds-border/50">
                        <input 
                          type="text"
                          value={platformTitles[acc.id] || ''}
                          onChange={(e) => setPlatformTitles({...platformTitles, [acc.id]: e.target.value})}
                          placeholder="Title (optional)"
                          className="w-full bg-transparent text-ds-text font-bold placeholder-ds-textMuted outline-none text-[15px]"
                        />
                      </div>

                      <div className="relative p-5 flex-1 flex flex-col">
                        <textarea 
                          value={platformCaptions[acc.id] || ''}
                          onChange={(e) => setPlatformCaptions({...platformCaptions, [acc.id]: e.target.value})}
                          className="w-full flex-1 bg-transparent text-ds-text placeholder-ds-textMuted resize-none outline-none focus:ring-0 text-[15px] leading-relaxed custom-scrollbar min-h-[120px]"
                          placeholder={`Caption for ${acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)}...`}
                        />
                      </div>
                    </div>
                  ))}
                  {selectedAccounts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-12 text-ds-textMuted text-sm italic border-2 border-ds-border border-dashed rounded-2xl bg-ds-surface/30">
                      <MessageSquare className="w-8 h-8 mb-3 text-ds-border" />
                      Select an account in Step 2 to write custom captions.
                    </div>
                  )}
                </div>
              )}
            </section>
            
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:flex flex-col h-full border-l border-ds-border bg-ds-surface/10 overflow-hidden relative shadow-inner">
            <div className="p-4 border-b border-ds-border bg-ds-background/80 backdrop-blur-md z-10 sticky top-0 shadow-sm">
              <h3 className="font-bold text-ds-text text-lg flex items-center gap-2">Live Preview</h3>
              <p className="text-xs text-ds-textMuted mt-1">See exactly how your post will look</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/5 relative">
              {selectedAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-ds-textMuted">
                  <div className="w-24 h-48 border-2 border-dashed border-ds-border rounded-xl flex items-center justify-center mb-4 opacity-50 bg-ds-surface/50">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-medium">Select accounts to see a preview</p>
                </div>
              ) : (
                <>
                  {/* Platform Tabs */}
                  {selectedAccounts.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar mb-6 pb-2">
                      {connectedAccounts.filter(a => selectedAccounts.includes(a.id)).map(acc => (
                        <button
                          key={acc.id}
                          onClick={() => setActivePreviewId(acc.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 shadow-sm border ${activePreviewId === acc.id ? 'bg-ds-primary text-ds-background border-ds-primary shadow-[0_0_10px_var(--color-primary-light)]' : 'bg-ds-surface text-ds-text border-ds-border hover:bg-ds-background'}`}
                        >
                          <PlatformIcon platform={acc.provider} />
                          {acc.provider.charAt(0).toUpperCase() + acc.provider.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Phone Mockup Frame */}
                  <div className="mx-auto w-full max-w-[380px] bg-ds-background border-[6px] border-ds-surface rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col h-auto min-h-[500px]">
                     {/* Dynamic Notch */}
                     <div className="absolute top-0 inset-x-0 h-6 bg-ds-surface rounded-b-xl w-32 mx-auto z-10"></div>
                     <div className="bg-gray-100 flex-1 w-full overflow-y-auto custom-scrollbar pt-8 pb-4 px-2">
                        {activePreviewAccount ? (
                          <PostPreview 
                            account={activePreviewAccount}
                            title={previewTitle}
                            caption={previewCaption}
                            hashtags={hashtags}
                            mediaUrl={mediaUrl}
                          />
                        ) : (
                           <div className="text-center text-gray-500 text-sm mt-20">Select an account to preview</div>
                        )}
                     </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
