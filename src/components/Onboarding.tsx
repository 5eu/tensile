import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store'

export function Onboarding() {
  const setShowOnboarding = useStore(s => s.setShowOnboarding)

  const dismiss = () => {
    localStorage.setItem('tensile-onboarded', '1')
    setShowOnboarding(false)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={dismiss}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10, 8, 6, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer',
        }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid rgba(196, 122, 58, 0.2)',
            borderRadius: 12,
            padding: '32px 36px',
            maxWidth: 440,
            width: '90%',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--copper-bright)',
            marginBottom: 6,
          }}>
            Tensile
          </h2>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--teal)',
            marginBottom: 20,
            letterSpacing: '0.05em',
          }}>
            Interactive Cloth Physics Simulator
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 24,
          }}>
            <Instruction icon="🖱️" text="Click & drag to pull the cloth" />
            <Instruction icon="✂️" text="Toggle Tear Mode to cut through fabric" />
            <Instruction icon="💨" text="Enable Wind for dynamic movement" />
            <Instruction icon="🧵" text="Switch materials: Silk, Canvas, Denim, Rubber, Chain" />
            <Instruction icon="🔥" text="Enable Stress Map to see tension" />
          </div>

          <div style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 20,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--cream-dim)',
          }}>
            <Kbd k="T" desc="Tear" />
            <Kbd k="Space" desc="Pause" />
            <Kbd k="R" desc="Reset" />
            <Kbd k="W" desc="Wind" />
          </div>

          <button
            onClick={dismiss}
            style={{
              width: '100%',
              padding: '10px 0',
              border: '1px solid var(--copper)',
              borderRadius: 6,
              background: 'rgba(196, 122, 58, 0.1)',
              color: 'var(--copper-bright)',
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
              letterSpacing: '0.03em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(196, 122, 58, 0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(196, 122, 58, 0.1)'
            }}
          >
            Begin Experiment →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Instruction({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--cream)',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function Kbd({ k, desc }: { k: string; desc: string }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <kbd style={{
        padding: '1px 6px',
        border: '1px solid rgba(160, 152, 128, 0.3)',
        borderRadius: 3,
        fontSize: 10,
      }}>
        {k}
      </kbd>
      {desc}
    </span>
  )
}
