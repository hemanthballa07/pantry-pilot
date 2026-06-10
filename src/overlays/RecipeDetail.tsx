// Recipe-detail overlay — TypeScript port of the legacy RecipeDrawer
// (src/overlays.jsx:200-396). Presentational: it takes the selected recipeId
// + an onClose from the Overlays glue (which reads useNavStore), finds the
// recipe in the mock, and renders it inside the shared Drawer shell.
//
// "Start cooking" closes this drawer and opens the Cook Mode overlay via
// useNavStore.openCook (legacy onCook). Save / Add-missing fire toasts as in the
// legacy (the toast {icon} option is dropped — the store derives the glyph). Pill/Button
// follow the per-file convention; Icon (decorative) + Drawer + Illo come from the shared components/ layer.
import type { ReactNode } from 'react';
import { Drawer } from '@/components/Drawer';
import { Illo } from '@/components/Illo';
import { Icon as UiIcon } from '@/components/ui';
import { mock } from '@/data/mock';
import { useNavStore, useToastStore } from '@/stores';
import type { Recipe } from '@/types';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ─── Icon (OQ-011b: shared components/ui primitive, decorative for the overlay layer) ───
function Icon(props: { name: string; size?: number; stroke?: string }) {
  return <UiIcon {...props} decorative />;
}

// ─── Pill ─────────────────────────────────────────────────────────────────
type PillTone = 'green' | 'orange' | 'tomato' | 'ink';

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
  ink: {
    bg: 'var(--ink, #1a1814)',
    color: 'var(--paper-warm, #fdfaf3)',
    border: 'var(--ink, #1a1814)',
  },
};

function Pill({
  tone = 'green',
  size = 'sm',
  icon,
  children,
}: {
  tone?: PillTone;
  size?: 'sm' | 'md';
  icon?: string;
  children?: ReactNode;
}) {
  const s = PILL_STYLES[tone];
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'md' ? '4px 10px' : '3px 8px',
        fontSize: size === 'md' ? 12 : 11,
        fontWeight: 700,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 999,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────
const BTN_STYLES = {
  primary: { bg: 'var(--ink, #1a1814)', fg: 'var(--paper-warm, #fdfaf3)', bd: 'none' },
  secondary: {
    bg: 'var(--paper-warm, #fdfaf3)',
    fg: 'var(--ink, #1a1814)',
    bd: '1px solid var(--line, rgba(0,0,0,.12))',
  },
} as const;

function Button({
  variant = 'primary',
  icon,
  iconRight,
  full,
  onClick,
  children,
}: {
  variant?: keyof typeof BTN_STYLES;
  icon?: string;
  iconRight?: string;
  full?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const s = BTN_STYLES[variant];
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
        background: s.bg,
        color: s.fg,
        border: s.bd,
        borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
      }}
    >
      {icon && <Icon name={icon} size={14} />}
      {children}
      {iconRight && <Icon name={iconRight} size={14} />}
    </button>
  );
}

// ─── recipe / ingredient → illustration heuristics (mirrors Cook.tsx) ───────
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

// ─── Match / confidence rows ────────────────────────────────────────────────
function MatchRow({
  label,
  ok,
  tone,
}: {
  label: string;
  ok?: boolean;
  tone?: 'tomato' | 'orange';
}) {
  const c = ok ? 'var(--green-deep)' : tone === 'tomato' ? 'var(--tomato)' : 'var(--orange-deep)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: c }}>
      <Icon name={ok ? 'check' : tone === 'tomato' ? 'alert' : 'info'} size={13} />
      <span>{label}</span>
    </div>
  );
}

function ConfTag({ label, ok, warn }: { label: string; ok?: boolean; warn?: boolean }) {
  const c = warn ? 'var(--amber)' : ok ? 'var(--green)' : 'var(--ink-muted)';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11.5,
        color: 'var(--ink-2)',
      }}
    >
      <Icon name={warn ? 'info' : 'check'} size={12} stroke={c} />
      <span>{label}</span>
    </div>
  );
}

// ─── Body (only rendered when a recipe is resolved) ─────────────────────────
function RecipeDetailBody({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const stats = [
    { l: 'Time', v: `${recipe.time}m`, c: 'var(--ink)' },
    { l: 'Cost', v: `$${recipe.cost.toFixed(2)}`, c: 'var(--green-deep)' },
    { l: 'Cals', v: `${recipe.cals}`, c: 'var(--orange)' },
    { l: 'Protein', v: `${recipe.protein}g`, c: 'var(--tomato)' },
  ];

  const startCooking = () => {
    // Close the drawer and hand off to the full-screen Cook Mode overlay
    // (legacy onCook: setRecipeId(null) then cookNow(rid)).
    onClose();
    useNavStore.getState().openCook(recipe.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        style={{
          position: 'relative',
          height: 240,
          background: `linear-gradient(135deg, ${recipe.tone}E6 0%, ${recipe.tone}99 100%)`,
          display: 'grid',
          placeItems: 'center',
          flex: '0 0 auto',
        }}
      >
        <Illo name={recipeIllo(recipe)} size={120} />
        <button
          onClick={onClose}
          aria-label="Close recipe"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(255,255,255,.92)',
            color: 'var(--ink-2)',
            border: 'none',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={16} />
        </button>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
          }}
        >
          <Pill tone="ink" size="md">
            {recipe.match}% match
          </Pill>
          {recipe.expiringUsed.length > 0 && (
            <Pill tone="orange" size="md" icon="alert">
              Uses {recipe.expiringUsed.length} expiring
            </Pill>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px' }}>
        <h2
          className="serif"
          style={{ fontSize: 28, margin: 0, letterSpacing: -0.4, lineHeight: 1.1 }}
        >
          {recipe.name}
        </h2>
        <p
          style={{
            marginTop: 8,
            marginBottom: 18,
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
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
            marginBottom: 22,
            paddingBottom: 18,
            borderBottom: '1px solid var(--line-soft)',
          }}
        >
          {stats.map((s) => (
            <div key={s.l}>
              <div className="serif tnum" style={{ fontSize: 22, color: s.c, lineHeight: 1 }}>
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: 'var(--ink-muted)',
                  marginTop: 4,
                  fontWeight: 700,
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                {s.l}
              </div>
            </div>
          ))}
        </div>

        {/* Match breakdown */}
        <div
          style={{
            marginBottom: 16,
            padding: 16,
            background: 'var(--green-tint)',
            border: '1px solid var(--green-soft)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--green-deep)',
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Ingredient match · {recipe.match}%
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <MatchRow
              label={`${recipe.uses.length - recipe.missing.length} ingredients available`}
              ok
            />
            <MatchRow
              label={`${recipe.expiringUsed.length} expiring ingredients used`}
              tone="orange"
            />
            {recipe.missing.length > 0 && (
              <MatchRow
                label={`${recipe.missing.length} missing — Pilot added them to your list`}
                tone="tomato"
              />
            )}
          </div>
        </div>

        {/* Confidence */}
        <div
          style={{
            marginBottom: 22,
            padding: 16,
            background: 'var(--paper-warm)',
            border: '1px solid var(--line)',
            borderRadius: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink-muted)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
              }}
            >
              Pilot's confidence
            </span>
            <span
              className="serif tnum"
              style={{ fontSize: 22, color: 'var(--green-deep)', lineHeight: 1 }}
            >
              {Math.min(99, recipe.match + 4)}%
            </span>
          </div>
          <div
            style={{ fontSize: 12, color: 'var(--ink-muted)', lineHeight: 1.5, marginBottom: 10 }}
          >
            {recipe.difficulty === 'Easy'
              ? 'Beginner-friendly — equipment matches and the steps are forgiving.'
              : `A ${recipe.difficulty.toLowerCase()} cook, but equipment matches and the steps stay weeknight-sized.`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <ConfTag ok label={`Skill: ${recipe.difficulty}`} />
            <ConfTag ok label="Equipment match" />
            <ConfTag ok label="Time fits weeknight" />
            <ConfTag
              warn={recipe.missing.length > 0}
              label={
                recipe.missing.length > 0
                  ? `${recipe.missing.length} missing item`
                  : 'Fully stocked'
              }
            />
          </div>
        </div>

        {/* Ingredients */}
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
          Ingredients · serves 2
        </div>
        <div style={{ display: 'grid', gap: 6, marginBottom: 22 }}>
          {recipe.uses.map((u) => (
            <div
              key={u}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--paper-warm)',
                border: '1px solid var(--line-soft)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: 'var(--paper)',
                  borderRadius: 7,
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <Illo name={ingrIllo(u)} size={20} />
              </div>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>{u}</span>
              <Pill tone="green" size="sm">
                In pantry
              </Pill>
            </div>
          ))}
          {recipe.missing.map((m) => (
            <div
              key={m}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 8,
                background: 'var(--tomato-soft)',
                border: '1px solid var(--tomato-line)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  background: 'var(--on-tint-pad)',
                  borderRadius: 7,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--tomato-ink)',
                }}
              >
                <Icon name="plus" size={16} />
              </div>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--tomato-ink)', fontWeight: 600 }}>
                {m}
              </span>
              <Pill tone="tomato" size="sm">
                Missing
              </Pill>
            </div>
          ))}
        </div>

        {/* Substitutions */}
        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.5,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Smart substitutions
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-muted)', lineHeight: 1.55 }}>
            Short an ingredient? Swap in what you have on hand — Pilot recalculates the match and
            flags anything that changes the flavor.
          </div>
        </div>
      </div>

      <div
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--line)',
          display: 'flex',
          gap: 8,
        }}
      >
        <Button full variant="primary" iconRight="arrowRight" onClick={startCooking}>
          Start cooking
        </Button>
        <Button variant="secondary" icon="bookmark" onClick={() => fireToast('Recipe saved')}>
          Save
        </Button>
        <Button
          variant="secondary"
          icon="cart"
          onClick={() => fireToast('Added missing ingredients to grocery list')}
        >
          Add missing
        </Button>
      </div>
    </div>
  );
}

export function RecipeDetail({
  recipeId,
  onClose,
}: {
  recipeId: string | null;
  onClose: () => void;
}) {
  // Cast to the wide interface so .find() yields Recipe | undefined (the mock's
  // literal-union element type otherwise fights assignment); also guards an
  // accidental in-place mutation of mock.recipes (ADR-010 guardrail, as in Cook).
  const recipe = recipeId
    ? (mock.recipes as readonly Recipe[]).find((r) => r.id === recipeId)
    : undefined;

  return (
    <Drawer open={!!recipe} onClose={onClose} width={520} label={recipe?.name ?? 'Recipe'}>
      {recipe && <RecipeDetailBody recipe={recipe} onClose={onClose} />}
    </Drawer>
  );
}
