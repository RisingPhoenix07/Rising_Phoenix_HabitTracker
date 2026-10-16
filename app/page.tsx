'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Trash2,
  TrendingUp,
  FolderPlus,
  Sparkles,
  Quote,
  MessageSquare,
  Award,
  RefreshCw,
} from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

const MOTIVATIONAL_QUOTES = [
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "The secret of getting ahead is getting started.",
  "Small daily improvements over time lead to stunning results.",
  "You don't have to be extreme, just consistent.",
  "Action is the foundational key to all success.",
  "Energy flows where attention goes.",
]

interface TaskLog {
  id: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  logs: TaskLog[]
}

interface Segment {
  id: string
  name: string
  tasks: Task[]
}

interface AnalyticsData {
  history: { date: string; percentage: number }[]
  weeklyAverage: number
  currentStreak: number
}

export default function HabitTracker() {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsData>({ history: [], weeklyAverage: 0, currentStreak: 0 })
  const [loading, setLoading] = useState(true)
  const [quote, setQuote] = useState('')

  // Reflection/Comment State
  const [commentText, setCommentText] = useState('')
  const [savingComment, setSavingComment] = useState(false)

  // UI state for adding tasks/segments
  const [addingToSegment, setAddingToSegment] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAddingSegment, setIsAddingSegment] = useState(false)
  const [newSegmentName, setNewSegmentName] = useState('')

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0])
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])
  }, [])

  const fetchTasks = async (dateStr: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tasks?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        setSegments(data)
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics?days=7')
      if (res.ok) {
        const data = await res.json()
        setAnalytics(data)
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
    }
  }

  const fetchComment = async (dateStr: string) => {
    try {
      const res = await fetch(`/api/comments?date=${dateStr}`)
      if (res.ok) {
        const data = await res.json()
        setCommentText(data.text || '')
      }
    } catch (err) {
      console.error('Failed to fetch comment:', err)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      fetchTasks(selectedDate)
      fetchAnalytics()
      fetchComment(selectedDate)
    }
  }, [selectedDate])

  const handleSaveComment = async () => {
    if (!selectedDate) return
    setSavingComment(true)
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, text: commentText }),
      })
    } catch (err) {
      console.error('Failed to save comment:', err)
    } finally {
      setSavingComment(false)
    }
  }

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    if (!selectedDate) return
    const newStatus = !currentStatus

    setSegments((prev) =>
      prev.map((segment) => ({
        ...segment,
        tasks: segment.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              logs: newStatus ? [{ id: 'temp', completed: true }] : [],
            }
          }
          return task
        }),
      }))
    )

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, date: selectedDate, completed: newStatus }),
      })
      fetchAnalytics()
    } catch (err) {
      console.error('Failed to toggle task:', err)
      fetchTasks(selectedDate)
    }
  }

  const handleAddTask = async (segmentId: string) => {
    if (!newTaskTitle.trim()) return
    try {
      const res = await fetch('/api/manage/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle.trim(), segmentId }),
      })
      if (res.ok) {
        setNewTaskTitle('')
        setAddingToSegment(null)
        fetchTasks(selectedDate)
        fetchAnalytics()
      }
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return
    try {
      const res = await fetch(`/api/manage/tasks?id=${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTasks(selectedDate)
        fetchAnalytics()
      }
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const handleAddSegment = async () => {
    if (!newSegmentName.trim()) return
    try {
      const res = await fetch('/api/manage/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSegmentName.trim() }),
      })
      if (res.ok) {
        setNewSegmentName('')
        setIsAddingSegment(false)
        fetchTasks(selectedDate)
      }
    } catch (err) {
      console.error('Failed to add segment:', err)
    }
  }

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Deleting this category will delete all tasks inside it. Proceed?')) return
    try {
      const res = await fetch(`/api/manage/segments?id=${segmentId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTasks(selectedDate)
        fetchAnalytics()
      }
    } catch (err) {
      console.error('Failed to delete segment:', err)
    }
  }

  const changeDate = (days: number) => {
    if (!selectedDate) return
    const curr = new Date(selectedDate)
    curr.setDate(curr.getDate() + days)
    setSelectedDate(curr.toISOString().split('T')[0])
  }

  let totalTasks = 0
  let completedTasks = 0

  segments.forEach((segment) => {
    segment.tasks.forEach((task) => {
      totalTasks++
      if (task.logs.length > 0 && task.logs[0].completed) {
        completedTasks++
      }
    })
  })

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <main 
      className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-sky-500 selection:text-slate-950 relative bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/bg-phoenix.jpg')` }}
    >
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm -z-0 pointer-events-none" />
    
      {/* Content Wrapper */}
      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl shadow-blue-950/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
              <Flame className="w-8 h-8 text-sky-400 fill-sky-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Rising Phoenix
              </h1>
              <p className="text-xs text-sky-300/70 font-medium">Personal Mastery Dashboard</p>
            </div>
          </div>

          {/* Date Picker & Streak Badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-2xl">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold font-mono text-amber-300">
                {analytics.currentStreak} Day Streak
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3 py-1.5 rounded-2xl">
              <button
                onClick={() => changeDate(-1)}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs font-semibold text-slate-200 px-2">
                {selectedDate || 'Loading...'}
              </span>
              <button
                onClick={() => changeDate(1)}
                className="p-1.5 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Motivational Banner */}
        <section className="bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-slate-900/40 border border-sky-500/20 p-4 px-6 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Quote className="w-5 h-5 text-sky-400 shrink-0" />
            <p className="text-xs md:text-sm italic text-sky-200/90 font-medium">"{quote}"</p>
          </div>
          <button
            onClick={() => setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])}
            className="p-2 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-sky-400 transition"
            title="New Quote"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Daily Score Card */}
          <section className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span>Today's Score</span>
                <Sparkles className="w-4 h-4 text-sky-400" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tight text-sky-400 font-mono">
                  {progressPercentage}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ({completedTasks}/{totalTasks} tasks)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-amber-400" /> 7-Day Average</span>
                <span className="font-mono text-amber-300 font-bold">{analytics.weeklyAverage}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800/80 p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </section>

          {/* 7-Day Chart */}
          <section className="md:col-span-2 bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" /> 7-Day Performance Trend
              </h2>
            </div>
            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#020617',
                      borderColor: '#1e293b',
                      borderRadius: '1rem',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#blueChartGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Categories / Habit Checklist */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-white">Habit Segments</h2>
            <button
              onClick={() => setIsAddingSegment(!isAddingSegment)}
              className="flex items-center gap-2 text-xs font-semibold text-sky-300 hover:text-white bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 px-3.5 py-2 rounded-xl transition"
            >
              <FolderPlus className="w-4 h-4 text-sky-400" /> Add Category
            </button>
          </div>

          {/* New Category Input */}
          {isAddingSegment && (
            <div className="flex gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
              <input
                type="text"
                placeholder="Category Name (e.g., Mindfulness & Recovery)"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                className="bg-slate-950 flex-1 px-4 py-2 text-sm text-slate-100 rounded-xl border border-slate-800 outline-none focus:border-sky-500/50"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSegment()}
              />
              <button
                onClick={handleAddSegment}
                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-sm transition"
              >
                Create
              </button>
            </div>
          )}

          {loading || !selectedDate ? (
            <div className="text-center py-16 text-slate-500 font-medium animate-pulse">
              Syncing habits...
            </div>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.id}
                className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-4"
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h3 className="text-base font-semibold text-slate-200">{segment.name}</h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setAddingToSegment(addingToSegment === segment.id ? null : segment.id)}
                      className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-sky-400 transition"
                      title="Add task"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(segment.id)}
                      className="p-1.5 hover:bg-rose-950/40 rounded-xl text-slate-500 hover:text-rose-400 transition"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add Task Box */}
                {addingToSegment === segment.id && (
                  <div className="flex gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <input
                      type="text"
                      placeholder="Add habit..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="bg-transparent flex-1 px-3 py-1 text-sm text-slate-100 outline-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTask(segment.id)}
                    />
                    <button
                      onClick={() => handleAddTask(segment.id)}
                      className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs transition"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Habit Items */}
                <div className="space-y-2">
                  {segment.tasks.length === 0 ? (
                    <p className="text-xs text-slate-600 italic py-2">No habits in this category yet.</p>
                  ) : (
                    segment.tasks.map((task) => {
                      const isCompleted = task.logs.length > 0 && task.logs[0].completed

                      return (
                        <div key={task.id} className="flex items-center gap-2 group">
                          <button
                            onClick={() => toggleTask(task.id, isCompleted)}
                            className={`flex-1 flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-200 ${
                              isCompleted
                                ? 'bg-sky-950/30 border-sky-500/30 text-sky-200/80'
                                : 'bg-slate-950/50 border-slate-800/60 hover:border-slate-700 text-slate-200 hover:bg-slate-950'
                            }`}
                          >
                            <span
                              className={`text-sm font-medium transition-all ${
                                isCompleted ? 'line-through text-slate-500' : ''
                              }`}
                            >
                              {task.title}
                            </span>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-700 shrink-0 group-hover:text-slate-500 transition" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-3 opacity-0 group-hover:opacity-100 hover:bg-rose-950/40 text-slate-600 hover:text-rose-400 border border-transparent hover:border-rose-900/40 rounded-2xl transition-all"
                            aria-label="Delete habit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Daily Reflection Notes Section */}
        <section className="bg-slate-900/70 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" /> Daily Reflection & Notes
            </h2>
            <button
              onClick={handleSaveComment}
              disabled={savingComment}
              className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-4 py-1.5 rounded-xl text-xs transition disabled:opacity-50"
            >
              {savingComment ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Record your daily learnings, reflection, or blockers..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-sm text-slate-200 outline-none focus:border-sky-500/50 resize-none"
          />
        </section>

      </div>
    </main>
  )
}