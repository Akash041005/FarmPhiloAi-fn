import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMapPin, FiBell, FiMoon, FiGlobe, FiInfo, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { settingsService, notificationService } from '../services/scanService';
import { useGeolocation } from '../hooks/useGeolocation';

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useToast();
  const { location, getLocation } = useGeolocation();
  
  const [notifications, setNotifications] = useState({
    enabled: user?.notificationPreferences?.enabled ?? true,
    frequency: user?.notificationPreferences?.frequency ?? 'daily',
    diseaseAlerts: user?.notificationPreferences?.types?.diseaseAlerts ?? true,
    weatherAlerts: user?.notificationPreferences?.types?.weatherAlerts ?? true,
    tips: user?.notificationPreferences?.types?.tips ?? false
  });
  
  const [language, setLanguage] = useState(user?.language || 'en');
  const [saving, setSaving] = useState(false);

  const handleNotificationChange = async (key, value) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    setSaving(true);
    try {
      await notificationService.updateSettings({
        enabled: key === 'enabled' ? value : notifications.enabled,
        frequency: key === 'frequency' ? value : notifications.frequency,
        types: key.startsWith('types.')
          ? { ...notifications, [key.replace('types.', '')]: value }
          : undefined
      });
      success('Settings updated');
    } catch (err) {
      error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationUpdate = async () => {
    try {
      await getLocation();
      if (location) {
        await settingsService.updateLocation(
          location.latitude,
          location.longitude,
          location.address
        );
        updateUser({ location });
        success('Location updated');
      }
    } catch (err) {
      error('Failed to update location');
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    try {
      await settingsService.updatePreferences(lang, theme);
      updateUser({ language: lang });
    } catch (err) {
      // Silent fail for language
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: FiUser,
          label: 'Profile',
          value: user?.name || 'Not set',
          onClick: () => {}
        }
      ]
    },
    {
      title: 'Location',
      items: [
        {
          icon: FiMapPin,
          label: 'Update Location',
          value: location ? 'Updated' : 'Not set',
          onClick: handleLocationUpdate
        }
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: FiBell,
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications.enabled,
          onChange: (v) => handleNotificationChange('enabled', v)
        },
        {
          icon: FiBell,
          label: 'Frequency',
          type: 'select',
          value: notifications.frequency,
          options: [
            { value: '6h', label: 'Every 6 hours' },
            { value: '12h', label: 'Every 12 hours' },
            { value: 'daily', label: 'Daily' }
          ],
          onChange: (v) => handleNotificationChange('frequency', v)
        },
        {
          icon: FiBell,
          label: 'Disease Alerts',
          type: 'toggle',
          value: notifications.diseaseAlerts,
          onChange: (v) => handleNotificationChange('types.diseaseAlerts', v)
        },
        {
          icon: FiBell,
          label: 'Weather Alerts',
          type: 'toggle',
          value: notifications.weatherAlerts,
          onChange: (v) => handleNotificationChange('types.weatherAlerts', v)
        }
      ]
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: FiMoon,
          label: 'Dark Mode',
          type: 'toggle',
          value: theme === 'dark',
          onChange: handleThemeToggle
        }
      ]
    },
    {
      title: 'Language',
      items: [
        {
          icon: FiGlobe,
          label: 'Language',
          type: 'select',
          value: language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'Hindi' }
          ],
          onChange: handleLanguageChange
        }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your app preferences</p>
      </motion.div>

      <div className="space-y-6">
        {settingsSections.map((section, sectionIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="glass-card p-4"
          >
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3 px-2">
              {section.title}
            </h2>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-200">{item.label}</span>
                  </div>

                  {item.type === 'toggle' ? (
                    <button
                      onClick={() => item.onChange(!item.value)}
                      className={`w-12 h-7 rounded-full transition-colors ${
                        item.value ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <motion.div
                        animate={{ x: item.value ? 20 : 2 }}
                        className="w-5 h-5 bg-white rounded-full shadow"
                      />
                    </button>
                  ) : item.type === 'select' ? (
                    <select
                      value={item.value}
                      onChange={(e) => item.onChange(e.target.value)}
                      className="bg-transparent text-gray-600 dark:text-gray-300 text-sm border-none outline-none cursor-pointer"
                    >
                      {item.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
                    >
                      <span className="text-sm">{item.value}</span>
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 mt-6"
      >
        <div className="flex items-center gap-3 p-3">
          <FiInfo className="w-5 h-5 text-gray-500" />
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">FarmPhilo AI v1.0.0</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">AI-powered crop disease detection</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;