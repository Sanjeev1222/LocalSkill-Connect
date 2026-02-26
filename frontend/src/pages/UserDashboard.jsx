import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Package, CreditCard, Clock, Star,
  ChevronRight, MapPin, User, Filter, AlertCircle, FileText, IndianRupee
} from 'lucide-react';
import API from '../utils/api';
import { formatCurrency, formatDate, formatDateTime, getStatusColor, skillIcons } from '../utils/helpers';
import { PageLoader, EmptyState } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'estimates', label: 'Estimates', icon: FileText },
  { id: 'rentals', label: 'My Rentals', icon: Package },
  { id: 'payments', label: 'Payments', icon: CreditCard }
];

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, rentalRes, payRes, estRes] = await Promise.all([
        API.get('/bookings/my'),
        API.get('/rentals/my'),
        API.get('/payments/history'),
        API.get('/estimates/my')
      ]);
      setBookings(bookRes.data.data);
      setRentals(rentalRes.data.data);
      setPayments(payRes.data.data);
      setEstimates(estRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/reviews', {
        targetType: reviewModal.type,
        targetId: reviewModal.targetId,
        booking: reviewModal.bookingId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
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
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {bookings.length === 0 ? (
              <EmptyState
                title="No bookings yet"
                message="Browse technicians and book your first service"
                action={{ label: 'Find Technicians', link: '/technicians' }}
              />
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="glass-card p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {booking.technician?.user?.name?.[0] || 'T'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold truncate">{booking.service}</h3>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Technician: {booking.technician?.user?.name || 'N/A'}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.scheduledDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.timeSlot?.start} - {booking.timeSlot?.end}
                        </span>
                        {(booking.finalCost > 0 || booking.estimatedCost > 0) && (
                          <span className="flex items-center gap-1 font-medium text-gray-800 dark:text-gray-200">
                            {formatCurrency(booking.finalCost || booking.estimatedCost)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="btn-danger text-sm px-4 py-2"
                        >
                          Cancel
                        </button>
                      )}
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => setReviewModal({
                            type: 'technician',
                            targetId: booking.technician?._id,
                            bookingId: booking._id,
                            name: booking.technician?.user?.name
                          })}
                          className="btn-primary text-sm px-4 py-2"
                        >
                          <Star className="w-4 h-4 mr-1" /> Review
                        </button>
                      )}
                    </div>
                  </div>

                  {booking.description && (
                    <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      {booking.description}
                    </p>
                  )}

                  {/* Status Progress Tracker */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      {[
                        { key: 'pending', label: 'Pending', icon: '⏳' },
                        { key: 'confirmed', label: 'Accepted', icon: '✅' },
                        { key: 'in_progress', label: 'Out for Work', icon: '🚀' },
                        { key: 'completed', label: 'Completed', icon: '🎉' }
                      ].map((step, idx, arr) => {
                        const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed'];
                        const currentIdx = statusOrder.indexOf(booking.status);
                        const stepIdx = statusOrder.indexOf(step.key);
                        const isActive = stepIdx <= currentIdx && booking.status !== 'cancelled';
                        const isCurrent = step.key === booking.status;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                isCurrent ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-gray-800' : ''
                              } ${
                                isActive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                {step.icon}
                              </div>
                              <span className={`text-[9px] mt-0.5 font-medium text-center leading-tight ${
                                isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                              }`}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-3 mx-0.5 rounded ${
                                stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {booking.status === 'cancelled' && (
                      <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                        ❌ Booking cancelled{booking.cancellationReason ? `: ${booking.cancellationReason}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Rentals Tab */}
        {activeTab === 'rentals' && (
          <motion.div
            key="rentals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {rentals.length === 0 ? (
              <EmptyState
                title="No rentals yet"
                message="Browse tools and rent what you need"
                action={{ label: 'Browse Tools', link: '/tools' }}
              />
            ) : (
              rentals.map((rental) => (
                <div key={rental._id} className="glass-card p-5 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl shrink-0">
                      🔧
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold truncate">{rental.tool?.name || 'Tool'}</h3>
                        <StatusBadge status={rental.status} />
                      </div>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(rental.rentalPeriod?.start)} — {formatDate(rental.rentalPeriod?.end)}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          {formatCurrency(rental.totalCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rental Status Progress Tracker */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-1">
                      {[
                        { key: 'pending', label: 'Pending', icon: '⏳' },
                        { key: 'approved', label: 'Approved', icon: '✅' },
                        { key: 'active', label: 'Active', icon: '🛠️' },
                        { key: 'returned', label: 'Returned', icon: '🎉' }
                      ].map((step, idx, arr) => {
                        const statusOrder = ['pending', 'approved', 'active', 'returned'];
                        const currentIdx = statusOrder.indexOf(rental.status);
                        const stepIdx = statusOrder.indexOf(step.key);
                        const isActive = stepIdx <= currentIdx && rental.status !== 'cancelled';
                        const isCurrent = step.key === rental.status;
                        return (
                          <div key={step.key} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                isCurrent ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-gray-800' : ''
                              } ${
                                isActive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                {step.icon}
                              </div>
                              <span className={`text-[9px] mt-0.5 font-medium text-center leading-tight ${
                                isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                              }`}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-3 mx-0.5 rounded ${
                                stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {rental.status === 'cancelled' && (
                      <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                        ❌ Rental cancelled
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {payments.length === 0 ? (
              <EmptyState title="No payments yet" message="Your payment history will appear here" />
            ) : (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="text-left p-4 font-medium text-gray-500">Date</th>
                        <th className="text-left p-4 font-medium text-gray-500">Type</th>
                        <th className="text-left p-4 font-medium text-gray-500">Amount</th>
                        <th className="text-left p-4 font-medium text-gray-500">Method</th>
                        <th className="text-left p-4 font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-4">{formatDate(payment.createdAt)}</td>
                          <td className="p-4 capitalize">{payment.type}</td>
                          <td className="p-4 font-semibold">{formatCurrency(payment.amount)}</td>
                          <td className="p-4 capitalize">{payment.method}</td>
                          <td className="p-4"><StatusBadge status={payment.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Estimates Tab */}
        {activeTab === 'estimates' && (
          <motion.div
            key="estimates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {estimates.length === 0 ? (
              <EmptyState
                title="No estimate requests"
                message="Visit a technician's profile and click 'Get Cost Estimate' to send photos/videos and get a price quote"
                action={{ label: 'Find Technicians', link: '/technicians' }}
              />
            ) : (
              estimates.map((est) => (
                <Link key={est._id} to={`/estimates/${est._id}`} className="block">
                  <div className="glass-card p-5 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold shrink-0">
                        {est.technician?.user?.name?.[0] || 'T'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold truncate">
                            {skillIcons[est.service]} {est.service}
                          </h3>
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                            est.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            est.status === 'estimated' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                            est.status === 'booked' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            est.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>{est.status}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Technician: {est.technician?.user?.name || 'N/A'}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(est.createdAt)}
                          </span>
                          <span>{est.media?.length || 0} files uploaded</span>
                          {est.estimate?.totalCost > 0 && (
                            <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                              <IndianRupee className="w-3.5 h-3.5" />
                              {formatCurrency(est.estimate.totalCost)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {est.status === 'pending' && (
                          <span className="text-xs text-yellow-600 font-medium">⏳ Awaiting estimate</span>
                        )}
                        {est.status === 'estimated' && (
                          <span className="text-xs text-blue-600 font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">💰 Review Estimate</span>
                        )}
                        {est.status === 'booked' && (
                          <span className="text-xs text-green-600 font-medium">✅ Booked</span>
                        )}
                        <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-1">
                        {[
                          { key: 'pending', label: 'Requested', icon: '📷' },
                          { key: 'estimated', label: 'Estimated', icon: '💰' },
                          { key: 'booked', label: 'Booked', icon: '✅' }
                        ].map((step, idx, arr) => {
                          const statusOrder = ['pending', 'estimated', 'booked'];
                          const currentIdx = statusOrder.indexOf(est.status);
                          const stepIdx = statusOrder.indexOf(step.key);
                          const isActive = stepIdx <= currentIdx && est.status !== 'rejected';
                          const isCurrent = step.key === est.status;
                          return (
                            <div key={step.key} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                  isCurrent ? 'ring-2 ring-primary-400 ring-offset-1 dark:ring-offset-gray-800' : ''
                                } ${
                                  isActive ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'
                                }`}>{step.icon}</div>
                                <span className={`text-[9px] mt-0.5 font-medium text-center leading-tight ${
                                  isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                                }`}>{step.label}</span>
                              </div>
                              {idx < arr.length - 1 && (
                                <div className={`h-0.5 flex-1 -mt-3 mx-0.5 rounded ${
                                  stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {est.status === 'rejected' && (
                        <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs text-center font-medium">
                          ❌ Estimate rejected
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => setReviewModal(null)}
        title={`Review ${reviewModal?.name || ''}`}
      >
        <form onSubmit={handleReview} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <StarRating
              rating={reviewForm.rating}
              onChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <textarea
              rows={4}
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
              className="input-field resize-none"
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 disabled:opacity-50">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default UserDashboard;
