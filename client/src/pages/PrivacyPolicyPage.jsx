import React from 'react';
import { Shield, Lock, User, Mail, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Shield className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold">Privacy Policy</h1>
          </div>
          <p className="text-xl text-blue-100 text-center max-w-3xl mx-auto">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose lg:prose-xl text-gray-700">
          <p className="text-lg">
            At TEGA, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <Lock className="mr-2 h-6 w-6 text-blue-600" />
            Information We Collect
          </h2>
          <p>We may collect the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Demographic information (age, gender, location, etc.)</li>
            <li>Educational background and employment information</li>
            <li>Payment and billing information</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <User className="mr-2 h-6 w-6 text-blue-600" />
            How We Use Your Information
          </h2>
          <p>We may use your information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>To provide and maintain our services</li>
            <li>To process your transactions</li>
            <li>To communicate with you about your account or our services</li>
            <li>To improve our services and develop new features</li>
            <li>To send promotional and marketing communications (with your consent)</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <Database className="mr-2 h-6 w-6 text-blue-600" />
            Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet 
            or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <Mail className="mr-2 h-6 w-6 text-blue-600" />
            Contact Us
          </h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <p className="mt-4 bg-gray-50 p-4 rounded-lg">
            <strong>Email:</strong> privacy@tega.edu<br />
            <strong>Phone:</strong> +91-8143001777<br />
            <strong>Address:</strong> NCK Plaza SBI Bank building, Vijayawada
          </p>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <p className="font-medium">
              By using our services, you acknowledge that you have read and understood this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
