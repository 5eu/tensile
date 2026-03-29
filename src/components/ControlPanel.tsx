import { motion } from 'framer-motion'
import { useStore } from '../store'
import { MATERIAL_COLORS } from '../engine/verlet'
import type { MaterialType } from '../engine/verlet'

const MATERIALS: { key: MaterialType; label: string; icon: string }[] = [
  { key: 'silk', label: 'Silk', icon: '🪡' },
  { key: 'canvas', label: 'Canvas', icon: '🎪' },
  { key: 'denim', label: 'Denim', icon: '👖' },
  { key: 'rubber', label: 'Rubber', icon: '🧤' },
  { key: 'chain', label: 'Chain', icon: '⛓️' },
]

export function ControlPanel() {
  const {
    material, setMaterial,
    tearMode, setTearMode,
    showPins, setShowPins,
    showStress, setShowStress,
    windEnabled, setWindEnabled,
    windStrength, setWindStrength,
    paused, setPaused,
  } = useStore()

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        width: 240,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid rgba(212, 197, 169, 0.08)',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Material Selector */}
      <Section title="Material">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {MATERIALS.map(m => (
            <button
              key={m.key}
              onClick={() => setMaterial(m.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 10px',
                border: material === m.key
                  ? '1px solid var(--copper)'
                  : '1px solid rgba(212, 197, 169, 0.1)',
                borderRadius: 6,
                background: material === m.key ? 'rgba(196, 122, 58, 0.1)' : 'transparent',
                color: material === m.key ? 'var(--copper-bright)' : 'var(--cream-dim)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              <div style={{
                marginLeft: 'auto',
                width: 12,
                height: 12,
                borderRadius: 2,
                background: MATERIAL_COLORS[m.key].fill,
                border: '1px solid rgba(0,0,0,0.2)',
              }} />
            </button>
          ))}
        </div>
      </Section>

      {/* Tools */}
      <Section title="Tools">
        <ToggleButton
          active={tearMode}
          onClick={() => setTearMode(!tearMode)}
          label="✂️ Tear Mode"
          activeColor="var(--danger)"
        />
        <ToggleButton
          active={paused}
          onClick={() => setPaused(!paused)}
          label={paused ? '▶ Resume' : '⏸ Pause'}
          activeColor="var(--teal)"
        />
      </Section>

      {/* Wind */}
      <Section title="Wind">
        <ToggleButton
          active={windEnabled}
          onClick={() => setWindEnabled(!windEnabled)}
          label="💨 Enable Wind"
          activeColor="var(--teal)"
        />
        {windEnabled && (
          <div style={{ marginTop: 6 }}>
            <label style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--cream-dim)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>Strength</span>
              <span>{windStrength.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={windStrength}
              onChange={(e) => setWindStrength(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--teal)' }}
            />
          </div>
        )}
      </Section>

      {/* Display */}
      <Section title="Display">
        <ToggleButton
          active={showPins}
          onClick={() => setShowPins(!showPins)}
          label="📌 Show Pins"
          activeColor="var(--copper)"
        />
        <ToggleButton
          active={showStress}
          onClick={() => setShowStress(!showStress)}
          label="🔥 Stress Map"
          activeColor="var(--danger)"
        />
      </Section>

      {/* Reset */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={() => {
            // Trigger re-init by toggling material
            const curr = useStore.getState().material
            setMaterial(curr === 'silk' ? 'canvas' : 'silk')
            setTimeout(() => setMaterial(curr), 10)
          }}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid rgba(212, 197, 169, 0.15)',
            borderRadius: 6,
            background: 'transparent',
            color: 'var(--cream-dim)',
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(196, 122, 58, 0.1)'
            e.currentTarget.style.color = 'var(--copper-bright)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--cream-dim)'
          }}
        >
          ↺ Reset Cloth
        </button>
      </div>
    </motion.aside>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--linen)',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}

function ToggleButton({
  active, onClick, label, activeColor,
}: {
  active: boolean
  onClick: () => void
  label: string
  activeColor: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        border: active ? `1px solid ${activeColor}` : '1px solid rgba(212, 197, 169, 0.1)',
        borderRadius: 6,
        background: active ? `${activeColor}15` : 'transparent',
        color: active ? activeColor : 'var(--cream-dim)',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  )
}
