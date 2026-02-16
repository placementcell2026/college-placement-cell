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
import "./Home.css";

const Student = ({ user }) => {
  return (
    <div className="home-page">
      {/* Hero / Welcome Section */}
      <section className="section">
        <div className="home-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="hero-header"
          >
            <h1 className="hero-title">
              Welcome back, <span className="highlight-text">{user?.full_name || 'Student'}</span>
            </h1>
            <p className="hero-subtitle">Here's what's happening in your placement journey today.</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <StatsCard 
              icon={<Briefcase className="text-blue-400" size={24} />}
              label="Jobs Applied"
              value="12"
              trend="+2 this week"
            />
            <StatsCard 
              icon={<Building2 className="text-purple-400" size={24} />}
              label="Companies Visiting"
              value="5"
              trend="Next: Google"
            />
            <StatsCard 
              icon={<Users className="text-green-400" size={24} />}
              label="Interviews Shortlisted"
              value="3"
              trend="Check Schedule"
            />
            <StatsCard 
              icon={<TrendingUp className="text-orange-400" size={24} />}
              label="Profile Strength"
              value="85%"
              trend="Update Skills"
            />
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
                <h2 className="section-title">Recommended Jobs</h2>
                <button className="view-all-btn">
                  View All <ChevronRight size={16} />
                </button>
              </div>
              
              <div className="jobs-list">
                {recommendedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>

            {/* Upcoming Events / Notices */}
            <div className="lg:col-span-1">
              <div className="section-header">
                <h2 className="section-title">Upcoming Drives</h2>
                <button className="view-all-btn">View Calendar</button>
              </div>

              <div className="drives-container">
                 {upcomingDrives.map((drive) => (
                   <DriveCard key={drive.id} drive={drive} />
                 ))}
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

const JobCard = ({ job }) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    className="job-card"
  >
    <div className="job-card-content">
      <div className="job-info">
        <div className="company-logo">
          {job.logo}
        </div>
        <div className="job-details">
          <h3>{job.role}</h3>
          <p className="company-name">{job.company}</p>
          <div className="job-meta">
            <span className="meta-item"><MapPin size={12} className="meta-icon" /> {job.location}</span>
            <span className="meta-item"><Briefcase size={12} className="meta-icon" /> {job.type}</span>
            <span className="meta-item text-green-400">₹ {job.salary}</span>
          </div>
        </div>
      </div>
      <button className="apply-btn">
        Apply
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

// Mock Data
const recommendedJobs = [
  { id: 1, role: "Software Engineer Intern", company: "Microsoft", location: "Bangalore", type: "Full Time", salary: "12 LPA", logo: "M" },
  { id: 2, role: "Frontend Developer", company: "Adobe", location: "Noida", type: "Full Time", salary: "10 LPA", logo: "A" },
  { id: 3, role: "Data Analyst", company: "Dons", location: "Remote", type: "Internship", salary: "25k/mo", logo: "D" },
];

const upcomingDrives = [
  { id: 1, company: "Google", role: "SDE - I", month: "FEB", day: "10", "time": "10:00 AM" },
  { id: 2, company: "Amazon", role: "Cloud Support", month: "FEB", day: "15", "time": "09:30 AM" },
  { id: 3, company: "TCS", role: "Ninja / Digital", month: "FEB", day: "20", "time": "11:00 AM" },
];

export default Student;
