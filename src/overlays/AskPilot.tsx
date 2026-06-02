// Ask Pilot overlay — TypeScript port of the legacy AskPilot (src/overlays.jsx:399-522).
// Presentational chat panel in the shared Drawer shell (a side panel, width 460,
// faithful to the legacy — NOT a centered Modal). It takes only an onClose from the
// Overlays glue (which reads useNavStore.askPilotOpen); all conversation state is
// local.
//
// Deliberate deviation from the legacy: the prototype called window.claude.complete
// for replies. There is no backend in v1 (ADR-003) and the overlay layer is
// router-free, so Pilot replies with a canned line after a short delay — the same
// graceful path the legacy already fell back to when the call failed. The reply
// timers are tracked in a ref and cleared on unmount so they never setState after
// close (the Capture overlay's barcode-timer lesson). Primitives (Icon) are inlined
// per the project's per-file convention; Drawer comes from the shared components/ layer.
import { useEffect, useRef, useState } from 'react';
import { Drawer } from '@/components/Drawer';

// ─── Icon ───────────────────────────────────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  close: 'M6 6l12 12M18 6L6 18',
  arrowRight: 'M5 12h14M13 5l7 7-7 7',
  sparkles:
    'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z M6 2l.8 2.2L9 5l-2.2.8L6 8l-.8-2.2L3 5l2.2-.8z M17 16l.6 1.8L19.4 18l-1.8.6L17 20.4l-.6-1.8L14.6 18l1.8-.6z',
};

function Icon({
  name,
  size = 18,
  stroke = 'currentColor',
}: {
  name: string;
  size?: number;
  stroke?: string;
}) {
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
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name] ?? ''} />
    </svg>
  );
}

// ─── Chat bubble ─────────────────────────────────────────────────────────────
type Role = 'pilot' | 'user';
interface Message {
  role: Role;
  text: string;
}

function Bubble({ role, text, thinking }: { role: Role; text: string; thinking?: boolean }) {
  if (role === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div
          style={{
            maxWidth: '82%',
            padding: '10px 14px',
            background: 'var(--ink)',
            color: 'var(--paper-warm)',
            borderRadius: '14px 14px 4px 14px',
            fontSize: 13.5,
            lineHeight: 1.5,
          }}
        >
          {text}
        </div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 999,
          background: 'var(--ink)',
          color: 'var(--amber)',
          display: 'grid',
          placeItems: 'center',
          flex: '0 0 auto',
        }}
      >
        <Icon name="sparkles" size={12} />
      </div>
      <div
        style={{
          maxWidth: '85%',
          padding: '10px 14px',
          background: 'var(--paper)',
          border: '1px solid var(--line)',
          color: 'var(--ink-2)',
          borderRadius: '4px 14px 14px 14px',
          fontSize: 13.5,
          lineHeight: 1.5,
        }}
      >
        {thinking ? <span style={{ color: 'var(--ink-soft)' }}>thinking…</span> : text}
      </div>
    </div>
  );
}

// Canned conversation content (offline — no LLM in v1, see header).
const OPENING =
  "I see you've got spinach expiring tomorrow, leftover rice from Monday, and a half-jar of Schezwan sauce. The obvious move tonight is fried rice — 18 minutes, $2.40 a serving.";
const PILOT_REPLY =
  "Here's my take: lead with what's expiring. The spinach and that leftover rice are begging for a quick Schezwan fried rice tonight — about 18 minutes and $2.40 a serving. Want me to walk you through it?";

const QUICK_PROMPTS = [
  'What can I cook in 20 minutes?',
  'Use my expiring vegetables',
  'Plan a $60 high-protein week',
  'Suggest meals under $3 / serving',
];

export function AskPilot({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([{ role: 'pilot', text: OPENING }]);
  const [thinking, setThinking] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);
  // Reply timers are cleared on unmount so a pending reply never setStates after close.
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    // jsdom doesn't implement scrollTo — guard the call so tests don't throw.
    scroll.current?.scrollTo?.({ top: 99999, behavior: 'smooth' });
  }, [messages, thinking]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const send = (text?: string) => {
    const t = (text ?? input).trim();
    // Single-flight: ignore empty input and any send while a reply is pending, so the
    // Enter and quick-prompt paths can't stack replies (the Send button is already
    // disabled while thinking).
    if (!t || thinking) return;
    setMessages((m) => [...m, { role: 'user', text: t }]);
    setInput('');
    setThinking(true);
    const id = setTimeout(() => {
      setMessages((m) => [...m, { role: 'pilot', text: PILOT_REPLY }]);
      setThinking(false);
    }, 650);
    timers.current.push(id);
  };

  return (
    <Drawer open onClose={onClose} width={460} label="Pilot">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: 'var(--bg)',
        }}
      >
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
              background: 'var(--ink)',
              color: 'var(--amber)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="sparkles" size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="serif" style={{ fontSize: 17, color: 'var(--ink)' }}>
              Pilot
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>Knows your kitchen</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Pilot"
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

        {/* Conversation */}
        <div ref={scroll} style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {thinking && <Bubble role="pilot" text="…" thinking />}
        </div>

        {/* Context strip */}
        <div
          style={{
            padding: '10px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-warm)',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: 'var(--ink-muted)',
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Try asking
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  fontSize: 11.5,
                  color: 'var(--ink-2)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid var(--line)',
            background: 'var(--paper-warm)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 8,
              background: 'var(--paper)',
              border: '1px solid var(--line)',
              borderRadius: 14,
              padding: 8,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask Pilot something about your kitchen…"
              rows={1}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13.5,
                color: 'var(--ink)',
                padding: '8px 10px',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.45,
              }}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || thinking}
              aria-label="Send message"
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: input.trim() ? 'var(--ink)' : 'var(--bg-tint)',
                color: input.trim() ? 'var(--paper-warm)' : 'var(--ink-soft)',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 160ms',
              }}
            >
              <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
