import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Wrench, Package, IndianRupee, Shield,
  Ban, CheckCircle, XCircle, Trash2, Search, TrendingUp,
  Eye, UserCheck, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import API from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'technicians', label: 'Technicians', icon: Wrench },
  { id: 'tools', label: 'Tools', icon: Package }
];

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dashRes, userRes, techRes, toolRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/users'),
        API.get('/admin/technicians'),
        API.get('/admin/tools')
      ]);
      setDashboard(dashRes.data.data);
      setUsers(userRes.data.data);
      setTechnicians(techRes.data.data);
      setTools(toolRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/ban`);
      toast.success('User status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleVerifyTechnician = async (techId) => {
    try {
      await API.put(`/admin/technicians/${techId}/verify`);
      toast.success('Technician verified');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify');
    }
  };

  const handleDeleteTool = async (toolId) => {
    if (!confirm('Delete this tool?')) return;
    try {
      await API.delete(`/admin/tools/${toolId}`);
      toast.success('Tool deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const revenueChartData = useMemo(() => {
    if (!dashboard?.monthlyBookings) return [];
    return dashboard.monthlyBookings.map(item => ({
      month: monthNames[item._id - 1],
      revenue: item.revenue,
      bookings: item.count
    }));
  }, [dashboard]);

  const roleDistribution = useMemo(() => {
    if (!dashboard) return [];
    return [
      { name: 'Users', value: dashboard.totalUsers || 0 },
      { name: 'Technicians', value: dashboard.totalTechnicians || 0 },
      { name: 'Tool Owners', value: dashboard.totalToolOwners || 0 }
    ].filter(d => d.value > 0);
  }, [dashboard]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter(u =>
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredTechnicians = useMemo(() => {
    if (!searchQuery) return technicians;
    return technicians.filter(t =>
      t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [technicians, searchQuery]);

  if (loading) return <PageLoader />;

  const stats = [
    { label: 'Total Users', value: dashboard?.totalUsers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Technicians', value: dashboard?.totalTechnicians || 0, icon: Wrench, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Bookings', value: dashboard?.totalBookings || 0, icon: BarChart3, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Revenue', value: formatCurrency(dashboard?.totalRevenue || 0), icon: IndianRupee, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Tools Listed', value: dashboard?.totalTools || 0, icon: Package, color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
    { label: 'Total Rentals', value: dashboard?.totalRentals || 0, icon: TrendingUp, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' }
  ];

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="glass-card p-4 rounded-2xl"
          >
            <div className={`w-9 h-9 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
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
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid lg:grid-cols-3 gap-6"
          >
            {/* Revenue chart */}
            <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" /> Monthly Revenue
              </h3>
              {revenueChartData.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData}>
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
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No revenue data yet</p>
              )}
            </div>

            {/* Role distribution */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-semibold mb-4">User Distribution</h3>
              {roleDistribution.length > 0 ? (
                <div className="h-60 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {roleDistribution.map((_, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No data</p>
              )}
              <div className="flex justify-center gap-4 mt-4">
                {roleDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats cards */}
            <div className="lg:col-span-3 grid sm:grid-cols-3 gap-4">
              <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboard?.completedBookings || 0}</p>
                  <p className="text-xs text-gray-500">Completed Bookings</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboard?.pendingBookings || 0}</p>
                  <p className="text-xs text-gray-500">Pending Bookings</p>
                </div>
              </div>
              <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{dashboard?.verifiedTechnicians || 0}</p>
                  <p className="text-xs text-gray-500">Verified Technicians</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left p-4 font-medium text-gray-500">User</th>
                      <th className="text-left p-4 font-medium text-gray-500">Email</th>
                      <th className="text-left p-4 font-medium text-gray-500">Role</th>
                      <th className="text-left p-4 font-medium text-gray-500">Status</th>
                      <th className="text-left p-4 font-medium text-gray-500">Joined</th>
                      <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold">
                              {u.name?.[0]}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-500">{u.email}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-600 capitalize">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.isBanned ? (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700">Banned</span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">Active</span>
                          )}
                        </td>
                        <td className="p-4 text-gray-500">{formatDate(u.createdAt)}</td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleBan(u._id)}
                            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              u.isBanned ? 'text-green-500' : 'text-red-500'
                            }`}
                            title={u.isBanned ? 'Unban' : 'Ban'}
                          >
                            {u.isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-8">No users found</p>
              )}
            </div>
          </motion.div>
        )}

        {/* TECHNICIANS */}
        {activeTab === 'technicians' && (
          <motion.div
            key="technicians"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="mb-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search technicians..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {filteredTechnicians.length === 0 ? (
              <EmptyState title="No technicians found" />
            ) : (
              <div className="space-y-4">
                {filteredTechnicians.map((tech) => (
                  <div key={tech._id} className="glass-card p-5 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {tech.user?.name?.[0] || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold">{tech.user?.name}</h3>
                          {tech.isVerified ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                              <Shield className="w-3 h-3" /> Verified
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{tech.user?.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tech.skills?.slice(0, 4).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 text-xs rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
                              {skill}
                            </span>
                          ))}
                          {tech.skills?.length > 4 && (
                            <span className="text-xs text-gray-500">+{tech.skills.length - 4} more</span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{tech.experience} yrs exp</span>
                          <span>⭐ {tech.rating?.average?.toFixed(1) || '0.0'}</span>
                          <span>{tech.completedJobs || 0} jobs</span>
                          <span>{formatCurrency(tech.chargeRate)}/{tech.chargeType}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!tech.isVerified && (
                          <button
                            onClick={() => handleVerifyTechnician(tech._id)}
                            className="btn-primary text-sm px-4 py-2"
                          >
                            <Shield className="w-4 h-4 mr-1" /> Verify
                          </button>
                        )}
                        <button
                          onClick={() => tech.user && handleToggleBan(tech.user._id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                          title="Ban User"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TOOLS */}
        {activeTab === 'tools' && (
          <motion.div
            key="tools"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {tools.length === 0 ? (
              <EmptyState title="No tools listed" />
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left p-4 font-medium text-gray-500">Tool</th>
                        <th className="text-left p-4 font-medium text-gray-500">Category</th>
                        <th className="text-left p-4 font-medium text-gray-500">Owner</th>
                        <th className="text-left p-4 font-medium text-gray-500">Rate</th>
                        <th className="text-left p-4 font-medium text-gray-500">Status</th>
                        <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tools.map((tool) => (
                        <tr key={tool._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4 font-medium">{tool.name}</td>
                          <td className="p-4 text-gray-500">{tool.category}</td>
                          <td className="p-4 text-gray-500">{tool.owner?.shopName || 'N/A'}</td>
                          <td className="p-4 font-semibold">{formatCurrency(tool.rentPrice?.daily || 0)}/day</td>
                          <td className="p-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              tool.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {tool.isAvailable ? 'Available' : 'Rented'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => handleDeleteTool(tool._id)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
