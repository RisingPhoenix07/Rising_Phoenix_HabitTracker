'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Plus, Trash2, CheckCircle2, Circle, Bird } from 'lucide-react';
import UserComments from '@/components/UserComments';

export default function TrackerPage() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newSegmentName, setNewSegmentName] = useState<string>('');
  const [newTaskInput, setNewTaskInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  const fetchTasks = async (dateStr: string) => {
    if (!dateStr) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${dateStr}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSegments(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchTasks(selectedDate);
    }
  }, [selectedDate]);

  // Instant Optimistic Task Toggle
  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    setSegments((prevSegments) =>
      prevSegments.map((seg) => ({
        ...seg,
        tasks: seg.tasks.map((task: any) => {
          if (task.id === taskId) {
            return {
              ...task,
              logs: !currentCompleted ? [{ completed: true }] : [],
            };
          }
          return task;
        }),
      }))
    );

    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          date: selectedDate,
          completed: !currentCompleted,
        }),
      });
    } catch (err) {
      console.error('Failed to sync toggle:', err);
      fetchTasks(selectedDate);
    }
  };

  // Instant Optimistic Segment Add
  const handleAddSegment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) return;

    const tempName = newSegmentName;
    setNewSegmentName('');

    try {
      const res = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tempName }),
      });
      if (res.ok) {
        fetchTasks(selectedDate);
      }
    } catch (err) {
      console.error('Failed to add segment:', err);
    }
  };

  // Instant Optimistic Segment Delete
  const handleDeleteSegment = async (segmentId: string) => {
    setSegments((prev) => prev.filter((seg) => seg.id !== segmentId));

    try {
      await fetch(`/api/segments?id=${segmentId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete segment:', err);
      fetchTasks(selectedDate);
    }
  };

  // Instant Optimistic Task Add
  const handleAddTask = async (segmentId: string) => {
    const title = newTaskInput[segmentId];
    if (!title || !title.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const newTask = { id: tempId, title, logs: [] };

    setSegments((prev) =>
      prev.map((seg) =>
        seg.id === segmentId ? { ...seg, tasks: [...seg.tasks, newTask] } : seg
      )
    );
    setNewTaskInput((prev) => ({ ...prev, [segmentId]: '' }));

    try {
      const res = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentId, title }),
      });
      const createdTask = await res.json();

      setSegments((prev) =>
        prev.map((seg) =>
          seg.id === segmentId
            ? {
                ...seg,
                tasks: seg.tasks.map((t: any) => (t.id === tempId ? createdTask : t)),
              }
            : seg
        )
      );
    } catch (err) {
      console.error('Failed to create task:', err);
      fetchTasks(selectedDate);
    }
  };

  // Instant Optimistic Task Delete
  const handleDeleteTask = async (taskId: string) => {
    setSegments((prev) =>
      prev.map((seg) => ({
        ...seg,
        tasks: seg.tasks.filter((t: any) => t.id !== taskId),
      }))
    );

    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      fetchTasks(selectedDate);
    }
  };

  // Calculate live completion percentage
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

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Dynamic stage image path
  const getStageBg = (score: number) => {
    if (score >= 75) return '/images/phoenix-stage-3.jpg';
    if (score >= 50) return '/images/phoenix-stage-2.jpg';
    if (score >= 25) return '/images/phoenix-stage-1.jpg';
    return '/images/phoenix-stage-0.jpg';
  };

  const currentBg = getStageBg(completionPercentage);

  return (
    <main 
      className="relative min-h-screen bg-cover bg-center bg-fixed text-slate-100 p-4 md:p-8 font-['Comic_Sans_MS',_'Comic_Sans',_cursive] transition-all duration-700 ease-in-out"
      style={{ backgroundImage: `url('${currentBg}')` }}
    >
      <div className="min-h-screen bg-slate-950/30 -m-4 md:-m-8 p-4 md:p-8 pb-16">
        {/* Left-aligned max-w-5xl layout wrapper */}
        <div className="max-w-5xl mr-auto lg:ml-8 space-y-8">
          
          {/* Header Navigation */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-sky-400 rounded-xl transition-all border border-slate-700/50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bird className="w-6 h-6 text-sky-400 stroke-[2] animate-pulse filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                  Task Workspace
                </h1>
                <p className="text-xs text-slate-300">Customize segments, habits, and daily tracking logs</p>
              </div>
            </div>

            {/* Date Selector */}
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-700/60 px-4 py-2 rounded-xl">
              <Calendar className="w-4 h-4 text-sky-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none text-sm cursor-pointer"
              />
            </div>
          </header>

          {/* Add Category / Segment Bar */}
          <form onSubmit={handleAddSegment} className="flex gap-3">
            <input
              type="text"
              placeholder="Add new category (e.g., Morning Mastery)..."
              value={newSegmentName}
              onChange={(e) => setNewSegmentName(e.target.value)}
              className="flex-1 bg-slate-900/25 border border-slate-700/50 rounded-2xl px-5 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-sky-400 backdrop-blur-md transition-all"
            />
            <button
              type="submit"
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-sky-500/20 shrink-0"
            >
              <Plus className="w-5 h-5" /> Add Category
            </button>
          </form>

          {/* Task Categories Grid */}
          {loading ? (
            <div className="text-center py-12 text-sky-400 font-bold">Loading tasks...</div>
          ) : segments.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/25 border border-slate-700/50 rounded-2xl backdrop-blur-md text-slate-300">
              No task categories found. Add one above to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  className="bg-slate-900/25 border border-slate-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
                    <h2 className="text-lg font-bold text-sky-300 tracking-wide">{seg.name}</h2>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {seg.tasks?.map((task: any) => {
                      const isCompleted = task.logs && task.logs.length > 0 && task.logs[0].completed;
                      return (
                        <div
                          key={task.id}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                              : 'bg-slate-950/40 border-slate-700/40 text-slate-200'
                          }`}
                        >
                          <button
                            onClick={() => handleToggleTask(task.id, isCompleted)}
                            className="flex items-center gap-3 text-left flex-1"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 shrink-0" />
                            )}
                            <span className={`text-sm ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {task.title}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1 ml-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Task Input inside Segment */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="New habit/task..."
                      value={newTaskInput[seg.id] || ''}
                      onChange={(e) =>
                        setNewTaskInput((prev) => ({ ...prev, [seg.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(seg.id);
                      }}
                      className="flex-1 bg-slate-950/50 border border-slate-700/50 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-400"
                    />
                    <button
                      onClick={() => handleAddTask(seg.id)}
                      className="bg-sky-500/80 hover:bg-sky-400 text-slate-950 p-1.5 rounded-xl transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Comments / Notes Section */}
          {selectedDate && <UserComments selectedDate={selectedDate} />}

        </div>
      </div>

      {/* Bottom-Right Transparent Signature */}
      <div className="fixed bottom-3 right-4 pointer-events-none z-50">
        <span className="text-xs italic font-medium text-slate-200/60 hover:text-slate-100 transition-colors tracking-wide select-none">
          by Rez...
        </span>
      </div>
    </main>
  );
}
