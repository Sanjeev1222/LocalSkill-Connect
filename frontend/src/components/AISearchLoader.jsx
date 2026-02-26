import { motion } from 'framer-motion';

const aiMessages = [
  'Analyzing all available options...',
  'Comparing prices and ratings...',
  'Finding the best deals for you...',
  'Running smart comparison algorithm...',
  'Almost there, preparing results...'
];

const AISearchLoader = ({ type = 'technicians' }) => {
  const label = type === 'technicians' ? 'technicians' : 'tools';

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 max-w-md text-center px-4"
      >
        {/* AI Brain Animation */}
        <div className="relative">
          {/* Outer rotating ring */}
          <motion.div
            className="w-24 h-24 rounded-full border-4 border-dashed border-primary-300 dark:border-primary-700"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
          {/* Inner pulsing circle */}
          <motion.div
            className="absolute inset-2 rounded-full gradient-bg flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <span className="text-3xl">🤖</span>
          </motion.div>
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary-400"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * 60 * Math.PI) / 180) * 50, 0],
                y: [0, Math.sin((i * 60 * Math.PI) / 180) * 50, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Title */}
        <div>
          <motion.h2
            className="text-xl font-bold mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="gradient-text">AI is searching</span> the best {label} for you
          </motion.h2>
          <motion.p
            className="text-sm text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Our smart algorithm is comparing all available {label} to find you the perfect match
          </motion.p>
        </div>

        {/* Animated status messages */}
        <div className="h-6 overflow-hidden">
          {aiMessages.map((msg, i) => (
            <motion.p
              key={i}
              className="text-sm text-primary-600 dark:text-primary-400 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [20, 0, 0, -20]
              }}
              transition={{
                duration: 2.5,
                delay: i * 2.5,
                repeat: Infinity,
                repeatDelay: (aiMessages.length - 1) * 2.5
              }}
              style={{ position: 'absolute' }}
            >
              {msg}
            </motion.p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-bg rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AISearchLoader;
