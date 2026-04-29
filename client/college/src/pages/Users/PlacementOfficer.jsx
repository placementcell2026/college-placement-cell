import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Building, 
  Users, 
  User,
  Plus, 
  FileText, 
  Download, 
  Calendar, 
  MapPin, 
  IndianRupee,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  TrendingUp,
  PieChart,
  BarChart3,
  Upload,
  Zap,
  Globe
} from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
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
    
    // Analysis State
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisFile, setAnalysisFile] = useState(null);
    const [sheetLink, setSheetLink] = useState('');
    const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
    const [availableYears, setAvailableYears] = useState([]);
    const [isAggregatedView, setIsAggregatedView] = useState(false);

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
        fetchAvailableYears();
    }, []);

    const fetchAvailableYears = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:8000/api/placement/analysis/");
            setAvailableYears(res.data.available_years || []);
            
            if (res.data.available_years?.length > 0) {
                fetchAggregatedReport();
            } else {
                fetchYearlyReport(new Date().getFullYear().toString());
            }
        } catch (error) {
            console.error("Error fetching years:", error);
        }
    };

    const fetchYearlyReport = async (year) => {
        if (!year) return;
        setIsAnalyzing(true);
        setIsAggregatedView(false);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/placement/analysis/?year=${year}`);
            setAnalysisData(res.data);
            setReportYear(year.toString());
        } catch (error) {
            setAnalysisData(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const fetchAggregatedReport = async () => {
        setIsAnalyzing(true);
        setIsAggregatedView(true);
        try {
            const res = await axios.get(`http://127.0.0.1:8000/api/placement/analysis/?aggregated=true`);
            setAnalysisData(res.data);
        } catch (error) {
            toast.error("Failed to load aggregated analysis");
            setAnalysisData(null);
            setIsAggregatedView(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

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

    const handleDownloadStatsPDF = async (selectedDepartment) => {
        try {
            let endpoint;
            let params = {};
            if (statsModalType === "Students Registered") {
                endpoint = "students/export/";
                if (selectedDepartment && selectedDepartment !== "All") {
                    params.department = selectedDepartment;
                }
            } else if (statsModalType === "Teachers Registered") {
                endpoint = "teachers/export/";
            } else {
                endpoint = "applications/export/";
            }
            const res = await axios.get(`http://127.0.0.1:8000/api/placement/${endpoint}`, {
                params,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            let filename = `${statsModalType.toLowerCase().replace(' ', '_')}.pdf`;
            if (statsModalType === "Students Registered" && selectedDepartment && selectedDepartment !== "All") {
                filename = `students_registered_${selectedDepartment.toLowerCase().replace(/\s+/g, '_')}.pdf`;
            }
            link.setAttribute('download', filename);
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
    
    const handleAnalysisUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setAnalysisFile(file);
        
        setIsAnalyzing(true);
        const data = new FormData();
        data.append('file', file);
        data.append('report_year', reportYear);
        
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/placement/analysis/", data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.error) {
                toast.error(res.data.error, { autoClose: 5000 });
            } else {
                setAnalysisData(res.data);
                toast.success("Analysis saved successfully!");
                fetchAvailableYears();
            }
        } catch (error) {
            console.error("Upload detail:", error);
            const errorMsg = error.response?.data?.error || error.message || "Server connection failed. Please ensure the backend is running.";
            toast.error(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSheetAnalysis = async () => {
        if (!sheetLink) {
            toast.error("Please enter a Google Sheet link");
            return;
        }
        
        setIsAnalyzing(true);
        try {
            const res = await axios.post("http://127.0.0.1:8000/api/placement/analysis/", { 
                sheet_url: sheetLink,
                report_year: reportYear
            });
            if (res.data.error) {
                toast.error(res.data.error, { autoClose: 5000 });
            } else {
                setAnalysisData(res.data);
                toast.success("Sheet analyzed & saved!");
                fetchAvailableYears();
            }
        } catch (error) {
            console.error("Link detail:", error);
            const errorMsg = error.response?.data?.error || error.message || "Failed to fetch link. Check if the sheet is public.";
            toast.error(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="home-page flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
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
                                <p className="hero-college-name">KKMMPTC KALLETTUMKARA</p>
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
                                "Departments": <Building className="text-blue-400" size={24} />
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
                        <SimpleStatsCard 
                            icon={<TrendingUp className="text-pink-400" size={24} />}
                            label="Yearly Analysis"
                            value="Reports"
                            onClick={() => setShowAnalysis(true)}
                        />
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
                            <div key={job.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                                            className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/90/30"
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
                                            className="border-t border-white/5 bg-white/5/50"
                                        >
                                            <div className="p-6">
                                                <h4 className="text-sm font-semibold text-slate-400 uppercase mb-4">Applicant List</h4>
                                                {jobApplicants[job.id]?.length > 0 ? (
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-left">
                                                            <thead>
                                                                <tr className="text-slate-400 text-sm">
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
                                                                            <span className="px-2 py-0.5 rounded-full text-xs bg-brand-lime/10 text-brand-sea border border-brand-lime/20">
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
                                                    <p className="text-slate-400 text-center py-4">No applications yet.</p>
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
                            <div key={poster.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                <div className="aspect-4/5 relative overflow-hidden">
                                    <img 
                                        src={poster.image} 
                                        alt={poster.title} 
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button 
                                            onClick={() => handleDeletePoster(poster.id)}
                                            className="p-3 bg-red-600/90 text-white rounded-full hover:bg-red-700 transition-all hover:scale-110 shadow-lg"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-white font-semibold truncate">{poster.title}</h4>
                                    <p className="text-slate-400 text-xs mt-1">
                                        Posted on {new Date(poster.posted_on).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {posters.length === 0 && (
                            <div 
                                onClick={() => setShowPosterModal(true)}
                                className="col-span-full py-16 text-center bg-white/5 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-blue-600/90/5 hover:border-brand-purple/30 transition-all group"
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="p-4 rounded-full bg-blue-950/20 text-blue-400 group-hover:scale-110 transition-transform">
                                        <Plus size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium text-lg">No posters uploaded yet.</p>
                                    <p className="text-slate-400 text-sm">Click here to upload your first drive poster</p>
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
                                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-600/90/90 text-white font-bold py-4 rounded-xl transition-all">
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

                    {/* Analysis Modal */}
                    <AnimatePresence>
                        {showAnalysis && (
                            <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                                <motion.div 
                                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                                    className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-7xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
                                >
                                    <div className="p-6 md:p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900 backdrop-blur-xl sticky top-0 z-10">
                                        <div className="flex flex-col md:flex-row items-center gap-6">
                                            <div>
                                                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                                                    <BarChart3 className="text-blue-400" /> Placement Analysis
                                                </h2>
                                                <p className="text-slate-400 text-xs mt-1">AI-driven trends and insights visualization</p>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 bg-slate-800/40 p-1 rounded-xl border border-white/10">
                                                <button 
                                                    onClick={() => {
                                                        setIsAggregatedView(true);
                                                        fetchAggregatedReport();
                                                    }}
                                                    className={`text-xs font-bold py-2 px-4 rounded-lg transition-all ${isAggregatedView ? 'bg-blue-600 text-white shadow-lg shadow-brand-purple/20' : 'text-slate-400 hover:text-white'}`}
                                                >
                                                    All-Year Analysis
                                                </button>
                                                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                                <Calendar size={14} className="text-slate-400 ml-2" />
                                                <select 
                                                    value={isAggregatedView ? "" : reportYear}
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            setReportYear(e.target.value);
                                                            fetchYearlyReport(e.target.value);
                                                        }
                                                    }}
                                                    className="bg-transparent text-white text-xs font-bold py-2 px-2 focus:outline-none cursor-pointer"
                                                >
                                                    <option value="" disabled>Select Year</option>
                                                    {availableYears.map(y => (
                                                        <option key={y} value={y} className="bg-slate-900">{y} Report</option>
                                                    ))}
                                                    {!availableYears.includes(parseInt(new Date().getFullYear())) && (
                                                        <option value={new Date().getFullYear()} className="bg-slate-900">{new Date().getFullYear()} (New)</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowAnalysis(false)} className="p-2 hover:bg-slate-800/40 rounded-full text-slate-400 transition-colors">
                                            <X size={28} />
                                        </button>
                                    </div>

                                    <div className="p-8 overflow-y-auto">
                                        {!analysisData ? (
                                            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5 group hover:border-brand-purple/30 transition-all">
                                                <div className="w-20 h-20 rounded-full bg-blue-950/20 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                                    {isAnalyzing ? <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-purple"></div> : <Upload size={40} />}
                                                </div>
                                                <h3 className="text-xl font-bold text-white mb-2">{isAnalyzing ? 'Analyzing Data...' : 'Upload Placement Excel'}</h3>
                                                
                                                 <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-8 mt-2">
                                                     {['Year', 'Branch', 'Company', 'Gender', 'Salary Package'].map((col) => (
                                                         <span key={col} className="text-[10px] font-bold text-blue-400 bg-blue-950/20 px-2 py-1 rounded-full border border-indigo-500/30">
                                                             ✔ {col}
                                                         </span>
                                                     ))}
                                                 </div>

                                                 <div className="flex flex-col items-center gap-4 mb-10 bg-white/5 p-6 rounded-3xl border border-white/10 w-full max-w-sm shadow-xl relative overflow-hidden">
                                                     <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-brand-purple to-brand-teal"></div>
                                                     <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                         Step 1: Select Report Year
                                                     </label>
                                                     <div className="relative w-full">
                                                         <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                                                         <select 
                                                             value={reportYear}
                                                             onChange={(e) => setReportYear(e.target.value)}
                                                             className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white font-black text-lg focus:outline-none focus:border-brand-purple transition-all cursor-pointer appearance-none shadow-inner"
                                                         >
                                                             {[...Array(10)].map((_, i) => {
                                                                 const year = new Date().getFullYear() - i;
                                                                 return <option key={year} value={year} className="bg-slate-900 text-base">{year} Placement Batch</option>
                                                             })}
                                                         </select>
                                                         <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                     </div>
                                                 </div>

                                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Step 2: Upload Data Source</label>

                                                <div className="flex flex-col md:flex-row items-center gap-4">
                                                    <label className="bg-blue-600
/* replacement will happen via AllowMultiple where blue-600 matches brand-purple */
 hover:bg-blue-600/90
 text-slate-900 px-8 py-4 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600
/* replacement will happen via AllowMultiple where blue-600 matches brand-purple */
/20 transition-all active:scale-95">
                                                        <Plus size={20} /> Select Excel File
                                                        <input type="file" accept=".xlsx,.xls" hidden onChange={handleAnalysisUpload} disabled={isAnalyzing} />
                                                    </label>
                                                    <span className="text-slate-400 font-bold">OR</span>
                                                </div>

                                                <div className="mt-8 w-full max-w-md px-4">
                                                    <div className="relative group">
                                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
                                                        <input 
                                                            type="text" 
                                                            value={sheetLink}
                                                            onChange={(e) => setSheetLink(e.target.value)}
                                                            placeholder="Paste Google Sheet Link (Public View)" 
                                                            className="w-full bg-slate-900 border border-white/10 rounded-xl py-4 pl-12 pr-32 text-white text-sm focus:outline-none focus:border-brand-purple/50 transition-all"
                                                        />
                                                        <button 
                                                            onClick={handleSheetAnalysis}
                                                            disabled={isAnalyzing || !sheetLink}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            Analyze Link
                                                        </button>
                                                    </div>
                                                    <p className="text-[10px] text-center text-slate-400 mt-3">
                                                        Ensure sheet is shared as: <span className="text-blue-400">"Anyone with the link can view"</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                {/* Summary Stats */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="bg-slate-800/40 p-4 md:p-6 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group">
                                                        <img 
                                                            src="/images/career_success_png_1774068313959.png" 
                                                            className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
                                                            alt=""
                                                        />
                                                        <div className="relative z-10">
                                                            <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-wider mb-1">Total Placed</p>
                                                            <p className="text-3xl md:text-4xl font-black text-white">{analysisData.total_placed}</p>
                                                            {isAggregatedView && <p className="text-[10px] text-blue-400 font-bold mt-1">Across Institutional History</p>}
                                                        </div>
                                                    </div>
                                                    <div className="bg-emerald-950/20 p-4 md:p-6 rounded-3xl border border-brand-sea/20 shadow-xl relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                                                            <IndianRupee size={40} className="text-brand-lime" />
                                                        </div>
                                                        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-wider mb-1">Avg Package</p>
                                                        <p className="text-3xl md:text-4xl font-black text-brand-lime
">₹{analysisData.avg_package} <span className="text-sm font-bold opacity-70">LPA</span></p>
                                                        {isAggregatedView && <p className="text-[10px] text-brand-sea
/70 font-bold mt-1">Global Standard Average</p>}
                                                    </div>
                                                    <div className="bg-blue-950/20 p-4 md:p-6 rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform duration-500">
                                                            <Briefcase size={40} className="text-blue-400" />
                                                        </div>
                                                        <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-wider mb-1">Top Dept</p>
                                                        <p className="text-sm md:text-xl font-black text-blue-400 truncate">{analysisData.branch_data[0]?.branch}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">{analysisData.branch_data[0]?.count} Students Selected</p>
                                                    </div>
                                                    {!isAggregatedView ? (
                                                         <div className="grid grid-cols-2 gap-3">
                                                            <button 
                                                                onClick={() => setAnalysisData(null)}
                                                                className="bg-white/5 p-4 rounded-3xl border border-white/10 flex flex-col justify-center items-center cursor-pointer hover:bg-blue-600/90/20 transition-all active:scale-95 group"
                                                            >
                                                                <Upload size={18} className="text-white mb-1 group-hover:text-blue-400" />
                                                                <span className="text-[8px] font-black text-white group-hover:text-blue-400 tracking-tighter">REFRESH</span>
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setAnalysisData(null);
                                                                    setIsAggregatedView(false);
                                                                }}
                                                                className="bg-emerald-600/10 p-4 rounded-3xl border border-brand-sea/30 flex flex-col justify-center items-center cursor-pointer hover:bg-emerald-600/20 transition-all active:scale-95"
                                                            >
                                                                <Plus size={18} className="text-brand-lime
 mb-1" />
                                                                <span className="text-[8px] font-black text-brand-lime
 tracking-tighter uppercase whitespace-nowrap">Add More</span>
                                                            </button>
                                                         </div>
                                                     ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setAnalysisData(null);
                                                                setIsAggregatedView(false);
                                                            }}
                                                            className="bg-brand-teal/10 p-4 md:p-6 rounded-3xl border border-indigo-500/30 flex flex-col justify-center items-center cursor-pointer hover:bg-brand-teal/20 transition-all active:scale-95 group relative overflow-hidden"
                                                        >
                                                            <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            <Plus size={24} className="text-blue-400 mb-1 group-hover:scale-125 transition-transform relative z-10" />
                                                            <span className="text-[10px] font-black text-blue-400 tracking-wider relative z-10 uppercase">Ingest Batch Data</span>
                                                        </button>
                                                     )}
                                                </div>

                                                <div className="grid lg:grid-cols-3 gap-8">
                                                    {/* AI Insights Panel */}
                                                    <div className="lg:col-span-1 bg-linear-to-br from-indigo-900/60 to-slate-950 border border-indigo-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                                                        <img 
                                                            src="/images/ai_analysis_concept_png_1774068286653.png" 
                                                            className="absolute bottom-[-10%] right-[-10%] w-full h-full object-cover opacity-10 mix-blend-overlay group-hover:scale-110 group-hover:opacity-20 transition-all duration-1000" 
                                                            alt=""
                                                        />
                                                        <div className="absolute top-[-20px] right-[-20px] p-4 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                                                            <Zap size={140} className="text-blue-400" />
                                                        </div>
                                                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                                            <TrendingUp className="text-blue-400" size={20} /> AI Analysis Insights
                                                        </h4>
                                                        <ul className="space-y-4 relative z-10">
                                                            {analysisData.insights.map((insight, idx) => (
                                                                <motion.li 
                                                                    initial={{ x: -10, opacity: 0 }}
                                                                    animate={{ x: 0, opacity: 1 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                    key={idx} 
                                                                    className="text-sm text-slate-200 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner hover:bg-slate-800/40 transition-colors"
                                                                >
                                                                    {insight}
                                                                </motion.li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Main Graph Area */}
                                                    <div className="lg:col-span-2 space-y-8">
                                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-sm">
                                                            <h4 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                                                                <BarChart3 size={18} className="text-blue-400" /> Placements by Branch
                                                            </h4>
                                                            <div className="h-[300px] w-full">
                                                                <ResponsiveContainer width="100%" height="100%">
                                                                    <BarChart data={analysisData.branch_data}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                                        <XAxis dataKey="branch" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                                                        <Tooltip 
                                                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                                            itemStyle={{ color: '#fff' }}
                                                                        />
                                                                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                                                            {analysisData.branch_data.map((entry, index) => (
                                                                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'][index % 5]} />
                                                                            ))}
                                                                        </Bar>
                                                                    </BarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>

                                                        <div className="grid md:grid-cols-2 gap-8">
                                                            {/* Gender Pie Chart */}
                                                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-sm">
                                                                <h4 className="text-md font-bold text-white mb-6">Gender Diversity</h4>
                                                                <div className="h-[200px] w-full">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <RePieChart>
                                                                            <Pie
                                                                                data={analysisData.gender_data}
                                                                                cx="50%"
                                                                                cy="50%"
                                                                                innerRadius={60}
                                                                                outerRadius={80}
                                                                                paddingAngle={5}
                                                                                dataKey="count"
                                                                                nameKey="gender"
                                                                            >
                                                                                {analysisData.gender_data.map((entry, index) => (
                                                                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                                                                                ))}
                                                                            </Pie>
                                                                            <Tooltip 
                                                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                                            />
                                                                            <Legend />
                                                                        </RePieChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>

                                                            {/* Year Trend */}
                                                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-sm">
                                                                <h4 className="text-md font-bold text-white mb-6">Hiring Trend (Yearly)</h4>
                                                                <div className="h-[200px] w-full">
                                                                    <ResponsiveContainer width="100%" height="100%">
                                                                        <LineChart data={analysisData.year_data}>
                                                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                                                            <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} />
                                                                            <YAxis stroke="#94a3b8" fontSize={10} />
                                                                            <Tooltip 
                                                                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                                                            />
                                                                            <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                                                                        </LineChart>
                                                                    </ResponsiveContainer>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-black/90 border border-white/10 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                                                              <img 
                                                                src="/images/corporate_recruitment_png_1774068337425.png" 
                                                                className="absolute left-0 top-0 w-full h-full object-cover opacity-5 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none" 
                                                                alt=""
                                                              />
                                                              <h4 className="text-md font-black text-white mb-8 flex items-center gap-3 relative z-10">
                                                                  <Building size={20} className="text-blue-400" /> Top Recruiting Companies
                                                              </h4>
                                                              <div className="space-y-6 relative z-10">
                                                                  {analysisData.company_data.map((item, idx) => (
                                                                      <div key={idx} className="flex items-center gap-6">
                                                                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400 text-lg shadow-inner group-hover:bg-blue-600/90/10 transition-colors">
                                                                              {item.company[0]}
                                                                          </div>
                                                                          <div className="flex-1">
                                                                              <div className="flex justify-between items-center mb-2">
                                                                                  <span className="text-sm font-bold text-white tracking-wide">{item.company}</span>
                                                                                  <span className="text-xs text-blue-400 font-black">{item.count} Placements</span>
                                                                              </div>
                                                                              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                                                                                  <motion.div 
                                                                                     initial={{ width: 0 }}
                                                                                     animate={{ width: `${(item.count / analysisData.total_placed) * 100}%` }}
                                                                                     className="h-full bg-linear-to-r from-brand-purple to-brand-teal rounded-full"
                                                                                  ></motion.div>
                                                                              </div>
                                                                          </div>
                                                                      </div>
                                                                  ))}
                                                              </div>
                                                         </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

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

const StatsModal = ({ isOpen, onClose, title, data, isLoading, onDownload, onStudentAction }) => {
    const [selectedDepartment, setSelectedDepartment] = React.useState("All");

    React.useEffect(() => {
        if (!isOpen) {
            setSelectedDepartment("All");
        }
    }, [isOpen]);

    const filteredData = title === "Students Registered" && selectedDepartment !== "All"
        ? data.filter(item => item.department === selectedDepartment)
        : data;

    const uniqueDepartments = title === "Students Registered" 
        ? ["All", ...new Set(data.map(item => item.department).filter(Boolean))]
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
                    >
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white mb-0 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-brand-lime shadow-[0_0_10px_#A3F470]"></span>
                                {title}
                            </h2>
                            {title === "Students Registered" && data.length > 0 && !isLoading && (
                                <select 
                                    value={selectedDepartment} 
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-white ml-4 text-sm focus:outline-none focus:border-brand-purple transition-colors"
                                >
                                    {uniqueDepartments.map(dep => (
                                        <option key={dep} value={dep} className="bg-slate-900 text-white">
                                            {dep === "All" ? "All Departments" : dep}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <button onClick={onClose} className="text-slate-400 hover:text-white ml-auto">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
                                </div>
                            ) : filteredData.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-400 text-sm border-b border-white/10">
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
                                            {filteredData.map((item) => (
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
                                                            <td className="py-4 pr-4 font-mono text-brand-teal">{typeof item.overall_cgpa === 'number' ? item.overall_cgpa.toFixed(2) : item.overall_cgpa}</td>
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
                                                                    item.status === 'Applied' ? 'bg-blue-950/20 text-brand-cornflower border-brand-purple/20' :
                                                                    item.status === 'Placed' ? 'bg-emerald-950/20 text-brand-lime border-brand-sea/20' :
                                                                    'bg-slate-800/40 text-slate-400 border-slate-500/20'
                                                                }`}>
                                                                    {item.status}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-sm text-slate-400">{item.applied_on}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-slate-400">
                                    No records found.
                                </div>
                            )}
                        </div>

                        {title !== "Teachers Registered" && (
                            <div className="p-6 border-t border-white/10 bg-slate-900 flex justify-end">
                                <button 
                                    onClick={() => onDownload(selectedDepartment)}
                                    disabled={filteredData.length === 0}
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
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

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
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-brand-purple transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Select Image (PNG/JPG)</label>
                            <input 
                                required
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                                className="w-full text-slate-400 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-600/90"
                            />
                        </div>
                        <button 
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 bg-blue-600 hover:bg-blue-600/90/90 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-brand-purple/20"
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
