import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Calendar, 
  ExternalLink, 
  CheckCircle,
  X,
  Search,
  Check
} from "lucide-react";
import axios from 'axios';
import { toast } from "react-toastify";
import "./Home.css";

const TeacherInterviews = () => {
    const { user } = useOutletContext();
    const [interviews, setInterviews] = useState([]);
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const phone = user?.phone || user?.user_id;
                const response = await axios.get(`http://127.0.0.1:8000/api/teacher/interviews/?phone=${phone}`);
                setInterviews(response.data);
            } catch (error) {
                console.error("Error fetching interviews:", error);
                toast.error("Failed to load interviews");
            } finally {
                setIsLoading(false);
            }
        };

        const fetchStudents = async () => {
            try {
                const phone = user?.phone || user?.user_id;
                const response = await axios.get(`http://127.0.0.1:8000/api/teacher/students/?phone=${phone}`);
                setStudents(response.data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        if (user) {
            fetchInterviews();
            fetchStudents();
        }
    }, [user]);

    const handleSelectInterview = (interview) => {
        setSelectedInterview(interview);
        setSelectedStudentIds(interview.selected_students || []);
    };

    const toggleStudentSelection = (studentId) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId) 
                : [...prev, studentId]
        );
    };

    const handleSendInvitations = async () => {
        if (selectedStudentIds.length === 0) {
            toast.warning("Please select at least one student.");
            return;
        }

        setIsSaving(true);
        try {
            await axios.post("http://127.0.0.1:8000/api/teacher/interviews/select-students/", {
                interview_id: selectedInterview.id,
                student_ids: selectedStudentIds
            });
            toast.success(`Successfully invited ${selectedStudentIds.length} students!`);
            
            // Update local state
            setInterviews(prev => prev.map(inv => 
                inv.id === selectedInterview.id 
                    ? { ...inv, selected_students: selectedStudentIds } 
                    : inv
            ));
            setSelectedInterview(null);
        } catch (error) {
            toast.error("Failed to send invitations");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <h1 className="hero-title">Manage <span className="highlight-text">Interviews</span></h1>
                        <p className="hero-subtitle">Select and notify students for upcoming company interviews.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Interviews List */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-400" />
                                Upcoming Interviews
                            </h2>
                            {interviews.length > 0 ? (
                                interviews.map((interview) => (
                                    <div 
                                        key={interview.id}
                                        onClick={() => handleSelectInterview(interview)}
                                        className={`bg-slate-900/50 border rounded-2xl p-6 cursor-pointer transition-all hover:border-blue-500/50 ${selectedInterview?.id === interview.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-white/10'}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl">
                                                    {interview.company[0]}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{interview.company}</h3>
                                                    <p className="text-slate-400 text-sm">{interview.role || 'General Interview'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase tracking-wider">Date & Time</p>
                                                <p className="text-white font-medium text-sm">
                                                    {new Date(interview.date_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Users size={14} />
                                                <span>{interview.selected_students?.length || 0} Students Invited</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-blue-400">
                                                <ExternalLink size={14} />
                                                <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline">
                                                    Meeting Link
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <Building2 className="mx-auto text-slate-700 mb-4" size={48} />
                                    <p className="text-slate-500">No interviews scheduled for your department.</p>
                                </div>
                            )}
                        </div>

                        {/* Student Selection Side */}
                        <div className="lg:sticky lg:top-24 h-fit">
                            <AnimatePresence mode="wait">
                                {selectedInterview ? (
                                    <motion.div
                                        key={selectedInterview.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-slate-900 border border-blue-500/30 rounded-2xl overflow-hidden"
                                    >
                                        <div className="p-6 bg-blue-500/5 border-b border-white/10 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Select Students</h3>
                                                <p className="text-xs text-slate-400">For {selectedInterview.company} - {selectedInterview.department}</p>
                                            </div>
                                            <button onClick={() => setSelectedInterview(null)} className="text-slate-500 hover:text-white">
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="p-4 bg-slate-800/50">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                                <input 
                                                    type="text" 
                                                    placeholder="Find student by name or roll no..." 
                                                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                                            {filteredStudents.length > 0 ? (
                                                filteredStudents.map(student => (
                                                    <div 
                                                        key={student.id}
                                                        onClick={() => toggleStudentSelection(student.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedStudentIds.includes(student.id) ? 'bg-blue-600/20 border border-blue-600/30' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 overflow-hidden">
                                                                {student.image ? <img src={`http://127.0.0.1:8000${student.image}`} alt="" className="w-full h-full object-cover" /> : student.full_name[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{student.full_name}</p>
                                                                <p className="text-[10px] text-slate-500">{student.roll_no} • Sem {student.semester}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedStudentIds.includes(student.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-700'}`}>
                                                            {selectedStudentIds.includes(student.id) && <Check size={12} />}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center py-8 text-sm text-slate-500">No students found.</p>
                                            )}
                                        </div>

                                        <div className="p-6 border-t border-white/10">
                                            <button 
                                                onClick={handleSendInvitations}
                                                disabled={isSaving}
                                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                {isSaving ? "Sending Invitation..." : `Send Invitation to ${selectedStudentIds.length} Students`}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center py-20 bg-white/5 border border-dashed border-white/10 rounded-2xl text-center px-8">
                                        <Users className="text-slate-700 mb-4" size={48} />
                                        <h3 className="text-white font-bold mb-2">Select an Interview</h3>
                                        <p className="text-slate-500 text-sm">Choose an interview from the list to start selecting eligible students from your department.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default TeacherInterviews;
