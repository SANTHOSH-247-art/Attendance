import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, BarChart3, Clock } from 'lucide-react';
import { APP_CONFIG } from '../conf/config';
import { formatDate } from '../utils/helpers';
import { dbService } from '../services/db';

const Home = () => {
    const [todayDate, setTodayDate] = useState(new Date());
    const [stats, setStats] = useState({
        totalStudents: 0,
        markedToday: 0
    });

    useEffect(() => {
        const timer = setInterval(() => setTodayDate(new Date()), 60000);
        loadStats();
        return () => clearInterval(timer);
    }, []);

    const loadStats = async () => {
        try {
            const students = await dbService.getAllStudents();
            const records = await dbService.getAttendanceByDate(new Date().toISOString().split('T')[0]);
            setStats({
                totalStudents: students.length,
                markedToday: records.length
            });
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{APP_CONFIG.SCHOOL_NAME}</h1>
                <p className="text-gray-600 mb-4">Automated Attendance System</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock size={16} />
                    <span>
                        {formatDate(todayDate)} • {todayDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <CheckCircle size={20} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Today's Attendance</h3>
                                <p className="text-sm text-gray-500">Students marked present</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="status-indicator status-delivered"></div>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-emerald-600 mb-2">
                        {stats.markedToday}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${Math.min(100, (stats.markedToday / Math.max(1, stats.totalStudents)) * 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 ml-2 min-w-max">
                            {Math.round((stats.markedToday / Math.max(1, stats.totalStudents)) * 100)}%
                        </span>
                    </div>
                </div>
                
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Student Count</h3>
                                <p className="text-sm text-gray-500">Total enrolled</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="status-indicator status-read"></div>
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {stats.totalStudents}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${stats.totalStudents > 0 ? 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                            {stats.totalStudents > 0 ? '100%' : '0%'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/attendance" className="group">
                    <div className="card h-full flex flex-col p-6 cursor-pointer border-l-4 border-emerald-500 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-500 transition-colors">
                                <CheckCircle size={20} className="text-emerald-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900">Mark Attendance</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Start webcam scan to automatically mark student attendance.</p>
                        <div className="text-xs text-emerald-600 font-medium">Tap to start scanning</div>
                    </div>
                </Link>

                <Link to="/records" className="group">
                    <div className="card h-full flex flex-col p-6 cursor-pointer border-l-4 border-blue-500 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-500 transition-colors">
                                <Users size={20} className="text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900">View Records</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">Browse attendance history and manage student profiles.</p>
                        <div className="text-xs text-blue-600 font-medium">View all records</div>
                    </div>
                </Link>

                <Link to="/analytics" className="group">
                    <div className="card h-full flex flex-col p-6 cursor-pointer border-l-4 border-purple-500 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-500 transition-colors">
                                <BarChart3 size={20} className="text-purple-600 group-hover:text-white transition-colors" />
                            </div>
                            <h2 className="text-lg font-medium text-gray-900">Analytics</h2>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">View attendance trends and detailed reports.</p>
                        <div className="text-xs text-purple-600 font-medium">See insights</div>
                    </div>
                </Link>
            </div>

            {/* Reset Data Section */}
            <div className="flex justify-center pt-8 border-t border-gray-200">
                <button
                    onClick={async () => {
                        if (confirm("Are you sure? This will delete ALL students and attendance records. This cannot be undone.")) {
                            await dbService.clearAllData();
                            alert("System Reset Successfully");
                            window.location.reload();
                        }
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset System Data
                </button>
            </div>
        </div>
    );
};

export default Home;
