import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, MapPin, Clock, Briefcase, Phone, Mail,
  Calendar, IndianRupee, Shield, ChevronRight, Camera, Video
} from 'lucide-react';
import API from '../utils/api';
import { formatCurrency, skillIcons, formatDate } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';

const TechnicianProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { initiateCall, callStatus, activeCall } = useCall();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navigate to video call page when call is initiated and roomId is received
  useEffect(() => {
    if (activeCall?.roomId && activeCall?.isCaller && callStatus === 'ringing') {
      navigate(`/video-call/${activeCall.roomId}`);
    }
  }, [activeCall?.roomId, activeCall?.isCaller, callStatus]);

  useEffect(() => {
    fetchTechnician();
  }, [id]);

  const fetchTechnician = async () => {
    try {
      const { data } = await API.get(`/technicians/${id}`);
      setTechnician(data.data);
    } catch (error) {
      console.error('Error fetching technician:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!technician) return <div className="page-container text-center">Technician not found</div>;

  const { user: techUser, reviews } = technician;

  return (
    <div className="page-container">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-3xl"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center text-white text-3xl font-bold shrink-0">
                {techUser?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{techUser?.name}</h1>
                  {technician.isVerified && (
                    <span className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold">
                      <Shield className="w-3.5 h-3.5" /> Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    {technician.rating?.average?.toFixed(1)} ({technician.rating?.count} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {technician.experience} years exp
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {technician.completedJobs} jobs
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {technician.skills?.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 text-sm rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium">
                      {skillIcons[skill]} {skill}
                    </span>
                  ))}
                </div>

                {technician.bio && (
                  <p className="text-gray-600 dark:text-gray-400">{technician.bio}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <IndianRupee className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Charge Rate</p>
                  <p className="font-semibold">{formatCurrency(technician.chargeRate)} / {technician.chargeType === 'hourly' ? 'hour' : 'job'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{techUser?.location?.city || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <MapPin className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Service Radius</p>
                  <p className="font-semibold">{technician.serviceRadius} km</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <div className={`w-3 h-3 rounded-full ${technician.availability?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-semibold">{technician.availability?.isOnline ? 'Online' : 'Offline'}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Availability */}
          {technician.availability?.slots?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl"
            >
              <h2 className="text-lg font-semibold mb-4">Availability</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {technician.availability.slots.map((slot, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30 text-center">
                    <p className="text-sm font-semibold">{slot.day}</p>
                    <p className="text-xs text-gray-500">{slot.startTime} - {slot.endTime}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h2 className="text-lg font-semibold mb-4">Reviews ({technician.rating?.count || 0})</h2>

            {reviews?.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                        {review.user?.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.user?.name}</p>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <span className="ml-auto text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet</p>
            )}
          </motion.div>
        </div>

        {/* Right - Booking sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl sticky top-24"
          >
            <h3 className="text-lg font-semibold mb-4">Book This Technician</h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <span className="text-sm text-gray-500">Rate</span>
                <span className="font-bold text-lg gradient-text">
                  {formatCurrency(technician.chargeRate)}
                  <span className="text-sm text-gray-500 font-normal">/{technician.chargeType === 'hourly' ? 'hr' : 'job'}</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <span className="text-sm text-gray-500">Response Time</span>
                <span className="font-medium text-sm">Usually within 30 min</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`flex items-center gap-1.5 text-sm font-medium ${
                  technician.availability?.isOnline ? 'text-green-600' : 'text-gray-500'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${technician.availability?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {technician.availability?.isOnline ? 'Available' : 'Offline'}
                </span>
              </div>
            </div>

            {user?.role === 'user' ? (
              <div className="space-y-3">
                <Link
                  to={`/book/${technician._id}`}
                  className="btn-primary w-full py-3.5 ripple"
                >
                  <Calendar className="w-5 h-5 mr-2" /> Book Now
                </Link>
                <Link
                  to={`/estimate/${technician._id}`}
                  className="btn-secondary w-full py-3.5 flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" /> Get Cost Estimate
                </Link>
                <button
                  onClick={() => {
                    if (!technician?.user?._id) return;
                    initiateCall(technician.user._id, technician._id, user?.name);
                  }}
                  disabled={callStatus !== 'idle'}
                  className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
                >
                  <Video className="w-5 h-5" /> Video Consult
                </button>
                <p className="text-xs text-gray-400 text-center">Upload photos/videos to get a detailed cost breakdown first</p>
              </div>
            ) : !user ? (
              <Link to="/login" className="btn-primary w-full py-3.5">
                Sign In to Book
              </Link>
            ) : (
              <p className="text-sm text-gray-500 text-center">Switch to a user account to book</p>
            )}

            {/* Contact info */}
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
              {techUser?.phone && (
                <a href={`tel:${techUser.phone}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  <Phone className="w-4 h-4" /> {techUser.phone}
                </a>
              )}
              {techUser?.email && (
                <a href={`mailto:${techUser.email}`} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  <Mail className="w-4 h-4" /> {techUser.email}
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianProfile;
