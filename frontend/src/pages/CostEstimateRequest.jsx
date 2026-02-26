import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera, Video, Upload, X, ChevronLeft, MapPin,
  FileText, AlertCircle, Image, Film
} from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../utils/api';
import { skillIcons } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';
import StarRating from '../components/StarRating';
import { formatCurrency } from '../utils/helpers';

const CostEstimateRequest = () => {
  const { techId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [technician, setTechnician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [form, setForm] = useState({
    service: '',
    description: '',
    address: ''
  });

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

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error(`${file.name} is not a supported format`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, {
          url: reader.result,
          name: file.name,
          type: file.type.startsWith('video/') ? 'video' : 'photo',
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.service) {
      toast.error('Please select a service');
      return;
    }
    if (!form.description) {
      toast.error('Please describe the issue');
      return;
    }
    if (files.length === 0) {
      toast.error('Please upload at least one photo or video');
      return;
    }
    if (!form.address) {
      toast.error('Please enter your address');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('technicianId', techId);
      formData.append('service', form.service);
      formData.append('description', form.description);
      formData.append('address', form.address);
      files.forEach(file => formData.append('media', file));

      await API.post('/estimates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Estimate request sent! The technician will review and respond.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send estimate request');
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
        <h1 className="text-2xl font-bold mb-2">Get Cost Estimate</h1>
        <p className="text-gray-500 text-sm mb-6">Upload photos/videos of the issue and get a detailed cost breakdown before booking.</p>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service selection */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-1" /> Describe the issue
            </label>
            <textarea
              rows={4}
              placeholder="Describe the problem in detail — what's broken, what you need fixed, any urgency..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="input-field resize-none"
              required
            />
          </div>

          {/* Media upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Camera className="w-4 h-4 inline mr-1" /> Upload Photos & Videos
            </label>
            <p className="text-xs text-gray-500 mb-3">Upload up to 5 files (photos or videos, max 50MB each). This helps the technician assess the issue accurately.</p>

            {/* Upload area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all"
            >
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, MP4, WebM, MOV (max 50MB)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Preview thumbnails */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {preview.type === 'photo' ? (
                      <img src={preview.url} alt={preview.name} className="w-full h-32 object-cover" />
                    ) : (
                      <div className="w-full h-32 bg-gray-900 flex items-center justify-center relative">
                        <video src={preview.url} className="w-full h-full object-cover opacity-60" />
                        <Film className="w-8 h-8 text-white absolute" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                        className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-white text-xs flex justify-between items-center">
                      <span className="flex items-center gap-1 truncate">
                        {preview.type === 'photo' ? <Image className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                        {preview.name}
                      </span>
                      <span>{preview.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">{files.length}/5 files selected</p>
          </div>

          {/* Address */}
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
              required
            />
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">How it works</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
                <li>The technician reviews your photos/videos</li>
                <li>They send back a cost breakdown — service charge + materials (wire, pipe, etc.)</li>
                <li>You review the estimate and can accept to proceed to booking, or reject</li>
                <li>No commitment until you accept</li>
              </ul>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3.5 ripple disabled:opacity-50"
          >
            {submitting ? 'Sending Request...' : '📨 Send Estimate Request'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CostEstimateRequest;
