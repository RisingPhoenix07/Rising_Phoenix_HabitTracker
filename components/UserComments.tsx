'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Save } from 'lucide-react';

interface UserCommentsProps {
  selectedDate: string;
}

export default function UserComments({ selectedDate }: UserCommentsProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/comments?date=${selectedDate}`)
      .then((res) => (res.ok ? res.json() : { content: '' }))
      .then((data) => {
        if (data && typeof data.content === 'string') {
          setContent(data.content);
        } else {
          setContent('');
        }
      })
      .catch(() => setContent(''));
  }, [selectedDate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, content }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save comment:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sky-400" /> Daily Reflection & Notes
        </h2>
        {saved && <span className="text-xs text-emerald-400 font-bold">Saved!</span>}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write down your thoughts, wins, or notes for today..."
        rows={4}
        className="w-full bg-slate-950/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-400 transition-all resize-none"
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-sky-500/20 disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
