"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Building2, Globe } from "lucide-react";
import Image from "next/image";

export function Footer() {
 return (
 <footer className="bg-[#0f172a] text-zinc-400 py-8 border-t border-[#1e293b] mt-auto">
 <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
 <div className="flex flex-wrap lg:flex-nowrap lg:items-center justify-between gap-x-4 gap-y-10 lg:gap-6 mb-8">
 
  {/* Brand & About */}
  <div className="w-full lg:w-auto flex flex-col items-center lg:items-start text-center lg:text-left lg:max-w-[300px]">
  <Link href="/" className="inline-block mb-3 lg:-ml-2">
      <Image src="/images/logo-3.png" alt="Heaven Bricks Logo" width={220} height={65} className="object-contain lg:object-left" priority />
  </Link>
 <p className="text-sm leading-snug mb-3 max-w-[320px] lg:max-w-full">
 New Zealand's premier digital brokerage for exclusive and extraordinary properties. We provide a strictly confidential, end-to-end purchasing experience.
 </p>
 <div className="flex gap-4">
 <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
 </div>
 </div>

 {/* Quick Links */}
 <div className="w-[45%] md:w-auto flex flex-col items-start lg:items-start text-left">
 <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-base">Properties</h3>
 <ul className="space-y-2 text-base">
 <li><Link href="/search?type=buy" className="hover:text-white transition-colors">Properties for Sale</Link></li>
 <li><Link href="/search?type=rent" className="hover:text-white transition-colors">Properties for Rent</Link></li>
 <li><Link href="/search?query=Auckland" className="hover:text-white transition-colors">Auckland Real Estate</Link></li>
 <li><Link href="/search?query=Queenstown" className="hover:text-white transition-colors">Queenstown Estates</Link></li>
 <li><Link href="/sell" className="hover:text-white transition-colors">List your Property</Link></li>
 </ul>
 </div>

 {/* Platform */}
 <div className="w-[45%] md:w-auto flex flex-col items-start lg:items-start text-left">
 <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-base">Platform</h3>
 <ul className="space-y-2 text-base">
 <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
 <li><Link href="/agents" className="hover:text-white transition-colors">Our Brokers</Link></li>
 <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
 <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
 </ul>
 </div>

 {/* Contact */}
 <div className="w-full md:w-auto flex flex-col items-start lg:items-start text-left">
 <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-base">Contact Us</h3>
 <ul className="space-y-3 text-base">
 <li className="flex items-start gap-3 text-left">
 <MapPin className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-0.5" />
 <span>Level 32, PwC Tower<br />15 Customs Street West<br />Auckland 1010, NZ</span>
 </li>
 <li className="flex items-center gap-3 text-left">
 <Phone className="w-4 h-4 text-zinc-500 flex-shrink-0" />
 <span>+64 9 123 4567</span>
 </li>
 <li className="flex items-center gap-3 text-left">
 <Mail className="w-4 h-4 text-zinc-500 flex-shrink-0" />
 <span>brokerage@heavenbricks.com</span>
 </li>
 </ul>
 </div>

 </div>

 {/* Bottom Bar */}
 <div className="pt-2 border-t border-[#1e293b] flex flex-col md:flex-row justify-between items-center gap-2 text-xs md:text-sm">
 <p>&copy; {new Date().getFullYear()} Heaven Bricks Limited. All rights reserved.</p>
 <div className="flex gap-4">
 <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
 <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
 <Link href="/cookies" className="hover:text-white transition-colors">Cookie Settings</Link>
 </div>
 </div>
 </div>
 </footer>
 );
}
