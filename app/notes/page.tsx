'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { MessageSquare, Save, Calendar, ArrowLeft, Plus, Hash } from 'lucide-react';

interface Note {
  id: string;
  text?: string;
  content?: string;
  createdAt: string;
  date?: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize date safely on client side
  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/comments/all');
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
      }
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Extract all unique hashtags (#tag)
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      const bodyText = note.content || note.text || '';
      const matches = bodyText.match(/#[a-zA-Z0-9_]+/g);
      if (matches) {
        matches.forEach((tag) => tagSet.add(tag.toLowerCase()));
      }
    });
    return Array.from(tagSet);
  }, [notes]);

  // Group notes chronologically by date and separately by hashtag
  const { taggedGroups, dateGroups } = useMemo(() => {
    const taggedMap: Record<string, Note[]> = {};
    const dateMap: Record<string, Note[]> = {};

    notes.forEach((note) => {
      const bodyText = note.content || note.text || '';
      const matches = bodyText.match(/#[a-zA-Z0-9_]+/g);

      if (matches && matches.length > 0) {
        matches.forEach((tag) => {
          const lowerTag = tag.toLowerCase();
          if (!taggedMap[lowerTag]) taggedMap[lowerTag] = [];
          if (!taggedMap[lowerTag].some((n) => n.id === note.id)) {
            taggedMap[lowerTag].push(note);
          }
        });
      }

      const formattedDate = new Date(note.createdAt).toLocaleDateString(undefined, {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!dateMap[formattedDate]) dateMap[formattedDate] = [];
      dateMap[formattedDate].push(note);
    });

    return { taggedGroups: taggedMap, dateGroups: dateMap };
  }, [notes]);

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, content: newNote }),
      });
      if (res.ok) {
        setNewNote('');
        fetchNotes();
      }
    } catch (err) {
      console.error('Failed to save note', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen text-slate-100 bg-slate-950 overflow-x-hidden font-['Comic_Sans_MS',_'Comic_Sans',_cursive]">
      {/* High-Clarity bg-notes.jpg Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-right bg-no-repeat opacity-80 pointer-events-none"
        style={{ backgroundImage: "url('/bg-notes.jpg')" }}
      />
      
      {/* Light dark overlay */}
      <div className="fixed inset-0 z-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none" />

      {/* Content Container - Left Aligned */}
      <main className="relative z-10 max-w-5xl mr-auto lg:ml-8 p-4 md:p-8 space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" /> Daily Notes & Reflections
          </h1>
        </div>

        {/* Input Form Card */}
        <div className="bg-slate-900/30 border border-slate-700/50 p-6 rounded-2xl shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-base font-semibold text-slate-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Add or Update Reflection
            </h2>
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={`Write notes for ${selectedDate || 'selected date'}... Use #tags (e.g. #academic, #ideas) to organize!`}
            rows={3}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={handleSaveNote}
              disabled={saving || !newNote.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </div>

        {/* Hashtag Filters */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-cyan-400" /> Filter by Hashtag Group
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  activeTag === null
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900/40 border border-slate-700 text-slate-200 hover:border-slate-500'
                }`}
              >
                All Entries ({notes.length})
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    activeTag === tag
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900/40 border border-slate-700 text-cyan-400 hover:border-cyan-500/50'
                  }`}
                >
                  {tag} ({taggedGroups[tag]?.length || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Feed Grouped By Date */}
        <div className="space-y-6">
          {loading ? (
            <p className="text-slate-400 text-sm">Loading notes archive...</p>
          ) : notes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-slate-400 text-sm bg-slate-950/20">
              No notes saved yet. Start writing above!
            </div>
          ) : activeTag ? (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                <Hash className="w-4 h-4" /> Grouped under {activeTag}
              </h2>
              <div className="grid gap-4">
                {taggedGroups[activeTag]?.map((note) => (
                  <div
                    key={note.id}
                    className="bg-slate-900/30 border border-slate-700/50 p-5 rounded-2xl space-y-2 backdrop-blur-md shadow-lg"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800/60 pb-2">
                      <span className="flex items-center gap-1.5 font-medium text-cyan-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                      {note.content || note.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            Object.entries(dateGroups).map(([dateStr, noteList]) => (
              <div key={dateStr} className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2 border-b border-slate-800/80 pb-1">
                  <Calendar className="w-3.5 h-3.5" /> {dateStr}
                </h2>
                <div className="grid gap-4">
                  {noteList.map((note) => (
                    <div
                      key={note.id}
                      className="bg-slate-900/30 border border-slate-700/50 p-5 rounded-2xl space-y-2 backdrop-blur-md shadow-lg"
                    >
                      <p className="text-sm text-slate-100 whitespace-pre-wrap leading-relaxed">
                        {note.content || note.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
