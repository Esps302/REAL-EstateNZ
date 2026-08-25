"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { ShieldCheck, Award, Star, TrendingUp, Medal, Trophy, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
interface AgentData {
  uid: string;
  name?: string;
  email?: string;
  role: string;
  [key: string]: any;
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const q = query(collection(db, "users"), where("role", "in", ["agent", "admin", "super_admin"]));
        const snap = await getDocs(q);
        const fetchedAgents: AgentData[] = [];
        snap.forEach(doc => {
          fetchedAgents.push({ ...doc.data(), uid: doc.id } as AgentData);
        });

        // If no agents found, we mock some for the UI demonstration
        if (fetchedAgents.length === 0) {
          fetchedAgents.push(
            { uid: "1", email: "sarah@nzestates.co.nz", role: "agent", name: "Sarah Jenkins" },
            { uid: "2", email: "michael@nzestates.co.nz", role: "agent", name: "Michael Chang" },
            { uid: "3", email: "elena@nzestates.co.nz", role: "agent", name: "Elena Rodriguez" },
            { uid: "4", email: "david@nzestates.co.nz", role: "agent", name: "David O'Connor" }
          );
        }

        setAgents(fetchedAgents);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  // Gamification logic: generate deterministic stats based on UID
  const getAgentStats = (uid: string) => {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) hash = Math.imul(31, hash) + uid.charCodeAt(i) | 0;
    hash = Math.abs(hash);

    const propertiesSold = 20 + (hash % 150);
    const totalVolume = propertiesSold * (0.8 + (hash % 100) / 100); // in millions
    const rating = 4.5 + (hash % 50) / 100;
    
    let tier = "Gold";
    let tierColor = "from-amber-200 to-amber-500 text-amber-900 border-amber-300";
    let icon = <Medal className="w-5 h-5 text-amber-700" />;

    if (propertiesSold > 120) {
      tier = "Diamond";
      tierColor = "from-cyan-100 to-blue-400 text-blue-900 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]";
      icon = <Trophy className="w-5 h-5 text-blue-800" />;
    } else if (propertiesSold > 80) {
      tier = "Platinum";
      tierColor = "from-slate-200 to-slate-400 text-slate-900 border-slate-300";
      icon = <Award className="w-5 h-5 text-slate-800" />;
    }

    return { propertiesSold, totalVolume, rating, tier, tierColor, icon };
  };

  // Sort agents by highest properties sold
  const sortedAgents = [...agents].sort((a, b) => {
    return getAgentStats(b.uid).propertiesSold - getAgentStats(a.uid).propertiesSold;
  });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-20 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-4 tracking-tight flex items-center justify-center gap-3">
            Elite Agent Leaderboard
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Our brokers don't just sell houses—they dominate the market. Explore our top-tier professionals ranked by successful closures and client satisfaction.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedAgents.map((agent, index) => {
              const stats = getAgentStats(agent.uid);
              const isTopThree = index < 3;

              return (
                <div 
                  key={agent.uid} 
                  className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${isTopThree ? 'border-indigo-100 ring-4 ring-indigo-50/50' : 'border-zinc-200'} transition-all hover:shadow-xl hover:-translate-y-1 relative`}
                >
                  {/* Rank Badge */}
                  <div className={`absolute top-0 left-6 w-12 h-14 ${isTopThree ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-800 text-white'} flex items-center justify-center font-black text-2xl rounded-b-xl z-10`}>
                    #{index + 1}
                  </div>

                  <div className="p-8 pt-12 relative">
                    {/* Tier Badge */}
                    <div className={`absolute top-6 right-6 px-3 py-1.5 rounded-full bg-gradient-to-r ${stats.tierColor} flex items-center gap-1.5 text-xs font-black uppercase tracking-wider`}>
                      {stats.icon}
                      {stats.tier}
                    </div>

                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-20 h-20 rounded-2xl bg-zinc-100 border border-zinc-200 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm relative">
                        {/* Fake avatar using UI Avatars */}
                        <Image 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.name || agent.email || "Agent")}&background=random&size=150`}
                          alt={agent.name || "Agent"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-1 leading-tight">{agent.name || agent.email?.split('@')[0]}</h3>
                        <div className="flex items-center gap-1 text-sm text-zinc-500 font-medium">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          Verified Broker
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                        <div className="text-2xl font-black text-zinc-900 mb-0.5">{stats.propertiesSold}</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Homes Sold</div>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                        <div className="text-2xl font-black text-zinc-900 mb-0.5">${stats.totalVolume.toFixed(1)}M</div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Volume</div>
                      </div>
                    </div>

                    {/* Rating & Contact */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-zinc-900">{stats.rating.toFixed(1)}</span>
                        <span className="text-sm text-zinc-500 font-medium">(120+ reviews)</span>
                      </div>
                      <Link 
                        href={`/agent/${agent.uid}`} 
                        className="text-indigo-600 font-bold text-sm hover:text-indigo-700 flex items-center gap-1"
                      >
                        View Profile &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
