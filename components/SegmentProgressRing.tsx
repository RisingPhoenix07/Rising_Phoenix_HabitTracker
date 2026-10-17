'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SegmentRingProps {
  name: string;
  completedCount: number;
  totalCount: number;
  color?: string;
}

export default function SegmentProgressRing({
  name,
  completedCount,
  totalCount,
  color = '#38BDF8',
}: SegmentRingProps) {
  const targetPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate percentage from 0 to target when scrolled into view
            setAnimatedPercentage(targetPercentage);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [targetPercentage]);

  // SVG Ring dimensions
  const radius = 42;
  const stroke = 7;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  return (
    <div 
      ref={cardRef}
      className="group flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 shadow-xl backdrop-blur-md hover:bg-slate-900/60 hover:border-sky-500/40 transition-all duration-500"
    >
      <div className="relative w-28 h-28 flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 overflow-visible">
          {/* Subtle Outer Glow Filter */}
          <defs>
            <filter id={`glow-${name.replace(/\s+/g, '-')}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Ring */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="opacity-60"
          />

          {/* Animated Glowing Progress Ring */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            filter={`url(#glow-${name.replace(/\s+/g, '-')})`}
            className="transition-all duration-1000 ease-out"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>

        {/* Center Percentage Text */}
        <div className="absolute text-center flex flex-col items-center justify-center">
          <span className="text-xl font-black text-slate-100 tracking-tight">
            {animatedPercentage}%
          </span>
        </div>
      </div>

      <h3 className="mt-3 text-sm font-bold text-slate-200 text-center tracking-wide group-hover:text-sky-300 transition-colors">
        {name}
      </h3>
      <p className="text-xs text-slate-400/80 mt-0.5">
        {completedCount} / {totalCount} Completed
      </p>
    </div>
  );
}
