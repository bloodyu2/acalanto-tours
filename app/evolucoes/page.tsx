'use client'

import { useState, useEffect, useCallback } from 'react'

type Status = 'backlog' | 'todo' | 'doing' | 'done'
type Priority = 'low' | 'medium' | 'high'
type Category = 'feature' | 'bug' | 'improvement' | 'content'

interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  category?: Category
  created_at: string
}

const STATUS_LABELS: Record<Status, string> = {
  backlog: 'Backlog',
  todo: 'A Fazer',
  doing: 'Em Andamento',
  done: 'Concluido',
}

const STATUS_ORDER: Status[] = ['backlog', 'todo', 'doing', 'done']

const STATUS_COLORS: Record<Status, string> = {
  backlog: '#6b7280',
  todo: '#1A6B8A',
  doing: '#d97706',
  done: '#16a34a',
}

const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
}

const CATEGORY_LABELS: Record<Category, string> = {
  feature: 'Feature',
  bug: 'Bug',
  improvement: 'Melhoria',
  content: 'Conteudo',
}

const PASSWORD = process.env.NEXT_PUBLIC_EVOLUCOES_PASSWORD ?? 'acalanto2026'
const AUTH_KEY = 'evolucoes_auth'

export default function EvolucoesDashboard() {
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [newTaskTitles, setNewTaskTitles] = useState<Record<Status, string>>({
    backlog: '',
    todo: '',
    doing: '',
    done: '',
  })
  const [movingTask, setMovingTask] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_KEY)
    if (stored === PASSWORD) {
      setAuthed(true)
    }
  }, [])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/evolucoes', {
        headers: { 'x-evolucoes-auth': PASSWORD },
      })
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) fetchTasks()
  }, [authed, fetchTasks])

  function handleLogin() {
    if (passwordInput === PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, PASSWORD)
      setAuthed(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(AUTH_KEY)
    setAuthed(false)
    setPasswordInput('')
  }

  async function handleAddTask(status: Status) {
    const title = newTaskTitles[status].trim()
    if (!title) return
    try {
      const res = await fetch('/api/evolucoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-evolucoes-auth': PASSWORD,
        },
        body: JSON.stringify({ title, status }),
      })
      if (res.ok) {
        setNewTaskTitles((prev) => ({ ...prev, [status]: '' }))
        fetchTasks()
      }
    } catch {}
  }

  async function handleMoveTask(id: string, newStatus: Status) {
    setMovingTask(id)
    try {
      const res = await fetch('/api/evolucoes', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-evolucoes-auth': PASSWORD,
        },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        )
      }
    } finally {
      setMovingTask(null)
    }
  }

  if (!authed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--ocean-deep)',
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '48px 40px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--ocean-deep)',
              marginBottom: '4px',
            }}
          >
            Acalanto Tours
          </p>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Area Restrita
          </p>
          <input
            type="password"
            placeholder="Senha"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1.5px solid ${passwordError ? '#ef4444' : 'var(--border)'}`,
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              marginBottom: '8px',
              boxSizing: 'border-box',
              color: 'var(--text-primary)',
            }}
          />
          {passwordError && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '13px',
                marginBottom: '8px',
              }}
            >
              Senha incorreta
            </p>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              padding: '12px',
              background: 'var(--ocean-deep)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  const tasksByStatus = STATUS_ORDER.reduce<Record<Status, Task[]>>(
    (acc, s) => {
      acc[s] = tasks.filter((t) => t.status === s)
      return acc
    },
    { backlog: [], todo: [], doing: [], done: [] }
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f1f5f9',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'var(--ocean-deep)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-playfair)',
              color: '#fff',
              fontSize: '20px',
              fontWeight: 700,
            }}
          >
            Evolucoes
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '13px',
              marginLeft: '12px',
            }}
          >
            Roadmap interno - Acalanto Tours
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loading && (
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
              Carregando...
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          padding: '24px',
          overflowX: 'auto',
          minHeight: 'calc(100vh - 64px)',
          alignItems: 'flex-start',
        }}
      >
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            style={{
              minWidth: '280px',
              width: '280px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {/* Column Header */}
            <div
              style={{
                background: STATUS_COLORS[status],
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.03em',
                }}
              >
                {STATUS_LABELS[status]}
              </span>
              <span
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  borderRadius: '12px',
                  padding: '2px 8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                {tasksByStatus[status].length}
              </span>
            </div>

            {/* Tasks */}
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tasksByStatus[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  currentStatus={status}
                  onMove={handleMoveTask}
                  isMoving={movingTask === task.id}
                />
              ))}

              {tasksByStatus[status].length === 0 && (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '20px 0',
                    color: '#9ca3af',
                    fontSize: '13px',
                  }}
                >
                  Nenhuma tarefa
                </div>
              )}
            </div>

            {/* Add Task Form */}
            <div
              style={{
                padding: '0 12px 12px',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '12px',
              }}
            >
              <input
                type="text"
                placeholder="Nova tarefa..."
                value={newTaskTitles[status]}
                onChange={(e) =>
                  setNewTaskTitles((prev) => ({
                    ...prev,
                    [status]: e.target.value,
                  }))
                }
                onKeyDown={(e) =>
                  e.key === 'Enter' && handleAddTask(status)
                }
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '6px',
                  boxSizing: 'border-box',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={() => handleAddTask(status)}
                style={{
                  width: '100%',
                  padding: '7px',
                  background: STATUS_COLORS[status],
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  currentStatus,
  onMove,
  isMoving,
}: {
  task: Task
  currentStatus: Status
  onMove: (id: string, status: Status) => void
  isMoving: boolean
}) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const prevStatus = currentIndex > 0 ? STATUS_ORDER[currentIndex - 1] : null
  const nextStatus =
    currentIndex < STATUS_ORDER.length - 1
      ? STATUS_ORDER[currentIndex + 1]
      : null

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        opacity: isMoving ? 0.6 : 1,
        transition: 'opacity 0.15s',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: PRIORITY_COLORS[task.priority ?? 'medium'],
            marginTop: '5px',
            flexShrink: 0,
          }}
        />
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            lineHeight: '1.4',
            flex: 1,
          }}
        >
          {task.title}
        </p>
      </div>

      {task.description && (
        <p
          style={{
            margin: '0 0 8px 16px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            lineHeight: '1.4',
          }}
        >
          {task.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: '16px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {task.category && (
            <span
              style={{
                background: '#f3f4f6',
                color: '#6b7280',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {CATEGORY_LABELS[task.category]}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {prevStatus && (
            <button
              onClick={() => onMove(task.id, prevStatus)}
              disabled={isMoving}
              title={`Mover para ${STATUS_LABELS[prevStatus]}`}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#6b7280',
              }}
            >
              {'<'}
            </button>
          )}
          {nextStatus && (
            <button
              onClick={() => onMove(task.id, nextStatus)}
              disabled={isMoving}
              title={`Mover para ${STATUS_LABELS[nextStatus]}`}
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#6b7280',
              }}
            >
              {'>'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
