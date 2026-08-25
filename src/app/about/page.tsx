export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-8 tracking-tight">About Heaven Bricks</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200">
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            Welcome to Heaven Bricks, New Zealand's premier digital brokerage. We are dedicated to providing an exclusive, highly curated, and confidential purchasing experience for buyers and sellers of extraordinary properties.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            Our mission is to bridge the gap between luxury real estate and modern technology. Through our state-of-the-art platform, we empower you with intelligent matching, real-time analytics, and secure transaction management.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed">
            Whether you are looking for a cliffside retreat in Queenstown or a penthouse in Auckland, our team of expert brokers is here to guide you every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
}
