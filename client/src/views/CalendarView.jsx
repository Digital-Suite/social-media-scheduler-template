import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Filter,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Type,
  Plus,
  MessageCircle,
  Repeat2,
  Heart,
  Share,
  Eye,
  BadgeCheck,
  Globe2,
  Clock
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek,
  endOfWeek,
  eachDayOfInterval, 
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isBefore,
  startOfDay
} from 'date-fns';
import { clsx } from 'clsx';
import { FaFacebook, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';
import { SiThreads } from 'react-icons/si';
import { twMerge } from 'tailwind-merge';
import { PostDetailsModal } from '../components/PostDetailsModal';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { formatInTimeZone } from 'date-fns-tz';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Mock Data Generators
const MOCK_PLATFORMS = ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateMockPosts(dateStr) {
  const count = getRandomInt(0, 4);
  const posts = [];
  const sampleContents = [
    "Moved my hard paywall to the end of onboarding today.\n\nBefore, it was the first thing users saw.\n\nMy thinking: if people invest even a small amount of time before hitting the paywall, they'll be much more likely to start a trial 💰",
    "Just launched our new feature! 🚀 Check it out in the dashboard.",
    "Happy Friday everyone! What are you working on this weekend?",
    "Here's a sneak peek at the new UI we're working on. Thoughts? 👀"
  ];
  for(let i=0; i<count; i++) {
    const timeStr = `${String(getRandomInt(8, 23)).padStart(2, '0')}:${String(getRandomInt(0, 59)).padStart(2, '0')}`;
    const postDate = new Date(`${dateStr}T${timeStr}:00`);
    const isPublished = isBefore(postDate, new Date());
    
    posts.push({
      id: `${dateStr}-${i}`,
      platform: MOCK_PLATFORMS[getRandomInt(0, MOCK_PLATFORMS.length - 1)],
      time: timeStr,
      status: isPublished ? 'published' : 'scheduled',
      authorName: 'Hasan Cagli',
      authorHandle: '@HsanC_',
      content: sampleContents[getRandomInt(0, sampleContents.length - 1)],
      stats: {
        comments: getRandomInt(10, 100),
        retweets: getRandomInt(5, 50),
        likes: `${getRandomInt(1, 9)}.${getRandomInt(1, 9)}K`,
        views: `${getRandomInt(10, 200)}K`
      }
    });
  }
  return posts.sort((a,b) => a.time.localeCompare(b.time));
}

export function CalendarView() {
  const navigate = useNavigate();
  const { timezone, timeFormat } = useSettings();
  const { sessionToken, apiBaseUrl } = useAuth();
  const { activeWorkspace } = useWorkspace();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredPost, setHoveredPost] = useState(null);
  const hoverTimeoutRef = React.useRef(null);
  const [selectedPosts, setSelectedPosts] = useState(null);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' | 'weekly'
  const [updateAvailable, setUpdateAvailable] = useState(null);

  // Date Ranges
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const [realPosts, setRealPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = activeWorkspace ? `/api/posts?workspaceId=${activeWorkspace.id}` : '/api/posts';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Normalize post keys to match the frontend expectations
          const formattedPosts = data.map(p => ({
            id: p.id,
            platform: p.platform,
            time: formatInTimeZone(new Date(p.post_time), timezone.value, timeFormat === '12h' ? 'h:mm a' : 'HH:mm'),
            date: formatInTimeZone(new Date(p.post_time), timezone.value, 'yyyy-MM-dd'),
            fullDate: new Date(p.post_time),
            postTime: p.post_time,
            createdAt: p.created_at,
            mediaUrl: p.media_url,
            status: p.status,
            authorName: p.author_name || 'User',
            authorHandle: p.author_handle ? (p.author_handle.startsWith('@') ? p.author_handle : `@${p.author_handle}`) : (p.author_name ? `@${p.author_name.replace(/\s+/g, '').toLowerCase()}` : '@user'),
            authorAvatarUrl: p.author_avatar_url,
            content: p.content,
            stats: { comments: 0, retweets: 0, likes: '0', views: '0' }
          }));
          setRealPosts(formattedPosts);
        }
      } catch (err) {
        console.error('Failed to fetch posts', err);
      }
    };
    fetchPosts();

      // Socket.io connection (Local for post updates)
      import('socket.io-client').then(({ io }) => {
        const socket = io(); // Connects to the same host
        
        socket.on('post_updated', (updatedPost) => {
          setRealPosts(prev => {
            const index = prev.findIndex(p => p.id === updatedPost.id);
            if (index === -1) return prev; // if it's new, we could also append it, but we only need updates for now
            
            const newPosts = [...prev];
            newPosts[index] = {
              ...newPosts[index],
              status: updatedPost.status
            };
            return newPosts;
          });

          setSelectedPosts(prev => {
            if (!prev) return prev;
            const index = prev.findIndex(p => p.id === updatedPost.id);
            if (index === -1) return prev;
            
            const newPosts = [...prev];
            newPosts[index] = {
              ...newPosts[index],
              status: updatedPost.status
            };
            return newPosts;
          });
        });

        // Socket.io connection (OS Backend for app updates)
        let osSocket;
        if (apiBaseUrl) {
          osSocket = io(apiBaseUrl);
          osSocket.on('app_catalog_updated', (data) => {
            if (data.appName === 'Social Media Scheduler') {
              setUpdateAvailable(data.version);
            }
          });
        }

        return () => {
          socket.disconnect();
          if (osSocket) osSocket.disconnect();
        };
      }).catch(err => console.error('Failed to load socket.io-client', err));
  }, [timezone, timeFormat, activeWorkspace]); // Re-fetch occasionally

  const handleDeletePost = async (id) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRealPosts(prev => prev.filter(p => p.id !== id));
        if (selectedPosts) {
          const updated = selectedPosts.filter(p => p.id !== id);
          if (updated.length > 0) {
            setSelectedPosts(updated);
          } else {
            setSelectedPosts(null);
          }
        }
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting post');
    }
  };

  // Memoize data to group by date
  const postsByDate = React.useMemo(() => {
    const map = {};
    const days = viewMode === 'monthly' ? daysInMonth : daysInWeek;
    days.forEach(day => {
      map[format(day, 'yyyy-MM-dd')] = [];
    });
    
    realPosts.forEach(post => {
      if (map[post.date]) {
        map[post.date].push(post);
      }
    });

    return map;
  }, [realPosts, currentDate, viewMode]);

  const nextRange = () => {
    if (viewMode === 'monthly') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const prevRange = () => {
    if (viewMode === 'monthly') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const goToToday = () => setCurrentDate(new Date());

  const PlatformIcon = ({ platform }) => {
    switch (platform) {
      case 'facebook': return <div className="w-4 h-4 bg-blue-600 rounded-sm text-white flex items-center justify-center"><FaFacebook className="w-2.5 h-2.5" /></div>;
      case 'instagram': return <div className="w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-sm text-white flex items-center justify-center"><FaInstagram className="w-2.5 h-2.5" /></div>;
      case 'x': return <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center"><FaXTwitter className="w-2.5 h-2.5" /></div>;
      case 'twitter': return <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center"><FaXTwitter className="w-2.5 h-2.5" /></div>;
      case 'linkedin': return <div className="w-4 h-4 bg-blue-700 rounded-sm text-white flex items-center justify-center"><FaLinkedin className="w-2.5 h-2.5" /></div>;
      case 'youtube': return <div className="w-4 h-4 bg-red-600 rounded-sm text-white flex items-center justify-center"><FaYoutube className="w-2.5 h-2.5" /></div>;
      case 'tiktok': return <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center"><FaTiktok className="w-2.5 h-2.5" /></div>;
      case 'threads': return <div className="w-4 h-4 bg-black rounded-sm text-white flex items-center justify-center"><SiThreads className="w-2.5 h-2.5" /></div>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      
      {updateAvailable && (
        <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#D4AF37]/10 border-b border-[#D4AF37]/30 backdrop-blur-md">
          <div className="flex items-center gap-3 text-[#D4AF37]">
            <BadgeCheck className="w-5 h-5" />
            <div className="text-sm">
              <span className="font-semibold">Update Available!</span> Version {updateAvailable} is ready.
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs font-semibold px-3 py-1.5 bg-[#D4AF37] text-black rounded-md hover:bg-[#F3E5AB] transition-colors"
          >
            Update Now
          </button>
        </div>
      )}
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-end p-4 border-b border-ds-border bg-ds-surface shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-ds-textMuted">{timezone.label} · {timezone.offset}</div>
          <div className="flex items-center bg-ds-background rounded-lg border border-ds-border p-1">
            <button 
              onClick={() => setViewMode('weekly')}
              className={cn("px-3 py-1 text-sm rounded", viewMode === 'weekly' ? "bg-ds-surface text-ds-text shadow" : "text-ds-textMuted hover:bg-ds-surface")}
            >Weekly</button>
            <button 
              onClick={() => setViewMode('monthly')}
              className={cn("px-3 py-1 text-sm rounded", viewMode === 'monthly' ? "bg-ds-surface text-ds-text shadow" : "text-ds-textMuted hover:bg-ds-surface")}
            >Monthly</button>
          </div>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <h2 className="text-2xl font-bold text-ds-text">
          {viewMode === 'monthly' 
            ? format(currentDate, 'MMMM yyyy') 
            : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
        </h2>
        
        <div className="flex items-center gap-3">
          <button onClick={goToToday} className="px-4 py-1.5 border border-ds-border rounded-lg text-sm font-medium hover:bg-ds-surface">
            Today
          </button>
          <div className="flex items-center border border-ds-border rounded-lg overflow-hidden">
            <button onClick={prevRange} className="p-1.5 hover:bg-ds-surface border-r border-ds-border"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextRange} className="p-1.5 hover:bg-ds-surface"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 overflow-auto bg-ds-background p-6 pt-0 relative">
        <div className="min-w-[1000px] h-full flex flex-col">
          
          {viewMode === 'monthly' ? (
            <>
              {/* Days of Week Row (Monthly) */}
              <div className="grid grid-cols-7 gap-4 mb-4 shrink-0">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-ds-textMuted uppercase">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid (Monthly) */}
              <div className="grid grid-cols-7 auto-rows-[minmax(150px,auto)] gap-4 flex-1">
                {daysInMonth.map((day, idx) => {
                  const posts = postsByDate[format(day, 'yyyy-MM-dd')] || [];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "border rounded-xl p-2 flex flex-col gap-2 transition-colors cursor-pointer relative min-h-[150px] group pb-10",
                        isToday(day) 
                          ? "border-ds-primary/50 bg-ds-primary/5 hover:bg-ds-primary/10" 
                          : "border-ds-border bg-ds-surface/50 hover:bg-ds-surface",
                        !isCurrentMonth && "opacity-40"
                      )}
                    >
                      <div className="flex items-center justify-between px-1">
                        <div className={cn(
                          "text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full", 
                          isToday(day) ? "bg-ds-primary text-ds-background" : "text-ds-text"
                        )}>
                          {format(day, 'd')}
                        </div>
                        {posts.length > 0 && (
                          <span className="text-[10px] font-bold text-ds-primary bg-ds-primary/10 px-1.5 rounded-full border border-ds-primary/20">
                            {posts.length}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1.5 overflow-y-auto h-full">
                        {Object.values(posts.reduce((acc, p) => {
                          const key = p.post_time;
                          if (!acc[key]) acc[key] = { time: p.post_time, status: p.status, count: 0, posts: [] };
                          acc[key].count += 1;
                          acc[key].posts.push(p);
                          if (p.status === 'failed') acc[key].status = 'failed';
                          else if (p.status !== acc[key].status) acc[key].status = 'mixed';
                          return acc;
                        }, {})).map(group => (
                          <div 
                            key={group.time} 
                            onMouseEnter={(e) => {
                              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setHoveredPost({ group, rect });
                            }}
                            onMouseLeave={() => {
                              hoverTimeoutRef.current = setTimeout(() => {
                                setHoveredPost(null);
                              }, 300);
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPosts(group.posts);
                            }}
                            className={cn(
                              "border rounded p-1.5 flex flex-col gap-1 text-xs shadow-sm transition-colors shrink-0 cursor-pointer relative",
                              group.status === 'published' 
                                ? "bg-ds-primary/5 border-ds-primary/30 hover:bg-ds-primary/10" 
                                : group.status === 'failed' ? "bg-red-500/5 border-red-500/30 hover:bg-red-500/10"
                                : "bg-ds-surface/50 border-ds-border border-dashed hover:border-ds-primary/50 hover:bg-ds-surface"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-0.5 flex-wrap">
                                {group.posts.map(p => (
                                  <PlatformIcon key={p.id} platform={p.platform} />
                                ))}
                              </div>
                              {group.status === 'published' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-ds-primary" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-ds-textMuted" />
                              )}
                            </div>
                            <span className={cn("font-semibold text-[10px]", group.status === 'published' ? "text-ds-primary" : "text-ds-textMuted")}>
                              {group.count} {group.status === 'published' ? 'Published' : group.status === 'mixed' ? 'Mixed' : 'Scheduled'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Create Post Buttons */}
                      {!isBefore(day, startOfDay(new Date())) && (
                        <div className="absolute bottom-2 right-2">
                          {isToday(day) ? (
                            <button onClick={() => navigate('/create', { state: { date: format(day, 'yyyy-MM-dd') } })} className="flex items-center gap-1.5 px-3 py-1.5 bg-ds-primary hover:bg-ds-primaryHover text-ds-background rounded-full text-xs font-bold shadow-lg shadow-ds-primary/20 transition-all">
                              <Plus className="w-3.5 h-3.5" /> Create Post
                            </button>
                          ) : (
                            <button onClick={() => navigate('/create', { state: { date: format(day, 'yyyy-MM-dd') } })} className="w-6 h-6 rounded-full bg-ds-primary hover:bg-ds-primaryHover text-ds-background flex items-center justify-center shadow-md shadow-ds-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col min-h-0 bg-ds-surface/30 rounded-xl border border-ds-border overflow-hidden">
              {/* Weekly Header Row */}
              <div className="flex border-b border-ds-border bg-ds-surface/50">
                <div className="w-20 shrink-0 border-r border-ds-border p-4 flex items-center justify-center">
                  <span className="text-xs font-medium text-ds-textMuted uppercase">Time</span>
                </div>
                <div className="flex-1 grid grid-cols-7">
                  {daysInWeek.map((day, idx) => (
                    <div key={idx} className={cn("p-4 flex flex-col items-center justify-center gap-1 border-r border-ds-border last:border-r-0", isToday(day) && "bg-ds-primary/5")}>
                      <span className={cn("text-xs font-bold uppercase", isToday(day) ? "text-ds-primary" : "text-ds-textMuted")}>
                        {format(day, 'EEE')}
                      </span>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                        isToday(day) ? "bg-ds-primary text-ds-background" : "text-ds-text"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Time Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="relative mt-3">
                  
                {/* Current Time Indicator */}
                {(() => {
                  const nowStr = formatInTimeZone(new Date(), timezone.value, 'HH:mm');
                  const [h, m] = nowStr.split(':').map(Number);
                  
                  return (
                    <div className="absolute left-20 right-0 z-10 pointer-events-none" style={{ top: `${(h + (m / 60)) * 96}px` }}>
                      <div className="h-px bg-blue-500 relative flex items-center">
                        <div className="absolute right-0 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                          {formatInTimeZone(new Date(), timezone.value, timeFormat === '12h' ? 'h:mm a' : 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex">
                  {/* Time Axis */}
                  <div className="w-20 shrink-0 border-r border-ds-border bg-ds-surface/30">
                    {Array.from({length: 24}, (_, i) => i).map(hour => (
                      <div key={hour} className="h-24 border-b border-ds-border/50 relative">
                        <span className="absolute -top-2.5 left-0 w-full text-center text-[10px] font-medium text-ds-textMuted bg-ds-background px-1">
                          {timeFormat === '12h' 
                            ? `${hour === 0 ? 12 : hour === 12 ? 12 : hour % 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` 
                            : `${String(hour).padStart(2, '0')}:00`}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  <div className="flex-1 grid grid-cols-7">
                    {daysInWeek.map((day, idx) => {
                      const posts = postsByDate[format(day, 'yyyy-MM-dd')] || [];
                      return (
                        <div key={idx} className={cn("relative border-r border-ds-border last:border-r-0 border-b border-ds-border/50", isToday(day) && "bg-ds-primary/5")}>
                          
                          {/* Hour Grid Lines */}
                          {Array.from({length: 24}, (_, i) => i).map(hour => (
                            <div key={hour} className="h-24 border-b border-ds-border/30 last:border-b-0 group cursor-pointer hover:bg-ds-surface/50 transition-colors" />
                          ))}

                          {/* Absolute Positioned Posts (Grouped) */}
                          {Object.values(posts.reduce((acc, p) => {
                            const key = p.post_time;
                            if (!acc[key]) acc[key] = { time: p.post_time, status: p.status, count: 0, posts: [] };
                            acc[key].count += 1;
                            acc[key].posts.push(p);
                            if (p.status === 'failed') acc[key].status = 'failed';
                            else if (p.status !== acc[key].status) acc[key].status = 'mixed';
                            return acc;
                          }, {})).map(group => {
                            const earliestPost = group.posts.reduce((earliest, p) => p.time < earliest.time ? p : earliest, group.posts[0]);
                            const [h, m] = earliestPost.time.split(':').map(Number);
                            const topPx = (h + (m / 60)) * 96;

                            return (
                              <div 
                                key={group.time}
                                className={cn(
                                  "absolute left-1 right-1 backdrop-blur-sm border rounded-md p-1.5 shadow-sm transition-all cursor-pointer z-20 flex items-center justify-between",
                                  group.status === 'published'
                                    ? "bg-ds-background/90 border-ds-primary/40 hover:border-ds-primary hover:bg-ds-surface"
                                    : "bg-ds-surface/60 border-ds-border border-dashed hover:border-ds-primary/50 hover:bg-ds-surface/90"
                                )}
                                style={{ top: `${topPx}px` }}
                                onMouseEnter={(e) => {
                                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredPost({ group, rect });
                                }}
                                onMouseLeave={() => {
                                  hoverTimeoutRef.current = setTimeout(() => {
                                    setHoveredPost(null);
                                  }, 300);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPosts(group.posts);
                                }}
                              >
                                <div className="flex items-center gap-0.5 overflow-hidden">
                                  {group.posts.map(p => (
                                    <PlatformIcon key={p.id} platform={p.platform} />
                                  ))}
                                  <span className={cn("text-[10px] font-semibold truncate ml-1", group.status === 'published' ? "text-ds-primary" : "text-ds-textMuted")}>
                                    {group.count} {group.status === 'published' ? 'Published' : group.status === 'mixed' ? 'Mixed' : 'Scheduled'}
                                  </span>
                                </div>
                                {group.status === 'published' ? (
                                  <CheckCircle2 className="w-3 h-3 text-ds-primary shrink-0" />
                                ) : (
                                  <Clock className="w-3 h-3 text-ds-textMuted shrink-0" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Floating Popover Preview */}
      {hoveredPost?.group && (() => {
        const POPUP_WIDTH = 288; // w-72
        const spaceOnRight = window.innerWidth - hoveredPost.rect.right - 10;
        const showOnLeft = spaceOnRight < POPUP_WIDTH;
        return (
        <div 
          className="fixed z-[100]"
          style={{
            top: hoveredPost.rect.top - 20 + 'px',
            ...(showOnLeft
              ? { left: hoveredPost.rect.left - POPUP_WIDTH - 10 + 'px' }
              : { left: hoveredPost.rect.right + 10 + 'px' }),
          }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => {
            hoverTimeoutRef.current = setTimeout(() => {
              setHoveredPost(null);
            }, 300);
          }}
        >
          <div className="w-72 bg-ds-background border border-ds-border shadow-2xl shadow-black/50 rounded-xl overflow-hidden flex flex-col max-h-[400px]">
            {/* Popover Header */}
            <div className="bg-ds-surface px-4 py-3 border-b border-ds-border flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-1">
                {hoveredPost.group.posts.map(p => (
                  <PlatformIcon key={p.id} platform={p.platform} />
                ))}
              </div>
              <span className="text-sm font-bold text-ds-text">Grouped Post ({hoveredPost.group.count})</span>
              <span className={cn("text-xs font-semibold", hoveredPost.group.status === 'published' ? "text-ds-primary" : "text-ds-textMuted")}>
                {hoveredPost.group.status}
              </span>
            </div>

            {/* Popover List */}
            <div className="overflow-y-auto flex flex-col custom-scrollbar">
              {hoveredPost.group.posts.map(post => (
                <div key={post.id} className="border-b border-ds-border/50 last:border-b-0 hover:bg-ds-surface/30 transition-colors">
                  <div className="px-4 pt-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <PlatformIcon platform={post.platform} />
                        <div className="w-5 h-5 rounded-full bg-ds-surface border border-ds-border overflow-hidden">
                          <img src={post.authorAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-ds-text">{post.authorName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-ds-textMuted text-[10px] font-mono">{post.time}</span>
                        {post.status === 'published' ? <CheckCircle2 className="w-3 h-3 text-ds-primary" /> : <Clock className="w-3 h-3 text-ds-textMuted" />}
                      </div>
                    </div>
                    <div className="text-xs text-ds-text/90 line-clamp-2 leading-relaxed mb-3">
                      {post.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })()}

      {/* Post Details Modal */}
      <PostDetailsModal 
        isOpen={!!selectedPosts} 
        posts={selectedPosts} 
        onClose={() => setSelectedPosts(null)} 
        onDelete={handleDeletePost}
      />

    </div>
  );
}
