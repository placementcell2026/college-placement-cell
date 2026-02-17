import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Award, 
  Camera, 
  FileText, 
  Download, 
  Save, 
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import axios from 'axios';
import "./StudentProfile.css";

const StudentProfile = () => {
  const { user } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Editable fields state
  const [formData, setFormData] = useState({
    dob: '',
    gender: '',
    college: '',
    department: '',
    course: '',
    semester: '',
    roll_no: '',
    skills: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const phone = user?.user_id || user?.phone;
        const res = await axios.get(`http://127.0.0.1:8000/api/student/profile/?phone=${phone}`);
        setProfile(res.data);
        setFormData({
          dob: res.data.dob || '',
          gender: res.data.gender || '',
          college: res.data.college || '',
          department: res.data.department || '',
          course: res.data.course || '',
          semester: res.data.semester || '',
          roll_no: res.data.roll_no || '',
          skills: res.data.skills || '',
        });
        setImagePreview(res.data.image ? `http://127.0.0.1:8000${res.data.image}` : null);
      } catch (err) {
        setError("Failed to load profile data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (name === 'image') {
        setImageFile(files[0]);
        setImagePreview(URL.createObjectURL(files[0]));
      } else {
        setResumeFile(files[0]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const phone = user?.user_id || user?.phone;
    const data = new FormData();
    data.append('phone', phone);
    
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    if (imageFile) data.append('image', imageFile);
    if (resumeFile) data.append('resume', resumeFile);

    try {
      await axios.patch(`http://127.0.0.1:8000/api/student/profile/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Re-fetch completion percentage
      const res = await axios.get(`http://127.0.0.1:8000/api/student/profile/?phone=${phone}`);
      setProfile(prev => ({ ...prev, profile_completion: res.data.profile_completion }));
    } catch (err) {
      setError("Failed to update profile.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-grid"
        >
          {/* Sidebar */}
          <div className="profile-sidebar">
            <div className="profile-card profile-image-section">
              <div className="profile-image-wrapper">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="profile-image" />
                ) : (
                  <div className="profile-image flex items-center justify-center bg-slate-800">
                    <User size={64} className="text-slate-600" />
                  </div>
                )}
                <label className="image-upload-label">
                  <Camera size={20} className="text-white" />
                  <input type="file" name="image" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <h2 className="profile-name">{profile?.full_name}</h2>
              <span className="profile-role">Student</span>
              
              <div className="completion-section">
                <div className="completion-header">
                  <span className="completion-label">Profile Completion</span>
                  <span className="completion-value">{profile?.profile_completion}%</span>
                </div>
                <div className="progress-bar-bg">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile?.profile_completion}%` }}
                    className="progress-bar-fill"
                  />
                </div>
              </div>
            </div>

            <div className="profile-card">
               <h3 className="section-title">Academic Record</h3>
               <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Overall CGPA</span>
                   <span className="text-blue-400 font-bold">{profile?.overall_cgpa}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Total Backlogs</span>
                   <span className="text-orange-400 font-bold">{profile?.total_backlogs}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400">Current Semester</span>
                   <span className="text-white font-bold">{profile?.semester}</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="profile-card">
            <form onSubmit={handleSubmit} className="form-section">
              {/* Account Info (Read-only) */}
              <div>
                <h3 className="section-title">Account Information</h3>
                <div className="input-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" value={profile?.full_name} disabled className="profile-input" />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="text" value={profile?.email} disabled className="profile-input" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="text" value={profile?.phone} disabled className="profile-input" />
                  </div>
                </div>
              </div>

              {/* Personal & Academic Details (Editable) */}
              <div>
                <h3 className="section-title">Academic & Personal Details</h3>
                <div className="input-grid">
                  <div className="input-group">
                    <label>Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob"
                      value={formData.dob} 
                      onChange={handleInputChange}
                      className="profile-input" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Gender</label>
                    <select 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                      className="profile-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>College</label>
                    <input 
                      type="text" 
                      name="college"
                      value={formData.college} 
                      onChange={handleInputChange}
                      className="profile-input" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Department</label>
                    <input 
                      type="text" 
                      name="department"
                      value={formData.department} 
                      onChange={handleInputChange}
                      className="profile-input" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Course</label>
                    <input 
                      type="text" 
                      name="course"
                      value={formData.course} 
                      onChange={handleInputChange}
                      className="profile-input" 
                    />
                  </div>
                  <div className="input-group">
                    <label>Roll Number</label>
                    <input 
                      type="text" 
                      name="roll_no"
                      value={formData.roll_no} 
                      onChange={handleInputChange}
                      className="profile-input" 
                    />
                  </div>
                </div>
              </div>

              {/* Skills & Resume */}
              <div>
                <h3 className="section-title">Skills & Documents</h3>
                <div className="flex flex-col gap-4">
                  <div className="input-group">
                    <label>Professional Skills</label>
                    <textarea 
                      name="skills"
                      rows="3"
                      value={formData.skills} 
                      onChange={handleInputChange}
                      placeholder="Enter your skills"
                      className="profile-input"
                    />
                  </div>
                  
                  <div className="resume-section">
                    <div className="resume-info">
                      <div className="resume-icon">
                        <FileText size={24} />
                      </div>
                      <div>
                        {resumeFile ? (
                          <span className="resume-name">{resumeFile.name} (Ready to upload)</span>
                        ) : profile?.resume ? (
                          <div className="flex flex-col">
                            <span className="resume-name">Current Resume Found</span>
                            <a href={`http://127.0.0.1:8000${profile.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                              <Download size={12} /> Download Current CV
                            </a>
                          </div>
                        ) : (
                          <span className="resume-name">No resume uploaded yet</span>
                        )}
                      </div>
                    </div>
                    <label className="btn-primary text-sm cursor-pointer py-2 px-4">
                      {profile?.resume ? 'Change Resume' : 'Upload Resume'}
                      <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Feedback & Actions */}
              <div className="flex flex-col gap-4">
                {error && <p className="text-red-400 text-sm text-center">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center">Profile updated successfully!</p>}
                
                <div className="action-buttons">
                   <button 
                    type="submit" 
                    className="btn-primary flex items-center gap-2"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : <><Save size={18} /> Save Profile</>}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentProfile;
