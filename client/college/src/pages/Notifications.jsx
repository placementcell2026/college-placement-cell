import React from 'react';
import { motion } from "framer-motion";
import { Bell, CheckCircle, Info, AlertTriangle, Clock, Trash2 } from "lucide-react";
import "./Notifications.css";

const Notifications = () => {
  const demoNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Application Successful',
      message: 'Your application for Software Engineer Intern at Microsoft has been received.',
      time: '2 hours ago',
      read: false,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Job Matching Your Skills',
      message: 'A new Frontend Developer role at Adobe has been posted. Check your eligibility!',
      time: '5 hours ago',
      read: true,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Profile Incomplete',
      message: 'Complete your academic profile to become eligible for more job drives.',
      time: '1 day ago',
      read: true,
    },
    {
      id: 4,
      type: 'info',
      title: 'Interview Scheduled',
      message: 'Your interview with Google is scheduled for Feb 25th at 10:00 AM.',
      time: '2 days ago',
      read: false,
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-400" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <header className="notifications-header">
          <div className="flex items-center gap-3">
            <div className="header-icon-wrapper">
              <Bell size={24} className="text-blue-400" />
            </div>
            <div>
              <h1>Notifications</h1>
              <p>Stay updated with your placement journey</p>
            </div>
          </div>
          <button className="clear-all-btn">
            <Trash2 size={16} /> Clear All
          </button>
        </header>

        <div className="notifications-list">
          {demoNotifications.length > 0 ? (
            demoNotifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
              >
                <div className="notif-icon-section">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-top">
                    <h3>{notif.title}</h3>
                    <span className="notif-time flex items-center gap-1">
                      <Clock size={12} /> {notif.time}
                    </span>
                  </div>
                  <p>{notif.message}</p>
                </div>
                {!notif.read && <div className="unread-dot" />}
              </motion.div>
            ))
          ) : (
            <div className="empty-notifications">
              <Bell size={48} className="text-slate-600 mb-4" />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
