import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCall } from '../context/CallContext';

const IncomingCall = () => {
  const navigate = useNavigate();
  const { incomingCall, callStatus, acceptCall, rejectCall } = useCall();

  const show = callStatus === 'ringing' && incomingCall;

  const handleAccept = () => {
    acceptCall();
    navigate(`/video-call/${incomingCall.roomId}`);
  };

  const handleReject = () => {
    rejectCall();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[380px] max-w-[calc(100%-2rem)]"
        >
          <div className="bg-gray-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            {/* Animated gradient bar */}
            <div className="h-1 bg-gradient-to-r from-green-400 via-primary-500 to-green-400 bg-[length:200%_auto] animate-pulse" />

            <div className="p-5">
              <div className="flex items-center gap-4 mb-4">
                {/* Avatar */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold shrink-0 ring-2 ring-green-400/50 ring-offset-2 ring-offset-gray-900"
                >
                  {incomingCall.callerName?.[0]?.toUpperCase() || '?'}
                </motion.div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-base truncate">
                    {incomingCall.callerName || 'Unknown Caller'}
                  </p>
                  <div className="flex items-center gap-1.5 text-green-400 text-sm">
                    <Video className="w-4 h-4" />
                    <span>Incoming Video Call</span>
                  </div>
                </div>

                {/* Pulsing phone icon */}
                <motion.div
                  animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                >
                  <Phone className="w-6 h-6 text-green-400" />
                </motion.div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                {/* Reject */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors"
                >
                  <PhoneOff className="w-5 h-5" />
                  Decline
                </motion.button>

                {/* Accept */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-sm transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Accept
                </motion.button>
              </div>
            </div>
          </div>

          {/* Audio */}
          <audio autoPlay loop>
            <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==" type="audio/wav" />
          </audio>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IncomingCall;
