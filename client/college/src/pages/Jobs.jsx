import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  MapPin, 
  Search, 
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Clock,
  X,
  Plus,
  Building,
  IndianRupee,
  FileText
} from "lucide-react";
import axios from 'axios';
import { toast } from "react-toastify";
import "./Home.css";

const Jobs = () => {
  const { user } = useOutletContext();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/placement/jobs/");
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
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
      // Refresh jobs list
      const response = await axios.get("http://127.0.0.1:8000/api/placement/jobs/");
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to create job drive");
    }
  };

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      const phone = user?.phone || user?.user_id;
      const response = await axios.post("http://127.0.0.1:8000/api/student/apply/", {
        phone: phone,
        job_id: jobId
      });
      toast.success(response.data.message || "Application submitted!");
      // Optionally update local state to show "Applied"
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to apply");
    } finally {
      setApplyingId(null);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.skills_required.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="hero-title">Career <span className="highlight-text">Opportunities</span></h1>
                <p className="hero-subtitle">Explore and apply for the latest job openings.</p>
              </div>
              {user?.role === 'placement' && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      setShowCreateForm(true);
                    }}
                    className="apply-btn flex items-center gap-2" 
                    style={{ width: 'auto', opacity: 1, transform: 'none', padding: '0.75rem 1.5rem' }}
                  >
                    <Plus size={20} /> Schedule New Drive
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Search & Filter */}
          <div className="search-container mb-8">
            <div className="search-icon-wrapper">
              <Search className="search-icon" />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search by company, role, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Jobs List */}
            <div className="lg:col-span-2 space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <motion.div 
                    key={job.id}
                    layoutId={`job-${job.id}`}
                    onClick={() => setSelectedJob(job)}
                    className={`job-card cursor-pointer transition-all hover:border-blue-500/50 ${selectedJob?.id === job.id ? 'border-blue-500 bg-blue-500/5' : ''}`}
                  >
                    <div className="job-card-content p-6">
                      <div className="flex justify-between items-start w-full">
                        <div className="flex gap-4">
                          <div className="company-logo shrink-0">
                            {job.company[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{job.role}</h3>
                            <p className="text-slate-400 font-medium mb-2">{job.company}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                              <span className="flex items-center gap-1"><Briefcase size={14} /> {job.job_type}</span>
                              <span className="text-green-400 font-bold">₹ {job.salary}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-600" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-slate-400">No jobs matching your search.</p>
                </div>
              )}
            </div>

            {/* Job Details Sidebar / Selection */}
            <div className="lg:col-span-1">
              <AnimatePresence mode="wait">
                {selectedJob ? (
                  <motion.div
                    key={selectedJob.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="sticky top-24 p-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h2 className="text-2xl font-bold text-white">Job Details</h2>
                      <button onClick={() => setSelectedJob(null)} className="p-1 hover:bg-white/10 rounded-full">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                        <p className="text-slate-300 leading-relaxed">{selectedJob.description}</p>
                      </div>

                      {selectedJob.qualification && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Qualification</h4>
                          <p className="text-slate-300 leading-relaxed">{selectedJob.qualification}</p>
                        </div>
                      )}

                      {selectedJob.requirements && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Requirements</h4>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedJob.requirements}</p>
                        </div>
                      )}

                      {selectedJob.responsibilities && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Responsibilities</h4>
                          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedJob.responsibilities}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills Required</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.skills_required.split(',').map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500 mb-1">Min CGPA</p>
                          <p className="text-lg font-bold text-white">{selectedJob.min_cgpa}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                          <p className="text-xs text-slate-500 mb-1">Max Backlogs</p>
                          <p className="text-lg font-bold text-white">{selectedJob.max_backlogs}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Deadline</h4>
                        <p className="flex items-center gap-2 text-orange-400">
                          <Clock size={16} /> {new Date(selectedJob.deadline).toLocaleDateString()}
                        </p>
                      </div>

                      {user?.role === 'student' && (
                        <button 
                          onClick={() => handleApply(selectedJob.id)}
                          disabled={applyingId === selectedJob.id}
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          {applyingId === selectedJob.id ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Applying...
                            </>
                          ) : (
                            'Apply Now'
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="sticky top-24 p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <Briefcase className="mx-auto text-slate-600 mb-4" size={48} />
                    <p className="text-slate-500">Select a job to view detailed information and apply.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
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
                      <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="e.g. Kochi, Kerala" />
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
    </div>
  );
};

export default Jobs;
