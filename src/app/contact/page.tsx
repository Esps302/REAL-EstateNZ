export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-8 tracking-tight">Contact Us</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900">Get in Touch</h2>
            <p className="text-lg text-zinc-700 leading-relaxed">
              Our support team and managing brokers are available to assist you with any inquiries regarding our platform or our exclusive listings.
            </p>
            
            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900 mb-2">Auckland Office</h3>
              <p className="text-zinc-600">Level 32, PwC Tower</p>
              <p className="text-zinc-600">15 Customs Street West</p>
              <p className="text-zinc-600 mb-4">Auckland 1010, NZ</p>
              
              <p className="text-zinc-900 font-medium">Email: <a href="mailto:brokerage@nzestates.com" className="text-blue-600 hover:underline">brokerage@nzestates.com</a></p>
              <p className="text-zinc-900 font-medium mt-1">Phone: +64 9 123 4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
