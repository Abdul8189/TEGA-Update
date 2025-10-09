import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, TrendingUp, BookOpen, Briefcase } from 'lucide-react';
import CareerGif from '../assets/Career.12eea9915e08.gif';
import IndustryEndorsedGif from '../assets/IndustryEndorsed.9d4ff60cd3c0.gif';
import MentorSupportGif from '../assets/Mentorsupprt.cb12caac80aa.gif';
import ProjectBasedGif from '../assets/projectbased.7788848533ad.gif';
import RealtimeCertificationGif from '../assets/RealtimeCertification.12c77b4ce30f.gif';

const WhyChooseTega = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const reasons = [
    {
      icon: Award,
      iconGif: IndustryEndorsedGif,
      title: 'Industry-Endorsed Programs',
      description: 'Our courses are designed by industry experts and endorsed by leading companies.',
      stats: '98% Satisfaction Rate',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Users,
      iconGif: MentorSupportGif,
      title: 'Expert Mentor Support',
      description: 'Get personalized guidance from industry professionals throughout your learning journey.',
      stats: '24/7 Mentorship',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: BookOpen,
      iconGif: ProjectBasedGif,
      title: 'Project-Based Learning',
      description: 'Learn through real-world projects that build your portfolio and practical skills.',
      stats: '100+ Projects',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Award,
      iconGif: RealtimeCertificationGif,
      title: 'Real-Time Certification',
      description: 'Earn industry-recognized certificates upon completion with instant verification.',
      stats: '95% Job Success',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Briefcase,
      iconGif: CareerGif,
      title: 'Career Advancement',
      description: 'Get job placement assistance and career guidance to accelerate your professional growth.',
      stats: '10K+ Placements',
      color: 'from-indigo-400 to-blue-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TEGA</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience excellence in education with our proven track record and innovative approach
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* GIF Section - 70% */}
          <div className="lg:col-span-8">
            <div className="h-full rounded-3xl overflow-hidden bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-gray-200 hover:border-gray-300 flex items-center justify-center min-h-[400px]">
              {reasons[activeIndex].iconGif ? (
                <img 
                  src={reasons[activeIndex].iconGif} 
                  alt={reasons[activeIndex].title}
                  className="w-full h-full object-contain"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${reasons[activeIndex].color}`}>
                  {React.createElement(reasons[activeIndex].icon, { className: "w-20 h-20 text-white" })}
                </div>
              )}
            </div>
          </div>

          {/* Navigation - 30% */}
          <div className="lg:col-span-4">
            <div className="space-y-3 h-full flex flex-col justify-center min-h-[400px]">
              {reasons.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-full p-4 rounded-2xl transition-all duration-300 text-left group shadow-lg border ${
                    activeIndex === index 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl transform scale-105 border-blue-300' 
                      : 'bg-white hover:bg-gray-50 text-gray-700 hover:shadow-xl border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeIndex === index 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-r ' + reason.color
                    }`}>
                      <reason.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">
                        {reason.title}
                      </h4>
                      <p className={`text-sm ${
                        activeIndex === index ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {reason.stats}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activeIndex === index ? 'bg-white' : 'bg-gray-300'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseTega;
