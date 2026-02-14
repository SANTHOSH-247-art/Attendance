import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Calendar, RefreshCcw, Send, XCircle } from 'lucide-react';
import { dbService } from '../services/db';
import type { AttendanceRecord } from '../services/db';
import { smsService } from '../services/sms';
import { APP_CONFIG } from '../conf/config';
import { formatDate, formatTime } from '../utils/helpers';

const Records = () => {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadRecords();
    }, []);

    useEffect(() => {
        filterRecords();
    }, [searchTerm, dateFilter, records]);

    const loadRecords = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await dbService.getAttendanceRecords();

            // Sort by date/time descending with safety check
            data.sort((a: AttendanceRecord, b: AttendanceRecord) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();

                // Handle invalid dates
                if (isNaN(dateA)) return 1;
                if (isNaN(dateB)) return -1;

                if (dateA !== dateB) return dateB - dateA;
                return b.time.localeCompare(a.time);
            });

            setRecords(data);
            setFilteredRecords(data);
        } catch (err: any) {
            console.error("Failed to load records", err);
            setError("Failed to load records: " + (err.message || String(err)));
        } finally {
            setLoading(false);
        }
    };

    const filterRecords = () => {
        let filtered = records;

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(lower) ||
                r.student_id.toLowerCase().includes(lower) ||
                r.subject.toLowerCase().includes(lower) ||
                (r.rollNumber && r.rollNumber.toLowerCase().includes(lower)) // Added Roll Number search
            );
        }

        if (dateFilter) {
            filtered = filtered.filter(r => r.date === dateFilter);
        }

        setFilteredRecords(filtered);
    };

    const handleEndAttendance = async () => {
        if (processing) return; // Prevent multiple clicks
        
        setProcessing(true);
        try {
            const allStudents = await dbService.getAllStudents();
            const targetDate = dateFilter || new Date().toISOString().split('T')[0];

            const dateRecords = await dbService.getAttendanceByDate(targetDate);
            const presentIds = new Set(dateRecords.map(r => r.student_id));

            const absentStudents = allStudents.filter(s => !presentIds.has(s.student_id));

            if (absentStudents.length === 0) {
                alert("Everyone is present for this date! No SMS needed.");
                setProcessing(false);
                return;
            }

            let queuedCount = 0;
            const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            // Queue all SMS first
            const queuePromises = absentStudents.map(async (student) => {
                const message = `Dear Parent, This is to inform you that your ward ${student.name} (Roll No: ${student.rollNumber || 'N/A'}) was absent for classes on ${formattedDate}. Please ensure regular attendance. Regards, SMAS Academy.`;
                const recipient = APP_CONFIG.TWILIO.TO_NUMBER;

                await smsService.queueSMS(
                    student.student_id,
                    student.name,
                    recipient,
                    message
                );
                return student.name;
            });

            const queuedStudents = await Promise.all(queuePromises);
            queuedCount = queuedStudents.length;

            // Show immediate feedback
            alert(`${queuedCount} notifications queued for ${targetDate}. Sending to ${APP_CONFIG.TWILIO.TO_NUMBER}...\n\nStudents: ${queuedStudents.join(', ')}`);

        } catch (error) {
            console.error("End attendance error", error);
            alert("Failed to process end attendance: " + (error as Error).message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <motion.div 
                className="flex flex-col md:flex-row justify-between items-center gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold text-gradient">Attendance Records</h1>
                    <p className="text-gray-600 mt-1">View and manage attendance history</p>
                </div>
                <motion.button 
                    onClick={loadRecords}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <RefreshCcw size={20} /> Refresh Data
                </motion.button>
            </motion.div>

            <div className="card">
                {/* Search and Filter Section */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, Roll No or subject..."
                            className="input-field pl-12 py-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={22} />
                        <input
                            type="date"
                            className="input-field pl-12 py-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 focus:border-purple-500 transition-all duration-300"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
                        <div className="text-sm text-blue-800">Total Records</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                        <div className="text-2xl font-bold text-green-600">
                            {filteredRecords.filter(r => r.status === 'present').length}
                        </div>
                        <div className="text-sm text-green-800">Present</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border border-red-100">
                        <div className="text-2xl font-bold text-red-600">
                            {filteredRecords.filter(r => r.status === 'absent').length}
                        </div>
                        <div className="text-sm text-red-800">Absent</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                        <div className="text-2xl font-bold text-purple-600">
                            {new Set(filteredRecords.map(r => r.date)).size}
                        </div>
                        <div className="text-sm text-purple-800">Unique Dates</div>
                    </div>
                </motion.div>

                {/* Table Section */}
                <motion.div 
                    className="overflow-x-auto rounded-2xl border border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID / Roll No</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Student Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sync</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <RefreshCcw size={32} className="text-blue-500" />
                                            </motion.div>
                                            <span className="mt-3 text-gray-600">Loading records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center text-red-500">
                                            <XCircle size={48} className="mb-3" />
                                            <span className="font-medium text-lg">{error}</span>
                                            <button 
                                                onClick={loadRecords}
                                                className="mt-3 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        <Search size={48} className="mx-auto mb-3 text-gray-300" />
                                        <p className="text-lg font-medium">No records found</p>
                                        <p className="text-sm">Try adjusting your search criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record, index) => (
                                    <motion.tr 
                                        key={record.record_id} 
                                        className="hover:bg-gray-50/50 transition-all duration-200 group"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        whileHover={{ 
                                            backgroundColor: "#f8fafc",
                                            scale: 1.01,
                                            x: 5
                                        }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                                                {record.rollNumber || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{formatDate(record.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatTime(`${record.date}T${record.time}`)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{record.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {record.subject}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-3 py-1 text-xs leading-5 font-semibold rounded-full transition-all duration-300 ${
                                                record.status === 'present' 
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}>
                                                {record.status === 'present' ? '✓ Present' : '✗ Absent'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {record.synced ? (
                                                <span className="inline-flex items-center text-green-600">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-slow"></span>
                                                    Synced
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-600">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></span>
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </motion.div>

                {/* End Attendance Section */}
                <motion.div 
                    className="mt-10 pt-8 border-t border-gray-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Completion</h3>
                        <p className="text-gray-600">Finalize attendance and send automated notifications</p>
                    </div>
                    
                    <motion.button
                        onClick={handleEndAttendance}
                        disabled={processing}
                        className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold flex justify-center items-center gap-3 shadow-lg transition-all duration-300 ${processing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl hover:-translate-y-1'}`}
                        whileHover={!processing ? { scale: 1.02 } : {}}
                        whileTap={!processing ? { scale: 0.98 } : {}}
                    >
                        <Send size={22} />
                        {processing ? 'Processing...' : 'Complete Attendance & Send SMS Alerts'}
                    </motion.button>
                    <p className="text-sm text-center text-gray-500 mt-3 bg-gray-50/50 py-2 px-4 rounded-lg mt-4">
                        Automatically sends attendance summary to parents via SMS
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Records;
