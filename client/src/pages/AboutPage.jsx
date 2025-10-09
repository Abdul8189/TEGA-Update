import React from 'react';
import { Users, BookOpen, Award, Briefcase, Clock } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">About TEGA</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Empowering individuals with quality training and creating employment opportunities for a better future.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To provide high-quality, accessible education and training that empowers individuals to achieve their career 
                goals and meet the evolving needs of the job market.
              </p>
            </div>
            <div className="bg-blue-50 p-8 rounded-xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                To be a leading force in bridging the skills gap and creating employment opportunities through innovative 
                education and training solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Impact</h2>
            <p className="mt-4 text-xl text-gray-600">Transforming lives through education and training</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, number: '5000+', label: 'Students Trained' },
              { icon: BookOpen, number: '50+', label: 'Expert Trainers' },
              { icon: Award, number: '95%', label: 'Employment Rate' },
              { icon: Briefcase, number: '100+', label: 'Corporate Partners' },
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <stat.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Team</h2>
            <p className="mt-4 text-xl text-gray-600">Meet the people behind TEGA</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'John Doe', role: 'Founder & CEO', image: 'https://randomuser.me/api/portraits/men/1.jpg' },
              { name: 'Jane Smith', role: 'Director of Education', image: 'https://randomuser.me/api/portraits/women/1.jpg' },
              { name: 'Robert Johnson', role: 'Head of Operations', image: 'https://randomuser.me/api/portraits/men/2.jpg' },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                  <p className="text-blue-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Ready to start your journey with us?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students who have transformed their careers with our training programs.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/courses"
                className="bg-white text-blue-900 px-8 py-3 rounded-lg font-medium hover:bg-blue-100 transition-colors"
              >
                Explore Courses
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
