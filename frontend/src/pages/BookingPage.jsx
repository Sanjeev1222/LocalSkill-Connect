import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar, Clock, MapPin, FileText, ChevronLeft,
  AlertCircle, CheckCircle, IndianRupee
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { formatCurrency, skillIcons, availableSkills } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';
import StarRating from '../components/StarRating';

const BookingPage = () => {
  const { techId } = useParams();
  const navigate = useNavigate();
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    service: '',
    description: '',
    scheduledDate: '',
    timeSlot: '',
    address: '',
    paymentMethod: 'cash'
  });

  const timeSlots = [
    '08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00',
    '14:00 - 16:00', '16:00 - 18:00', '18:00 - 20:00'
  ];

  useEffect(() => {
    fetchTechnician();
  }, [techId]);

  const fetchTechnician = async () => {
    try {
      const { data } = await API.get(`/technicians/${techId}`);
      setTechnician(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Parse timeSlot string "08:00 - 10:00" into { start, end }
      const [start, end] = form.timeSlot.split(' - ');

      const { data } = await API.post('/bookings', {
        technicianId: techId,
        service: form.service,
        description: form.description,
        scheduledDate: form.scheduledDate,
        timeSlot: { start, end },
        location: { address: form.address },
        paymentMethod: form.paymentMethod
      });

      // If online payment, process it
      if (form.paymentMethod === 'online' && data.data?._id) {
        try {
          const intentRes = await API.post('/payments/create-intent', {
            amount: data.data.estimatedCost,
            type: 'booking',
            referenceId: data.data._id
          });
          await API.post('/payments/confirm', {
            paymentId: intentRes.data.data.paymentId
          });
        } catch (payErr) {
          console.error('Payment processing error:', payErr);
        }
      }

      toast.success('Booking confirmed successfully!');
      navigate(`/booking/success/${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!technician) return (
    <div className="page-container text-center">
      <p className="text-gray-500">Technician not found</p>
      <Link to="/technicians" className="btn-primary mt-4 inline-flex">Back</Link>
    </div>
  );

  const techUser = technician.user;

  return (
    <div className="page-container max-w-3xl mx-auto">
      <Link to={`/technicians/${techId}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to Profile
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold mb-6">Book Service</h1>

        {/* Technician summary */}
        <div className="glass-card p-5 rounded-2xl mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-xl font-bold shrink-0">
            {techUser?.name?.[0]}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{techUser?.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <StarRating rating={technician.rating?.average || 0} readonly size="sm" />
                ({technician.rating?.count || 0})
              </span>
              <span className="font-medium">{formatCurrency(technician.chargeRate)}/{technician.chargeType === 'hourly' ? 'hr' : 'job'}</span>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                step >= s ? 'gradient-bg text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= s ? 'text-primary-600' : 'text-gray-400'}`}>
                {s === 1 ? 'Service' : s === 2 ? 'Schedule' : 'Confirm'}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Service details */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">Select Service</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {technician.skills?.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, service: skill }))}
                      className={`p-4 rounded-xl text-sm text-center transition-all ${
                        form.service === skill
                          ? 'gradient-bg text-white shadow-lg scale-[1.02]'
                          : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{skillIcons[skill]}</span>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Describe your issue</label>
                <textarea
                  rows={4}
                  placeholder="Please describe the work you need done..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field resize-none"
                  required
                />
              </div>

              <button
                type="button"
                onClick={() => form.service && form.description ? setStep(2) : toast.error('Please select a service and describe your issue')}
                className="btn-primary w-full py-3"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" /> Select Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.scheduledDate}
                  onChange={(e) => setForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
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
                      onClick={() => setForm(prev => ({ ...prev, timeSlot: slot }))}
                      className={`p-3 rounded-xl text-sm text-center transition-all ${
                        form.timeSlot === slot
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
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" /> Service Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter the address where you need the service..."
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                  className="input-field resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => form.scheduledDate && form.timeSlot ? setStep(3) : toast.error('Please select date and time')}
                  className="btn-primary flex-1 py-3"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="glass-card p-6 rounded-2xl space-y-4">
                <h3 className="font-semibold text-lg">Booking Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="text-sm text-gray-500">Service</span>
                    <span className="font-medium text-sm">{skillIcons[form.service]} {form.service}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="text-sm text-gray-500">Technician</span>
                    <span className="font-medium text-sm">{techUser?.name}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="text-sm text-gray-500">Date</span>
                    <span className="font-medium text-sm">{form.scheduledDate}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <span className="text-sm text-gray-500">Time</span>
                    <span className="font-medium text-sm">{form.timeSlot}</span>
                  </div>
                  {form.address && (
                    <div className="flex justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                      <span className="text-sm text-gray-500">Address</span>
                      <span className="font-medium text-sm text-right max-w-[60%]">{form.address}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                      <span className="font-semibold">Estimated Rate</span>
                      <span className="font-bold gradient-text text-lg">
                        {formatCurrency(technician.chargeRate)}/{technician.chargeType === 'hourly' ? 'hr' : 'job'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment method selection */}
                <div>
                  <h4 className="font-medium text-sm mb-3">Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: 'cash', label: 'Cash', icon: '💵', desc: 'Pay after service' }, { value: 'online', label: 'Online', icon: '💳', desc: 'Pay now securely' }].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, paymentMethod: opt.value }))}
                        className={`p-4 rounded-xl text-center transition-all ${
                          form.paymentMethod === opt.value
                            ? 'gradient-bg text-white shadow-lg scale-[1.02]'
                            : 'glass-card hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <span className="text-2xl block mb-1">{opt.icon}</span>
                        <span className="font-medium text-sm block">{opt.label}</span>
                        <span className={`text-xs ${
                          form.paymentMethod === opt.value ? 'text-white/70' : 'text-gray-400'
                        }`}>{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-400 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{form.paymentMethod === 'online' ? 'Payment will be processed securely online (Demo mode).' : 'Final amount will be confirmed by the technician. Pay cash after service completion.'}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 py-3 ripple disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default BookingPage;
