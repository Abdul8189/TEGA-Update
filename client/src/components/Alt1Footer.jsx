import { Link } from "react-router-dom";
import {
  Facebook,
  Youtube,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Send,
} from "lucide-react";
import logo from "../assets/tegalog.png";

const Alt1Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "FAQs & Help", href: "/faqs" },
  ];

  const careers = [
    { name: "Job Openings", href: "/careers" },
    { name: "Employee Success", href: "/success" },
    { name: "Benefits", href: "/benefits" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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
              Empowering individuals with quality training and creating
              employment opportunities for a better future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Careers */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Careers</h4>
            <ul className="space-y-3">
              {careers.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Stay Connected</h4>

            {/* Social Links */}
            <div className="flex space-x-4 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-11 h-11 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                  aria-label={social.name}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <MapPin size={18} />
                <span>123 Training Street, Tech City, TC 12345</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Mail size={18} />
                <span>info@tega.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h5 className="text-sm font-medium mb-3">
                Subscribe to our Newsletter
              </h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-r-lg transition-colors duration-300">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            All Rights Reserved By TEGA © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Alt1Footer;
