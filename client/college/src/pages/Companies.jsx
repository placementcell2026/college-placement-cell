import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Search, 
  Plus, 
  Building,
  ChevronRight,
  Globe,
  Mail,
  Phone,
  X
} from "lucide-react";
import axios from 'axios';
import { toast } from "react-toastify";
import "./Home.css";

const Companies = () => {
  const { user } = useOutletContext();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
    requirements: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/placement/jobs/");
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        toast.error("Failed to load companies");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Extract unique companies from jobs
  const companies = Array.from(new Set(jobs.map(job => job.company))).map(name => {
    const job = jobs.find(j => j.company === name);
    return {
      name: name,
      location: job.location,
      role: job.role, // Latest role
      drivesCount: jobs.filter(j => j.company === name).length
    };
  });

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateInterview = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/placement/jobs/", formData);
      toast.success("Company Interview scheduled successfully!");
      setShowCreateForm(false);
      setFormData({
        company: '', role: '', location: '', job_type: 'Full Time',
        salary: '', description: '', skills_required: '',
        min_cgpa: 0, max_backlogs: 0, allowed_departments: '', deadline: '',
        qualification: '', responsibilities: '', requirements: ''
      });
      // Refresh
      const response = await axios.get("http://127.0.0.1:8000/api/placement/jobs/");
      setJobs(response.data);
    } catch (error) {
      toast.error("Failed to schedule interview");
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
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="hero-title">Partner <span className="highlight-text">Companies</span></h1>
                <p className="hero-subtitle">View and manage our recruitment partners.</p>
              </div>
              {user?.role === 'placement' && (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="apply-btn flex items-center gap-2" 
                  style={{ width: 'auto', opacity: 1, transform: 'none', padding: '0.75rem 1.5rem', background: '#4f46e5' }}
                >
                  <Plus size={20} /> Add Company Interview
                </button>
              )}
            </div>
          </motion.div>

          <div className="search-container mb-8">
            <div className="search-icon-wrapper">
              <Search className="search-icon" />
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Search companies by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 transition-all hover:bg-slate-900/80 hover:border-blue-500/30"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl">
                      {company.name[0]}
                    </div>
                    <div className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase border border-green-500/20">
                      Active Partner
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-1">{company.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <MapPin size={14} /> {company.location}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Active Drives</span>
                      <span className="text-white font-medium">{company.drivesCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Primary Role</span>
                      <span className="text-white font-medium">{company.role}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                      View Profile
                    </button>
                    <button className="p-2 bg-blue-600/10 border border-blue-600/20 rounded-lg text-blue-400 hover:bg-blue-600/20 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Building2 className="mx-auto text-slate-700 mb-4" size={48} />
                <p className="text-slate-500">No companies found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Create Interview Modal */}
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
                <h2 className="text-xl font-bold text-white">Add Company Interview</h2>
                <button onClick={() => setShowCreateForm(false)} className="text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleCreateInterview} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Company Name</label>
                    <input required name="company" value={formData.company} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Primary Role</label>
                    <input required name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Location</label>
                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Interview Type</label>
                    <select name="job_type" value={formData.job_type} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white">
                      <option value="Full Time">Full Time</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400">Package Range</label>
                    <input required name="salary" value={formData.salary} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="e.g. 10-15 LPA" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Interview Date & Time</label>
                    <input required type="datetime-local" name="deadline" value={formData.deadline} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Allowed Departments</label>
                    <input required name="allowed_departments" value={formData.allowed_departments} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="CSE, ECE, ME" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Skills Required</label>
                    <input required name="skills_required" value={formData.skills_required} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="React, Node.js" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-400">Interview Details</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" placeholder="Round details, focus areas..."></textarea>
                </div>
                <div className="md:col-span-2 pt-4">
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all">
                    Schedule Company Interview
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

export default Companies;
