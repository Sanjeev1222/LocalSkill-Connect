import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Calendar, Shield, Package, IndianRupee,
  Clock, ChevronLeft, AlertCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { formatCurrency, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalForm, setRentalForm] = useState({
    startDate: '',
    endDate: '',
    notes: '',
    paymentMethod: 'cash'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTool();
  }, [id]);

  const fetchTool = async () => {
    try {
      const { data } = await API.get(`/tools/${id}`);
      setTool(data.data);
    } catch (error) {
      console.error('Error fetching tool:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!rentalForm.startDate || !rentalForm.endDate) return 0;
    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days < 1) return 0;
    const daily = tool?.rentPrice?.daily || tool?.rentPrice?.hourly * 8 || 0;
    return daily * days;
  };

  const getDays = () => {
    if (!rentalForm.startDate || !rentalForm.endDate) return 0;
    const start = new Date(rentalForm.startDate);
    const end = new Date(rentalForm.endDate);
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  };

  const handleRental = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (getDays() < 1) {
      toast.error('Minimum rental period is 1 day');
      return;
    }
    setSubmitting(true);
    try {
      const days = getDays();
      const { data } = await API.post('/rentals', {
        toolId: id,
        rentalPeriod: {
          start: rentalForm.startDate,
          end: rentalForm.endDate
        },
        duration: {
          value: days,
          unit: 'days'
        },
        paymentMethod: rentalForm.paymentMethod,
        notes: rentalForm.notes
      });

      // If online payment, process it
      if (rentalForm.paymentMethod === 'online' && data.data?._id) {
        try {
          const intentRes = await API.post('/payments/create-intent', {
            amount: data.data.totalCost,
            type: 'rental',
            referenceId: data.data._id
          });
          await API.post('/payments/confirm', {
            paymentId: intentRes.data.data.paymentId
          });
        } catch (payErr) {
          console.error('Payment processing error:', payErr);
        }
      }

      toast.success('Rental request submitted! Waiting for owner approval.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rental');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!tool) return (
    <div className="page-container text-center">
      <p className="text-gray-500 text-lg">Tool not found</p>
      <Link to="/tools" className="btn-primary mt-4 inline-flex">Back to Tools</Link>
    </div>
  );

  const categoryEmojis = {
    'Power Tools': '⚡', 'Hand Tools': '🔨', 'Gardening': '🌱',
    'Cleaning': '🧹', 'Painting': '🎨', 'Plumbing': '🔧',
    'Electrical': '💡', 'Automotive': '🚗', 'Woodworking': '🪵',
    'Measuring': '📏', 'Safety': '🦺', 'Ladders': '🪜', 'Other': '📦'
  };

  return (
    <div className="page-container">
      <Link to="/tools" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Tools
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left - Tool details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center">
              {tool.images?.[0] ? (
                <img src={tool.images[0]} alt={tool.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{categoryEmojis[tool.category] || '🔧'}</span>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                    {tool.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    tool.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {tool.isAvailable ? 'Available' : 'Currently Rented'}
                  </span>
                </div>
                <h1 className="text-2xl font-bold">{tool.name}</h1>
              </div>
              {tool.rating?.average > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-lg">{tool.rating.average.toFixed(1)}</span>
                  <span className="text-gray-500">({tool.rating.count})</span>
                </div>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {tool.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <Package className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-semibold capitalize">{tool.condition || 'Good'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <Shield className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{tool.toolType}</p>
                </div>
              </div>
              {tool.owner?.shopName && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 sm:col-span-2">
                  <MapPin className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Shop</p>
                    <p className="font-semibold">{tool.owner.shopName}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Specifications */}
          {tool.specifications && Object.keys(tool.specifications).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl"
            >
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(tool.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="text-sm text-gray-500 capitalize">{key}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right - Rental sidebar */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl sticky top-24"
          >
            <h3 className="text-lg font-semibold mb-4">Rent This Tool</h3>

            {/* Pricing */}
            <div className="space-y-3 mb-6">
              {tool.rentPrice?.hourly && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-sm text-gray-500">Hourly Rate</span>
                  <span className="font-bold gradient-text">{formatCurrency(tool.rentPrice.hourly)}/hr</span>
                </div>
              )}
              {tool.rentPrice?.daily && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <span className="text-sm text-gray-500">Daily Rate</span>
                  <span className="font-bold gradient-text">{formatCurrency(tool.rentPrice.daily)}/day</span>
                </div>
              )}
              {tool.securityDeposit > 0 && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10">
                  <span className="text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Security Deposit
                  </span>
                  <span className="font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(tool.securityDeposit)}</span>
                </div>
              )}
            </div>

            {/* Rental form */}
            {tool.isAvailable && user?.role === 'user' ? (
              <form onSubmit={handleRental} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Start Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={rentalForm.startDate}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">End Date</label>
                  <input
                    type="date"
                    required
                    min={rentalForm.startDate || new Date().toISOString().split('T')[0]}
                    value={rentalForm.endDate}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Any special requirements..."
                    value={rentalForm.notes}
                    onChange={(e) => setRentalForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field resize-none"
                  />
                </div>

                {/* Payment method */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ value: 'cash', label: '💵 Cash' }, { value: 'online', label: '💳 Online' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRentalForm(prev => ({ ...prev, paymentMethod: opt.value }))}
                        className={`p-3 rounded-xl text-sm text-center transition-all ${
                          rentalForm.paymentMethod === opt.value
                            ? 'gradient-bg text-white shadow-lg'
                            : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total preview */}
                {getDays() > 0 && (
                  <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Duration</span>
                      <span className="font-medium">{getDays()} day(s)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Rental Cost</span>
                      <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                    </div>
                    {tool.securityDeposit > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Security Deposit</span>
                        <span className="font-medium">{formatCurrency(tool.securityDeposit)}</span>
                      </div>
                    )}
                    <div className="border-t border-primary-200 dark:border-primary-700 pt-2 flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold gradient-text text-lg">
                        {formatCurrency(calculateTotal() + (tool.securityDeposit || 0))}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || getDays() < 1}
                  className="btn-primary w-full py-3.5 ripple disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Clock className="w-5 h-5 animate-spin" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Request Rental</span>
                  )}
                </button>
              </form>
            ) : !tool.isAvailable ? (
              <div className="text-center py-6">
                <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">This tool is currently rented out</p>
              </div>
            ) : !user ? (
              <Link to="/login" className="btn-primary w-full py-3.5 block text-center">
                Sign In to Rent
              </Link>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Only users can rent tools</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ToolDetail;
