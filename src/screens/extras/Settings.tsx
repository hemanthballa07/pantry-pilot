// src/screens/extras/Settings.tsx — the routed Settings screen (profile, diet prefs,
// equipment). Split from src/screens/Extras.tsx (OQ-004 / ADR-004).
import { useState } from 'react';
import { useToastStore } from '@/stores';
import { Avatar, Button, Card, Chip, Pill } from './shared';

const fireToast = (msg: string) => useToastStore.getState().push(msg);

// ═════════════ SETTINGS (routed) ═══════════════════════════════════════════

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
      <div className="serif" style={{ fontSize: 18, color: 'var(--ink)', marginTop: 3 }}>
        {value}
      </div>
    </div>
  );
}

function DietPrefs() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    'High protein': true,
    'Budget friendly': true,
    Vegetarian: false,
    Vegan: false,
    'Gluten-free': false,
    'Dairy-free': false,
    'No pork': true,
  });
  const toggle = (k: string) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {Object.keys(prefs).map((k) => (
        <Chip key={k} active={prefs[k]} onClick={() => toggle(k)}>
          {k}
        </Chip>
      ))}
    </div>
  );
}

export function Settings() {
  const [section, setSection] = useState('Profile');
  return (
    <div
      style={{
        padding: '28px 28px 56px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: 22,
      }}
    >
      <aside>
        {[
          'Profile',
          'Preferences',
          'Equipment',
          'Notifications',
          'Household',
          'Connections',
          'Privacy',
        ].map((s) => {
          const active = section === s;
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '9px 14px',
                borderRadius: 10,
                background: active ? 'var(--paper)' : 'transparent',
                border: '1px solid',
                borderColor: active ? 'var(--line)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-muted)',
                fontSize: 13.5,
                fontWeight: active ? 600 : 500,
                marginBottom: 2,
                boxShadow: active ? 'var(--sh-1)' : 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {s}
            </button>
          );
        })}
      </aside>
      <div style={{ display: 'grid', gap: 18 }}>
        <Card pad={26}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <Avatar initials="HB" color="var(--green)" size={64} />
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 22 }}>
                Hemanth Balla
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-muted)' }}>
                hemanth@apt4b.house · Graduate student
              </div>
            </div>
            <Button
              variant="secondary"
              icon="edit"
              onClick={() => fireToast('Editing your profile')}
            >
              Edit profile
            </Button>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 14,
              padding: 16,
              background: 'var(--paper-warm)',
              borderRadius: 12,
              border: '1px solid var(--line-soft)',
            }}
          >
            <Field label="Monthly budget" value="$250" />
            <Field label="Cooking skill" value="Intermediate" />
            <Field label="Household members" value="3" />
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>
            Diet & allergies
          </div>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 600 }}
            >
              Preferences
            </div>
            <DietPrefs />
          </div>
          <div>
            <div
              style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8, fontWeight: 600 }}
            >
              Avoid
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Pill tone="tomato" size="md" icon="alert">
                Shellfish
              </Pill>
            </div>
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>
            Kitchen equipment
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { l: 'Stove', on: true },
              { l: 'Microwave', on: true },
              { l: 'Air fryer', on: true },
              { l: 'Rice cooker', on: true },
              { l: 'Oven', on: false },
              { l: 'Blender', on: false },
              { l: 'Instant Pot', on: false },
              { l: 'Grill', on: false },
              { l: 'Toaster', on: true },
              { l: 'Coffee maker', on: true },
            ].map((e) => (
              <div
                key={e.l}
                style={{
                  padding: '12px 10px',
                  borderRadius: 10,
                  textAlign: 'center',
                  background: e.on ? 'var(--green-tint)' : 'var(--paper-warm)',
                  border: `1px solid ${e.on ? 'var(--green-soft)' : 'var(--line-soft)'}`,
                  color: e.on ? 'var(--green-deep)' : 'var(--ink-soft)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600 }}>{e.l}</div>
                <div style={{ fontSize: 9.5, marginTop: 3, opacity: 0.7 }}>
                  {e.on ? 'Available' : 'Not yet'}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
