// src/screens/Pantry.tsx — Phase 4 port of pantry.jsx (window.PPPantry.Pantry)
//
// Tabs: Inventory · Use first · Low stock · Leftovers · Auto-restock · Staples · Kitchen memory.
// All window.PP* globals removed: data from @/data/mock, actions from stores / router.
// The legacy `window.PPPantryTab` deep-link hook is dropped (no consumer in Phase 4).
// `search` came from the shell TopBar (src/shell.jsx); it converts in a later phase, so
// InventoryView defaults it to '' (filter is a no-op until then).

import { useState, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore, useSearchStore } from '@/stores';
import { Icon, Pill, Button, type PillTone } from '@/components/ui';
import { Illo } from '@/components/Illo';

// ─── Derived types ──────────────────────────────────────────────────────────

type Item = (typeof mock.items)[number];
type Leftover = (typeof mock.leftovers)[number];
type RestockRule = (typeof mock.autoRestockRules)[number];

// ─── Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  pad?: number;
  style?: CSSProperties;
  children?: ReactNode;
  hover?: boolean;
  onClick?: () => void;
}
function Card({ pad = 20, style, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
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

// ─── ExpiryBadge ────────────────────────────────────────────────────────────

function ExpiryBadge({
  status,
  expires,
  size = 'md',
}: {
  status: string;
  expires: string;
  size?: 'sm' | 'md';
}) {
  const map: Record<string, { tone: PillTone; text: string; icon?: string }> = {
    today: { tone: 'tomato', text: 'Use today', icon: 'alert' },
    tomorrow: { tone: 'tomato', text: 'Tomorrow', icon: 'alert' },
    week: { tone: 'amber', text: expires, icon: 'clock' },
    fresh: { tone: 'green', text: expires },
    frozen: { tone: 'sky', text: 'Frozen', icon: 'snowflake' },
    expired: { tone: 'ink', text: 'Expired', icon: 'alert' },
  };
  const m = map[status] ?? map.fresh;
  return (
    <Pill tone={m.tone} size={size} icon={m.icon}>
      {m.text}
    </Pill>
  );
}

// ─── Progress ─────────────────────────────────────────────────────────────

interface ProgressProps {
  value: number;
  max?: number;
  tone?: 'green' | 'amber' | 'tomato' | 'orange';
  height?: number;
}
const PROGRESS_COLOR: Record<string, string> = {
  green: 'var(--green, #3B6E3D)',
  amber: 'var(--amber, #C99325)',
  tomato: 'var(--tomato, #C73E2E)',
  orange: 'var(--orange, #D9722B)',
};
function Progress({ value, max = 100, tone = 'green', height = 8 }: ProgressProps) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
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
          background: PROGRESS_COLOR[tone],
          borderRadius: 999,
          transition: 'width 300ms',
        }}
      />
    </div>
  );
}

// ─── Ring ─────────────────────────────────────────────────────────────────

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  children?: ReactNode;
}
function Ring({
  value,
  max,
  size = 64,
  stroke = 8,
  color = 'var(--green)',
  trackColor = 'rgba(0,0,0,.06)',
  children,
}: RingProps) {
  const pct = max !== undefined ? (value / max) * 100 : value;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.min(100, pct) / 100);
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

// ─── SectionHead ──────────────────────────────────────────────────────────

function SectionHead({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
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
          {eyebrow}
        </div>
        <div className="serif" style={{ fontSize: 17, color: 'var(--ink)', marginTop: 3 }}>
          {title}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

interface TabDef {
  label: string;
  value: string;
  count?: number;
}

function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: TabDef[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        gap: 4,
        background: 'var(--bg-tint)',
        padding: 4,
        borderRadius: 12,
        border: '1px solid var(--line)',
      }}
    >
      {tabs.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            style={{
              padding: '7px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              background: active ? 'var(--paper)' : 'transparent',
              color: active ? 'var(--ink)' : 'var(--ink-muted)',
              border: 'none',
              borderRadius: 8,
              boxShadow: active ? 'var(--sh-1)' : 'none',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          >
            {t.label}
            {t.count != null && (
              <span style={{ marginLeft: 6, color: 'var(--ink-soft)', fontWeight: 600 }}>
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Chip ─────────────────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        height: 30,
        background: active ? 'var(--ink)' : 'var(--paper)',
        color: active ? 'var(--paper-warm)' : 'var(--ink-2)',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'all 160ms ease',
      }}
    >
      {children}
    </button>
  );
}

// ─── IngredientTile (rich — gradient header + expiry badge) ──────────────────

const TILE_TONE: Record<string, string> = {
  today: 'linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)',
  tomorrow: 'linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)',
  week: 'linear-gradient(160deg, #F4E6C8 0%, #EFD7A4 100%)',
  fresh: 'linear-gradient(160deg, #E5EBD5 0%, #D2DFB6 100%)',
  frozen: 'linear-gradient(160deg, #D9E4EC 0%, #BFD1DE 100%)',
  expired: 'linear-gradient(160deg, #E0D9C8 0%, #C8BFA6 100%)',
};

function IngredientTile({
  item,
  onClick,
  compact,
}: {
  item: Item;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="lift"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 0,
        overflow: 'hidden',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <div
        style={{
          height: compact ? 64 : 88,
          background: TILE_TONE[item.status] ?? TILE_TONE.fresh,
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
        }}
      >
        <Illo name={item.illo} size={compact ? 44 : 60} />
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <ExpiryBadge status={item.status} expires={item.expires} size="sm" />
        </div>
      </div>
      <div style={{ padding: compact ? '10px 12px' : '12px 14px' }}>
        <div
          style={{
            fontSize: compact ? 13 : 14,
            fontWeight: 600,
            color: 'var(--ink)',
            lineHeight: 1.2,
            marginBottom: 3,
          }}
        >
          {item.name}
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--ink-muted)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className="tnum">{item.qty}</span>
          <span>· {item.loc}</span>
        </div>
      </div>
    </button>
  );
}

// ─── StatStrip ──────────────────────────────────────────────────────────────

const STAT_FG: Record<string, string> = {
  green: 'var(--green)',
  tomato: 'var(--tomato)',
  amber: 'var(--amber)',
  ink: 'var(--ink-muted)',
};
const STAT_BG: Record<string, string> = {
  green: 'var(--green-tint)',
  tomato: 'var(--tomato-soft)',
  amber: 'var(--amber-soft)',
  ink: 'var(--bg-tint)',
};

function StatStrip({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: string;
  tone: 'green' | 'tomato' | 'amber' | 'ink';
}) {
  return (
    <Card pad={18}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: STAT_BG[tone],
            color: STAT_FG[tone],
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Icon name={icon} size={16} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-muted)',
              fontWeight: 600,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
          <div
            className="serif tnum"
            style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1.1 }}
          >
            {value}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </Card>
  );
}

// ═════════════ INVENTORY VIEW (grid / shelf / table) ═════════════════════════

const CAT_CHIPS = [
  'All',
  'Vegetables',
  'Dairy',
  'Meat',
  'Grains',
  'Frozen',
  'Canned',
  'Sauces',
  'Oils',
  'Fruits',
  'Leftovers',
];
const LOC_TABS: TabDef[] = [
  { label: 'All', value: 'all' },
  { label: 'Fridge', value: 'Fridge' },
  { label: 'Freezer', value: 'Freezer' },
  { label: 'Pantry', value: 'Pantry' },
  { label: 'Counter', value: 'Counter' },
];
const VIEW_OPTS = [
  { label: 'Grid', value: 'grid', icon: 'grid' },
  { label: 'Shelf', value: 'shelf', icon: 'fridge' },
  { label: 'Table', value: 'table', icon: 'list' },
];

const selStyle: CSSProperties = {
  height: 30,
  padding: '0 8px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  background: 'var(--paper)',
  fontSize: 12.5,
  color: 'var(--ink-2)',
  fontFamily: 'inherit',
};

function InventoryView({
  onOpenItem,
  onAddItem,
  search = '',
}: {
  onOpenItem: (id: string) => void;
  onAddItem: () => void;
  search?: string;
}) {
  const [loc, setLoc] = useState('all');
  const [cat, setCat] = useState('All');
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('expiry');

  const items = useMemo(() => {
    let r: Item[] = mock.items;
    if (loc !== 'all') r = r.filter((i) => i.loc === loc);
    if (cat !== 'All') r = r.filter((i) => i.cat === cat);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter((i) => i.name.toLowerCase().includes(q));
    }
    r = [...r];
    if (sort === 'expiry') r.sort((a, b) => a.expDays - b.expDays);
    if (sort === 'name') r.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'cat') r.sort((a, b) => a.cat.localeCompare(b.cat));
    return r;
  }, [loc, cat, sort, search]);

  const counts = LOC_TABS.reduce<Record<string, number>>((a, l) => {
    a[l.value] =
      l.value === 'all' ? mock.items.length : mock.items.filter((i) => i.loc === l.value).length;
    return a;
  }, {});

  return (
    <>
      <Card
        pad={14}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <Tabs
          tabs={LOC_TABS.map((t) => ({ ...t, count: counts[t.value] }))}
          value={loc}
          onChange={setLoc}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {CAT_CHIPS.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginRight: 2 }}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} style={selStyle}>
            <option value="expiry">Soonest expiry</option>
            <option value="name">Name A→Z</option>
            <option value="cat">Category</option>
          </select>
          <div
            style={{
              display: 'inline-flex',
              gap: 2,
              background: 'var(--bg-tint)',
              padding: 3,
              borderRadius: 9,
              border: '1px solid var(--line)',
            }}
          >
            {VIEW_OPTS.map((v) => (
              <button
                key={v.value}
                onClick={() => setView(v.value)}
                aria-label={v.label}
                aria-pressed={view === v.value}
                title={v.label}
                style={{
                  width: 28,
                  height: 26,
                  display: 'grid',
                  placeItems: 'center',
                  background: view === v.value ? 'var(--paper)' : 'transparent',
                  color: view === v.value ? 'var(--ink)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: view === v.value ? 'var(--sh-1)' : 'none',
                }}
              >
                <Icon name={v.icon} size={14} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {view === 'grid' && <GridView items={items} onOpenItem={onOpenItem} onAddItem={onAddItem} />}
      {view === 'shelf' && <ShelfView items={mock.items} onOpenItem={onOpenItem} />}
      {view === 'table' && <TableView items={items} onOpenItem={onOpenItem} />}
    </>
  );
}

function GridView({
  items,
  onOpenItem,
  onAddItem,
}: {
  items: Item[];
  onOpenItem: (id: string) => void;
  onAddItem: () => void;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 14,
      }}
    >
      {items.map((it) => (
        <IngredientTile key={it.id} item={it} onClick={() => onOpenItem(it.id)} />
      ))}
      <button
        onClick={() => onAddItem()}
        style={{
          background: 'var(--paper-warm)',
          border: '2px dashed var(--line-strong)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: 196,
          color: 'var(--ink-muted)',
          cursor: 'pointer',
        }}
      >
        <Icon name="plus" size={22} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>Add item</span>
      </button>
    </div>
  );
}

function ShelfView({ items, onOpenItem }: { items: Item[]; onOpenItem: (id: string) => void }) {
  const locs = [
    { name: 'Fridge', illo: 'fridge', count: items.filter((i) => i.loc === 'Fridge').length },
    { name: 'Freezer', illo: 'snowflake', count: items.filter((i) => i.loc === 'Freezer').length },
    { name: 'Pantry', illo: 'pantry', count: items.filter((i) => i.loc === 'Pantry').length },
    { name: 'Counter', illo: 'leaf', count: items.filter((i) => i.loc === 'Counter').length },
  ];
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      {locs.map((loc) => {
        const list = items.filter((i) => i.loc === loc.name);
        if (!list.length) return null;
        return (
          <Card key={loc.name} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: 'var(--bg-tint)',
                  color: 'var(--ink-2)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Icon name={loc.illo} size={16} />
              </div>
              <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>
                {loc.name}
              </h3>
              <Pill tone="neutral" size="sm">
                {loc.count} items
              </Pill>
            </div>
            <div
              style={{
                position: 'relative',
                background: 'var(--paper-warm)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: 14,
                backgroundImage:
                  'linear-gradient(180deg, transparent calc(50% - 1px), var(--line) calc(50% - 1px), var(--line) calc(50%), transparent calc(50%))',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {list.slice(0, Math.ceil(list.length / 2)).map((it) => (
                  <ShelfItem key={it.id} item={it} onClick={() => onOpenItem(it.id)} />
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24 }}>
                {list.slice(Math.ceil(list.length / 2)).map((it) => (
                  <ShelfItem key={it.id} item={it} onClick={() => onOpenItem(it.id)} />
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

const SHELF_DOT: Record<string, string> = {
  today: 'var(--tomato)',
  tomorrow: 'var(--tomato)',
  week: 'var(--amber)',
  fresh: 'var(--green)',
  frozen: 'var(--sky)',
  expired: 'var(--ink-muted)',
};

function ShelfItem({ item, onClick }: { item: Item; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={`${item.name} · ${item.expires}`}
      style={{
        width: 76,
        height: 96,
        padding: 6,
        background: 'var(--paper)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 6,
          height: 6,
          borderRadius: 999,
          background: SHELF_DOT[item.status],
        }}
      />
      <Illo name={item.illo} size={40} />
      <div
        style={{
          fontSize: 10.5,
          color: 'var(--ink-2)',
          fontWeight: 600,
          textAlign: 'center',
          lineHeight: 1.1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
        }}
      >
        {item.name}
      </div>
      <div style={{ fontSize: 9.5, color: 'var(--ink-muted)' }}>{item.qty.split(' ')[0]}</div>
    </button>
  );
}

function TableView({ items, onOpenItem }: { items: Item[]; onOpenItem: (id: string) => void }) {
  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-tint)' }}>
            {['Item', 'Category', 'Quantity', 'Location', 'Expires', 'Owner', ''].map((h, i) => (
              <th
                key={h || `col${i}`}
                style={{
                  padding: '12px 18px',
                  textAlign: 'left',
                  fontSize: 11,
                  color: 'var(--ink-muted)',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  borderBottom: '1px solid var(--line)',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr
              key={it.id}
              onClick={() => onOpenItem(it.id)}
              style={{
                borderBottom: '1px solid var(--line-soft)',
                cursor: 'pointer',
              }}
            >
              <td style={{ padding: '10px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      background: 'var(--bg-tint)',
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Illo name={it.illo} size={22} />
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{it.name}</div>
                </div>
              </td>
              <td style={{ padding: '10px 18px', color: 'var(--ink-muted)' }}>{it.cat}</td>
              <td style={{ padding: '10px 18px', color: 'var(--ink-2)' }} className="tnum">
                {it.qty}
              </td>
              <td style={{ padding: '10px 18px', color: 'var(--ink-muted)' }}>{it.loc}</td>
              <td style={{ padding: '10px 18px' }}>
                <ExpiryBadge status={it.status} expires={it.expires} size="sm" />
              </td>
              <td style={{ padding: '10px 18px' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{it.owner}</span>
              </td>
              <td style={{ padding: '10px 18px', textAlign: 'right' }}>
                <Icon name="chevronRight" size={14} stroke="var(--ink-soft)" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

// ═════════════ USE FIRST (expiry) ════════════════════════════════════════════

function UseFirstView({
  onOpenItem,
  onCookNow,
}: {
  onOpenItem: (id: string) => void;
  onCookNow: (id: string) => void;
}) {
  const today = mock.items.filter((i) => i.status === 'today');
  const tomorrow = mock.items.filter((i) => i.status === 'tomorrow');
  const thisWeek = mock.items.filter((i) => i.status === 'week');
  const wasteCost = (today.length + tomorrow.length) * 2.4;
  const useTogether = mock.recipes.filter((r) => r.expiringUsed.length >= 2);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card
        pad={22}
        style={{
          background: 'linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)',
          borderColor: 'var(--tomato-line)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 24,
            alignItems: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--tomato-ink)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Use first
            </div>
            <h2
              className="serif"
              style={{ margin: '6px 0 4px', fontSize: 26, letterSpacing: -0.4, lineHeight: 1.2 }}
            >
              {today.length + tomorrow.length} items want a job in the next 36 hours.
            </h2>
            <div style={{ fontSize: 13, color: '#7A1E11' }}>
              Cooking tonight saves about ${wasteCost.toFixed(2)}.
            </div>
          </div>
          <ExpStat label="Today" count={today.length} />
          <ExpStat label="Tomorrow" count={tomorrow.length} />
          <ExpStat label="This week" count={thisWeek.length} />
        </div>
        <div style={{ position: 'absolute', right: -10, top: -20, opacity: 0.35 }}>
          <Illo name="spinach" size={130} />
        </div>
      </Card>

      {useTogether.length > 0 && (
        <Card pad={22}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Icon name="sparkles" size={16} stroke="var(--amber)" />
            <span
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Use these together
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {useTogether.map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: 14,
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line)',
                  borderRadius: 14,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    flex: '0 0 auto',
                    background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
                    borderRadius: 12,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Illo name="rice" size={42} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div
                    className="serif"
                    style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.2 }}
                  >
                    {r.name}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 4 }}>
                    Uses {r.expiringUsed.length} expiring · {r.time} min · ${r.cost.toFixed(2)}/srv
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.expiringUsed.map((u) => (
                      <Pill key={u} tone="tomato" size="sm">
                        {u}
                      </Pill>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                    <Button size="sm" variant="primary" onClick={() => onCookNow(r.id)}>
                      Cook now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <ExpirySection title="Today" items={today} onOpenItem={onOpenItem} tone="tomato" />
      <ExpirySection title="Tomorrow" items={tomorrow} onOpenItem={onOpenItem} tone="tomato" />
      <ExpirySection
        title="Within the week"
        items={thisWeek}
        onOpenItem={onOpenItem}
        tone="amber"
      />
    </div>
  );
}

function ExpStat({ label, count }: { label: string; count: number }) {
  return (
    <div>
      <div className="serif tnum" style={{ fontSize: 36, color: 'var(--ink)', lineHeight: 1 }}>
        {count}
      </div>
      <div style={{ fontSize: 11.5, color: '#7A1E11', marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function ExpirySection({
  title,
  items,
  onOpenItem,
  tone,
}: {
  title: string;
  items: Item[];
  onOpenItem: (id: string) => void;
  tone: 'tomato' | 'amber' | 'green';
}) {
  if (!items.length) return null;
  const dot =
    tone === 'tomato' ? 'var(--tomato)' : tone === 'amber' ? 'var(--amber)' : 'var(--green)';
  return (
    <Card pad={22}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: dot }} />
        <span className="serif" style={{ fontSize: 18, color: 'var(--ink)' }}>
          {title}
        </span>
        <Pill tone="neutral" size="sm">
          {items.length}
        </Pill>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 12,
        }}
      >
        {items.map((it) => (
          <IngredientTile key={it.id} item={it} compact onClick={() => onOpenItem(it.id)} />
        ))}
      </div>
    </Card>
  );
}

// ═════════════ LOW STOCK ══════════════════════════════════════════════════════

function LowStockView({
  onNav,
  onToast,
}: {
  onNav: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  return (
    <Card pad={22}>
      <SectionHead
        title="Running low"
        eyebrow="Below threshold"
        action={
          <Button variant="ghost" size="sm" iconRight="cart" onClick={() => onNav('shop')}>
            Add all to list
          </Button>
        }
      />
      <div style={{ display: 'grid', gap: 10 }}>
        {mock.lowStock.map((it) => (
          <div
            key={it.name}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr 180px auto',
              gap: 14,
              alignItems: 'center',
              padding: '14px 16px',
              borderRadius: 12,
              background: 'var(--paper-warm)',
              border: '1px solid var(--line-soft)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: 'var(--paper)',
                borderRadius: 10,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid var(--line-soft)',
              }}
            >
              <Illo name={it.illo} size={32} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{it.name}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>{it.qty}</div>
            </div>
            <div>
              <Progress
                value={it.level}
                tone={it.status === 'low' ? 'tomato' : 'amber'}
                height={6}
              />
              <div
                className="tnum"
                style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 4 }}
              >
                {it.level}%
              </div>
            </div>
            <Button
              size="sm"
              variant="primary"
              icon="plus"
              onClick={() => onToast(`${it.name} added to shopping list`)}
            >
              Add to list
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═════════════ LEFTOVERS ══════════════════════════════════════════════════════

function LeftoversView({
  onCookNow,
  onToast,
}: {
  onCookNow: (id: string) => void;
  onToast: (msg: string) => void;
}) {
  const [items, setItems] = useState<Leftover[]>(mock.leftovers);
  const remove = (id: string, msg: string) => {
    setItems((arr) => arr.filter((x) => x.id !== id));
    onToast(msg);
  };
  const eatToday = items.filter((l) => l.days === 0).length;
  const totalServings = items.reduce((s, l) => s + l.servings, 0);

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <Card
        pad={22}
        style={{
          background: 'var(--orange-tint)',
          borderColor: 'var(--orange-soft)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'var(--on-tint-pad)',
              color: 'var(--orange-deep)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="save" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--orange-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              The leftover shelf
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 22, letterSpacing: -0.3 }}>
              {items.length} portions saved · {totalServings} servings on deck
              {eatToday > 0 && (
                <>
                  {' '}
                  · <span style={{ color: 'var(--tomato)' }}>{eatToday} needs eating today</span>
                </>
              )}
              .
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
              Pilot remembers each one and surfaces remix ideas before it spoils.
            </div>
          </div>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => onToast('Save a leftover from your last cook')}
          >
            Save a leftover
          </Button>
        </div>
        <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.35 }}>
          <Illo name="rice" size={120} />
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 14,
        }}
      >
        {items.map((l) => (
          <LeftoverCard
            key={l.id}
            l={l}
            onCookNow={onCookNow}
            onFinish={() => remove(l.id, `${l.meal} marked finished`)}
            onWaste={() => remove(l.id, `${l.meal} marked wasted — Pilot logged it`)}
            onAddToPlan={() => onToast(`${l.meal} pinned to Plan`)}
          />
        ))}
        <Card
          pad={22}
          style={{
            background: 'var(--paper-warm)',
            border: '2px dashed var(--line-strong)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 320,
            color: 'var(--ink-muted)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => onToast('Save a leftover from your last cook')}
        >
          <Icon name="plus" size={22} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Add today's leftover</div>
          <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--ink-soft)', maxWidth: 220 }}>
            Pilot will pick a safe-by date and remix ideas
          </div>
        </Card>
      </div>
    </div>
  );
}

const LEFTOVER_TONE: Record<string, string> = {
  amber: 'var(--amber)',
  tomato: 'var(--tomato)',
  green: 'var(--green)',
};
const LEFTOVER_BG: Record<string, string> = {
  amber: 'var(--amber-soft)',
  tomato: 'var(--tomato-soft)',
  green: 'var(--green-tint)',
};

function LeftoverCard({
  l,
  onFinish,
  onWaste,
  onAddToPlan,
  onCookNow,
}: {
  l: Leftover;
  onFinish: () => void;
  onWaste: () => void;
  onAddToPlan: () => void;
  onCookNow: (id: string) => void;
}) {
  const eatToday = l.days === 0;
  return (
    <Card pad={0} hover style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '14px 18px',
          background: LEFTOVER_BG[l.tone],
          borderBottom: `1px solid ${LEFTOVER_TONE[l.tone]}33`,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Pill tone={l.tone} size="sm" dot>
          {eatToday ? 'Eat today' : l.days === 1 ? '1 day left' : `${l.days} days left`}
        </Pill>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>Cooked {l.cooked}</span>
      </div>
      <div
        style={{
          padding: '18px 18px 16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'var(--paper-warm)',
              border: '1px solid var(--line-soft)',
              borderRadius: 12,
              display: 'grid',
              placeItems: 'center',
              flex: '0 0 auto',
            }}
          >
            <Illo name={l.illo} size={40} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="serif"
              style={{ fontSize: 20, color: 'var(--ink)', letterSpacing: -0.3, lineHeight: 1.15 }}
            >
              {l.meal}
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 4 }}>
              {l.servings} serving{l.servings > 1 ? 's' : ''} · safe through {l.useBy}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <FieldMini label="Storage" value={l.storage} />
          <FieldMini label="Cooked" value={l.cooked} />
        </div>

        <div
          style={{
            padding: '10px 12px',
            background: 'var(--bg-tint)',
            borderRadius: 10,
            border: '1px solid var(--line-soft)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <Icon name="info" size={14} stroke="var(--ink-muted)" />
          <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--ink)' }}>Reheat:</strong> {l.reheat}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--ink-soft)',
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Pilot's remix ideas
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {l.remix.map((r) => (
              <Pill key={r} tone="neutral" size="sm">
                {r}
              </Pill>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Button size="sm" variant="primary" icon="chef" onClick={() => onCookNow('r1')}>
            Remix into recipe
          </Button>
          <Button size="sm" variant="secondary" icon="check" onClick={onFinish}>
            Finished
          </Button>
          <Button size="sm" variant="ghost" icon="calendar" onClick={onAddToPlan}>
            Pin to plan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon="trash"
            style={{ color: 'var(--tomato)', marginLeft: 'auto' }}
            onClick={onWaste}
          >
            Wasted
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FieldMini({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '8px 10px',
        background: 'var(--paper-warm)',
        border: '1px solid var(--line-soft)',
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: 'var(--ink-soft)',
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 3 }}>
        {value}
      </div>
    </div>
  );
}

// ═════════════ AUTO-RESTOCK ════════════════════════════════════════════════════

function AutoRestockView() {
  const [rules, setRules] = useState<RestockRule[]>(mock.autoRestockRules);
  const toggle = (id: string) =>
    setRules((r) => r.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card
        pad={22}
        style={{
          background: 'linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)',
          borderColor: 'var(--green-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'var(--on-tint-pad)',
              color: 'var(--green-deep)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--green-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Auto-restock
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 22, letterSpacing: -0.3 }}>
              Rules that quietly maintain your kitchen.
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              Pilot adds these items to your grocery list automatically when they hit a threshold.{' '}
              <strong>{rules.filter((r) => r.on).length}</strong> active · 2 will trigger this week.
            </div>
          </div>
          <Button variant="primary" icon="plus">
            New rule
          </Button>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {rules.map((r) => (
          <Card key={r.id} pad={20} style={{ opacity: r.on ? 1 : 0.7 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'var(--bg-tint)',
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid var(--line-soft)',
                }}
              >
                <Illo name={r.illo} size={38} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{r.item}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3 }}>
                  {r.rule}
                </div>
              </div>
              <Switch on={r.on} onClick={() => toggle(r.id)} label={`Auto-restock ${r.item}`} />
            </div>
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'var(--paper-warm)',
                borderRadius: 10,
                border: '1px solid var(--line-soft)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 10,
              }}
            >
              <Field label="Threshold" value={r.threshold} />
              <Field label="Cadence" value={r.freq} />
              <Field label="Next add" value={r.next} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--ink-soft)',
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        className="tnum"
        style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 3 }}
      >
        {value}
      </div>
    </div>
  );
}

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      aria-label={label}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        padding: 2,
        background: on ? 'var(--green)' : 'var(--line-strong)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 200ms',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          background: '#FDFAF3',
          transform: `translateX(${on ? 18 : 0}px)`,
          transition: 'transform 200ms cubic-bezier(.2,.8,.2,1)',
          boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        }}
      />
    </button>
  );
}

// ═════════════ STAPLES BUILDER ══════════════════════════════════════════════════

function StaplesView({ onToast }: { onToast: (msg: string) => void }) {
  const staples = mock.staples;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18 }}>
      <Card pad={22}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Ring value={staples.score} size={140} stroke={14} color="var(--amber)">
            <div style={{ textAlign: 'center' }}>
              <div
                className="serif tnum"
                style={{ fontSize: 36, color: 'var(--ink)', lineHeight: 1 }}
              >
                {staples.score}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--ink-muted)',
                  marginTop: 4,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                OF 100
              </div>
            </div>
          </Ring>
          <div style={{ textAlign: 'center' }}>
            <div className="serif" style={{ fontSize: 19, color: 'var(--ink)' }}>
              Staples score
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: 'var(--ink-muted)',
                marginTop: 4,
                maxWidth: 240,
                lineHeight: 1.5,
              }}
            >
              Add a few essentials and you unlock dozens of simple meals.
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: 'var(--line-soft)', margin: '20px 0' }} />
        <div
          style={{
            fontSize: 11,
            letterSpacing: 0.5,
            color: 'var(--ink-muted)',
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          You already have
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {staples.have.map((s, i) => (
            <Pill key={`${s}-${i}`} tone="green" size="sm">
              {s}
            </Pill>
          ))}
        </div>
      </Card>

      <Card pad={22}>
        <SectionHead
          title="Recommended staples"
          eyebrow="Unlock more meals"
          action={
            <Button
              size="sm"
              variant="primary"
              icon="cart"
              onClick={() => onToast(`${staples.missing.length} staples added to list`)}
            >
              Add all
            </Button>
          }
        />
        <div style={{ display: 'grid', gap: 10 }}>
          {staples.missing.map((s) => (
            <div
              key={s.name}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: 14,
                alignItems: 'center',
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--paper-warm)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'var(--paper)',
                  borderRadius: 9,
                  display: 'grid',
                  placeItems: 'center',
                  border: '1px solid var(--line-soft)',
                }}
              >
                <Illo name={s.illo} size={28} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  Unlocks <strong style={{ color: 'var(--green-deep)' }}>{s.unlocks} meals</strong>
                </div>
              </div>
              <Pill tone="green" size="sm">
                +{s.unlocks}
              </Pill>
              <div className="tnum serif" style={{ fontSize: 16, color: 'var(--ink)' }}>
                ${s.price.toFixed(2)}
              </div>
              <Button
                size="sm"
                variant="secondary"
                icon="plus"
                onClick={() => onToast(`${s.name} added`)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═════════════ KITCHEN MEMORY ══════════════════════════════════════════════════

function KitchenMemoryView() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <Card
        pad={22}
        style={{ background: 'var(--ink)', color: 'var(--paper-warm)', borderColor: 'var(--ink)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 11,
              background: 'rgba(255,255,255,.06)',
              color: 'var(--amber)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'rgba(253,250,243,.6)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Kitchen memory
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 22, letterSpacing: -0.3 }}>
              The patterns Pilot is learning.
            </h2>
            <div style={{ fontSize: 13, color: 'rgba(253,250,243,.65)', marginTop: 4 }}>
              Quiet, personalized cooking intelligence — built from your last 90 days.
            </div>
          </div>
        </div>
      </Card>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {mock.kitchenMemory.map((m) => (
          <Card key={m.id} pad={22}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--bg-tint)',
                  color: 'var(--ink-2)',
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Icon name={m.icon} size={17} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  className="serif"
                  style={{
                    fontSize: 17,
                    color: 'var(--ink)',
                    letterSpacing: -0.2,
                    lineHeight: 1.2,
                  }}
                >
                  {m.title}
                </div>
                <div
                  style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 6, lineHeight: 1.5 }}
                >
                  {m.body}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═════════════ Pantry (root) — hooks live here only ════════════════════════════

const TABS: TabDef[] = [
  { label: 'Inventory', value: 'inventory' },
  { label: 'Use first', value: 'expiry', count: 6 },
  { label: 'Low stock', value: 'lowstock', count: 4 },
  { label: 'Leftovers', value: 'leftovers', count: 3 },
  { label: 'Auto-restock', value: 'restock' },
  { label: 'Staples builder', value: 'staples' },
  { label: 'Kitchen memory', value: 'memory' },
];

export default function Pantry() {
  const navigate = useNavigate();
  const pushToast = useToastStore((s) => s.push);
  const openAddItem = useNavStore((s) => s.openAddItem);
  const openInbox = useNavStore((s) => s.openInbox);
  // Search comes from the shell TopBar via the search store (WS3).
  const search = useSearchStore((s) => s.query);

  const [tab, setTab] = useState('inventory');

  const onNav = (id: string) => navigate('/' + id);
  // Item-detail drawer is an overlay that converts in a later phase; mirror Dashboard's stand-in.
  const onOpenItem = (_id: string) => navigate('/pantry');
  const onCookNow = (_id: string) => navigate('/cook');
  const onToast = (msg: string) => pushToast(msg);

  return (
    <div style={{ padding: '28px 28px 0 28px' }}>
      {/* Stat row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 18,
        }}
      >
        <StatStrip
          label="Total items"
          value={mock.items.length}
          sub="across 4 locations"
          icon="pantry"
          tone="green"
        />
        <StatStrip
          label="Use soon"
          value={mock.items.filter((i) => i.expDays <= 3 && i.status !== 'frozen').length}
          sub="next 3 days"
          icon="alert"
          tone="tomato"
        />
        <StatStrip
          label="Low staples"
          value={4}
          sub="and below threshold"
          icon="info"
          tone="amber"
        />
        <StatStrip
          label="Coverage"
          value="6.5 days"
          sub="meals you can cook"
          icon="leaf"
          tone="green"
        />
      </div>

      {/* Tabs row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 14,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <Tabs tabs={TABS} value={tab} onChange={setTab} />
        {tab === 'inventory' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" variant="ghost" icon="receipt" onClick={openInbox}>
              Scan receipt
            </Button>
            <Button size="sm" variant="primary" icon="plus" onClick={openAddItem}>
              Add item
            </Button>
          </div>
        )}
      </div>

      <div style={{ paddingBottom: 56 }}>
        {tab === 'inventory' && (
          <InventoryView onOpenItem={onOpenItem} onAddItem={openAddItem} search={search} />
        )}
        {tab === 'expiry' && <UseFirstView onOpenItem={onOpenItem} onCookNow={onCookNow} />}
        {tab === 'lowstock' && <LowStockView onNav={onNav} onToast={onToast} />}
        {tab === 'leftovers' && <LeftoversView onCookNow={onCookNow} onToast={onToast} />}
        {tab === 'restock' && <AutoRestockView />}
        {tab === 'staples' && <StaplesView onToast={onToast} />}
        {tab === 'memory' && <KitchenMemoryView />}
      </div>
    </div>
  );
}
