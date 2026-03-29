// Verlet Integration Cloth Physics Engine

export interface Point {
  x: number
  y: number
  oldX: number
  oldY: number
  pinned: boolean
  mass: number
}

export interface Constraint {
  p1: number
  p2: number
  restLength: number
  stiffness: number
  broken: boolean
}

export interface ClothConfig {
  cols: number
  rows: number
  spacing: number
  offsetX: number
  offsetY: number
  gravity: number
  damping: number
  stiffness: number
  tearDistance: number // multiplier of rest length
  iterations: number
  material: MaterialType
}

export type MaterialType = 'silk' | 'canvas' | 'denim' | 'rubber' | 'chain'

export const MATERIAL_PRESETS: Record<MaterialType, Partial<ClothConfig>> = {
  silk: { gravity: 0.25, damping: 0.98, stiffness: 0.9, tearDistance: 1.8, iterations: 5 },
  canvas: { gravity: 0.4, damping: 0.96, stiffness: 0.95, tearDistance: 2.5, iterations: 8 },
  denim: { gravity: 0.5, damping: 0.94, stiffness: 0.98, tearDistance: 3.5, iterations: 10 },
  rubber: { gravity: 0.35, damping: 0.99, stiffness: 0.6, tearDistance: 4.0, iterations: 6 },
  chain: { gravity: 0.6, damping: 0.93, stiffness: 1.0, tearDistance: 5.0, iterations: 12 },
}

export const MATERIAL_COLORS: Record<MaterialType, { fill: string; stroke: string; accent: string }> = {
  silk: { fill: '#d4c5a9', stroke: '#a09880', accent: '#e8d8b8' },
  canvas: { fill: '#8b7d5a', stroke: '#6b5d3a', accent: '#a89870' },
  denim: { fill: '#3a5a8b', stroke: '#2a4a7b', accent: '#5a7aab' },
  rubber: { fill: '#2d2d2d', stroke: '#1a1a1a', accent: '#4a4a4a' },
  chain: { fill: '#888888', stroke: '#666666', accent: '#aaaaaa' },
}

export function createCloth(config: ClothConfig): { points: Point[]; constraints: Constraint[] } {
  const points: Point[] = []
  const constraints: Constraint[] = []
  const { cols, rows, spacing, offsetX, offsetY, stiffness } = config

  // Create points
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const px = offsetX + x * spacing
      const py = offsetY + y * spacing
      points.push({
        x: px,
        y: py,
        oldX: px,
        oldY: py,
        pinned: y === 0 && x % 2 === 0, // pin every other top point
        mass: 1,
      })
    }
  }

  // Create constraints (horizontal + vertical + diagonal for stability)
  const w = cols + 1

  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) {
      const i = y * w + x

      // Horizontal
      if (x < cols) {
        constraints.push({
          p1: i, p2: i + 1,
          restLength: spacing, stiffness, broken: false
        })
      }

      // Vertical
      if (y < rows) {
        constraints.push({
          p1: i, p2: i + w,
          restLength: spacing, stiffness, broken: false
        })
      }

      // Diagonal (cross-bracing for shear resistance)
      if (x < cols && y < rows) {
        const diagLen = spacing * Math.SQRT2
        constraints.push({
          p1: i, p2: i + w + 1,
          restLength: diagLen, stiffness: stiffness * 0.5, broken: false
        })
        constraints.push({
          p1: i + 1, p2: i + w,
          restLength: diagLen, stiffness: stiffness * 0.5, broken: false
        })
      }
    }
  }

  return { points, constraints }
}

export function simulate(
  points: Point[],
  constraints: Constraint[],
  config: ClothConfig,
  mouseX: number,
  mouseY: number,
  mouseDown: boolean,
  mouseRadius: number,
  tearMode: boolean,
  windX: number,
  windY: number,
) {
  const { gravity, damping, tearDistance, iterations } = config

  // Verlet integration
  for (const p of points) {
    if (p.pinned) continue

    const vx = (p.x - p.oldX) * damping
    const vy = (p.y - p.oldY) * damping

    p.oldX = p.x
    p.oldY = p.y

    // Apply gravity + wind
    p.x += vx + windX * 0.3
    p.y += vy + gravity + windY * 0.1

    // Mouse interaction
    if (mouseDown) {
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (tearMode) {
        // Tear mode - break nearby constraints
        // (handled in constraint loop)
      } else if (dist < mouseRadius) {
        // Drag mode - push points away gently or pull them
        const force = (mouseRadius - dist) / mouseRadius
        p.x += dx * force * 0.1
        p.y += dy * force * 0.1
      }
    }
  }

  // Solve constraints (Gauss-Seidel relaxation)
  for (let iter = 0; iter < iterations; iter++) {
    for (const c of constraints) {
      if (c.broken) continue

      const p1 = points[c.p1]
      const p2 = points[c.p2]

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 0.001) continue

      // Tear check
      if (dist > c.restLength * tearDistance) {
        c.broken = true
        continue
      }

      // Mouse tear mode
      if (tearMode && mouseDown) {
        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const mdx = midX - mouseX
        const mdy = midY - mouseY
        if (mdx * mdx + mdy * mdy < mouseRadius * mouseRadius * 0.3) {
          c.broken = true
          continue
        }
      }

      const diff = (dist - c.restLength) / dist
      const offsetX = dx * diff * 0.5 * c.stiffness
      const offsetY = dy * diff * 0.5 * c.stiffness

      if (!p1.pinned) {
        p1.x += offsetX
        p1.y += offsetY
      }
      if (!p2.pinned) {
        p2.x -= offsetX
        p2.y -= offsetY
      }
    }
  }
}

// Render cloth with material-specific coloring
export function renderCloth(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  constraints: Constraint[],
  config: ClothConfig,
  width: number,
  height: number,
  mouseX: number,
  mouseY: number,
  tearMode: boolean,
  showPins: boolean,
  showStress: boolean,
) {
  const dpr = window.devicePixelRatio || 1
  ctx.clearRect(0, 0, width * dpr, height * dpr)
  ctx.save()
  ctx.scale(dpr, dpr)

  const colors = MATERIAL_COLORS[config.material]
  const cols = config.cols + 1

  // Draw filled cloth triangles
  if (config.material !== 'chain') {
    for (let y = 0; y < config.rows; y++) {
      for (let x = 0; x < config.cols; x++) {
        const i = y * cols + x
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + cols]
        const p4 = points[i + cols + 1]

        // Check if face constraints are intact
        const hasTop = !isConstraintBroken(constraints, i, i + 1)
        const hasLeft = !isConstraintBroken(constraints, i, i + cols)
        const hasRight = !isConstraintBroken(constraints, i + 1, i + cols + 1)
        const hasBottom = !isConstraintBroken(constraints, i + cols, i + cols + 1)

        if (hasTop && hasLeft) {
          // Triangle 1: p1, p2, p3
          const stress1 = showStress ? computeTriStress(p1, p2, p3, config.spacing) : 0
          drawTriangle(ctx, p1, p2, p3, colors.fill, colors.accent, stress1, showStress)
        }
        if (hasRight && hasBottom) {
          // Triangle 2: p2, p4, p3
          const stress2 = showStress ? computeTriStress(p2, p4, p3, config.spacing) : 0
          drawTriangle(ctx, p2, p4, p3, colors.fill, colors.accent, stress2, showStress)
        }
      }
    }
  }

  // Draw constraint lines (structural)
  ctx.lineWidth = config.material === 'chain' ? 2.5 : 0.8
  for (const c of constraints) {
    if (c.broken) continue
    const p1 = points[c.p1]
    const p2 = points[c.p2]

    if (showStress) {
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const strain = dist / c.restLength
      if (strain > 1.5) {
        ctx.strokeStyle = '#c44536'
      } else if (strain > 1.2) {
        ctx.strokeStyle = '#e8a85c'
      } else {
        ctx.strokeStyle = colors.stroke
      }
    } else {
      ctx.strokeStyle = colors.stroke
    }

    if (config.material === 'chain') {
      // Chain: draw links
      ctx.strokeStyle = colors.fill
      ctx.lineWidth = 2.5
    }

    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  }

  // Draw pins
  if (showPins) {
    for (const p of points) {
      if (!p.pinned) continue
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#c47a3a'
      ctx.fill()
      ctx.strokeStyle = '#e8a85c'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }

  // Mouse cursor
  if (tearMode) {
    ctx.beginPath()
    ctx.arc(mouseX, mouseY, 15, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(196, 69, 54, 0.6)'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Scissors icon
    ctx.font = '16px serif'
    ctx.fillStyle = 'rgba(196, 69, 54, 0.8)'
    ctx.fillText('✂', mouseX + 12, mouseY - 8)
  }

  ctx.restore()
}

function isConstraintBroken(constraints: Constraint[], p1Idx: number, p2Idx: number): boolean {
  return constraints.some(c =>
    !c.broken ? false :
    (c.p1 === p1Idx && c.p2 === p2Idx) || (c.p1 === p2Idx && c.p2 === p1Idx)
  )
}

function computeTriStress(p1: Point, p2: Point, p3: Point, spacing: number): number {
  const d1 = Math.hypot(p2.x - p1.x, p2.y - p1.y)
  const d2 = Math.hypot(p3.x - p1.x, p3.y - p1.y)
  const strain1 = Math.abs(d1 / spacing - 1)
  const strain2 = Math.abs(d2 / spacing - 1)
  return Math.max(strain1, strain2)
}

function drawTriangle(
  ctx: CanvasRenderingContext2D,
  p1: Point, p2: Point, p3: Point,
  fillColor: string, accentColor: string,
  stress: number, showStress: boolean,
) {
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.closePath()

  if (showStress && stress > 0.1) {
    const r = Math.min(1, stress * 2)
    ctx.fillStyle = `rgba(196, 69, 54, ${r * 0.3})`
  } else {
    // Subtle shading based on normal
    const nx = (p2.y - p1.y) - (p3.y - p1.y)
    const shade = Math.abs(nx) * 0.001
    ctx.fillStyle = shade > 0.05 ? accentColor + '40' : fillColor + '30'
  }
  ctx.fill()
}
