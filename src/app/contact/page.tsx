import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Heaven Bricks | Real Estate Support & Offices New Zealand",
  description: "Get in touch with Heaven Bricks Auckland office for property appraisals, buyer representation, and seller listings across New Zealand.",
  keywords: [
    "Contact Heaven Bricks",
    "real estate office Auckland",
    "property agent contact NZ",
    "Papakura real estate office",
  ],
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 pt-28 md:pt-32 pb-20 font-sans relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0073e6] bg-blue-50 px-3 py-1 rounded-full">
            We Are Here To Help
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mt-3 mb-3 tracking-tight">
            Contact Us
          </h1>
          <p className="text-base md:text-lg text-zinc-600 max-w-2xl">
            Whether you want to schedule a confidential appraisal, ask about an exclusive listing, or get support, our team is at your disposal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Column */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-zinc-200">
            <h2 className="text-2xl font-bold text-zinc-900 mb-2">Send an Inquiry</h2>
            <p className="text-sm text-zinc-500 mb-8">
              Fill out the form below and one of our licensed brokers will reach out shortly.
            </p>
            <ContactForm />
          </div>

          {/* Contact Details & Office Column */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Auckland Office Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200">
              <h3 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0073e6]" />
                Auckland Headquarters
              </h3>

              <div className="space-y-4 text-sm text-zinc-600">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-zinc-900 font-semibold">Office Address</strong>
                    <span>6 Emerald Avenue, Rosehill, Papakura</span>
                    <span className="block text-zinc-500">Auckland, New Zealand 2113</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-zinc-900 font-semibold">Email Us</strong>
                    <a href="mailto:Info@spsolutions.org.nz" className="text-[#0073e6] hover:underline font-medium">
                      Info@spsolutions.org.nz
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-zinc-900 font-semibold">Phone Inquiries</strong>
                    <a href="tel:+64210468503" className="text-zinc-900 font-medium hover:text-[#0073e6] transition-colors">
                      +64 210468503
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-zinc-900 font-semibold">Office Hours</strong>
                    <span>Monday - Friday: 8:30 AM - 6:00 PM</span>
                    <span className="block text-zinc-500">Saturday: By Appointment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidentiality / Trust Card */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base">Strict Confidentiality</h4>
                  <p className="text-xs text-zinc-400">Discreet Real Estate Services</p>
                </div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                All client discussions, high-value asset valuations, and purchase inquiries are governed by strict non-disclosure practices.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
