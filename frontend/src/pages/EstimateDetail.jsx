import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Clock, MapPin, Image, Film, Wrench,
  IndianRupee, Calendar, CheckCircle, XCircle, AlertCircle,
  Package, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { formatCurrency, formatDate, formatDateTime, skillIcons } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const BACKEND_URL = 'http://localhost:5000';

const EstimateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    scheduledDate: '',
    timeSlot: '10:00 - 12:00',
    paymentMethod: 'cash'
  });

  const timeSlots = [
    '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00',
    '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'
  ];

  useEffect(() => {
    fetchEstimate();
  }, [id]);

  const fetchEstimate = async () => {
    try {
      const { data } = await API.get(`/estimates/${id}`);
      setEstimate(data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load estimate');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!bookingForm.scheduledDate) {
      toast.error('Please select a date');
      return;
    }
    setAccepting(true);
    try {
      const { data } = await API.put(`/estimates/${id}/accept`, bookingForm);
      toast.success('Booking created from estimate!');
      navigate(`/booking/success/${data.data.booking._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept estimate');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await API.put(`/estimates/${id}/reject`);
      toast.success('Estimate rejected');
      fetchEstimate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    } finally {
      setRejecting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!estimate) return (
    <div className="page-container text-center">
      <p className="text-gray-500">Estimate not found</p>
      <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Back</Link>
    </div>
  );

  const techUser = estimate.technician?.user;
  const est = estimate.estimate || {};
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    estimated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    booked: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cost Estimate</h1>
            <p className="text-sm text-gray-500 mt-1">Requested {formatDateTime(estimate.createdAt)}</p>
          </div>
          <span className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize ${statusColors[estimate.status] || ''}`}>
            {estimate.status}
          </span>
        </div>

        {/* Technician */}
        <div className="glass-card p-5 rounded-2xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold shrink-0">
            {techUser?.name?.[0]}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{techUser?.name}</h3>
            <p className="text-sm text-gray-500">{techUser?.email}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl">{skillIcons[estimate.service]}</span>
            <p className="text-xs text-gray-500 font-medium">{estimate.service}</p>
          </div>
        </div>

        {/* Issue description */}
        <div className="glass-card p-5 rounded-2xl">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" /> Problem Description
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{estimate.description}</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
            <MapPin className="w-3.5 h-3.5" />
            {estimate.location?.address}
          </div>
        </div>

        {/* Media */}
        {estimate.media?.length > 0 && (
          <div className="glass-card p-5 rounded-2xl">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-400" /> Uploaded Media ({estimate.media.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {estimate.media.map((m, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  {m.type === 'photo' ? (
                    <img
                      src={`${BACKEND_URL}${m.url}`}
                      alt={m.originalName || `Photo ${i + 1}`}
                      className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(`${BACKEND_URL}${m.url}`, '_blank')}
                    />
                  ) : (
                    <video
                      src={`${BACKEND_URL}${m.url}`}
                      className="w-full h-32 object-cover"
                      controls
                    />
                  )}
                  <div className="px-2 py-1 bg-gray-50 dark:bg-gray-800 text-xs flex items-center gap-1 text-gray-500">
                    {m.type === 'photo' ? <Image className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                    <span className="truncate">{m.originalName || `File ${i + 1}`}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estimate breakdown (shown when technician has responded) */}
        {estimate.status !== 'pending' && est.totalCost > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl border-2 border-primary-200 dark:border-primary-800"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-primary-500" /> Cost Breakdown
            </h3>

            <div className="space-y-3">
              {/* Service charge */}
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Service Charge</span>
                </div>
                <span className="font-semibold">{formatCurrency(est.serviceCharge)}</span>
              </div>

              {/* Materials */}
              {est.materials?.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium">Materials & Parts</span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {est.materials.map((mat, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {mat.name} <span className="text-xs text-gray-400">×{mat.quantity} @ {formatCurrency(mat.unitPrice)}</span>
                        </span>
                        <span className="font-medium">{formatCurrency(mat.total)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="font-medium">Materials Subtotal</span>
                      <span className="font-semibold">{formatCurrency(est.materialTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                <span className="font-bold text-lg">Total Estimated Cost</span>
                <span className="font-bold text-2xl gradient-text">{formatCurrency(est.totalCost)}</span>
              </div>

              {/* Duration */}
              {est.estimatedDuration && (
                <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
                  <Clock className="w-4 h-4" />
                  <span>Estimated Duration: <strong>{est.estimatedDuration}</strong></span>
                </div>
              )}

              {/* Technician notes */}
              {est.notes && (
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 text-sm">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400 mb-1">Technician Notes:</p>
                  <p className="text-yellow-600 dark:text-yellow-300">{est.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Waiting state */}
        {estimate.status === 'pending' && (
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Waiting for Technician</h3>
            <p className="text-sm text-gray-500">The technician is reviewing your photos and will send a cost estimate soon.</p>
          </div>
        )}

        {/* Action buttons */}
        {estimate.status === 'estimated' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 rounded-2xl space-y-4"
          >
            <h3 className="font-semibold">What would you like to do?</h3>
            <p className="text-sm text-gray-500">Review the estimate above. Accept to proceed with booking or reject if the cost doesn't work for you.</p>

            <div className="flex gap-3">
              <button
                onClick={() => setBookingModal(true)}
                className="btn-primary flex-1 py-3.5"
              >
                <CheckCircle className="w-5 h-5 mr-2" /> Accept & Book
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="btn-danger flex-1 py-3.5 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5 mr-2" /> {rejecting ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Booked state */}
        {estimate.status === 'booked' && (
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Booking Created!</h3>
            <p className="text-sm text-gray-500 mb-4">Your booking has been created from this estimate.</p>
            {estimate.bookingId && (
              <Link
                to={`/booking/success/${estimate.bookingId._id || estimate.bookingId}`}
                className="btn-primary inline-flex items-center gap-2"
              >
                View Booking <ChevronLeft className="w-4 h-4 rotate-180" />
              </Link>
            )}
          </div>
        )}

        {/* Rejected state */}
        {estimate.status === 'rejected' && (
          <div className="glass-card p-8 rounded-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Estimate Rejected</h3>
            <p className="text-sm text-gray-500">You can request a new estimate from another technician.</p>
            <Link to="/technicians" className="btn-primary mt-4 inline-flex">
              Browse Technicians
            </Link>
          </div>
        )}
      </motion.div>

      {/* Booking scheduling modal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title="Schedule Your Booking"
        size="lg"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Cost</span>
              <span className="font-bold text-xl gradient-text">{formatCurrency(est.totalCost)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Calendar className="w-4 h-4 inline mr-1" /> Select Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={bookingForm.scheduledDate}
              onChange={(e) => setBookingForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-1" /> Select Time Slot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setBookingForm(prev => ({ ...prev, timeSlot: slot }))}
                  className={`p-3 rounded-xl text-sm text-center transition-all ${
                    bookingForm.timeSlot === slot
                      ? 'gradient-bg text-white shadow-lg'
                      : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'cash', label: 'Cash', icon: '💵', desc: 'Pay after service' },
                { value: 'online', label: 'Online', icon: '💳', desc: 'Pay now securely' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBookingForm(prev => ({ ...prev, paymentMethod: opt.value }))}
                  className={`p-4 rounded-xl text-center transition-all ${
                    bookingForm.paymentMethod === opt.value
                      ? 'gradient-bg text-white shadow-lg scale-[1.02]'
                      : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-2xl block mb-1">{opt.icon}</span>
                  <span className="font-medium text-sm block">{opt.label}</span>
                  <span className={`text-xs ${bookingForm.paymentMethod === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAccept}
            disabled={accepting}
            className="btn-primary w-full py-3.5 ripple disabled:opacity-50"
          >
            {accepting ? 'Creating Booking...' : `Confirm Booking — ${formatCurrency(est.totalCost)}`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EstimateDetail;
