// screens/scan-barcode.jsx — Barcode scan flow (continuous scanner).
//   window.PPScanBarcode = { ScanBarcode }
//
// Three phases:
//   1. scan   — live viewfinder; "scan" pulls the next product into a running tray
//   2. review — editable tray (qty, expiry, category) before saving
//   3. done   — success + eat-first summary

(function () {
  const { useState, useEffect, useMemo } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Pill, Card, Button } = window.PPUI;

  // ── Sample catalog: each "scan" reveals the next product ──────────────────
  const CATALOG = [
    { upc: "894700010045", name: "Greek Yogurt", brand: "Chobani",  size: "32 oz",  illo: "yogurt",       cat: "Dairy",       expDays: 24,  kcal: 90,  price: 5.49 },
    { upc: "076808500011", name: "Spaghetti",    brand: "Barilla",  size: "16 oz",  illo: "pasta",        cat: "Grains",      expDays: 540, kcal: 200, price: 1.99 },
    { upc: "037600105019", name: "Peanut Butter",brand: "Skippy",   size: "16 oz",  illo: "peanutbutter", cat: "Sauces",      expDays: 240, kcal: 190, price: 3.99 },
    { upc: "024000162834", name: "Lactaid Milk", brand: "Lactaid",  size: "½ gal",  illo: "milk",         cat: "Dairy",       expDays: 9,   kcal: 130, price: 4.29 },
    { upc: "030000010600", name: "Rolled Oats",  brand: "Quaker",   size: "18 oz",  illo: "oats",         cat: "Grains",      expDays: 300, kcal: 150, price: 3.29 },
    { upc: "024463061071", name: "Sriracha",     brand: "Huy Fong", size: "17 oz",  illo: "chili",        cat: "Sauces",      expDays: 365, kcal: 5,   price: 3.99 },
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

  // ── A drawn barcode (variable-width bars) ─────────────────────────────────
  const Barcode = ({ seed = "", color = "var(--ink)", height = 54 }) => {
    const widths = useMemo(() => {
      // deterministic pseudo-random bar widths from the seed
      let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const bars = [];
      for (let i = 0; i < 34; i++) { h = (h * 1103515245 + 12345) >>> 0; bars.push(1 + (h % 4)); }
      return bars;
    }, [seed]);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
        {widths.map((w, i) => (
          <div key={i} style={{ width: w, height: i % 7 === 0 ? height : height - 6,
                                  background: i % 2 ? "transparent" : color, borderRadius: 0 }}/>
        ))}
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 1 — SCAN (viewfinder + running tray)
  // ═════════════════════════════════════════════════════════════════════════
  const ScanPhase = ({ tray, setTray, onReview, onClose }) => {
    const [decoding, setDecoding] = useState(false);
    const [flash, setFlash] = useState(null);   // product just found
    const nextIdx = tray.length;
    const done = nextIdx >= CATALOG.length;

    const scanNext = () => {
      if (decoding || done) return;
      setDecoding(true);
      setTimeout(() => {
        const p = CATALOG[nextIdx];
        setFlash(p);
        setTray(t => [...t, { ...p, qty: 1 }]);
        setDecoding(false);
        setTimeout(() => setFlash(f => (f === p ? null : f)), 1100);
      }, 700);
    };

    const setQty = (i, d) =>
      setTray(t => t.map((it, idx) => idx === i ? { ...it, qty: Math.max(1, it.qty + d) } : it));
    const remove = (i) => setTray(t => t.filter((_, idx) => idx !== i));

    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 0, minHeight: 0, height: "100%" }}>
        {/* Viewfinder */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                        gap: 18, padding: "26px 26px 22px", borderRight: "1px solid var(--line)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--sky-ink)",
                            fontWeight: 700, textTransform: "uppercase" }}>Barcode scan</div>
            <h2 className="serif" style={{ margin: "8px 0 4px", fontSize: 23, letterSpacing: -0.3 }}>
              Scan packaged items one by one.
            </h2>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, maxWidth: 380 }}>
              Pilot looks up the product database for name, brand, size, nutrition, and shelf life.
            </div>
          </div>

          {/* Camera frame */}
          <div style={{ position: "relative", width: 340, height: 250, background: "var(--ink)",
                          borderRadius: 16, overflow: "hidden", boxShadow: "var(--sh-lift)" }}>
            {/* Reticle brackets */}
            <div style={{ position: "absolute", inset: "38px 40px",
                            border: "2px solid rgba(253,250,243,.25)", borderRadius: 10 }}/>
            {/* The barcode being aimed at */}
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ background: "#FBF6E8", padding: "16px 20px 10px", borderRadius: 6,
                              transform: "rotate(-1.5deg)", boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}>
                <Barcode seed={done ? "done" : CATALOG[nextIdx].upc} height={56}/>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#3B342A",
                                textAlign: "center", marginTop: 6, letterSpacing: 2 }}>
                  {done ? "— — — — —" : CATALOG[nextIdx].upc}
                </div>
              </div>
            </div>
            {/* Laser line */}
            {!done && (
              <div style={{ position: "absolute", left: 40, right: 40, top: "50%",
                              height: 2, background: "var(--tomato)",
                              boxShadow: "0 0 12px 2px rgba(199,62,46,.7)",
                              animation: "ppBarLaser 1.8s ease-in-out infinite" }}/>
            )}
            {/* Decoding shimmer */}
            {decoding && (
              <div style={{ position: "absolute", inset: 0, background: "rgba(122,162,192,.18)",
                              display: "grid", placeItems: "center" }}>
                <Pill tone="sky" size="md" icon="barcode">Decoding…</Pill>
              </div>
            )}
            {/* Found flash card */}
            {flash && !decoding && (
              <div style={{ position: "absolute", left: 14, right: 14, bottom: 14,
                              background: "var(--paper)", borderRadius: 12, padding: "10px 12px",
                              display: "flex", alignItems: "center", gap: 10, boxShadow: "var(--sh-2)",
                              animation: "ppPop 240ms ease-out" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-tint)",
                                display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Illo name={flash.illo} size={24}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{flash.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{flash.brand} · {flash.size}</div>
                </div>
                <span style={{ color: "var(--green)" }}><Icon name="checkCircle" size={20}/></span>
              </div>
            )}
            <div style={{ position: "absolute", top: 12, left: 0, right: 0, textAlign: "center",
                            fontSize: 10.5, fontWeight: 600, letterSpacing: 0.5,
                            color: "rgba(253,250,243,.6)", textTransform: "uppercase" }}>
              {done ? "All sample items scanned" : "Align the barcode in frame"}
            </div>
          </div>

          <Button variant="primary" icon="barcode" size="lg"
                  onClick={scanNext} disabled={done || decoding}>
            {done ? "Nothing left to scan" : decoding ? "Decoding…" : nextIdx === 0 ? "Scan an item" : "Scan next item"}
          </Button>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
            Demo · each tap reveals the next sample product
          </div>
        </div>

        {/* Tray */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0,
                        background: "var(--bg)" }}>
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Scanned</div>
            <div className="serif" style={{ fontSize: 20, color: "var(--ink)", marginTop: 2 }}>
              {tray.length} {tray.length === 1 ? "item" : "items"}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "grid", gap: 8,
                          alignContent: "start" }}>
            {tray.length === 0 && (
              <div style={{ textAlign: "center", color: "var(--ink-soft)", padding: "40px 16px" }}>
                <div style={{ opacity: 0.5, marginBottom: 10 }}><Icon name="barcode" size={34}/></div>
                <div style={{ fontSize: 13 }}>Scan your first item to build the batch.</div>
              </div>
            )}
            {tray.map((it, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10,
                              background: "var(--paper)", border: "1px solid var(--line)",
                              borderRadius: 11, padding: "9px 10px", animation: "ppPop 200ms ease-out" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-tint)",
                                border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                                flex: "0 0 auto" }}>
                  <Illo name={it.illo} size={24}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {it.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>{it.brand} · {it.size}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 0 auto" }}>
                  <button onClick={() => setQty(i, -1)} style={qtyBtn}>−</button>
                  <span className="tnum" style={{ minWidth: 18, textAlign: "center", fontSize: 13,
                                                      fontWeight: 600, color: "var(--ink-2)" }}>{it.qty}</span>
                  <button onClick={() => setQty(i, 1)} style={qtyBtn}>+</button>
                </div>
                <button onClick={() => remove(i)} style={{ ...qtyBtn, color: "var(--ink-soft)" }}>
                  <Icon name="trash" size={13}/>
                </button>
              </div>
            ))}
          </div>
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--line)",
                          background: "var(--paper-warm)", display: "flex", gap: 10 }}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button variant="primary" iconRight="arrowRight" full
                    onClick={onReview} disabled={tray.length === 0}>
              Review {tray.length || ""}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 2 — REVIEW
  // ═════════════════════════════════════════════════════════════════════════
  const ReviewPhase = ({ tray, setTray, onConfirm, onBack }) => {
    const totalUnits = tray.reduce((s, it) => s + it.qty, 0);
    const totalCost  = tray.reduce((s, it) => s + it.qty * it.price, 0);

    const setQty = (i, d) =>
      setTray(t => t.map((it, idx) => idx === i ? { ...it, qty: Math.max(1, it.qty + d) } : it));

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <div style={{ padding: "22px 28px 16px", borderBottom: "1px solid var(--line)",
                        background: "var(--paper-warm)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "#E4EDF3",
                            color: "var(--sky-ink)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              <Icon name="barcode" size={22}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>Confirm your batch</div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ink)", marginTop: 3, letterSpacing: -0.3 }}>
                {tray.length} products · {totalUnits} units · <span className="tnum">${totalCost.toFixed(2)}</span>
              </div>
            </div>
            <Pill tone="green" size="md" icon="check">Matched in catalog</Pill>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 28px 90px", background: "var(--bg)",
                        display: "grid", gap: 10 }}>
          {tray.map((it, i) => (
            <Card key={i} pad={14}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, background: "var(--bg-tint)",
                                border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                                flex: "0 0 auto" }}>
                  <Illo name={it.illo} size={32}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>
                    {it.name} <span style={{ color: "var(--ink-soft)", fontWeight: 500 }}>· {it.brand}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 3,
                                  display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{it.upc}</span>
                    <span>·</span><span>{it.cat}</span>
                    <span>·</span><span>{it.size}</span>
                    <span>·</span><span className="tnum">{it.kcal} cal</span>
                  </div>
                </div>
                <Pill tone={expiryTone(it.expDays)} size="sm" icon={it.expDays === 0 ? null : "timer"}>
                  {expiryLabel(it.expDays)}
                </Pill>
                <div style={{ display: "flex", alignItems: "center", gap: 2, flex: "0 0 auto" }}>
                  <button onClick={() => setQty(i, -1)} style={qtyBtn}>−</button>
                  <span className="tnum" style={{ minWidth: 20, textAlign: "center", fontSize: 14,
                                                      fontWeight: 600, color: "var(--ink-2)" }}>{it.qty}</span>
                  <button onClick={() => setQty(i, 1)} style={qtyBtn}>+</button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--line)",
                        background: "var(--paper-warm)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Shelf life estimated</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
              From product category averages — edit any item after saving.
            </div>
          </div>
          <Button variant="ghost" icon="chevronLeft" onClick={onBack}>Scan more</Button>
          <Button variant="primary" iconRight="arrowRight" size="lg" onClick={() => onConfirm(tray)}>
            Add {totalUnits} to pantry
          </Button>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 3 — DONE
  // ═════════════════════════════════════════════════════════════════════════
  const DonePhase = ({ tray, onViewPantry, onClose }) => {
    const soon = tray.filter(it => it.expDays > 0 && it.expDays <= 9);
    const units = tray.reduce((s, it) => s + it.qty, 0);
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
            {units} units added to your pantry
          </h2>
          <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Nutrition and shelf life came straight from the product database. Pilot's tracking them now.
          </div>
        </div>
        {soon.length > 0 && (
          <Card pad={18} style={{ width: "100%", maxWidth: 460, background: "var(--amber-soft)",
                                    borderColor: "var(--amber-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ color: "var(--amber-ink)" }}><Icon name="alert" size={14}/></span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber-ink)",
                                textTransform: "uppercase", letterSpacing: 0.5 }}>Use soon</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {soon.map(it => (
                <div key={it.upc} style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
  const ScanBarcode = ({ onClose, onPushToast, onNav }) => {
    const [phase, setPhase] = useState("scan");
    const [tray, setTray] = useState([]);

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const phases = ["scan", "review", "done"];

    return (
      <div className="pp-overlay" style={{ alignItems: "stretch", justifyContent: "stretch",
                                              padding: "5vh 5vw", overflow: "hidden" }}>
        <style>{`@keyframes ppBarLaser { 0%,100% { transform: translateY(-70px); } 50% { transform: translateY(70px); } }`}</style>
        <div style={{ width: "100%", maxWidth: 880, margin: "0 auto", background: "var(--paper)",
                        border: "1px solid var(--line)", borderRadius: 22, boxShadow: "var(--sh-lift)",
                        display: "flex", flexDirection: "column", minHeight: 0, maxHeight: "90vh",
                        overflow: "hidden", animation: "ppPop 220ms ease-out" }}>
          {/* Header */}
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center",
                          justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)",
                          background: "var(--paper-warm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--sky-ink)" }}><Icon name="barcode" size={16}/></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Scan barcode</span>
              <span style={{ marginLeft: 14, display: "flex", gap: 4 }}>
                {phases.map(p => (
                  <span key={p} style={{ width: phase === p ? 22 : 6, height: 6, borderRadius: 999,
                              background: phases.indexOf(p) <= phases.indexOf(phase)
                                        ? "var(--sky)" : "var(--line-strong)",
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
          <div style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
            {phase === "scan" && (
              <ScanPhase tray={tray} setTray={setTray}
                          onReview={() => setPhase("review")} onClose={onClose}/>
            )}
            {phase === "review" && (
              <ReviewPhase tray={tray} setTray={setTray} onBack={() => setPhase("scan")}
                            onConfirm={(items) => {
                              const units = items.reduce((s, it) => s + it.qty, 0);
                              setPhase("done");
                              onPushToast?.(`${units} units added to pantry`, { icon: "check" });
                            }}/>
            )}
            {phase === "done" && (
              <DonePhase tray={tray} onClose={onClose}
                          onViewPantry={() => { onNav?.("pantry"); onClose(); }}/>
            )}
          </div>
        </div>
      </div>
    );
  };

  const qtyBtn = {
    width: 26, height: 26, display: "grid", placeItems: "center",
    background: "var(--bg-tint)", border: "1px solid var(--line)", borderRadius: 7,
    color: "var(--ink-2)", cursor: "pointer", fontSize: 15, fontWeight: 600,
    fontFamily: "inherit", lineHeight: 1, padding: 0,
  };

  window.PPScanBarcode = { ScanBarcode };
})();
