"use client";

import React, { useState, useEffect } from "react";
import { Calculator } from "lucide-react";

interface MortgageCalculatorProps {
  propertyPrice: number;
}

export default function MortgageCalculator({ propertyPrice }: MortgageCalculatorProps) {
  const [price, setPrice] = useState(propertyPrice);
  const [deposit, setDeposit] = useState(propertyPrice * 0.2); // 20% default deposit
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [paymentFrequency, setPaymentFrequency] = useState<"Weekly" | "Fortnightly" | "Monthly">("Monthly");

  const [repayment, setRepayment] = useState(0);

  // Calculate repayment whenever inputs change
  useEffect(() => {
    const principal = price - deposit;
    if (principal <= 0) {
      setRepayment(0);
      return;
    }

    const monthlyInterestRate = (interestRate / 100) / 12;
    const numberOfMonths = loanTermYears * 12;

    let monthlyRepayment = 0;
    if (monthlyInterestRate === 0) {
      monthlyRepayment = principal / numberOfMonths;
    } else {
      monthlyRepayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfMonths)) / (Math.pow(1 + monthlyInterestRate, numberOfMonths) - 1);
    }

    let finalRepayment = 0;
    if (paymentFrequency === "Monthly") {
      finalRepayment = monthlyRepayment;
    } else if (paymentFrequency === "Fortnightly") {
      finalRepayment = (monthlyRepayment * 12) / 26;
    } else if (paymentFrequency === "Weekly") {
      finalRepayment = (monthlyRepayment * 12) / 52;
    }

    setRepayment(isFinite(finalRepayment) ? finalRepayment : 0);
  }, [price, deposit, interestRate, loanTermYears, paymentFrequency]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-2xl shadow-sm mb-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-zinc-100 gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Mortgage Calculator
            </h2>
            <p className="text-sm text-zinc-500 mt-1">Estimate your repayments based on current rates.</p>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl px-5 py-3 text-right">
            <div className="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-0.5">Estimated Repayment</div>
            <div className="text-3xl font-black text-zinc-900 tracking-tight">
              {formatCurrency(repayment)}<span className="text-sm font-medium text-zinc-500 tracking-normal"> / {paymentFrequency.toLowerCase().replace('ly', '')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Property Price */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Property Price</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input 
                type="number" 
                value={price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPrice(val);
                  if (deposit > val) setDeposit(val);
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-8 pr-4 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <input 
              type="range" 
              min={0} 
              max={Math.max(20000000, price * 1.5)} 
              step={10000}
              value={price} 
              onChange={(e) => {
                const val = Number(e.target.value);
                setPrice(val);
                if (deposit > val) setDeposit(val);
              }}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-zinc-200 rounded-full appearance-none"
            />
          </div>

          {/* Deposit */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Your Deposit</label>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {price > 0 ? Math.round((deposit / price) * 100) : 0}%
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
              <input 
                type="number" 
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-8 pr-4 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <input 
              type="range" 
              min={0} 
              max={price} 
              step={5000}
              value={deposit} 
              onChange={(e) => setDeposit(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-200 rounded-full appearance-none"
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Interest Rate (% p.a.)</label>
            <div className="relative">
              <input 
                type="number" 
                step="0.01"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pl-4 pr-10 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">%</span>
            </div>
             <p className="text-[10px] text-zinc-400 text-right mt-1 hover:text-blue-600 cursor-pointer transition-colors">Compare latest rates →</p>
          </div>

          {/* Loan Term */}
          <div className="space-y-2 lg:col-span-1">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Loan Term</label>
            <div className="relative">
              <select 
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 px-4 font-bold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                {[10, 15, 20, 25, 30].map(year => (
                  <option key={year} value={year}>{year} Years</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Payment Frequency */}
          <div className="space-y-2 lg:col-span-2">
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Payment Frequency</label>
            <div className="flex bg-zinc-100 p-1 rounded-xl">
              {["Weekly", "Fortnightly", "Monthly"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setPaymentFrequency(freq as any)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentFrequency === freq ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'}`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
