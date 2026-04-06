import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { FiCamera, FiUpload, FiMic, FiArrowRight, FiShield, FiZap } from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';

const FloatingLeaf = ({ position, rotation, scale, delay }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime + delay) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.5 + delay) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
        <planeGeometry args={[1, 1, 3, 3]} />
        <meshStandardMaterial 
          color="#22c55e" 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
};

const BackgroundScene = () => {
  const leaves = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        -5 - Math.random() * 5
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: 0.3 + Math.random() * 0.5,
      delay: i * 0.5
    }));
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      {leaves.map((leaf, i) => (
        <FloatingLeaf key={i} {...leaf} />
      ))}
    </>
  );
};

const FeatureCard = ({ icon: Icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="glass-card p-4 flex items-start gap-3"
  >
    <div className="p-2 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-white text-sm">{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  </motion.div>
);

const Home = () => {
  const features = [
    { icon: FiShield, title: 'Disease Detection', description: 'AI-powered instant diagnosis' },
    { icon: FiZap, title: 'Quick Results', description: 'Get results in seconds' },
    { icon: FaLeaf, title: 'Expert Advice', description: 'Cure steps & prevention' }
  ];

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          className="absolute inset-0"
          style={{ background: 'transparent' }}
        >
          <BackgroundScene />
        </Canvas>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6"
          >
            <FiZap className="w-4 h-4" />
            AI-Powered Crop Analysis
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-white mb-4 leading-tight">
            Scan your crop
            <br />
            <span className="text-gradient">instantly with AI</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Upload or capture a photo of your crop and get instant disease detection, 
            treatment recommendations, and expert advice.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-12"
        >
          <Link to="/scan?mode=camera">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full glass-card p-6 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FiCamera className="w-7 h-7 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white">Camera</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Take a photo</span>
            </motion.button>
          </Link>

          <Link to="/scan?mode=upload">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full glass-card p-6 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FiUpload className="w-7 h-7 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white">Upload</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Upload image</span>
            </motion.button>
          </Link>

          <Link to="/scan?mode=voice">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full glass-card p-6 flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <FiMic className="w-7 h-7 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-white">Voice</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Speak about crop</span>
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link to="/scan">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
            >
              Start Scanning
              <FiArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;