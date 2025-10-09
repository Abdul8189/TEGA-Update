import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, BookOpen, CreditCard, User, Mail, Phone } from 'lucide-react';

const faqs = [
  {
    question: 'What courses do you offer?',
    answer: 'We offer a wide range of courses in various fields including technology, business, healthcare, and more. You can browse our complete course catalog on the Courses page.'
  },
  {
    question: 'How do I enroll in a course?',
    answer: 'To enroll in a course, simply create an account, browse our course catalog, select your desired course, and click on the "Enroll Now" button. Follow the on-screen instructions to complete your enrollment.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including credit/debit cards, net banking, UPI, and other popular payment gateways. All transactions are secure and encrypted.'
  },
  {
    question: 'Can I access courses on mobile devices?',
    answer: 'Yes, our platform is fully responsive and works on all devices including smartphones and tablets. You can access your courses anytime, anywhere.'
  },
  {
    question: 'Do you offer certificates upon course completion?',
    answer: 'Yes, we provide certificates of completion for all our courses. These certificates can be downloaded from your dashboard after successfully completing all course requirements.'
  },
  {
    question: 'What is your refund policy?',
    answer: 'We offer a 14-day money-back guarantee for most of our courses. If you\'re not satisfied with your purchase, you can request a refund within 14 days of enrollment.'
  },
  {
    question: 'How can I contact support?',
    answer: 'You can reach our support team through the Contact Us page, or email us at support@tega.edu. Our team typically responds within 24 hours.'
  },
  {
    question: 'Do you offer corporate training?',
    answer: 'Yes, we provide customized corporate training solutions. Please contact our corporate team at corporate@tega.edu for more information.'
  }
];

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <HelpCircle className="h-16 w-16 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              Find answers to common questions about our courses, enrollment process, payments, and more.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                <button
                  className="w-full px-6 py-5 text-left focus:outline-none flex justify-between items-center"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <div
                  className={`px-6 pb-5 pt-0 transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our support team is here to help you with any questions you might have.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mail className="h-10 w-10 text-blue-600 mx-auto" />,
                title: 'Email Us',
                description: 'Send us an email and we\'ll get back to you within 24 hours.',
                link: 'mailto:support@tega.edu',
                linkText: 'support@tega.edu'
              },
              {
                icon: <Phone className="h-10 w-10 text-blue-600 mx-auto" />,
                title: 'Call Us',
                description: 'Speak with our support team during business hours.',
                link: 'tel:+918143001777',
                linkText: '+91-8143001777'
              },
              {
                icon: <User className="h-10 w-10 text-blue-600 mx-auto" />,
                title: 'Live Chat',
                description: 'Chat with our support team in real-time.',
                link: '/contact',
                linkText: 'Start Chat'
              }
            ].map((item, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-lg transition-shadow">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <a 
                  href={item.link} 
                  className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
                >
                  {item.linkText} →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
