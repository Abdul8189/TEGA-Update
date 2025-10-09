import React from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
  MapPinIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col px-6 py-16">
      
      {/* Top Heading */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Get in Touch with Us
        </h1>
        <p className="text-lg text-gray-600">
          Have questions, ideas, or just want to say hello?  
          Fill out the form below, and our team will get back to you shortly.
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left: Form */}
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 relative inline-block">
            Contact Form
            <span className="absolute left-0 -bottom-2 w-1/2 h-1 bg-blue-600 rounded-full"></span>
          </h2>

          <form className="space-y-5">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="First Name"
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />
              </div>
              <div className="relative">
                <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                placeholder="Email Address"
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <PhoneIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                placeholder="Phone Number"
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              />
            </div>

            {/* Message */}
            <div className="relative">
              <PencilSquareIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              <textarea
                rows={4}
                placeholder="Write your message here..."
                className="pl-10 pr-4 py-3 w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
              ></textarea>
            </div>

            {/* Submit */}
            <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Send Message
            </button>
          </form>
        </div>

        {/* Right: Fixed Image */}
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1000&auto=format&fit=crop&q=80"
            alt="Contact Us"
            className="w-full h-[600px] object-cover md:rounded-none rounded-b-2xl"
          />
          <div className="absolute inset-0 bg-blue-900/20"></div>
        </div>
      </div>

      {/* Location Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Us Here
          </h2>
          <p className="text-lg text-gray-600">
            Visit our office in Vijayawada for personalized assistance and guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Office Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600 mr-3" />
                Office Details
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPinIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Address</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      NCK Plaza SBI Bank building<br />
                      Vijayawada, Andhra Pradesh<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <PhoneIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600 text-sm">+91-8143001777</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600 text-sm">tega@sandspacetechnologies.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <ClockIcon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Working Hours</h4>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <a
                  href="https://maps.google.com/?q=NCK+Plaza+SBI+Bank+building+Vijayawada"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <MapPinIcon className="h-5 w-5" />
                  <span>Get Directions</span>
                </a>
              </div>
            </div>
          </div>

          {/* Google Maps */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPinIcon className="h-6 w-6 text-blue-600 mr-3" />
                  Our Location
                </h3>
                <p className="text-gray-600 text-sm mt-2">
                  Click and drag to explore the area around our office
                </p>
              </div>
              
              <div className="relative h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3826.1234567890!2d80.6189!3d16.5062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a35a1a1a1a1a1a1%3A0x1a1a1a1a1a1a1a1a!2sNCK%20Plaza%2C%20SBI%20Bank%20building%2C%20Vijayawada%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="TEGA Office Location - NCK Plaza, SBI Bank building, Vijayawada"
                  className="w-full h-full"
                ></iframe>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                  <p className="text-sm text-gray-600">
                    📍 NCK Plaza SBI Bank building, Vijayawada, Andhra Pradesh
                  </p>
                  <a
                    href="https://maps.google.com/?q=NCK+Plaza+SBI+Bank+building+Vijayawada"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
