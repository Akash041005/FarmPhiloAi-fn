import { NavLink } from 'react-router-dom';
import { FiHome, FiCamera, FiClock, FiCloud, FiSettings } from 'react-icons/fi';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/scan', icon: FiCamera, label: 'Scan' },
  { path: '/history', icon: FiClock, label: 'History' },
  { path: '/weather', icon: FiCloud, label: 'Weather' },
  { path: '/settings', icon: FiSettings, label: 'Settings' }
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="glass-card border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-around items-center py-2 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`p-2 rounded-xl ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -top-1 w-1 h-1 bg-primary-500 rounded-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </motion.div>
    </nav>
  );
};

export default BottomNav;