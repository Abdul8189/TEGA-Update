import React from 'react';
import { FileText, Gavel, UserCheck, Shield, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white pt-6 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <FileText className="h-12 w-12 mr-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold">Terms & Conditions</h1>
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
            Welcome to TEGA. These terms and conditions outline the rules and regulations for the use of our website and services.
            By accessing this website, we assume you accept these terms and conditions in full.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <Gavel className="mr-2 h-6 w-6 text-blue-600" />
            Intellectual Property Rights
          </h2>
          <p>
            Unless otherwise stated, TEGA and/or its licensors own the intellectual property rights for all material on this website. 
            All intellectual property rights are reserved. You may view and/or print pages from this website for your own personal 
            use subject to restrictions set in these terms and conditions.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <UserCheck className="mr-2 h-6 w-6 text-blue-600" />
            User Accounts
          </h2>
          <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Maintaining the confidentiality of your account and password</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring that your account information is accurate and up-to-date</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <Shield className="mr-2 h-6 w-6 text-blue-600" />
            Prohibited Activities
          </h2>
          <p>You are specifically restricted from all of the following:</p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Publishing any website material in any other media</li>
            <li>Selling, sublicensing and/or otherwise commercializing any website material</li>
            <li>Using this website in any way that is or may be damaging to this website</li>
            <li>Using this website contrary to applicable laws and regulations</li>
            <li>Engaging in any data mining, data harvesting, data extracting or any other similar activity</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center">
            <AlertTriangle className="mr-2 h-6 w-6 text-blue-600" />
            Limitation of Liability
          </h2>
          <p>
            In no event shall TEGA, nor any of its officers, directors, and employees, be held liable for anything arising 
            out of or in any way connected with your use of this website whether such liability is under contract. TEGA, 
            including its officers, directors, and employees shall not be held liable for any indirect, consequential, or 
            special liability arising out of or in any way related to your use of this website.
          </p>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <p className="font-medium">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
