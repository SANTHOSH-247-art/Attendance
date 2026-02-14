import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, UserCheck, BarChart3, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/attendance', label: 'Attendance', icon: UserCheck },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/records', label: 'Records', icon: FileText },
  ];

  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Only render mobile layout on mobile devices
  if (!isMobile()) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-layout min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        className="mobile-header bg-white shadow-sm border-b border-gray-200"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-2 mr-3">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">SMAD ACADEMY</h1>
          </div>
          
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mobile-main pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        className="mobile-bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex justify-around items-center p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              className="mobile-menu-overlay fixed inset-0 bg-black bg-opacity-50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            <motion.div
              className="mobile-menu fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-lg"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-8">
                  <div className="bg-green-500 rounded-lg p-3 mr-3">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">SMAD ACADEMY</h2>
                    <p className="text-sm text-gray-600">Attendance System</p>
                  </div>
                </div>
                
                <nav className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center p-3 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}