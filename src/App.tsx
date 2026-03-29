import { ClothCanvas } from './components/ClothCanvas'
import { ControlPanel } from './components/ControlPanel'
import { Onboarding } from './components/Onboarding'
import { StatsHUD } from './components/StatsHUD'
import { useStore } from './store'

export default function App() {
  const showOnboarding = useStore(s => s.showOnboarding)

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-deep)',
      position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(212, 197, 169, 0.1)',
        background: 'var(--bg-surface)',
        zIndex: 10,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--copper-bright)',
            letterSpacing: '0.02em',
          }}>
            Tensile
          </h1>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--cream-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Cloth Physics Lab
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--cream-dim)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--teal)' }}>Verlet Integration</span>
          <span>•</span>
          <span>Gauss-Seidel Relaxation</span>
        </div>
      </header>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ClothCanvas />
        <ControlPanel />
        <StatsHUD />
      </div>

      {showOnboarding && <Onboarding />}
    </div>
  )
}
