import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TegaLogo from '../assets/tegalog.png';
import { Sparkles, BookOpen, Users, Briefcase, Award, Zap, Star, Rocket, Target, TrendingUp } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [logoScale, setLogoScale] = useState(0);
  const [showParticles, setShowParticles] = useState(false);

  const steps = [
    {
      icon: <BookOpen className="w-10 h-10" />,
      text: "Learning",
      color: "from-blue-400 to-cyan-400",
      description: "Master new skills"
    },
    {
      icon: <Users className="w-10 h-10" />,
      text: "Connecting",
      color: "from-purple-400 to-pink-400",
      description: "Build networks"
    },
    {
      icon: <Briefcase className="w-10 h-10" />,
      text: "Growing",
      color: "from-green-400 to-emerald-400",
      description: "Career advancement"
    },
    {
      icon: <Award className="w-10 h-10" />,
      text: "Achieving",
      color: "from-yellow-400 to-orange-400",
      description: "Reach your goals"
    }
  ];

  useEffect(() => {
    // Initial logo animation
    setTimeout(() => {
      setLogoScale(1);
      setShowParticles(true);
    }, 500);

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete the splash screen
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            onComplete();
          }, 500);
        }, 1500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  };

  const logoVariants = {
    hidden: { 
      scale: 0, 
      rotate: -360,
      opacity: 0,
      y: -100
    },
    visible: {
      scale: logoScale,
      rotate: 0,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 1.5,
        delay: 0.3
      }
    },
    exit: {
      scale: 0,
      rotate: 360,
      opacity: 0,
      y: -100,
      transition: {
        duration: 0.8
      }
    }
  };

  const logoGlowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const particleVariants = {
    animate: {
      y: [0, -100, 0],
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.3
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const sparkleVariants = {
    animate: {
      rotate: 360,
      scale: [1, 1.3, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Extraordinary Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
            {/* Multiple layered floating shapes */}
            <motion.div
              className="absolute top-10 left-10 w-40 h-40 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
              variants={floatingVariants}
              animate="animate"
            />
            <motion.div
              className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-r from-cyan-400/25 to-blue-400/25 rounded-full blur-2xl"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '1s' }}
            />
            <motion.div
              className="absolute bottom-20 left-1/4 w-48 h-48 bg-gradient-to-r from-pink-400/15 to-purple-400/15 rounded-full blur-3xl"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '2s' }}
            />
            <motion.div
              className="absolute bottom-32 right-1/3 w-24 h-24 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '0.5s' }}
            />
            <motion.div
              className="absolute top-1/2 left-10 w-36 h-36 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-2xl"
              variants={floatingVariants}
              animate="animate"
              style={{ animationDelay: '3s' }}
            />
            
            {/* Enhanced sparkle effects */}
            <motion.div
              className="absolute top-20 right-32 text-white/50"
              variants={sparkleVariants}
              animate="animate"
            >
              <Sparkles size={40} />
            </motion.div>
            <motion.div
              className="absolute bottom-32 left-32 text-white/40"
              variants={sparkleVariants}
              animate="animate"
              style={{ animationDelay: '1.5s' }}
            >
              <Sparkles size={32} />
            </motion.div>
            <motion.div
              className="absolute top-1/3 left-20 text-white/45"
              variants={sparkleVariants}
              animate="animate"
              style={{ animationDelay: '3s' }}
            >
              <Sparkles size={28} />
            </motion.div>
            <motion.div
              className="absolute bottom-1/3 right-20 text-white/35"
              variants={sparkleVariants}
              animate="animate"
              style={{ animationDelay: '2.5s' }}
            >
              <Sparkles size={24} />
            </motion.div>

            {/* Particle effects */}
            {showParticles && (
              <>
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    variants={particleVariants}
                    animate="animate"
                    transition={{ delay: Math.random() * 2 }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center">
            {/* Extraordinary Large Logo */}
            <motion.div
              className="mb-12"
              variants={logoVariants}
            >
              <div className="relative inline-block">
                {/* Glow effect behind logo */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-3xl scale-150"
                  variants={logoGlowVariants}
                  animate="animate"
                />
                
                {/* Main logo - Increased size */}
                <motion.img
                  src={TegaLogo}
                  alt="TEGA Logo"
                  className="h-64 w-auto mx-auto drop-shadow-2xl relative z-10"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.5 }
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
                
                {/* Multiple animated rings around logo */}
                <motion.div
                  className="absolute inset-0 border-4 border-white/20 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.3, 0.7, 0.3],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.2, 0.6, 0.2],
                    rotate: -360
                  }}
                  transition={{ 
                    duration: 7, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-purple-400/25 rounded-full"
                  animate={{ 
                    scale: [1, 1.7, 1],
                    opacity: [0.15, 0.5, 0.15],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 9, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                />
                
                {/* Pulsing dots around logo */}
                <motion.div
                  className="absolute top-0 left-1/2 w-3 h-3 bg-white/40 rounded-full transform -translate-x-1/2 -translate-y-2"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <motion.div
                  className="absolute bottom-0 left-1/2 w-3 h-3 bg-cyan-400/50 rounded-full transform -translate-x-1/2 translate-y-2"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                />
                <motion.div
                  className="absolute left-0 top-1/2 w-3 h-3 bg-purple-400/50 rounded-full transform -translate-x-2 -translate-y-1/2"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
                <motion.div
                  className="absolute right-0 top-1/2 w-3 h-3 bg-pink-400/50 rounded-full transform translate-x-2 -translate-y-1/2"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{ 
                    duration: 2.8, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                />
                
                {/* Corner sparkles */}
                <motion.div
                  className="absolute -top-4 -left-4 w-2 h-2 bg-yellow-400/60 rounded-full"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
                <motion.div
                  className="absolute -top-4 -right-4 w-2 h-2 bg-green-400/60 rounded-full"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: -360
                  }}
                  transition={{ 
                    duration: 2.3, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.3
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -left-4 w-2 h-2 bg-blue-400/60 rounded-full"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: 360
                  }}
                  transition={{ 
                    duration: 2.7, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 0.7
                  }}
                />
                <motion.div
                  className="absolute -bottom-4 -right-4 w-2 h-2 bg-pink-400/60 rounded-full"
                  animate={{ 
                    scale: [1, 2, 1],
                    opacity: [0.5, 1, 0.5],
                    rotate: -360
                  }}
                  transition={{ 
                    duration: 2.1, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    delay: 1.1
                  }}
                />
              </div>
            </motion.div>

            {/* Enhanced Title */}
            <motion.div
              className="mb-16"
              variants={textVariants}
            >
              <motion.h1 
                className="text-5xl font-bold text-white mb-6 drop-shadow-2xl"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(255,255,255,0.5)",
                    "0 0 40px rgba(255,255,255,0.8)",
                    "0 0 20px rgba(255,255,255,0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                TEGA
              </motion.h1>
              <motion.p 
                className="text-2xl text-white/90 font-medium"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                Training and Employment Generation Activity
              </motion.p>
            </motion.div>

            {/* Enhanced Loading Steps */}
            <motion.div
              className="flex justify-center gap-12 mb-12"
              variants={textVariants}
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center gap-4"
                  variants={stepVariants}
                  animate={index <= currentStep ? "visible" : "hidden"}
                >
                  <motion.div
                    className={`w-20 h-20 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white shadow-2xl ${
                      index === currentStep ? 'ring-4 ring-white/40 scale-110' : ''
                    }`}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {step.icon}
                  </motion.div>
                  <div className="text-center">
                    <motion.span 
                      className="text-white/90 font-semibold text-lg block"
                      animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {step.text}
                    </motion.span>
                    <span className="text-white/60 text-sm">
                      {step.description}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Enhanced Progress Bar */}
            <motion.div
              className="w-80 h-3 bg-white/20 rounded-full mx-auto overflow-hidden shadow-inner"
              variants={textVariants}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Enhanced Loading Text */}
            <motion.div
              className="mt-6"
              variants={textVariants}
            >
              <motion.p
                className="text-white/80 text-lg font-medium"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {currentStep < steps.length ? (
                  <>
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ✨
                    </motion.span>
                    {' '}Preparing your {steps[currentStep].text.toLowerCase()} experience...
                  </>
                ) : (
                  <>
                    <motion.span
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      Success
                    </motion.span>
                    {' '}Welcome to TEGA!
                  </>
                )}
              </motion.p>
            </motion.div>
          </div>

          {/* Enhanced Decorative Elements */}
          <motion.div 
            className="absolute top-16 left-16 w-6 h-6 bg-white/30 rounded-full"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="absolute top-24 right-20 w-4 h-4 bg-cyan-400/50 rounded-full"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.9, 0.4]
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div 
            className="absolute bottom-20 left-20 w-8 h-8 bg-pink-400/40 rounded-full"
            animate={{ 
              y: [0, -20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
          />
          <motion.div 
            className="absolute bottom-32 right-16 w-3 h-3 bg-yellow-400/60 rounded-full"
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
