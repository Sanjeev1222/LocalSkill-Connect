import { getStatusColor } from '../utils/helpers';

const StatusBadge = ({ status }) => {
  const label = status?.replace(/_/g, ' ') || 'unknown';
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(status)}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
