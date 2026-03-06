import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone,
  Building2,
  Download
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import "../Home.css";

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDept, setExpandedDept] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/placement/departments/");
      setDepartments(res.data);
    } catch (error) {
      toast.error("Failed to load department data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportPDF = async () => {
    try {
        const res = await axios.get("http://127.0.0.1:8000/api/placement/teachers/export/", {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'registered_teachers.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        toast.error("Failed to download PDF");
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
            className="hero-header mb-12"
          >
            <h1 className="hero-title">
              Manage <span className="highlight-text">Departments</span>
            </h1>
            <p className="hero-subtitle">Detailed overview of college departments, teachers, and placement stats.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button 
                onClick={handleExportPDF}
                className="apply-btn flex items-center gap-2" 
                style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
            >
                <Download size={20} /> Export Teacher List
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredDepartments.map((dept, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm"
              >
                <div 
                  className="p-8 cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedDept(expandedDept === dept.name ? null : dept.name)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                        <Building2 size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{dept.name}</h2>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span className="flex items-center gap-1.5 text-sm">
                            <Users size={16} className="text-blue-400" />
                            {dept.teachers_count} Teachers
                          </span>
                          <span className="flex items-center gap-1.5 text-sm">
                            <GraduationCap size={16} className="text-purple-400" />
                            {dept.students_count} Students
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                       <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{dept.placed_count}</div>
                          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Placed</div>
                       </div>
                       <div className="w-px h-10 bg-white/10 hidden md:block"></div>
                       {expandedDept === dept.name ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedDept === dept.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 bg-black/20"
                    >
                      <div className="p-8">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                          <Users size={16} /> Department Faculty
                        </h3>
                        
                        {dept.teachers.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dept.teachers.map((teacher) => (
                              <div key={teacher.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                                <h4 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{teacher.full_name}</h4>
                                <p className="text-blue-400/80 text-sm font-medium mb-4">{teacher.designation}</p>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                                    <Mail size={14} className="text-slate-500" />
                                    <span className="text-xs truncate">{teacher.email}</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                                    <Phone size={14} className="text-slate-500" />
                                    <span className="text-xs">{teacher.phone}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                            <Users size={40} className="mx-auto text-slate-600 mb-4" />
                            <p className="text-slate-500">No teachers registered in this department yet.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredDepartments.length === 0 && (
              <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                <Search size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-400">No departments found</h3>
                <p className="text-slate-500">Try adjusting your search query.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ManageDepartments;
