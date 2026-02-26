import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Calendar, Clock, IndianRupee, Users, Star,
  CheckCircle, XCircle, TrendingUp, Power, Eye,
  FileText, Image, Film, Package, Plus, Trash2, Send, MapPin
} from 'lucide-react';
import { skillIcons } from '../utils/helpers';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import API from '../utils/api';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import OTPModal from '../components/OTPModal';
import toast from 'react-hot-toast';

const BACKEND_URL = 'http://localhost:5000';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'estimates', label: 'Estimates', icon: FileText },
  { id: 'bookings', label: 'Bookings', icon: Calendar },
  { id: 'earnings', label: 'Earnings', icon: IndianRupee }
];

const TechDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [otpModal, setOtpModal] = useState(false);
  const [otpBookingId, setOtpBookingId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [estimateRequests, setEstimateRequests] = useState([]);
  const [estimateFilter, setEstimateFilter] = useState('');
  const [estimateModal, setEstimateModal] = useState(null);
  const [estimateForm, setEstimateForm] = useState({
    serviceCharge: '',
    materials: [{ name: '', quantity: 1, unitPrice: '' }],
    estimatedDuration: '',
    notes: ''
  });
  const [submittingEstimate, setSubmittingEstimate] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, bookRes, estRes] = await Promise.all([
        API.get('/technicians/dashboard'),
        API.get('/bookings/technician'),
        API.get('/estimates/technician/requests')
      ]);
      setDashboard(dashRes.data.data);
      setBookings(bookRes.data.data);
      setEstimateRequests(estRes.data.data || []);
      setIsOnline(dashRes.data.data?.isOnline || false);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOnline = async () => {
    try {
      await API.put('/technicians/toggle-status');
      setIsOnline(!isOnline);
      toast.success(isOnline ? 'You are now offline' : 'You are now online!');
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const handleBookingAction = async (bookingId, status, otp = null) => {
    try {
      const payload = { status };
      if (otp) payload.otp = otp;
      await API.put(`/bookings/${bookingId}/status`, payload);
      toast.success(`Booking ${status}`);
      fetchData();
      setDetailModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleCompleteWithOTP = async (bookingId) => {
    try {
      const { data } = await API.post(`/bookings/${bookingId}/send-complete-otp`);
      setOtpBookingId(bookingId);
      setOtpModal(true);
      // Show demo OTP in corner
      if (data.demoOTP) {
        toast(`Demo OTP: ${data.demoOTP}`, {
          icon: '🔑',
          duration: 15000,
          position: 'bottom-right',
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600'
          }
        });
      }
      toast.success(`OTP sent to user's phone${data.maskedPhone ? ` (${data.maskedPhone})` : ''}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyCompleteOTP = async (otp) => {
    setOtpLoading(true);
    try {
      await handleBookingAction(otpBookingId, 'completed', otp);
      setOtpModal(false);
      setOtpBookingId(null);
      toast.success('Job marked as completed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (!statusFilter) return bookings;
    return bookings.filter(b => b.status === statusFilter);
  }, [bookings, statusFilter]);

  const filteredEstimates = useMemo(() => {
    if (!estimateFilter) return estimateRequests;
    return estimateRequests.filter(e => e.status === estimateFilter);
  }, [estimateRequests, estimateFilter]);

  const pendingEstimateCount = useMemo(() => {
    return estimateRequests.filter(e => e.status === 'pending').length;
  }, [estimateRequests]);

  const addMaterial = () => {
    setEstimateForm(prev => ({
      ...prev,
      materials: [...prev.materials, { name: '', quantity: 1, unitPrice: '' }]
    }));
  };

  const removeMaterial = (index) => {
    setEstimateForm(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const updateMaterial = (index, field, value) => {
    setEstimateForm(prev => ({
      ...prev,
      materials: prev.materials.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const estimateMaterialTotal = useMemo(() => {
    return estimateForm.materials.reduce((sum, m) => {
      return sum + ((Number(m.quantity) || 0) * (Number(m.unitPrice) || 0));
    }, 0);
  }, [estimateForm.materials]);

  const estimateTotal = useMemo(() => {
    return (Number(estimateForm.serviceCharge) || 0) + estimateMaterialTotal;
  }, [estimateForm.serviceCharge, estimateMaterialTotal]);

  const handleSubmitEstimate = async (estimateId) => {
    if (!estimateForm.serviceCharge || Number(estimateForm.serviceCharge) <= 0) {
      toast.error('Please enter a service charge');
      return;
    }
    setSubmittingEstimate(true);
    try {
      await API.put(`/estimates/${estimateId}/submit-estimate`, {
        serviceCharge: Number(estimateForm.serviceCharge),
        materials: estimateForm.materials.filter(m => m.name && m.unitPrice),
        estimatedDuration: estimateForm.estimatedDuration,
        notes: estimateForm.notes
      });
      toast.success('Estimate sent to user!');
      setEstimateModal(null);
      setEstimateForm({ serviceCharge: '', materials: [{ name: '', quantity: 1, unitPrice: '' }], estimatedDuration: '', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit estimate');
    } finally {
      setSubmittingEstimate(false);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = useMemo(() => {
    if (!dashboard?.monthlyEarnings) return [];
    return dashboard.monthlyEarnings.map(item => ({
      month: monthNames[item._id - 1],
      earnings: item.total,
      jobs: item.count
    }));
  }, [dashboard]);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Earnings', value: formatCurrency(dashboard?.totalEarnings || 0), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Completed Jobs', value: dashboard?.completedJobs || 0, icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Rating', value: `${(dashboard?.rating?.average || 0).toFixed(1)} ⭐`, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Pending Bookings', value: dashboard?.pendingBookings || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Technician Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your bookings and earnings</p>
        </div>
        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isOnline
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}
        >
          <Power className="w-4 h-4" />
          {isOnline ? 'Online' : 'Offline'}
          <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        </button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-5 rounded-2xl"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'gradient-bg text-white shadow-lg'
                : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Chart */}
            {chartData.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" /> Earnings Trend
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(255,255,255,0.95)',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area type="monotone" dataKey="earnings" stroke="#3B82F6" fill="url(#colorEarnings)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent bookings */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Recent Bookings</h3>
              {bookings.slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-sm">No bookings yet</p>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div
                      key={booking._id}
                      onClick={() => setDetailModal(booking)}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white font-bold">
                        {booking.user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{booking.service}</p>
                        <p className="text-xs text-gray-500">{booking.user?.name} · {formatDate(booking.scheduledDate)}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bookings */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === s
                      ? 'gradient-bg text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s ? s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'All'}
                </button>
              ))}
            </div>

            {filteredBookings.length === 0 ? (
              <EmptyState title="No bookings found" />
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    onClick={() => setDetailModal(booking)}
                    className="glass-card p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                        {booking.user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-sm truncate">{booking.service}</h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-gray-500">Client: {booking.user?.name || 'N/A'}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(booking.scheduledDate)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.timeSlot?.start} - {booking.timeSlot?.end}</span>
                          {(booking.finalCost > 0 || booking.estimatedCost > 0) && (
                            <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(booking.finalCost || booking.estimatedCost)}</span>
                          )}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBookingAction(booking._id, 'confirmed'); }}
                              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                              title="Accept"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleBookingAction(booking._id, 'cancelled'); }}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                              title="Decline"
                            >
                              <XCircle className="w-5 h-5 text-red-600" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleBookingAction(booking._id, 'in_progress'); }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-medium transition-colors"
                          >
                            Start Job
                          </button>
                        )}
                        {booking.status === 'in_progress' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCompleteWithOTP(booking._id); }}
                            className="px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-medium transition-colors"
                          >
                            Complete
                          </button>
                        )}
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Estimates */}
        {activeTab === 'estimates' && (
          <motion.div
            key="estimates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {['', 'pending', 'estimated', 'accepted', 'booked', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setEstimateFilter(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    estimateFilter === s
                      ? 'gradient-bg text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
                  {s === 'pending' && pendingEstimateCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px]">{pendingEstimateCount}</span>
                  )}
                </button>
              ))}
            </div>

            {filteredEstimates.length === 0 ? (
              <EmptyState title="No estimate requests" />
            ) : (
              <div className="space-y-3">
                {filteredEstimates.map((est) => (
                  <div key={est._id} className="glass-card p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                        {est.user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {skillIcons[est.service]} {est.service}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${
                            est.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            est.status === 'estimated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            est.status === 'booked' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>{est.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">From: {est.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{est.description}</p>
                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{est.location?.address}</span>
                          <span>{est.media?.length || 0} files</span>
                        </div>
                      </div>

                      {/* Media thumbnails */}
                      {est.media?.length > 0 && (
                        <div className="flex gap-2 shrink-0">
                          {est.media.slice(0, 2).map((m, i) => (
                            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                              {m.type === 'photo' ? (
                                <img src={`${BACKEND_URL}${m.url}`} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <Film className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                          {est.media.length > 2 && (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-medium text-gray-500">
                              +{est.media.length - 2}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action */}
                      {est.status === 'pending' && (
                        <button
                          onClick={() => {
                            setEstimateModal(est);
                            setEstimateForm({ serviceCharge: '', materials: [{ name: '', quantity: 1, unitPrice: '' }], estimatedDuration: '', notes: '' });
                          }}
                          className="px-4 py-2 rounded-lg bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 text-primary-600 text-xs font-medium transition-colors shrink-0"
                        >
                          <Send className="w-4 h-4 inline mr-1" /> Send Estimate
                        </button>
                      )}
                      {est.status === 'estimated' && (
                        <span className="text-xs text-blue-500 font-medium shrink-0">Waiting for user</span>
                      )}
                      {est.status === 'booked' && (
                        <span className="text-xs text-green-500 font-medium shrink-0">✅ Booked</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Earnings */}
        {activeTab === 'earnings' && (
          <motion.div
            key="earnings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="glass-card p-6 rounded-2xl text-center">
              <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
              <p className="text-4xl font-bold gradient-text">{formatCurrency(dashboard?.totalEarnings || 0)}</p>
              <p className="text-sm text-gray-500 mt-2">{dashboard?.completedJobs || 0} completed jobs</p>
            </div>

            {chartData.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4">Monthly Breakdown</h3>
                <div className="space-y-3">
                  {chartData.map((item) => (
                    <div key={item.month} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                      <span className="w-10 text-sm font-medium text-gray-500">{item.month}</span>
                      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full gradient-bg rounded-full"
                          style={{ width: `${Math.min(100, (item.earnings / Math.max(...chartData.map(d => d.earnings))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-24 text-right">{formatCurrency(item.earnings)}</span>
                      <span className="text-xs text-gray-500 w-16 text-right">{item.jobs} jobs</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="Booking Details"
        size="lg"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium">{detailModal.service}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Client</p>
                <p className="font-medium">{detailModal.user?.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{formatDate(detailModal.scheduledDate)}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{detailModal.timeSlot?.start} - {detailModal.timeSlot?.end}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Payment</p>
                <p className="font-medium capitalize">{detailModal.paymentMethod || 'cash'}</p>
              </div>
              {(detailModal.finalCost > 0 || detailModal.estimatedCost > 0) && (
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold gradient-text">{formatCurrency(detailModal.finalCost || detailModal.estimatedCost)}</p>
                </div>
              )}
            </div>

            {/* Status Progress Tracker */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-500 mb-3 font-medium">Order Progress</p>
              <div className="flex items-center gap-1">
                {[
                  { key: 'pending', label: 'Pending', icon: '⏳' },
                  { key: 'confirmed', label: 'Accepted', icon: '✅' },
                  { key: 'in_progress', label: 'Out for Work', icon: '🚀' },
                  { key: 'completed', label: 'Completed', icon: '🎉' }
                ].map((step, idx, arr) => {
                  const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed'];
                  const currentIdx = statusOrder.indexOf(detailModal.status);
                  const stepIdx = statusOrder.indexOf(step.key);
                  const isActive = stepIdx <= currentIdx && detailModal.status !== 'cancelled';
                  const isCurrent = step.key === detailModal.status;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm ${
                          isCurrent ? 'ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-gray-700' : ''
                        } ${
                          isActive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          {step.icon}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium text-center leading-tight ${
                          isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                        }`}>{step.label}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className={`h-0.5 flex-1 -mt-4 mx-0.5 rounded ${
                          stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {detailModal.status === 'cancelled' && (
                <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                  ❌ This booking was cancelled{detailModal.cancellationReason ? `: ${detailModal.cancellationReason}` : ''}
                </div>
              )}
            </div>

            {detailModal.description && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm">{detailModal.description}</p>
              </div>
            )}

            {/* Client contact */}
            {detailModal.user && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500 mb-1">Contact</p>
                <p className="text-sm">{detailModal.user.email} · {detailModal.user.phone || 'No phone'}</p>
              </div>
            )}

            {/* Action buttons based on status */}
            <div className="flex gap-3 pt-2">
              {detailModal.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleBookingAction(detailModal._id, 'confirmed')}
                    className="btn-primary flex-1 py-3"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Accept
                  </button>
                  <button
                    onClick={() => handleBookingAction(detailModal._id, 'cancelled')}
                    className="btn-danger flex-1 py-3"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Decline
                  </button>
                </>
              )}
              {detailModal.status === 'confirmed' && (
                <button
                  onClick={() => handleBookingAction(detailModal._id, 'in_progress')}
                  className="btn-primary flex-1 py-3"
                >
                  Start Job
                </button>
              )}
              {detailModal.status === 'in_progress' && (
                <button
                  onClick={() => handleCompleteWithOTP(detailModal._id)}
                  className="btn-success flex-1 py-3"
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Mark Completed
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Estimate Submit Modal */}
      <Modal
        isOpen={!!estimateModal}
        onClose={() => setEstimateModal(null)}
        title="Submit Cost Estimate"
        size="lg"
      >
        {estimateModal && (
          <div className="space-y-5 max-h-[70vh] overflow-y-auto">
            {/* Request summary */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{skillIcons[estimateModal.service]}</span>
                <div>
                  <p className="font-semibold">{estimateModal.service}</p>
                  <p className="text-xs text-gray-500">From: {estimateModal.user?.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{estimateModal.description}</p>
            </div>

            {/* Uploaded media */}
            {estimateModal.media?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Uploaded Media</p>
                <div className="grid grid-cols-3 gap-2">
                  {estimateModal.media.map((m, i) => (
                    <div key={i} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                      {m.type === 'photo' ? (
                        <img
                          src={`${BACKEND_URL}${m.url}`}
                          alt=""
                          className="w-full h-24 object-cover cursor-pointer"
                          onClick={() => window.open(`${BACKEND_URL}${m.url}`, '_blank')}
                        />
                      ) : (
                        <video src={`${BACKEND_URL}${m.url}`} className="w-full h-24 object-cover" controls />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service charge */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <IndianRupee className="w-4 h-4 inline mr-1" /> Service Charge (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Enter your service charge..."
                value={estimateForm.serviceCharge}
                onChange={(e) => setEstimateForm(prev => ({ ...prev, serviceCharge: e.target.value }))}
                className="input-field"
                required
              />
            </div>

            {/* Materials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Package className="w-4 h-4" /> Materials & Parts
                </label>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {estimateForm.materials.map((mat, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Item (e.g., Wire, Pipe)"
                      value={mat.name}
                      onChange={(e) => updateMaterial(i, 'name', e.target.value)}
                      className="input-field flex-1 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={mat.quantity}
                      onChange={(e) => updateMaterial(i, 'quantity', e.target.value)}
                      className="input-field w-16 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="₹ Price"
                      value={mat.unitPrice}
                      onChange={(e) => updateMaterial(i, 'unitPrice', e.target.value)}
                      className="input-field w-24 text-sm"
                    />
                    <span className="text-sm font-medium w-20 text-right">{formatCurrency((Number(mat.quantity) || 0) * (Number(mat.unitPrice) || 0))}</span>
                    {estimateForm.materials.length > 1 && (
                      <button type="button" onClick={() => removeMaterial(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-1" /> Estimated Duration
              </label>
              <input
                type="text"
                placeholder="e.g., 2-3 hours, Half day"
                value={estimateForm.estimatedDuration}
                onChange={(e) => setEstimateForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes for Customer</label>
              <textarea
                rows={3}
                placeholder="Any additional notes about the estimate..."
                value={estimateForm.notes}
                onChange={(e) => setEstimateForm(prev => ({ ...prev, notes: e.target.value }))}
                className="input-field resize-none"
              />
            </div>

            {/* Cost summary */}
            <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Service Charge</span>
                <span className="font-medium">{formatCurrency(Number(estimateForm.serviceCharge) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Materials</span>
                <span className="font-medium">{formatCurrency(estimateMaterialTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-primary-200 dark:border-primary-800 pt-2">
                <span>Total</span>
                <span className="gradient-text">{formatCurrency(estimateTotal)}</span>
              </div>
            </div>

            <button
              onClick={() => handleSubmitEstimate(estimateModal._id)}
              disabled={submittingEstimate}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {submittingEstimate ? 'Sending...' : `Send Estimate — ${formatCurrency(estimateTotal)}`}
            </button>
          </div>
        )}
      </Modal>

      {/* OTP Modal for completing job */}
      <OTPModal
        isOpen={otpModal}
        onClose={() => { setOtpModal(false); setOtpBookingId(null); }}
        onVerify={handleVerifyCompleteOTP}
        onResend={() => otpBookingId && handleCompleteWithOTP(otpBookingId)}
        title="Verify Job Completion"
        subtitle="Enter the OTP sent to the customer's phone to confirm completion"
        loading={otpLoading}
      />
    </div>
  );
};

export default TechDashboard;
