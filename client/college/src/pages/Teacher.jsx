import React from 'react';
import { motion } from "framer-motion";
import { Users, FileText, CheckCircle } from "lucide-react";
import "./Home.css";

const Teacher = ({ user }) => {
    return (
        <div className="home-page">
            <section className="section">
                <div className="home-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="hero-header"
                    >
                        <h1 className="hero-title">
                            Welcome back, <span className="highlight-text">{user?.full_name || 'Teacher'}</span>
                        </h1>
                        <p className="hero-subtitle">Manage your students and their progress.</p>
                    </motion.div>

                    <div className="stats-grid">
                        <SimpleStatsCard 
                            icon={<Users className="text-blue-400" size={24} />}
                            label="Total Students"
                            value="120"
                        />
                        <SimpleStatsCard 
                            icon={<CheckCircle className="text-green-400" size={24} />}
                            label="Placed Students"
                            value="45"
                        />
                        <SimpleStatsCard 
                            icon={<FileText className="text-purple-400" size={24} />}
                            label="Pending Approvals"
                            value="12"
                        />
                    </div>
                    
                    <div className="content-grid" style={{ marginTop: '2rem' }}>
                        <div className="section-header">
                            <h2 className="section-title">Quick Actions</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                             <button className="apply-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>View Applications</button>
                             <button className="apply-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#333' }}>Manage Students</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const SimpleStatsCard = ({ icon, label, value }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="stats-card"
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
