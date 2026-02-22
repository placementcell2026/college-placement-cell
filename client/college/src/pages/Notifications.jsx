import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bell, CheckCircle, AlertTriangle, Info, Trash2, Clock,Users } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "./Notifications.css";
import "./Home.css";


const Notifications = () => {
  const [notifications, setNotifications] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(null);
  const [expandedNotifs, setExpandedNotifs] = React.useState(new Set());
  const [pendingStudents, setPendingStudents] = React.useState([]);
  const [pendingLoading, setPendingLoading] = React.useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const phone = user?.user_id || user?.phone;
        if (!phone) return;
        const response = await axios.get(`http://127.0.0.1:8000/api/accounts/notifications/?phone=${phone}`);
        setNotifications(response.data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPendingRegistrations = async () => {
      if (user?.role !== 'teacher') return;
      setPendingLoading(true);
      try {
        const phone = user?.user_id || user?.phone;
        const response = await axios.get(`http://127.0.0.1:8000/api/teacher/registrations/pending/?phone=${phone}`);
        setPendingStudents(response.data || []);
      } catch (error) {
        console.error("Error fetching pending registrations:", error);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchNotifications();
    fetchPendingRegistrations();
  }, [user?.phone, user?.user_id, user?.role]);

  const getIcon = (type) => {
    switch (type) {
      case 'registration_request': return <Users className="text-blue-400" size={20} />;
      case 'success': return <CheckCircle className="text-green-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-orange-400" size={20} />;
      case 'info': return <Info className="text-blue-400" size={20} />;
      default: return <Bell className="text-slate-400" size={20} />;
    }
  };

  const handleApprove = async (notif) => {
    if (!notif.extra_data?.request_id) return;
    
    setActionLoading(notif.id);
    try {
      await axios.post("http://127.0.0.1:8000/api/teacher/registrations/approve/", {
        student_id: notif.extra_data.request_id
      });
      // Remove notification from list immediately upon success
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (error) {
      console.error("Error approving student:", error);
      toast.error("Failed to approve student. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveStudent = async (studentId) => {
    setActionLoading(`student-${studentId}`);
    try {
      await axios.post("http://127.0.0.1:8000/api/teacher/registrations/approve/", {
        student_id: studentId
      });
      setPendingStudents(prev => prev.filter(s => s.id !== studentId));
      toast.success("Student approved successfully!");
    } catch (error) {
      console.error("Error approving student:", error);
      toast.error("Failed to approve student.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (notif) => {
    if (!notif.extra_data?.request_id) return;
    
    if (!window.confirm("Are you sure you want to reject this registration request?")) return;

    setActionLoading(notif.id);
    try {
      await axios.post("http://127.0.0.1:8000/api/teacher/registrations/reject/", {
        student_id: notif.extra_data.request_id
      });
      // Remove notification from list
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
    } catch (error) {
      console.error("Error rejecting student:", error);
      toast.error("Failed to reject student. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNotifs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClearAll = async () => {
    const phone = user?.user_id || user?.phone;
    if (!phone || notifications.length === 0) return;
    
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/accounts/notifications/?phone=${phone}`);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast.error("Failed to clear notifications");
    }
  };

  const handleDeleteNotif = async (e, id) => {
    e.stopPropagation(); // Prevent toggling expansion
    const phone = user?.user_id || user?.phone;
    if (!phone) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/accounts/notifications/?phone=${phone}&notif_id=${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const getDisplayableDetails = (extraData) => {
    // Exclude fields we don't want to show in the detailed list
    const exclude = ['type', 'request_id', 'password'];
    return Object.entries(extraData).filter(([key]) => !exclude.includes(key));
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
              <h1>{user?.role === 'student' ? 'Recent Updates' : 'Notifications'}</h1>
              <p>{user?.role === 'student' ? 'Latest alerts and placement news' : 'Stay updated with your placement journey'}</p>
            </div>
          </div>
          <button 
            className="clear-all-btn"
            onClick={handleClearAll}
            disabled={notifications.length === 0}
          >
            <Trash2 size={16} /> Clear All
          </button>
        </header>

        {user?.role === 'teacher' && pendingStudents.length > 0 && (
          <div className="pending-registrations-section" style={{ marginBottom: '3rem' }}>
            <div className="section-header">
              <h2 className="section-title">Pending Registrations</h2>
              <p className="section-subtitle">Student requests awaiting verification</p>
            </div>
            <div className="registration-list">
              {pendingStudents.map((student) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="registration-card"
                >
                  <div className="student-info">
                    <div className="info-main">
                      <h3>{student.full_name}</h3>
                      <span className="roll-badge">{student.roll_no}</span>
                    </div>
                    <div className="info-details">
                      <span>{student.email}</span>
                      <span className="dot">•</span>
                      <span>Requested on {new Date(student.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    className={`approve-inline-btn ${actionLoading === `student-${student.id}` ? 'loading' : ''}`}
                    onClick={() => handleApproveStudent(student.id)}
                    disabled={actionLoading !== null}
                  >
                    {actionLoading === `student-${student.id}` ? "Approving..." : "Approve Student"}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="notifications-list">
          {isLoading ? (
            <div className="flex justify-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`notification-item ${notif.is_read ? 'read' : 'unread'} ${notif.type}`}
              >
                <div className="notif-icon-section">
                  {getIcon(notif.type)}
                </div>
                <div className="notif-content">
                  <div className="notif-top">
                    <h3>{notif.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="notif-time flex items-center gap-1">
                        <Clock size={12} /> {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                      <button 
                        className="delete-notif-btn"
                        onClick={(e) => handleDeleteNotif(e, notif.id)}
                        title="Delete notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="notif-message">{notif.message}</p>
                  
                  {notif.type === 'registration_request' && notif.extra_data && (
                    <div className="notif-extra-content">
                      <div className="notif-actions-row">
                        <button 
                          className="notif-action-btn view-details"
                          onClick={() => toggleExpand(notif.id)}
                        >
                          {expandedNotifs.has(notif.id) ? "Hide Details" : "Show Details"}
                        </button>
                        
                        <div className="flex gap-2">
                          <button 
                            className={`notif-action-btn reject ${actionLoading === notif.id ? 'loading' : ''}`}
                            onClick={() => handleReject(notif)}
                            disabled={actionLoading !== null}
                          >
                            Reject
                          </button>
                          <button 
                            className={`notif-action-btn approve ${actionLoading === notif.id ? 'loading' : ''}`}
                            onClick={() => handleApprove(notif)}
                            disabled={actionLoading !== null}
                          >
                            {actionLoading === notif.id ? "Approving..." : "Accept"}
                          </button>
                        </div>
                      </div>

                      {expandedNotifs.has(notif.id) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="student-detail-box expanded"
                        >
                          {getDisplayableDetails(notif.extra_data).map(([key, value]) => (
                            <div className="detail-item" key={key}>
                              <span className="label">{key.replace(/_/g, ' ')}:</span>
                              <span className="value">{value || 'N/A'}</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}
                </div>
                {!notif.is_read && <div className="unread-dot" />}
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
