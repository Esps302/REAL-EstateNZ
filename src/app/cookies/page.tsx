export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-8 tracking-tight">Cookie Settings</h1>
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-200">
          <p className="text-lg text-zinc-700 leading-relaxed mb-6">
            We use cookies to improve your experience on our platform, analyze site traffic, and securely manage your authentication sessions.
          </p>
          <div className="space-y-4">
            <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900">Essential Cookies</h3>
                <p className="text-sm text-zinc-500">Required for authentication and security (Always On)</p>
              </div>
              <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="p-4 border border-zinc-200 rounded-xl bg-zinc-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900">Analytics & Performance</h3>
                <p className="text-sm text-zinc-500">Help us understand how you use the platform</p>
              </div>
              <div className="w-12 h-6 bg-zinc-900 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <button className="mt-8 px-6 py-3 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors">
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
