import { useStore } from '../store'

export function StatsHUD() {
  const stats = useStore(s => s.stats)
  const material = useStore(s => s.material)

  return (
    <div style={{
      position: 'absolute',
      top: 12,
      left: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--cream-dim)',
      background: 'rgba(18, 16, 14, 0.8)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(212, 197, 169, 0.08)',
      borderRadius: 6,
      padding: '8px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      lineHeight: 1.5,
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span>FPS</span>
        <span style={{
          color: stats.fps >= 50 ? 'var(--teal)' : stats.fps >= 30 ? 'var(--copper)' : 'var(--danger)',
          fontWeight: 600,
        }}>
          {stats.fps}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span>Points</span>
        <span style={{ color: 'var(--cream)' }}>{stats.points}</span>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <span>Constraints</span>
        <span style={{ color: 'var(--cream)' }}>{stats.constraints}</span>
      </div>
      {stats.broken > 0 && (
        <div style={{ display: 'flex', gap: 12 }}>
          <span>Broken</span>
          <span style={{ color: 'var(--danger)' }}>{stats.broken}</span>
        </div>
      )}
      <div style={{
        marginTop: 2,
        paddingTop: 4,
        borderTop: '1px solid rgba(212, 197, 169, 0.08)',
        color: 'var(--copper)',
        textTransform: 'capitalize',
      }}>
        {material}
      </div>
    </div>
  )
}
