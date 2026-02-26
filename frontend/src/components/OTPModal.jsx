import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import Modal from './Modal';

const OTPModal = ({ isOpen, onClose, onVerify, onResend, title = 'Enter OTP', subtitle = '', loading = false }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setTimer(300);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== 6) return;
    onVerify(code);
  };

  const handleResend = async () => {
    if (!onResend || resending) return;
    setResending(true);
    try {
      await onResend();
      setTimer(300);
      setOtp(['', '', '', '', '', '']);
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isComplete = otp.every(d => d !== '');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="text-center py-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4"
        >
          <ShieldCheck className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-xl font-bold mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mb-6">{subtitle}</p>}

        {/* OTP Input */}
        <div className="flex justify-center gap-2.5 mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                digit
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400'
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              } focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-800`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="mb-5">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              OTP expires in <span className="font-semibold text-primary-600">{formatTimer(timer)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-500 font-medium">OTP expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete || loading || timer <= 0}
          className="btn-primary w-full py-3.5 mb-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Verify OTP'
          )}
        </button>

        {/* Resend */}
        {onResend && (
          <button
            onClick={handleResend}
            disabled={resending || timer > 270}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            Resend OTP
          </button>
        )}
      </div>
    </Modal>
  );
};

export default OTPModal;
