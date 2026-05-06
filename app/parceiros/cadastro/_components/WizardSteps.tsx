export function WizardSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ['Conta', 'Tipo', 'Anúncio', 'Pronto']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2.5rem' }}>
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: n < steps.length ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '3rem' }}>
              <div style={{
                width: '2rem', height: '2rem', borderRadius: '50%',
                background: done ? 'var(--ocean-mid)' : active ? 'var(--sunset)' : 'var(--border)',
                color: (done || active) ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 700,
                transition: 'background 0.2s',
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                ) : n}
              </div>
              <span style={{ fontSize: '0.65rem', color: active ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: active ? 600 : 400, marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                {label}
              </span>
            </div>
            {n < steps.length && (
              <div style={{ flex: 1, height: '2px', background: done ? 'var(--ocean-mid)' : 'var(--border)', margin: '0 0.5rem', marginBottom: '1.25rem' }}/>
            )}
          </div>
        )
      })}
    </div>
  )
}
