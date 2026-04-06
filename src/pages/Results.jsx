import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiXCircle, FiExternalLink, FiShare2, FiBookmark, FiShare } from 'react-icons/fi';
import { FaLeaf, FaTint, FaThermometerHalf, FaWind, FaCloudRain } from 'react-icons/fa';

const SeverityBadge = ({ severity }) => {
  const colors = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[severity] || colors.low}`}>
      {severity?.toUpperCase() || 'LOW'}
    </span>
  );
};

const RiskMeter = ({ confidence }) => {
  const getColor = () => {
    if (confidence >= 80) return 'bg-green-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">Risk Level</span>
        <span className={`font-semibold ${confidence >= 80 ? 'text-green-500' : confidence >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
          {confidence >= 80 ? 'Low Risk' : confidence >= 60 ? 'Moderate Risk' : 'High Risk'}
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${getColor()}`}
        />
      </div>
    </div>
  );
};

const DiseaseCard = ({ result }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">Detected Disease</h3>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{result?.disease || 'Unknown'}</h2>
      </div>
      <SeverityBadge severity={result?.severity} />
    </div>
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AI Confidence</p>
        <p className="text-3xl font-bold text-primary-500">{result?.confidence || 0}%</p>
      </div>
      <RiskMeter confidence={result?.confidence || 0} />
    </div>
  </motion.div>
);

const CausesCard = ({ causes }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="glass-card p-6"
  >
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <FiAlertTriangle className="w-5 h-5 text-yellow-500" />
      Possible Causes
    </h3>
    <ul className="space-y-2">
      {causes?.length > 0 ? causes.map((cause, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
          {cause}
        </li>
      )) : (
        <p className="text-gray-500 dark:text-gray-400">No specific causes identified</p>
      )}
    </ul>
  </motion.div>
);

const CureStepsCard = ({ cure_steps }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="glass-card p-6"
  >
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <FiCheckCircle className="w-5 h-5 text-green-500" />
      Treatment Steps
    </h3>
    <div className="space-y-4">
      {cure_steps?.length > 0 ? cure_steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
            <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">{step.step}</span>
          </div>
          <div className="flex-1">
            <p className="text-gray-700 dark:text-gray-200">{step.instruction}</p>
            {step.estimated_time && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Estimated time: {step.estimated_time}
              </p>
            )}
          </div>
        </div>
      )) : (
        <p className="text-gray-500 dark:text-gray-400">No treatment steps available</p>
      )}
    </div>
  </motion.div>
);

const FertilizerCard = ({ fertilizers }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="glass-card p-6"
  >
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <FaLeaf className="w-5 h-5 text-green-500" />
      Recommended Fertilizers
    </h3>
    <div className="space-y-4">
      {fertilizers?.length > 0 ? fertilizers.map((fert, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-800 dark:text-white">{fert.name}</h4>
            {fert.buy_link && (
              <motion.a
                whileHover={{ scale: 1.05 }}
                href={fert.buy_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-500 text-sm flex items-center gap-1 hover:underline"
              >
                Buy Now <FiExternalLink className="w-3 h-3" />
              </motion.a>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Dosage</p>
              <p className="text-gray-700 dark:text-gray-200">{fert.dosage || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Timing</p>
              <p className="text-gray-700 dark:text-gray-200">{fert.timing || 'N/A'}</p>
            </div>
            {fert.price && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-gray-700 dark:text-gray-200">{fert.price}</p>
              </div>
            )}
            {fert.rating && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Rating</p>
                <p className="text-yellow-500">{'★'.repeat(fert.rating)}{'☆'.repeat(5-fert.rating)}</p>
              </div>
            )}
          </div>
        </div>
      )) : (
        <p className="text-gray-500 dark:text-gray-400">No fertilizers recommended</p>
      )}
    </div>
  </motion.div>
);

const PreventionCard = ({ prevention }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="glass-card p-6"
  >
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <FiCheckCircle className="w-5 h-5 text-blue-500" />
      Prevention Tips
    </h3>
    <ul className="space-y-2">
      {prevention?.length > 0 ? prevention.map((tip, index) => (
        <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
          {tip}
        </li>
      )) : (
        <p className="text-gray-500 dark:text-gray-400">No prevention tips available</p>
      )}
    </ul>
  </motion.div>
);

const WeatherAdvisoryCard = ({ weather }) => {
  if (!weather?.current) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
        <FaThermometerHalf className="w-5 h-5 text-blue-500" />
        Weather Advisory
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FaThermometerHalf className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Temperature</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">{weather.current.temp}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FaTint className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Humidity</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">{weather.current.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FaWind className="w-8 h-8 text-gray-500" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Wind Speed</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">{weather.current.wind_speed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FaCloudRain className="w-8 h-8 text-blue-400" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rain Chance</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">{weather.forecast?.daily?.[0]?.pop || 0}%</p>
          </div>
        </div>
      </div>

      {weather.agricultural_insights && (
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">AI Advisory</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {weather.agricultural_insights.disease_risk === 'high' && '⚠️ High disease risk due to weather conditions. Monitor crops closely.'}
            {weather.agricultural_insights.disease_risk === 'moderate' && '⚡ Moderate disease risk. Regular monitoring recommended.'}
            {weather.agricultural_insights.disease_risk === 'low' && '✓ Low disease risk. Good conditions for crop health.'}
            {weather.agricultural_insights.spray_conditions?.suitable === false && ' Do not spray today due to weather conditions.'}
            {weather.agricultural_insights.irrigation_needed && ' 💧 Irrigation may be needed due to low humidity.'}
          </p>
        </div>
      )}

      {weather.agricultural_insights?.recommended_activities && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recommended Activities</p>
          <ul className="space-y-1">
            {weather.agricultural_insights.recommended_activities.map((activity, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <span className="text-primary-500">•</span>
                {activity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

const ActionPlanCard = ({ action_plan }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="glass-card p-6"
  >
    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
      <FaLeaf className="w-5 h-5 text-green-500" />
      Action Plan
    </h3>
    
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">TODAY</p>
        <p className="text-gray-700 dark:text-gray-200">{action_plan?.today || 'No action needed today'}</p>
      </div>
      
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">NEXT 3 DAYS</p>
        <p className="text-gray-700 dark:text-gray-200">{action_plan?.next_3_days || 'Continue monitoring'}</p>
      </div>
      
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">NEXT 7 Days</p>
        <p className="text-gray-700 dark:text-gray-200">{action_plan?.next_7_days || 'Plan for next week'}</p>
      </div>
    </div>
  </motion.div>
);

const Results = () => {
  const location = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.result) {
      setResult(location.state.result);
    }
  }, [location.state]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No results found. Please scan a crop first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Analysis Results</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {result.result?.cropType || 'Crop'} - {new Date().toLocaleDateString()}
        </p>
      </motion.div>

      <DiseaseCard result={result.result} />
      <CausesCard causes={result.result?.causes} />
      <CureStepsCard cure_steps={result.result?.cure_steps} />
      <FertilizerCard fertilizers={result.result?.fertilizers} />
      <PreventionCard prevention={result.result?.prevention} />
      <WeatherAdvisoryCard weather={result.weather} />
      <ActionPlanCard action_plan={result.result?.action_plan} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-secondary flex items-center justify-center gap-2"
        >
          <FiShare className="w-4 h-4" />
          Share
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 btn-secondary flex items-center justify-center gap-2"
        >
          <FiBookmark className="w-4 h-4" />
          Save
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Results;