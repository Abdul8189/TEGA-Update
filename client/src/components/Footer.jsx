import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Twitter,
  BookOpen,
  Award,
  Users,
  Calendar,
  Globe,
  Shield,
  HelpCircle,
  Lock,
} from "lucide-react";
import logo from "../assets/tegalog.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProtectedLink = (href, e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  const quickLinks = [
    { name: "About Us", href: "/about", icon: Users },
    { name: "Contact Us", href: "/contact", icon: Mail },
    { name: "Privacy Policy", href: "/privacy", icon: Shield },
    { name: "Terms & Conditions", href: "/terms", icon: Shield },
    { name: "FAQs & Help", href: "/faqs", icon: HelpCircle },
  ];

  const programs = [
    { name: "All Courses", href: "/courses", icon: BookOpen },
    { name: "Certifications", href: "/certifications", icon: Award },
    { name: "Resume Builder", href: "/resume-builder", icon: BookOpen, protected: true },
    { name: "Jobs & Internships", href: "/jobs", icon: Users, protected: true },
  ];

  const support = [
    { name: "Help Center", href: "/help", icon: HelpCircle },
    { name: "Contact Support", href: "/contact", icon: MessageCircle },
    { name: "Student Portal", href: "/student-portal", icon: Users },
    { name: "Technical Support", href: "/support", icon: Phone },
  ];

  const socialLinks = [
    { name: "Telegram", icon: MessageCircle, href: "https://t.me/tegaedu" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/tega-edu-b47a6934a/" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/tega_edu/?igsh=MTlweXpiZGcxczNrcQ%3D%3D#" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/tega_edu" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6 space-x-4">
              {/* Bigger Logo */}
              <img
                src={logo}
                alt="Tega Logo"
                className="h-20 w-20 object-contain"
              />
              <div>
                <h3 className="text-2xl font-extrabold tracking-wide">TEGA</h3>
                <p className="text-sm text-gray-400">
                  Training and Employment Generation Activity
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Empowering individuals with quality training and creating employment opportunities for a better future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Globe size={20} className="mr-2 text-blue-400" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <link.icon size={16} className="mr-2 group-hover:text-blue-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen size={20} className="mr-2 text-blue-400" />
              Programs
            </h4>
            {!user && (
              <p className="text-xs text-gray-500 mb-3 flex items-center">
                <Lock size={12} className="mr-1" />
                Some features require login
              </p>
            )}
            <ul className="space-y-3">
              {programs.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    onClick={link.protected ? (e) => handleProtectedLink(link.href, e) : undefined}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <link.icon size={16} className="mr-2 group-hover:text-blue-400 transition-colors" />
                    {link.name}
                    {link.protected && !user && (
                      <Lock size={12} className="ml-1 text-gray-500" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <HelpCircle size={20} className="mr-2 text-blue-400" />
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm flex items-center group"
                  >
                    <link.icon size={16} className="mr-2 group-hover:text-blue-400 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Send size={20} className="mr-2 text-blue-400" />
              Stay Connected
            </h4>

            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3 text-sm text-gray-400">
                <MapPin size={18} className="mt-0.5" />
                <span>NCK Plaza SBI Bank building, Vijayawada</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail size={18} />
                <a 
                  href="mailto:tega@sandspacetechnologies.com"
                  className="hover:text-white transition-colors"
                >
                  tega@sandspacetechnologies.com
                </a>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone size={18} />
                <a 
                  href="tel:+918143001777"
                  className="hover:text-white transition-colors"
                >
                  +91-8143001777
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="text-sm font-medium mb-3">
                Subscribe to Our Newsletter
              </h5>
              <p className="text-gray-400 text-xs mb-3">
                Stay updated with the latest news and updates from Tega e-Learning.
              </p>
              <form className="flex" onSubmit={(e) => {
                e.preventDefault();
                // Newsletter subscription would be implemented here
                alert('Thank you for subscribing! You will receive updates via email.');
              }}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-300 text-sm font-medium"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Key Features Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <Users size={24} className="text-white" />
              </div>
              <h5 className="text-white font-semibold mb-1">300+ Students</h5>
              <p className="text-gray-400 text-sm">Successfully Trained</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <Award size={24} className="text-white" />
              </div>
              <h5 className="text-white font-semibold mb-1">100+ Certificates</h5>
              <p className="text-gray-400 text-sm">Issued Successfully</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <BookOpen size={24} className="text-white" />
              </div>
              <h5 className="text-white font-semibold mb-1">15+ Courses</h5>
              <p className="text-gray-400 text-sm">Industry-Relevant</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mb-3">
                <Calendar size={24} className="text-white" />
              </div>
              <h5 className="text-white font-semibold mb-1">15+ Years</h5>
              <p className="text-gray-400 text-sm">Industry Experience</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              All Rights Reserved By TEGA © {currentYear}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>ISO 9001:2015 Certified</span>
              <span>•</span>
              <span>Trusted by 300+ Students</span>
              <span>•</span>
              <span>Made in India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
