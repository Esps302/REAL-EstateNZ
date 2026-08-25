"use client";

import React, { useMemo } from 'react';
import { Map, GraduationCap, Coffee, ShieldCheck, Bus, TrendingUp, Activity } from 'lucide-react';

interface NeighborhoodAnalyticsProps {
  city?: string;
  suburb?: string;
}

export default function NeighborhoodAnalytics({ city = "Auckland", suburb = "Central" }: NeighborhoodAnalyticsProps) {
  
  // Create deterministic fake data based on suburb name length + city length
  const hash = useMemo(() => {
    let h = 0;
    const str = `${suburb}${city}`;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    }
    return Math.abs(h);
  }, [city, suburb]);

  const scores = useMemo(() => {
    return {
      walkability: 60 + (hash % 40), // 60-100
      schools: 70 + ((hash >> 1) % 30), // 70-100
      transit: 50 + ((hash >> 2) % 50), // 50-100
      safety: 75 + ((hash >> 3) % 25), // 75-100
      lifestyle: 65 + ((hash >> 4) % 35), // 65-100
    };
  }, [hash]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Very Good";
    if (score >= 60) return "Average";
    return "Below Average";
  };

  const metrics = [
    { name: "Walkability", icon: <Map className="w-4 h-4" />, score: scores.walkability, desc: "Distance to daily errands" },
    { name: "Schools", icon: <GraduationCap className="w-4 h-4" />, score: scores.schools, desc: "Public & private education" },
    { name: "Transit", icon: <Bus className="w-4 h-4" />, score: scores.transit, desc: "Public transport access" },
    { name: "Safety", icon: <ShieldCheck className="w-4 h-4" />, score: scores.safety, desc: "Neighborhood crime rates" },
    { name: "Lifestyle", icon: <Coffee className="w-4 h-4" />, score: scores.lifestyle, desc: "Cafes, parks & dining" },
  ];

  return (
    <div className="bg-white border border-zinc-300 p-6 mb-6 rounded-sm shadow-sm relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 relative z-10 border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> 
            Neighborhood Analytics
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Data insights for {suburb ? `${suburb}, ` : ''}{city}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100 shadow-sm">
          <TrendingUp className="w-4 h-4" />
          High Demand Area
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative z-10">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex flex-col">
            <div className="flex justify-between items-end mb-2">
              <div className="flex items-center gap-2 text-zinc-800 font-bold text-sm">
                <div className="p-1.5 bg-zinc-100 rounded-md text-zinc-600">
                  {metric.icon}
                </div>
                {metric.name}
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-zinc-900">{metric.score}</span>
                <span className="text-xs text-zinc-500 font-medium ml-1">/ 100</span>
              </div>
            </div>
            
            <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden mb-1 border border-zinc-200/50">
              <div 
                className={`h-full rounded-full ${getScoreColor(metric.score)} transition-all duration-1000 ease-out`}
                style={{ width: `${metric.score}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center text-[11px] font-medium text-zinc-500">
              <span>{metric.desc}</span>
              <span className="uppercase tracking-wider">{getScoreLabel(metric.score)}</span>
            </div>
          </div>
        ))}

        {/* Mini Market Summary */}
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-col justify-center">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 border-b border-zinc-200 pb-2">Market Sentiment</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-zinc-700">Average Days on Market</span>
            <span className="font-bold text-zinc-900">{12 + (hash % 20)} Days</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-zinc-700">YoY Price Growth</span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">+{3 + (hash % 8)}.{hash % 9}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
