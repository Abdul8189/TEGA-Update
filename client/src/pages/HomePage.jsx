import { Link } from 'react-router-dom'
import { CheckCircle, Medal, Briefcase, BookOpen, Laptop } from "lucide-react"
import { ArrowRight, Users, Award, Clock, Star, Play, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ServicesSection from '../components/ServicesSection'
import WhyChooseTega from '../components/WhyChooseTega'

import copy1 from "../assets/copy1.jpg"
import copy2 from "../assets/copy2.jpg"
import copy3 from "../assets/copy3.jpg"
import copy4 from "../assets/copy4.jpg"
import copy5 from "../assets/copy5.jpg"
import copy6 from "../assets/copy6.jpg"
import copy7 from "../assets/copy7.jpg"
import copy8 from "../assets/copy8.jpg"
import copy9 from "../assets/copy9.jpg"
import copy10 from "../assets/copy10.jpg"
import copy11 from "../assets/copy11.jpg"
import copy12 from "../assets/copy12.jpg"
import contactImage from "../assets/contact.fea2a22f4644.png"

const HomePage = () => {
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [openFAQ, setOpenFAQ] = useState(null);
  const statsRef = useRef(null);

  const features = [
    {
      icon: Users,
      title: 'Industry-Endorsed Programs',
      description: '98% Satisfaction Rate',
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Award,
      title: 'Expert Mentor Support',
      description: '24/7 Mentorship',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: BookOpen,
      title: 'Project-Based Learning',
      description: '100+ Projects',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Real-Time Certification',
      description: '95% Job Success',
      color: 'from-pink-500 to-rose-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600'
    },
    {
      icon: Briefcase,
      title: 'Career Advancement',
      description: '10K+ Placements',
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ]

  const featuredCourses = [
    {
      id: 1,
      title: 'Data Science and AI',
      description: 'Master the fundamentals of data science, machine learning, and artificial intelligence.',
      duration: '6 months',
      level: 'Intermediate',
      rating: 4.8,
      students: 1250,
      price: '$999',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop'
    },
    {
      id: 2,
      title: 'Full Stack Development',
      description: 'Learn to build complete web applications from frontend to backend.',
      duration: '8 months',
      level: 'Beginner',
      rating: 4.9,
      students: 2100,
      price: '$1299',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop'
    },
    {
      id: 3,
      title: 'Cybersecurity',
      description: 'Protect digital assets and learn ethical hacking techniques.',
      duration: '4 months',
      level: 'Advanced',
      rating: 4.7,
      students: 890,
      price: '$799',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop'
    }
  ]

  const stats = [
    { number: 5000, label: 'Students Trained', suffix: '+' },
    { number: 50, label: 'Expert Instructors', suffix: '+' },
    { number: 95, label: 'Employment Rate', suffix: '%' },
    { number: 100, label: 'Corporate Partners', suffix: '+' }
  ]

  // Counting animation effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCount();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [hasAnimated]);


  const animateCount = () => {
    const duration = 5000; // 5 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Smooth easing
      
      const newStats = stats.map((stat, index) => {
        const targetValue = stat.number;
        const currentValue = Math.floor(targetValue * easeOutQuart);
        return currentValue;
      });
      
      setAnimatedStats(newStats);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        // Set final values
        setAnimatedStats(stats.map(stat => stat.number));
      }
    }, stepDuration);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white overflow-hidden pt-0 pb-0">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-32">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Side - Content and Statistics Combined */}
            <motion.div 
              className="flex-1 space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Main Heading */}
              <motion.h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight pt-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-white">Empowering </span>
                <br/>
                <span className="text-blue-300">Students </span>
                <br />
                <span className="text-white">with Job-Ready Skills</span>
                <br />
              </motion.h1>
              
              {/* Key Benefits */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base text-gray-200">Learn In-Demand Skills with Expert Training.</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.0 }}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base text-gray-200">Assess Your Knowledge with Interactive Skill Tests.</span>
                </motion.div>
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                >
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base text-gray-200">Get Certified & Advance Your Career.</span>
                </motion.div>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                <Link
                  to="/courses"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                    <span>Explore Courses</span>
                </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg"
                  >
                    <ArrowRight size={20} className="mr-2" />
                    <span>Take a Skill Test</span>
                  </button>
                </motion.div>
              </motion.div>
              
              {/* Statistics Section - Within the same container */}
              <motion.div 
                className="mt-12 pt-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-left">
                    <div className="flex justify-start mb-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                    <div className="text-2xl font-bold text-white mb-1">15+ Years</div>
                    <div className="text-gray-300 text-sm">of Industry Experience</div>
                  </div>
                  <div className="text-left">
                    <div className="flex justify-start mb-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                </div>
                    <div className="text-2xl font-bold text-white mb-1">300+ Students</div>
                    <div className="text-gray-300 text-sm">Enrolled in Our Programs</div>
                  </div>
                  <div className="text-left">
                    <div className="flex justify-start mb-3">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                    <div className="text-1xl font-bold text-white mb-1">100+ Certifications</div>
                    <div className="text-gray-300 text-sm">Issued to Successful Learners</div>
              </div>
            </div>
              </motion.div>
            </motion.div>
            
            {/* Right Side - Girl Image */}
            <motion.div 
              className="hidden lg:flex justify-center items-center relative h-full"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div 
                className="relative flex items-end"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {/* Girl Image */}
                    <img 
                      src="https://tegaedu.com/static/images/finalgirliconfix.9b5637fb479e.png"
                      alt="Professional TEGA Student"
                  className="w-full h-full max-h-[83vh] object-contain object-bottom pb-0"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/40 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-indigo-200/40 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-200/40 rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Our Impact in Numbers
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Transforming lives through quality education and industry-relevant training
            </motion.p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className={`text-center group hover:scale-105 transition-all duration-700 ${
                  hasAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Stat Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                  {/* Number */}
                  <div className={`text-4xl md:text-5xl font-bold text-blue-600 mb-3 group-hover:text-blue-700 transition-all duration-300 ${
                    hasAnimated && animatedStats[index] < stat.number ? 'animate-pulse' : ''
                  }`}>
                    {animatedStats[index]}{stat.suffix}
                  </div>
                  
                  {/* Label */}
                  <div className="text-gray-700 font-semibold text-lg group-hover:text-gray-900 transition-colors mb-4">
                    {stat.label}
                  </div>
                  
                  {/* Progress bar during animation */}
                  {hasAnimated && (
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${(animatedStats[index] / stat.number) * 100}%`,
                          transition: 'width 0.1s ease-out'
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl h-96 lg:h-[32rem]">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="TEGA Students Learning"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Join Our Community</h3>
                <p className="text-blue-100">Be part of 10,000+ successful learners</p>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="max-w-2xl mx-auto lg:mx-0">
              <div className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                About TEGA
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Empowering Futures Through <span className="text-blue-600">Quality Education</span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                At TEGA, we're committed to transforming lives through comprehensive training and skill development. 
                Our industry-aligned programs are designed to bridge the gap between education and employment, 
                equipping you with the tools needed to thrive in today's competitive job market.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {[
                  { icon: Briefcase, title: 'Industry Experts', desc: 'Learn from professionals with real-world experience' },
                  { icon: BookOpen, title: 'Practical Learning', desc: 'Hands-on projects and real-world applications' },
                  { icon: Medal, title: 'Certification', desc: 'Earn recognized certifications upon completion' },
                  { icon: Laptop, title: 'Flexible Learning', desc: 'Study at your own pace, anytime, anywhere' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/courses" 
                  className="btn btn-primary px-8 py-3 text-lg"
                >
                  Explore Courses
                </Link>
                <Link 
                  to="/register" 
                  className="btn btn-outline border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/30 px-8 py-3 text-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <ServicesSection />

      {/* Enhanced Why Choose TEGA Section */}
      <section className="py-14 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden pt-1">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 font-semibold text-sm mb-6">
              Why Choose TEGA?
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-gray-900">Experience excellence in education with our </span>
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                proven track record
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We provide comprehensive training programs designed to help you succeed in today's competitive job market with industry-endorsed curriculum and expert mentorship.
            </p>
          </motion.div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left side - Industry Endorsed Card */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full translate-y-12 -translate-x-12"></div>
                
                <div className="relative z-10">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold mb-6">
                    INDUSTRY ENDORSED
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    Certified by Experts, Trusted by Industry
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    Our programs are developed in collaboration with industry leaders and certified by top organizations, ensuring you receive the most relevant and up-to-date training.
                  </p>
                  
                  {/* Enhanced Logo section */}
                  <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">TEGA</h4>
                      <p className="text-sm text-gray-600">Training and Employment Generation Activity</p>
                    </div>
                  </div>
                  
                  {/* Enhanced Stats */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600 mb-1">98%</div>
                      <div className="text-sm text-gray-600 font-medium">Satisfaction Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-3xl font-bold text-purple-600 mb-1">15+</div>
                      <div className="text-sm text-gray-600 font-medium">Years Experience</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Right side - Features grid */}
            <motion.div 
              className="grid grid-cols-1 gap-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className={`${feature.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border border-white/50 backdrop-blur-sm relative overflow-hidden`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Subtle background pattern */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
                  
                  <div className="relative z-10 flex items-center space-x-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-gray-700 transition-colors">
                        {feature.title}
                      </h4>
                      <p className={`${feature.iconColor} font-semibold text-sm`}>
                        {feature.description}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-gray-400 transition-colors"></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          {/* Enhanced Bottom CTA section */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 max-w-5xl mx-auto relative overflow-hidden">
              {/* Background decorations */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 -translate-x-16"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-indigo-100 to-blue-100 rounded-full translate-y-20 translate-x-20"></div>
              
              <div className="relative z-10">
                <div className="inline-block px-6 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-green-700 font-semibold text-sm mb-6">
                  Start Your Journey Today
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  Ready to Transform Your Career?
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of successful professionals who have advanced their careers with TEGA's industry-endorsed training programs. Your future starts here.
                </p>
                
                {/* Enhanced buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link 
                    to="/courses" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <span>Explore Programs</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link 
                    to="/register" 
                    className="border-2 border-blue-600 text-blue-600 px-10 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                  >
                    <span>Get Started Today</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Industry Certified</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>98% Success Rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our most popular courses that have helped thousands of students advance their careers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <div key={course.id} className="card overflow-hidden group">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-500">{course.duration}</span>
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  
                  <Link 
                    to={`/courses`}
                    // /courses/${course.id}
                    className="btn-primary w-full text-center"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/courses"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:opacity-90 transition inline-flex items-center"
            >
              View All Courses
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

       <section className="py-12 px-6 md:px-16 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        
        {/* Left Image */}
        <div className="flex-1 flex justify-center">
          <img
            src="https://tegaedu.com/static/images/badge.c8bb6b144bb3.png" 
            alt="Certification"
            className="w-80 md:w-[420px] rounded-2xl  object-cover"
          />
        </div>

        {/* Right Content */}
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Get Career-Ready and Grow with Us!
          </h2>

          {/* Feature 1 */}
          <div className="flex items-start gap-4 mb-5">
            <Medal className="text-pink-600 w-7 h-7 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Earn Recognition
              </h3>
              <p className="text-gray-600">
                Get rewarded with certificates and badges for your achievements and projects.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4 mb-5">
            <Award className="text-pink-600 w-7 h-7 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Certifications that Matter
              </h3>
              <p className="text-gray-600">
                Gain industry-recognized certificates to boost your resume and career prospects.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4 mb-6">
            <Briefcase className="text-pink-600 w-7 h-7 mt-1" />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                Land Your Dream Job
              </h3>
              <p className="text-gray-600">
                Showcase your skills and experience to top recruiters and companies.
              </p>
            </div>
          </div>

          {/* Button */}
          <Link to="/register" className="btn btn-primary px-6 py-3 text-lg hover:scale-105 transition-transform duration-200 inline-block">
            Explore Opportunities
          </Link>
        </div>
      </div>
    </section>

   <section className="py-12 bg-gradient-to-br from-gray-50 to-blue-50">
  <div className="max-w-7xl mx-auto px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Learning Patterns</h2>
      <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
        Discover how our unique approaches make learning engaging, practical, and impactful.
      </p>
    </div>

    {/* Changed to 4 columns on large screens */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300 hover:shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1620856900883-e12a5ea43735?q=80&w=1654&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Interactive Learning"
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <BookOpen className="h-10 w-10 text-indigo-600 mb-4 group-hover:text-primary-600 transition-colors" />
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">Interactive Learning</h3>
          <p className="mt-2 text-gray-600">
            Experience engaging sessions designed to simplify complex concepts and make learning fun.
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
        <img
          src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=800&q=80"
          alt="Technology Driven"
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <Laptop className="h-10 w-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Technology-Driven</h3>
          <p className="mt-2 text-gray-600">
            Learn using modern tools, simulations, and real-time applications for hands-on experience.
          </p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
          alt="Collaborative Learning"
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <Users className="h-10 w-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Collaborative Learning</h3>
          <p className="mt-2 text-gray-600">
            Work in groups, share ideas, and grow through peer-to-peer discussions and teamwork.
          </p>
        </div>
      </div>

      {/* Card 4 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-300">
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80"
          alt="Skill-Oriented"
          className="w-full h-56 object-cover"
        />
        <div className="p-6">
          <Award className="h-10 w-10 text-indigo-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900">Skill-Oriented</h3>
          <p className="mt-2 text-gray-600">
            Gain industry-ready skills that prepare you for real-world challenges and career success.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* Why Choose TEGA Section */}
      <WhyChooseTega />

<section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-10">
  <h2 className="text-center text-white text-4xl font-bold mb-6">Our Associations</h2>


  <div className="overflow-hidden">
    <div className="flex animate-marquee-ltr space-x-10">
      <img src={copy1} className="h-20 w-auto rounded-md" />
      <img src={copy2} className="h-20 w-auto rounded-md" />
      <img src={copy3} className="h-20 w-auto rounded-md" />
      <img src={copy4} className="h-20 w-auto rounded-md" />
      <img src={copy5} className="h-20 w-auto rounded-md" />
      <img src={copy6} className="h-20 w-auto rounded-md" />
      <img src={copy7} className="h-20 w-auto rounded-md" />
      <img src={copy8} className="h-20 w-auto rounded-md" />
      <img src={copy9} className="h-20 w-auto rounded-md" />
      <img src={copy10} className="h-20 w-auto rounded-md" />
      <img src={copy11} className="h-20 w-auto rounded-md" />
      <img src={copy12} className="h-20 w-auto rounded-md" />
    </div>
  </div>


  <div className="overflow-hidden mt-6">
    <div className="flex animate-marquee-rtl space-x-10">
      <img src={copy1} className="h-20 w-auto rounded-md" />
      <img src={copy2} className="h-20 w-auto rounded-md" />
      <img src={copy3} className="h-20 w-auto rounded-md" />
      <img src={copy4} className="h-20 w-auto rounded-md" />
      <img src={copy5} className="h-20 w-auto rounded-md" />
      <img src={copy6} className="h-20 w-auto rounded-md" />
      <img src={copy7} className="h-20 w-auto rounded-md" />
      <img src={copy8} className="h-20 w-auto rounded-md" />
      <img src={copy9} className="h-20 w-auto rounded-md" />
      <img src={copy10} className="h-20 w-auto rounded-md" />
      <img src={copy11} className="h-20 w-auto rounded-md" />
      <img src={copy12} className="h-20 w-auto rounded-md" />
    </div>
  </div>
</section>

    {/* FAQ Section */}
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 mb-8">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-sm font-medium text-blue-700">Frequently Asked Questions</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Got Questions?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions about our courses, admissions, and career support.
          </p>
        </div>

        <div className="space-y-6">
          {/* FAQ Item 1 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 1 ? null : 1)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                What courses does TEGA offer?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 1 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 1 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  TEGA offers comprehensive courses in Data Science & AI, Full Stack Development (MERN), Mobile Applications (React Native & Flutter), Networking, IoT, AWS Cloud Computing, Cybersecurity, and Personality Development. All courses are designed with industry experts and include hands-on projects.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 2 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 2 ? null : 2)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Do I need prior experience to join TEGA courses?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 2 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 2 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  No prior experience is required for most of our courses! We offer courses for all skill levels - Beginner, Intermediate, and Advanced. Our expert instructors start from the basics and gradually build up to advanced concepts, ensuring everyone can follow along and succeed.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 3 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 3 ? null : 3)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                What kind of job placement support do you provide?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 3 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 3 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  We provide comprehensive job placement support including resume building, interview preparation, mock interviews, portfolio development, and direct connections with our industry partners. Our 95% job placement rate speaks to the effectiveness of our career support services.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 4 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 4 ? null : 4)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                Are the courses available online or offline?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 4 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 4 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  We offer both online and offline learning options to suit different learning preferences. Our online courses include live interactive sessions, recorded lectures, and hands-on labs. Offline courses are conducted in our state-of-the-art training centers with modern equipment and facilities.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 5 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 5 ? null : 5)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                What certifications will I receive after completing a course?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 5 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 5 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  Upon successful completion of any course, you'll receive industry-recognized certificates from TEGA. Additionally, we help you prepare for and obtain relevant industry certifications like AWS, Microsoft, Cisco, and others depending on your chosen course. These certifications significantly boost your career prospects.
                </p>
              </div>
            )}
          </div>

          {/* FAQ Item 6 */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <button
              className="w-full px-8 py-6 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-2xl"
              onClick={() => setOpenFAQ(openFAQ === 6 ? null : 6)}
            >
              <h3 className="text-lg font-semibold text-gray-900">
                How long are the courses and what is the fee structure?
              </h3>
              <div className={`transform transition-transform duration-200 ${openFAQ === 6 ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {openFAQ === 6 && (
              <div className="px-8 pb-6">
                <p className="text-gray-600 leading-relaxed">
                  Course durations vary from 3-8 months depending on the program. We offer flexible payment options including EMI plans, early bird discounts, and scholarship programs for deserving students. Contact our admissions team for detailed fee structure and payment plans tailored to your needs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

      {/* CTA Section */}
      <section className="py-12 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful professionals who have transformed their careers with TEGA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-primary text-lg py-3 px-8 flex items-center justify-center hover:scale-105 transition-transform duration-200"
                
            >
              Get Started Today
            </Link>
            <Link
              to="/courses"
              className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

    {/* Testimonials Section */}
    <section className="py-12 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-medium text-blue-100">What Our Students Say</span>
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Success Stories
            </span>
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
          >
            Hear from our students who have transformed their careers with TEGA's comprehensive training programs.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Testimonial 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Priya Sharma</h4>
                <p className="text-blue-200 text-sm">Data Science Graduate</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "TEGA's Data Science course completely transformed my career. The hands-on projects and expert mentorship helped me land a job at a top tech company within 3 months of graduation. The practical approach to learning made all the difference!"
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Rajesh Kumar</h4>
                <p className="text-blue-200 text-sm">Full Stack Developer</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "The MERN Stack course at TEGA was exceptional. The instructors are industry experts who provided real-world insights. I went from having no coding experience to becoming a full-stack developer in just 8 months!"
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Anita Patel</h4>
                <p className="text-blue-200 text-sm">Cloud Engineer</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "TEGA's AWS Cloud course gave me the skills and confidence to pursue cloud engineering. The certification program is top-notch, and the job placement assistance helped me secure a position with a 40% salary increase!"
            </p>
          </div>

          {/* Testimonial 4 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Suresh Reddy</h4>
                <p className="text-blue-200 text-sm">Mobile App Developer</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "The Mobile Applications course exceeded my expectations. The React Native and Flutter training was comprehensive, and I was able to build and publish my first app within 6 months. TEGA's support is incredible!"
            </p>
          </div>

          {/* Testimonial 5 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Meera Singh</h4>
                <p className="text-blue-200 text-sm">Network Administrator</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "TEGA's Networking course provided me with the technical foundation I needed. The hands-on labs and real-world scenarios prepared me perfectly for my current role as a Network Administrator at a Fortune 500 company."
            </p>
          </div>

          {/* Testimonial 6 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-3xl hover:border-white/40">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Kavya Nair</h4>
                <p className="text-blue-200 text-sm">IoT Specialist</p>
              </div>
            </div>
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-gray-300 leading-relaxed">
              "The IoT course at TEGA opened up a whole new world of opportunities for me. The practical projects and industry connections helped me start my own IoT consulting business. Highly recommended for anyone interested in emerging technologies!"
            </p>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1000+</div>
              <div className="text-sm text-gray-400">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-sm text-gray-400">Job Placement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15+</div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
          </div>
          </div>
        </div>
      </section>

       <section className="relative bg-gradient-to-r from-blue-100 via-white to-blue-100 py-12 px-6 lg:px-20">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 drop-shadow-md">
          Contact <span className="text-blue-600">Us</span>
        </h1>
        <p className="mt-3 text-gray-600 text-lg">
          Have questions? We’d love to hear from you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left - Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Send us a Message
          </h2>
          <p className="text-gray-600 mb-8">We'll get back to you soon</p>

          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300"
              />
            </div>

            <textarea
              placeholder="Write your message..."
              rows="4"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all hover:border-blue-300 resize-none"
            ></textarea>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Right - Contact Image */}
        <div className="relative w-full h-full min-h-[500px]">
          <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden" style={{backgroundColor: 'rgb(21, 45, 223)'}}>
            <img
              src={contactImage}
              alt="Contact Us"
              className="w-full h-full object-contain object-center"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Video Modal */}
    {showVideoModal && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">TEGA Course Overview</h3>
            <button
              onClick={() => setShowVideoModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
          
          {/* Video Content */}
          <div className="p-6">
            <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play size={32} className="text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">Course Introduction Video</h4>
                <p className="text-gray-600 mb-6">Discover what makes TEGA the leading choice for professional development</p>
                
                {/* Video Placeholder with Gallery Images */}
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play size={24} className="text-white" />
                      </div>
                      <p className="text-lg font-semibold">Course Overview Video</p>
                      <p className="text-sm text-gray-300">Featuring real TEGA students and success stories</p>
                    </div>
                  </div>
                  
                  {/* Gallery Images as Background Slideshow */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="grid grid-cols-3 gap-2 h-full">
                      <img src={copy1} alt="TEGA Event" className="w-full h-full object-cover" />
                      <img src={copy2} alt="TEGA Students" className="w-full h-full object-cover" />
                      <img src={copy3} alt="TEGA Certificate" className="w-full h-full object-cover" />
                      <img src={copy4} alt="TEGA Training" className="w-full h-full object-cover" />
                      <img src={copy5} alt="TEGA Success" className="w-full h-full object-cover" />
                      <img src={copy6} alt="TEGA Community" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
                
                {/* Course Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Users size={20} className="text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-1">Expert Mentors</h5>
                    <p className="text-sm text-gray-600">Learn from industry professionals</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Award size={20} className="text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-1">Certification</h5>
                    <p className="text-sm text-gray-600">Industry-recognized credentials</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Briefcase size={20} className="text-white" />
                    </div>
                    <h5 className="font-bold text-gray-900 mb-1">Job Placement</h5>
                    <p className="text-sm text-gray-600">95% placement assistance</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/courses"
                onClick={() => setShowVideoModal(false)}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-center"
              >
                Explore All Courses
              </Link>
              <Link
                to="/register"
                onClick={() => setShowVideoModal(false)}
                className="flex-1 border-2 border-blue-600 text-blue-600 font-semibold py-3 px-6 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-center"
              >
                Start Learning Today
              </Link>
            </div>
          </div>
        </div>
      </div>
    )}

    </div>
  )
}

// HomePage component - scroll functionality moved to global component
export default HomePage
