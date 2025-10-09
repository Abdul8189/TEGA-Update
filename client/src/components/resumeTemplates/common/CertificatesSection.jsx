import React from 'react';

const CertificatesSection = ({ data, heading, className, headingClassName }) => {
  if (!data || data.length === 0) return null;

  return (
    <section className={`mb-6 ${className}`}>
      <h2 className={headingClassName || 'text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1'}>{heading || 'Certificates'}</h2>
      <div className="space-y-2">
        {data.map((certificate, index) => (
          <div key={index}>
            <h3 className="font-semibold text-gray-800">{certificate.name}</h3>
            <p className="text-sm text-gray-600">{certificate.issuer} - {certificate.date ? new Date(certificate.date).toLocaleDateString() : ''}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CertificatesSection;
