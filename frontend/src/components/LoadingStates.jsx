import { motion } from 'framer-motion';

export const CardSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
    <div className="flex gap-2 mt-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
    </div>
  </div>
);

export const ListSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card p-4 rounded-xl animate-pulse flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
      </div>
    ))}
  </div>
);

export const StatSkeleton = () => (
  <div className="glass-card p-6 rounded-2xl animate-pulse">
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
  </div>
);

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="relative">
        <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
    </motion.div>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, message, action }) => {
  const displayMessage = description || message;

  const renderAction = () => {
    if (!action) return null;
    if (action.label && action.link) {
      return (
        <a href={action.link} className="btn-primary px-6 py-2.5 inline-flex items-center gap-2">
          {action.label}
        </a>
      );
    }
    return action; // JSX element
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      {Icon && (
        <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {displayMessage && <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">{displayMessage}</p>}
      {renderAction()}
    </motion.div>
  );
};
