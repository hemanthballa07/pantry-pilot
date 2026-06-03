// src/screens/Health.tsx — Phase 4 port of health.jsx
// Calorie + macro tracking, food log, balance coach.

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore } from '@/stores';
import { Icon } from '@/components/ui';

// ─── Illo ─────────────────────────────────────────────────────────────────

const ILLO_COLORS: Record<string, string> = {
  yogurt: '#E8DCC8',
  apple: '#C73E2E',
  spinach: '#3B6E3D',
  egg: '#C99325',
};

interface IlloProps {
  name: string;
  size?: number;
}
function Illo({ name, size = 48 }: IlloProps) {
  const bg = ILLO_COLORS[name] ?? 'var(--line, rgba(0,0,0,.1))';
  return (
    <div
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.22),
        background: bg,
        opacity: 0.82,
        flexShrink: 0,
      }}
    />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  pad?: number;
  style?: CSSProperties;
  children?: ReactNode;
}
function Card({ pad = 20, style, children }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--paper, #fff)',
        border: '1px solid var(--line, rgba(0,0,0,.1))',
        borderRadius: 16,
        padding: pad,
        boxShadow: 'var(--sh-1, 0 1px 4px rgba(0,0,0,.06))',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────

interface PillProps {
  tone?: 'ghost';
  size?: 'sm';
  children?: ReactNode;
}
function Pill({ children }: PillProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 700,
        background: 'rgba(0,0,0,.05)',
        color: 'var(--ink-muted, #8a8374)',
        border: '1px solid transparent',
        borderRadius: 999,
      }}
    >
      {children}
    </div>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}
function Ring({
  value,
  size = 64,
  stroke = 8,
  color = 'var(--green)',
  trackColor = 'rgba(0,0,0,.06)',
  children,
}: RingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - value / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number;
  max: number;
  tone?: 'green' | 'amber';
  height?: number;
}
function Progress({ value, max, tone = 'green', height = 8 }: ProgressProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  const color = tone === 'green' ? 'var(--green, #3B6E3D)' : 'var(--amber, #C99325)';
  return (
    <div
      style={{
        height,
        borderRadius: 999,
        background: 'var(--bg-tint, rgba(0,0,0,.06))',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 999,
          transition: 'width 300ms',
        }}
      />
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  icon?: string;
  full?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  children?: ReactNode;
}
function Button({ variant = 'primary', icon, full, onClick, style, children }: ButtonProps) {
  const bg = variant === 'secondary' ? 'var(--paper-warm, #fdfaf3)' : 'var(--ink, #1a1814)';
  const fg = variant === 'secondary' ? 'var(--ink, #1a1814)' : 'var(--paper-warm, #fdfaf3)';
  const bd = variant === 'secondary' ? '1px solid var(--line, rgba(0,0,0,.12))' : 'none';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '10px 18px',
        fontSize: 14,
        fontWeight: 600,
        background: bg,
        color: fg,
        border: bd,
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

// ─── Health ───────────────────────────────────────────────────────────────

const SLOT_LABEL: Record<string, string> = { B: 'Breakfast', L: 'Lunch', D: 'Dinner', S: 'Snack' };

type SlotId = 'B' | 'L' | 'D' | 'S';
interface LogEntry {
  slot: SlotId;
  name: string;
  kind: string;
  cal: number;
  p: number;
  tone: string;
  eaten: boolean;
}
interface Suggestion {
  name: string;
  illo: string;
  cal: number;
  p: number;
  fiber?: number;
  veg?: number;
  why: string;
}

export default function Health() {
  const pushToast = useToastStore((s) => s.push);
  const setCapture = useNavStore((s) => s.setCapture);

  const n = mock.nutrition;

  const [log, setLog] = useState<LogEntry[]>(() =>
    mock.todayPlan.slots.map((s) => ({
      slot: s.slot as SlotId,
      name: s.name,
      kind: s.kind,
      cal: s.cal,
      p: s.p,
      tone: s.tone,
      eaten: s.status !== 'tonight',
    })),
  );
  const [added, setAdded] = useState<Suggestion[]>([]);

  const eatenCal =
    log.filter((l) => l.eaten).reduce((s, l) => s + l.cal, 0) +
    added.reduce((s, a) => s + a.cal, 0);

  const macro = [
    {
      k: 'Protein',
      v: n.protein.value + added.reduce((s, a) => s + a.p, 0),
      t: n.protein.target,
      color: 'var(--tomato)',
    },
    { k: 'Carbs', v: n.carbs.value, t: n.carbs.target, color: 'var(--amber)' },
    { k: 'Fat', v: n.fat.value, t: n.fat.target, color: 'var(--orange)' },
  ];
  const micro = [
    {
      k: 'Fiber',
      v: n.fiber.value + added.reduce((s, a) => s + (a.fiber ?? 0), 0),
      t: n.fiber.target,
      unit: 'g',
    },
    {
      k: 'Veggies',
      v: n.veg.value + added.reduce((s, a) => s + (a.veg ?? 0), 0),
      t: n.veg.target,
      unit: 'srv',
    },
  ];

  const proteinGap = Math.max(0, macro[0].t - macro[0].v);
  const fiberGap = Math.max(0, micro[0].t - micro[0].v);
  const vegGap = Math.max(0, micro[1].t - micro[1].v);

  const suggestions: Suggestion[] = [];
  if (proteinGap >= 6)
    suggestions.push({
      name: 'Greek yogurt',
      illo: 'yogurt',
      cal: 100,
      p: 17,
      why: `+17g protein · closes your ${proteinGap}g gap`,
    });
  if (fiberGap >= 3)
    suggestions.push({
      name: 'Apple + PB',
      illo: 'apple',
      cal: 200,
      p: 7,
      fiber: 5,
      why: '+5g fiber, +7g protein',
    });
  if (vegGap >= 1)
    suggestions.push({
      name: 'Side salad',
      illo: 'spinach',
      cal: 90,
      p: 3,
      veg: 2,
      fiber: 3,
      why: `+${vegGap} veg servings`,
    });
  suggestions.push({
    name: 'Boiled eggs ×2',
    illo: 'egg',
    cal: 140,
    p: 12,
    why: '+12g lean protein',
  });

  const addFood = (s: Suggestion) => {
    setAdded((a) => [...a, s]);
    pushToast(`Logged ${s.name} · +${s.cal} cal`);
  };
  const toggleEaten = (i: number) =>
    setLog((arr) => arr.map((l, idx) => (idx === i ? { ...l, eaten: !l.eaten } : l)));

  const week = [1980, 2150, 1760, 2240, eatenCal, 0, 0];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const calPct = Math.min(100, Math.round((eatenCal / n.cals.target) * 100));

  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 20 }}>
      {/* Hero: calories + macros */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
        <Card
          pad={26}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Today's calories
          </div>
          <Ring
            value={calPct}
            size={168}
            stroke={14}
            color="var(--green)"
            trackColor="var(--bg-tint)"
          >
            <div>
              <div
                className="serif tnum"
                style={{ fontSize: 40, color: 'var(--ink)', lineHeight: 1 }}
              >
                {eatenCal}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 4 }}>
                of {n.cals.target} kcal
              </div>
            </div>
          </Ring>
          <div style={{ marginTop: 18, fontSize: 13, color: 'var(--ink-2)' }}>
            <strong className="tnum" style={{ color: 'var(--green-deep)' }}>
              {Math.max(0, n.cals.target - eatenCal)}
            </strong>{' '}
            kcal left today
          </div>
        </Card>

        <Card pad={26}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Macros &amp; targets
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 22,
              marginBottom: 22,
            }}
          >
            {macro.map((m) => {
              const pct = Math.min(100, Math.round((m.v / m.t) * 100));
              return (
                <div
                  key={m.k}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <Ring
                    value={pct}
                    size={92}
                    stroke={9}
                    color={m.color}
                    trackColor="var(--bg-tint)"
                  >
                    <div
                      className="serif tnum"
                      style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}
                    >
                      {m.v}g
                    </div>
                  </Ring>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--ink-2)',
                      marginTop: 10,
                    }}
                  >
                    {m.k}
                  </div>
                  <div className="tnum" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    of {m.t}g
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              paddingTop: 18,
              borderTop: '1px solid var(--line-soft)',
            }}
          >
            {micro.map((m) => (
              <div key={m.k}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    marginBottom: 6,
                  }}
                >
                  <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{m.k}</span>
                  <span className="tnum" style={{ color: 'var(--ink-muted)' }}>
                    {m.v}/{m.t} {m.unit}
                  </span>
                </div>
                <Progress value={m.v} max={m.t} tone={m.v >= m.t ? 'green' : 'amber'} height={7} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Balance coach */}
      <Card
        pad={0}
        style={{ overflow: 'hidden', background: 'var(--ink)', borderColor: 'var(--ink)' }}
      >
        <div style={{ padding: '22px 24px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: 'var(--amber)' }}>
              <Icon name="sparkles" size={15} />
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Balance coach
            </span>
          </div>
          <div
            className="serif"
            style={{ fontSize: 21, color: 'var(--paper-warm)', lineHeight: 1.3, maxWidth: 720 }}
          >
            {proteinGap >= 6 ? (
              <>
                You're{' '}
                <strong style={{ color: 'var(--amber)' }}>{proteinGap}g short on protein</strong>{' '}
                and a little low on fiber. A few easy adds will round out your day.
              </>
            ) : (
              <>
                You're tracking a well-balanced day. A little more fiber and veg would round it out
                nicely.
              </>
            )}
          </div>
        </div>
        <div style={{ padding: '0 24px 22px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {suggestions.map((s) => (
            <button
              key={s.name}
              onClick={() => addFood(s)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 11,
                padding: '10px 14px 10px 10px',
                background: 'rgba(255,255,255,.05)',
                border: '1px solid rgba(255,255,255,.12)',
                borderRadius: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,.08)',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Illo name={s.illo} size={26} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: 'var(--paper-warm)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.name}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11.5,
                    color: 'rgba(253,250,243,.6)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.why}
                </span>
              </span>
              <span style={{ color: 'var(--amber)', marginLeft: 4 }}>
                <Icon name="plus" size={15} />
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Food log + weekly chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Today's food log
            </div>
            <Pill tone="ghost" size="sm">
              {log.filter((l) => l.eaten).length + added.length} logged
            </Pill>
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {log.map((l, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 11,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line-soft)',
                  opacity: l.eaten ? 1 : 0.6,
                }}
              >
                <button
                  onClick={() => toggleEaten(i)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    border: `1.5px solid ${l.eaten ? 'var(--green)' : 'var(--line-strong)'}`,
                    background: l.eaten ? 'var(--green)' : 'transparent',
                    color: '#FDFAF3',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    flexShrink: 0,
                  }}
                >
                  {l.eaten && <Icon name="check" size={12} />}
                </button>
                <div
                  style={{
                    width: 4,
                    height: 30,
                    borderRadius: 999,
                    background: l.tone,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                    {l.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
                    {SLOT_LABEL[l.slot] ?? l.slot} · {l.kind}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="tnum serif" style={{ fontSize: 16, color: 'var(--ink)' }}>
                    {l.cal}
                  </div>
                  <div className="tnum" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    {l.p}g P
                  </div>
                </div>
              </div>
            ))}
            {added.map((a, i) => (
              <div
                key={'a' + i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 11,
                  background: 'var(--green-tint)',
                  border: '1px solid var(--green-soft)',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: 'var(--green)',
                    color: '#FDFAF3',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon name="check" size={12} />
                </span>
                <Illo name={a.illo} size={26} />
                <div style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                  {a.name}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="tnum serif" style={{ fontSize: 16, color: 'var(--ink)' }}>
                    {a.cal}
                  </div>
                  <div className="tnum" style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    {a.p}g P
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="secondary"
            icon="plus"
            full
            onClick={() => setCapture('barcode')}
            style={{ marginTop: 14 }}
          >
            Log food by barcode
          </Button>
        </Card>

        <Card pad={22}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            This week · kcal
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 10,
              height: 150,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(n.cals.target / 2600) * 100}%`,
                borderTop: '1.5px dashed var(--line-strong)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: -16,
                  fontSize: 10,
                  color: 'var(--ink-soft)',
                }}
              >
                {n.cals.target}
              </span>
            </div>
            {week.map((v, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${(v / 2600) * 100}%`,
                    borderRadius: '6px 6px 0 0',
                    background:
                      i === 4 ? 'var(--green)' : v === 0 ? 'var(--bg-tint)' : 'var(--line-strong)',
                    minHeight: v === 0 ? 4 : 0,
                    transition: 'height 300ms',
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: i === 4 ? 'var(--green-deep)' : 'var(--ink-soft)',
                    fontWeight: i === 4 ? 700 : 500,
                    marginTop: 6,
                  }}
                >
                  {dayLabels[i]}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--line-soft)' }}>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--ink-2)' }}>5-day avg:</strong>{' '}
              {Math.round((1980 + 2150 + 1760 + 2240 + eatenCal) / 5)} kcal · you've stayed within
              target 4 of 5 days. Nice consistency.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
