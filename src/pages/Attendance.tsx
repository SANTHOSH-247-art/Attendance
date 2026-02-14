import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, RefreshCw, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import { faceService } from '../services/face';
import { dbService } from '../services/db';
import type { Student } from '../services/db';
import { APP_CONFIG } from '../conf/config';

const Attendance = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Form State
    const [selectedSubject, setSelectedSubject] = useState(APP_CONFIG.SUBJECTS[0]);

    useEffect(() => {
        loadModels();
        return () => {
            stopVideo();
        };
    }, []);

    const loadModels = async () => {
        setMessage('Loading models...');
        const loaded = await faceService.loadModels();
        setIsModelLoaded(loaded);
        if (loaded) {
            setMessage('Ready to scan');
            startVideo();
        } else {
            console.error("Model loading failed");
            setMessage('Failed to load models. Check console for details.');
        }
    };

    const startVideo = () => {
        navigator.mediaDevices.getUserMedia({ video: {} })
            .then(stream => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch(err => {
                console.error("Camera error:", err);
                setMessage('Camera access denied');
            });
    };

    const stopVideo = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleScan = async () => {
        if (!videoRef.current || !isModelLoaded) return;
        setScanning(true);
        setStatus('idle');
        setMessage('Scanning...');

        try {
            const descriptor = await faceService.getFaceDescriptor(videoRef.current);

            if (!descriptor) {
                setStatus('error');
                setMessage('No face detected. Try again.');
                setScanning(false);
                return;
            }

            // Match against DB
            const students = await dbService.getAllStudents();
            let bestMatch: Student | null = null;
            let minDistance = 1.0;

            for (const student of students) {
                if (student.face_descriptor && student.face_descriptor.length > 0) {
                    const dist = faceService.calculateDistance(descriptor, new Float32Array(student.face_descriptor));
                    if (dist < minDistance) {
                        minDistance = dist;
                        bestMatch = student;
                    }
                }
            }

            if (bestMatch && minDistance < APP_CONFIG.FACE_MATCH_THRESHOLD) {
                // Success
                setStatus('success');
                setMessage(`Marked: ${bestMatch.name}`);

                await dbService.markAttendance({
                    record_id: crypto.randomUUID(),
                    student_id: bestMatch.student_id,
                    name: bestMatch.name,
                    rollNumber: bestMatch.rollNumber || 'N/A', // Added Roll Number with fallback
                    date: new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString('en-US', { hour12: false }), // Save as 24h format for better sorting/parsing
                    subject: selectedSubject,
                    status: 'present',
                    synced: false
                });

            } else {
                setStatus('error');
                setMessage('Face not recognized.');
            }

        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage('Error during scan');
        } finally {
            setScanning(false);
            // Reset status after delay
            setTimeout(() => {
                if (status !== 'idle') setStatus('idle');
            }, 3000);
        }
    };

    // Registration Mock (for testing)
    const handleRegister = async () => {
        const rollNumber = prompt("Enter Student Roll Number:");
        if (!rollNumber) return;

        const name = prompt("Enter Student Name:");
        if (!name) return;

        setScanning(true);
        try {
            const descriptor = await faceService.getFaceDescriptor(videoRef.current!);
            if (descriptor) {
                await dbService.addStudent({
                    student_id: crypto.randomUUID(),
                    name: name,
                    rollNumber: rollNumber,
                    // parent_phone removed as requested
                    class: 'Class 10',
                    subjects: APP_CONFIG.SUBJECTS,
                    face_descriptor: faceService.descriptorToJSON(descriptor),
                    created_at: Date.now()
                });
                alert(`Registered ${name} (${rollNumber})`);
            } else {
                alert("No face detected for registration");
            }
        } catch (e) {
            console.error(e);
            alert("Registration failed");
        } finally {
            setScanning(false);
        }
    };



    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <motion.div 
                className="text-center mb-2"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-gradient mb-2">Attendance Scanner</h1>
                <p className="text-gray-600">AI-powered facial recognition system</p>
            </motion.div>

            <div className="card relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-200/20 rounded-full blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <motion.div
                            className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl"
                            whileHover={{ scale: 1.1 }}
                        >
                            <Camera className="text-white" size={28} />
                        </motion.div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Mark Attendance</h2>
                            <p className="text-gray-600">Select subject and scan student face</p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Subject</label>
                        <motion.select
                            className="input-field w-full"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            whileFocus={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {APP_CONFIG.SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </motion.select>
                    </div>

                    <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden aspect-video mb-6 flex items-center justify-center group shadow-2xl border-2 border-gray-700">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                        />

                        {/* Enhanced Scanner Overlay */}
                        {scanning && (
                            <div className="absolute inset-0 z-10 pointer-events-none">
                                {/* Scanning grid lines */}
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.2)_0%,transparent_70%)]"></div>
                                
                                {/* Moving scanner line */}
                                <motion.div
                                    className="w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.8)]"
                                    initial={{ top: '0%' }}
                                    animate={{ top: '100%' }}
                                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                                />
                                
                                {/* Corner indicators */}
                                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-green-400 rounded-tl-lg"></div>
                                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-green-400 rounded-tr-lg"></div>
                                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-green-400 rounded-bl-lg"></div>
                                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-green-400 rounded-br-lg"></div>
                            </div>
                        )}

                        {/* Corner Borders */}
                        <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white/30 rounded-tl-xl"></div>
                        <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white/30 rounded-tr-xl"></div>
                        <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white/30 rounded-bl-xl"></div>
                        <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white/30 rounded-br-xl"></div>

                        {/* Loading State */}
                        {!isModelLoaded && (
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-20"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="flex flex-col items-center text-white">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw size={48} />
                                    </motion.div>
                                    <span className="mt-4 text-lg font-medium">Loading AI Models</span>
                                    <span className="text-sm text-gray-300 mt-1">Please wait...</span>
                                </div>
                            </motion.div>
                        )}

                        {/* Success State */}
                        {status === 'success' && (
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/50 to-emerald-500/50 backdrop-blur-md z-20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    className="bg-white rounded-full p-6 shadow-2xl"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                                >
                                    <CheckCircle size={72} className="text-green-600" />
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Error State */}
                        {status === 'error' && (
                            <motion.div 
                                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/50 to-rose-500/50 backdrop-blur-md z-20"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                            >
                                <motion.div
                                    className="bg-white rounded-full p-6 shadow-2xl"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                                >
                                    <XCircle size={72} className="text-red-500" />
                                </motion.div>
                            </motion.div>
                        )}
                    </div>

                    <motion.div 
                        className="text-center mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <p className={`text-xl font-semibold transition-all duration-300 ${
                            status === 'success' ? 'text-green-600 scale-105' :
                            status === 'error' ? 'text-red-500 scale-105' : 'text-gray-700'
                        }`}>
                            {message}
                        </p>
                        {status === 'idle' && (
                            <p className="text-sm text-gray-500 mt-2">Position face clearly in the frame</p>
                        )}
                    </motion.div>

                    <div className="flex gap-4">
                        <motion.button
                            onClick={handleScan}
                            disabled={!isModelLoaded || scanning}
                            className="btn-primary w-full flex justify-center items-center gap-3 py-4 text-lg font-semibold"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {scanning ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw />
                                    </motion.div>
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Camera />
                                    Start Scan
                                </>
                            )}
                        </motion.button>

                        <motion.button 
                            onClick={handleRegister}
                            className="px-6 py-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl hover:from-gray-300 hover:to-gray-400 text-gray-700 transition-all duration-300 shadow-md hover:shadow-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <UserPlus size={24} />
                        </motion.button>
                    </div>

                    <motion.p 
                        className="text-sm text-center text-gray-500 mt-6 bg-gray-50/50 py-3 px-4 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        💡 <strong>Tip:</strong> Ensure good lighting and clear visibility of the face for best recognition results
                    </motion.p>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
