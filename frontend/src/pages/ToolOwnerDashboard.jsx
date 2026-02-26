import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, BarChart3, Plus, Edit2, Trash2, IndianRupee,
  TrendingUp, Clock, CheckCircle, XCircle, Eye, Star
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import API from '../utils/api';
import { formatCurrency, formatDate, toolCategories } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import OTPModal from '../components/OTPModal';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'tools', label: 'My Tools', icon: Package },
  { id: 'rentals', label: 'Rental Requests', icon: Clock }
];

const ToolOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [tools, setTools] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toolModal, setToolModal] = useState(null); // null | 'add' | tool object
  const [rentalModal, setRentalModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [otpRentalId, setOtpRentalId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [toolForm, setToolForm] = useState({
    name: '',
    description: '',
    category: 'Power Tools',
    toolType: 'technical',
    rentPrice: { hourly: '', daily: '' },
    securityDeposit: '',
    condition: 'good'
  });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, toolRes, rentalRes] = await Promise.all([
        API.get('/rentals/dashboard'),
        API.get('/tools/my-tools'),
        API.get('/rentals/owner')
      ]);
      setDashboard(dashRes.data.data);
      setTools(toolRes.data.data);
      setRentals(rentalRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTool = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...toolForm,
        rentPrice: {
          hourly: Number(toolForm.rentPrice.hourly) || 0,
          daily: Number(toolForm.rentPrice.daily) || 0
        },
        securityDeposit: Number(toolForm.securityDeposit) || 0
      };

      if (typeof toolModal === 'object' && toolModal?._id) {
        await API.put(`/tools/${toolModal._id}`, payload);
        toast.success('Tool updated!');
      } else {
        await API.post('/tools', payload);
        toast.success('Tool added!');
      }

      setToolModal(null);
      resetToolForm();
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tool');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!confirm('Delete this tool?')) return;
    try {
      await API.delete(`/tools/${toolId}`);
      toast.success('Tool deleted');
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to delete tool');
    }
  };

  const handleRentalAction = async (rentalId, status, otp = null) => {
    try {
      const payload = { status };
      if (otp) payload.otp = otp;
      await API.put(`/rentals/${rentalId}/status`, payload);
      toast.success(`Rental ${status}`);
      fetchDashboard();
      setRentalModal(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleReturnWithOTP = async (rentalId) => {
    try {
      const { data } = await API.post(`/rentals/${rentalId}/send-return-otp`);
      setOtpRentalId(rentalId);
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
      toast.success(`OTP sent to tool owner's phone${data.maskedPhone ? ` (${data.maskedPhone})` : ''}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyReturnOTP = async (otp) => {
    setOtpLoading(true);
    try {
      await handleRentalAction(otpRentalId, 'returned', otp);
      setOtpModal(false);
      setOtpRentalId(null);
      toast.success('Tool return confirmed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const editTool = (tool) => {
    setToolForm({
      name: tool.name,
      description: tool.description || '',
      category: tool.category,
      toolType: tool.toolType,
      rentPrice: {
        hourly: tool.rentPrice?.hourly || '',
        daily: tool.rentPrice?.daily || ''
      },
      securityDeposit: tool.securityDeposit || '',
      condition: tool.condition || 'good'
    });
    setToolModal(tool);
  };

  const resetToolForm = () => {
    setToolForm({
      name: '', description: '', category: 'Power Tools', toolType: 'technical',
      rentPrice: { hourly: '', daily: '' }, securityDeposit: '', condition: 'good'
    });
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = useMemo(() => {
    if (!dashboard?.monthlyEarnings) return [];
    return dashboard.monthlyEarnings.map(item => ({
      month: monthNames[item._id - 1],
      earnings: item.total,
      rentals: item.count
    }));
  }, [dashboard]);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Tools', value: dashboard?.stats?.totalTools || 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Earnings', value: formatCurrency(dashboard?.stats?.totalEarnings || 0), icon: IndianRupee, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Active Rentals', value: dashboard?.stats?.activeRentals || 0, icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Pending Requests', value: dashboard?.stats?.pendingRequests || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Tool Owner Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your tools and rental requests</p>
        </div>
        <button
          onClick={() => { resetToolForm(); setToolModal('add'); }}
          className="btn-primary px-5 py-2.5"
        >
          <Plus className="w-5 h-5 mr-1" /> Add Tool
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
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {chartData.length > 0 && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-500" /> Rental Earnings
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRental" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
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
                      <Area type="monotone" dataKey="earnings" stroke="#8B5CF6" fill="url(#colorRental)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">Recent Tools</h3>
              {tools.length === 0 ? (
                <p className="text-gray-500 text-sm">No tools added yet. Click "Add Tool" to get started!</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.slice(0, 6).map((tool) => (
                    <div key={tool._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">🔧</span>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{tool.name}</p>
                          <p className="text-xs text-gray-500">{tool.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold gradient-text">
                          {formatCurrency(tool.rentPrice?.daily || 0)}/day
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tool.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tool.isAvailable ? 'Available' : 'Rented'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'tools' && (
          <motion.div
            key="tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {tools.length === 0 ? (
              <EmptyState title="No tools yet" message="Add your first tool to start renting" />
            ) : (
              <div className="space-y-4">
                {tools.map((tool) => (
                  <div key={tool._id} className="glass-card p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl shrink-0">
                        🔧
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold truncate">{tool.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            tool.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tool.isAvailable ? 'Available' : 'Rented'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{tool.category} · {tool.toolType}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          {tool.rentPrice?.daily && <span>₹{tool.rentPrice.daily}/day</span>}
                          {tool.rentPrice?.hourly && <span>₹{tool.rentPrice.hourly}/hr</span>}
                          {tool.securityDeposit > 0 && <span>Deposit: ₹{tool.securityDeposit}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => editTool(tool)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Edit2 className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDeleteTool(tool._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'rentals' && (
          <motion.div
            key="rentals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {rentals.length === 0 ? (
              <EmptyState title="No rental requests" message="Rental requests from users will appear here" />
            ) : (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <div
                    key={rental._id}
                    onClick={() => setRentalModal(rental)}
                    className="glass-card p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                        {rental.user?.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-sm truncate">{rental.tool?.name}</h3>
                          <StatusBadge status={rental.status} />
                        </div>
                        <p className="text-sm text-gray-500">By: {rental.user?.name || 'N/A'}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatDate(rental.rentalPeriod?.start)} — {formatDate(rental.rentalPeriod?.end)}</span>
                          <span className="font-medium">{formatCurrency(rental.totalCost)}</span>
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {rental.status === 'pending' && (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRentalAction(rental._id, 'approved'); }}
                              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRentalAction(rental._id, 'cancelled'); }}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-5 h-5 text-red-600" />
                            </button>
                          </>
                        )}
                        {rental.status === 'approved' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRentalAction(rental._id, 'active'); }}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 text-xs font-medium transition-colors"
                          >
                            Hand Over
                          </button>
                        )}
                        {rental.status === 'active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleReturnWithOTP(rental._id); }}
                            className="px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-600 text-xs font-medium transition-colors"
                          >
                            Returned
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
      </AnimatePresence>

      {/* Add/Edit Tool Modal */}
      <Modal
        isOpen={!!toolModal}
        onClose={() => { setToolModal(null); resetToolForm(); }}
        title={typeof toolModal === 'object' ? 'Edit Tool' : 'Add New Tool'}
        size="lg"
      >
        <form onSubmit={handleAddTool} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tool Name</label>
            <input
              type="text"
              required
              value={toolForm.name}
              onChange={(e) => setToolForm(p => ({ ...p, name: e.target.value }))}
              className="input-field"
              placeholder="e.g. Bosch Power Drill"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows={3}
              value={toolForm.description}
              onChange={(e) => setToolForm(p => ({ ...p, description: e.target.value }))}
              className="input-field resize-none"
              placeholder="Describe the tool..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={toolForm.category}
                onChange={(e) => setToolForm(p => ({ ...p, category: e.target.value }))}
                className="input-field"
              >
                {toolCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={toolForm.toolType}
                onChange={(e) => setToolForm(p => ({ ...p, toolType: e.target.value }))}
                className="input-field"
              >
                <option value="technical">Technical</option>
                <option value="non-technical">Non-Technical</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate (₹)</label>
              <input
                type="number"
                value={toolForm.rentPrice.hourly}
                onChange={(e) => setToolForm(p => ({ ...p, rentPrice: { ...p.rentPrice, hourly: e.target.value } }))}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Daily Rate (₹)</label>
              <input
                type="number"
                value={toolForm.rentPrice.daily}
                onChange={(e) => setToolForm(p => ({ ...p, rentPrice: { ...p.rentPrice, daily: e.target.value } }))}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Security Deposit</label>
              <input
                type="number"
                value={toolForm.securityDeposit}
                onChange={(e) => setToolForm(p => ({ ...p, securityDeposit: e.target.value }))}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              value={toolForm.condition}
              onChange={(e) => setToolForm(p => ({ ...p, condition: e.target.value }))}
              className="input-field"
            >
              <option value="new">New</option>
              <option value="like_new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </select>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-50">
            {submitting ? 'Saving...' : typeof toolModal === 'object' ? 'Update Tool' : 'Add Tool'}
          </button>
        </form>
      </Modal>

      {/* Rental Detail Modal */}
      <Modal
        isOpen={!!rentalModal}
        onClose={() => setRentalModal(null)}
        title="Rental Details"
      >
        {rentalModal && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Tool</p>
                <p className="font-medium">{rentalModal.tool?.name}</p>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                <p className="text-xs text-gray-500">Renter</p>
                <p className="font-medium">{rentalModal.user?.name} · {rentalModal.user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500">Period</p>
                  <p className="text-sm font-medium">{formatDate(rentalModal.rentalPeriod?.start)} — {formatDate(rentalModal.rentalPeriod?.end)}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="font-bold gradient-text">{formatCurrency(rentalModal.totalCost)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-medium">{rentalModal.duration?.value} {rentalModal.duration?.unit}</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <p className="text-xs text-gray-500">Payment</p>
                  <p className="font-medium capitalize">{rentalModal.paymentMethod || 'online'}</p>
                </div>
              </div>
            </div>

            {/* Rental Status Progress Tracker */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
              <p className="text-xs text-gray-500 mb-3 font-medium">Rental Progress</p>
              <div className="flex items-center gap-1">
                {[
                  { key: 'pending', label: 'Pending', icon: '⏳' },
                  { key: 'approved', label: 'Approved', icon: '✅' },
                  { key: 'active', label: 'Active', icon: '🛠️' },
                  { key: 'returned', label: 'Returned', icon: '🎉' }
                ].map((step, idx, arr) => {
                  const statusOrder = ['pending', 'approved', 'active', 'returned'];
                  const currentIdx = statusOrder.indexOf(rentalModal.status);
                  const stepIdx = statusOrder.indexOf(step.key);
                  const isActive = stepIdx <= currentIdx && rentalModal.status !== 'cancelled';
                  const isCurrent = step.key === rentalModal.status;
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
              {rentalModal.status === 'cancelled' && (
                <div className="mt-3 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                  ❌ This rental was cancelled
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {rentalModal.status === 'pending' && (
                <>
                  <button onClick={() => handleRentalAction(rentalModal._id, 'approved')} className="btn-primary flex-1 py-3">
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </button>
                  <button onClick={() => handleRentalAction(rentalModal._id, 'cancelled')} className="btn-danger flex-1 py-3">
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </button>
                </>
              )}
              {rentalModal.status === 'approved' && (
                <button onClick={() => handleRentalAction(rentalModal._id, 'active')} className="btn-primary flex-1 py-3">
                  Mark as Active (Handed Over)
                </button>
              )}
              {rentalModal.status === 'active' && (
                <button onClick={() => handleReturnWithOTP(rentalModal._id)} className="btn-success flex-1 py-3">
                  <CheckCircle className="w-4 h-4 mr-1" /> Mark Returned
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* OTP Modal for tool return */}
      <OTPModal
        isOpen={otpModal}
        onClose={() => { setOtpModal(false); setOtpRentalId(null); }}
        onVerify={handleVerifyReturnOTP}
        onResend={() => otpRentalId && handleReturnWithOTP(otpRentalId)}
        title="Verify Tool Return"
        subtitle="Enter the OTP sent to the tool owner's phone to confirm return"
        loading={otpLoading}
      />
    </div>
  );
};

export default ToolOwnerDashboard;
