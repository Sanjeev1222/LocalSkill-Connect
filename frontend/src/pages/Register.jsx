import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Eye, EyeOff, MapPin, Wrench, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { availableSkills, validatePhone } from '../utils/helpers';
import OTPModal from '../components/OTPModal';
import API from '../utils/api';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'user',
    // Location
    address: '', city: '', state: '',
    // Technician fields
    skills: [], experience: '', chargeRate: '', chargeType: 'hourly',
    serviceRadius: 10, bio: '',
    // Tool owner fields
    shopName: '', description: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpModal, setOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const update = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'phone') {
      const { valid, message } = validatePhone(value);
      setPhoneError(valid ? '' : message);
      // Reset OTP verification if phone changes
      if (otpVerified) setOtpVerified(false);
    }
  };

  const handlePhoneValidation = () => {
    const { valid, message } = validatePhone(formData.phone);
    if (!valid) {
      setPhoneError(message);
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!formData.phone || !handlePhoneValidation()) return;
    try {
      const { data } = await API.post('/auth/send-otp', { phone: formData.phone });
      setOtpModal(true);
      // Show demo OTP toast in bottom corner
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
      toast.success('OTP sent to your phone!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const handleVerifyOTP = async (otp) => {
    setOtpLoading(true);
    try {
      await API.post('/auth/verify-otp', { phone: formData.phone, otp });
      setOtpVerified(true);
      setOtpModal(false);
      toast.success('Phone verified successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleSignIn = useCallback(async (response) => {
    try {
      setLoading(true);
      const userData = await googleLogin({
        googleId: response.credential ? undefined : response.sub,
        email: response.email,
        name: response.name,
        credential: response.credential
      });
      toast.success(`Welcome, ${userData.name}!`);
      const dashboardPath = userData.role === 'technician' ? '/technician/dashboard'
        : userData.role === 'toolowner' ? '/toolowner/dashboard'
        : '/dashboard';
      setTimeout(() => navigate(dashboardPath, { replace: true }), 100);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    // Initialize Google Sign-In
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          // Decode JWT token from Google
          const base64Url = response.credential.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join(''));
          const decoded = JSON.parse(jsonPayload);
          handleGoogleSignIn({
            credential: response.credential,
            googleId: decoded.sub,
            email: decoded.email,
            name: decoded.name
          });
        }
      });
    }
  }, [handleGoogleSignIn]);

  const renderGoogleButton = () => {
    setTimeout(() => {
      const btnContainer = document.getElementById('google-signup-btn');
      if (btnContainer && window.google?.accounts?.id) {
        btnContainer.innerHTML = '';
        window.google.accounts.id.renderButton(btnContainer, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signup_with',
          shape: 'pill'
        });
      }
    }, 100);
  };

  useEffect(() => {
    if (step === 1) renderGoogleButton();
  }, [step]);

  const toggleSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // Default Delhi coordinates
          address: formData.address,
          city: formData.city,
          state: formData.state
        }
      };

      if (formData.role === 'technician') {
        payload.skills = formData.skills;
        payload.experience = Number(formData.experience);
        payload.chargeRate = Number(formData.chargeRate);
        payload.chargeType = formData.chargeType;
        payload.serviceRadius = Number(formData.serviceRadius);
        payload.bio = formData.bio;
      }

      if (formData.role === 'toolowner') {
        payload.shopName = formData.shopName;
        payload.description = formData.description;
      }

      const userData = await register(payload);
      toast.success('Account created successfully!');

      // Use replace to prevent going back to register page
      const dashboardPath = userData.role === 'technician' ? '/technician/dashboard'
        : userData.role === 'toolowner' ? '/toolowner/dashboard'
        : '/dashboard';
      
      // Small delay to ensure auth state propagates before navigation
      setTimeout(() => navigate(dashboardPath, { replace: true }), 100);
    } catch (error) {
      const msg = error.response?.data?.message || (error.code === 'ERR_NETWORK' ? 'Cannot connect to server. Please make sure the backend is running.' : 'Registration failed. Please try again.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'user', label: 'User', desc: 'Book technicians & rent tools', icon: '👤' },
    { value: 'technician', label: 'Technician', desc: 'Offer your services', icon: '🔧' },
    { value: 'toolowner', label: 'Tool Owner', desc: 'Rent out your tools', icon: '🛠️' }
  ];

  const maxSteps = formData.role === 'user' ? 2 : 3;

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card p-8 rounded-3xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Create Account</h1>
            <p className="text-gray-500 text-sm">Step {step} of {maxSteps}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-8">
            {Array.from({ length: maxSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < step ? 'gradient-bg' : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {/* Role selection */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {roles.map((r) => (
                    <button
                      key={r.value} type="button"
                      onClick={() => update('role', r.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.role === r.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{r.icon}</span>
                      <p className="text-xs font-semibold">{r.label}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={formData.name} onChange={(e) => update('name', e.target.value)}
                      placeholder="Full Name" required className="input-field pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="email" value={formData.email} onChange={(e) => update('email', e.target.value)}
                      placeholder="you@example.com" required className="input-field pl-12" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type={showPassword ? 'text' : 'password'} value={formData.password}
                      onChange={(e) => update('password', e.target.value)}
                      placeholder="Minimum 6 characters" required minLength={6} className="input-field pl-12 pr-12" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="tel" value={formData.phone} onChange={(e) => update('phone', e.target.value)}
                      placeholder="9876543210" maxLength={10}
                      className={`input-field pl-12 ${phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''} ${otpVerified ? 'border-green-400 bg-green-50 dark:bg-green-900/10' : ''}`} />
                    {otpVerified && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm font-medium">✓ Verified</span>
                    )}
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <span>⚠</span> {phoneError}
                    </p>
                  )}
                  {formData.phone && !phoneError && formData.phone.replace(/\D/g, '').length === 10 && !otpVerified && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="text-primary-600 text-xs font-semibold mt-1.5 hover:text-primary-700 transition-colors"
                    >
                      Verify with OTP →
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => {
                  if (!handlePhoneValidation()) return;
                  setStep(2);
                }}
                  disabled={!formData.name || !formData.email || !formData.password}
                  className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50">
                  Continue
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-gray-800 text-gray-500">or continue with</span>
                  </div>
                </div>

                {/* Google Sign-In */}
                <div id="google-signup-btn" className="flex justify-center min-h-[44px]">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.google?.accounts?.id) {
                        window.google.accounts.id.prompt();
                      } else {
                        toast.error('Google Sign-In not loaded. Check your internet connection.');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all font-medium text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Sign up with Google
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input type="text" value={formData.address} onChange={(e) => update('address', e.target.value)}
                      placeholder="Your address" className="input-field pl-12" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">City</label>
                    <input type="text" value={formData.city} onChange={(e) => update('city', e.target.value)}
                      placeholder="City" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">State</label>
                    <input type="text" value={formData.state} onChange={(e) => update('state', e.target.value)}
                      placeholder="State" className="input-field" />
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">Back</button>
                  {formData.role === 'user' ? (
                    <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 ripple disabled:opacity-50">
                      {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                    </button>
                  ) : (
                    <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1 py-3">Continue</button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Role-specific */}
            {step === 3 && formData.role === 'technician' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Select Your Skills</label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSkills.map((skill) => (
                      <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          formData.skills.includes(skill)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Experience (years)</label>
                    <input type="number" value={formData.experience} onChange={(e) => update('experience', e.target.value)}
                      placeholder="0" min="0" required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Charge Rate (₹)</label>
                    <input type="number" value={formData.chargeRate} onChange={(e) => update('chargeRate', e.target.value)}
                      placeholder="500" min="0" required className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Charge Type</label>
                  <select value={formData.chargeType} onChange={(e) => update('chargeType', e.target.value)}
                    className="input-field">
                    <option value="hourly">Per Hour</option>
                    <option value="per_job">Per Job</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Bio</label>
                  <textarea value={formData.bio} onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell customers about yourself..." rows={3} className="input-field" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" disabled={loading || formData.skills.length === 0}
                    className="btn-primary flex-1 py-3 ripple disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && formData.role === 'toolowner' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Shop Name</label>
                  <input type="text" value={formData.shopName} onChange={(e) => update('shopName', e.target.value)}
                    placeholder="Your Shop Name" required className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Description</label>
                  <textarea value={formData.description} onChange={(e) => update('description', e.target.value)}
                    placeholder="Describe your tool rental business..." rows={4} className="input-field" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">Back</button>
                  <button type="submit" disabled={loading || !formData.shopName}
                    className="btn-primary flex-1 py-3 ripple disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
                  </button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={otpModal}
        onClose={() => setOtpModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleSendOTP}
        title="Verify Phone Number"
        subtitle={`Enter the 6-digit OTP sent to ${formData.phone}`}
        loading={otpLoading}
      />
    </div>
  );
};

export default Register;
