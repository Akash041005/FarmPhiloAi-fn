import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiBookmark, FiChevronRight, FiFilter, FiCalendar } from 'react-icons/fi';
import { historyService } from '../services/scanService';
import { useToast } from '../context/ToastContext';

const HistoryItem = ({ item, onDelete, onToggleBookmark, onClick }) => {
  const [expanded, setExpanded] = useState(false);

  const severityColors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div 
        className="p-4 flex items-center gap-4 cursor-pointer"
        onClick={() => onClick(item)}
      >
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
          {item.image?.thumbnailUrl && (
            <img 
              src={item.image.thumbnailUrl} 
              alt={item.result?.disease}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
              {item.result?.disease || 'Unknown'}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${severityColors[item.result?.severity]}`}>
              {item.result?.severity || 'low'}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {item.cropType} • {item.result?.confidence || 0}% confidence
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(item._id, !item.isBookmarked);
            }}
            className={`p-2 rounded-lg ${item.isBookmarked ? 'text-primary-500' : 'text-gray-400'}`}
          >
            <FiBookmark className={`w-4 h-4 ${item.isBookmarked ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item._id);
            }}
            className="p-2 rounded-lg text-red-500"
          >
            <FiTrash2 className="w-4 h-4" />
          </motion.button>
          <FiChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');
  
  const navigate = useNavigate();
  const { success, error } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [page, filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const filters = filter !== 'all' ? { bookmarked: filter === 'bookmarked' } : {};
      const response = await historyService.getHistory(page, 10, filters);
      setHistory(response.history);
      setPagination(response.pagination);
    } catch (err) {
      error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await historyService.deleteHistory(id);
      setHistory(prev => prev.filter(item => item._id !== id));
      success('Scan deleted');
    } catch (err) {
      error('Failed to delete scan');
    }
  };

  const handleToggleBookmark = async (id, isBookmarked) => {
    try {
      await historyService.toggleBookmark(id, isBookmarked);
      setHistory(prev => prev.map(item => 
        item._id === id ? { ...item, isBookmarked } : item
      ));
    } catch (err) {
      error('Failed to update bookmark');
    }
  };

  const handleItemClick = (item) => {
    navigate('/results', { state: { result: { result: item.result, weather: { current: item.weather } } } });
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'bookmarked', label: 'Bookmarked' }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Scan History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {pagination?.totalItems || 0} total scans
        </p>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        {filters.map((f) => (
          <motion.button
            key={f.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFilter(f.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {f.label}
          </motion.button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : history.length > 0 ? (
        <>
          <div className="space-y-4">
            <AnimatePresence>
              {history.map((item) => (
                <HistoryItem
                  key={item._id}
                  item={item}
                  onDelete={handleDelete}
                  onToggleBookmark={handleToggleBookmark}
                  onClick={handleItemClick}
                />
              ))}
            </AnimatePresence>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                Previous
              </motion.button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
                {page} / {pagination.totalPages}
              </span>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
              >
                Next
              </motion.button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No scans found</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/scan')}
            className="btn-primary mt-4"
          >
            Start Scanning
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default History;