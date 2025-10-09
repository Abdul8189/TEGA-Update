import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../pages/LoginForm.jsx";
import RegisterForm from "../pages/RegisterForm.jsx";

export default function AnimatedAuthCard() {
  const [isLogin, setIsLogin] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const backgroundVariants = {
    login: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      transition: { duration: 0.8, ease: "easeInOut" }
    },
    register: {
      background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      transition: { duration: 0.8, ease: "easeInOut" }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <motion.div 
        className="absolute inset-0 -z-10"
        variants={backgroundVariants}
        animate={isLogin ? "login" : "register"}
      />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 bg-white bg-opacity-10 rounded-full blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        className="relative z-10 w-full max-w-6xl mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          
          {/* Left Side - Branding */}
          <motion.div 
            className="flex-1 text-center lg:text-left text-white"
            variants={cardVariants}
          >
            <motion.div
              animate={floatingAnimation}
              className="mb-8"
            >
              <h1 className="text-6xl lg:text-8xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200">
                TEGA
              </h1>
              <div className="w-24 h-1 bg-white mx-auto lg:mx-0 rounded-full mb-6"></div>
            </motion.div>
            
            <motion.p 
              className="text-xl lg:text-2xl mb-8 text-gray-100"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {isLogin 
                ? "Welcome back! Sign in to continue your journey." 
                : "Join our community and start your amazing journey today!"
              }
            </motion.p>

            <motion.div 
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              {['🚀 Fast Setup', '🔒 Secure', '🌟 Modern UI'].map((feature, index) => (
                <motion.div
                  key={feature}
                  className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                  transition={{ duration: 0.2 }}
                >
                  {feature}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Auth Form */}
          <motion.div 
            className="flex-1 w-full max-w-md"
            variants={cardVariants}
          >
            <motion.div
              className="bg-white bg-opacity-95 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tab Headers */}
              <div className="flex bg-gray-50">
                <motion.button
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                    isLogin 
                      ? 'bg-white text-purple-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setIsLogin(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    animate={{ scale: isLogin ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Login
                  </motion.span>
                </motion.button>
                <motion.button
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                    !isLogin 
                      ? 'bg-white text-pink-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setIsLogin(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span
                    animate={{ scale: !isLogin ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Register
                  </motion.span>
                </motion.button>
              </div>

              {/* Form Content */}
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {isLogin ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.h2 
                        className="text-2xl font-bold text-gray-800 mb-6 text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Welcome Back! 👋
                      </motion.h2>
                      <LoginForm />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.h2 
                        className="text-2xl font-bold text-gray-800 mb-6 text-center"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        Create Account 🚀
                      </motion.h2>
                      <RegisterForm />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Bottom Text */}
            <motion.p 
              className="text-center text-white text-sm mt-6 opacity-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.8 }}
            >
              By continuing, you agree to our Terms of Service and Privacy Policy
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
