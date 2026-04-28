import React from 'react';
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle, Clock, BookOpen, AlertTriangle } from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import "../Home.css";

const Teacher = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [announcement, setAnnouncement] = React.useState({ title: '', message: '' });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [incompleteProfiles, setIncompleteProfiles] = React.useState(0);
    const [isAlerting, setIsAlerting] = React.useState(false);
    const [posters, setPosters] = React.useState([]);
    const [isPostersLoading, setIsPostersLoading] = React.useState(false);

    const fetchData = async () => {
        try {
            const phone = user?.phone || user?.user_id;
            const [dashRes, postersRes] = await Promise.all([
                axios.get(`http://127.0.0.1:8000/api/teacher/dashboard/?phone=${phone}`),
                axios.get(`http://127.0.0.1:8000/api/placement/posters/`)
            ]);
            setStats(dashRes.data.stats || []);
            setIncompleteProfiles(dashRes.data.incomplete_profiles || 0);
            setPosters(postersRes.data || []);
        } catch (error) {
            console.error("Error fetching teacher dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleAnnouncementSubmit = async (e) => {
        e.preventDefault();
        if (!announcement.title.trim() || !announcement.message.trim()) {
            toast.error("Please fill in both title and message");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const phone = user?.phone || user?.user_id;
            await axios.post('http://127.0.0.1:8000/api/teacher/announcement/', {
                phone,
                title: announcement.title,
                message: announcement.message
            });
            toast.success("Announcement sent successfully!");
            setAnnouncement({ title: '', message: '' });
        } catch (error) {
            console.error("Error sending announcement:", error);
            toast.error(error.response?.data?.error || "Failed to send announcement");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAlertProfiles = async () => {
        if (incompleteProfiles === 0) {
            toast.info("All student profiles are complete!");
            return;
        }

        setIsAlerting(true);
        try {
            const phone = user?.phone || user?.user_id;
            const response = await axios.post('http://127.0.0.1:8000/api/teacher/alert-incomplete-profiles/', {
                phone
            });
            toast.success(response.data.message || "Alert sent successfully to students with incomplete profiles.");
        } catch (error) {
            console.error("Error sending profile alerts:", error);
            toast.error(error.response?.data?.error || "Failed to send profile alerts.");
        } finally {
            setIsAlerting(false);
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
        <div className="home-page">
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
                                    Welcome back, <span className="highlight-text">{user?.full_name || 'Teacher'}</span>
                                </h1>
                                <p className="hero-subtitle">Manage your students and their progress.</p>
                                
                                {user?.department && (
                                    <div className="hero-department">
                                        <BookOpen size={16} />
                                        <span>{user.department} Department</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Photo Badge - Outside Flex */}
                        <div className="profile-badge-corner overflow-hidden" style={{ top: '0', right: '0' }}>
                            {user?.image ? (
                                <img 
                                    src={user.image} 
                                    alt="Profile" 
                                    className="profile-badge-image shadow-xl"
                                />
                            ) : (
                                <div className="profile-badge-placeholder">
                                    <Users size={40} />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <div className="stats-grid">
                        {stats.map((stat, index) => {
                            const icons = [
                                <Users className="text-blue-400" size={24} />,
                                <CheckCircle className="text-green-400" size={24} />,
                                <Clock className="text-orange-400" size={24} />
                            ];
                            const isClickable = stat.label === "Total Students";
                            return (
                                <SimpleStatsCard 
                                    key={index}
                                    icon={icons[index % icons.length]}
                                    label={stat.label}
                                    value={stat.value}
                                    onClick={isClickable ? () => navigate("/home/teacher/students") : undefined}
                                />
                            );
                        })}
                    </div>

                    
                    <div className="flex flex-col lg:flex-row gap-8 items-start" style={{ marginTop: '2.5rem' }}>
                        <div className="lg:w-2/3 w-full space-y-10">
                            <div className="content-grid" style={{ marginTop: '0' }}>
                                <div className="section-header">
                                    <h2 className="section-title">Quick Actions</h2>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button className="apply-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>View Applications</button>
                                    <button 
                                        onClick={() => navigate("/home/teacher/interviews")}
                                        className="apply-btn" 
                                        style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#4f46e5' }}
                                    >
                                        Manage Interviews
                                    </button>
                                    <button 
                                        onClick={() => navigate("/home/teacher/students")}
                                        className="apply-btn" 
                                        style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#333' }}
                                    >
                                        Manage Students
                                    </button>
                                </div>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="rounded-2xl overflow-hidden" 
                                style={{ 
                                    marginTop: '0',
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(12px)'
                                }}
                            >
                                <div className="p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-3 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Make an Announcement</h2>
                                            <p className="text-sm text-slate-400 mt-1">
                                                Broadcast a message to all students in the <span className="font-semibold text-slate-300">{user?.department || 'your'}</span> department.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <form onSubmit={handleAnnouncementSubmit} className="mt-8 space-y-6">
                                        <div className="space-y-2 relative group">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Announcement Title</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={announcement.title}
                                                    onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                                                    placeholder="e.g., Upcoming Placement Drive for Final Years"
                                                    className="w-full px-5 py-3.5 rounded-xl transition-all duration-200 outline-none text-white placeholder-slate-500 hover:border-blue-400/50"
                                                    style={{
                                                        background: 'rgba(15, 23, 42, 0.6)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-end ml-1">
                                                <label className="text-sm font-semibold text-slate-300">Message Details</label>
                                                <span className={`text-xs ${announcement.message.length > 500 ? 'text-orange-400' : 'text-slate-500'}`}>
                                                    {announcement.message.length} characters
                                                </span>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    value={announcement.message}
                                                    onChange={(e) => setAnnouncement({...announcement, message: e.target.value})}
                                                    placeholder="Provide detailed information, instructions, or links here..."
                                                    rows="5"
                                                    className="w-full px-5 py-3.5 rounded-xl transition-all duration-200 outline-none resize-y text-white placeholder-slate-500 hover:border-blue-400/50"
                                                    style={{
                                                        background: 'rgba(15, 23, 42, 0.6)',
                                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                                    }}
                                                ></textarea>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex justify-end">
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="submit" 
                                                disabled={isSubmitting || !announcement.title.trim() || !announcement.message.trim()}
                                                className={`flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-md ${
                                                    isSubmitting 
                                                    ? 'bg-blue-500/50 cursor-not-allowed shadow-none' 
                                                    : !announcement.title.trim() || !announcement.message.trim()
                                                        ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed shadow-none border border-slate-600/50'
                                                        : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 hover:shadow-lg'
                                                }`}
                                            >
                                                {isSubmitting ? "Sending..." : "Publish Announcement"}
                                            </motion.button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="rounded-2xl overflow-hidden" 
                                style={{ 
                                    marginTop: '0',
                                    background: 'rgba(30, 41, 59, 0.4)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(12px)'
                                }}
                            >
                                <div className="p-6 md:p-8 flex flex-col items-start justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl shrink-0">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Incomplete Profiles</h2>
                                            <p className="text-sm text-slate-400 mt-1">
                                                You have <span className="font-bold text-orange-400">{incompleteProfiles}</span> students in your department with missing profile data.
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleAlertProfiles}
                                        disabled={isAlerting || incompleteProfiles === 0}
                                        className="apply-btn"
                                        style={{ 
                                            width: 'auto', 
                                            background: 'linear-gradient(to right, #f97316, #dc2626)',
                                            opacity: 1,
                                            transform: 'none',
                                            display: 'block'
                                        }}
                                    >
                                        {isAlerting ? "Sending..." : "Send Alert Notification"}
                                    </button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Sidebar - Drive Posters */}
                        <div className="lg:w-1/3 w-full">
                            <div className="section-header">
                                <h2 className="section-title">Drive Posters</h2>
                            </div>
                            <div className="space-y-6">
                                {posters.map((poster) => (
                                    <motion.div 
                                        key={poster.id}
                                        whileHover={{ y: -5 }}
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
                                    <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <p className="text-slate-500 text-sm italic">No posters available.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
};

const SimpleStatsCard = ({ icon, label, value, onClick }) => (
    <motion.div 
      whileHover={onClick ? { y: -5, scale: 1.02, cursor: 'pointer' } : { y: -5 }}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className="stats-card"
      onClick={onClick}
    >
      <div className="stats-header">
        <div className="stats-icon-wrapper">
          {icon}
        </div>
      </div>
      <div className="stats-value">{value}</div>
      <div className="stats-label">{label}</div>
    </motion.div>
  );

export default Teacher;
