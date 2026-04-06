import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCamera, FiUpload, FiMic, FiX, FiCheck, FiChevronDown, FiMapPin, FiEdit2, FiPlus } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';
import { scanService } from '../services/scanService';
import { useGeolocation } from '../hooks/useGeolocation';
import { useVoiceInput } from '../hooks/useVoiceInput';

const CROP_TYPES = [
  'Tomato', 'Potato', 'Wheat', 'Rice', 'Cotton', 'Corn', 'Soybean', 
  'Sugarcane', 'Mustard', 'Groundnut', 'Onion', 'Garlic', 'Chili',
  'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Bean', 'Pea', 'Other'
];

const Scan = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') || 'upload';
  
  const [mode, setMode] = useState(initialMode);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [cropType, setCropType] = useState('');
  const [showCropDropdown, setShowCropDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Voice/Text input - combined with image
  const [inputMethod, setInputMethod] = useState(null);
  const [textInput, setTextInput] = useState('');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const { success, error, warning } = useToast();
  const navigate = useNavigate();
  const { location, getLocation, loading: locationLoading } = useGeolocation();
  const { isListening, transcript, startListening, stopListening } = useVoiceInput();

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  useEffect(() => {
    if (transcript && inputMethod === 'voice') {
      // Keep existing transcript
    }
  }, [transcript]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      error('Could not access camera. Please use upload mode.');
      setMode('upload');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
      setImage(dataUrl);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  const processFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      error('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      stopListening();
    } else {
      try {
        await startListening();
      } catch (err) {
        error('Voice input not available');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      error('Please upload or capture an image first');
      return;
    }

    setAnalyzing(true);
    setLoading(true);

    try {
      await getLocation();
      
      const formData = new FormData();
      
      const blob = await fetch(image).then(r => r.blob());
      formData.append('image', blob, 'crop.jpg');
      
      formData.append('cropType', cropType || 'Unknown');
      formData.append('latitude', location?.latitude || '');
      formData.append('longitude', location?.longitude || '');
      
      // Add voice or text description if provided
      if (inputMethod === 'voice' && transcript) {
        formData.append('voiceInput', transcript);
      } else if (inputMethod === 'text' && textInput.trim()) {
        formData.append('voiceInput', textInput.trim());
      }

      const response = await scanService.analyzeImage(formData);
      success('Analysis complete!');
      navigate('/results', { state: { result: response } });
    } catch (err) {
      error(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setInputMethod(null);
    setTextInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const modeButtons = [
    { id: 'camera', icon: FiCamera, label: 'Camera' },
    { id: 'upload', icon: FiUpload, label: 'Upload Image' }
  ];

  const hasDescription = (inputMethod === 'voice' && transcript) || (inputMethod === 'text' && textInput.trim());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 mb-4"
      >
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Scan Your Crop</h2>
        
        <div className="flex justify-center gap-2 mb-4">
          {modeButtons.map((btn) => (
            <motion.button
              key={btn.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setMode(btn.id);
                setImage(null);
                setImagePreview(null);
                setInputMethod(null);
                setTextInput('');
                if (btn.id !== 'camera') stopCamera();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                mode === btn.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              <btn.icon className="w-4 h-4" />
              {btn.label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === 'camera' && !imagePreview && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden bg-black aspect-[4/3]"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={captureImage}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-primary-500 border-4 border-white" />
              </motion.button>
            </motion.div>
          )}

          {mode === 'upload' && !imagePreview && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl aspect-[4/3] flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
              }`}
            >
              <FiUpload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">Drag & drop image here</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">or click to browse</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          )}

          {imagePreview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3]"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={removeImage}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
              >
                <FiX className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Voice/Text Input Section - Combined with Image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <FiPlus className="w-4 h-4 text-primary-500" />
          <h3 className="font-semibold text-gray-800 dark:text-white">Add Description (Optional)</h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">Helps AI diagnose better</span>
        </div>

        {!imagePreview ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Upload an image first, then add a voice or text description
          </p>
        ) : (
          <>
            <div className="flex gap-2 mb-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputMethod(inputMethod === 'voice' ? null : 'voice')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  inputMethod === 'voice'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiMic className="w-4 h-4" />
                Voice
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setInputMethod(inputMethod === 'text' ? null : 'text')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  inputMethod === 'text'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                <FiEdit2 className="w-4 h-4" />
                Text
              </motion.button>
            </div>

            {inputMethod === 'voice' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVoiceInput}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isListening 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-primary-500'
                  }`}
                >
                  <FiMic className="w-6 h-6 text-white" />
                </motion.button>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {isListening ? 'Tap to stop' : 'Tap to speak'}
                </p>
                {transcript && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center px-2"
                  >
                    "{transcript}"
                  </motion.p>
                )}
              </motion.div>
            )}

            {inputMethod === 'text' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe the problem...&#10;Example: Leaves have yellow spots with brown edges, plant is 2 weeks old, using drip irrigation"
                  className="w-full h-24 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none resize-none text-sm"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Add symptoms, plant age, irrigation method, etc.
                </p>
              </motion.div>
            )}

            {hasDescription && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
              >
                <FiCheck className="w-4 h-4" />
                Description added
              </motion.div>
            )}
          </>
        )}
      </motion.div>

      {/* Crop Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 mb-4"
      >
        <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Select Crop Type</h3>
        
        <div className="relative">
          <button
            onClick={() => setShowCropDropdown(!showCropDropdown)}
            className="w-full input-field flex items-center justify-between"
          >
            <span className={cropType ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>
              {cropType || 'Select crop type'}
            </span>
            <FiChevronDown className={`w-5 h-5 transition-transform ${showCropDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCropDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCropDropdown(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 w-full mt-2 glass-card max-h-48 overflow-y-auto"
              >
                {CROP_TYPES.map((crop) => (
                  <button
                    key={crop}
                    onClick={() => {
                      setCropType(crop);
                      setShowCropDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
                  >
                    <span className="text-gray-700 dark:text-gray-200">{crop}</span>
                    {cropType === crop && <FiCheck className="w-4 h-4 text-primary-500" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {location && (
          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="w-4 h-4" />
            <span>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</span>
          </div>
        )}
      </motion.div>

      {/* Analyze Button */}
      <motion.button
        whileHover={{ scale: analyzing ? 1 : 1.02 }}
        whileTap={{ scale: analyzing ? 1 : 0.98 }}
        onClick={handleAnalyze}
        disabled={loading || analyzing || !image}
        className={`w-full py-4 flex items-center justify-center gap-2 rounded-xl font-semibold transition-all ${
          !image
            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'btn-primary'
        }`}
      >
        {analyzing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Analyzing...
          </>
        ) : (
          <>
            <FiCheck className="w-5 h-5" />
            {image ? 'Analyze Crop' : 'Upload an image first'}
          </>
        )}
      </motion.button>
    </div>
  );
};

export default Scan;
