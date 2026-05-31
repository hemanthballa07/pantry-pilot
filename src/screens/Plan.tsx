// src/screens/Plan.tsx — Phase 4 port of planner.jsx (window.PPPlanner.Planner)
//
// Tabs: Weekly plan (drag-and-drop calendar) · Budget basket · Occasions.
// WeeklyPlan mutates a deep clone of the mock meal plan — dropping a recipe
// onto a slot rewrites that day/slot and recomputes the cost/protein stats live.
//
// All window.PP* globals removed: data from @/data/mock, actions from stores / router.
// Documented deviations from the legacy screen:
//   1. onOpenRecipe navigates to /cook (recipe detail overlay converts later).
//   2. onNav('grocery') → navigate('/shop'): the legacy screen id 'grocery' is the
//      Shop route in the converted app, so the "Open grocery list" CTA points there.
//   3. The legacy toast `{ icon }` option is dropped — the toast store is
//      push(text, { tone? }) and derives its glyph from tone (matches Shop/Pantry).
//
// ADR-010: WeeklyPlan's `plan` state is typed with the wide `MealPlan` interface
// from @/types, not `typeof mock.mealPlan`. The mock's `satisfies PPData` pins slot
// fields to their literal recipe ids, which would reject reassigning a slot.

import { useState } from 'react';
import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores';
import type { MealPlan, Day, MealSlotKey, RecipeId, Recipe } from '@/types';

// ─── Icon ─────────────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, string> = {
  sparkles:   'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
  leaf:       'M17 8C8 10 5.9 16.17 3.82 22 8 22 12 21 14 18c2-3 0-7-3-7s-5 3-3 7',
  flame:      'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5s-2-3-2-3 4 0 6-2z',
  wallet:     'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm14 5a1 1 0 110-2 1 1 0 010 2z',
  save:       'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
  timer:      'M12 6a8 8 0 110 16 8 8 0 010-16z M10 2h4 M12 10v4',
  snowflake:  'M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19',
  info:       'M12 21a9 9 0 110-18 9 9 0 010 18z M12 16v-4 M12 8h.01',
  cart:       'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  close:      'M6 6l12 12M18 6L6 18',
  // Multi-element legacy glyphs folded into one stroked `d` (circles → arc pairs;
  // at small sizes the 1.8 stroke reads as filled dots, matching the originals).
  drag:       'M7.8 6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 6a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M7.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 12a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M7.8 18a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0 M13.8 18a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0',
  users:      'M5.5 8a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0 M2 20a7 7 0 0 1 14 0 M14.5 7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0 M16 14a5 5 0 0 1 6 5',
};

interface IconProps { name: string; size?: number; stroke?: string; }
function Icon({ name, size = 18, stroke = 'currentColor' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
         style={{ flexShrink: 0 }}>
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}

// ─── Illo ─────────────────────────────────────────────────────────────────

const ILLO_COLORS: Record<string, string> = {
  rice:          '#E8D9A8', bread:        '#D4A853', chicken:      '#C9884A', carrot:  '#E07840',
  beans:         '#8B6040', frozenveg:    '#7ABFA8', berries:      '#8E4A8E', chili:   '#C93A3A',
  banana:        '#E8C840', milk:         '#F0EAD6', tofu:         '#F0EDD8', oats:    '#C8A878',
  oil:           '#C8B860', coffee:       '#6B4226', salt:         '#E8E8E0', pasta:   '#E8CF88',
  cheese:        '#E8B840', ricebag:      '#D4C090', peanutbutter: '#C8904A', soy:     '#8B7340',
  onion:         '#C8A8C8', garlic:       '#E8D8C0', tomato:       '#C83A3A', pepper:  '#3A9848',
  spinach:       '#3B6E3D', egg:          '#C99325', yogurt:       '#E8DCC8', apple:   '#C73E2E',
};

interface IlloProps { name: string; size?: number; }
function Illo({ name, size = 48 }: IlloProps) {
  const bg = ILLO_COLORS[name] ?? 'var(--line, rgba(0,0,0,.1))';
  return (
    <div aria-label={name} style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.22),
      background: bg, opacity: 0.82, flexShrink: 0,
    }} />
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  pad?: number; style?: CSSProperties; children?: ReactNode;
  hover?: boolean; onClick?: () => void;
}
function Card({ pad = 20, style, children, onClick }: CardProps) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--paper, #fff)',
      border: '1px solid var(--line, rgba(0,0,0,.1))',
      borderRadius: 16, padding: pad,
      boxShadow: 'var(--sh-1, 0 1px 4px rgba(0,0,0,.06))',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Pill ─────────────────────────────────────────────────────────────────

type PillTone = 'green' | 'orange' | 'tomato' | 'amber' | 'sky' | 'ink' | 'neutral' | 'ghost';

interface PillProps {
  tone?: PillTone; size?: 'sm' | 'md'; children?: ReactNode;
  dot?: boolean; icon?: string;
}

const PILL_STYLES: Record<PillTone, { bg: string; color: string; border: string }> = {
  green:   { bg: 'var(--green-tint, #eef7ee)',  color: 'var(--green-deep, #2a5a2a)', border: 'var(--green-soft, rgba(59,110,61,.2))' },
  orange:  { bg: 'var(--orange-tint, #fff3e8)', color: 'var(--orange-deep, #b05a10)', border: 'rgba(176,90,16,.2)' },
  tomato:  { bg: 'var(--tomato-soft, #fff0ee)', color: 'var(--tomato-ink, #b02020)',  border: 'var(--tomato-line, rgba(176,32,32,.2))' },
  amber:   { bg: 'var(--amber-soft, #fff8e8)',  color: 'var(--amber-ink, #9a6a00)',   border: 'var(--amber-line, rgba(154,106,0,.2))' },
  sky:     { bg: 'var(--sky-soft, #d9e4ec)',    color: 'var(--sky-ink, #1f3b52)',     border: 'var(--sky, #3a5f7a)' },
  ink:     { bg: 'var(--ink, #1a1814)',         color: 'var(--paper-warm, #fdfaf3)',  border: 'var(--ink, #1a1814)' },
  neutral: { bg: 'rgba(0,0,0,.05)',              color: 'var(--ink-muted, #8a8374)',   border: 'transparent' },
  ghost:   { bg: 'rgba(0,0,0,.04)',              color: 'var(--ink-muted, #8a8374)',   border: 'transparent' },
};

function Pill({ tone = 'neutral', size = 'sm', children, dot, icon }: PillProps) {
  const s   = PILL_STYLES[tone];
  const pad = size === 'md' ? '4px 10px' : '3px 8px';
  const fs  = size === 'md' ? 12 : 11;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: pad, fontSize: fs, fontWeight: 700,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`, borderRadius: 999,
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: 'currentColor', flexShrink: 0 }} />}
      {icon && <Icon name={icon} size={11} />}
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?:  'primary' | 'secondary' | 'ghost' | 'soft' | 'orange';
  size?:     'sm';
  icon?:     string;
  iconRight?: string;
  full?:     boolean;
  onClick?:  MouseEventHandler<HTMLButtonElement>;
  style?:    CSSProperties;
  children?: ReactNode;
}

const BTN_STYLES: Record<string, { bg: string; fg: string; bd: string }> = {
  primary:   { bg: 'var(--ink, #1a1814)',        fg: 'var(--paper-warm, #fdfaf3)', bd: 'none' },
  secondary: { bg: 'var(--paper-warm, #fdfaf3)', fg: 'var(--ink, #1a1814)',        bd: '1px solid var(--line, rgba(0,0,0,.12))' },
  ghost:     { bg: 'transparent',                fg: 'var(--ink-2, #4a4535)',      bd: '1px solid var(--line, rgba(0,0,0,.12))' },
  soft:      { bg: 'var(--paper-warm, #fdfaf3)', fg: 'var(--ink-2, #4a4535)',      bd: '1px solid var(--line-soft, rgba(0,0,0,.06))' },
  orange:    { bg: 'var(--orange, #D9722B)',     fg: '#FDFAF3',                    bd: 'none' },
};

function Button({ variant = 'primary', size, icon, iconRight, full, onClick, style, children }: ButtonProps) {
  const s   = BTN_STYLES[variant] ?? BTN_STYLES.primary;
  const pad = size === 'sm' ? '6px 12px' : '10px 18px';
  const fs  = size === 'sm' ? 12 : 14;
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
      padding: pad, fontSize: fs, fontWeight: 600,
      background: s.bg, color: s.fg, border: s.bd, borderRadius: 10,
      cursor: 'pointer', fontFamily: 'inherit',
      width: full ? '100%' : undefined,
      ...style,
    }}>
      {icon      && <Icon name={icon}      size={size === 'sm' ? 12 : 14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 12 : 14} />}
    </button>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

interface TabDef { label: string; value: string; count?: number; }

function Tabs({ tabs, value, onChange }: { tabs: TabDef[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4, background: 'var(--bg-tint)',
                    padding: 4, borderRadius: 12, border: '1px solid var(--line)' }}>
      {tabs.map(t => {
        const active = value === t.value;
        return (
          <button key={t.value} onClick={() => onChange(t.value)} style={{
            padding: '7px 14px', fontSize: 12.5, fontWeight: 600,
            background: active ? 'var(--paper)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-muted)',
            border: 'none', borderRadius: 8,
            boxShadow: active ? 'var(--sh-1)' : 'none',
            cursor: 'pointer', transition: 'all 160ms ease',
          }}>
            {t.label}
            {t.count != null && (
              <span style={{ marginLeft: 6, color: 'var(--ink-soft)', fontWeight: 600 }}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Chip (extended with an optional leading icon for plan-style chips) ───────

function Chip({ active, onClick, children, icon }: {
  active: boolean; onClick: () => void; children: ReactNode; icon?: string;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '6px 12px', height: 30,
      background: active ? 'var(--ink)' : 'var(--paper)',
      color: active ? 'var(--paper-warm)' : 'var(--ink-2)',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 160ms ease',
    }}>
      {icon && <Icon name={icon} size={13} />}
      {children}
    </button>
  );
}

// ─── recipe → illustration heuristic ──────────────────────────────────────

function recipeIllo(r: Recipe): string {
  if (/rice/i.test(r.name)) return 'rice';
  if (/pasta/i.test(r.name)) return 'pasta';
  if (/yogurt|parfait/i.test(r.name)) return 'yogurt';
  if (/oat|pancake/i.test(r.name)) return 'oats';
  if (/omelette|egg/i.test(r.name)) return 'egg';
  if (/wrap|sandwich/i.test(r.name)) return 'bread';
  if (/tofu/i.test(r.name)) return 'tofu';
  if (/bean/i.test(r.name)) return 'beans';
  if (/chicken/i.test(r.name)) return 'chicken';
  return 'rice';
}

// ─── Plan-style templates ──────────────────────────────────────────────────

type TemplateId = 'balanced' | 'protein' | 'budget' | 'veg' | 'prep' | 'fast';

const PLAN_TEMPLATES: { id: TemplateId; l: string; icon: string; tone: string }[] = [
  { id: 'balanced', l: 'Use what I have', icon: 'leaf',   tone: 'green' },
  { id: 'protein',  l: 'High-protein',    icon: 'flame',  tone: 'tomato' },
  { id: 'budget',   l: 'Under $60',       icon: 'wallet', tone: 'amber' },
  { id: 'veg',      l: 'Vegetarian',      icon: 'leaf',   tone: 'green' },
  { id: 'prep',     l: 'Meal prep Sun.',  icon: 'save',   tone: 'orange' },
  { id: 'fast',     l: '20-min meals',    icon: 'timer',  tone: 'neutral' },
];

// ═════════════ WEEKLY PLAN ═══════════════════════════════════════════════

const recipeById = (id: RecipeId | null) => mock.recipes.find(r => r.id === id);

function WeeklyPlan({ onOpenRecipe, onNav, onPushToast }: {
  onOpenRecipe: (id: string) => void;
  onNav: (id: string) => void;
  onPushToast: (msg: string) => void;
}) {
  const [template, setTemplate] = useState<TemplateId>('balanced');
  const [draggedRecipe, setDraggedRecipe] = useState<RecipeId | null>(null);
  const [hovered, setHovered] = useState<{ day: Day; slot: MealSlotKey } | null>(null);
  // ADR-010: typed with MealPlan, not typeof mock.mealPlan (slot reassignment).
  const [plan, setPlan] = useState<MealPlan>(() => JSON.parse(JSON.stringify(mock.mealPlan)));

  const totalRecipes = mock.days.flatMap(d => Object.values(plan[d])).filter(Boolean).length;
  const totalCost = mock.days.flatMap(d => Object.values(plan[d]))
                              .filter(Boolean).map(id => recipeById(id)?.cost || 0)
                              .reduce((s, c) => s + c * 2, 0); // 2 servings each
  const protein = mock.days.flatMap(d => Object.values(plan[d]))
                             .filter(Boolean).map(id => recipeById(id)?.protein || 0)
                             .reduce((s, p) => s + p, 0);

  const onDrop = (day: Day, slot: MealSlotKey) => {
    if (!draggedRecipe) return;
    setPlan(p => ({ ...p, [day]: { ...p[day], [slot]: draggedRecipe } }));
    onPushToast(`Added ${recipeById(draggedRecipe)?.name} to ${day} · ${slot}`);
    setDraggedRecipe(null);
    setHovered(null);
  };

  const clearSlot = (day: Day, slot: MealSlotKey) => {
    setPlan(p => ({ ...p, [day]: { ...p[day], [slot]: null } }));
  };

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {/* Top stats + auto-plan */}
      <Card pad={22} style={{ background:
        'linear-gradient(160deg, #F2EBD1 0%, var(--green-tint) 100%)',
        borderColor: 'var(--green-soft)', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr auto',
                        gap: 24, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'var(--green-deep)',
                            fontWeight: 700, textTransform: 'uppercase' }}>Week of Nov 23</div>
            <h2 className="serif" style={{ margin: '6px 0 4px', fontSize: 26, letterSpacing: -0.4 }}>
              {totalRecipes} meals planned · feels balanced.
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>
              Mix of pantry-first cooking and one quick takeout-style night.
            </div>
          </div>
          <PlanStat label="Est. cost" value={`$${totalCost.toFixed(0)}`} sub="2 servings each" />
          <PlanStat label="Protein/day" value={`${Math.round(protein / 7)}g`} sub="avg target 90g" />
          <PlanStat label="Pantry coverage" value="74%" sub="6 items to buy" />
          <Button variant="primary" icon="sparkles" onClick={() => onPushToast('Pilot rewrote your week — review the changes')}>
            Auto-plan
          </Button>
        </div>
        <div style={{ position: 'absolute', right: -10, top: -30, opacity: 0.3 }}>
          <Illo name="oats" size={140} />
        </div>
      </Card>

      {/* Template chips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', fontWeight: 600,
                        letterSpacing: 0.4, textTransform: 'uppercase', marginRight: 4 }}>
          Plan style
        </div>
        {PLAN_TEMPLATES.map(t => (
          <Chip key={t.id} active={template === t.id} icon={t.icon} onClick={() => setTemplate(t.id)}>
            {t.l}
          </Chip>
        ))}
      </div>

      {/* Body — calendar + recipe drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, minHeight: 540 }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)',
                          borderBottom: '1px solid var(--line)' }}>
            <div style={{ padding: '12px 16px', fontSize: 11, color: 'var(--ink-muted)',
                            fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Week
            </div>
            {mock.days.map(d => (
              <div key={d} style={{
                padding: '12px 14px',
                borderLeft: '1px solid var(--line-soft)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-muted)', fontWeight: 700,
                                letterSpacing: 0.4, textTransform: 'uppercase' }}>{d}</div>
                <div className="serif tnum" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 2 }}>
                  {23 + mock.days.indexOf(d)}
                </div>
              </div>
            ))}
          </div>
          {(['B', 'L', 'D'] as const).map(slot => {
            const slotLabel = { B: 'Breakfast', L: 'Lunch', D: 'Dinner' }[slot];
            return (
              <div key={slot} style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)',
                                          borderBottom: '1px solid var(--line)' }}>
                <div style={{ padding: '10px 16px',
                                borderRight: '1px solid var(--line-soft)',
                                background: 'var(--paper-warm)' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-soft)', fontWeight: 700,
                                  letterSpacing: 0.5, textTransform: 'uppercase' }}>{slot}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2, fontWeight: 600 }}>
                    {slotLabel}
                  </div>
                </div>
                {mock.days.map(d => {
                  const id = plan[d][slot];
                  const r = id ? recipeById(id) : null;
                  const isHover = hovered?.day === d && hovered?.slot === slot;
                  return (
                    <div key={d + slot}
                      onDragOver={(e) => { e.preventDefault(); setHovered({ day: d, slot }); }}
                      onDragLeave={() => setHovered(null)}
                      onDrop={() => onDrop(d, slot)}
                      style={{
                        padding: 8, borderLeft: '1px solid var(--line-soft)', minHeight: 92,
                        background: isHover ? 'var(--green-tint)' : 'transparent',
                        transition: 'background 160ms',
                      }}>
                      {r ? <PlannedMeal recipe={r} onClick={() => onOpenRecipe(r.id)} onClear={() => clearSlot(d, slot)} /> :
                        <EmptySlot />}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Bottom hint */}
          <div style={{ padding: '12px 18px', background: 'var(--bg-tint)',
                          borderTop: '1px solid var(--line)',
                          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-muted)' }}>
            <Icon name="info" size={14} />
            Drag a recipe from the right pane onto any slot. Click a meal to open it.
          </div>
        </Card>

        {/* Recipe drawer */}
        <Card pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="serif" style={{ fontSize: 16, color: 'var(--ink)' }}>Drag to plan</div>
            <Pill tone="green" size="sm">{mock.recipes.length} recipes</Pill>
          </div>
          <div style={{ display: 'grid', gap: 8, maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
            {mock.recipes.map(r => (
              <div key={r.id}
                draggable
                onDragStart={() => setDraggedRecipe(r.id)}
                onDragEnd={() => { setDraggedRecipe(null); setHovered(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10, cursor: 'grab',
                  background: 'var(--paper-warm)', border: '1px solid var(--line-soft)',
                  transition: 'transform 120ms',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: `linear-gradient(135deg, ${r.tone}CC 0%, ${r.tone}88 100%)`,
                  display: 'grid', placeItems: 'center', flex: '0 0 auto',
                }}>
                  <Illo name={recipeIllo(r)} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                    {r.time}m · ${r.cost.toFixed(2)} · {r.match}% match
                  </div>
                </div>
                <Icon name="drag" size={14} stroke="var(--ink-soft)" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Generate grocery list */}
      <Card pad={22} style={{ background: 'var(--ink)', color: 'var(--paper-warm)',
                                borderColor: 'var(--ink)',
                                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,.06)',
                        color: 'var(--amber)', display: 'grid', placeItems: 'center' }}>
          <Icon name="cart" size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="serif" style={{ fontSize: 19, letterSpacing: -0.2 }}>
            Pilot built a grocery list from your week.
          </div>
          <div style={{ fontSize: 13, color: 'rgba(253,250,243,.65)', marginTop: 4 }}>
            11 items · est. <span style={{ color: 'var(--amber)', fontWeight: 600 }}>$42.10</span> at Aldi ·
            warns on 2 duplicates with your pantry
          </div>
        </div>
        <Button variant="orange" iconRight="arrowRight" onClick={() => onNav('grocery')}>
          Open grocery list
        </Button>
      </Card>
    </div>
  );
}

function PlanStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: 'var(--ink-muted)',
                      fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
      <div className="serif tnum" style={{ fontSize: 22, color: 'var(--ink)', marginTop: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function PlannedMeal({ recipe, onClick, onClear }: {
  recipe: Recipe; onClick: () => void; onClear: () => void;
}) {
  return (
    <div onClick={onClick} className="lift" style={{
      cursor: 'pointer', background: 'var(--paper)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '8px 10px', position: 'relative', height: '100%',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                      background: recipe.tone, borderRadius: '10px 0 0 10px' }} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', paddingLeft: 4 }}>
        <Illo name={recipeIllo(recipe)} size={20} />
        <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
          marginLeft: 'auto', border: 'none', background: 'transparent',
          color: 'var(--ink-soft)', padding: 0, opacity: 0.6, cursor: 'pointer',
        }}>
          <Icon name="close" size={12} />
        </button>
      </div>
      <div style={{ paddingLeft: 4, marginTop: 4, fontSize: 11.5, fontWeight: 600,
                      color: 'var(--ink-2)', lineHeight: 1.25, flex: 1,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {recipe.name}
      </div>
      <div style={{ paddingLeft: 4, fontSize: 10, color: 'var(--ink-soft)', marginTop: 2 }}>
        {recipe.time}m · ${recipe.cost.toFixed(2)}
      </div>
    </div>
  );
}

function EmptySlot() {
  return (
    <div style={{
      height: '100%', minHeight: 70, display: 'grid', placeItems: 'center',
      border: '1.5px dashed var(--line-strong)', borderRadius: 10,
      color: 'var(--ink-soft)', fontSize: 11,
    }}>
      <span>Drop here</span>
    </div>
  );
}

// ═════════════ BUDGET BASKET ═══════════════════════════════════════════════

function BudgetBasket({ onOpenRecipe, onPushToast }: {
  onOpenRecipe: (id: string) => void; onPushToast: (msg: string) => void;
}) {
  const [budget, setBudget] = useState(35);
  const [meals, setMeals] = useState(5);
  // Pick the cheapest N recipes that fit
  const picked = mock.recipes.slice().sort((a, b) => a.cost - b.cost).slice(0, meals);
  const total = picked.reduce((s, r) => s + r.cost * 2, 0); // 2 servings each
  const totalProtein = picked.reduce((s, r) => s + r.protein, 0);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card pad={26} style={{
        background: 'linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)',
        borderColor: 'var(--green-soft)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'var(--green-deep)',
                        fontWeight: 700, textTransform: 'uppercase' }}>Budget basket</div>
        <h2 className="serif" style={{ margin: '6px 0 6px', fontSize: 30, letterSpacing: -0.5, lineHeight: 1.1 }}>
          Build me <em style={{ color: 'var(--green-deep)', fontStyle: 'italic' }}>{meals} dinners</em> under
          <em style={{ color: 'var(--green-deep)', fontStyle: 'italic' }}> ${budget}</em>.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto',
                        gap: 24, alignItems: 'center', marginTop: 22 }}>
          <BasketControl label="Meals" value={meals} min={3} max={10} onChange={setMeals} />
          <BasketControl label="Budget" value={budget} prefix="$" min={15} max={100} step={5} onChange={setBudget} />
          <BasketStat label="Estimated total" value={`$${total.toFixed(2)}`}
                        tone={total <= budget ? 'green' : 'tomato'} />
          <BasketStat label="Avg protein" value={`${Math.round(totalProtein / meals)}g`} />
          <Button variant="primary" iconRight="arrowRight"
                  onClick={() => onPushToast('Basket added to your meal plan')}>
            Apply to plan
          </Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {picked.map((r, i) => (
          <Card key={r.id} pad={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => onOpenRecipe(r.id)}>
            <div style={{
              height: 100,
              background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
              display: 'grid', placeItems: 'center', position: 'relative',
            }}>
              <Illo name="rice" size={50} />
              <div style={{ position: 'absolute', top: 8, left: 8 }}>
                <Pill tone="ink" size="sm">Meal {i + 1}</Pill>
              </div>
              <div style={{ position: 'absolute', top: 8, right: 8 }}>
                <Pill tone="green" size="sm" dot>${r.cost.toFixed(2)}/srv</Pill>
              </div>
            </div>
            <div style={{ padding: 14 }}>
              <div className="serif" style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.2 }}>{r.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 4 }}>
                {r.time}m · {r.protein}g protein
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function BasketControl({ label, value, prefix, min, max, step = 1, onChange }: {
  label: string; value: number; prefix?: string;
  min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 700,
                      letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtn}>−</button>
        <div className="serif tnum" style={{ fontSize: 22, color: 'var(--ink)', width: 56, textAlign: 'center', lineHeight: 1 }}>
          {prefix || ''}{value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + step))} style={stepBtn}>+</button>
      </div>
    </div>
  );
}

function BasketStat({ label, value, tone }: { label: string; value: string; tone?: 'green' | 'tomato' }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', fontWeight: 700,
                      letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div className="serif tnum" style={{
        fontSize: 22, lineHeight: 1,
        color: tone === 'green' ? 'var(--green-deep)' : tone === 'tomato' ? 'var(--tomato)' : 'var(--ink)',
      }}>{value}</div>
    </div>
  );
}

const stepBtn: CSSProperties = {
  width: 26, height: 26, borderRadius: 7,
  background: 'rgba(255,255,255,.7)', border: '1px solid var(--line)',
  color: 'var(--ink-2)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
};

// ═════════════ OCCASION PLANS ══════════════════════════════════════════════

function OccasionPlans({ onPushToast }: { onPushToast: (msg: string) => void }) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card pad={22} style={{
        background: 'linear-gradient(160deg, var(--orange-tint) 0%, var(--orange-soft) 100%)',
        borderColor: 'var(--orange-soft)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'var(--orange-deep)',
                        fontWeight: 700, textTransform: 'uppercase' }}>Occasion plans</div>
        <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 24, letterSpacing: -0.3 }}>
          One-tap plans for the way the week actually goes.
        </h2>
        <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
          Pre-built around context — exam crunches, lazy weekends, friends coming by.
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {mock.occasions.map(o => (
          <Card key={o.id} pad={22} hover style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--bg-tint)',
                              color: 'var(--ink-2)', display: 'grid', placeItems: 'center' }}>
                <Icon name={o.icon} size={17} />
              </div>
              <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', letterSpacing: -0.2 }}>
                {o.name}
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 14 }}>
              {o.desc}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14,
                            paddingBottom: 14, borderBottom: '1px solid var(--line-soft)' }}>
              <OccasionStat label="Meals" value={o.meals} />
              <OccasionStat label="Hours" value={o.hours} />
              <OccasionStat label="Cost"  value={o.cost === 0 ? 'Free' : `$${o.cost}`} />
            </div>
            <Button size="sm" variant="primary" full iconRight="arrowRight"
                    onClick={() => onPushToast(`Loaded "${o.name}" into your plan`)}>
              Use this plan
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function OccasionStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="serif tnum" style={{ fontSize: 18, color: 'var(--ink)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-muted)', marginTop: 4, fontWeight: 600,
                      letterSpacing: 0.4, textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────

type PlanTab = 'week' | 'basket' | 'occasion';

export default function Plan() {
  const navigate  = useNavigate();
  const pushToast = useToastStore(s => s.push);

  const [tab, setTab] = useState<PlanTab>('week');

  const onOpenRecipe = (_id: string)  => navigate('/cook');
  const onPushToast  = (msg: string)  => pushToast(msg);
  // Legacy screen id 'grocery' is the Shop route in the converted app.
  const onNav        = (id: string)   => navigate('/' + (id === 'grocery' ? 'shop' : id));

  return (
    <div style={{ padding: '28px 28px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                      justifyContent: 'space-between', marginBottom: 18 }}>
        <Tabs tabs={[
          { label: 'Weekly plan',   value: 'week' },
          { label: 'Budget basket', value: 'basket' },
          { label: 'Occasions',     value: 'occasion' },
        ]} value={tab} onChange={(v) => setTab(v as PlanTab)} />
      </div>
      <div style={{ paddingBottom: 56 }}>
        {tab === 'week'     && <WeeklyPlan onOpenRecipe={onOpenRecipe} onNav={onNav} onPushToast={onPushToast} />}
        {tab === 'basket'   && <BudgetBasket onOpenRecipe={onOpenRecipe} onPushToast={onPushToast} />}
        {tab === 'occasion' && <OccasionPlans onPushToast={onPushToast} />}
      </div>
    </div>
  );
}
