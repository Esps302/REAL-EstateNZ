import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Terms of Service</h1>
        <div className="prose prose-zinc prose-lg max-w-none">
          <p className="text-zinc-500 mb-12">Last Updated: August 2026</p>
          
          <p className="lead text-xl text-zinc-700 font-medium mb-10">
            Welcome to Heaven Bricks. We believe in complete transparency and trust. These terms outline the rules of our platform in plain, understandable language, ensuring you know exactly what to expect when you partner with us.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">1. Our Commitment to You</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            By using the Heaven Bricks platform, you are entering into a partnership with New Zealand's premier digital brokerage. We commit to providing you with accurate, up-to-date, and strictly confidential real estate listings and services. In return, we ask that you use our platform responsibly and respectfully.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">2. Account Security & Privacy</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            When you create an account to view exclusive listings or submit a property, you are responsible for maintaining the confidentiality of your login credentials. Heaven Bricks employs enterprise-grade security to protect your data, but safeguarding your personal password is your responsibility.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">3. Property Information Accuracy</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            We go to great lengths to verify the properties listed on our platform. However, real estate markets move quickly. While we strive for absolute accuracy in our property descriptions, pricing, and availability, we cannot guarantee that every piece of information is entirely free of errors. We recommend verifying critical details directly with our brokers before making financial commitments.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">4. Intellectual Property</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            The beautiful photography, virtual tours, written copy, and overall design of Heaven Bricks are the exclusive property of Heaven Bricks Limited. You are welcome to browse and share links to our properties, but you may not scrape, copy, or redistribute our high-resolution assets for commercial use without our explicit written consent.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">5. Ethical Use of Our Platform</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            Heaven Bricks is a professional environment. We do not tolerate fraudulent inquiries, the submission of fake properties, or any behavior that compromises the integrity of our digital brokerage. We reserve the right to suspend or terminate accounts that engage in deceptive practices.
          </p>

          <h2 className="text-2xl font-bold mt-12 mb-6">6. Changes to These Terms</h2>
          <p className="mb-6 text-zinc-600 leading-relaxed">
            As our platform evolves, so too might these terms. We will always notify you of significant changes via email or a prominent notice on our website. Your continued use of Heaven Bricks after these changes implies your acceptance of the new terms.
          </p>
          
          <div className="mt-16 p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
            <h3 className="text-xl font-bold mb-4">Questions about these terms?</h3>
            <p className="text-zinc-600 mb-0">
              We want you to feel completely comfortable using our platform. If anything in these terms is unclear, please reach out to our legal team at <strong>legal@heavenbricks.com</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
