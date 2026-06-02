// src/screens/extras/Household.tsx — the routed Household screen (roommates, shared shelf,
// activity). Split from src/screens/Extras.tsx (OQ-004 / ADR-004).
import { useNavigate } from 'react-router-dom';
import { mock } from '@/data/mock';
import { useToastStore } from '@/stores';
import { ActivityRow, Avatar, AvatarStack, Button, Card, Illo, Pill } from './shared';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ═════════════ HOUSEHOLD (routed) ══════════════════════════════════════════

export function Household() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '28px 28px 56px', display: 'grid', gap: 18 }}>
      <Card pad={26}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <AvatarStack people={mock.household} size={48} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 0.6,
                color: 'var(--ink-muted)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Apartment 4B
            </div>
            <h2 className="serif" style={{ margin: '6px 0 0', fontSize: 26, letterSpacing: -0.4 }}>
              Three roommates, one shared pantry.
            </h2>
            <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 4 }}>
              12 shared items · $254 spent together this month · 0 duplicate-buy mishaps.
            </div>
          </div>
          <Button
            variant="primary"
            icon="plus"
            onClick={() => fireToast('Invite link copied to clipboard')}
          >
            Invite a roommate
          </Button>
        </div>
      </Card>

      {/* Members */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {mock.household.map((p) => (
          <Card key={p.id} pad={22}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar initials={p.initials} color={p.color} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)' }}>{p.role}</div>
              </div>
              <Pill tone="green" size="sm" dot>
                Online
              </Pill>
            </div>
            <div
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}
            >
              <div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}
                >
                  {p.added}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  items added
                </div>
              </div>
              <div>
                <div
                  className="serif tnum"
                  style={{ fontSize: 22, color: 'var(--ink)', lineHeight: 1 }}
                >
                  ${p.spent.toFixed(0)}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 2 }}>
                  spent this month
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Shared pantry preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 18 }}>
        <Card pad={22}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span className="serif" style={{ fontSize: 18 }}>
              Shared shelf · 12 items
            </span>
            <Button
              variant="ghost"
              size="sm"
              iconRight="chevronRight"
              onClick={() => navigate('/pantry')}
            >
              Open pantry
            </Button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {mock.items
              .filter((i) => i.owner === 'Shared')
              .slice(0, 8)
              .map((it) => (
                <div
                  key={it.id}
                  style={{
                    padding: 12,
                    background: 'var(--paper-warm)',
                    border: '1px solid var(--line-soft)',
                    borderRadius: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Illo name={it.illo} size={36} />
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    {it.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink-muted)' }}>
                    {it.qty.split(' ')[0]}
                  </div>
                </div>
              ))}
          </div>
        </Card>
        <Card pad={22}>
          <span className="serif" style={{ fontSize: 18 }}>
            Activity
          </span>
          <div style={{ marginTop: 10 }}>
            {mock.activity.slice(0, 6).map((a, i) => (
              <ActivityRow key={i} act={a} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
