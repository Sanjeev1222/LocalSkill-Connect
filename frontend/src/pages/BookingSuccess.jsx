import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Calendar, Clock, MapPin, User,
  IndianRupee, ArrowRight, Home, CreditCard
} from 'lucide-react';
import API from '../utils/api';
import { formatCurrency, formatDate, skillIcons } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const { data } = await API.get(`/bookings/${bookingId}`);
      setBooking(data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!booking) {
    return (
      <div className="page-container text-center py-20">
        <p className="text-gray-500 text-lg">Booking not found</p>
        <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Go to Dashboard</Link>
      </div>
    );
  }

  const techName = booking.technician?.user?.name || 'Technician';

  return (
    <div className="page-container max-w-2xl mx-auto py-12">
      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            <CheckCircle className="w-14 h-14 text-green-500" />
          </motion.div>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl font-bold mb-2"
        >
          Booking Confirmed! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 dark:text-gray-400"
        >
          Your service has been booked successfully
        </motion.p>
      </motion.div>

      {/* Booking details card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6 rounded-2xl mb-6"
      >
        <h2 className="font-semibold text-lg mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
          Booking Details
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white text-lg font-bold shrink-0">
              {techName[0]}
            </div>
            <div>
              <p className="font-semibold">{techName}</p>
              <p className="text-sm text-gray-500">
                {skillIcons[booking.service]} {booking.service}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <Calendar className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-sm">{formatDate(booking.scheduledDate)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <Clock className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium text-sm">
                  {booking.timeSlot?.start} - {booking.timeSlot?.end}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <MapPin className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-sm">{booking.location?.address || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Payment</p>
                <p className="font-medium text-sm capitalize">{booking.paymentMethod}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20">
              <span className="font-semibold">Estimated Cost</span>
              <span className="font-bold text-xl gradient-text">
                {formatCurrency(booking.estimatedCost)}
              </span>
            </div>
          </div>
        </div>

        {booking.description && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
            <p className="text-xs text-gray-500 mb-1">Description</p>
            <p className="text-sm">{booking.description}</p>
          </div>
        )}
      </motion.div>

      {/* Status info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card p-5 rounded-2xl mb-8"
      >
        <h3 className="font-medium text-sm mb-3 text-gray-600 dark:text-gray-400">What happens next?</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'The technician will review and confirm your booking', done: true },
            { step: '2', text: 'You will receive a confirmation notification' },
            { step: '3', text: 'The technician will arrive at the scheduled time' },
            { step: '4', text: 'Pay after the service is completed' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                item.done ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-700'
              }`}>
                {item.done ? <CheckCircle className="w-4 h-4" /> : item.step}
              </div>
              <p className="text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link to="/dashboard" className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">
          <Calendar className="w-5 h-5" /> View My Bookings
        </Link>
        <Link to="/technicians" className="btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2">
          <Home className="w-5 h-5" /> Browse More
        </Link>
      </motion.div>
    </div>
  );
};

export default BookingSuccess;
