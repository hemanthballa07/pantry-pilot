// Kitchen Inbox overlay — TypeScript port of the legacy KitchenInbox (src/overlays.jsx:659-772).
// Presentational capture panel in the shared Drawer shell (a side panel, width 460,
// faithful to the legacy — NOT a centered Modal). Takes only an onClose from the Overlays
// glue (which reads useNavStore.inboxOpen). The captured list seeds from mock.inbox into
// local state (ADR-010: mutable mock-derived state is typed with the wide @/types
// interface, and the mock array is copied so it is never mutated in place).
//
// The quick-capture chips (Snap receipt / Paste URL / Voice note) fire toasts as in the
// legacy. Icon (decorative) + Drawer come from the shared components/ layer.
import { useState } from 'react';
import { Drawer } from '@/components/Drawer';
import { Icon as UiIcon } from '@/components/ui';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores';
import type { InboxEntry, InboxType } from '@/types';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ─── Icon (OQ-011b: shared components/ui primitive, decorative for the overlay layer) ───
function Icon(props: { name: string; size?: number; stroke?: string }) {
  return <UiIcon {...props} decorative />;
}

const ICON_FOR: Record<InboxType, string> = {
  recipe: 'chef',
  grocery: 'cart',
  voice: 'info',
  photo: 'scan',
  todo: 'check',
};
const TONE_FOR: Record<InboxType, string> = {
  recipe: 'var(--orange)',
  grocery: 'var(--green)',
  voice: 'var(--sky)',
  photo: 'var(--plum)',
  todo: 'var(--amber)',
};

function QuickInbox({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: 'var(--paper-warm)',
        border: '1px solid var(--line-soft)',
        borderRadius: 999,
        fontSize: 11.5,
        color: 'var(--ink-2)',
        fontWeight: 600,
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={12} /> {label}
    </button>
  );
}

export function Inbox({ onClose }: { onClose: () => void }) {
  // Copy the mock array so removals/captures never mutate the shared fixture.
  const [items, setItems] = useState<InboxEntry[]>(() => [...mock.inbox]);
  const [input, setInput] = useState('');

  const add = () => {
    const text = input.trim();
    if (!text) return;
    setItems((arr) => [{ id: `in${Date.now()}`, type: 'todo', text, when: 'just now' }, ...arr]);
    setInput('');
    fireToast('Captured');
  };

  return (
    <Drawer open onClose={onClose} width={460} label="Kitchen Inbox">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            borderBottom: '1px solid var(--line)',
            background: 'var(--paper-warm)',
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
            }}
          >
            <Icon name="bookmark" size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>
              Kitchen Inbox
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>
              Capture anything. Pilot files it later.
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close inbox"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'transparent',
              color: 'var(--ink-muted)',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
            }}
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        {/* Capture input */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && add()}
              aria-label="Add a note to your kitchen inbox"
              placeholder="Buy oat milk · try TikTok feta pasta · use spinach…"
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                fontSize: 13,
                color: 'var(--ink)',
                padding: '6px 8px',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={add}
              disabled={!input.trim()}
              aria-label="Capture"
              style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: input.trim() ? 'var(--ink)' : 'var(--bg-tint)',
                color: input.trim() ? 'var(--paper-warm)' : 'var(--ink-soft)',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
              }}
            >
              <Icon name="plus" size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            <QuickInbox
              icon="receipt"
              label="Snap receipt"
              onClick={() => fireToast('Camera ready…')}
            />
            <QuickInbox
              icon="upload"
              label="Paste URL"
              onClick={() => fireToast('Paste anywhere — Pilot will parse it')}
            />
            <QuickInbox icon="info" label="Voice note" onClick={() => fireToast('Listening…')} />
          </div>
        </div>

        {/* Inbox items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, background: 'var(--bg)' }}>
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: 0.5,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {items.length} captured · oldest first will be auto-archived in 30d
          </div>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                display: 'flex',
                gap: 12,
                padding: '12px 14px',
                marginBottom: 8,
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `${TONE_FOR[it.type]}1F`,
                  color: TONE_FOR[it.type],
                  display: 'grid',
                  placeItems: 'center',
                  flex: '0 0 auto',
                }}
              >
                <Icon name={ICON_FOR[it.type]} size={13} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4 }}>{it.text}</div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-soft)',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{it.type}</span>
                  <span>·</span>
                  <span>{it.when}</span>
                </div>
              </div>
              <button
                onClick={() => setItems((arr) => arr.filter((x) => x.id !== it.id))}
                aria-label={`Remove ${it.text}`}
                style={{
                  width: 22,
                  height: 22,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--ink-soft)',
                  cursor: 'pointer',
                  opacity: 0.6,
                }}
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ textAlign: 'center', padding: 36, color: 'var(--ink-muted)' }}>
              <Icon name="bookmark" size={32} stroke="var(--ink-soft)" />
              <div style={{ marginTop: 10, fontSize: 13 }}>Inbox zero. Capture something.</div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
