import React from 'react';
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle, Clock, BookOpen } from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import "../Home.css";

const Teacher = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchData = async () => {
        try {
            const phone = user?.phone || user?.user_id;
            const response = await axios.get(`http://127.0.0.1:8000/api/teacher/dashboard/?phone=${phone}`);
            setStats(response.data.stats || []);
        } catch (error) {
            console.error("Error fetching teacher dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) fetchData();
    }, [user]);


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
                                    <User size={40} />
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

                    
                    <div className="content-grid" style={{ marginTop: '2.5rem' }}>
                        <div className="section-header">
                            <h2 className="section-title">Quick Actions</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
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
