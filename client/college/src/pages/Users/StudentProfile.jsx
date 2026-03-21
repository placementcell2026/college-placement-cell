import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  FileText, 
  Download, 
  Save,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import { useOutletContext, Navigate, useLocation } from "react-router-dom";
import axios from 'axios';
import "./StudentProfile.css";

const StudentProfile = () => {
  const context = useOutletContext();
  const user = context?.user;
  
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Normalized role check - more robust fallback
  const userRole = (user?.role || localStorage.getItem('userRole') || 'student').toLowerCase();
  const isStudent = userRole === 'student';
  const isTeacher = userRole === 'teacher';
  const isPlacement = userRole === 'placement' || userRole === 'pcf';

  // Redirect to specific role path if on root /profile
  if (location.pathname === "/profile" && userRole) {
    return <Navigate to={`/profile/${userRole}`} replace />;
  }

  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const getApiUrl = () => {
    if (isTeacher) return "http://127.0.0.1:8000/api/teacher/profile/";
    if (isPlacement) return "http://127.0.0.1:8000/api/placement/profile/";
    return "http://127.0.0.1:8000/api/student/profile/";
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const phone = getPhone();
        console.log("Fetching profile for:", { phone, role: userRole });
        if (!phone) {
          setError("Session expired or phone missing. Please login again.");
          setLoading(false);
          return;
        }
        const res = await axios.get(`${getApiUrl()}?phone=${phone}`);
        const data = res.data;
        setProfile(data);
        
        // Initialize form data based on role
        const initialForm = { full_name: data.full_name || '' };

        if (isStudent) {
          Object.assign(initialForm, {
            dob: data.dob || '',
            gender: data.gender || '',
            college: data.college || '',
            department: data.department || '',
            course: data.course || '',
            semester: data.semester || '',
            roll_no: data.roll_no || '',
            skills: data.skills || '',
            overall_cgpa: data.overall_cgpa || '',
            total_backlogs: data.total_backlogs || '',
          });
        } else if (isTeacher) {
          Object.assign(initialForm, {
            designation: data.designation || '',
            qualification: data.qualification || '',
            department: data.department || '',
            experience: data.experience || '',
            position: data.position || '',
          });
        } else if (isPlacement) {
          Object.assign(initialForm, {
            designation: data.designation || '',
            office_role: data.office_role || '',
            experience: data.experience || '',
            college: data.college || '',
          });
        }
        setFormData(initialForm);
        setImagePreview(data.image ? (data.image.startsWith('http') ? data.image : `http://127.0.0.1:8000${data.image}`) : null);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Could not load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, userRole]);

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

    try {
      const phone = getPhone();
      if (!phone) {
        setError("Could not identify user. Please re-login.");
        setSaving(false);
        return;
      }
      const data = new FormData();
      data.append('phone', phone);
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      if (imageFile) data.append('image', imageFile);
      if (isStudent && resumeFile) data.append('resume', resumeFile);

      const response = await axios.patch(getApiUrl(), data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updatedProfile = response.data;
      setProfile(updatedProfile);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Also update localStorage so other pages have latest image/data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const newUser = { ...currentUser, ...updatedProfile };
      // Ensure image URL is absolute for local storage
      if (newUser.image && typeof newUser.image === 'string' && !newUser.image.startsWith('http')) {
        const baseUrl = "http://127.0.0.1:8000";
        newUser.image = newUser.image.startsWith('/') ? `${baseUrl}${newUser.image}` : `${baseUrl}/${newUser.image}`;
      }
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (err) {
      console.error("Profile update error:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "Failed to update profile.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const getPhone = () => {
    // Priority: local state > context user > localStorage user > localStorage userId
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.phone || user?.user_id || localUser.phone || localUser.user_id || localStorage.getItem('userId') || "";
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/authentication/login" replace />;
  }

  return (
    <div className="profile-page h-full relative">
      <div className="profile-container relative py-2 mb-8">
          {/* Absolute Background Badge (Top Right) */}
          <div className="profile-badge-corner" style={{ top: '10px', right: '10px' }}>
            {(profile?.image || user?.image) ? (
              <img 
                src={profile?.image || user?.image} 
                alt="Profile" 
                className="profile-badge-image shadow-2xl"
              />
            ) : (
              <div className="profile-badge-placeholder shadow-xl">
                <User size={40} />
              </div>
            )}
          </div>

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
                <label className="image-upload-label cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input type="file" name="image" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <h2 className="profile-name">{profile?.full_name || user?.full_name}</h2>
              <span className="profile-role capitalize">{userRole}</span>
              
              {isStudent && profile?.profile_completion !== undefined && (
                <div className="completion-section">
                  <div className="completion-header">
                    <span className="completion-label">Profile Completion</span>
                    <span className="completion-value">{profile.profile_completion}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.profile_completion}%` }}
                      className="progress-bar-fill"
                    />
                  </div>
                </div>
              )}
            </div>

            {isStudent && profile && (
              <>
                <div className="profile-card mt-6">
                   <h3 className="section-title">Academic Record</h3>
                   <div className="space-y-4">
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Overall CGPA</span>
                       <span className="text-blue-400 font-bold">{profile.overall_cgpa || '0.00'}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Total Backlogs</span>
                       <span className="text-orange-400 font-bold">{profile.total_backlogs || '0'}</span>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-400">Current Semester</span>
                       <span className="text-white font-bold">{profile.semester || 'N/A'}</span>
                     </div>
                       <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                         <span className="text-slate-400">ATS Score</span>
                         <span className={`font-bold ${parseFloat(profile.ats_score) > 50 ? 'text-green-400' : 'text-orange-400'}`}>
                           {profile.ats_score !== undefined && profile.ats_score !== null ? 
                             (profile.ats_score > 0 || (resumeFile || profile.resume)) ? `${profile.ats_score}%` : 'Not Checked'
                             : 'Not Checked'}
                         </span>
                        </div>
                     </div>
                 </div>

                <div className="profile-card mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="section-title mb-0 text-white">Eligible Jobs</h3>
                    <a href="/jobs" className="text-blue-400 text-xs hover:underline flex items-center gap-1 font-medium">
                      View All <ArrowRight size={12} />
                    </a>
                  </div>
                  <div className="space-y-3">
                    
                    {profile.eligible_jobs && profile.eligible_jobs.length > 0 ? (
                      profile.eligible_jobs.map((job) => (
                        <div key={job.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate max-w-[150px]">{job.role}</h4>
                              <p className="text-xs text-slate-400">{job.company}</p>
                            </div>
                            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full whitespace-nowrap">
                              {job.location}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-lg bg-white/5 border border-dashed border-white/10 text-center">
                        <p className="text-xs text-slate-500 italic">Looking for matching opportunities...</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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
                    <input type="text" value={profile?.full_name || user?.full_name || ''} disabled className="profile-input bg-slate-800/50" />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input type="text" value={profile?.email || user?.email || ''} disabled className="profile-input bg-slate-800/50" />
                  </div>
                  <div className="input-group">
                    <label>Phone Number</label>
                    <input type="text" value={profile?.phone || user?.phone || user?.user_id || ''} disabled className="profile-input bg-slate-800/50" />
                  </div>
                </div>
              </div>

              {/* Role-Specific Details */}
              <div>
                <h3 className="section-title">
                  {isStudent ? "Academic & Personal Details" : "Professional Details"}
                </h3>
                <div className="input-grid">
                  {isStudent && (
                    <>
                      <div className="input-group">
                        <label>Date of Birth</label>
                        <input type="date" name="dob" value={formData.dob || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Gender</label>
                        <select name="gender" value={formData.gender || ''} onChange={handleInputChange} className="profile-input">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="input-group">
                        <label>College</label>
                        <input type="text" name="college" value={formData.college || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Department</label>
                        <input type="text" name="department" value={formData.department || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Course</label>
                        <input type="text" name="course" value={formData.course || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Roll Number</label>
                        <input type="text" name="roll_no" value={formData.roll_no || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Overall CGPA</label>
                        <input type="number" step="0.01" min="0" max="10" name="overall_cgpa" value={formData.overall_cgpa || ''} onChange={handleInputChange} className="profile-input" placeholder="0.00" />
                      </div>
                      <div className="input-group">
                        <label>Total Backlogs</label>
                        <input type="number" min="0" name="total_backlogs" value={formData.total_backlogs || ''} onChange={handleInputChange} className="profile-input" placeholder="0" />
                      </div>
                    </>
                  )}

                  {isTeacher && (
                    <>
                      <div className="input-group">
                        <label>Designation</label>
                        <input type="text" name="designation" value={formData.designation || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Qualification</label>
                        <input type="text" name="qualification" value={formData.qualification || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Department</label>
                        <input type="text" name="department" value={formData.department || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Experience</label>
                        <input type="text" name="experience" value={formData.experience || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Position</label>
                        <input type="text" name="position" value={formData.position || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                    </>
                  )}

                  {isPlacement && (
                    <>
                      <div className="input-group">
                        <label>Designation</label>
                        <input type="text" name="designation" value={formData.designation || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Office Role</label>
                        <input type="text" name="office_role" value={formData.office_role || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>Experience</label>
                        <input type="text" name="experience" value={formData.experience || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                      <div className="input-group">
                        <label>College</label>
                        <input type="text" name="college" value={formData.college || ''} onChange={handleInputChange} className="profile-input" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Skills & Resume - ONLY for Students */}
              {isStudent && (
                <div>
                  <h3 className="section-title">Skills & Documents</h3>
                  <div className="flex flex-col gap-4">
                    <div className="input-group">
                      <label>Professional Skills</label>
                      <textarea 
                        name="skills"
                        rows="3"
                        value={formData.skills || ''} 
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
                            <span className="resume-name">{resumeFile.name} (Ready)</span>
                          ) : profile?.resume ? (
                            <div className="flex flex-col">
                              <span className="resume-name">Current Resume Found</span>
                              <a href={`http://127.0.0.1:8000${profile.resume}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                                <Download size={12} /> View Current CV
                              </a>
                            </div>
                          ) : (
                            <span className="resume-name">No resume uploaded</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <label className="btn-primary text-sm cursor-pointer py-2 px-4 whitespace-nowrap">
                      {profile?.resume ? 'Update Resume' : 'Upload Resume'}
                      <input type="file" name="resume" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                    </label>
                  </div>
                </div>
              )}

              {/* Feedback & Actions */}
              <div className="flex flex-col gap-4 mt-6">
                {error && <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded">{error}</p>}
                {success && <p className="text-green-400 text-sm text-center bg-green-400/10 py-2 rounded">Profile updated successfully!</p>}
                
                <div className="action-buttons">
                   <button 
                    type="submit" 
                    className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
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
