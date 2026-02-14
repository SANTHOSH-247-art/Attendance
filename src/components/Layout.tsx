import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BarChart, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { smsService } from '../services/sms';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const updateStatus = () => setIsOnline(navigator.onLine);
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);

        const checkQueue = async () => {
            const count = await smsService.getPendingCount();
            setPendingCount(count);
        };

        const timer = setInterval(checkQueue, 5000); // Check every 5s
        checkQueue();

        return () => {
            window.removeEventListener('online', updateStatus);
            window.removeEventListener('offline', updateStatus);
            clearInterval(timer);
        };
    }, []);

    if (isOnline && pendingCount === 0) return null; // Don't show if everything is perfect

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${!isOnline ? 'bg-red-500 text-white' :
            pendingCount > 0 ? 'bg-yellow-400 text-gray-900' : 'bg-green-500 text-white'
            }`}>
            {!isOnline ? <WifiOff size={14} /> : <Wifi size={14} />}
            <span>
                {!isOnline ? `Offline (${pendingCount} queued)` :
                    pendingCount > 0 ? `Sending ${pendingCount}...` : 'Online'}
            </span>
        </div>
    );
};

export default function Layout() {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { path: '/', label: 'Home', icon: LayoutDashboard },
        { path: '/attendance', label: 'Attendance', icon: CheckSquare },
        { path: '/records', label: 'Records', icon: Users },
        { path: '/analytics', label: 'Analytics', icon: BarChart },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <span className="font-semibold text-xl text-emerald-600">SMAS</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <OfflineIndicator />
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-1">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                                                isActive(item.path)
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <item.icon size={18} />
                                                {item.label}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="min-h-[calc(100vh-8rem)]">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
