
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { dbService } from '../services/db';
import type { AttendanceRecord, Student } from '../services/db';
import { Search, BarChart3, User, Calendar, TrendingUp } from 'lucide-react';
import { APP_CONFIG } from '../conf/config';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Analytics = () => {
    const [studentId, setStudentId] = useState('');
    const [searched, setSearched] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [stats, setStats] = useState<any>(null);

    const handleSearch = async () => {
        if (!studentId.trim()) return;
        setSearched(true);

        // Fetch Student Info (Assuming ID search or exact name match)
        // For simplicity, search by Name first as ID is UUID usually hard to type
        // If ID is provided, use ID

        const allStudents = await dbService.getAllStudents();
        const student = allStudents.find((s: Student) =>
            s.student_id === studentId ||
            s.name.toLowerCase() === studentId.toLowerCase() ||
            (s.rollNumber && s.rollNumber === studentId)
        );

        if (!student) {
            setStats(null);
            return;
        }

        setStudentName(student.name);

        // Fetch Attendance
        const allRecords = await dbService.getAttendanceRecords();
        const studentRecords = allRecords.filter((r: AttendanceRecord) => r.student_id === student.student_id && r.status === 'present');

        // Calculate Stats
        const totalClasses = 100; // Mock total classes for % calculation or derive from unique dates * subjects
        // Better metric: Total unique slots (Date+Subject) recorded in DB across all students? 
        // Or just simple count of present.

        // Let's count by Subject
        const subjectCounts: Record<string, number> = {};
        APP_CONFIG.SUBJECTS.forEach(s => subjectCounts[s] = 0);

        studentRecords.forEach((r: AttendanceRecord) => {
            if (subjectCounts[r.subject] !== undefined) {
                subjectCounts[r.subject]++;
            }
        });

        const totalRes = studentRecords.length;
        const attendancePercentage = (totalRes / totalClasses) * 100; // Mock base

        setStats({
            totalClasses: totalClasses,
            attended: totalRes,
            percentage: attendancePercentage.toFixed(1),
            subjectData: subjectCounts
        });
    };

    const pieData = stats ? {
        labels: ['Present', 'Absent'],
        datasets: [
            {
                data: [stats.attended, stats.totalClasses - stats.attended],
                backgroundColor: ['#1faa59', '#e0e0e0'],
                borderColor: ['#1faa59', '#e0e0e0'],
                borderWidth: 1,
            },
        ],
    } : null;

    const barData = stats ? {
        labels: Object.keys(stats.subjectData),
        datasets: [
            {
                label: 'Classes Attended',
                data: Object.values(stats.subjectData),
                backgroundColor: '#40c4ff',
            },
        ],
    } : null;

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center justify-center gap-3 mb-2">
                    <BarChart3 className="text-blue-600" size={36} />
                    <h1 className="text-3xl font-bold text-gradient">Student Analytics</h1>
                </div>
                <p className="text-gray-600">Comprehensive attendance insights and performance tracking</p>
            </motion.div>

            {/* Search Section */}
            <motion.div 
                className="card max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <User className="text-indigo-600" size={24} />
                        <h2 className="text-xl font-bold text-gray-800">Find Student</h2>
                    </div>
                    <p className="text-gray-600">Enter student name, ID, or roll number to view analytics</p>
                </div>
                
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Enter Student Name, ID or Roll Number"
                            className="input-field pl-12 py-4"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                        />
                    </div>
                    <motion.button 
                        onClick={handleSearch}
                        className="btn-primary px-6 py-4"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Search size={20} />
                    </motion.button>
                </div>
            </motion.div>

            {/* No Results */}
            {searched && !stats && (
                <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
                        <User className="text-red-600" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Student Not Found</h3>
                    <p className="text-gray-600">Please check the student details and try again</p>
                </motion.div>
            )}

            {/* Analytics Dashboard */}
            {stats && (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Profile Overview Card */}
                    <motion.div 
                        className="card col-span-1 md:col-span-2 bg-gradient-to-br from-white to-blue-50 border-l-4 border-blue-500"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                                <User className="text-white" size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">{studentName}</h2>
                                <p className="text-gray-600">Attendance Performance Report</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <motion.div 
                                className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100"
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <TrendingUp className="text-green-600" size={24} />
                                    <span className="text-sm font-medium text-green-800">Attendance Rate</span>
                                </div>
                                <p className="text-4xl font-bold text-green-600">{stats.percentage}%</p>
                                <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                                    <motion.div 
                                        className="bg-green-500 h-2 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.percentage}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                    />
                                </div>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100"
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="text-blue-600" size={24} />
                                    <span className="text-sm font-medium text-blue-800">Classes Attended</span>
                                </div>
                                <p className="text-4xl font-bold text-blue-600">{stats.attended}</p>
                                <p className="text-sm text-blue-700 mt-2">out of {stats.totalClasses} total</p>
                            </motion.div>
                            
                            <motion.div 
                                className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-100"
                                whileHover={{ scale: 1.03 }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <BarChart3 className="text-purple-600" size={24} />
                                    <span className="text-sm font-medium text-purple-800">Performance</span>
                                </div>
                                <p className="text-4xl font-bold text-purple-600">
                                    {stats.percentage >= 90 ? 'A' : 
                                     stats.percentage >= 80 ? 'B' : 
                                     stats.percentage >= 70 ? 'C' : 'D'}
                                </p>
                                <p className="text-sm text-purple-700 mt-2">
                                    {stats.percentage >= 90 ? 'Excellent' : 
                                     stats.percentage >= 80 ? 'Good' : 
                                     stats.percentage >= 70 ? 'Average' : 'Needs Improvement'}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Pie Chart */}
                    <motion.div 
                        className="card flex flex-col h-96"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800">Attendance Distribution</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Pie data={pieData!} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div 
                        className="card flex flex-col h-96"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-800">Subject-wise Attendance</h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <Bar
                                data={barData!}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: { 
                                            beginAtZero: true, 
                                            ticks: { stepSize: 1 },
                                            grid: { color: 'rgba(0,0,0,0.05)' }
                                        },
                                        x: {
                                            grid: { display: false }
                                        }
                                    },
                                    plugins: {
                                        legend: { display: false }
                                    }
                                }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default Analytics;
