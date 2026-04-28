
import React from 'react';
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Building2, 
  Users, 
  User,
  TrendingUp, 
  ChevronRight,
  ChevronLeft,
  Search,
  MapPin,
  Clock,
  BookOpen,
  Calendar,
  X,
  FileText,
} from "lucide-react";
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import "../Home.css";

const Student = () => {
  const { user } = useOutletContext();
  const [stats, setStats] = React.useState([]);
  const [recommendedJobs, setRecommendedJobs] = React.useState([]);
  const [upcomingDrives, setUpcomingDrives] = React.useState([]);
  const [studentInfo, setStudentInfo] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [applyingId, setApplyingId] = React.useState(null);
  const [allDriveDates, setAllDriveDates] = React.useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [posters, setPosters] = React.useState([]);
  const [isPostersLoading, setIsPostersLoading] = React.useState(false);
  const [recommendations, setRecommendations] = React.useState(null);
  
  // Web Search States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const phone = user?.user_id || user?.phone;
        const [dashRes, postersRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/student/dashboard/?phone=${phone}`),
          axios.get(`http://127.0.0.1:8000/api/placement/posters/`)
        ]);
        
        setStudentInfo(dashRes.data.student_info);
        setStats(dashRes.data.stats || []);
        setRecommendedJobs(dashRes.data.recommended_jobs || []);
        setUpcomingDrives(dashRes.data.upcoming_drives || []);
        setAllDriveDates(dashRes.data.all_drive_dates || []);
        setRecommendations(dashRes.data.recommendations || null);
        setPosters(postersRes.data || []);
      } catch (error) {
        console.error("Error fetching student dashboard data:", error);
        setStats([]); 
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      const phone = user?.user_id || user?.phone;
      const response = await axios.post("http://127.0.0.1:8000/api/student/apply/", {
        phone: phone,
        job_id: jobId
      });
      toast.success(response.data.message || "Application submitted!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/student/web-search/?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(response.data.results || []);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to fetch search results");
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="home-page flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="home-page relative">

      <section className="section">
        <div className="home-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-header relative"
          >
            <div className="flex justify-between items-start w-full">
              <div className="z-10 relative">
                <p className="hero-college-name">KKMMPTC KALLETTUMKARA</p>
                <h1 className="hero-title">
                  Welcome back, <span className="highlight-text">{user?.full_name || 'Student'}</span>
                </h1>
                <p className="hero-subtitle">Here's what's happening in your placement journey today.</p>
                
                {user?.department && (
                  <div className="hero-department">
                      <BookOpen size={16} />
                      <span>{user.department} Department</span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Photo Badge - Outside Flex, absolute to hero-header */}
            <div className="profile-badge-corner overflow-hidden" style={{ top: '0', right: '0' }}>
              {user?.image ? (
                <img 
                  src={user.image} 
                  alt="Profile" 
                  className="profile-badge-image shadow-xl border-white/20"
                />
              ) : (
                <div className="profile-badge-placeholder">
                  <User size={40} />
                </div>
              )}
            </div>
          </motion.div>

    


          {/* Stats Grid */}
          <div className="stats-grid">
            {stats.map((stat, index) => {
              const icons = [
                <Briefcase className="text-blue-400" size={24} />,
                <TrendingUp className="text-purple-400" size={24} />,
                <Users className="text-green-400" size={24} />,
                <Building2 className="text-orange-400" size={24} />
              ];
              return (
                <StatsCard 
                  key={index}
                  icon={icons[index % icons.length]}
                  label={stat.label}
                  value={stat.value}
                  trend={stat.trend}
                />
              );
            })}
          </div>

          {/* Web Search Section */}
          <div className="mb-10">
            <form onSubmit={handleSearch} className="search-container relative w-full mb-6">
              <div className="search-icon-wrapper absolute left-0 top-0 bottom-0 flex items-center pl-4 pr-3 text-slate-400">
                <Search className="search-icon" />
              </div>
              <input
                type="text"
                className="search-input w-full bg-slate-800/50 border border-slate-700/50 text-white pl-12 pr-32 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
                placeholder="Search the web for placement guides, interview tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {/* Results Area */}
            {hasSearched && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl"
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-400" /> Web Search Results
                </h3>
                
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((result, idx) => (
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noreferrer" 
                        key={idx}
                        className="block p-4 bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-xl transition-all group"
                      >
                        <h4 className="text-blue-400 font-semibold text-[15px] group-hover:underline mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{result.title}</h4>
                        <p className="text-xs text-emerald-500/80 mb-2 truncate">{result.link}</p>
                        <p className="text-sm text-slate-300 line-clamp-2">{result.snippet}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No results found for "{searchQuery}". Try different keywords.</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          <div className="content-grid">
            {/* Recommended Jobs */}
            <div className="lg:col-span-2">
              {recommendations && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 mb-8 rounded-2xl bg-linear-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] relative overflow-hidden"
                >
                  <div className="absolute top-[-20px] right-[-20px] p-4 opacity-5 rotate-12">
                    <FileText size={120} className="text-purple-400" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-pink-400 mb-6 flex items-center gap-3">
                      <span className="bg-purple-500/20 p-2 rounded-lg text-purple-400 text-xl flex items-center justify-center">📈</span> 
                      ATS Score Booster
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {recommendations.rule_suggestions && recommendations.rule_suggestions.length > 0 && (
                        <div className="bg-black/20 rounded-xl p-5 border border-white/5 shadow-inner">
                          <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                            Priority Actions
                          </h4>
                          <ul className="space-y-3">
                            {recommendations.rule_suggestions.map((suggestion, idx) => (
                              <motion.li 
                                whileHover={{ x: 4 }}
                                key={idx} 
                                className="text-sm text-slate-200 flex items-start gap-3 bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm hover:border-purple-500/50 transition-colors"
                              >
                                <div className="mt-0.5 bg-linear-to-tr from-emerald-400 to-teal-400 rounded-full p-px shadow-lg shrink-0">
                                  <div className="bg-slate-900 rounded-full p-[2px]">
                                    <div className="text-emerald-400 font-bold w-3 h-3 flex items-center justify-center text-[10px]">✓</div>
                                  </div>
                                </div>
                                <span className="flex-1 font-medium">{suggestion}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {recommendations.ai_suggestions && (
                        <div className="flex flex-col h-full">
                           <div className="bg-linear-to-r from-blue-900/30 to-indigo-900/30 p-5 rounded-xl border border-blue-500/30 shadow-inner flex-1">
                            <h4 className="text-sm font-bold text-blue-300 mb-4 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]"></div>
                              AI Smart Review
                            </h4>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                              <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium italic">
                                "{recommendations.ai_suggestions}"
                              </p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                              <TrendingUp size={12} /> Personalized Coaching Active
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="section-header">
                <h2 className="section-title">Eligible Jobs</h2>
                <button className="view-all-btn" onClick={() => window.location.href='/jobs'}>
                  View All <ChevronRight size={16} />
                </button>
              </div>

              <div className="jobs-list">
                {recommendedJobs.length > 0 ? (
                  recommendedJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      onApply={() => handleApply(job.id)}
                      isApplying={applyingId === job.id}
                    />
                  ))
                ) : (
                   <div className="p-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p className="text-slate-400 italic">Finding jobs that match your skillset...</p>
                    <button 
                      onClick={() => window.location.href='/jobs'}
                      className="text-blue-400 text-sm mt-2 hover:underline font-medium"
                    >
                      Browse all available opportunities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events / Notices */}
            <div className="lg:col-span-1">
              <div className="section-header">
                <h2 className="section-title">Upcoming Drives</h2>
                <button 
                  className="view-all-btn"
                  onClick={() => setIsCalendarOpen(true)}
                >
                  View Calendar
                </button>
              </div>

              <div className="drives-container">
                 {upcomingDrives.length > 0 ? (
                   upcomingDrives.map((drive) => (
                     <DriveCard key={drive.id} drive={drive} />
                   ))
                 ) : (
                   <p className="text-center text-slate-500 py-4">No upcoming drives.</p>
                 )}
              </div>

              {/* Drive Posters Section */}
              <div className="mt-10">
                <div className="section-header">
                   <h2 className="section-title">Drive Posters</h2>
                </div>
                <div className="space-y-4">
                   {posters.map((poster) => (
                     <motion.div 
                       key={poster.id}
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden group cursor-pointer"
                       onClick={() => window.open(poster.image, '_blank')}
                     >
                       <div className="aspect-ratio relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                         <img 
                           src={poster.image} 
                           alt={poster.title} 
                           className="w-full h-full object-cover transition-transform group-hover:scale-105"
                         />
                         <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4">
                            <p className="text-white font-semibold text-sm truncate">{poster.title}</p>
                         </div>
                       </div>
                     </motion.div>
                   ))}
                   {posters.length === 0 && (
                     <p className="text-center text-slate-500 py-4 text-sm italic">No posters available.</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        drives={allDriveDates}
      />
    </div>
  );
}

// Components
const StatsCard = ({ icon, label, value, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="stats-card"
  >
    <div className="stats-header">
      <div className="stats-icon-wrapper">
        {icon}
      </div>
      {trend && <span className="stats-trend">{trend}</span>}
    </div>
    <div className="stats-value">{value}</div>
    <div className="stats-label">{label}</div>
  </motion.div>
);

const JobCard = ({ job, onApply, isApplying }) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    className="job-card"
  >
    <div className="job-card-content">
      <div className="job-info">
        <div className="company-logo">
          {job.company?.[0] || 'J'}
        </div>
        <div className="job-details">
          <h3>{job.role}</h3>
          <p className="company-name">{job.company}</p>
          <div className="job-meta">
            <span className="meta-item"><MapPin size={12} className="meta-icon" /> {job.location}</span>
            <span className="meta-item"><Briefcase size={12} className="meta-icon" /> {job.job_type}</span>
            <span className="meta-item text-green-400">₹ {job.salary}</span>
          </div>
        </div>
      </div>
      <button 
        className={`apply-btn ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onApply}
        disabled={isApplying}
      >
        {isApplying ? 'Applying...' : 'Apply'}
      </button>
    </div>
  </motion.div>
);

const DriveCard = ({ drive }) => (
  <div className="drive-card">
    <div className="date-box">
      <span className="month">{drive.month}</span>
      <span className="day">{drive.day}</span>
    </div>
    <div className="drive-info">
      <h4>{drive.company}</h4>
      <p className="drive-role">{drive.role}</p>
      <div className="job-meta">
        <Clock size={12} /> {drive.time}
      </div>
    </div>
  </div>
);

const CalendarModal = ({ isOpen, onClose, drives }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  if (!isOpen) return null;

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const driveMap = drives.reduce((acc, drive) => {
    acc[drive.date] = acc[drive.date] || [];
    acc[drive.date].push(drive);
    return acc;
  }, {});

  const days = [];
  const totalDays = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= totalDays; i++) days.push(i);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Drive Calendar</h3>
              <p className="text-xs text-slate-400">{monthName} {year}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg text-white"><ChevronLeft size={20} /></button>
            <h4 className="text-md font-semibold text-white">{monthName}</h4>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg text-white"><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[10px] uppercase font-bold text-slate-500 text-center py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="h-10" />;
              
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const dayDrives = driveMap[dateStr];
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              return (
                <div key={day} className="relative group">
                  <div 
                    className={`h-10 flex items-center justify-center rounded-lg text-sm transition-all
                      ${dayDrives ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5'}
                      ${isToday && !dayDrives ? 'border border-blue-500/30' : ''}
                    `}
                  >
                    {day}
                    {dayDrives && (
                      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  
                  {dayDrives && (
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 pointer-events-none">
                      <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Drives on {day} {monthName}</p>
                      {dayDrives.map(d => (
                        <div key={d.id} className="mb-2 last:mb-0">
                          <p className="text-xs font-bold text-white leading-tight">{d.role}</p>
                          <p className="text-[10px] text-slate-400">{d.company}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Scheduled Drive</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 border border-blue-500/30 rounded-full"></div>
                <span className="text-[10px] text-slate-400 uppercase font-medium">Today</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Student;
