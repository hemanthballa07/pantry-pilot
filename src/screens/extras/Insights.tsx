// src/screens/extras/Insights.tsx — the routed Insights screen (Budget / Food waste /
// Nutrition / Memory / Takeout swap tabs). Split from src/screens/Extras.tsx (OQ-004 / ADR-004).
import { useState } from 'react';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores';
import { Button, Card, Icon, Pill, Ring, SectionHead, Tabs } from './shared';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ═════════════ BUDGET ═══════════════════════════════════════════════════════

function BudgetStat({
  label,
  value,
  sub,
  tone,
  icon,
  up,
  down,
}: {
  label: string;
  value: string;
  sub: string;
  tone: 'green' | 'tomato' | 'amber' | 'neutral';
  icon: string;
  up?: boolean;
  down?: boolean;
}) {
  const fg =
    tone === 'green'
      ? 'var(--green)'
      : tone === 'tomato'
        ? 'var(--tomato)'
        : tone === 'amber'
          ? 'var(--amber)'
          : 'var(--ink-muted)';
  return (
    <Card pad={20}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ color: fg }}>
          <Icon name={icon} size={16} />
        </span>
        {up && (
          <Pill tone="green" size="sm" icon="arrowUp">
            Saved
          </Pill>
        )}
        {down && (
          <Pill tone="green" size="sm" icon="arrowDown">
            -28%
          </Pill>
        )}
      </div>
      <div className="serif tnum" style={{ fontSize: 28, color: 'var(--ink)', lineHeight: 1 }}>
        {value}
      </div>
      <div
        style={{
          fontSize: 11.5,
          color: 'var(--ink-muted)',
          marginTop: 4,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: 0.4,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function Donut({
  segments,
  size = 160,
}: {
  segments: { start: number; end: number; color: string }[];
  size?: number;
}) {
  const r = size / 2 - 16;
  const cx = size / 2,
    cy = size / 2;
  const toXY = (a: number): [number, number] => [
    cx + r * Math.cos(((a - 90) * Math.PI) / 180),
    cy + r * Math.sin(((a - 90) * Math.PI) / 180),
  ];
  return (
    <svg width={size} height={size}>
      {segments.map((s, i) => {
        const [x1, y1] = toXY(s.start);
        const [x2, y2] = toXY(s.end);
        const large = s.end - s.start > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={s.color}
            stroke="var(--paper)"
            strokeWidth="3"
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--paper)" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="20"
        fill="var(--ink)"
        fontWeight="500"
      >
        $184
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="10.5"
        fill="var(--ink-muted)"
        fontWeight="600"
        style={{ letterSpacing: 0.5 }}
      >
        SPENT
      </text>
    </svg>
  );
}

function Budget() {
  const b = mock.budget;
  const total = b.byCategory.reduce((s, c) => s + c.amount, 0);
  let cumAngle = 0;
  const segments = b.byCategory.map((c) => {
    const pct = c.amount / total;
    const start = cumAngle;
    cumAngle += pct * 360;
    return { ...c, start, end: cumAngle, pct };
  });
  const weeklyMax = Math.max(...b.weekly);
  const storeMax = Math.max(...b.stores.map((x) => x.amount));

  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <BudgetStat
          label="Spent this month"
          value={`$${b.spent.toFixed(0)}`}
          sub={`of $${b.monthly} budget`}
          tone="green"
          icon="wallet"
        />
        <BudgetStat
          label="Saved from pantry"
          value={`$${b.savedFromPantry}`}
          sub="vs. takeout average"
          tone="green"
          icon="leaf"
          up
        />
        <BudgetStat
          label="Food waste"
          value={`$${b.waste.toFixed(2)}`}
          sub="3 items · -28% MoM"
          tone="tomato"
          icon="trash"
          down
        />
        <BudgetStat
          label="Avg meal cost"
          value="$1.85"
          sub="based on 19 meals"
          tone="neutral"
          icon="chef"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Spending trend */}
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 0.6,
                  color: 'var(--ink-muted)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Weekly spend · November
              </div>
              <div
                className="serif tnum"
                style={{ fontSize: 30, color: 'var(--ink)', marginTop: 6, lineHeight: 1 }}
              >
                ${b.spent.toFixed(2)}
              </div>
            </div>
            <Pill tone="green" size="sm" icon="arrowDown">
              12% vs October
            </Pill>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 12,
              alignItems: 'end',
              height: 200,
            }}
          >
            {b.weekly.map((w, i) => {
              const h = (w / weeklyMax) * 160;
              return (
                <div
                  key={i}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <div
                    className="tnum"
                    style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}
                  >
                    ${w.toFixed(0)}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: '12px 12px 4px 4px',
                      background:
                        i === 3
                          ? 'var(--green)'
                          : 'linear-gradient(180deg, var(--orange) 0%, var(--orange-deep) 100%)',
                      opacity: i === 3 ? 1 : 0.85 - i * 0.05,
                      transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 600 }}>
                    W{i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Donut by category */}
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
            Where it goes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Donut segments={segments} size={170} />
            <div style={{ flex: 1, display: 'grid', gap: 6 }}>
              {b.byCategory.map((c) => (
                <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>
                    {c.cat}
                  </span>
                  <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    ${c.amount.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Stores + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              By store
            </span>
            <Pill tone="green" size="sm">
              Aldi · best value
            </Pill>
          </div>
          {b.stores.map((s) => {
            const pct = (s.amount / storeMax) * 100;
            return (
              <div
                key={s.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--line-soft)',
                }}
              >
                <div style={{ flex: '0 0 110px', fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 8, background: 'var(--line-soft)', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--green) 0%, var(--basil) 100%)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="tnum"
                  style={{
                    flex: '0 0 60px',
                    fontSize: 12.5,
                    color: 'var(--ink-2)',
                    textAlign: 'right',
                    fontWeight: 600,
                  }}
                >
                  ${s.amount.toFixed(0)}
                </div>
                <div
                  style={{
                    flex: '0 0 60px',
                    fontSize: 11.5,
                    color: 'var(--ink-muted)',
                    textAlign: 'right',
                  }}
                >
                  {s.trips} trip{s.trips > 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </Card>

        <Card
          pad={22}
          style={{
            background: 'var(--ink)',
            color: 'var(--paper-warm)',
            borderColor: 'var(--ink)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ color: 'var(--amber)' }}>
              <Icon name="sparkles" size={14} />
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
              Pilot's insights
            </span>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { t: '$42 saved this week', b: 'Four pantry-based meals instead of takeout.' },
              {
                t: 'Spinach: 60% of waste',
                b: "You've tossed it twice. Try the smaller bag — or freeze on day 4.",
              },
              {
                t: 'Milk every 6 days',
                b: 'You buy half-gallons every 6 days. Pilot pre-staged that on the list.',
              },
            ].map((i) => (
              <div
                key={i.t}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--paper-warm)',
                    marginBottom: 4,
                  }}
                >
                  {i.t}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(253,250,243,.65)', lineHeight: 1.45 }}>
                  {i.b}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═════════════ WASTE ═════════════════════════════════════════════════════════

function Waste() {
  const monthCost = mock.wasteLog.reduce((s, x) => s + x.cost, 0);
  const byReason: Record<string, number> = {};
  mock.wasteLog.forEach((l) => {
    byReason[l.reason] = (byReason[l.reason] || 0) + l.cost;
  });
  const reasons = Object.entries(byReason).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <BudgetStat
          label="Wasted this month"
          value={`$${monthCost.toFixed(2)}`}
          sub="5 items · -28% MoM"
          tone="tomato"
          icon="trash"
        />
        <BudgetStat
          label="Items rescued"
          value="3"
          sub="cooked before expiry"
          tone="green"
          icon="leaf"
          up
        />
        <BudgetStat
          label="Most wasted"
          value="Spinach"
          sub="60% of produce waste"
          tone="amber"
          icon="alert"
        />
        <BudgetStat
          label="No-waste days"
          value="7"
          sub="current streak"
          tone="green"
          icon="sparkles"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <SectionHead title="Waste log" eyebrow="Last 30 days" />
          <div style={{ marginTop: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-tint)' }}>
                  {['Item', 'Reason', 'Qty', 'Cost', 'Date'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 14px',
                        textAlign: 'left',
                        fontSize: 11,
                        color: 'var(--ink-muted)',
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mock.wasteLog.map((l, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--ink)' }}>
                      {l.item}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Pill tone="ghost" size="sm">
                        {l.reason}
                      </Pill>
                    </td>
                    <td
                      style={{ padding: '10px 14px', color: 'var(--ink-muted)' }}
                      className="tnum"
                    >
                      {l.qty}
                    </td>
                    <td
                      style={{ padding: '10px 14px', color: 'var(--tomato)', fontWeight: 600 }}
                      className="tnum"
                    >
                      ${l.cost.toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--ink-soft)' }} className="tnum">
                      {l.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Card pad={22}>
            <SectionHead title="Why food is dying" eyebrow="By reason" />
            <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
              {reasons.map(([r, c]) => (
                <div key={r}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                  >
                    <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 }}>
                      {r}
                    </span>
                    <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                      ${c.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--line-soft)', borderRadius: 999 }}>
                    <div
                      style={{
                        width: `${(c / monthCost) * 100}%`,
                        height: '100%',
                        background: 'var(--tomato)',
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card
            pad={22}
            style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="sparkles" size={14} stroke="var(--green-deep)" />
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: 0.6,
                  color: 'var(--green-deep)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                Pilot's tip
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              You waste fresh produce most often when you buy bunches over 6oz. Try smaller bags or
              use frozen — the math says you'd save <strong className="tnum">~$11/month</strong>.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ═════════════ MEMORY ═════════════════════════════════════════════════════════

function CookHeatmap() {
  const days: number[] = [];
  for (let i = 0; i < 84; i++) {
    days.push(Math.random() > 0.45 ? Math.floor(Math.random() * 4) + 1 : 0);
  }
  const colors = ['var(--line-soft)', '#D2DFB6', '#A8C68A', '#6B8E4E', 'var(--green-deep)'];
  return (
    <div>
      <div
        data-testid="cook-heatmap"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 3 }}
      >
        {Array.from({ length: 12 }, (_, w) => (
          <div key={w} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: 7 }, (_, d) => (
              <div
                key={d}
                style={{ aspectRatio: '1', borderRadius: 3, background: colors[days[w * 7 + d]] }}
              />
            ))}
          </div>
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 14,
          fontSize: 11.5,
          color: 'var(--ink-muted)',
        }}
      >
        <span>Less</span>
        {colors.map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
        ))}
        <span>More</span>
        <span style={{ marginLeft: 'auto' }}>12 weeks</span>
      </div>
    </div>
  );
}

function MemoryDeep() {
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={26}
        style={{ background: 'var(--ink)', color: 'var(--paper-warm)', borderColor: 'var(--ink)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,.06)',
              color: 'var(--amber)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={22} />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Kitchen memory · 90 days
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: -0.4 }}>
              The patterns that quietly run your kitchen.
            </h2>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <SectionHead title="Insights" eyebrow="What Pilot has learned" />
          <div style={{ display: 'grid', gap: 10 }}>
            {mock.kitchenMemory.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 14,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--bg-tint)',
                    color: 'var(--ink-2)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Icon name={m.icon} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.25 }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: 'var(--ink-muted)',
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card pad={22}>
          <SectionHead title="Cooking calendar" eyebrow="Days you actually cooked" />
          <CookHeatmap />
        </Card>
      </div>
    </div>
  );
}

// ═════════════ TAKEOUT SWAP ════════════════════════════════════════════════

function TakeoutSwap() {
  const totalSaved = mock.takeoutSwaps.reduce((s, x) => s + x.save, 0);
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={26}
        style={{
          background: 'linear-gradient(160deg, var(--orange-tint) 0%, #F2C99C 100%)',
          borderColor: 'var(--orange-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'var(--on-tint-pad)',
              color: 'var(--orange-deep)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="bag" size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--orange-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Takeout swap
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 26, letterSpacing: -0.4 }}>
              Tonight's craving, homemade —{' '}
              <em style={{ color: 'var(--tomato)', fontStyle: 'italic' }}>
                save ${totalSaved.toFixed(2)}
              </em>
              .
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              When the takeout app calls, Pilot points out the home version you have ingredients
              for.
            </div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: 14,
        }}
      >
        {mock.takeoutSwaps.map((s) => (
          <Card key={s.id} pad={0} hover style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div style={{ padding: '16px 18px', background: 'var(--tomato-soft)' }}>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--tomato-ink)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Takeout
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, color: 'var(--ink)', marginTop: 4, lineHeight: 1.2 }}
                >
                  {s.takeout}
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 24, color: 'var(--tomato-ink)', marginTop: 6, lineHeight: 1 }}
                >
                  ${s.takeoutCost.toFixed(2)}
                </div>
                <div
                  style={{ fontSize: 11, color: 'var(--tomato-ink)', opacity: 0.7, marginTop: 4 }}
                >
                  ~35 min · delivery fee + tip
                </div>
              </div>
              <div style={{ padding: '16px 18px', background: 'var(--green-tint)' }}>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--green-deep)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  Pilot's home swap
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 18, color: 'var(--ink)', marginTop: 4, lineHeight: 1.2 }}
                >
                  {s.home}
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 24, color: 'var(--green-deep)', marginTop: 6, lineHeight: 1 }}
                >
                  ${s.homeCost.toFixed(2)}
                </div>
                <div
                  style={{ fontSize: 11, color: 'var(--green-deep)', opacity: 0.8, marginTop: 4 }}
                >
                  {s.time} min · ingredients in pantry
                </div>
              </div>
            </div>
            <div
              style={{
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-muted)',
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: 'uppercase',
                  }}
                >
                  You save
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--green-deep)', lineHeight: 1, marginTop: 4 }}
                >
                  ${s.save.toFixed(2)}
                </div>
              </div>
              <Button
                variant="primary"
                iconRight="arrowRight"
                onClick={() => fireToast('Cook Mode opens in a later update')}
              >
                Cook the swap
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═════════════ NUTRITION ════════════════════════════════════════════════════

function NutLine({
  label,
  v,
  unit,
  color,
}: {
  label: string;
  v: { value: number; target: number; unit?: string };
  unit?: string;
  color: string;
}) {
  const pct = (v.value / v.target) * 100;
  const u = v.unit ?? unit ?? '';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>{label}</span>
        <span className="tnum" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
          <strong style={{ color: 'var(--ink)' }}>
            {v.value}
            {u}
          </strong>
          <span style={{ marginLeft: 4 }}>
            / {v.target}
            {u}
          </span>
        </span>
      </div>
      <div
        style={{ height: 6, background: 'var(--line-soft)', borderRadius: 999, overflow: 'hidden' }}
      >
        <div
          style={{
            width: `${Math.min(100, pct)}%`,
            height: '100%',
            background: color,
            borderRadius: 999,
            transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
          }}
        />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5,
        color: 'var(--ink-muted)',
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
      {label}
    </div>
  );
}

function Nutrition() {
  const n = mock.nutrition;
  const ringPct = (s: { value: number; target: number }) => (s.value / s.target) * 100;
  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={26}>
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
            Today · Wednesday
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <Ring
                value={ringPct(n.cals)}
                size={200}
                stroke={16}
                color="var(--orange)"
                trackColor="var(--bg-tint)"
              >
                <Ring
                  value={ringPct(n.protein)}
                  size={158}
                  stroke={14}
                  color="var(--tomato)"
                  trackColor="var(--bg-tint)"
                >
                  <Ring
                    value={ringPct(n.fiber)}
                    size={118}
                    stroke={12}
                    color="var(--green)"
                    trackColor="var(--bg-tint)"
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div
                        className="serif tnum"
                        style={{ fontSize: 24, color: 'var(--ink)', lineHeight: 1 }}
                      >
                        {Math.round(ringPct(n.cals))}%
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--ink-muted)',
                          marginTop: 3,
                          fontWeight: 600,
                          letterSpacing: 0.4,
                        }}
                      >
                        OF TARGET
                      </div>
                    </div>
                  </Ring>
                </Ring>
              </Ring>
            </div>
            <div style={{ flex: 1, display: 'grid', gap: 12 }}>
              <NutLine label="Calories" v={n.cals} unit="" color="var(--orange)" />
              <NutLine label="Protein" v={n.protein} color="var(--tomato)" />
              <NutLine label="Fiber" v={n.fiber} color="var(--green)" />
              <NutLine label="Carbs" v={n.carbs} color="var(--amber)" />
              <NutLine label="Fat" v={n.fat} color="var(--basil)" />
            </div>
          </div>
        </Card>

        <Card
          pad={22}
          style={{ background: 'var(--green-tint)', borderColor: 'var(--green-soft)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ color: 'var(--green-deep)' }}>
              <Icon name="sparkles" size={14} />
            </span>
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--green-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Pilot suggests
            </span>
          </div>
          <div
            className="serif"
            style={{
              fontSize: 22,
              color: 'var(--ink)',
              letterSpacing: -0.3,
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            Dinner is light on protein. Want to add eggs or tofu to your fried rice?
          </div>
          <p
            style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '0 0 16px', lineHeight: 1.55 }}
          >
            You're 22g under target. A 3-egg add-in covers 18g without extending cook time.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {[
              { l: '+3 eggs', p: '+18g', c: '+0.50' },
              { l: '+½ tofu block', p: '+10g', c: '+0.80' },
              { l: '+Greek yogurt', p: '+12g', c: '+0.90' },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  padding: '8px 10px',
                  background: 'var(--on-tint-pad)',
                  border: '1px solid var(--green-soft)',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{s.l}</div>
                <div style={{ fontSize: 10.5, color: 'var(--green-deep)', marginTop: 2 }}>
                  {s.p} · ${s.c}
                </div>
              </div>
            ))}
          </div>
          <Button size="sm" variant="primary" onClick={() => fireToast('+3 eggs added to dinner')}>
            Apply suggestion
          </Button>
        </Card>
      </div>

      {/* Weekly trend */}
      <Card pad={22}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              This week · protein
            </div>
            <div
              className="serif tnum"
              style={{ fontSize: 26, color: 'var(--ink)', marginTop: 6, lineHeight: 1 }}
            >
              72g <span style={{ fontSize: 14, color: 'var(--ink-muted)' }}>avg / day</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Legend color="var(--tomato)" label="Protein" />
            <Legend color="var(--green)" label="Fiber" />
            <Legend color="var(--orange-soft)" label="Target" />
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 12,
            alignItems: 'end',
            height: 180,
          }}
        >
          {[68, 84, 72, 90, 65, 76, 60].map((v, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 140,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${140 - (90 / 100) * 140}px`,
                    height: 1,
                    borderTop: '1px dashed var(--orange)',
                  }}
                />
                <div
                  style={{
                    height: `${(v / 100) * 140}px`,
                    borderRadius: '8px 8px 3px 3px',
                    background: v >= 90 ? 'var(--green)' : 'var(--tomato)',
                    opacity: i === 2 ? 1 : 0.55,
                    transition: 'height 600ms cubic-bezier(.2,.8,.2,1)',
                  }}
                />
              </div>
              <div
                className="tnum"
                style={{ fontSize: 11, color: 'var(--ink-2)', fontWeight: 600 }}
              >
                {v}g
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{mock.days[i]}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Meals breakdown */}
      <Card pad={22}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.6,
            color: 'var(--ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Today's meals
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            {
              meal: 'Breakfast',
              name: 'Banana Oat Pancakes',
              cal: 320,
              p: 14,
              c: 52,
              f: 6,
              color: 'var(--amber)',
            },
            {
              meal: 'Lunch',
              name: 'Chickpea Rice Bowl',
              cal: 560,
              p: 22,
              c: 88,
              f: 12,
              color: 'var(--green)',
            },
            {
              meal: 'Dinner',
              name: 'Schezwan Fried Rice',
              cal: 480,
              p: 18,
              c: 62,
              f: 14,
              color: 'var(--tomato)',
            },
            {
              meal: 'Snack',
              name: 'Greek Yogurt Parfait',
              cal: 290,
              p: 18,
              c: 38,
              f: 6,
              color: 'var(--plum)',
            },
          ].map((m) => (
            <div
              key={m.meal}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr repeat(4, 70px)',
                gap: 12,
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: 10,
                background: 'var(--paper-warm)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: m.color,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {m.meal}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{m.name}</div>
              {[`${m.cal} cal`, `${m.p}g pro`, `${m.c}g car`, `${m.f}g fat`].map((vv, i) => (
                <div
                  key={i}
                  className="tnum"
                  style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'right' }}
                >
                  {vv}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═════════════ INSIGHTS (routed) ═══════════════════════════════════════════

type InsightsTab = 'budget' | 'waste' | 'nutrition' | 'memory' | 'takeout';

export function Insights() {
  const [tab, setTab] = useState<InsightsTab>('budget');
  return (
    <div style={{ padding: '28px 28px 0' }}>
      <div style={{ marginBottom: 18 }}>
        <Tabs
          label="Insights views"
          tabs={[
            { label: 'Budget', value: 'budget' },
            { label: 'Food waste', value: 'waste' },
            { label: 'Nutrition', value: 'nutrition' },
            { label: 'Memory', value: 'memory' },
            { label: 'Takeout swap', value: 'takeout' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as InsightsTab)}
        />
      </div>
      <div style={{ paddingBottom: 56, margin: '0 -28px' }}>
        {tab === 'budget' && <Budget />}
        {tab === 'nutrition' && <Nutrition />}
        {tab === 'waste' && <Waste />}
        {tab === 'memory' && <MemoryDeep />}
        {tab === 'takeout' && <TakeoutSwap />}
      </div>
    </div>
  );
}
