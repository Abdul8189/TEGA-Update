import React, { useState } from 'react';
import { Search, MessageSquare, FileText, Mail, Phone, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const helpCategories = [
    {
      title: 'Getting Started',
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      description: 'Learn how to create an account, enroll in courses, and navigate the platform.',
      link: '/help/getting-started'
    },
    {
      title: 'Account & Profile',
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      description: 'Manage your account settings, update profile information, and change passwords.',
      link: '/help/account'
    },
    {
      title: 'Courses & Learning',
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      description: 'Access course materials, submit assignments, and track your progress.',
      link: '/help/courses'
    },
    {
      title: 'Payments & Refunds',
      icon: <FileText className="h-6 w-6 text-yellow-600" />,
      description: 'Information about payment methods, refunds, and billing issues.',
      link: '/help/payments'
    },
    {
      title: 'Technical Support',
      icon: <AlertCircle className="h-6 w-6 text-red-600" />,
      description: 'Troubleshoot technical issues with the platform and system requirements.',
      link: '/help/technical'
    },
    {
      title: 'Certificates & Credentials',
      icon: <CheckCircle className="h-6 w-6 text-indigo-600" />,
      description: 'Access and verify your course completion certificates.',
      link: '/help/certificates'
    }
  ];

  const popularArticles = [
    { title: 'How to reset your password', link: '/help/article/reset-password' },
    { title: 'System requirements for online learning', link: '/help/article/system-requirements' },
    { title: 'How to download course materials', link: '/help/article/download-materials' },
    { title: 'Understanding the course completion certificate', link: '/help/article/certificate-info' },
    { title: 'Troubleshooting video playback issues', link: '/help/article/video-playback' },
  ];

  const filteredCategories = helpCategories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">How can we help you today?</h1>
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-lg bg-white bg-opacity-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
                placeholder="Search our help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => (
              <a
                key={index}
                href={category.link}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-opacity-10">
                      {category.icon}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{category.title}</h3>
                    <p className="mt-1 text-gray-500">{category.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {popularArticles.map((article, index) => (
                <li key={index}>
                  <a
                    href={article.link}
                    className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-700">{article.title}</span>
                      <span className="ml-auto text-blue-600">Read →</span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-xl p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
            <p className="text-gray-600 mb-6">
              Our support team is available to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="mailto:support@tega.edu"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-blue-100"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Support
              </a>
              <a
                href="tel:+918143001777"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Support
              </a>
            </div>
            <div className="mt-4 text-sm text-gray-500 flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              Available Monday to Friday, 9:00 AM to 6:00 PM IST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
