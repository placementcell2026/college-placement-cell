import React from 'react';
import { motion } from "framer-motion";
import { 
  Briefcase, 
  Building2, 
  Users, 
  TrendingUp, 
  ChevronRight,
  Search,
  MapPin,
  Clock
} from "lucide-react";
import axios from 'axios';
import "./Home.css";

const Student = ({ user }) => {
  const [stats, setStats] = React.useState([]);
  const [recommendedJobs, setRecommendedJobs] = React.useState([]);
  const [upcomingDrives, setUpcomingDrives] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [studentInfo, setStudentInfo] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [applyingId, setApplyingId] = React.useState(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const phone = user?.user_id || user?.phone;
        const [dashRes, notifRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/student/dashboard/?phone=${phone}`),
          axios.get(`http://127.0.0.1:8000/api/student/notifications/?phone=${phone}`)
        ]);
        
        setStudentInfo(dashRes.data.student_info);
        setStats(dashRes.data.stats || []);
        setRecommendedJobs(dashRes.data.recommended_jobs || []);
        setUpcomingDrives(dashRes.data.upcoming_drives || []);
        setNotifications(notifRes.data || []);
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
      alert(response.data.message || "Application submitted!");
      
      const notifRes = await axios.get(`http://127.0.0.1:8000/api/student/notifications/?phone=${phone}`);
      setNotifications(notifRes.data || []);
    } catch (error) {
      alert(error.response?.data?.error || "Failed to apply");
    } finally {
      setApplyingId(null);
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
            className="hero-header"
          >
            <div>
              <h1 className="hero-title">
                Welcome back, <span className="highlight-text">{user?.full_name || 'Student'}</span>
              </h1>
              <p className="hero-subtitle">Here's what's happening in your placement journey today.</p>
            </div>
          </motion.div>

    

          {/* Notifications Section */}
          {notifications.length > 0 && (
            <div className="notifications-banner mb-8">
               <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Clock size={16} />
                  <span className="text-sm font-semibold uppercase tracking-wider">Recent Updates</span>
               </div>
               <div className="space-y-2">
                 {notifications.slice(0, 2).map(n => (
                   <div key={n.id} className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm flex justify-between items-center transition-all hover:bg-white/10">
                     <span>{n.message}</span>
                     <span className="text-xs text-slate-500 whitespace-nowrap ml-4">
                       {new Date(n.created_at).toLocaleDateString()}
                     </span>
                   </div>
                 ))}
               </div>
            </div>
          )}

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

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-icon-wrapper">
              <Search className="search-icon" />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search for jobs, companies, or skills..."
            />
          </div>

          <div className="content-grid">
            {/* Recommended Jobs */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Eligible Jobs</h2>
                <button className="view-all-btn">
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
                  <div className="p-8 text-center bg-white/5 rounded-xl border border-white/10">
                    <p className="text-slate-400">No eligible jobs found for your profile.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events / Notices */}
            <div className="lg:col-span-1">
              <div className="section-header">
                <h2 className="section-title">Upcoming Drives</h2>
                <button className="view-all-btn">View Calendar</button>
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
            </div>
          </div>
        </div>
      </section>
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

export default Student;
