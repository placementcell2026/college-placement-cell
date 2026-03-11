import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Building, 
  Users, 
  Plus, 
  FileText, 
  Download, 
  Calendar, 
  MapPin, 
  IndianRupee,
  ChevronDown,
  ChevronUp,
  X,
  Trash2
} from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import "../Home.css";

const PlacementOfficer = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeJobs, setActiveJobs] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [expandedJob, setExpandedJob] = useState(null);
    const [jobApplicants, setJobApplicants] = useState({});
    
    // Poster States
    const [posters, setPosters] = useState([]);
    const [isPostersLoading, setIsPostersLoading] = useState(false);
    const [showPosterModal, setShowPosterModal] = useState(false);
    const [posterFormData, setPosterFormData] = useState({
        title: '',
        image: null
    });
    const [isSubmittingPoster, setIsSubmittingPoster] = useState(false);
    
    // Stats Modal State
    const [showStatsModal, setShowStatsModal] = useState(false);
    const [statsModalType, setStatsModalType] = useState(null); // 'Registered Students', 'Total Applications'
    const [statsModalData, setStatsModalData] = useState([]);
    const [isStatsLoading, setIsStatsLoading] = useState(false);

    const [formData, setFormData] = useState({
        company: '',
        role: '',
        location: '',
        job_type: 'Full Time',
        salary: '',
        description: '',
        skills_required: '',
        min_cgpa: 0,
        max_backlogs: 0,
        allowed_departments: '',
        deadline: '',
        qualification: '',
        responsibilities: '',
        requirements: '',
        meeting_link: '',
        department: '',
        attachment: null
    });

    const fetchData = async () => {
        try {
            const [statsRes, jobsRes, postersRes] = await Promise.all([
                axios.get("http://127.0.0.1:8000/api/placement/dashboard/"),
                axios.get("http://127.0.0.1:8000/api/placement/jobs/"),
                axios.get("http://127.0.0.1:8000/api/placement/posters/")
            ]);
            setStats(statsRes.data.stats || []);
            setActiveJobs(jobsRes.data || []);
            setPosters(postersRes.data || []);
        } catch (error) {
            console.error("Error fetching placement data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://127.0.0.1:8000/api/placement/jobs/", formData);
            toast.success("Job Drive scheduled successfully!");
            
            setShowCreateForm(false);
            setFormData({
                company: '', role: '', location: '', job_type: 'Full Time',
                salary: '', description: '', skills_required: '',
                min_cgpa: 0, max_backlogs: 0, allowed_departments: '', deadline: '',
                qualification: '', responsibilities: '', requirements: '',
                meeting_link: '', department: '', attachment: null
            });
            fetchData();
        } catch (error) {
            console.error("Error creating record:", error.response?.data);
            const serverErrors = error.response?.data;
            let errorMsg = "Failed to create job drive";
            
            if (serverErrors) {
                if (typeof serverErrors === 'object') {
                    errorMsg = Object.entries(serverErrors)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join(' | ');
                } else {
                    errorMsg = serverErrors;
                }
            }
            
            toast.error(errorMsg);
        }
    };

    const toggleJobDetails = async (jobId) => {
        if (expandedJob === jobId) {
            setExpandedJob(null);
        } else {
            setExpandedJob(jobId);
            if (!jobApplicants[jobId]) {
                try {
                    const res = await axios.get(`http://127.0.0.1:8000/api/placement/jobs/${jobId}/applicants/`);
                    setJobApplicants(prev => ({ ...prev, [jobId]: res.data }));
                } catch (error) {
                    toast.error("Failed to fetch applicants");
                }
            }
        }
    };

    const handleExportPDF = async (jobId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/placement/jobs/${jobId}/export_pdf/`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `applicants_job_${jobId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to download PDF");
        }
    };

    const handleStatClick = async (label) => {
        if (label === "Active Drives") return;
        
        if (label === "Departments") {
            navigate("/home/placement/departments");
            return;
        }
        
        setStatsModalType(label);
        setShowStatsModal(true);
        setIsStatsLoading(true);
        
        try {
            let endpoint;
            if (label === "Students Registered") {
                endpoint = "students/";
            } else if (label === "Teachers Registered") {
                endpoint = "teachers/";
            } else {
                endpoint = "applications/";
            }
            const res = await axios.get(`http://127.0.0.1:8000/api/placement/${endpoint}`);
            setStatsModalData(res.data);
        } catch (error) {
            toast.error(`Failed to fetch ${label.toLowerCase()}`);
            setShowStatsModal(false);
        } finally {
            setIsStatsLoading(false);
        }
    };

    const handleDownloadStatsPDF = async () => {
        try {
            let endpoint;
            if (statsModalType === "Students Registered") {
                endpoint = "students/export/";
            } else if (statsModalType === "Teachers Registered") {
                endpoint = "teachers/export/";
            } else {
                endpoint = "applications/export/";
            }
            const res = await axios.get(`http://127.0.0.1:8000/api/placement/${endpoint}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${statsModalType.toLowerCase().replace(' ', '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to download PDF");
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (window.confirm("Are you sure you want to delete this job drive?")) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/placement/jobs/${jobId}/`);
                toast.success("Job drive deleted");
                fetchData();
            } catch (error) {
                toast.error("Failed to delete job");
            }
        }
    };

    const handleStudentAction = async (studentId, action) => {
        const confirmMsg = action === 'remove' 
            ? "Are you sure you want to permanently remove this student? This action cannot be undone."
            : `Are you sure you want to ${action} this student?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/accounts/student-action/", {
                student_id: studentId,
                action: action
            });
            toast.success(response.data.message);
            // Refresh modal data
            handleStatClick(statsModalType);
        } catch (error) {
            console.error(`Error performing ${action} on student:`, error);
            toast.error(error.response?.data?.error || `Failed to ${action} student`);
        }
    };

    const handleCreatePoster = async (e) => {
        e.preventDefault();
        if (!posterFormData.image) {
            toast.error("Please select a poster image");
            return;
        }

        setIsSubmittingPoster(true);
        const data = new FormData();
        data.append('title', posterFormData.title);
        data.append('image', posterFormData.image);
        data.append('phone', user?.phone || user?.user_id);

        try {
            await axios.post("http://127.0.0.1:8000/api/placement/posters/", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Poster uploaded successfully!");
            setShowPosterModal(false);
            setPosterFormData({ title: '', image: null });
            fetchData();
        } catch (error) {
            toast.error("Failed to upload poster");
        } finally {
            setIsSubmittingPoster(false);
        }
    };

    const handleDeletePoster = async (posterId) => {
        if (!window.confirm("Delete this poster?")) return;

        try {
            await axios.delete(`http://127.0.0.1:8000/api/placement/posters/${posterId}/`);
            toast.success("Poster deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete poster");
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
                        className="hero-header relative"
                    >
                        <div className="flex justify-between items-start w-full">
                            <div className="z-10 relative">
                                <h1 className="hero-title">
                                    Placement <span className="highlight-text">Officer</span> Portal
                                </h1>
                                <p className="hero-subtitle">Manage company drives and student applications.</p>

                                {user?.college && (
                                    <div className="hero-department">
                                        <Building size={16} />
                                        <span>{user.college}</span>
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
                                    className="profile-badge-image shadow-xl border-white/20"
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
                            const icons = {
                                "Active Drives": <Briefcase className="text-orange-400" size={24} />,
                                "Total Applications": <FileText className="text-blue-400" size={24} />,
                                "Students Registered": <Users className="text-green-400" size={24} />,
                                "Teachers Registered": <Users className="text-purple-400" size={24} />,
                                "Departments": <Building className="text-indigo-400" size={24} />
                            };
                            return (
                                <SimpleStatsCard 
                                    key={index}
                                    icon={icons[stat.label] || <Users size={24} />}
                                    label={stat.label}
                                    value={stat.value}
                                    onClick={() => handleStatClick(stat.label)}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-12 flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Active Job Drives</h2>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setShowCreateForm(true);
                                }}
                                className="apply-btn flex items-center gap-2" 
                                style={{ 
                                    width: 'auto', 
                                    padding: '0.75rem 1.5rem',
                                    opacity: 1,
                                    transform: 'none'
                                }}
                            >
                                <Plus size={20} /> Schedule New Drive
                            </button>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="space-y-4">
                        {activeJobs.map((job) => (
                            <div key={job.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="company-logo shrink-0">
                                            {job.company[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{job.role}</h3>
                                            <p className="text-slate-400">{job.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => toggleJobDetails(job.id)}
                                            className="text-slate-400 hover:text-white flex items-center gap-1"
                                        >
                                            {expandedJob === job.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            Applicants
                                        </button>
                                        <button 
                                            onClick={() => handleExportPDF(job.id)}
                                            className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30"
                                            title="Export PDF"
                                        >
                                            <Download size={20} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteJob(job.id)}
                                            className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedJob === job.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-black/20"
                                        >
                                            <div className="p-6">
                                                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-4">Applicant List</h4>
                                                {jobApplicants[job.id]?.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="text-slate-500 text-sm">
                                                                    <th className="pb-3 pr-4">Name</th>
                                                                    <th className="pb-3 pr-4">CGPA</th>
                                                                    <th className="pb-3 pr-4">Status</th>
                                                                    <th className="pb-3">Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-slate-300">
                                                                {jobApplicants[job.id].map((app) => (
                                                                    <tr key={app.id} className="border-t border-white/5">
                                                                        <td className="py-3 pr-4">{app.job_details?.student_name || "Student"}</td>
                                                                        <td className="py-3 pr-4 font-mono">{app.job_details?.student_cgpa || "N/A"}</td>
                                                                        <td className="py-3 pr-4">
                                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                                                                                {app.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3">
                                                                            <button className="text-blue-400 hover:underline text-sm">View Profile</button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-4">No applications yet.</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* Posters List */}
                    <div className="mt-12 flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Drive Posters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posters.map((poster) => (
                            <div key={poster.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden group">
                                <div className="aspect-4/5 relative overflow-hidden">
                                    <img 
                                        src={poster.image} 
                                        alt={poster.title} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDeletePoster(poster.id)}
                                            className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all hover:scale-110"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-white font-semibold truncate">{poster.title}</h4>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Posted on {new Date(poster.posted_on).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {posters.length === 0 && (
                            <div 
                                onClick={() => setShowPosterModal(true)}
                                className="col-span-full py-16 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-blue-600/5 hover:border-blue-500/30 transition-all group"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-blue-600/10 text-blue-400 group-hover:scale-110 transition-transform">
                                        <Plus size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium text-lg">No posters uploaded yet.</p>
                                    <p className="text-slate-500 text-sm">Click here to upload your first drive poster</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Create Job Modal */}
                    <AnimatePresence>
                        {showCreateForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                >
                                    <div className="sticky top-0 bg-slate-900 p-6 border-b border-white/10 flex justify-between items-center z-10">
                                        <h2 className="text-xl font-bold text-white">
                                            Schedule New Job Drive
                                        </h2>
                                        <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateJob} className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm text-slate-400">Company Name</label>
                                                    <input required name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Job Role</label>
                                                    <input required name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Location</label>
                                                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Job Type</label>
                                                    <select name="job_type" value={formData.job_type} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                                                        <option value="Full Time">Full Time</option>
                                                        <option value="Internship">Internship</option>
                                                        <option value="Part Time">Part Time</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Salary Package</label>
                                                    <input required name="salary" value={formData.salary} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="e.g. 12 LPA" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Qualification</label>
                                                    <input required name="qualification" value={formData.qualification} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="e.g. B.Tech, Diploma" />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-sm text-slate-400">Min CGPA</label>
                                                        <input type="number" step="0.01" name="min_cgpa" value={formData.min_cgpa} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                    </div>
                                                    <div>
                                                        <label className="text-sm text-slate-400">Max Backlogs</label>
                                                        <input type="number" name="max_backlogs" value={formData.max_backlogs} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Allowed Departments</label>
                                                    <input required name="allowed_departments" value={formData.allowed_departments} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="CSE, ECE, ME" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Deadline</label>
                                                    <input required type="datetime-local" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-slate-400">Skills Required</label>
                                                    <input required name="skills_required" value={formData.skills_required} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="React, Node.js, SQL" />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm text-slate-400">Job Description</label>
                                                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white"></textarea>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm text-slate-400">Job Requirements</label>
                                                <textarea required name="requirements" value={formData.requirements} onChange={handleInputChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="List technology, experience, etc."></textarea>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm text-slate-400">Key Responsibilities</label>
                                                <textarea required name="responsibilities" value={formData.responsibilities} onChange={handleInputChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="Describe the daily tasks..."></textarea>
                                            </div>
                                        </div>
                                        
                                        <div className="pt-6">
                                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all">
                                                Create Job Drive
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Full Stats Modal */}
                    <StatsModal 
                        isOpen={showStatsModal}
                        onClose={() => setShowStatsModal(false)}
                        title={statsModalType}
                        data={statsModalData}
                        isLoading={isStatsLoading}
                        onDownload={handleDownloadStatsPDF}
                        onStudentAction={handleStudentAction}
                    />

                    <PosterModal 
                        isOpen={showPosterModal}
                        onClose={() => setShowPosterModal(false)}
                        formData={posterFormData}
                        setFormData={setPosterFormData}
                        onSubmit={handleCreatePoster}
                        isSubmitting={isSubmittingPoster}
                    />
                </div>
            </section>
        </div>
    );
};

const StatsModal = ({ isOpen, onClose, title, data, isLoading, onDownload, onStudentAction }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : data.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-sm border-b border-white/10">
                                            {title === "Students Registered" ? (
                                                <>
                                                    <th className="pb-4 pr-4">Name</th>
                                                    <th className="pb-4 pr-4">Department</th>
                                                    <th className="pb-4 pr-4">Email</th>
                                                    <th className="pb-4 pr-4">CGPA</th>
                                                    <th className="pb-4">Actions</th>
                                                </>
                                            ) : title === "Teachers Registered" ? (
                                                <>
                                                    <th className="pb-4 pr-4">Name</th>
                                                    <th className="pb-4 pr-4">Department</th>
                                                    <th className="pb-4 pr-4">Designation</th>
                                                    <th className="pb-4">Email</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th className="pb-4 pr-4">Student</th>
                                                    <th className="pb-4 pr-4">Company</th>
                                                    <th className="pb-4 pr-4">Role</th>
                                                    <th className="pb-4 pr-4">Status</th>
                                                    <th className="pb-4">Date</th>
                                                </>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="text-slate-300">
                                        {data.map((item) => (
                                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                {title === "Students Registered" ? (
                                                    <>
                                                        <td className="py-4 pr-4 font-medium text-white">
                                                            <div className="flex items-center gap-2">
                                                                {item.full_name}
                                                                {item.is_blacklisted && (
                                                                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">BL</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 pr-4">{item.department}</td>
                                                        <td className="py-4 pr-4 text-sm text-slate-400">{item.email}</td>
                                                        <td className="py-4 pr-4 font-mono text-blue-400">{typeof item.overall_cgpa === 'number' ? item.overall_cgpa.toFixed(2) : item.overall_cgpa}</td>
                                                        <td className="py-4">
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => onStudentAction(item.id, 'blacklist')}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                                                                        item.is_blacklisted 
                                                                        ? 'bg-slate-700 text-white' 
                                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                                    }`}
                                                                >
                                                                    {item.is_blacklisted ? 'Whitelist' : 'Blacklist'}
                                                                </button>
                                                                <button 
                                                                    onClick={() => onStudentAction(item.id, 'remove')}
                                                                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-600 text-white"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : title === "Teachers Registered" ? (
                                                    <>
                                                        <td className="py-4 pr-4 font-medium text-white">{item.full_name}</td>
                                                        <td className="py-4 pr-4">{item.department}</td>
                                                        <td className="py-4 pr-4 text-sm text-slate-400">{item.designation}</td>
                                                        <td className="py-4 text-sm text-slate-400">{item.email}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="py-4 pr-4 font-medium text-white">{item.student_name}</td>
                                                        <td className="py-4 pr-4">{item.company}</td>
                                                        <td className="py-4 pr-4">{item.role}</td>
                                                        <td className="py-4 pr-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs border ${
                                                                item.status === 'Applied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                item.status === 'Placed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                            }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 text-sm text-slate-500">{item.applied_on}</td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-slate-500">
                                No records found.
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-slate-900/50 flex justify-end">
                        <button 
                            onClick={onDownload}
                            disabled={data.length === 0}
                            className="apply-btn flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                                width: 'auto', 
                                padding: '0.75rem 1.5rem',
                                opacity: 1,
                                transform: 'none'
                            }}
                        >
                            <Download size={20} /> Download Full List (PDF)
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const SimpleStatsCard = ({ icon, label, value, onClick }) => (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`stats-card ${label !== "Active Drives" ? "cursor-pointer" : ""}`}
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

const PosterModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isSubmitting }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Upload Drive Poster</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={onSubmit} className="p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Poster Title</label>
                            <input 
                                required
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                placeholder="e.g. Google Recruitment 2026"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Select Image (PNG/JPG)</label>
                            <input 
                                required
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                        </div>
                        <button 
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Uploading..." : "Upload Poster"}
                        </button>
                    </form>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default PlacementOfficer;
