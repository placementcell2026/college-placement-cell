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
        requirements: ''
    });

    const fetchData = async () => {
        try {
            const [statsRes, jobsRes] = await Promise.all([
                axios.get("http://127.0.0.1:8000/api/placement/dashboard/"),
                axios.get("http://127.0.0.1:8000/api/placement/jobs/")
            ]);
            setStats(statsRes.data.stats || []);
            setActiveJobs(jobsRes.data || []);
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
                qualification: '', responsibilities: '', requirements: ''
            });
            fetchData();
        } catch (error) {
            toast.error("Failed to create job drive");
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
                        className="hero-header"
                    >
                        <h1 className="hero-title">
                            Placement <span className="highlight-text">Officer</span> Portal
                        </h1>
                        <p className="hero-subtitle">Manage company drives and student applications.</p>
                    </motion.div>

                    <div className="stats-grid">
                        {stats.map((stat, index) => {
                            const icons = [
                                <Building className="text-blue-400" size={24} />,
                                <Briefcase className="text-orange-400" size={24} />,
                                <Users className="text-green-400" size={24} />,
                                <MapPin className="text-purple-400" size={24} />
                            ];
                            return (
                                <SimpleStatsCard 
                                    key={index}
                                    icon={icons[index % icons.length]}
                                    label={stat.label}
                                    value={stat.value}
                                    onClick={() => handleStatClick(stat.label)}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-12 flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Active Job Drives</h2>
                        <button 
                            onClick={() => setShowCreateForm(true)}
                            className="apply-btn flex items-center gap-2" 
                            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
                        >
                            <Plus size={20} /> Schedule New Drive
                        </button>
                    </div>

                    {/* Jobs List */}
                    <div className="space-y-4">
                        {activeJobs.map((job) => (
                            <div key={job.id} className="bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden">
                                <div className="p-6 flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="company-logo flex-shrink-0">
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
                                        <h2 className="text-xl font-bold text-white">Schedule New Job Drive</h2>
                                        <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-white">
                                            <X size={24} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleCreateJob} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                        <div className="md:col-span-2 pt-4">
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
                    />
                </div>
            </section>
        </div>
    );
};

const StatsModal = ({ isOpen, onClose, title, data, isLoading, onDownload }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
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
                                                    <th className="pb-4">CGPA</th>
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
                                                        <td className="py-4 pr-4 font-medium text-white">{item.full_name}</td>
                                                        <td className="py-4 pr-4">{item.department}</td>
                                                        <td className="py-4 pr-4 text-sm text-slate-400">{item.email}</td>
                                                        <td className="py-4 font-mono text-blue-400">{item.overall_cgpa.toFixed(2)}</td>
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
                            style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
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

export default PlacementOfficer;
