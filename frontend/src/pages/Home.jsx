import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Wrench, Star, Shield, Clock, Users,
  ChevronRight, MapPin, ArrowRight, Zap,
  Hammer, Droplets, Cpu, Wind, Paintbrush, Sparkles
} from 'lucide-react';
import { skillIcons } from '../utils/helpers';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
  })
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const services = [
    { name: 'Electrician', icon: '⚡', color: 'from-yellow-400 to-orange-500', desc: 'Wiring, repairs & installations' },
    { name: 'Plumber', icon: '🔧', color: 'from-blue-400 to-cyan-500', desc: 'Pipes, leaks & fixtures' },
    { name: 'AC Technician', icon: '❄️', color: 'from-cyan-400 to-blue-500', desc: 'AC repair & servicing' },
    { name: 'Carpenter', icon: '🪚', color: 'from-amber-400 to-yellow-600', desc: 'Furniture & woodwork' },
    { name: 'Painter', icon: '🎨', color: 'from-pink-400 to-purple-500', desc: 'Interior & exterior painting' },
    { name: 'Cleaner', icon: '🧹', color: 'from-green-400 to-emerald-500', desc: 'Deep cleaning services' },
    { name: 'Mechanic', icon: '🔩', color: 'from-gray-400 to-gray-600', desc: 'Vehicle repair & servicing' },
    { name: 'Appliance Repair', icon: '🔌', color: 'from-violet-400 to-purple-500', desc: 'Home appliance fixes' }
  ];

  const stats = [
    { label: 'Technicians', value: '500+', icon: Users },
    { label: 'Bookings Done', value: '10K+', icon: Clock },
    { label: 'Tools Available', value: '200+', icon: Wrench },
    { label: 'Avg Rating', value: '4.8', icon: Star }
  ];

  const features = [
    { icon: MapPin, title: 'Location Based', desc: 'Find technicians near you for faster service' },
    { icon: Shield, title: 'Verified Experts', desc: 'All technicians are background verified' },
    { icon: Clock, title: 'Quick Booking', desc: 'Book in under 2 minutes with flexible slots' },
    { icon: Star, title: 'Rated & Reviewed', desc: 'Choose based on genuine user reviews' },
    { icon: Zap, title: 'Instant Response', desc: 'Get confirmation within minutes' },
    { icon: Wrench, title: 'Tool Rentals', desc: 'Rent professional tools at affordable rates' }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6"
              >
                <Sparkles className="w-4 h-4" />
                #1 Technician Booking Platform
              </motion.div>

              <motion.h1 variants={fadeUp} custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6"
              >
                Find Trusted{' '}
                <span className="gradient-text">Local Experts</span>{' '}
                For Every Need
              </motion.h1>

              <motion.p variants={fadeUp} custom={2}
                className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-lg"
              >
                Book skilled technicians, rent professional tools, and get things done with verified local service providers.
              </motion.p>

              {/* Search bar */}
              <motion.div variants={fadeUp} custom={3}
                className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-gray-800 shadow-card max-w-lg"
              >
                <div className="flex items-center flex-1 pl-4 gap-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What service do you need?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400"
                  />
                </div>
                <Link
                  to={`/technicians${searchQuery ? `?skill=${searchQuery}` : ''}`}
                  className="btn-primary px-6 py-3 rounded-xl ripple"
                >
                  Search
                </Link>
              </motion.div>

              {/* Quick categories */}
              <motion.div variants={fadeUp} custom={4} className="flex flex-wrap gap-2 mt-6">
                {['Electrician', 'Plumber', 'Carpenter'].map((s) => (
                  <Link key={s} to={`/technicians?skill=${s}`}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                  >
                    {skillIcons[s]} {s}
                  </Link>
                ))}
              </motion.div>
            </motion.div>

            {/* Right - Hero illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-card p-8 rounded-3xl">
                  <div className="grid grid-cols-2 gap-4">
                    {services.slice(0, 4).map((service, i) => (
                      <motion.div
                        key={service.name}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-center cursor-pointer group"
                      >
                        <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{service.icon}</span>
                        <p className="font-semibold text-sm">{service.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{service.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 glass-card px-4 py-3 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Verified</p>
                      <p className="text-xs text-gray-500">500+ Pros</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-6 glass-card px-4 py-3 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {['R', 'A', 'S'].map((l, i) => (
                        <div key={i} className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-gray-800">
                          {l}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold">4.8</span>
                      </div>
                      <p className="text-xs text-gray-500">10K+ Reviews</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 glass-card p-6 rounded-2xl"
          >
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center p-4">
                <Icon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                <p className="text-2xl font-bold gradient-text">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="section-title">
              Popular <span className="gradient-text">Services</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              Browse through our most requested service categories
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {services.map((service, i) => (
              <motion.div key={service.name} variants={fadeUp} custom={i}>
                <Link
                  to={`/technicians?skill=${service.name}`}
                  className="block glass-card p-6 rounded-2xl text-center group hover:shadow-card-hover transition-all duration-300"
                >
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{service.icon}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{service.desc}</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-primary-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Book Now <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="section-title">
              Why Choose <span className="gradient-text">LocalSkill?</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              We make hiring local professionals simple, safe, and affordable
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp} custom={i}
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-2xl group"
              >
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tool Rental CTA */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-bg p-12 md:p-16 text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Need Tools? Rent Instead of Buying!
                </h2>
                <p className="text-white/80 text-lg mb-6">
                  Access professional-grade tools at a fraction of the cost. From power drills to scaffolding — rent what you need.
                </p>
                <Link to="/tools" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors ripple">
                  Browse Tools <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="grid grid-cols-2 gap-4">
                  {['🔨', '🔧', '⚡', '🪚'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2 + i * 0.5, repeat: Infinity }}
                      className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl"
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger} className="text-center mb-14"
          >
            <motion.h2 variants={fadeUp} className="section-title">
              How It <span className="gradient-text">Works</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subtitle">
              Get your job done in three simple steps
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { step: 1, title: 'Search & Select', desc: 'Find the right technician or tool based on your needs, location, and budget.' },
              { step: 2, title: 'Book & Confirm', desc: 'Pick a convenient time slot, describe your requirement, and confirm your booking.' },
              { step: 3, title: 'Get It Done', desc: 'Our verified expert arrives on time. Pay securely and leave a review!' }
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                custom={i}
                className="text-center relative"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-bg flex items-center justify-center text-2xl font-bold text-white mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-8">
              Join thousands of satisfied users and skilled professionals on LocalSkill Connect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 ripple">
                Sign Up Free <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/technicians" className="btn-secondary text-lg px-8 py-4">
                Browse Technicians
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
