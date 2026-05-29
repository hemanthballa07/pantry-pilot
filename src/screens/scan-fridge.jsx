// screens/scan-fridge.jsx — "Photo of your fridge" flow.
//   window.PPScanFridge = { ScanFridge }
//
// Four phases:
//   1. capture   — point camera at the open fridge (ghost mock + brackets)
//   2. detecting — vision model draws bounding boxes over items one by one
//   3. review    — detected items grouped by confidence + "add what's hidden"
//   4. done      — success + eat-first summary

(function () {
  const { useState, useEffect, useMemo } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Pill, Card, Button } = window.PPUI;

  // ── Detected items, positioned on the fridge "photo" (percent coords) ─────
  const DETECTED = [
    { name: "Spinach",       illo: "spinach", box: { x: 6,  y: 12, w: 22, h: 24 }, conf: "auto",  cat: "Vegetables", expDays: 4,  qty: "1 bag" },
    { name: "Whole Milk",    illo: "milk",    box: { x: 35, y: 7,  w: 17, h: 32 }, conf: "auto",  cat: "Dairy",      expDays: 7,  qty: "½ gal" },
    { name: "Eggs",          illo: "egg",     box: { x: 62, y: 9,  w: 28, h: 21 }, conf: "auto",  cat: "Dairy",      expDays: 26, qty: "10 ct" },
    { name: "Roma Tomatoes", illo: "tomato",  box: { x: 8,  y: 58, w: 22, h: 26 }, conf: "auto",  cat: "Vegetables", expDays: 6,  qty: "4 ct" },
    { name: "Carrots",       illo: "carrot",  box: { x: 37, y: 60, w: 22, h: 24 }, conf: "guess", cat: "Vegetables", expDays: 12, qty: "1 bag",
      alternates: ["Bell peppers", "Sweet potato"] },
    { name: "Greek Yogurt",  illo: "yogurt",  box: { x: 65, y: 55, w: 25, h: 28 }, conf: "auto",  cat: "Dairy",      expDays: 18, qty: "32 oz" },
    { name: "Leftovers",     illo: "rice",    box: { x: 44, y: 40, w: 18, h: 16 }, conf: "guess", cat: "Leftovers",  expDays: 2,  qty: "1 box",
      note: "Unlabeled container", alternates: ["Cooked rice", "Pasta", "Curry"] },
  ];

  // Things commonly stocked but hard to see in a photo
  const HIDDEN = [
    { name: "Butter",        illo: "cheese", cat: "Dairy",  expDays: 60 },
    { name: "Cheddar Cheese",illo: "cheese", cat: "Dairy",  expDays: 21 },
    { name: "Sriracha",      illo: "chili",  cat: "Sauces", expDays: 365 },
  ];

  const expiryLabel = (d) => {
    if (d === 0)  return "Non-perishable";
    if (d === 1)  return "Tomorrow";
    if (d < 7)    return `${d} days`;
    if (d < 30)   return `${Math.round(d / 7)} weeks`;
    if (d < 365)  return `${Math.round(d / 30)} months`;
    return `${Math.round(d / 365)} year${d >= 730 ? "s" : ""}`;
  };
  const expiryTone = (d) => {
    if (d === 0) return "ghost";
    if (d <= 3)  return "tomato";
    if (d <= 7)  return "amber";
    return "green";
  };
  const boxColor = (conf) => conf === "auto" ? "var(--green)" : "var(--amber)";

  // ── The fridge "photo" (interior + items + optional boxes) ────────────────
  const FridgeView = ({ revealed = 0, showItems = true }) => (
    <div style={{
      position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 12,
      overflow: "hidden",
      background: "linear-gradient(180deg, #E9EFF1 0%, #CBDAE0 55%, #B3C6CE 100%)",
      boxShadow: "inset 0 0 60px rgba(40,60,70,.25)",
    }}>
      {/* Shelves */}
      {[39, 86].map((top, i) => (
        <div key={i} style={{ position: "absolute", left: "3%", right: "3%", top: `${top}%`,
                        height: 5, background: "rgba(255,255,255,.55)",
                        borderRadius: 3, boxShadow: "0 3px 6px rgba(40,60,70,.18)" }}/>
      ))}
      {/* Door bin shadow */}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 6px rgba(255,255,255,.18)" }}/>

      {/* Items */}
      {showItems && DETECTED.map((d, i) => (
        <div key={d.name} style={{
          position: "absolute", left: `${d.box.x}%`, top: `${d.box.y}%`,
          width: `${d.box.w}%`, height: `${d.box.h}%`,
          display: "grid", placeItems: "center",
        }}>
          <Illo name={d.illo} size={54}/>
        </div>
      ))}

      {/* Bounding boxes (revealed progressively) */}
      {DETECTED.slice(0, revealed).map((d, i) => (
        <div key={"box" + i} style={{
          position: "absolute", left: `${d.box.x}%`, top: `${d.box.y}%`,
          width: `${d.box.w}%`, height: `${d.box.h}%`,
          border: `2px solid ${boxColor(d.conf)}`, borderRadius: 6,
          boxShadow: `0 0 0 1px rgba(255,255,255,.4), 0 0 14px ${boxColor(d.conf)}55`,
          animation: "ppBoxIn 280ms cubic-bezier(.2,.8,.2,1)",
        }}>
          <div style={{
            position: "absolute", top: -19, left: -2,
            background: boxColor(d.conf), color: "#FDFAF3",
            fontSize: 9.5, fontWeight: 700, letterSpacing: 0.2,
            padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            {d.name}
            <span style={{ opacity: 0.85 }}>{d.conf === "auto" ? "✓" : "?"}</span>
          </div>
        </div>
      ))}
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 1 — CAPTURE
  // ═════════════════════════════════════════════════════════════════════════
  const CapturePhase = ({ onCapture, onClose }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 22, padding: "30px 32px 26px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--plum)",
                        fontWeight: 700, textTransform: "uppercase" }}>Fridge photo</div>
        <h2 className="serif" style={{ margin: "8px 0 6px", fontSize: 26, letterSpacing: -0.4 }}>
          Open your fridge. Pilot reads the shelves.
        </h2>
        <div style={{ fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.5, maxWidth: 460 }}>
          One photo. Pilot spots what's inside, estimates how fresh each thing is,
          and flags anything you've forgotten about.
        </div>
      </div>

      {/* Viewfinder */}
      <div style={{ position: "relative", width: 420, maxWidth: "100%", padding: 10,
                      background: "var(--ink)", borderRadius: 18, boxShadow: "var(--sh-lift)" }}>
        <FridgeView revealed={0}/>
        {/* Corner brackets */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h], i) => (
          <div key={i} style={{
            position: "absolute", [v]: 20, [h]: 20, width: 26, height: 26,
            [`border${v[0].toUpperCase()+v.slice(1)}`]: "3px solid var(--amber)",
            [`border${h[0].toUpperCase()+h.slice(1)}`]: "3px solid var(--amber)",
            [`border${v==="top"?"TopLeftRadius":"BottomLeftRadius"}`]: h==="left" ? 6 : 0,
          }}/>
        ))}
        <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, textAlign: "center",
                        fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5,
                        color: "rgba(253,250,243,.8)", textTransform: "uppercase",
                        textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>
          Fit the open fridge in frame
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <Button variant="primary" icon="camera" onClick={onCapture}>Take photo</Button>
        <Button variant="secondary" icon="upload" onClick={onCapture}>Upload photo</Button>
      </div>

      <div style={{ width: "100%", maxWidth: 460, padding: "14px 16px",
                      background: "var(--green-tint)", border: "1px solid var(--green-soft)",
                      borderRadius: 12, display: "flex", gap: 12 }}>
        <span style={{ color: "var(--green-deep)", flex: "0 0 auto", marginTop: 2 }}>
          <Icon name="sparkles" size={16}/>
        </span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green-deep)", marginBottom: 4 }}>
            How Pilot reads a fridge
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
            A vision model boxes each item it recognizes, then estimates freshness from
            type and typical storage life. Unlabeled containers and anything hidden, it asks about.
          </div>
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 2 — DETECTING
  // ═════════════════════════════════════════════════════════════════════════
  const DetectingPhase = ({ onDone }) => {
    const [n, setN] = useState(0);
    const total = DETECTED.length;
    useEffect(() => {
      if (n >= total) { const t = setTimeout(onDone, 650); return () => clearTimeout(t); }
      const t = setTimeout(() => setN(x => x + 1), n === 0 ? 500 : 420);
      return () => clearTimeout(t);
    }, [n, total, onDone]);

    return (
      <div style={{ padding: "26px 32px 24px", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--plum)",
                          fontWeight: 700, textTransform: "uppercase" }}>Detecting items</div>
          <h2 className="serif" style={{ margin: "6px 0", fontSize: 22, letterSpacing: -0.3 }}>
            {n >= total ? "Got it — estimating freshness…" : `${n} item${n === 1 ? "" : "s"} found…`}
          </h2>
        </div>

        <div style={{ position: "relative", width: 420, maxWidth: "100%", padding: 10,
                        background: "var(--ink)", borderRadius: 18, boxShadow: "var(--sh-lift)" }}>
          <FridgeView revealed={n}/>
          {/* Sweep */}
          {n < total && (
            <div style={{ position: "absolute", left: 10, right: 10,
                            top: `${10 + (n / total) * 78}%`, height: 3,
                            background: "linear-gradient(90deg, transparent, var(--plum), transparent)",
                            boxShadow: "0 0 14px 2px rgba(110,58,79,.6)",
                            transition: "top 380ms ease-out" }}/>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--plum)" }}><Icon name="sparkles" size={12}/></span>
          <span style={{ fontSize: 11.5, color: "var(--ink-muted)", fontWeight: 600 }}>
            {n >= total ? "Matching to your pantry…" : `Vision pass · ${Math.round((n / total) * 100)}%`}
          </span>
        </div>
      </div>
    );
  };

  // ── Review item row ───────────────────────────────────────────────────────
  const ConfidenceBadge = ({ c }) =>
    c === "auto"
      ? <Pill tone="green" size="sm" icon="check">Recognized</Pill>
      : <Pill tone="amber" size="sm" icon="alert">Needs a look</Pill>;

  const ItemRow = ({ item, checked, onToggle, onSwap }) => {
    const expanded = item.conf === "guess";
    return (
      <div style={{ background: "var(--paper)", border: "1px solid var(--line)",
                      borderLeft: item.conf === "guess" ? "3px solid var(--amber)" : "1px solid var(--line)",
                      borderRadius: 12, padding: "12px 14px",
                      opacity: checked ? 1 : 0.55, transition: "opacity 160ms" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onToggle} style={{
            width: 22, height: 22, borderRadius: 7,
            border: `1.5px solid ${checked ? "var(--green)" : "var(--line-strong)"}`,
            background: checked ? "var(--green)" : "transparent", color: "#FDFAF3",
            display: "grid", placeItems: "center", cursor: "pointer", padding: 0, flex: "0 0 auto" }}>
            {checked && <Icon name="check" size={12}/>}
          </button>
          <div style={{ width: 38, height: 38, flex: "0 0 auto", borderRadius: 9,
                          background: "var(--bg-tint)", border: "1px solid var(--line-soft)",
                          display: "grid", placeItems: "center" }}>
            <Illo name={item.illo} size={26}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{item.name}</span>
              {item.note && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--amber-ink)",
                                  background: "var(--amber-soft)", padding: "2px 7px", borderRadius: 999 }}>
                  {item.note}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 3,
                            display: "flex", gap: 8 }}>
              <span>{item.cat}</span><span>·</span><span>{item.qty}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flex: "0 0 auto" }}>
            <Pill tone={expiryTone(item.expDays)} size="sm" icon={item.expDays === 0 ? null : "timer"}>
              {expiryLabel(item.expDays)}
            </Pill>
            <ConfidenceBadge c={item.conf}/>
          </div>
        </div>
        {expanded && item.alternates && (
          <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--amber-soft)",
                          borderRadius: 9, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--amber-ink)", fontWeight: 600 }}>
              Pilot's guess — or:
            </span>
            {item.alternates.map(alt => (
              <button key={alt} onClick={() => onSwap(alt)} style={{
                padding: "4px 10px", fontSize: 11, fontWeight: 600, background: "var(--paper)",
                border: "1px solid var(--amber-line)", borderRadius: 999, color: "var(--ink-2)",
                cursor: "pointer", fontFamily: "inherit" }}>{alt}</button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Section = ({ title, count, subtitle, accent, defaultOpen, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div style={{ marginBottom: 22 }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 0 10px",
          background: "transparent", border: "none", textAlign: "left", cursor: "pointer",
          fontFamily: "inherit", borderBottom: "1px solid var(--line)" }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }}/>
          <span style={{ fontSize: 11, letterSpacing: 0.6, fontWeight: 700, color: "var(--ink)",
                            textTransform: "uppercase" }}>{title}</span>
          <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{count}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ color: "var(--ink-muted)" }}>
            <Icon name={open ? "chevronUp" : "chevronDown"} size={14}/>
          </span>
        </button>
        {subtitle && <div style={{ fontSize: 12, color: "var(--ink-muted)", margin: "10px 0 12px" }}>{subtitle}</div>}
        {open && children}
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 3 — REVIEW
  // ═════════════════════════════════════════════════════════════════════════
  const ReviewPhase = ({ onConfirm, onClose }) => {
    const [items, setItems] = useState(DETECTED.map(d => ({ ...d, _checked: true })));
    const [added, setAdded] = useState(() => new Set()); // hidden items added

    const toggle = (i) => setItems(arr => arr.map((it, idx) => idx === i ? { ...it, _checked: !it._checked } : it));
    const swap = (i, alt) => setItems(arr => arr.map((it, idx) =>
      idx === i ? { ...it, name: alt, conf: "auto", note: undefined } : it));

    const auto  = items.map((it, i) => ({ ...it, _i: i })).filter(it => it.conf === "auto");
    const guess = items.map((it, i) => ({ ...it, _i: i })).filter(it => it.conf === "guess");
    const confirmCount = items.filter(it => it._checked).length + added.size;

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid var(--line)",
                        background: "var(--paper-warm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "#EDE2EA",
                            color: "var(--plum)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              <Icon name="camera" size={22}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>What Pilot saw</div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ink)", marginTop: 3, letterSpacing: -0.3 }}>
                {items.length} items detected
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12, color: "var(--ink-muted)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--green)" }}/>
                  {auto.length} recognized
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--amber)" }}/>
                  {guess.length} need a look
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 28px 100px", background: "var(--bg)" }}>
          {guess.length > 0 && (
            <Section title="Needs a look" count={guess.length}
                     subtitle="Pilot isn't sure — confirm or swap before saving." accent="var(--amber)" defaultOpen>
              <div style={{ display: "grid", gap: 10 }}>
                {guess.map(it => (
                  <ItemRow key={it._i} item={it} checked={it._checked}
                            onToggle={() => toggle(it._i)} onSwap={(alt) => swap(it._i, alt)}/>
                ))}
              </div>
            </Section>
          )}

          <Section title="Recognized" count={auto.length}
                   subtitle="High-confidence matches — freshness estimated from type." accent="var(--green)" defaultOpen>
            <div style={{ display: "grid", gap: 8 }}>
              {auto.map(it => (
                <ItemRow key={it._i} item={it} checked={it._checked} onToggle={() => toggle(it._i)}/>
              ))}
            </div>
          </Section>

          {/* Hidden / can't-see suggestions */}
          <Section title="Pilot can't see these" count={HIDDEN.length}
                   subtitle="Often stocked but hidden in a photo. Tap to add if you have them." accent="var(--sky)" defaultOpen>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {HIDDEN.map(h => {
                const on = added.has(h.name);
                return (
                  <button key={h.name} onClick={() => setAdded(s => {
                    const n = new Set(s); on ? n.delete(h.name) : n.add(h.name); return n;
                  })} style={{
                    display: "inline-flex", alignItems: "center", gap: 8, height: 40,
                    padding: "0 14px 0 8px", borderRadius: 999,
                    background: on ? "var(--green)" : "var(--paper)",
                    color: on ? "#FDFAF3" : "var(--ink-2)",
                    border: `1px solid ${on ? "var(--green)" : "var(--line)"}`,
                    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    <span style={{ width: 26, height: 26, borderRadius: 999,
                                     background: on ? "rgba(255,255,255,.18)" : "var(--bg-tint)",
                                     display: "grid", placeItems: "center" }}>
                      <Illo name={h.illo} size={18}/>
                    </span>
                    {h.name}
                    <Icon name={on ? "check" : "plus"} size={13}/>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--line)",
                        background: "var(--paper-warm)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Ready to save</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
              {confirmCount} items will be added to your pantry
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" iconRight="arrowRight" size="lg"
                  onClick={() => onConfirm(items.filter(it => it._checked))}>
            Add {confirmCount} to pantry
          </Button>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 4 — DONE
  // ═════════════════════════════════════════════════════════════════════════
  const DonePhase = ({ items, onViewPantry, onClose }) => {
    const soon = items.filter(it => it.expDays > 0 && it.expDays <= 7);
    return (
      <div style={{ padding: "44px 32px 28px", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 22, textAlign: "center" }}>
        <div style={{ width: 88, height: 88, borderRadius: 999, background: "var(--green-tint)",
                        border: "3px solid var(--green)", display: "grid", placeItems: "center",
                        color: "var(--green-deep)", animation: "ppPop 320ms ease-out" }}>
          <Icon name="check" size={44}/>
        </div>
        <div>
          <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
            Pantry updated · {items.length} items added
          </h2>
          <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Pilot's watching freshness now and will nudge you before anything turns.
          </div>
        </div>
        {soon.length > 0 && (
          <Card pad={18} style={{ width: "100%", maxWidth: 460, background: "var(--amber-soft)",
                                    borderColor: "var(--amber-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ color: "var(--amber-ink)" }}><Icon name="alert" size={14}/></span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber-ink)",
                                textTransform: "uppercase", letterSpacing: 0.5 }}>Eat first</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {soon.map(it => (
                <div key={it.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--on-tint-pad)",
                                  display: "grid", placeItems: "center" }}>
                    <Illo name={it.illo} size={22}/>
                  </div>
                  <div style={{ flex: 1, textAlign: "left", fontSize: 13, color: "var(--ink-2)" }}>{it.name}</div>
                  <Pill tone={expiryTone(it.expDays)} size="sm">{expiryLabel(it.expDays)}</Pill>
                </div>
              ))}
            </div>
          </Card>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="secondary" onClick={onClose}>Done</Button>
          <Button variant="primary" iconRight="arrowRight" onClick={onViewPantry}>View pantry</Button>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Top-level overlay
  // ═════════════════════════════════════════════════════════════════════════
  const ScanFridge = ({ onClose, onPushToast, onNav }) => {
    const [phase, setPhase] = useState("capture");
    const [confirmed, setConfirmed] = useState([]);
    const phases = ["capture", "detecting", "review", "done"];

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
      <div className="pp-overlay" style={{ alignItems: "stretch", justifyContent: "stretch",
                                              padding: "5vh 5vw", overflow: "hidden" }}>
        <style>{`@keyframes ppBoxIn { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }`}</style>
        <div style={{ width: "100%", maxWidth: 880, margin: "0 auto", background: "var(--paper)",
                        border: "1px solid var(--line)", borderRadius: 22, boxShadow: "var(--sh-lift)",
                        display: "flex", flexDirection: "column", minHeight: 0, maxHeight: "90vh",
                        overflow: "hidden", animation: "ppPop 220ms ease-out" }}>
          {/* Header */}
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center",
                          justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)",
                          background: "var(--paper-warm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--plum)" }}><Icon name="camera" size={16}/></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Photo of fridge</span>
              <span style={{ marginLeft: 14, display: "flex", gap: 4 }}>
                {phases.map(p => (
                  <span key={p} style={{ width: phase === p ? 22 : 6, height: 6, borderRadius: 999,
                              background: phases.indexOf(p) <= phases.indexOf(phase)
                                        ? "var(--plum)" : "var(--line-strong)",
                              transition: "width 200ms ease, background 200ms ease" }}/>
                ))}
              </span>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, display: "grid", placeItems: "center",
                            background: "transparent", border: "none", color: "var(--ink-muted)",
                            borderRadius: 8, cursor: "pointer" }}>
              <Icon name="close" size={16}/>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0,
                          display: phase === "review" ? "flex" : "block", flexDirection: "column" }}>
            {phase === "capture"   && <CapturePhase onCapture={() => setPhase("detecting")} onClose={onClose}/>}
            {phase === "detecting" && <DetectingPhase onDone={() => setPhase("review")}/>}
            {phase === "review"    && (
              <ReviewPhase onClose={onClose}
                onConfirm={(items) => {
                  setConfirmed(items);
                  setPhase("done");
                  onPushToast?.(`${items.length} items added to pantry`, { icon: "check" });
                }}/>
            )}
            {phase === "done"      && (
              <DonePhase items={confirmed} onClose={onClose}
                          onViewPantry={() => { onNav?.("pantry"); onClose(); }}/>
            )}
          </div>
        </div>
      </div>
    );
  };

  window.PPScanFridge = { ScanFridge };
})();
