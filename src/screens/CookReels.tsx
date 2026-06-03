// src/screens/CookReels.tsx — Cook's "Reels" tab: a vertical short-video feed.
// TypeScript port of the legacy reels.jsx (window.PPReels.CookReels). Rendered
// inline as Cook's Reels tab panel (NOT an Overlays-host overlay) — Cook passes
// onCookNow → openCook and onOpenRecipe → openRecipe (the same nav-store actions
// its recipe cards use). Inline Icon/Pill per the per-file convention (OQ-011);
// the shared Illo is imported. The legacy toast { icon } option is dropped.
import { useState } from 'react';
import { Illo } from '@/components/Illo';
import { Icon } from '@/components/ui';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores';
import type { Reel } from '@/types';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ─── Pill (ghost tone only — the saved counter) ─────────────────────────────
function Pill({ icon, children }: { icon?: string; children?: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 700,
        background: 'rgba(0,0,0,.04)',
        color: 'var(--ink-muted)',
        border: '1px solid transparent',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {icon && <Icon name={icon} size={11} />}
      {children}
    </span>
  );
}

// ─── Action rail button ──────────────────────────────────────────────────────
function RailBtn({
  icon,
  label,
  count,
  active,
  activeColor,
  onClick,
}: {
  icon: string;
  label: string;
  count: string;
  active?: boolean;
  activeColor?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: active ? activeColor : 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.16)',
          color: active ? '#fff' : 'rgba(255,255,255,.92)',
          display: 'grid',
          placeItems: 'center',
          transition: 'all 160ms',
        }}
      >
        <Icon name={icon} size={20} />
      </span>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{count}</span>
    </button>
  );
}

// ─── A single reel (vertical player + action rail) ───────────────────────────
function ReelCard({
  reel,
  saved,
  liked,
  onSave,
  onLike,
  onCook,
  onOpen,
}: {
  reel: Reel;
  saved: boolean;
  liked: boolean;
  onSave: () => void;
  onLike: () => void;
  onCook: () => void;
  onOpen: () => void;
}) {
  return (
    <div
      className="reel"
      style={{
        height: 'calc(100vh - 210px)',
        minHeight: 520,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 360,
          height: 'min(86%, 660px)',
          borderRadius: 24,
          overflow: 'hidden',
          background: `linear-gradient(165deg, ${reel.tone} 0%, ${reel.tone}CC 60%, #1c1a16 100%)`,
          boxShadow: '0 24px 60px -20px rgba(0,0,0,.6)',
        }}
      >
        {/* progress bar */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            right: 14,
            height: 3,
            background: 'rgba(255,255,255,.25)',
            borderRadius: 999,
            zIndex: 3,
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'rgba(255,255,255,.95)',
              borderRadius: 999,
              animation: 'ppReelBar 7s linear infinite',
            }}
          />
        </div>

        {/* tag + duration */}
        <div
          style={{
            position: 'absolute',
            top: 26,
            left: 14,
            right: 14,
            zIndex: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              background: 'rgba(0,0,0,.28)',
              padding: '4px 10px',
              borderRadius: 999,
              backdropFilter: 'blur(4px)',
            }}
          >
            {reel.tag}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,.9)',
              background: 'rgba(0,0,0,.28)',
              padding: '4px 9px',
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backdropFilter: 'blur(4px)',
            }}
          >
            <Icon name="circle" size={9} /> {reel.duration}
          </span>
        </div>

        {/* steam + dish */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: '46%',
                left: `${42 + i * 8}%`,
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.5)',
                filter: 'blur(6px)',
                animation: `ppSteam 2.6s ease-in-out ${i * 0.5}s infinite`,
              }}
            />
          ))}
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.16)',
              display: 'grid',
              placeItems: 'center',
              animation: 'ppKen 6s ease-in-out infinite',
              border: '1px solid rgba(255,255,255,.25)',
            }}
          >
            <Illo name={reel.illo} size={104} />
          </div>
        </div>

        {/* play affordance */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(0,0,0,.3)',
              display: 'grid',
              placeItems: 'center',
              backdropFilter: 'blur(2px)',
              opacity: 0.8,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                borderLeft: '16px solid #fff',
                marginLeft: 4,
              }}
            />
          </div>
        </div>

        {/* bottom info overlay */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3,
            padding: '60px 16px 18px',
            background: 'linear-gradient(0deg, rgba(20,18,15,.92) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'rgba(255,255,255,.92)',
                color: reel.tone,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {reel.creator[0]}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>@{reel.handle}</span>
            <button
              onClick={onOpen}
              style={{
                marginLeft: 'auto',
                fontSize: 11.5,
                fontWeight: 700,
                color: '#fff',
                background: 'rgba(255,255,255,.16)',
                border: '1px solid rgba(255,255,255,.3)',
                borderRadius: 999,
                padding: '4px 12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Recipe
            </button>
          </div>
          <div
            className="serif"
            style={{ fontSize: 21, color: '#fff', lineHeight: 1.15, letterSpacing: -0.3 }}
          >
            {reel.title}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: 'rgba(255,255,255,.8)',
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            {reel.caption}
          </div>
          <button
            onClick={onCook}
            style={{
              marginTop: 14,
              width: '100%',
              height: 44,
              borderRadius: 12,
              cursor: 'pointer',
              background: '#FDFAF3',
              color: 'var(--ink)',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Icon name="chef" size={16} /> Cook this now
          </button>
        </div>
      </div>

      {/* Action rail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'center' }}>
        <RailBtn
          icon="heart"
          label="Like"
          active={liked}
          activeColor="var(--tomato)"
          count={reel.likes}
          onClick={onLike}
        />
        <RailBtn
          icon="bookmark"
          label="Save"
          active={saved}
          activeColor="var(--amber)"
          count={reel.saves}
          onClick={onSave}
        />
        <RailBtn
          icon="chef"
          label="Comments"
          count={reel.comments}
          onClick={() => fireToast('Comments coming soon')}
        />
        <RailBtn
          icon="upload"
          label="Share"
          count="Share"
          onClick={() => fireToast('Share link copied')}
        />
      </div>
    </div>
  );
}

// ─── Feed ─────────────────────────────────────────────────────────────────
export function CookReels({
  onCookNow,
  onOpenRecipe,
}: {
  onCookNow: (id: string) => void;
  onOpenRecipe: (id: string) => void;
}) {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [liked, setLiked] = useState<Set<string>>(() => new Set());

  const toggleSave = (id: string) =>
    setSaved((s) => {
      const n = new Set(s);
      const had = n.has(id);
      if (had) n.delete(id);
      else n.add(id);
      fireToast(had ? 'Removed from saved' : 'Saved to your reels');
      return n;
    });
  const toggleLike = (id: string) =>
    setLiked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div data-testid="cook-reels" style={{ padding: '0 28px 8px' }}>
      <style>{`
        @keyframes ppSteam { 0% { transform: translateY(8px) scale(.8); opacity: 0; }
          30% { opacity: .55; } 100% { transform: translateY(-46px) scale(1.3); opacity: 0; } }
        @keyframes ppReelBar { from { width: 0%; } to { width: 100%; } }
        @keyframes ppKen { 0%,100% { transform: scale(1) rotate(0deg); } 50% { transform: scale(1.08) rotate(1.5deg); } }
        .reel-feed { scroll-snap-type: y mandatory; }
        .reel-feed > .reel { scroll-snap-align: center; }
      `}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          margin: '0 0 14px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 0.6,
              color: 'var(--tomato)',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Cook Reels
          </div>
          <h2 className="serif" style={{ margin: '4px 0 0', fontSize: 24, letterSpacing: -0.3 }}>
            Watch it, save it, then cook it.
          </h2>
        </div>
        <Pill icon="bookmark">{saved.size} saved</Pill>
      </div>

      <div
        className="reel-feed"
        style={{
          height: 'calc(100vh - 210px)',
          overflowY: 'auto',
          borderRadius: 20,
          border: '1px solid var(--line)',
          background: 'var(--ink)',
        }}
      >
        {(mock.reels as readonly Reel[]).map((reel) => (
          <ReelCard
            key={reel.id}
            reel={reel}
            saved={saved.has(reel.id)}
            liked={liked.has(reel.id)}
            onSave={() => toggleSave(reel.id)}
            onLike={() => toggleLike(reel.id)}
            onCook={() => onCookNow(reel.recipeId)}
            onOpen={() => onOpenRecipe(reel.recipeId)}
          />
        ))}
      </div>
    </div>
  );
}
