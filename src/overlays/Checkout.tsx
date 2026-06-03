// Checkout overlay — TypeScript port of the legacy src/screens/checkout.jsx
// (window.PPCheckout). The monetization moment: review basket → pick retailer /
// fulfillment → place order → items auto-add to pantry on arrival. A centered
// modal (not a Drawer, not full-screen) running a cart → placing → done phase
// machine. Pure pricing/savings math lives in @/lib/checkout (the OQ-003 lib
// precedent); this shell owns the phase / retailer / excluded-item state.
//
// Deviations from the legacy screen (documented, like the other overlays):
//   1. Router-free, matching RecipeDetail/CookMode: the "done" actions fire a
//      toast and close rather than navigating — the overlay layer never calls
//      useNavigate (that would break the router-free <Overlays> host + its tests).
//      The user lands back on Shop; the pantry is one sidebar click away.
//   2. Backdrop-click + Escape dismiss come from the shared Modal (the legacy
//      checkout dismissed only via the X/Escape) — standard modal a11y, matching
//      Drawer. Full focus-trap is still deferred (OQ-012).
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { Illo } from '@/components/Illo';
import { mock } from '@/data/mock';
import { Icon as UiIcon } from '@/components/ui';
import { ingrIllo } from '@/data/recipes';
import { useToastStore } from '@/stores';
import type { GroceryItem } from '@/types';
import { RETAILERS, getRetailer, computeTotals, type Fulfillment } from '@/lib/checkout';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ─── Icon (OQ-011b: shared components/ui primitive, decorative for the overlay layer) ───
function Icon(props: { name: string; size?: number; stroke?: string }) {
  return <UiIcon {...props} decorative />;
}

// ─── Pill ───────────────────────────────────────────────────────────────────
function Pill({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 700,
        background: 'var(--green-tint, #eef7ee)',
        color: 'var(--green-deep, #2a5a2a)',
        border: '1px solid var(--green-soft, rgba(59,110,61,.2))',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
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
  iconRight,
  full,
  disabled,
  onClick,
  children,
}: {
  variant?: keyof typeof BTN_STYLES;
  iconRight?: string;
  full?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const s = BTN_STYLES[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '12px 18px',
        fontSize: 14,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
        border: s.bd,
        borderRadius: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: 'inherit',
        width: full ? '100%' : undefined,
      }}
    >
      {children}
      {iconRight && <Icon name={iconRight} size={14} />}
    </button>
  );
}

// ─── Totals row ─────────────────────────────────────────────────────────────
function Row({ l, v }: { l: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>{l}</span>
      <span className="tnum" style={{ color: 'var(--ink-2)' }}>
        {v}
      </span>
    </div>
  );
}

const LABEL_STYLE: CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.6,
  color: 'var(--ink-muted)',
  fontWeight: 700,
  textTransform: 'uppercase',
};

// ─── Phase: cart ──────────────────────────────────────────────────────────
function CartPhase({
  cart,
  excluded,
  toggle,
  retailer,
  setRetailer,
  fulfillment,
  setFulfillment,
  onPlace,
}: {
  cart: GroceryItem[];
  excluded: Set<string>;
  toggle: (id: string) => void;
  retailer: string;
  setRetailer: (id: string) => void;
  fulfillment: Fulfillment;
  setFulfillment: (f: Fulfillment) => void;
  onPlace: () => void;
}) {
  const r = getRetailer(retailer);
  const included = cart.filter((c) => !excluded.has(c.id));
  const t = computeTotals(included, r, fulfillment);

  return (
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        minHeight: 0,
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
      }}
    >
      {/* Left: basket + retailer */}
      <div
        style={{ overflowY: 'auto', padding: '22px 24px', borderRight: '1px solid var(--line)' }}
      >
        <div style={{ ...LABEL_STYLE, marginBottom: 4 }}>Your basket</div>
        <div
          className="serif"
          style={{ fontSize: 22, color: 'var(--ink)', marginBottom: 16, letterSpacing: -0.3 }}
        >
          {included.length} items · delivered to Apartment 4B
        </div>

        <div style={{ display: 'grid', gap: 6, marginBottom: 24 }}>
          {cart.map((c) => {
            const on = !excluded.has(c.id);
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 10px',
                  borderRadius: 10,
                  background: on ? 'var(--paper-warm)' : 'transparent',
                  border: '1px solid var(--line-soft)',
                  opacity: on ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'var(--bg-tint)',
                    border: '1px solid var(--line-soft)',
                    display: 'grid',
                    placeItems: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Illo name={ingrIllo(c.name)} size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textDecoration: on ? 'none' : 'line-through',
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>
                    {c.qty} · {c.section}
                  </div>
                </div>
                <span
                  className="tnum"
                  style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}
                >
                  ${(c.price * r.mult).toFixed(2)}
                </span>
                <button
                  onClick={() => toggle(c.id)}
                  aria-label={`${on ? 'Remove' : 'Add'} ${c.name}`}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 7,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-soft)',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <Icon name={on ? 'trash' : 'plus'} size={13} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Retailer choice */}
        <div style={{ ...LABEL_STYLE, marginBottom: 10 }}>
          Choose a store · same basket, live prices
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {RETAILERS.map((x) => {
            const on = retailer === x.id;
            const xt = t.baseSubtotal * x.mult;
            return (
              <button
                key={x.id}
                onClick={() => setRetailer(x.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  background: on ? 'var(--green-tint)' : 'var(--paper)',
                  border: `1.5px solid ${on ? 'var(--green)' : 'var(--line)'}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                      {x.name}
                    </span>
                    {x.id === 'aldi' && <Pill>{x.badge}</Pill>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-muted)', marginTop: 2 }}>
                    {x.eta}
                  </div>
                </div>
                <span className="serif tnum" style={{ fontSize: 16, color: 'var(--ink)' }}>
                  ${xt.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: fulfillment + totals */}
      <div
        style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)', minHeight: 0 }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '22px 22px' }}>
          {/* Fulfillment toggle */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              background: 'var(--bg-tint)',
              padding: 4,
              borderRadius: 10,
              border: '1px solid var(--line)',
              marginBottom: 18,
            }}
          >
            {(
              [
                ['delivery', 'Delivery'],
                ['pickup', 'Pickup'],
              ] as [Fulfillment, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFulfillment(k)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  background: fulfillment === k ? 'var(--paper)' : 'transparent',
                  color: fulfillment === k ? 'var(--ink)' : 'var(--ink-muted)',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: fulfillment === k ? 'var(--sh-1)' : 'none',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12.5,
              color: 'var(--ink-2)',
              marginBottom: 18,
            }}
          >
            <Icon name="timer" size={14} stroke="var(--green-deep)" />
            {fulfillment === 'pickup' ? 'Ready for pickup in ~2 hours' : `Arrives ${r.eta}`}
          </div>

          {/* Totals */}
          <div style={{ display: 'grid', gap: 9, fontSize: 13, color: 'var(--ink-muted)' }}>
            <Row l={`Subtotal · ${included.length} items`} v={`$${t.subtotal.toFixed(2)}`} />
            <Row
              l={fulfillment === 'pickup' ? 'Pickup' : 'Delivery'}
              v={t.deliveryFee === 0 ? 'Free' : `$${t.deliveryFee.toFixed(2)}`}
            />
            <Row l="Service fee" v={`$${t.serviceFee.toFixed(2)}`} />
          </div>
          <div style={{ height: 1, background: 'var(--line)', margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Total</span>
            <span className="serif tnum" style={{ fontSize: 26, color: 'var(--ink)' }}>
              ${t.total.toFixed(2)}
            </span>
          </div>

          {t.savings > 0.5 && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 12px',
                background: 'var(--green-tint)',
                border: '1px solid var(--green-soft)',
                borderRadius: 10,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <Icon name="sparkles" size={14} stroke="var(--green-deep)" />
              <span style={{ fontSize: 12, color: 'var(--green-deep)', fontWeight: 600 }}>
                Pilot picked {r.name} — saving you ${t.savings.toFixed(2)} on this basket.
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-warm)',
          }}
        >
          <Button
            full
            variant="primary"
            iconRight="arrowRight"
            onClick={onPlace}
            disabled={included.length === 0}
          >
            Place order · ${t.total.toFixed(2)}
          </Button>
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--ink-soft)',
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            PantryPilot is free — we earn a small partner commission, never a markup on your cart.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Phase: placing ──────────────────────────────────────────────────────
function PlacingPhase({
  retailerName,
  fulfillment,
}: {
  retailerName: string;
  fulfillment: Fulfillment;
}) {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            margin: '0 auto 18px',
            border: '3px solid var(--green-soft)',
            borderTopColor: 'var(--green)',
            animation: 'ppSpin 800ms linear infinite',
          }}
        />
        <div className="serif" style={{ fontSize: 22, color: 'var(--ink)' }}>
          Placing your order with {retailerName}…
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 6 }}>
          Confirming live prices and your{' '}
          {fulfillment === 'pickup' ? 'pickup slot' : 'delivery window'}.
        </div>
      </div>
      <style>{`@keyframes ppSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Phase: done ───────────────────────────────────────────────────────────
function DonePhase({
  retailerName,
  eta,
  fulfillment,
  itemCount,
  total,
  savings,
  onClose,
}: {
  retailerName: string;
  eta: string;
  fulfillment: Fulfillment;
  itemCount: number;
  total: number;
  savings: number;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '44px 32px 28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 999,
          background: 'var(--green-tint)',
          border: '3px solid var(--green)',
          display: 'grid',
          placeItems: 'center',
          color: 'var(--green-deep)',
          animation: 'ppPop 320ms ease-out',
        }}
      >
        <Icon name="check" size={44} />
      </div>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
          Order placed with {retailerName}
        </h2>
        <div
          style={{
            fontSize: 14,
            color: 'var(--ink-muted)',
            marginTop: 8,
            lineHeight: 1.5,
            maxWidth: 460,
          }}
        >
          {fulfillment === 'pickup' ? 'Ready for pickup in ~2 hours.' : `Arriving ${eta}.`} The{' '}
          {itemCount} items will auto-add to your pantry the moment they arrive — no scanning
          needed.
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 13,
            marginBottom: 8,
          }}
        >
          <span style={{ color: 'var(--ink-muted)' }}>Order total</span>
          <span className="tnum" style={{ fontWeight: 700, color: 'var(--ink)' }}>
            ${total.toFixed(2)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: 'var(--ink-muted)' }}>Saved vs. priciest store</span>
          <span className="tnum" style={{ fontWeight: 700, color: 'var(--green-deep)' }}>
            ${savings.toFixed(2)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          variant="secondary"
          onClick={() => {
            fireToast('Order tracked');
            onClose();
          }}
        >
          Track order
        </Button>
        <Button
          variant="primary"
          iconRight="arrowRight"
          onClick={() => {
            fireToast('Order placed · items will sync to pantry');
            onClose();
          }}
        >
          View pantry
        </Button>
      </div>
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────
type Phase = 'cart' | 'placing' | 'done';

export function Checkout({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>('cart');
  const [retailer, setRetailer] = useState('aldi');
  const [fulfillment, setFulfillment] = useState<Fulfillment>('delivery');
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());

  // Read-only over mock; the `as readonly` cast widens to the @/types interface
  // and guards an accidental in-place mutation (ADR-010 guardrail).
  const cart = (mock.grocery as readonly GroceryItem[]).filter((g) => !g.bought);
  const included = cart.filter((c) => !excluded.has(c.id));
  const r = getRetailer(retailer);
  const totals = computeTotals(included, r, fulfillment);

  useEffect(() => {
    if (phase !== 'placing') return;
    const t = setTimeout(() => setPhase('done'), 1700);
    return () => clearTimeout(t);
  }, [phase]);

  const toggle = (id: string) =>
    setExcluded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const phases: Phase[] = ['cart', 'placing', 'done'];

  return (
    <Modal open onClose={onClose} label="Checkout" width={920}>
      {/* Header */}
      <div
        style={{
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderBottom: '1px solid var(--line)',
          background: 'var(--paper-warm)',
          flex: '0 0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--green-deep)' }}>
            <Icon name="cart" size={16} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Checkout</span>
          <span style={{ marginLeft: 14, display: 'flex', gap: 4 }}>
            {phases.map((p) => (
              <span
                key={p}
                style={{
                  width: phase === p ? 22 : 6,
                  height: 6,
                  borderRadius: 999,
                  background:
                    phases.indexOf(p) <= phases.indexOf(phase)
                      ? 'var(--green)'
                      : 'var(--line-strong)',
                  transition: 'width 200ms ease, background 200ms ease',
                }}
              />
            ))}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close checkout"
          style={{
            width: 30,
            height: 30,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--ink-muted)',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      {phase === 'cart' && (
        <CartPhase
          cart={cart}
          excluded={excluded}
          toggle={toggle}
          retailer={retailer}
          setRetailer={setRetailer}
          fulfillment={fulfillment}
          setFulfillment={setFulfillment}
          onPlace={() => setPhase('placing')}
        />
      )}

      {phase === 'placing' && <PlacingPhase retailerName={r.name} fulfillment={fulfillment} />}

      {phase === 'done' && (
        <DonePhase
          retailerName={r.name}
          eta={r.eta}
          fulfillment={fulfillment}
          itemCount={included.length}
          total={totals.total}
          savings={totals.savings}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
