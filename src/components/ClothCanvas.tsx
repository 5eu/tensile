import { useRef, useEffect, useCallback } from 'react'
import {
  createCloth,
  simulate,
  renderCloth,
  MATERIAL_PRESETS,
} from '../engine/verlet'
import type { ClothConfig, Point, Constraint } from '../engine/verlet'
import { useStore } from '../store'

export function ClothCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointsRef = useRef<Point[]>([])
  const constraintsRef = useRef<Constraint[]>([])
  const configRef = useRef<ClothConfig | null>(null)
  const mouseRef = useRef({ x: 0, y: 0, down: false, dragIdx: -1 })
  const rafRef = useRef<number>(0)
  const fpsRef = useRef({ frames: 0, lastTime: performance.now() })

  const material = useStore(s => s.material)
  const tearMode = useStore(s => s.tearMode)
  const showPins = useStore(s => s.showPins)
  const showStress = useStore(s => s.showStress)
  const windEnabled = useStore(s => s.windEnabled)
  const windStrength = useStore(s => s.windStrength)
  const paused = useStore(s => s.paused)
  const setStats = useStore(s => s.setStats)

  const initCloth = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const w = container.clientWidth
    const h = container.clientHeight
    const preset = MATERIAL_PRESETS[material]
    const spacing = 10
    const cols = Math.floor(Math.min(w * 0.7, 600) / spacing)
    const rows = Math.floor(Math.min(h * 0.6, 400) / spacing)
    const offsetX = (w - cols * spacing) / 2
    const offsetY = 60

    const config: ClothConfig = {
      cols,
      rows,
      spacing,
      offsetX,
      offsetY,
      gravity: preset.gravity ?? 0.3,
      damping: preset.damping ?? 0.97,
      stiffness: preset.stiffness ?? 0.9,
      tearDistance: preset.tearDistance ?? 2.0,
      iterations: preset.iterations ?? 8,
      material,
    }

    const { points, constraints } = createCloth(config)
    pointsRef.current = points
    constraintsRef.current = constraints
    configRef.current = config

    setStats({
      points: points.length,
      constraints: constraints.length,
      broken: 0,
    })
  }, [material, setStats])

  // Init on mount + material change
  useEffect(() => {
    initCloth()
  }, [initCloth])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')!

    const loop = () => {
      const config = configRef.current
      if (!config) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const w = container.clientWidth
      const h = container.clientHeight

      if (!paused) {
        const windX = windEnabled ? Math.sin(Date.now() * 0.001) * windStrength : 0
        const windY = windEnabled ? Math.cos(Date.now() * 0.0007) * windStrength * 0.3 : 0

        // Handle direct dragging
        const mouse = mouseRef.current
        if (mouse.down && !tearMode && mouse.dragIdx >= 0) {
          const p = pointsRef.current[mouse.dragIdx]
          if (p && !p.pinned) {
            p.x = mouse.x
            p.y = mouse.y
            p.oldX = mouse.x
            p.oldY = mouse.y
          }
        }

        simulate(
          pointsRef.current,
          constraintsRef.current,
          config,
          mouse.x,
          mouse.y,
          mouse.down,
          30,
          tearMode,
          windX,
          windY,
        )
      }

      renderCloth(
        ctx,
        pointsRef.current,
        constraintsRef.current,
        config,
        container.clientWidth,
        container.clientHeight,
        mouseRef.current.x,
        mouseRef.current.y,
        tearMode,
        showPins,
        showStress,
      )

      // FPS
      fpsRef.current.frames++
      const now = performance.now()
      if (now - fpsRef.current.lastTime > 1000) {
        const fps = Math.round(fpsRef.current.frames * 1000 / (now - fpsRef.current.lastTime))
        fpsRef.current.frames = 0
        fpsRef.current.lastTime = now
        const broken = constraintsRef.current.filter(c => c.broken).length
        setStats({ fps, broken })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused, tearMode, showPins, showStress, windEnabled, windStrength, setStats])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        useStore.getState().setTearMode(!useStore.getState().tearMode)
      } else if (e.key === ' ') {
        e.preventDefault()
        useStore.getState().setPaused(!useStore.getState().paused)
      } else if (e.key === 'r' || e.key === 'R') {
        initCloth()
      } else if (e.key === 'w' || e.key === 'W') {
        useStore.getState().setWindEnabled(!useStore.getState().windEnabled)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [initCloth])

  // Mouse handlers
  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const findNearestPoint = (mx: number, my: number): number => {
    let minDist = 30
    let idx = -1
    pointsRef.current.forEach((p, i) => {
      const d = Math.hypot(p.x - mx, p.y - my)
      if (d < minDist) {
        minDist = d
        idx = i
      }
    })
    return idx
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e)
    const dragIdx = tearMode ? -1 : findNearestPoint(pos.x, pos.y)
    mouseRef.current = { ...pos, down: true, dragIdx }
  }

  const onMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e)
    mouseRef.current.x = pos.x
    mouseRef.current.y = pos.y
  }

  const onMouseUp = () => {
    mouseRef.current.down = false
    mouseRef.current.dragIdx = -1
  }

  // Touch handlers
  const getTouchPos = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || !e.touches[0]) return { x: 0, y: 0 }
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
  }

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const pos = getTouchPos(e)
    const dragIdx = tearMode ? -1 : findNearestPoint(pos.x, pos.y)
    mouseRef.current = { ...pos, down: true, dragIdx }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const pos = getTouchPos(e)
    mouseRef.current.x = pos.x
    mouseRef.current.y = pos.y
  }

  const onTouchEnd = () => {
    mouseRef.current.down = false
    mouseRef.current.dragIdx = -1
  }

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        cursor: tearMode ? 'crosshair' : 'grab',
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(74, 139, 127, 0.05) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 100%, rgba(196, 122, 58, 0.03) 0%, transparent 50%),
          var(--bg-deep)
        `,
      }}
    >
      {/* Worktable surface texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5a9' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        pointerEvents: 'none',
      }} />

      <canvas
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />

      {/* Keyboard hints */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--cream-dim)',
        opacity: 0.5,
        display: 'flex',
        gap: 16,
      }}>
        <span><kbd style={kbdStyle}>T</kbd> tear mode</span>
        <span><kbd style={kbdStyle}>Space</kbd> pause</span>
        <span><kbd style={kbdStyle}>R</kbd> reset</span>
        <span><kbd style={kbdStyle}>W</kbd> wind</span>
      </div>
    </div>
  )
}

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  border: '1px solid rgba(160, 152, 128, 0.3)',
  borderRadius: 3,
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  marginRight: 2,
}
