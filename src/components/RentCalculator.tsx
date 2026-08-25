"use client";

import React, { useState } from "react";
import { Calculator } from "lucide-react";

interface RentCalculatorProps {
 monthlyRent: number;
}

export function RentCalculator({ monthlyRent }: RentCalculatorProps) {
 const [leaseTerm, setLeaseTerm] = useState(12); // Default 12 months

 // NZ Bond is typically 4 weeks rent. 
 const weeklyRent = (monthlyRent * 12) / 52;
 const estimatedBond = weeklyRent * 4;
 const moveInCost = monthlyRent + estimatedBond;
 const totalLeaseCost = monthlyRent * leaseTerm;

 return (
 <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-zinc-200/80">
 <div className="flex items-center gap-2 mb-6">
 <Calculator className="w-5 h-5 text-zinc-700" />
 <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Lease Estimator</h2>
 </div>

 <div className="space-y-6">
 {/* Lease Term Slider */}
 <div>
 <div className="flex justify-between items-end mb-3">
 <label className="text-sm font-bold text-zinc-700">Lease Term</label>
 <span className="text-sm font-extrabold text-zinc-900">{leaseTerm} Months</span>
 </div>
 <div className="relative w-full h-1.5 bg-zinc-200 rounded-full">
 <div 
 className="absolute top-0 left-0 h-full bg-zinc-900 rounded-full" 
 style={{ width: `${(leaseTerm / 36) * 100}%` }}
 ></div>
 <input 
 type="range" 
 min="1" 
 max="36" 
 step="1"
 value={leaseTerm} 
 onChange={(e) => setLeaseTerm(Number(e.target.value))}
 className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
 />
 {/* Custom thumb (visual only) */}
 <div 
 className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-zinc-900 rounded-full shadow-sm pointer-events-none"
 style={{ left: `calc(${(leaseTerm / 36) * 100}% - 8px)` }}
 ></div>
 </div>
 </div>

 {/* Breakdown */}
 <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100 flex flex-col gap-3">
 <div className="flex justify-between items-center text-sm">
 <span className="font-medium text-zinc-500">Monthly Rent</span>
 <span className="font-bold text-zinc-900">${monthlyRent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
 </div>
 <div className="flex justify-between items-center text-sm">
 <span className="font-medium text-zinc-500">Estimated Bond (4 Weeks)</span>
 <span className="font-bold text-zinc-900">${estimatedBond.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
 </div>
 
 <div className="h-px w-full bg-zinc-200 my-1"></div>
 
 <div className="flex justify-between items-center">
 <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Est. Move-In Cost</span>
 <span className="text-lg font-extrabold text-zinc-900">${moveInCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
 </div>

 <div className="flex justify-between items-center mt-2 border-t border-zinc-200/50 pt-2">
 <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Term Cost</span>
 <span className="text-sm font-extrabold text-zinc-900">${totalLeaseCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
 </div>
 </div>
 </div>
 
 <p className="text-[10px] text-zinc-400 mt-4 text-center">
 *Estimates only. Exact bond and rent-in-advance requirements may vary.
 </p>
 </div>
 );
}
