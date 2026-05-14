'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RoadmapTask } from '@/lib/types/database'
import type { Database } from '@/lib/types/database'

type RoadmapInsert = Database['public']['Tables']['roadmap_tasks']['Insert']

const STATUS_OPTIONS = ['done', 'in_progress', 'pending', 'blocked'] as const
const PRIORITY_OPTIONS = ['alta', 'média', 'baixa'] as const

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  done:        { bg: '#dcfce7', color: '#166534', label: '✓ Concluído' },
  in_progress: { bg: '#fef9c3', color: '#854d0e', label: '⟳ Em andamento' },
  pending:     { bg: '#f1f5f9', color: '#475569', label: '○ Pendente' },
  blocked:     { bg: '#fee2e2', color: '#991b1b', label: '✕ Bloqueado' },
}

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  alta:  { bg: '#fee2e2', color: '#991b1b' },
  média: { bg: '#fef9c3', color: '#854d0e' },
  baixa: { bg: '#f1f5f9', color: '#475569' },
}

export function RoadmapClient() {
  const [tasks, setTasks] = useState<RoadmapTask[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('roadmap_tasks')
      .select('*')
      .order('sort_order')

    if (error) { console.error(error); setLoading(false); return }

    if (data) {
      setTasks(data)
    } else {
      setTasks([])
    }
    setLoading(false)
  }

  async function updateTask(id: string, changes: Partial<RoadmapTask>) {
    setSaving(id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('roadmap_tasks').update({ ...changes, updated_at: new Date().toISOString() }).eq('id', id)
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...changes } : t))
    setSaving(null)
  }

  async function deleteTask(id: string) {
    if (!confirm('Remover esta tarefa?')) return
    await supabase.from('roadmap_tasks').delete().eq('id', id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function addTask() {
    setAdding(true)
    const newTask: RoadmapInsert = {
      area: 'Geral',
      title: 'Nova tarefa',
      description: null,
      status: 'pending',
      priority: 'média',
      eta: null,
      notes: null,
      sort_order: tasks.length,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).from('roadmap_tasks').insert(newTask).select('*').single() as { data: RoadmapTask | null }
    if (data) setTasks(prev => [...prev, data])
    setAdding(false)
  }

  const areas = Array.from(new Set(tasks.map(t => t.area))).sort()
  const stats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: '1.75rem', color: 'var(--ocean-deep)', margin: 0 }}>
          Roadmap
        </h1>
        <button
          onClick={addTask}
          disabled={adding}
          style={{ padding: '0.5rem 1.25rem', background: 'var(--ocean-mid)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}
        >
          {adding ? 'Adicionando…' : '+ Nova tarefa'}
        </button>
      </div>

      {/* Progress summary */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', borderRadius: '10px', padding: '0.75rem 1.25rem', border: '1px solid var(--border)', fontSize: '0.875rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total: </span><strong>{stats.total}</strong>
        </div>
        <div style={{ background: '#dcfce7', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#166534' }}>
          ✓ Concluídas: <strong>{stats.done}</strong>
        </div>
        <div style={{ background: '#fef9c3', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#854d0e' }}>
          ⟳ Em andamento: <strong>{stats.in_progress}</strong>
        </div>
        {stats.blocked > 0 && (
          <div style={{ background: '#fee2e2', borderRadius: '10px', padding: '0.75rem 1.25rem', fontSize: '0.875rem', color: '#991b1b' }}>
            ✕ Bloqueadas: <strong>{stats.blocked}</strong>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Carregando…</p>
      ) : (
        areas.map(area => (
          <div key={area} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {area}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {tasks.filter(t => t.area === area).map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  saving={saving === task.id}
                  onUpdate={(changes) => updateTask(task.id, changes)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function TaskRow({
  task, saving, onUpdate, onDelete
}: {
  task: RoadmapTask
  saving: boolean
  onUpdate: (changes: Partial<RoadmapTask>) => void
  onDelete: () => void
}) {
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)
  const statusStyle = STATUS_COLORS[task.status] ?? STATUS_COLORS.pending
  const priorityStyle = PRIORITY_COLORS[task.priority] ?? PRIORITY_COLORS['média']

  // suppress unused-variable warnings for refs used via autoFocus pattern
  void titleRef
  void notesRef

  return (
    <div style={{
      background: 'white', borderRadius: '10px', padding: '0.875rem 1rem',
      border: '1px solid var(--border)', opacity: saving ? 0.7 : 1,
      display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
    }}>
      {/* Status dropdown */}
      <select
        value={task.status}
        onChange={e => onUpdate({ status: e.target.value as any })}
        style={{
          background: statusStyle.bg, color: statusStyle.color,
          border: 'none', borderRadius: '6px', padding: '0.25rem 0.5rem',
          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0,
        }}
      >
        {STATUS_OPTIONS.map(s => (
          <option key={s} value={s}>{STATUS_COLORS[s]?.label ?? s}</option>
        ))}
      </select>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        {editingTitle ? (
          <input
            ref={titleRef}
            defaultValue={task.title}
            autoFocus
            onBlur={e => { onUpdate({ title: e.target.value }); setEditingTitle(false) }}
            onKeyDown={e => { if (e.key === 'Enter') { onUpdate({ title: (e.target as HTMLInputElement).value }); setEditingTitle(false) } }}
            style={{ width: '100%', fontWeight: 600, fontSize: '0.9375rem', border: '1px solid var(--ocean-mid)', borderRadius: '4px', padding: '0.125rem 0.375rem' }}
          />
        ) : (
          <p
            onClick={() => setEditingTitle(true)}
            style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem', cursor: 'text', textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)' }}
          >
            {task.title}
          </p>
        )}

        {task.description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>{task.description}</p>
        )}

        {/* Notes */}
        {editingNotes ? (
          <textarea
            ref={notesRef}
            defaultValue={task.notes ?? ''}
            autoFocus
            rows={2}
            onBlur={e => { onUpdate({ notes: e.target.value || null }); setEditingNotes(false) }}
            style={{ width: '100%', fontSize: '0.8125rem', border: '1px solid var(--ocean-mid)', borderRadius: '4px', padding: '0.25rem 0.375rem', resize: 'vertical' }}
          />
        ) : task.notes ? (
          <p
            onClick={() => setEditingNotes(true)}
            style={{ fontSize: '0.8125rem', color: '#92400e', background: '#fef3c7', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'text', marginTop: '0.25rem' }}
          >
            📝 {task.notes}
          </p>
        ) : (
          <button
            onClick={() => setEditingNotes(true)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, marginTop: '0.125rem' }}
          >
            + nota
          </button>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
        {/* Priority */}
        <select
          value={task.priority}
          onChange={e => onUpdate({ priority: e.target.value as any })}
          style={{
            background: priorityStyle.bg, color: priorityStyle.color,
            border: 'none', borderRadius: '6px', padding: '0.2rem 0.4rem',
            fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
          }}
        >
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Area edit */}
        <input
          defaultValue={task.area}
          onBlur={e => { if (e.target.value !== task.area) onUpdate({ area: e.target.value }) }}
          style={{ width: '80px', fontSize: '0.7rem', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.125rem 0.25rem', color: 'var(--text-muted)', textAlign: 'center' }}
        />

        {/* Delete */}
        <button
          onClick={onDelete}
          style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
        >
          remover
        </button>
      </div>
    </div>
  )
}
