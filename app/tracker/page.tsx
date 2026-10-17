'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, CheckCircle2, Circle, ChevronLeft, ChevronRight, 
  Flame, Plus, Trash2, MessageSquare, RefreshCw 
} from 'lucide-react';
import { getPhoenixStageImage } from '@/lib/phoenixStage';

export default function TaskWorkspace() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reflection comment states
  const [commentText, setCommentText] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  // UI modal / creation inputs
  const [addingToSegment, setAddingToSegment] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingSegment, setIsAddingSegment] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const fetchTasks = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setSegments(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComment = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/comments?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setCommentText(data.text || '');
      }
    } catch (err) {
      console.error('Failed to fetch comment:', err);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTasks(selectedDate);
      fetchComment(selectedDate);
    }
  }, [selectedDate]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!selectedDate) return;
    const newStatus = !currentStatus;

    setSegments((prev) =>
      prev.map((segment) => ({
        ...segment,
        tasks: segment.tasks.map((task: any) => {
          if (task.id === taskId) {
            return {
              ...task,
              logs: newStatus ? [{ id: 'temp', completed: true }] : [],
            };
          }
          return task;
        }),
      }))
    );

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, date: selectedDate, completed: newStatus }),
      });
    } catch (err) {
      console.error('Failed to toggle task:', err);
      fetchTasks(selectedDate);
    }
  };

  const handleAddTask = async (segmentId: string) => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await fetch('/api/manage/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim(), segmentId }),
      });
      if (res.ok) {
        setNewTaskTitle('');
        setAddingToSegment(null);
        fetchTasks(selectedDate);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      const res = await fetch(`/api/manage/tasks?id=${taskId}`, { method: 'DELETE' });
      if (res.ok) fetchTasks(selectedDate);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleAddSegment = async () => {
    if (!newSegmentName.trim()) return;
    try {
      const res = await fetch('/api/manage/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSegmentName.trim() }),
      });
      if (res.ok) {
        setNewSegmentName('');
        setIsAddingSegment(false);
        fetchTasks(selectedDate);
      }
    } catch (err) {
      console.error('Failed to add segment:', err);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Deleting this segment will delete all habits inside it. Proceed?')) return;
    try {
      const res = await fetch(`/api/manage/segments?id=${segmentId}`, { method: 'DELETE' });
      if (res.ok) fetchTasks(selectedDate);
    } catch (err) {
      console.error('Failed to delete segment:', err);
    }
  };

  const handleSaveComment = async () => {
    if (!selectedDate) return;
    setSavingComment(true);
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, text: commentText }),
      });
    } catch (err) {
      console.error('Failed to save comment:', err);
    } finally {
      setSavingComment(false);
    }
  };

  const changeDate = (days: number) => {
    if (!selectedDate) return;
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + days);
    setSelectedDate(curr.toISOString().split('T')[0]);
  };

  // Calculate Today's Percentage
  let totalTasks = 0;
  let completedTasks = 0;
  segments.forEach((seg) => {
    seg.tasks?.forEach((t: any) => {
      totalTasks++;
      if (t.logs && t.logs.length > 0 && t.logs[0].completed) {
        completedTasks++;
      }
    });
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const bgImage = getPhoenixStageImage(progressPercentage);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed text-slate-100 transition-all duration-1000 font-sans"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="min-h-screen bg-slate-950/80 backdrop-blur-sm p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Navigation & Date Bar */}
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" /> Back to Dashboard
            </Link>

            <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl">
              <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-800 rounded-lg transition">
                <ChevronLeft className="w-5 h-5 text-slate-400" />
              </button>
              <span className="font-mono text-sm font-semibold text-slate-200">{selectedDate || 'Loading...'}</span>
              <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-800 rounded-lg transition">
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </header>

          {/* Score Header */}
          <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-400">Today's Stage Progress</span>
              <span className="text-sky-400 font-mono font-bold text-lg">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </section>

          {/* Segment & Habit Checklist */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Habit Checklist</h2>
              <button
                onClick={() => setIsAddingSegment(true)}
                className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg border border-slate-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>

            {isAddingSegment && (
              <div className="bg-slate-900 border border-sky-500/50 p-4 rounded-xl flex items-center gap-2">
                <input
                  type="text"
                  placeholder="New Category Name..."
                  value={newSegmentName}
                  onChange={(e) => setNewSegmentName(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-sm w-full focus:outline-none"
                  autoFocus
                />
                <button onClick={handleAddSegment} className="bg-sky-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-sm">Save</button>
                <button onClick={() => setIsAddingSegment(false)} className="text-slate-400 hover:text-white text-sm">Cancel</button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-slate-500 font-medium animate-pulse">Loading habits...</div>
            ) : (
              segments.map((segment) => (
                <div key={segment.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-lg font-semibold text-slate-100">{segment.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAddingToSegment(segment.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-sky-400 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSegment(segment.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {addingToSegment === segment.id && (
                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        placeholder="Habit title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        className="bg-transparent text-slate-200 text-sm px-2 py-1 w-full focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleAddTask(segment.id)} className="bg-sky-500 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs">Add</button>
                      <button onClick={() => setAddingToSegment(null)} className="text-slate-400 hover:text-white text-xs">Cancel</button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {segment.tasks?.map((task: any) => {
                      const isCompleted = task.logs && task.logs.length > 0 && task.logs[0].completed;
                      return (
                        <div key={task.id} className="flex items-center justify-between gap-2 group">
                          <button
                            onClick={() => toggleTask(task.id, isCompleted)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                              isCompleted
                                ? 'bg-sky-950/20 border-sky-500/30 text-sky-200/90'
                                : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className={`text-sm font-medium ${isCompleted ? 'line-through text-slate-500' : ''}`}>{task.title}</span>
                            {isCompleted ? <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0" />}
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Daily Reflection Journal Box */}
          <section className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <MessageSquare className="w-4 h-4 text-sky-400" /> Daily Reflection
              </span>
              <button
                onClick={handleSaveComment}
                disabled={savingComment}
                className="text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-lg hover:bg-sky-500/20 transition"
              >
                {savingComment ? 'Saving...' : 'Save Note'}
              </button>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Record daily takeaways, blockers, or reflection comments here..."
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500/50"
            />
          </section>

        </div>
      </div>
    </div>
  );
}
