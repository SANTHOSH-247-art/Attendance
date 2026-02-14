import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SchoolBackground from './components/SchoolBackground';
import Home from './pages/Home';
import Attendance from './pages/Attendance';
import Records from './pages/Records';
import Analytics from './pages/Analytics';

import { smsService } from './services/sms';

function App() {
  useEffect(() => {
    // Background SMS Process
    const process = async () => {
      await smsService.processPendingSMS();
    };

    // Initial check
    process();

    const interval = setInterval(process, 10000); // Every 10s (reduced from 30s)

    const handleOnline = () => process();
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <BrowserRouter>
      <SchoolBackground />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="records" element={<Records />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
