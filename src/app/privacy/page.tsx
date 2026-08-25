import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Privacy Policy</h1>
        <div className="prose prose-zinc prose-lg max-w-none">
          <p className="text-zinc-500 mb-12">Last Updated: August 2026</p>
          
          <p className="lead text-xl text-zinc-700 font-medium mb-10">
            At Heaven Bricks, your privacy is our ultimate luxury. We handle high-value transactions and exclusive clientele, which means we treat your personal data with the same strict confidentiality as a private viewing.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">1. Information We Collect</h2>
          <p className="mb-4 text-zinc-600 leading-relaxed">
            We only collect information that is absolutely necessary to provide you with a premium brokerage experience:
          </p>
          <ul className="list-disc pl-6 mb-6 text-zinc-600 space-y-2">
            <li><strong>Personal Details:</strong> Your name, email address, and phone number when you register or request a viewing.</li>
            <li><strong>Property Preferences:</strong> Your saved searches, favored locations, and budget parameters to help our Smart Match system work effectively.</li>
            <li><strong>Financial Information:</strong> If you proceed with an offer, we collect necessary financial verification documents through secure, encrypted channels.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6">2. How We Use Your Data</h2>
          <p className="mb-4 text-zinc-600 leading-relaxed">
            Your data is never sold to third-party marketers. We use your information exclusively to:
          </p>
          <ul className="list-disc pl-6 mb-6 text-zinc-600 space-y-2">
            <li>Curate and recommend properties that perfectly match your lifestyle.</li>
            <li>Facilitate communication between you and our expert brokers.</li>
            <li>Process legal and financial documentation for property transactions.</li>
            <li>Improve the speed and performance of our digital platform.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-12 mb-6">3. Our Security Standards</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            We employ bank-level encryption for all sensitive data stored on our servers. Access to your personal profile is strictly limited to authorized Heaven Bricks personnel who require it to assist you with your property journey. 
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">4. Third-Party Partners</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            To provide a seamless experience, we partner with trusted third-party services (such as secure payment gateways and verified identity checkers). These partners are legally bound by strict confidentiality agreements and are only granted access to the specific data required to perform their function.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">5. Your Digital Rights</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            You are in complete control of your digital footprint. You have the right to request a copy of all personal data we hold about you, request corrections to that data, or ask us to permanently delete your account and associated information from our servers at any time.
          </p>

          <div className="mt-16 p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
            <h3 className="text-xl font-bold mb-4">Contact Our Privacy Officer</h3>
            <p className="text-zinc-600 mb-0">
              If you have any concerns about how your data is handled, our dedicated Data Protection Officer is available to assist you directly at <strong>privacy@heavenbricks.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
