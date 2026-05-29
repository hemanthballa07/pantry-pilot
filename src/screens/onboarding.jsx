// screens/onboarding.jsx — First-run cold start. window.PPOnboarding = { Onboarding }
//   Four steps: Welcome → Taste & budget → Stock the pantry → Payoff.
//   The "connect grocery account" path is the magic cold-start: it imports a
//   starter pantry in seconds so the user never faces an empty app.

(function () {
  const { useState, useEffect } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Pill, Card, Button } = window.PPUI;
  const D = window.PP_DATA;

  const STEPS = ["Welcome", "Your taste", "Stock pantry", "Ready"];

  // ── selectable chip ───────────────────────────────────────────────────────
  const Choice = ({ active, onClick, children, icon }) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 8, height: 42,
      padding: "0 16px", borderRadius: 999,
      background: active ? "var(--ink)" : "var(--paper)",
      color: active ? "var(--paper-warm)" : "var(--ink-2)",
      border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
      fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
      transition: "all 160ms ease",
    }}>
      {icon && <Icon name={icon} size={14}/>}
      {children}
    </button>
  );

  const FieldLabel = ({ n, title, sub }) => (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <span className="serif tnum" style={{ fontSize: 12, color: "var(--green-deep)", fontWeight: 700,
                        background: "var(--green-tint)", padding: "2px 9px", borderRadius: 8,
                        border: "1px solid var(--green-soft)" }}>{String(n).padStart(2, "0")}</span>
        <h3 className="serif" style={{ margin: 0, fontSize: 20, letterSpacing: -0.3, color: "var(--ink)" }}>{title}</h3>
      </div>
      {sub && <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, marginLeft: 42 }}>{sub}</div>}
    </div>
  );

  // ═══════════════════════ Step 1 — Welcome ═══════════════════════
  const WelcomeStep = ({ p, set }) => (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <FieldLabel n={1} title="What should Pilot call you?"/>
        <input value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Your name"
               style={{ width: "100%", maxWidth: 360, height: 50, padding: "0 16px",
                          border: "1px solid var(--line)", borderRadius: 12, background: "var(--paper)",
                          fontSize: 16, color: "var(--ink)", fontFamily: "inherit" }}/>
      </div>
      <div>
        <FieldLabel n={2} title="Who's in this kitchen?" sub="Pilot scales recipes and splits the grocery list to match."/>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 42 }}>
          {[["solo", "Just me", "user"], ["roommates", "Roommates", "users"], ["family", "Family", "house"]].map(([k, l, ic]) => (
            <Choice key={k} active={p.household === k} icon={ic} onClick={() => set({ household: k })}>{l}</Choice>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel n={3} title="How many people are you usually cooking for?"/>
        <div style={{ display: "flex", gap: 8, marginLeft: 42 }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => set({ size: n })} style={{
              width: 50, height: 50, borderRadius: 12,
              background: p.size === n ? "var(--ink)" : "var(--paper-warm)",
              color: p.size === n ? "var(--paper-warm)" : "var(--ink-2)",
              border: `1px solid ${p.size === n ? "var(--ink)" : "var(--line)"}`,
              fontSize: 18, fontWeight: 600, fontFamily: "var(--font-display)", cursor: "pointer",
            }}>{n}</button>
          ))}
        </div>
      </div>
    </div>
  );

  // ═══════════════════════ Step 2 — Taste & budget ═══════════════════════
  const TasteStep = ({ p, set, toggleDiet }) => (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <FieldLabel n={1} title="Any diet preferences?" sub="Pick any that apply — Pilot filters recipes to match."/>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 42 }}>
          {["Vegetarian", "Vegan", "High-protein", "Budget-first", "Gluten-free", "No pork"].map(d => (
            <Choice key={d} active={p.diet.includes(d)} onClick={() => toggleDiet(d)}>{d}</Choice>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel n={2} title="How much heat do you like?"/>
        <div style={{ display: "flex", gap: 8, marginLeft: 42 }}>
          {[["mild", "Mild"], ["medium", "Medium"], ["spicy", "Spicy"], ["extra", "Extra"]].map(([k, l], i) => (
            <Choice key={k} active={p.spice === k} onClick={() => set({ spice: k })}>
              <span style={{ display: "inline-flex", color: p.spice === k ? "var(--amber)" : "var(--tomato)" }}>
                <Icon name="flame" size={13}/>
              </span>{l}
            </Choice>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel n={3} title="Weekly grocery budget?" sub="Pilot keeps your plan and basket under this number."/>
        <div style={{ marginLeft: 42, maxWidth: 460 }}>
          <div className="serif tnum" style={{ fontSize: 34, color: "var(--ink)", marginBottom: 6 }}>
            ${p.budget}<span style={{ fontSize: 15, color: "var(--ink-muted)" }}> / week</span>
          </div>
          <input type="range" min={30} max={200} step={5} value={p.budget}
                 onChange={(e) => set({ budget: +e.target.value })}
                 style={{ width: "100%", accentColor: "var(--green)" }}/>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--ink-soft)" }}>
            <span>$30</span><span>$200</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ═══════════════════════ Step 3 — Stock the pantry ═══════════════════════
  const RETAILERS = [
    { id: "kroger", name: "Kroger", color: "#0C5499", count: 18 },
    { id: "walmart", name: "Walmart", color: "#0071CE", count: 22 },
    { id: "costco", name: "Costco", color: "#E31837", count: 14 },
    { id: "aldi", name: "Aldi", color: "#FF7300", count: 16 },
  ];

  const PantryStep = ({ p, set }) => {
    const [importing, setImporting] = useState(false);
    const [revealed, setRevealed] = useState(0);
    const starter = D.items.slice(0, 16);

    const connect = (r) => {
      set({ retailer: r.id });
      setImporting(true);
      setRevealed(0);
    };
    useEffect(() => {
      if (!importing) return;
      if (revealed >= starter.length) { set({ imported: starter.length }); return; }
      const t = setTimeout(() => setRevealed(x => x + 1), revealed === 0 ? 500 : 90);
      return () => clearTimeout(t);
    }, [importing, revealed]);

    if (importing) {
      const done = revealed >= starter.length;
      const r = RETAILERS.find(x => x.id === p.retailer);
      return (
        <div style={{ display: "grid", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--green-tint)",
                            color: "var(--green-deep)", display: "grid", placeItems: "center" }}>
              <Icon name={done ? "check" : "sparkles"} size={20}/>
            </div>
            <div>
              <div className="serif" style={{ fontSize: 20, color: "var(--ink)" }}>
                {done ? `Imported ${starter.length} items from ${r?.name}` : `Reading your ${r?.name} purchase history…`}
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                {done ? "Expiry estimated from category averages. Edit anything later."
                       : `${revealed} of ${starter.length} items · matched to your pantry`}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
            {starter.map((it, i) => (
              <div key={it.id} style={{
                aspectRatio: "1/1", borderRadius: 10, background: "var(--paper-warm)",
                border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                opacity: i < revealed ? 1 : 0.12,
                transform: i < revealed ? "scale(1)" : "scale(0.9)",
                transition: "opacity 220ms ease, transform 220ms ease",
              }} title={it.name}>
                <Illo name={it.illo} size={30}/>
              </div>
            ))}
          </div>
          {done && (
            <button onClick={() => { setImporting(false); }} style={{
              justifySelf: "start", background: "transparent", border: "none", cursor: "pointer",
              color: "var(--ink-muted)", fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <Icon name="chevronLeft" size={13}/> Try a different source
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div>
          <FieldLabel n={1} title="Connect a grocery account" sub="The fastest start — Pilot imports what you've been buying. No typing."/>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginLeft: 42, maxWidth: 520 }}>
            {RETAILERS.map(r => (
              <button key={r.id} onClick={() => connect(r)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: r.color,
                                color: "#fff", display: "grid", placeItems: "center", fontWeight: 700,
                                fontSize: 15, flex: "0 0 auto" }}>{r.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{r.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>~{r.count} recent items</div>
                </div>
                <Icon name="arrowRight" size={15} stroke="var(--ink-soft)"/>
              </button>
            ))}
          </div>
        </div>
        <div>
          <FieldLabel n={2} title="Or capture it yourself" sub="Pilot reads receipts, barcodes, and fridge photos."/>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: 42 }}>
            {[["receipt", "Scan a receipt", "receipt"], ["fridge", "Photo of fridge", "camera"], ["barcode", "Scan barcodes", "barcode"]].map(([k, l, ic]) => (
              <Choice key={k} icon={ic} onClick={() => window.PPCapture?.(k)}>{l}</Choice>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════ Step 4 — Payoff ═══════════════════════
  const PayoffStep = ({ p }) => {
    const tonight = [...D.recipes].sort((a, b) => b.match - a.match).slice(0, 3);
    const expiring = D.items.filter(i => ["today", "tomorrow"].includes(i.status)).slice(0, 3);
    const illoFor = (r) => /rice/i.test(r.name) ? "rice" : /pasta/i.test(r.name) ? "pasta"
                          : /bean|chana/i.test(r.name) ? "beans" : /egg|omelette|curry/i.test(r.name) ? "egg"
                          : /tofu/i.test(r.name) ? "tofu" : /yogurt|parfait/i.test(r.name) ? "yogurt" : "rice";
    return (
      <div style={{ display: "grid", gap: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--green-tint)",
                          border: "3px solid var(--green)", color: "var(--green-deep)",
                          display: "grid", placeItems: "center", animation: "ppPop 320ms ease-out" }}>
            <Icon name="check" size={36}/>
          </div>
          <div>
            <h2 className="serif" style={{ margin: 0, fontSize: 30, letterSpacing: -0.5 }}>
              Your kitchen is ready{p.name ? `, ${p.name.split(" ")[0]}` : ""}.
            </h2>
            <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 4 }}>
              {p.imported || 16} items stocked · cooking for {p.size} · ${p.budget}/week budget set.
            </div>
          </div>
        </div>

        <Card pad={20} style={{ background: "var(--ink)", color: "var(--paper-warm)", borderColor: "var(--ink)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ color: "var(--amber)" }}><Icon name="sparkles" size={14}/></span>
            <span style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                              fontWeight: 700, textTransform: "uppercase" }}>Pilot's first read</span>
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.55, color: "var(--paper-warm)" }}>
            You can cook <strong>{tonight.length} meals tonight</strong> without shopping
            {expiring.length > 0 && <> — and your <strong style={{ color: "var(--amber)" }}>{expiring.map(e => e.name.toLowerCase()).join(", ")}</strong> {expiring.length === 1 ? "needs" : "need"} using first.</>}
          </div>
        </Card>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
            Cook these tonight
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {tonight.map(r => (
              <div key={r.id} style={{ background: "var(--paper)", border: "1px solid var(--line)",
                              borderRadius: 14, overflow: "hidden" }}>
                <div style={{ height: 76, background: `linear-gradient(135deg, ${r.tone}E6, ${r.tone}99)`,
                                display: "grid", placeItems: "center", position: "relative" }}>
                  <Illo name={illoFor(r)} size={42}/>
                  <div style={{ position: "absolute", top: 8, left: 8 }}>
                    <Pill tone="ink" size="sm">{r.match}%</Pill>
                  </div>
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 3 }}>{r.time} min · ${r.cost.toFixed(2)}/srv</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ═══════════════════════ Shell ═══════════════════════
  const Onboarding = ({ onFinish }) => {
    const [step, setStep] = useState(0);
    const [p, setP] = useState({
      name: "Hemanth", household: "roommates", size: 2,
      diet: ["High-protein", "Budget-first"], spice: "medium", budget: 60,
      retailer: null, imported: 0,
    });
    const set = (patch) => setP(prev => ({ ...prev, ...patch }));
    const toggleDiet = (d) => setP(prev => ({ ...prev,
      diet: prev.diet.includes(d) ? prev.diet.filter(x => x !== d) : [...prev.diet, d] }));

    const last = STEPS.length - 1;
    const next = () => step < last ? setStep(s => s + 1) : onFinish();
    const back = () => setStep(s => Math.max(0, s - 1));

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 75, background: "var(--bg)",
                      display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 16,
                        borderBottom: "1px solid var(--line)", background: "var(--paper-warm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--green-deep)" }}><Icon name="sparkles" size={16}/></span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Set up your kitchen</span>
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 6 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: i === step ? 22 : 7, height: 7, borderRadius: 999,
                              background: i <= step ? "var(--green)" : "var(--line-strong)",
                              transition: "width 220ms ease, background 220ms ease" }}/>
              </div>
            ))}
          </div>
          <button onClick={onFinish} style={{ background: "transparent", border: "none",
                          color: "var(--ink-muted)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                          fontFamily: "inherit" }}>Skip setup</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 28px 28px" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
              Step {step + 1} of {STEPS.length} · {STEPS[step]}
            </div>
            <h1 className="serif" style={{ margin: "0 0 28px", fontSize: 32, letterSpacing: -0.6, lineHeight: 1.1 }}>
              {["Welcome to PantryPilot.", "Tell Pilot what you like.", "Let's stock your pantry.", "You're all set."][step]}
            </h1>
            {step === 0 && <WelcomeStep p={p} set={set}/>}
            {step === 1 && <TasteStep p={p} set={set} toggleDiet={toggleDiet}/>}
            {step === 2 && <PantryStep p={p} set={set}/>}
            {step === 3 && <PayoffStep p={p}/>}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--line)", background: "var(--paper-warm)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ opacity: step === 0 ? 0 : 1, pointerEvents: step === 0 ? "none" : "auto" }}>
              <Button variant="ghost" icon="chevronLeft" onClick={back}>Back</Button>
            </div>
            <div style={{ flex: 1 }}/>
            <Button variant="primary" size="lg" iconRight={step === last ? "arrowRight" : "arrowRight"} onClick={next}>
              {step === last ? "Enter my kitchen" : "Continue"}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  window.PPOnboarding = { Onboarding };
})();
