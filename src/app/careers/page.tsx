export default function CareersPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-8 tracking-tight">Careers</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200">
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            Join the team redefining New Zealand's real estate market. We are always looking for ambitious engineers, designers, and licensed brokers to join our fast-growing startup.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed">
            Please check back soon for open roles, or send your CV to <a href="mailto:brokerage@nzestates.com" className="text-blue-600 hover:underline">brokerage@nzestates.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
