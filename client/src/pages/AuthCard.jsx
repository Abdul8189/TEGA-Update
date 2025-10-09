import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import TegaLogo from '../assets/tegalog.png';

const cardVariants = {
  initial: { opacity: 0, y: 50, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -50,
    scale: 1.05,
    transition: { duration: 0.3 },
  },
};

export default function AuthCard() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const mode = searchParams.get('mode');
  const isRegisterPath = location.pathname === '/register';
  const isLoginPath = location.pathname === '/login';

  const [isLogin, setIsLogin] = useState(isLoginPath || (!isRegisterPath && mode !== 'register'));

  useEffect(() => {
    // Handle direct navigation to specific routes
    if (isRegisterPath) {
      setIsLogin(false);
    } else if (isLoginPath) {
      setIsLogin(true);
    } else if (mode === 'register') {
      setIsLogin(false);
    } else {
      // Default to login if no specific route or mode
      setIsLogin(true);
    }
  }, [mode, isRegisterPath, isLoginPath]);

  const handleToggle = (loginState) => {
    setIsLogin(loginState);
    // Update URL for better history and bookmarking, but don't replace current history
    const newPath = loginState ? '/login' : '/register';
    navigate(newPath, { replace: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-sans">
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative border border-gray-200/50"
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Header with Logo and Tabs */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-center mb-4">
            <img src={TegaLogo} alt="Tega Logo" className="h-12" />
          </div>
          <div className="flex justify-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleToggle(true)}
              className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${isLogin ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>
              Login
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${!isLogin ? 'bg-white text-indigo-600 shadow' : 'text-gray-500'}`}>
              Register
            </button>
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div key="login" variants={cardVariants}>
                <LoginForm />
              </motion.div>
            ) : (
              <motion.div key="register" variants={cardVariants}>
                <RegisterForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
