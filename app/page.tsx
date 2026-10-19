'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, TrendingUp, Edit2, Check, Quote, ArrowRight, Bird, BookOpen } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import SegmentProgressRing from '@/components/SegmentProgressRing';

const MOTIVATIONAL_QUOTES = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "The secret of getting ahead is getting started.",
  "Small daily improvements over time lead to stunning results.",
  "You don't have to be extreme, just consistent.",
  "Action is the foundational key to all success.",
  "Energy flows where attention goes."
];

export default function WelcomeDashboard() {
  const [userName, setUserName] = useState("Rising Phoenix");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [quote, setQuote] = useState("");
  const [segments, setSegments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<{ history: any[]; weeklyAverage: number; currentStreak: number }>({
    history: [],
    weeklyAverage: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
    const today = new Date().toISOString().split('T')[0];
    
    // Safely fetch tasks with response content-type validation
    fetch(`/api/tasks?date=${today}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return [];
      })
      .then((data) => {
        if (Array.isArray(data)) setSegments(data);
      })
      .catch((err) => console.error("Failed to load tasks:", err));

    // Safely fetch analytics with response content-type validation
    fetch('/api/analytics?days=7')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data && !data.error) setAnalytics(data);
      })
      .catch((err) => console.error("Failed to load analytics:", err));
  }, []);

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName);
    }
    setIsEditing(false);
  };

  let totalTasks = 0;
  let completedTasks = 0;
  segments.forEach((seg) => {
    seg.tasks?.forEach((task: any) => {
      totalTasks++;
      if (task.logs && task.logs.length > 0 && task.logs[0].completed) {
        completedTasks++;
      }
    });
  });

  const todayScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <main 
      className="relative min-h-screen bg-cover bg-center bg-fixed text-slate-100 p-4 md:p-8 font-['Comic_Sans_MS',_'Comic_Sans',_cursive]"
      style={{ backgroundImage: "url('/bg-phoenix.jpg')" }}
    >
      <div className="min-h-screen bg-slate-950/30 -m-4 md:-m-8 p-4 md:p-8 pb-16">
        <div className="max-w-5xl mr-auto lg:ml-8 space-y-8">
          
          {/* Header */}
          <header className="relative overflow-hidden rounded-2xl bg-slate-900/25 border border-slate-700/50 p-6 md:p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center p-1">
                    <Bird className="w-8 h-8 text-sky-400 stroke-[2] animate-pulse filter drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-slate-950/80 border border-sky-500 rounded-xl px-3 py-1 text-2xl font-bold text-white focus:outline-none"
                      />
                      <button onClick={handleSaveName} className="p-1 text-emerald-400 hover:text-emerald-300">
                        <Check className="w-6 h-6" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold text-white tracking-tight">{userName}</h1>
                      <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-sky-400 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="flex items-center gap-2 text-sm italic text-sky-300/90">
                  <Quote className="w-4 h-4 shrink-0 text-sky-400" /> "{quote}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/tracker"
                  className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-2xl shadow-lg shadow-sky-500/25 transition-all hover:scale-105"
                >
                  Enter Task Workspace <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  href="/notes"
                  className="inline-flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800/80 text-sky-400 hover:text-sky-300 font-semibold px-5 py-3 rounded-2xl border border-slate-700/60 transition-all backdrop-blur-md"
                >
                  <BookOpen className="w-4 h-4 text-sky-400" /> Notes
                </Link>
              </div>
            </div>
          </header>

          {/* High-Level Mastery Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-300">Active Streak</p>
                <p className="text-2xl font-black text-amber-400">{analytics.currentStreak || 0} Days</p>
              </div>
            </div>

            <div className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-4">
              <div className="p-3 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-400">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-300">Today's Score</p>
                <p className="text-2xl font-black text-sky-400">{todayScore}%</p>
              </div>
            </div>

            <div className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-300">7-Day Velocity</p>
                <p className="text-2xl font-black text-indigo-400">{analytics.weeklyAverage || 0}%</p>
              </div>
            </div>
          </section>

          {/* Recharts 7-Day Completion Trend */}
          {analytics.history && analytics.history.length > 0 && (
            <section className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Weekly Performance Trend</h2>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.history}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#CBD5E1" fontSize={12} tickLine={false} />
                    <YAxis stroke="#CBD5E1" fontSize={12} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', color: '#F8FAFC' }} />
                    <Area type="monotone" dataKey="percentage" stroke="#38BDF8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Category Breakdown */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Today's Category Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {segments.map((seg) => {
                const segTotal = seg.tasks?.length || 0;
                const segCompleted = seg.tasks?.filter((t: any) => t.logs?.length > 0 && t.logs[0].completed).length || 0;
                return (
                  <SegmentProgressRing
                    key={seg.id}
                    name={seg.name}
                    completedCount={segCompleted}
                    totalCount={segTotal}
                    color={segCompleted === segTotal && segTotal > 0 ? '#10B981' : '#38BDF8'}
                  />
                );
              })}
            </div>
          </section>

        </div>
      </div>

      <div className="fixed bottom-3 right-4 pointer-events-none z-50">
        <span className="text-xs italic font-medium text-slate-200/60 tracking-wide select-none">
          by Rez...
        </span>
      </div>
    </main>
  );
}
