import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Download, ArrowLeft, Mail, Phone, GraduationCap, Calendar, User } from "lucide-react";
import { useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from "react-toastify";
import { 
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import "../Home.css";

const StudentList = () => {
    const { user } = useOutletContext();
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAnalytics, setShowAnalytics] = useState(true);

    const genderData = React.useMemo(() => {
        const counts = students.reduce((acc, s) => {
            const g = (s.gender || 'unknown').toLowerCase();
            acc[g] = (acc[g] || 0) + 1;
            return acc;
        }, {});
        return [
            { name: 'Male', value: counts.male || 0, color: '#3b82f6' },
            { name: 'Female', value: counts.female || 0, color: '#ec4899' }
        ].filter(d => d.value > 0);
    }, [students]);

    const academicData = React.useMemo(() => {
        return [...students]
            .sort((a, b) => (parseFloat(b.cgpa) || 0) - (parseFloat(a.cgpa) || 0))
            .slice(0, 15)
            .map(s => ({
                name: s.full_name.split(' ')[0],
                cgpa: parseFloat(s.cgpa) || 0,
                backlogs: s.backlogs || 0
            }));
    }, [students]);

    const fetchStudents = async () => {
        try {
            const phone = user?.phone || user?.user_id;
            const response = await axios.get(`http://127.0.0.1:8000/api/teacher/students/?phone=${phone}`);
            setStudents(response.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("Failed to load students list");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchStudents();
    }, [user]);

    const filteredStudents = students.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            fetchStudents(); // Refresh the list
        } catch (error) {
            console.error(`Error performing ${action} on student:`, error);
            toast.error(error.response?.data?.error || `Failed to ${action} student`);
        }
    };

    const downloadCSV = () => {
        if (students.length === 0) {
            toast.info("No data to download");
            return;
        }

        const headers = ["Register No", "Full Name", "Email", "Phone", "Department", "Course", "Semester", "Gender", "DOB", "CGPA", "Backlogs"];
        const csvContent = [
            headers.join(","),
            ...students.map(s => [
                s.roll_no,
                s.full_name.replace(/,/g, ""),
                s.email,
                s.phone,
                s.department,
                s.course,
                s.semester,
                s.gender,
                s.dob,
                s.cgpa,
                s.backlogs
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Students_${user?.department || 'List'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft size={24} className="text-white" />
                        </button>
                        <div>
                            <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                                Students of <span className="highlight-text">{user?.department || 'Department'}</span>
                            </h1>
                            <p className="hero-subtitle">Total {students.length} students registered.</p>
                        </div>
                    </motion.div>

                    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or reg no..."
                                className="input-field w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setShowAnalytics(!showAnalytics)}
                                className="apply-btn flex items-center gap-2 whitespace-nowrap"
                                style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#6366f1' }}
                            >
                                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                            </button>
                            <button 
                                onClick={downloadCSV}
                                className="apply-btn flex items-center gap-2 whitespace-nowrap"
                                style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#3b82f6' }}
                            >
                                <Download size={18} /> Download List
                            </button>
                        </div>
                    </div>

                    <AnimatePresence>
                        {showAnalytics && students.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
                            >
                                {/* Gender Pie Chart */}
                                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 min-h-[350px] flex flex-col">
                                    <h3 className="text-lg font-semibold text-white mb-4">Gender Distribution</h3>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={genderData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {genderData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend verticalAlign="bottom" height={36}/>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* CGPA and Backlogs Bar Chart */}
                                <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-6 min-h-[350px] flex flex-col">
                                    <h3 className="text-lg font-semibold text-white mb-4">Academic Performance (CGPA & Backlogs)</h3>
                                    <div className="flex-1">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={academicData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis 
                                                    dataKey="name" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                />
                                                <YAxis 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                                />
                                                <Tooltip 
                                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend verticalAlign="top" align="right" />
                                                <Bar dataKey="cgpa" fill="#6366f1" radius={[4, 4, 0, 0]} name="CGPA" barSize={20} />
                                                <Bar dataKey="backlogs" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Backlogs" barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">*Showing first 15 students</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
                        {filteredStudents.map((student, index) => (
                            <StudentCard 
                                key={index} 
                                student={student} 
                                onAction={(action) => handleStudentAction(student.id, action)} 
                            />
                        ))}
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-slate-600 mb-4 opacity-20" />
                            <p className="text-slate-400">No students found matching your search.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

const StudentCard = ({ student, onAction }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className={`stats-card ${student.is_blacklisted ? 'border-red-500/50' : ''}`}
        style={{ textAlign: 'left', padding: '1.5rem', height: 'auto', position: 'relative' }}
    >
        {student.is_blacklisted && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg z-10">
                Blacklisted
            </div>
        )}
        <div className="flex gap-4 mb-4">
            <div className="profile-img-wrapper" style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', background: '#334155' }}>
                {student.image ? (
                    <img src={`http://127.0.0.1:8000${student.image}`} alt={student.full_name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <User size={30} className="text-slate-500" />
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-lg font-semibold text-white">{student.full_name}</h3>
                <p className="text-blue-400 text-sm font-medium">{student.roll_no}</p>
            </div>
        </div>

        <div className="space-y-3">
            <InfoItem icon={<Mail size={14} />} text={student.email} />
            <div className="flex gap-4">
                 <InfoItem icon={<Phone size={14} />} text={student.phone} />
                 <InfoItem icon={<GraduationCap size={14} />} text={`${student.semester} Sem`} />
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 mt-2">
                <div className="text-center flex-1 border-r border-white/10">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">CGPA</p>
                    <p className="text-sm font-bold text-blue-400">{student.cgpa || '0.00'}</p>
                </div>
                <div className="text-center flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Backlogs</p>
                    <p className="text-sm font-bold text-orange-400">{student.backlogs || '0'}</p>
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button 
                    onClick={() => onAction('blacklist')}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                        student.is_blacklisted 
                        ? 'bg-slate-700 text-white hover:bg-slate-600' 
                        : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
                    }`}
                >
                    {student.is_blacklisted ? 'Whitelist' : 'Blacklist'}
                </button>
                <button 
                    onClick={() => onAction('remove')}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                    Remove
                </button>
            </div>
        </div>
    </motion.div>
);

const InfoItem = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
        <span className="text-slate-500">{icon}</span>
        <span className="truncate">{text}</span>
    </div>
);

export default StudentList;
