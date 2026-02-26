import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TechnicianList from './pages/TechnicianList';
import TechnicianProfile from './pages/TechnicianProfile';
import ToolList from './pages/ToolList';
import ToolDetail from './pages/ToolDetail';

import UserDashboard from './pages/UserDashboard';
import BookingPage from './pages/BookingPage';
import BookingSuccess from './pages/BookingSuccess';
import CostEstimateRequest from './pages/CostEstimateRequest';
import EstimateDetail from './pages/EstimateDetail';
import VideoCallPage from './pages/VideoCall';

import TechDashboard from './pages/TechDashboard';

import ToolOwnerDashboard from './pages/ToolOwnerDashboard';

import AdminDashboard from './pages/AdminDashboard';
import IncomingCall from './components/IncomingCall';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: 'var(--toast-bg, #333)',
            color: 'var(--toast-color, #fff)',
            fontSize: '14px'
          },
          success: { style: { '--toast-bg': '#059669', '--toast-color': '#fff' } },
          error: { style: { '--toast-bg': '#DC2626', '--toast-color': '#fff' } }
        }}
      />
      <Navbar />
      <IncomingCall />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/technicians" element={<TechnicianList />} />
            <Route path="/technicians/:id" element={<TechnicianProfile />} />
            <Route path="/tools" element={<ToolList />} />
            <Route path="/tools/:id" element={<ToolDetail />} />

            {/* User */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>
            } />
            <Route path="/book/:techId" element={
              <ProtectedRoute roles={['user']}><BookingPage /></ProtectedRoute>
            } />
            <Route path="/booking/success/:bookingId" element={
              <ProtectedRoute roles={['user']}><BookingSuccess /></ProtectedRoute>
            } />
            <Route path="/estimate/:techId" element={
              <ProtectedRoute roles={['user']}><CostEstimateRequest /></ProtectedRoute>
            } />
            <Route path="/estimates/:id" element={
              <ProtectedRoute roles={['user']}><EstimateDetail /></ProtectedRoute>
            } />
            <Route path="/video-call/:roomId" element={
              <ProtectedRoute roles={['user', 'technician']}><VideoCallPage /></ProtectedRoute>
            } />

            {/* Technician */}
            <Route path="/technician/dashboard" element={
              <ProtectedRoute roles={['technician']}><TechDashboard /></ProtectedRoute>
            } />

            {/* Tool Owner */}
            <Route path="/toolowner/dashboard" element={
              <ProtectedRoute roles={['toolowner']}><ToolOwnerDashboard /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
