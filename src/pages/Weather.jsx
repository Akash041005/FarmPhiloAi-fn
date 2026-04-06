import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiRefreshCw, FiCloud, FiSun, FiWind, FiDroplet, FiThermometer, FiAlertTriangle } from 'react-icons/fi';
import { FaCloudRain, FaSnowflake, FaTint } from 'react-icons/fa';
import { weatherService } from '../services/scanService';
import { useToast } from '../context/ToastContext';
import { useGeolocation } from '../hooks/useGeolocation';

const WeatherIcon = ({ condition, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const icons = {
    Clear: <FiSun className={`${sizeClasses[size]} text-yellow-500`} />,
    Clouds: <FiCloud className={`${sizeClasses[size]} text-gray-500`} />,
    Rain: <FaCloudRain className={`${sizeClasses[size]} text-blue-500`} />,
    Drizzle: <FaTint className={`${sizeClasses[size]} text-blue-400`} />,
    Thunderstorm: <FiAlertTriangle className={`${sizeClasses[size]} text-purple-500`} />,
    Snow: <FaSnowflake className={`${sizeClasses[size]} text-cyan-400`} />,
    Mist: <FiCloud className={`${sizeClasses[size]} text-gray-400`} />,
    Fog: <FiCloud className={`${sizeClasses[size]} text-gray-400`} />
  };

  return icons[condition] || <FiCloud className={`${sizeClasses[size]} text-gray-500`} />;
};

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const { location, getLocation, loading: locationLoading } = useGeolocation();
  const { success, error, warning } = useToast();

  useEffect(() => {
    if (location) {
      fetchWeather();
    } else {
      getLocation();
    }
  }, [location]);

  const fetchWeather = async () => {
    if (!location?.latitude || !location?.longitude) {
      error('Location not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await weatherService.getWeather(location.latitude, location.longitude);
      setWeather(response);
      success('Weather data loaded');
    } catch (err) {
      error('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (loading || locationLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="glass-card p-8 animate-pulse">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full" />
          </div>
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4" />
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mx-auto mb-8" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 text-center">
        <p className="text-gray-500 mb-4">Unable to load weather data</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchWeather}
          className="btn-primary"
        >
          <FiRefreshCw className="w-4 h-4 mr-2 inline" />
          Retry
        </motion.button>
      </div>
    );
  }

  const { current, forecast, agricultural_insights } = weather;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Weather</h1>
          <motion.button
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchWeather}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
          >
            <FiRefreshCw className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
          <FiMapPin className="w-4 h-4" />
          <span className="text-sm">{location?.address || 'Current Location'}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <WeatherIcon condition={current?.main} size="lg" />
              <div>
                <p className="text-5xl font-bold text-gray-800 dark:text-white">
                  {current?.temp}°C
                </p>
                <p className="text-gray-500 dark:text-gray-400 capitalize">
                  {current?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FiThermometer className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Feels Like</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{current?.feels_like}°C</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FiDroplet className="w-5 h-5 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{current?.humidity}%</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FiWind className="w-5 h-5 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{current?.wind_speed} km/h</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <FiCloud className="w-5 h-5 text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Cloudiness</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">{current?.cloudiness}%</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">7-Day Forecast</h2>
        <div className="space-y-3">
          {forecast?.daily?.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <WeatherIcon condition={day.main} size="sm" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">{getDayName(day.dt)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{day.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-800 dark:text-white">{day.temp_max}°</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{day.temp_min}°</p>
                </div>
                {day.pop > 0 && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <FaCloudRain className="w-4 h-4" />
                    <span className="text-sm">{day.pop}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {agricultural_insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Agricultural Insights</h2>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${
              agricultural_insights.disease_risk === 'high' 
                ? 'bg-red-50 dark:bg-red-900/20' 
                : agricultural_insights.disease_risk === 'moderate'
                ? 'bg-yellow-50 dark:bg-yellow-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disease Risk</p>
              <p className={`text-lg font-semibold ${
                agricultural_insights.disease_risk === 'high' 
                  ? 'text-red-600' 
                  : agricultural_insights.disease_risk === 'moderate'
                  ? 'text-yellow-600'
                  : 'text-green-600'
              }`}>
                {agricultural_insights.disease_risk?.toUpperCase()}
              </p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spray Conditions</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {agricultural_insights.spray_conditions?.suitable 
                  ? `Suitable (${agricultural_insights.spray_conditions.best_time || 'Any time'})`
                  : 'Not Suitable'
                }
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Irrigation</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {agricultural_insights.irrigation_needed ? 'Recommended' : 'Not Required'}
              </p>
            </div>

            {agricultural_insights.recommended_activities?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Recommended Activities</p>
                <ul className="space-y-2">
                  {agricultural_insights.recommended_activities.map((activity, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-primary-500">•</span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Weather;