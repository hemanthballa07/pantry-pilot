// src/screens/Cook.tsx — Phase 4 port of recipes.jsx (window.PPRecipes.Cook)
//
// Six tabs: Explore cuisines · Cook what I have · Reels · Craving mode ·
// Recipe unlocks · Notebook. Read-only over @/data/mock (filters/tabs are
// ephemeral UI state — no mock-derived record is mutated, so ADR-010 does not apply).
//
// All window.PP* globals removed: data from @/data/mock; toast via useToastStore,
// inbox via useNavStore. Documented deviations from the legacy screen:
//   1. onOpenRecipe → opens the recipe-detail overlay via useNavStore.openRecipe
//      (legacy app.jsx setRecipeId; rendered by <Overlays/> in RootLayout).
//   2. onCookNow → placeholder toast — the CookNow card-deck overlay
//      (cook-mode.jsx, window.PPCookMode.CookNow) is not yet converted;
//      `window.PPCookNow` is already a no-op in the bridge.
//   3. The Reels tab renders a deferred placeholder — CookReels lives in the
//      un-converted reels.jsx (window.PPReels), which has no route yet.
//   4. `search` is '' (ShellLayout has no TopBar yet, so the search filter is a
//      no-op — matches Pantry/Shop). Wire through once the TopBar converts.
//   5. The legacy toast `{ icon }` option is dropped (store derives glyph from tone).

import { useState, useMemo } from 'react';
import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import { mock } from '@/data/mock';
import { useToastStore, useNavStore, useSearchStore } from '@/stores';
import type { Recipe, Diet, Cuisine } from '@/types';

// Non-reactive store access for event handlers (no subscription needed — the
// screen never renders the toast/inbox itself; their hosts subscribe separately).
const fireToast = (msg: string) => useToastStore.getState().push(msg);
const openInbox = () => useNavStore.getState().openInbox();

// ─── Icon ─────────────────────────────────────────────────────────────────

const ICON_PATHS: Record<string, string> = {
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
  alert:
    'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z',
  timer: 'M12 6a8 8 0 110 16 8 8 0 010-16z M10 2h4 M12 10v4',
  wallet:
    'M2 7a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7zm14 5a1 1 0 110-2 1 1 0 010 2z',
  flame: 'M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5s-2-3-2-3 4 0 6-2z',
  fire: 'M12 2c0 4 5 5 5 11a5 5 0 0 1-10 0c0-1 1-3 2-4-1 4 3 4 3 4-2-3 0-7 0-11z',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  cart: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM16 10a4 4 0 01-8 0',
  plus: 'M12 5v14M5 12h14',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  upload: 'M12 16V4M5 11l7-7 7 7 M3 20h18',
  edit: 'M14 4l6 6L9 21H3v-6z',
  heart: 'M12 21s-7-4.5-9-9c-1.5-3 1-7 5-7 2 0 3 1 4 2 1-1 2-2 4-2 4 0 6.5 4 5 7-2 4.5-9 9-9 9z',
  leaf: 'M17 8C8 10 5.9 16.17 3.82 22 8 22 12 21 14 18c2-3 0-7-3-7s-5 3-3 7',
  save: 'M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8',
  snowflake: 'M12 2v20 M2 12h20 M5 5l14 14 M19 5L5 19',
  // bag → folded two-path (bag body + handle arc) into one stroked `d`
  bag: 'M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M9 7a3 3 0 1 1 6 0',
};

interface IconProps {
  name: string;
  size?: number;
  stroke?: string;
}
function Icon({ name, size = 18, stroke = 'currentColor' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}

// ─── Illo ─────────────────────────────────────────────────────────────────

const ILLO_COLORS: Record<string, string> = {
  rice: '#E8D9A8',
  bread: '#D4A853',
  chicken: '#C9884A',
  carrot: '#E07840',
  beans: '#8B6040',
  frozenveg: '#7ABFA8',
  berries: '#8E4A8E',
  chili: '#C93A3A',
  banana: '#E8C840',
  milk: '#F0EAD6',
  tofu: '#F0EDD8',
  oats: '#C8A878',
  oil: '#C8B860',
  coffee: '#6B4226',
  salt: '#E8E8E0',
  pasta: '#E8CF88',
  cheese: '#E8B840',
  ricebag: '#D4C090',
  peanutbutter: '#C8904A',
  soy: '#8B7340',
  onion: '#C8A8C8',
  garlic: '#E8D8C0',
  tomato: '#C83A3A',
  pepper: '#3A9848',
  spinach: '#3B6E3D',
  egg: '#C99325',
  yogurt: '#E8DCC8',
  apple: '#C73E2E',
  // recipe / cuisine illos specific to this screen
  noodles: '#E0C070',
  tortilla: '#E8C88A',
  paneer: '#F0EAD6',
  lentils: '#C97A3A',
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

// ─── Pill ─────────────────────────────────────────────────────────────────

type PillTone = 'green' | 'orange' | 'tomato' | 'amber' | 'sky' | 'ink' | 'neutral' | 'ghost';

interface PillProps {
  tone?: PillTone;
  size?: 'sm' | 'md';
  children?: ReactNode;
  dot?: boolean;
  icon?: string;
}

const PILL_STYLES: Record<PillTone, { bg: string; color: string; border: string }> = {
  green: {
    bg: 'var(--green-tint, #eef7ee)',
    color: 'var(--green-deep, #2a5a2a)',
    border: 'var(--green-soft, rgba(59,110,61,.2))',
  },
  orange: {
    bg: 'var(--orange-tint, #fff3e8)',
    color: 'var(--orange-deep, #b05a10)',
    border: 'rgba(176,90,16,.2)',
  },
  tomato: {
    bg: 'var(--tomato-soft, #fff0ee)',
    color: 'var(--tomato-ink, #b02020)',
    border: 'var(--tomato-line, rgba(176,32,32,.2))',
  },
  amber: {
    bg: 'var(--amber-soft, #fff8e8)',
    color: 'var(--amber-ink, #9a6a00)',
    border: 'var(--amber-line, rgba(154,106,0,.2))',
  },
  sky: {
    bg: 'var(--sky-soft, #d9e4ec)',
    color: 'var(--sky-ink, #1f3b52)',
    border: 'var(--sky, #3a5f7a)',
  },
  ink: {
    bg: 'var(--ink, #1a1814)',
    color: 'var(--paper-warm, #fdfaf3)',
    border: 'var(--ink, #1a1814)',
  },
  neutral: { bg: 'rgba(0,0,0,.05)', color: 'var(--ink-muted, #8a8374)', border: 'transparent' },
  ghost: { bg: 'rgba(0,0,0,.04)', color: 'var(--ink-muted, #8a8374)', border: 'transparent' },
};

function Pill({ tone = 'neutral', size = 'sm', children, dot, icon }: PillProps) {
  const s = PILL_STYLES[tone];
  const pad = size === 'md' ? '4px 10px' : '3px 8px';
  const fs = size === 'md' ? 12 : 11;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: pad,
        fontSize: fs,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            background: 'currentColor',
            flexShrink: 0,
          }}
        />
      )}
      {icon && <Icon name={icon} size={11} />}
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'soft' | 'orange';
  size?: 'sm';
  icon?: string;
  iconRight?: string;
  full?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  style?: CSSProperties;
  children?: ReactNode;
}

const BTN_STYLES: Record<string, { bg: string; fg: string; bd: string }> = {
  primary: { bg: 'var(--ink, #1a1814)', fg: 'var(--paper-warm, #fdfaf3)', bd: 'none' },
  secondary: {
    bg: 'var(--paper-warm, #fdfaf3)',
    fg: 'var(--ink, #1a1814)',
    bd: '1px solid var(--line, rgba(0,0,0,.12))',
  },
  ghost: {
    bg: 'transparent',
    fg: 'var(--ink-2, #4a4535)',
    bd: '1px solid var(--line, rgba(0,0,0,.12))',
  },
  soft: {
    bg: 'var(--paper-warm, #fdfaf3)',
    fg: 'var(--ink-2, #4a4535)',
    bd: '1px solid var(--line-soft, rgba(0,0,0,.06))',
  },
  orange: { bg: 'var(--orange, #D9722B)', fg: '#FDFAF3', bd: 'none' },
};

function Button({
  variant = 'primary',
  size,
  icon,
  iconRight,
  full,
  onClick,
  style,
  children,
}: ButtonProps) {
  const s = BTN_STYLES[variant] ?? BTN_STYLES.primary;
  const pad = size === 'sm' ? '6px 12px' : '10px 18px';
  const fs = size === 'sm' ? 12 : 14;
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: pad,
        fontSize: fs,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        border: s.bd,
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 12 : 14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 12 : 14} />}
    </button>
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
        flexWrap: 'wrap',
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

// ─── recipe / ingredient → illustration heuristics ─────────────────────────

function recipeIllo(r: Recipe): string {
  const n = r.name;
  if (/noodle|chow mein|hakka/i.test(n)) return 'noodles';
  if (/taco|quesadilla|burrito|huevos|ranchero/i.test(n)) return 'tortilla';
  if (/paneer/i.test(n)) return 'paneer';
  if (/dal|lentil/i.test(n)) return 'lentils';
  if (/kung pao|tofu/i.test(n)) return 'tofu';
  if (/chana|chickpea|bean/i.test(n)) return 'beans';
  if (/curry|egg|omelette/i.test(n)) return 'egg';
  if (/rice/i.test(n)) return 'rice';
  if (/pasta/i.test(n)) return 'pasta';
  if (/yogurt|parfait/i.test(n)) return 'yogurt';
  if (/oat|pancake/i.test(n)) return 'oats';
  if (/wrap|sandwich/i.test(n)) return 'bread';
  if (/chicken/i.test(n)) return 'chicken';
  return 'rice';
}

const INGR_ILLO: Record<string, string> = {
  'Cooked Rice': 'rice',
  Eggs: 'egg',
  'Bell Peppers': 'pepper',
  Carrots: 'carrot',
  Garlic: 'garlic',
  'Schezwan Sauce': 'chili',
  Spaghetti: 'pasta',
  Spinach: 'spinach',
  Chickpeas: 'beans',
  'Jasmine Rice': 'ricebag',
  Onions: 'onion',
  'Olive Oil': 'oil',
  'Chicken Breast': 'chicken',
  'Greek Yogurt': 'yogurt',
  Sriracha: 'chili',
  Bananas: 'banana',
  'Whole Milk': 'milk',
  'Rolled Oats': 'oats',
  'Frozen Berries': 'berries',
  'Cheddar Cheese': 'cheese',
  'Wheat Bread': 'bread',
  'Firm Tofu': 'tofu',
  'Soy Sauce': 'soy',
  'Black Beans': 'beans',
  'Roma Tomatoes': 'tomato',
};
const ingrIllo = (name: string): string => INGR_ILLO[name] ?? 'egg';

// ─── Featured (large) recipe ────────────────────────────────────────────────

function FeaturedRecipe({
  recipe,
  onClick,
  onCook,
}: {
  recipe: Recipe;
  onClick: () => void;
  onCook: () => void;
}) {
  return (
    <Card pad={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: 260 }}>
        <div
          style={{
            background: `linear-gradient(135deg, ${recipe.tone}E6 0%, ${recipe.tone}99 100%)`,
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0.18,
              backgroundImage: 'radial-gradient(circle at 30% 30%, #FFF 0%, transparent 55%)',
            }}
          />
          <Illo name={recipeIllo(recipe)} size={130} />
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <Pill tone="ink" size="md">
              {recipe.match}% match
            </Pill>
            {recipe.expiringUsed.length > 0 && (
              <Pill tone="tomato" size="md" icon="alert">
                Uses {recipe.expiringUsed.length} expiring
              </Pill>
            )}
          </div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', gap: 6 }}>
            {recipe.uses.slice(0, 5).map((u) => (
              <div
                key={u}
                title={u}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,.85)',
                  border: '2px solid rgba(255,255,255,.95)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Illo name={ingrIllo(u)} size={22} />
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--green-deep)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Top pick · cook with what you have
          </div>
          <h2
            className="serif"
            style={{
              margin: 0,
              fontSize: 32,
              letterSpacing: -0.5,
              lineHeight: 1.1,
              textWrap: 'balance',
            }}
          >
            {recipe.name}
          </h2>
          <p
            style={{
              marginTop: 10,
              marginBottom: 16,
              fontSize: 14,
              color: 'var(--ink-muted)',
              lineHeight: 1.55,
            }}
          >
            {recipe.desc}
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, auto)',
              gap: 18,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid var(--line-soft)',
            }}
          >
            {[
              { l: 'Time', v: `${recipe.time} min` },
              { l: 'Cost', v: `$${recipe.cost.toFixed(2)}/serving` },
              { l: 'Calories', v: `${recipe.cals}` },
              { l: 'Protein', v: `${recipe.protein}g` },
            ].map((s) => (
              <div key={s.l}>
                <div
                  style={{
                    fontSize: 10.5,
                    color: 'var(--ink-soft)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.l}
                </div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 18, color: 'var(--ink)', marginTop: 3 }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>
          {recipe.missing.length > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginBottom: 14 }}>
              Missing:{' '}
              <span style={{ color: 'var(--tomato)', fontWeight: 600 }}>
                {recipe.missing.join(', ')}
              </span>
            </div>
          )}
          <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
            <Button
              variant="primary"
              iconRight="arrowRight"
              onClick={(e) => {
                e.stopPropagation();
                onCook();
              }}
            >
              Start cooking
            </Button>
            <Button
              variant="secondary"
              icon="bookmark"
              onClick={(e) => {
                e.stopPropagation();
                fireToast('Recipe saved');
              }}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              icon="cart"
              onClick={(e) => {
                e.stopPropagation();
                fireToast('Missing ingredients added to grocery list');
              }}
            >
              Add missing
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Grid recipe card ────────────────────────────────────────────────────────

function RecipeCard({
  recipe,
  onClick,
  onCook,
}: {
  recipe: Recipe;
  onClick: () => void;
  onCook: () => void;
}) {
  return (
    <Card
      pad={0}
      hover
      style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      onClick={onClick}
    >
      <div
        style={{
          height: 140,
          position: 'relative',
          background: `linear-gradient(135deg, ${recipe.tone}E6 0%, ${recipe.tone}AA 100%)`,
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.15,
            backgroundImage: 'radial-gradient(circle at 30% 30%, #FFF 0%, transparent 60%)',
          }}
        />
        <Illo name={recipeIllo(recipe)} size={66} />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <Pill tone="ink" size="sm">
            {recipe.match}%
          </Pill>
          {recipe.expiringUsed.length > 0 && (
            <Pill tone="tomato" size="sm" icon="alert">
              {recipe.expiringUsed.length}
            </Pill>
          )}
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fireToast('Saved to your recipes');
            }}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,.85)',
              color: 'var(--ink-2)',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="bookmark" size={13} />
          </button>
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
          <Pill tone="ink" size="sm" icon="timer">
            {recipe.time}m
          </Pill>
        </div>
      </div>
      <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          className="serif"
          style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: -0.2 }}
        >
          {recipe.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--ink-muted)',
            marginTop: 6,
            marginBottom: 12,
            display: 'flex',
            gap: 10,
          }}
        >
          <span>${recipe.cost.toFixed(2)}/srv</span>
          <span>·</span>
          <span>{recipe.cals} cal</span>
          <span>·</span>
          <span>{recipe.protein}g protein</span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 14 }}>
          {recipe.uses.slice(0, 4).map((u) => (
            <span
              key={u}
              style={{
                fontSize: 10.5,
                color: 'var(--ink-muted)',
                background: 'var(--bg-tint)',
                padding: '2px 7px',
                borderRadius: 999,
              }}
            >
              {u}
            </span>
          ))}
          {recipe.missing.length > 0 && (
            <span
              style={{
                fontSize: 10.5,
                color: 'var(--tomato)',
                background: 'var(--tomato-soft)',
                padding: '2px 7px',
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              +{recipe.missing.length} missing
            </span>
          )}
        </div>
        <div style={{ marginTop: 'auto', display: 'flex', gap: 6 }}>
          <Button
            size="sm"
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onCook();
            }}
          >
            Cook now
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
}

// ═════════════ DISCOVER SHELF (Cook what I have) ════════════════════════════

type Shelf = 'have' | 'expiring' | 'fast' | 'budget' | 'protein' | 'breakfast';
type DietFilter = 'all' | Diet;
type TimeFilter = 'any' | '20' | '30';

const SHELF_TABS: TabDef[] = [
  { label: 'Cook with what you have', value: 'have' },
  { label: 'Use expiring', value: 'expiring' },
  { label: 'Under 20 min', value: 'fast' },
  { label: 'Budget meals', value: 'budget' },
  { label: 'High protein', value: 'protein' },
  { label: 'Breakfast', value: 'breakfast' },
];

const selStyle: CSSProperties = {
  height: 32,
  padding: '0 10px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  background: 'var(--paper)',
  fontSize: 12.5,
  color: 'var(--ink-2)',
  fontFamily: 'inherit',
};

function Recipes({
  onOpenRecipe,
  onCookNow,
  search,
}: {
  onOpenRecipe: (id: string) => void;
  onCookNow: (id: string) => void;
  search: string;
}) {
  const [shelf, setShelf] = useState<Shelf>('have');
  const [diet, setDiet] = useState<DietFilter>('all');
  const [time, setTime] = useState<TimeFilter>('any');

  const recipes = useMemo(() => {
    let r = mock.recipes as readonly Recipe[];
    if (shelf === 'have') r = r.filter((x) => x.missing.length <= 1);
    if (shelf === 'expiring') r = r.filter((x) => x.expiringUsed.length > 0);
    if (shelf === 'fast') r = r.filter((x) => x.time <= 20);
    if (shelf === 'budget') r = r.filter((x) => x.cost <= 1.8);
    if (shelf === 'protein') r = r.filter((x) => x.protein >= 18);
    if (shelf === 'breakfast') r = r.filter((x) => x.cuisine === 'Breakfast');
    if (diet !== 'all') r = r.filter((x) => x.diet.includes(diet));
    if (time !== 'any') {
      if (time === '20') r = r.filter((x) => x.time <= 20);
      if (time === '30') r = r.filter((x) => x.time <= 30);
    }
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) => x.name.toLowerCase().includes(q) || x.uses.some((u) => u.toLowerCase().includes(q)),
      );
    }
    return [...r].sort((a, b) => b.match - a.match);
  }, [shelf, diet, time, search]);

  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      {/* Hero strip — quick action chips */}
      <Card
        pad={20}
        style={{
          background: 'linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)',
          borderColor: 'var(--green-soft)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--green-deep)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              What can I cook?
            </div>
            <h2
              className="serif"
              style={{
                margin: '8px 0 6px',
                fontSize: 28,
                letterSpacing: -0.4,
                maxWidth: 580,
                lineHeight: 1.15,
                textWrap: 'balance',
              }}
            >
              You have everything for{' '}
              <em style={{ color: 'var(--green-deep)', fontStyle: 'italic' }}>5 meals</em> right
              now.
            </h2>
            <p style={{ margin: 0, color: 'var(--ink-muted)', fontSize: 13.5 }}>
              Ranked by ingredient match, freshness, and budget.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(
              [
                { l: 'Use my expiring', i: 'alert', t: 'tomato', s: 'expiring' },
                { l: 'Under 20 minutes', i: 'timer', t: 'neutral', s: 'fast' },
                { l: 'Under $2 / serving', i: 'wallet', t: 'neutral', s: 'budget' },
                { l: 'High protein', i: 'flame', t: 'neutral', s: 'protein' },
              ] as const
            ).map((q) => (
              <button
                key={q.l}
                onClick={() => setShelf(q.s)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  height: 38,
                  borderRadius: 10,
                  background: q.t === 'tomato' ? 'var(--tomato)' : 'var(--paper)',
                  color: q.t === 'tomato' ? '#FDFAF3' : 'var(--ink-2)',
                  border: `1px solid ${q.t === 'tomato' ? 'var(--tomato)' : 'var(--line)'}`,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Icon name={q.i} size={14} /> {q.l}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', right: -10, bottom: -25, opacity: 0.35 }}>
          <Illo name="pasta" size={140} />
        </div>
      </Card>

      {/* Filter row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <Tabs tabs={SHELF_TABS} value={shelf} onChange={(v) => setShelf(v as Shelf)} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>Diet</span>
          <select
            value={diet}
            onChange={(e) => setDiet(e.target.value as DietFilter)}
            style={selStyle}
          >
            <option value="all">Any</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Vegan">Vegan</option>
            <option value="High-protein">High-protein</option>
          </select>
          <span style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginLeft: 6 }}>Time</span>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as TimeFilter)}
            style={selStyle}
          >
            <option value="any">Any time</option>
            <option value="20">≤ 20 min</option>
            <option value="30">≤ 30 min</option>
          </select>
        </div>
      </div>

      {/* Featured + grid */}
      {recipes[0] && (
        <FeaturedRecipe
          recipe={recipes[0]}
          onClick={() => onOpenRecipe(recipes[0].id)}
          onCook={() => onCookNow(recipes[0].id)}
        />
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {recipes.slice(1).map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onClick={() => onOpenRecipe(r.id)}
            onCook={() => onCookNow(r.id)}
          />
        ))}
      </div>

      {recipes.length === 0 && (
        <Card pad={48} style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ marginBottom: 12, opacity: 0.6 }}>
            <Illo name="bread" size={60} />
          </div>
          <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 4 }}>
            Nothing in that lane
          </div>
          <div style={{ fontSize: 13 }}>Try a different shelf or clear filters.</div>
        </Card>
      )}
    </div>
  );
}

// ═════════════ EXPLORE CUISINES ═════════════════════════════════════════════

const CUISINE_ORDER: Cuisine[] = [
  'Indian',
  'Chinese',
  'Mexican',
  'Italian',
  'Indo-Chinese',
  'Mediterranean',
  'Asian',
  'American',
  'Breakfast',
];
const CUISINE_META: Record<string, { illo: string; tone: string; blurb: string }> = {
  Indian: {
    illo: 'chili',
    tone: '#C85A2B',
    blurb: 'Bold spices, slow-built gravies, deep comfort.',
  },
  Chinese: {
    illo: 'noodles',
    tone: '#C73E2E',
    blurb: 'High-heat wok cooking, glossy sauces, fast.',
  },
  Mexican: {
    illo: 'tortilla',
    tone: '#B85C1F',
    blurb: 'Smoky, bright and fresh — tacos to bowls.',
  },
  Italian: { illo: 'pasta', tone: '#3B6E3D', blurb: 'Few ingredients, done well. Pure comfort.' },
  'Indo-Chinese': {
    illo: 'rice',
    tone: '#D9722B',
    blurb: 'Street-style fusion — fiery and savoury.',
  },
  Mediterranean: { illo: 'beans', tone: '#C99325', blurb: 'Lemon, olive oil, beans and grains.' },
  Asian: { illo: 'tofu', tone: '#3B6E3D', blurb: 'Clean, balanced stir-fries and bowls.' },
  American: { illo: 'bread', tone: '#C73E2E', blurb: 'Fast, hearty, hand-held favourites.' },
  Breakfast: { illo: 'egg', tone: '#6E3A4F', blurb: 'Quick wins to start the day right.' },
};

function CuisineExplorer({
  onOpenRecipe,
  onCookNow,
  search,
}: {
  onOpenRecipe: (id: string) => void;
  onCookNow: (id: string) => void;
  search: string;
}) {
  const [active, setActive] = useState<'all' | Cuisine>('all');

  const cuisines = useMemo(() => {
    const present = new Set<Cuisine>(mock.recipes.map((r) => r.cuisine));
    return CUISINE_ORDER.filter((c) => present.has(c));
  }, []);

  const filtered = useMemo(() => {
    let r = mock.recipes as readonly Recipe[];
    if (active !== 'all') r = r.filter((x) => x.cuisine === active);
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.cuisine.toLowerCase().includes(q) ||
          x.uses.some((u) => u.toLowerCase().includes(q)),
      );
    }
    return r;
  }, [active, search]);

  const grouped = useMemo(() => {
    const order: Cuisine[] = active === 'all' ? cuisines : [active];
    return order
      .map((c) => ({
        cuisine: c,
        items: filtered.filter((r) => r.cuisine === c).sort((a, b) => b.match - a.match),
      }))
      .filter((g) => g.items.length > 0);
  }, [active, filtered, cuisines]);

  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 20 }}>
      {/* Ask hero */}
      <Card
        pad={28}
        style={{
          background: 'linear-gradient(150deg, var(--paper-warm) 0%, var(--amber-soft) 100%)',
          borderColor: 'var(--amber-line)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--amber-ink)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Explore the world
          </div>
          <h2
            className="serif"
            style={{
              margin: '8px 0 8px',
              fontSize: 34,
              letterSpacing: -0.6,
              lineHeight: 1.08,
              textWrap: 'balance',
              color: 'var(--ink)',
            }}
          >
            What would you like to{' '}
            <em style={{ color: 'var(--orange)', fontStyle: 'italic' }}>try tonight?</em>
          </h2>
          <p style={{ margin: 0, color: 'var(--ink-2)', fontSize: 14.5, lineHeight: 1.55 }}>
            Pick a cuisine and Pilot scales the recipe to your servings, tunes the heat, and walks
            you through it step by step. Tap any dish to start cooking.
          </p>
        </div>
        <div
          style={{
            position: 'absolute',
            right: -6,
            bottom: -22,
            opacity: 0.4,
            display: 'flex',
            gap: 4,
          }}
        >
          <Illo name="chili" size={92} />
          <Illo name="noodles" size={108} />
          <Illo name="tortilla" size={92} />
        </div>
      </Card>

      {/* Cuisine chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CuisineChip
          label="All"
          illo="rice"
          active={active === 'all'}
          onClick={() => setActive('all')}
        />
        {cuisines.map((c) => (
          <CuisineChip
            key={c}
            label={c}
            illo={CUISINE_META[c].illo}
            active={active === c}
            onClick={() => setActive(c)}
          />
        ))}
      </div>

      {/* Grouped recipe sections */}
      {grouped.map((g) => {
        const meta = CUISINE_META[g.cuisine] ?? { illo: 'rice', tone: 'var(--green)', blurb: '' };
        return (
          <div key={g.cuisine} style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flex: '0 0 auto',
                  background: `${meta.tone}1F`,
                  border: `1px solid ${meta.tone}40`,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Illo name={meta.illo} size={28} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  className="serif"
                  style={{ margin: 0, fontSize: 22, letterSpacing: -0.3, color: 'var(--ink)' }}
                >
                  {g.cuisine}
                </h3>
                <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  {meta.blurb}
                </div>
              </div>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--ink-soft)',
                  fontWeight: 600,
                  flex: '0 0 auto',
                }}
              >
                {g.items.length} {g.items.length === 1 ? 'dish' : 'dishes'}
              </span>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {g.items.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onClick={() => onOpenRecipe(r.id)}
                  onCook={() => onCookNow(r.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {grouped.length === 0 && (
        <Card pad={48} style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
          <div style={{ marginBottom: 12, opacity: 0.6 }}>
            <Illo name="tortilla" size={60} />
          </div>
          <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 4 }}>
            No dishes match that search
          </div>
          <div style={{ fontSize: 13 }}>Try another cuisine or clear the search.</div>
        </Card>
      )}
    </div>
  );
}

function CuisineChip({
  label,
  illo,
  active,
  onClick,
}: {
  label: string;
  illo: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 16px 8px 10px',
        height: 44,
        borderRadius: 999,
        background: active ? 'var(--ink)' : 'var(--paper)',
        color: active ? 'var(--paper-warm)' : 'var(--ink-2)',
        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
        fontSize: 13.5,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 180ms ease',
        fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          flex: '0 0 auto',
          background: active ? 'rgba(255,255,255,.12)' : 'var(--bg-tint)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Illo name={illo} size={20} />
      </span>
      {label}
    </button>
  );
}

// ═════════════ CRAVING MODE ═════════════════════════════════════════════════

function CravingMode({
  onOpenRecipe,
  onCookNow,
}: {
  onOpenRecipe: (id: string) => void;
  onCookNow: (id: string) => void;
}) {
  const [active, setActive] = useState('spicy');
  const craving = mock.cravings.find((c) => c.id === active);
  // mock.recipes is a tuple of literal objects (satisfies PPData), so find() yields a
  // literal-union element; narrow to NonNullable<typeof r> (assignable to Recipe), not Recipe.
  const recipes = (craving?.recipes ?? [])
    .map((id) => mock.recipes.find((r) => r.id === id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={26}
        style={{
          background: 'linear-gradient(165deg, var(--orange-tint) 0%, #F2C99C 100%)',
          borderColor: 'var(--orange-soft)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--orange-deep)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Craving mode
          </div>
          <h2
            className="serif"
            style={{ margin: '6px 0 6px', fontSize: 30, letterSpacing: -0.5, lineHeight: 1.1 }}
          >
            What do you <em style={{ color: 'var(--tomato)', fontStyle: 'italic' }}>actually</em>{' '}
            feel like?
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              color: 'var(--ink-2)',
              maxWidth: 520,
              lineHeight: 1.5,
            }}
          >
            Skip the ingredient hunt. Tell Pilot the mood, get meals that match — filtered by what's
            in your pantry.
          </p>
        </div>
        <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.4 }}>
          <Illo name="chili" size={140} />
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {mock.cravings.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              height: 42,
              borderRadius: 999,
              background: active === c.id ? 'var(--ink)' : 'var(--paper)',
              color: active === c.id ? 'var(--paper-warm)' : 'var(--ink-2)',
              border: `1px solid ${active === c.id ? 'var(--ink)' : 'var(--line)'}`,
              fontSize: 13.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
          >
            <Icon name={c.icon} size={14} />
            {c.label}
          </button>
        ))}
      </div>

      {recipes[0] && (
        <FeaturedRecipe
          recipe={recipes[0]}
          onClick={() => onOpenRecipe(recipes[0].id)}
          onCook={() => onCookNow(recipes[0].id)}
        />
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {recipes.slice(1).map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            onClick={() => onOpenRecipe(r.id)}
            onCook={() => onCookNow(r.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ═════════════ RECIPE UNLOCKS ═══════════════════════════════════════════════

function RecipeUnlocks() {
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <Card
        pad={22}
        style={{
          background: 'linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)',
          borderColor: 'var(--green-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
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
              Recipe unlocks
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 22, letterSpacing: -0.3 }}>
              Buy one thing → unlock {mock.unlocks.reduce((s, u) => s + u.unlocks, 0)} new meals.
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4 }}>
              Pantry already covers a lot. Pilot picked the single highest-leverage items.
            </div>
          </div>
        </div>
      </Card>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 16,
        }}
      >
        {mock.unlocks.map((u) => (
          <Card key={u.id} pad={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div
              style={{
                padding: '20px 22px',
                background: `linear-gradient(135deg, ${u.tone}22 0%, transparent 100%)`,
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                borderBottom: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: 'var(--paper)',
                  borderRadius: 12,
                  border: '1px solid var(--line-soft)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Illo name={u.illo} size={42} />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-muted)',
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  }}
                >
                  Buy
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 20, color: 'var(--ink)', marginTop: 2, letterSpacing: -0.2 }}
                >
                  {u.buy}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginTop: 6,
                    fontSize: 12,
                    color: 'var(--ink-muted)',
                  }}
                >
                  <span className="tnum">${u.price.toFixed(2)}</span>
                  <span>·</span>
                  <span style={{ color: u.tone, fontWeight: 700 }}>+{u.unlocks} meals</span>
                </div>
              </div>
              <Pill tone="green" size="md" icon="arrowRight">
                Unlock
              </Pill>
            </div>
            <div style={{ padding: '16px 22px' }}>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--ink-muted)',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}
              >
                Unlocks
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {u.meals.map((m) => (
                  <span
                    key={m}
                    style={{
                      fontSize: 11.5,
                      padding: '5px 10px',
                      background: 'var(--bg-tint)',
                      borderRadius: 999,
                      color: 'var(--ink-2)',
                      fontWeight: 500,
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                <Button
                  size="sm"
                  variant="primary"
                  icon="cart"
                  full
                  onClick={() => fireToast(`${u.buy} added to shopping list`)}
                >
                  Add to list
                </Button>
                <Button size="sm" variant="secondary" icon="bookmark">
                  Save
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═════════════ RECIPE NOTEBOOK ══════════════════════════════════════════════

function Notebook({ onCookNow }: { onCookNow: (id: string) => void }) {
  return (
    <div style={{ padding: '0 28px 28px', display: 'grid', gap: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
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
            Recipe notebook
          </div>
          <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 24, letterSpacing: -0.3 }}>
            The recipes that are{' '}
            <em style={{ color: 'var(--green-deep)', fontStyle: 'italic' }}>actually yours</em>.
          </h2>
          <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
            Family recipes, TikTok finds, your own modifications. Living document.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" icon="upload" onClick={openInbox}>
            Import URL
          </Button>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => fireToast('New recipe — start writing')}
          >
            New recipe
          </Button>
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}
      >
        {mock.notebook.map((n) => (
          <Card key={n.id} pad={0} hover style={{ overflow: 'hidden', cursor: 'pointer' }}>
            <div
              style={{
                height: 120,
                position: 'relative',
                background: `linear-gradient(135deg, ${n.tone}E6 0%, ${n.tone}99 100%)`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Illo name={n.ill} size={56} />
              <div style={{ position: 'absolute', top: 10, left: 10 }}>
                <Pill tone="ink" size="sm">
                  Personal
                </Pill>
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <div
                className="serif"
                style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.2, letterSpacing: -0.2 }}
              >
                {n.name}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 6 }}>
                Last cooked {n.last}{' '}
                {n.rating ? `· ${'★'.repeat(n.rating)}${'☆'.repeat(5 - n.rating)}` : ''}
              </div>
              {n.notes && (
                <div
                  style={{
                    marginTop: 10,
                    padding: '8px 10px',
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--ink-muted)',
                    fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}
                >
                  "{n.notes}"
                </div>
              )}
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                <Button size="sm" variant="primary" onClick={() => onCookNow('r1')}>
                  Cook
                </Button>
                <Button size="sm" variant="ghost" icon="edit">
                  Edit
                </Button>
              </div>
            </div>
          </Card>
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
            minHeight: 280,
            color: 'var(--ink-muted)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => fireToast('Start writing a new recipe')}
        >
          <Icon name="plus" size={22} />
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Add a recipe</div>
          <div style={{ fontSize: 11.5, marginTop: 4, color: 'var(--ink-soft)' }}>
            Paste a link, type from scratch, or import from Kitchen Inbox
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═════════════ REELS (deferred — reels.jsx not yet converted) ════════════════

function ReelsPlaceholder() {
  return (
    <div style={{ padding: '0 28px 28px' }}>
      <Card pad={48} style={{ textAlign: 'center', color: 'var(--ink-muted)' }}>
        <div style={{ marginBottom: 12, opacity: 0.6 }}>
          <Illo name="chili" size={56} />
        </div>
        <div className="serif" style={{ fontSize: 20, color: 'var(--ink-2)', marginBottom: 4 }}>
          Reels convert in a later phase
        </div>
        <div style={{ fontSize: 13 }}>
          The cook-along reels view (reels.jsx) hasn't been migrated yet — the other tabs are live.
        </div>
      </Card>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────

type CookTab = 'explore' | 'discover' | 'reels' | 'craving' | 'unlocks' | 'notebook';

export default function Cook() {
  const [tab, setTab] = useState<CookTab>('explore');
  // Search comes from the shell TopBar via the search store (WS3).
  const search = useSearchStore((s) => s.query);
  // Recipe-detail opens the overlay via the nav store (rendered by <Overlays/>).
  // The CookNow card-deck (cook-mode.jsx) is not yet converted — honest
  // placeholder feedback until that overlay lands.
  const onOpenRecipe = (id: string) => useNavStore.getState().openRecipe(id);
  const onCookNow = (_id: string) => fireToast('Cook Mode opens in a later update');

  return (
    <div style={{ padding: '28px 28px 0' }}>
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
        <Tabs
          tabs={[
            { label: 'Explore cuisines', value: 'explore' },
            { label: 'Cook what I have', value: 'discover' },
            { label: 'Reels', value: 'reels' },
            { label: 'Craving mode', value: 'craving' },
            { label: 'Recipe unlocks', value: 'unlocks' },
            { label: 'Notebook', value: 'notebook' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as CookTab)}
        />
      </div>
      <div style={{ paddingBottom: 56, margin: '0 -28px' }}>
        {tab === 'explore' && (
          <CuisineExplorer onOpenRecipe={onOpenRecipe} onCookNow={onCookNow} search={search} />
        )}
        {tab === 'discover' && (
          <Recipes onOpenRecipe={onOpenRecipe} onCookNow={onCookNow} search={search} />
        )}
        {tab === 'reels' && <ReelsPlaceholder />}
        {tab === 'craving' && <CravingMode onOpenRecipe={onOpenRecipe} onCookNow={onCookNow} />}
        {tab === 'unlocks' && <RecipeUnlocks />}
        {tab === 'notebook' && <Notebook onCookNow={onCookNow} />}
      </div>
    </div>
  );
}
