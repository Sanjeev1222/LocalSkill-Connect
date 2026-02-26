import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Star, MapPin, Clock, ChevronDown,
  Briefcase, IndianRupee, X, Sparkles, Brain, TrendingDown,
  Award, Zap
} from 'lucide-react';
import API from '../utils/api';
import { formatCurrency, skillIcons, availableSkills } from '../utils/helpers';
import { CardSkeleton, EmptyState } from '../components/LoadingStates';
import AISearchLoader from '../components/AISearchLoader';
import StarRating from '../components/StarRating';
import toast from 'react-hot-toast';

const AI_PRIORITIES = [
  { value: 'cost_saving', label: '💰 Cost Saving', icon: TrendingDown, desc: 'Find the most affordable options' },
  { value: 'best_rated', label: '⭐ Best Rated', icon: Award, desc: 'Top-rated professionals' },
  { value: 'most_experienced', label: '🏆 Most Experienced', icon: Briefcase, desc: 'Maximum experience' },
  { value: 'best_value', label: '⚡ Best Value', icon: Zap, desc: 'Best balance of price & quality' }
];

const TechnicianList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({});

  // AI search state
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPriority, setAiPriority] = useState('best_value');
  const [aiSummary, setAiSummary] = useState('');
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  const [filters, setFilters] = useState({
    skill: searchParams.get('skill') || '',
    minPrice: '', maxPrice: '',
    minExp: '', minRating: '',
    sortBy: 'rating'
  });

  useEffect(() => {
    if (aiMode) {
      fetchAITechnicians();
    } else {
      fetchTechnicians();
    }
  }, [filters, aiMode, aiPriority]);

  const fetchTechnicians = async () => {
    setLoading(true);
    setAiSummary('');
    try {
      const params = {};
      if (filters.skill) params.skill = filters.skill;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minExp) params.minExp = filters.minExp;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sortBy) params.sortBy = filters.sortBy;

      const { data } = await API.get('/technicians', { params });
      setTechnicians(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching technicians:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({ skill: '', minPrice: '', maxPrice: '', minExp: '', minRating: '', sortBy: 'rating' });
    setSearchParams({});
  };

  const toggleAiMode = () => {
    setAiMode(!aiMode);
  };

  const fetchAITechnicians = async () => {
    setAiLoading(true);
    setAiSummary('');
    try {
      const params = { priority: aiPriority };
      if (filters.skill) params.skill = filters.skill;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minExp) params.minExp = filters.minExp;
      if (filters.minRating) params.minRating = filters.minRating;

      const { data } = await API.get('/ai/technicians', { params });
      setTechnicians(data.data);
      setPagination(data.pagination);
      setAiSummary(data.aiSummary);
      setTotalAnalyzed(data.totalAnalyzed || 0);
    } catch (error) {
      console.error('AI search error:', error);
      toast.error('AI search failed. Falling back to normal search.');
      setAiMode(false);
    } finally {
      setAiLoading(false);
    }
  };

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'rating').length;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="section-title">Find <span className="gradient-text">Technicians</span></h1>
        <p className="section-subtitle">Browse verified local service professionals</p>
      </motion.div>

      {/* AI Mode Toggle Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
          aiMode
            ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:border-primary-300'
        }`}
        onClick={toggleAiMode}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              aiMode ? 'gradient-bg' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <Brain className={`w-5 h-5 ${aiMode ? 'text-white' : 'text-gray-500'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                AI Smart Search
                <Sparkles className={`w-4 h-4 ${aiMode ? 'text-primary-500' : 'text-gray-400'}`} />
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Let AI compare & find the best technicians for you
              </p>
            </div>
          </div>
          <div className={`w-12 h-7 rounded-full transition-all relative ${
            aiMode ? 'gradient-bg' : 'bg-gray-300 dark:bg-gray-600'
          }`}>
            <motion.div
              className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-md"
              animate={{ left: aiMode ? 26 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>
      </motion.div>

      {/* AI Priority Selector */}
      <AnimatePresence>
        {aiMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="glass-card p-4 rounded-2xl">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-500" />
                What matters most to you?
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {AI_PRIORITIES.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.value}
                      onClick={(e) => { e.stopPropagation(); setAiPriority(p.value); }}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        aiPriority === p.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${aiPriority === p.value ? 'text-primary-600' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{p.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 rounded-2xl mb-6 flex flex-col sm:flex-row gap-4"
      >
        {/* Skill filter */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filters.skill}
            onChange={(e) => setFilters(f => ({ ...f, skill: e.target.value }))}
            className="input-field pl-12 appearance-none"
          >
            <option value="">All Services</option>
            {availableSkills.map(s => (
              <option key={s} value={s}>{skillIcons[s]} {s}</option>
            ))}
          </select>
        </div>

        {/* Sort (non-AI mode only) */}
        {!aiMode && (
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters(f => ({ ...f, sortBy: e.target.value }))}
            className="input-field w-full sm:w-48"
          >
            <option value="rating">Top Rated</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="experience">Most Experienced</option>
          </select>
        )}

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary px-4 py-3 relative ${showFilters ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
        >
          <Filter className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-bg text-white text-xs flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </motion.div>

      {/* Expanded Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card p-6 rounded-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Advanced Filters</h3>
            <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline flex items-center gap-1">
              <X className="w-4 h-4" /> Clear All
            </button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Min Price (₹)</label>
              <input type="number" value={filters.minPrice}
                onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                placeholder="0" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Max Price (₹)</label>
              <input type="number" value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                placeholder="5000" className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Min Experience (yr)</label>
              <input type="number" value={filters.minExp}
                onChange={(e) => setFilters(f => ({ ...f, minExp: e.target.value }))}
                placeholder="0" className="input-field" />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
            <div className="flex gap-2">
              {[0, 3, 3.5, 4, 4.5].map((r) => (
                <button key={r} onClick={() => setFilters(f => ({ ...f, minRating: r === 0 ? '' : r }))}
                  className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                    (filters.minRating || 0) == r
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                  {r === 0 ? 'Any' : `${r}+ ⭐`}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* AI Summary Banner */}
      <AnimatePresence>
        {aiMode && aiSummary && !aiLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 border border-primary-200 dark:border-primary-800"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{aiSummary}</p>
                {totalAnalyzed > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Analyzed {totalAnalyzed} technicians to find the best matches
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {aiLoading ? (
        <AISearchLoader type="technicians" />
      ) : loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : technicians.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No technicians found"
          description="Try adjusting your filters or search criteria"
          action={<button onClick={clearFilters} className="btn-primary">Clear Filters</button>}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {technicians.map((tech, index) => (
            <motion.div
              key={tech._id}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Link to={`/technicians/${tech._id}`} className="block glass-card p-6 rounded-2xl hover:shadow-card-hover transition-all duration-300 relative">
                {/* AI Score Badge */}
                {aiMode && tech.aiScore !== undefined && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                      tech.aiMatch === 'Excellent Match'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        : tech.aiMatch === 'Good Match'
                          ? 'bg-gradient-to-r from-blue-500 to-primary-500 text-white'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      {tech.aiScore}% Match
                    </div>
                  </div>
                )}

                {/* AI Rank Badge */}
                {aiMode && index < 3 && (
                  <div className="absolute -top-2 -left-2 z-10">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-sm font-bold shadow-lg">
                      #{index + 1}
                    </div>
                  </div>
                )}

                {/* Top */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {tech.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{tech.user?.name}</h3>
                      {tech.isVerified && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{tech.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span className="text-xs text-gray-500">({tech.rating?.count || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights */}
                {aiMode && tech.aiInsights && tech.aiInsights.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800">
                    {tech.aiInsights.map((insight, i) => (
                      <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                        {insight}
                      </p>
                    ))}
                  </div>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tech.skills?.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2.5 py-1 text-xs rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium">
                      {skillIcons[skill]} {skill}
                    </span>
                  ))}
                  {tech.skills?.length > 3 && (
                    <span className="px-2.5 py-1 text-xs rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      +{tech.skills.length - 3}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{tech.experience} yrs exp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    <span>{formatCurrency(tech.chargeRate)}/{tech.chargeType === 'hourly' ? 'hr' : 'job'}</span>
                  </div>
                  {tech.user?.location?.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{tech.user.location.city}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{tech.completedJobs} jobs done</span>
                  </div>
                </div>

                {tech._doc?.distance !== undefined && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {tech._doc.distance} km away
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                pagination.page === i + 1
                  ? 'gradient-bg text-white'
                  : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TechnicianList;
