import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, ChevronDown, MapPin, Star,
  Package, IndianRupee, Tag, X, Sparkles, Brain,
  TrendingDown, Award, Zap, Shield
} from 'lucide-react';
import API from '../utils/api';
import { formatCurrency, toolCategories } from '../utils/helpers';
import { CardSkeleton, EmptyState } from '../components/LoadingStates';
import AISearchLoader from '../components/AISearchLoader';
import toast from 'react-hot-toast';

const AI_TOOL_PRIORITIES = [
  { value: 'cost_saving', label: '💰 Cost Saving', icon: TrendingDown, desc: 'Find cheapest rental options' },
  { value: 'best_rated', label: '⭐ Best Rated', icon: Award, desc: 'Top-rated tools' },
  { value: 'best_condition', label: '✨ Best Condition', icon: Shield, desc: 'Newest & best condition' },
  { value: 'best_value', label: '⚡ Best Value', icon: Zap, desc: 'Best price-quality balance' }
];

const ToolList = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [toolType, setToolType] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // AI search state
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPriority, setAiPriority] = useState('best_value');
  const [aiSummary, setAiSummary] = useState('');
  const [totalAnalyzed, setTotalAnalyzed] = useState(0);

  useEffect(() => {
    if (aiMode) {
      fetchAITools();
    } else {
      fetchTools();
    }
  }, [category, toolType, sort, page, aiMode, aiPriority]);

  const fetchTools = async () => {
    setLoading(true);
    setAiSummary('');
    try {
      let url = `/tools?page=${page}&sortBy=${sort}`;
      if (category) url += `&category=${category}`;
      if (toolType) url += `&toolType=${toolType}`;
      if (search) url += `&search=${search}`;
      if (priceRange.min) url += `&minPrice=${priceRange.min}`;
      if (priceRange.max) url += `&maxPrice=${priceRange.max}`;

      const { data } = await API.get(url);
      setTools(data.data);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching tools:', error);
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Please make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    if (aiMode) {
      fetchAITools();
    } else {
      fetchTools();
    }
  };

  const fetchAITools = async () => {
    setAiLoading(true);
    setAiSummary('');
    try {
      const params = { priority: aiPriority };
      if (category) params.category = category;
      if (toolType) params.toolType = toolType;
      if (search) params.search = search;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      params.page = page;

      const { data } = await API.get('/ai/tools', { params });
      setTools(data.data);
      setPagination(data.pagination || {});
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

  const clearFilters = () => {
    setCategory('');
    setToolType('');
    setSort('newest');
    setSearch('');
    setPriceRange({ min: '', max: '' });
    setPage(1);
  };

  const categoryEmojis = {
    'Power Tools': '⚡', 'Hand Tools': '🔨', 'Gardening': '🌱',
    'Cleaning': '🧹', 'Painting': '🎨', 'Plumbing': '🔧',
    'Electrical': '💡', 'Automotive': '🚗', 'Woodworking': '🪵',
    'Measuring': '📏', 'Safety': '🦺', 'Ladders': '🪜', 'Other': '📦'
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Rent <span className="gradient-text">Tools & Equipment</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Browse our collection of tools and equipment available for rent
        </p>
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
        onClick={() => setAiMode(!aiMode)}
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
                Let AI compare & find the best tool deals for you
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
                {AI_TOOL_PRIORITIES.map((p) => {
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

      {/* Search & Filters */}
      <div className="glass-card p-4 rounded-2xl mb-8">
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary px-4"
          >
            <Filter className="w-5 h-5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-3">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Categories</option>
            {toolCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={toolType} onChange={(e) => { setToolType(e.target.value); setPage(1); }} className="input-field w-auto">
            <option value="">All Types</option>
            <option value="technical">Technical</option>
            <option value="non-technical">Non-Technical</option>
          </select>
          {!aiMode && (
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field w-auto">
              <option value="newest">Newest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          )}
          {(category || toolType || search || priceRange.min || priceRange.max) && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:underline flex items-center gap-1">
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Price (₹/day)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Max Price (₹/day)</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            !category ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {toolCategories.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              category === cat ? 'gradient-bg text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            {categoryEmojis[cat]} {cat}
          </button>
        ))}
      </div>

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
                    Analyzed {totalAnalyzed} tools to find the best deals
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tools Grid */}
      {aiLoading ? (
        <AISearchLoader type="tools" />
      ) : loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tools.length === 0 ? (
        <EmptyState title="No tools found" description="Try adjusting your search or filters" />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={`/tools/${tool._id}`}
                  className="glass-card rounded-2xl overflow-hidden group block h-full relative"
                >
                  {/* AI Score Badge */}
                  {aiMode && tool.aiScore !== undefined && (
                    <div className="absolute top-3 right-3 z-20">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
                        tool.aiMatch === 'Excellent Match'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : tool.aiMatch === 'Good Match'
                            ? 'bg-gradient-to-r from-blue-500 to-primary-500 text-white'
                            : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                      }`}>
                        {tool.aiScore}% Match
                      </div>
                    </div>
                  )}

                  {/* AI Rank Badge */}
                  {aiMode && index < 3 && (
                    <div className="absolute top-3 left-3 z-20">
                      <div className="w-8 h-8 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center text-sm font-bold shadow-lg">
                        #{index + 1}
                      </div>
                    </div>
                  )}

                  {/* Image */}
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 relative overflow-hidden">
                    {tool.images?.[0] ? (
                      <img src={tool.images[0]} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        {categoryEmojis[tool.category] || '🔧'}
                      </div>
                    )}
                    {!aiMode && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tool.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {tool.isAvailable ? 'Available' : 'Rented'}
                        </span>
                      </div>
                    )}
                    {!aiMode && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                          {tool.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {tool.description}
                    </p>

                    {/* AI Insights */}
                    {aiMode && tool.aiInsights && tool.aiInsights.length > 0 && (
                      <div className="mb-3 p-2 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800">
                        {tool.aiInsights.map((insight, i) => (
                          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                            {insight}
                          </p>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold gradient-text">
                          {formatCurrency(tool.rentPrice?.daily || tool.rentPrice?.hourly || 0)}
                        </span>
                        <span className="text-xs text-gray-500">/{tool.rentPrice?.daily ? 'day' : 'hr'}</span>
                      </div>
                      {tool.rating?.average > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{tool.rating.average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {tool.securityDeposit > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        Deposit: {formatCurrency(tool.securityDeposit)}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {(pagination.prev || pagination.next) && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={!pagination.prev}
                className="btn-secondary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="flex items-center px-4 text-sm text-gray-500">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.next}
                className="btn-secondary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ToolList;
