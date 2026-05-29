// screens/scan-receipt.jsx — Receipt scan flow.
//   window.PPScanReceipt = { ScanReceipt }
//
// Four phases:
//   1. capture   — viewfinder mock with "scan" / "upload photo"
//   2. detecting — OCR animation over a thermal-paper receipt
//   3. review    — matched items grouped by confidence; user confirms
//   4. done      — success + reminder summary

(function () {
  const { useState, useEffect, useMemo, useRef } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Pill, Card, Button } = window.PPUI;

  // ═════════════════════════════════════════════════════════════════════════
  //  Mock receipt + matching results
  //
  //  Each line has:
  //    raw  → exactly what's printed on the receipt
  //    qty  → as printed
  //    price
  //    match → null = couldn't match; { name, illo, cat, expDays, confidence }
  //
  //  confidence: "auto"  = high-confidence catalog hit, auto-confirmed
  //              "guess" = medium-confidence, needs review
  //              "none"  = no catalog hit, manual entry needed
  // ═════════════════════════════════════════════════════════════════════════
  const RECEIPT = {
    store: "Publix",
    address: "1100 NW 8th Ave · Gainesville",
    when: "Today · 2:14 PM",
    total: 43.55,
    items: [
      { raw: "WHL MILK GAL",       qty: "1 gal",   price: 3.79,
        match: { name: "Whole Milk",       illo: "milk",    cat: "Dairy",      expDays: 7,   confidence: "auto"  } },
      { raw: "ORG SPINACH 5oz",    qty: "1 bag",   price: 3.49,
        match: { name: "Spinach",          illo: "spinach", cat: "Vegetables", expDays: 5,   confidence: "auto"  } },
      { raw: "LG EGGS 12CT",       qty: "1 dozen", price: 4.20,
        match: { name: "Eggs",             illo: "egg",     cat: "Dairy",      expDays: 28,  confidence: "auto"  } },
      { raw: "BANANA",             qty: "6 ct",    price: 1.79,
        match: { name: "Bananas",          illo: "banana",  cat: "Vegetables", expDays: 7,   confidence: "auto"  } },
      { raw: "RM TOMATO",          qty: "4 ct",    price: 2.49,
        match: { name: "Roma Tomatoes",    illo: "tomato",  cat: "Vegetables", expDays: 7,   confidence: "auto"  } },
      { raw: "GRK YGURT 32oz",     qty: "32 oz",   price: 5.49,
        match: { name: "Greek Yogurt",     illo: "yogurt",  cat: "Dairy",      expDays: 30,  confidence: "auto",
                 note: "Bulk size · Pilot suggested last week" } },
      { raw: "FLR TORTILLA 8CT",   qty: "8 ct",    price: 2.99,
        match: { name: "Flour Tortillas",  illo: "bread",   cat: "Grains",     expDays: 14,  confidence: "auto"  } },
      { raw: "PARM CHS WEDG 4oz",  qty: "4 oz",    price: 5.49,
        match: { name: "Parmesan",         illo: "cheese",  cat: "Dairy",      expDays: 60,  confidence: "auto"  } },
      { raw: "CHKN BRST 1.2LB",    qty: "1.2 lb",  price: 7.99,
        match: { name: "Chicken Breast",   illo: "chicken", cat: "Meat",       expDays: 3,   confidence: "auto"  } },
      { raw: "DSH SOAP 25oz",      qty: "1 bottle",price: 3.49,
        match: { name: "Dish Soap",        illo: "bottle",  cat: "Household",  expDays: 0,   confidence: "auto"  } },
      { raw: "TWL 6PK SLCT",       qty: "6 pk",    price: 7.99,
        match: { name: "Paper Towels",     illo: "paper",   cat: "Household",  expDays: 0,   confidence: "auto"  } },
      // Medium-confidence — Pilot needs a confirm
      { raw: "NTL FRZ BERR 12oz",  qty: "12 oz",   price: 4.99,
        match: { name: "Frozen Berries",   illo: "berries", cat: "Frozen",     expDays: 180, confidence: "guess",
                 alternates: ["Frozen Mixed Berries", "Frozen Strawberries"] } },
      { raw: "PROD #4225",         qty: "1.4 lb",  price: 2.45,
        match: { name: "Avocados",         illo: "egg",     cat: "Vegetables", expDays: 5,   confidence: "guess",
                 alternates: ["Limes", "Green peppers"], note: "PLU 4225 = Hass avocado" } },
      // No match — user adds manually
      { raw: "LM PEP DR PEPP 6PK", qty: "6 pk",    price: 5.79,
        match: null },
    ],
  };

  const SPICE_HUE = "var(--orange)";

  // ═════════════════════════════════════════════════════════════════════════
  //  Small helpers
  // ═════════════════════════════════════════════════════════════════════════
  const expiryLabel = (d) => {
    if (d === 0)   return "Non-perishable";
    if (d === 1)   return "Tomorrow";
    if (d < 7)     return `${d} days`;
    if (d < 30)    return `${Math.round(d / 7)} weeks`;
    if (d < 365)   return `${Math.round(d / 30)} months`;
    return `${Math.round(d / 365)} year${d >= 730 ? "s" : ""}`;
  };
  const expiryTone = (d) => {
    if (d === 0) return "ghost";
    if (d <= 3)  return "tomato";
    if (d <= 7)  return "amber";
    return "green";
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 1 — CAPTURE
  // ═════════════════════════════════════════════════════════════════════════
  const CapturePhase = ({ onCapture, onClose }) => (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 24, padding: "32px 32px 28px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                        fontWeight: 700, textTransform: "uppercase" }}>Scan receipt</div>
        <h2 className="serif" style={{ margin: "8px 0 6px", fontSize: 26, letterSpacing: -0.4 }}>
          Snap your receipt — Pilot does the rest.
        </h2>
        <div style={{ fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.5, maxWidth: 460 }}>
          Pilot reads each line, matches it against the store's catalog, and estimates
          when it'll expire so your pantry stays accurate.
        </div>
      </div>

      {/* Viewfinder mock */}
      <div style={{
        position: "relative",
        width: 320, height: 380,
        background: "var(--ink)",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "var(--sh-lift)",
      }}>
        {/* Corner brackets */}
        {[
          { top: 16, left: 16,   borders: "3px solid var(--amber)", brTl: 6 },
          { top: 16, right: 16,  borders: "3px solid var(--amber)", brTr: 6 },
          { bottom: 16, left: 16, borders: "3px solid var(--amber)", brBl: 6 },
          { bottom: 16, right: 16, borders: "3px solid var(--amber)", brBr: 6 },
        ].map((b, i) => {
          const isTop = "top" in b;
          const isLeft = "left" in b;
          return (
            <div key={i} style={{
              position: "absolute",
              [isTop ? "top" : "bottom"]: 16,
              [isLeft ? "left" : "right"]: 16,
              width: 28, height: 28,
              borderTop:    isTop ? b.borders : "none",
              borderBottom: isTop ? "none"    : b.borders,
              borderLeft:   isLeft ? b.borders : "none",
              borderRight:  isLeft ? "none"   : b.borders,
              borderTopLeftRadius:     isTop && isLeft ? 6 : 0,
              borderTopRightRadius:    isTop && !isLeft ? 6 : 0,
              borderBottomLeftRadius:  !isTop && isLeft ? 6 : 0,
              borderBottomRightRadius: !isTop && !isLeft ? 6 : 0,
            }}/>
          );
        })}

        {/* Ghost receipt inside frame */}
        <div style={{
          position: "absolute", top: 38, left: 60, right: 60, bottom: 38,
          background: "rgba(253, 250, 243, 0.18)",
          borderRadius: 4, padding: "14px 12px",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ height: 8, width: "60%", margin: "0 auto",
                          background: "rgba(253, 250, 243, 0.35)", borderRadius: 2 }}/>
          <div style={{ height: 4, width: "40%", margin: "0 auto 8px",
                          background: "rgba(253, 250, 243, 0.2)", borderRadius: 2 }}/>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 6 }}>
              <div style={{ height: 4, flex: 1, background: "rgba(253, 250, 243, 0.16)", borderRadius: 2 }}/>
              <div style={{ height: 4, width: 22, background: "rgba(253, 250, 243, 0.2)", borderRadius: 2 }}/>
            </div>
          ))}
        </div>

        <div style={{
          position: "absolute", bottom: 50, left: 0, right: 0, textAlign: "center",
          fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: "rgba(253, 250, 243, 0.7)",
          textTransform: "uppercase",
        }}>
          Hold steady · receipt in frame
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Button variant="primary" icon="camera" onClick={onCapture}>Use camera</Button>
        <Button variant="secondary" icon="upload" onClick={onCapture}>Upload photo</Button>
      </div>

      {/* How it works */}
      <div style={{
        width: "100%", maxWidth: 440,
        padding: "14px 16px",
        background: "var(--green-tint)", border: "1px solid var(--green-soft)",
        borderRadius: 12,
        display: "flex", gap: 12,
      }}>
        <span style={{ color: "var(--green-deep)", flex: "0 0 auto", marginTop: 2 }}>
          <Icon name="sparkles" size={16}/>
        </span>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--green-deep)", marginBottom: 4 }}>
            How Pilot matches receipts
          </div>
          <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.55 }}>
            <strong>1.</strong> Reads abbreviated line items ("WHL MILK GAL"). <strong>2.</strong> Looks each up in {RECEIPT.store}'s
            catalog. <strong>3.</strong> Estimates expiry from category averages
            (milk ~7d, eggs ~28d, pantry shelf-stable). Anything ambiguous, it asks.
          </div>
        </div>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 2 — DETECTING (animated OCR)
  // ═════════════════════════════════════════════════════════════════════════
  const DetectingPhase = ({ onDone }) => {
    const [step, setStep] = useState(0); // how many lines detected
    const total = RECEIPT.items.length;
    useEffect(() => {
      if (step >= total) {
        const t = setTimeout(onDone, 600);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setStep(s => s + 1), step === 0 ? 350 : 180);
      return () => clearTimeout(t);
    }, [step, total, onDone]);

    return (
      <div style={{ padding: "28px 32px 24px",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                          fontWeight: 700, textTransform: "uppercase" }}>Reading receipt</div>
          <h2 className="serif" style={{ margin: "6px 0", fontSize: 22, letterSpacing: -0.3 }}>
            {step >= total
              ? "Got everything. Matching against the catalog…"
              : `${step} of ${total} line items read…`}
          </h2>
        </div>

        {/* Receipt mock with scanning overlay */}
        <div style={{
          position: "relative",
          width: 300,
          maxHeight: 380,
          overflow: "hidden",
          background: "#FBF6E8",
          color: "#3B342A",
          fontFamily: "var(--font-mono)",
          padding: "20px 22px 26px",
          borderRadius: 4,
          boxShadow: "0 10px 28px -10px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.08)",
          // Thermal-paper edge wobble
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), 96% 100%, 88% calc(100% - 4px), 78% 100%, 68% calc(100% - 4px), 58% 100%, 48% calc(100% - 4px), 38% 100%, 28% calc(100% - 4px), 18% 100%, 8% calc(100% - 4px), 0 100%)",
        }}>
          {/* Header */}
          <div style={{ textAlign: "center", paddingBottom: 8,
                          borderBottom: "1px dashed rgba(59, 52, 42, 0.3)" }}>
            <div className="serif" style={{ fontSize: 16, color: "#2A2520", letterSpacing: 1 }}>
              {RECEIPT.store.toUpperCase()}
            </div>
            <div style={{ fontSize: 9, color: "#7A6F5D", marginTop: 2 }}>
              {RECEIPT.address}
            </div>
            <div style={{ fontSize: 9, color: "#7A6F5D", marginTop: 1 }}>
              {RECEIPT.when}
            </div>
          </div>

          {/* Line items */}
          <div style={{ paddingTop: 8 }}>
            {RECEIPT.items.map((line, i) => (
              <div key={i} style={{
                position: "relative",
                display: "flex", justifyContent: "space-between",
                fontSize: 10, padding: "3px 0",
                opacity: i < step ? 1 : 0.18,
                transition: "opacity 200ms",
                color: i < step ? "#2A2520" : "#7A6F5D",
              }}>
                <span>{line.raw}</span>
                <span>${line.price.toFixed(2)}</span>
                {i === step - 1 && (
                  <div style={{
                    position: "absolute", inset: -1, left: -6, right: -6,
                    background: "rgba(217, 114, 43, 0.18)",
                    borderRadius: 3, pointerEvents: "none",
                    animation: "ppDetectPulse 600ms ease-out",
                  }}/>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            marginTop: 10, paddingTop: 8,
            borderTop: "1px dashed rgba(59, 52, 42, 0.3)",
            display: "flex", justifyContent: "space-between",
            fontSize: 11, fontWeight: 700, color: "#2A2520",
            opacity: step >= total ? 1 : 0.2,
            transition: "opacity 400ms",
          }}>
            <span>TOTAL</span>
            <span>${RECEIPT.total.toFixed(2)}</span>
          </div>

          {/* Scanning beam */}
          {step < total && (
            <div className="pp-scan-beam" style={{
              position: "absolute", left: 0, right: 0,
              top: `${20 + Math.min(step, total) * 18 + 50}px`,
              height: 2, background: "linear-gradient(90deg, transparent, var(--orange) 50%, transparent)",
              boxShadow: "0 0 10px 2px rgba(217, 114, 43, 0.5)",
              transition: "top 180ms ease-out",
            }}/>
          )}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 6 }}>
          <span style={{ color: "var(--orange-deep)" }}>
            <Icon name="sparkles" size={12}/>
          </span>
          <span style={{ fontSize: 11.5, color: "var(--ink-muted)", fontWeight: 600 }}>
            {step >= total ? "Matching to catalog…" : `OCR pass · ${Math.round((step / total) * 100)}%`}
          </span>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Item row (review phase)
  // ═════════════════════════════════════════════════════════════════════════
  const ConfidenceBadge = ({ c }) => {
    if (c === "auto")
      return <Pill tone="green" size="sm" icon="check">Auto-matched</Pill>;
    if (c === "guess")
      return <Pill tone="amber" size="sm" icon="alert">Needs a look</Pill>;
    return <Pill tone="tomato" size="sm" icon="alert">No match</Pill>;
  };

  const ItemRow = ({ line, checked, onToggle, onSwap, onSetExpDays }) => {
    const m = line.match;
    const expanded = m && m.confidence === "guess";

    if (!m) {
      // No match — manual add UX
      return (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px", background: "var(--paper-warm)",
          border: "1px solid var(--tomato-line)", borderRadius: 12,
          borderLeft: "3px solid var(--tomato)",
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 9, flex: "0 0 auto",
            background: "var(--tomato-soft)", color: "var(--tomato-ink)",
            display: "grid", placeItems: "center",
          }}>
            <Icon name="alert" size={16}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
              Couldn't match this line
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11,
                            color: "var(--ink-muted)", marginTop: 3 }}>
              {line.raw} · {line.qty} · ${line.price.toFixed(2)}
            </div>
          </div>
          <Button size="sm" variant="secondary" icon="plus">Add manually</Button>
        </div>
      );
    }

    return (
      <div style={{
        background: "var(--paper)",
        border: "1px solid var(--line)",
        borderLeft: m.confidence === "guess" ? "3px solid var(--amber)" : "1px solid var(--line)",
        borderRadius: 12,
        padding: "12px 14px",
        opacity: checked ? 1 : 0.55,
        transition: "opacity 160ms",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Check */}
          <button onClick={onToggle} style={{
            width: 22, height: 22, borderRadius: 7,
            border: `1.5px solid ${checked ? "var(--green)" : "var(--line-strong)"}`,
            background: checked ? "var(--green)" : "transparent",
            color: "#FDFAF3", display: "grid", placeItems: "center",
            cursor: "pointer", padding: 0, flex: "0 0 auto",
          }}>
            {checked && <Icon name="check" size={12}/>}
          </button>

          {/* Illustration thumb */}
          <div style={{
            width: 38, height: 38, flex: "0 0 auto",
            borderRadius: 9, background: "var(--bg-tint)",
            border: "1px solid var(--line-soft)",
            display: "grid", placeItems: "center",
          }}>
            <Illo name={m.illo} size={26}/>
          </div>

          {/* Name + raw */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                {m.name}
              </span>
              {m.note && (
                <span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--orange-deep)",
                                  background: "var(--orange-tint)", padding: "2px 7px",
                                  borderRadius: 999 }}>
                  {m.note}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 3,
                            display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-mono)" }}>{line.raw}</span>
              <span>·</span>
              <span>{line.qty}</span>
              <span>·</span>
              <span className="tnum">${line.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Expiry chip */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4,
                          flex: "0 0 auto" }}>
            <Pill tone={expiryTone(m.expDays)} size="sm" icon={m.expDays === 0 ? null : "timer"}>
              {expiryLabel(m.expDays)}
            </Pill>
            <ConfidenceBadge c={m.confidence}/>
          </div>
        </div>

        {/* Expanded panel for guesses */}
        {expanded && (
          <div style={{
            marginTop: 12, padding: "10px 12px",
            background: "var(--amber-soft)", borderRadius: 9,
            display: "grid", gap: 8,
          }}>
            <div style={{ fontSize: 12, color: "var(--amber-ink)", lineHeight: 1.5 }}>
              <strong>Pilot's guess:</strong> {m.name}
              {m.note && <> · <span style={{ opacity: 0.85 }}>{m.note}</span></>}
            </div>
            {m.alternates && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "var(--amber-ink)", alignSelf: "center",
                                  fontWeight: 600 }}>or:</span>
                {m.alternates.map(alt => (
                  <button key={alt} onClick={() => onSwap(alt)} style={{
                    padding: "4px 10px", fontSize: 11, fontWeight: 600,
                    background: "var(--paper)", border: "1px solid var(--amber-line)",
                    borderRadius: 999, color: "var(--ink-2)", cursor: "pointer",
                    fontFamily: "inherit",
                  }}>{alt}</button>
                ))}
                <button style={{
                  padding: "4px 10px", fontSize: 11, fontWeight: 600,
                  background: "transparent", border: "1px dashed var(--amber-line)",
                  borderRadius: 999, color: "var(--amber-ink)", cursor: "pointer",
                  fontFamily: "inherit",
                }}>Search catalog…</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 3 — REVIEW
  // ═════════════════════════════════════════════════════════════════════════
  const ReviewPhase = ({ onConfirm, onClose }) => {
    const [lines, setLines] = useState(RECEIPT.items.map(l => ({ ...l, _checked: !!l.match })));
    const [showHow, setShowHow] = useState(false);

    const summary = useMemo(() => {
      let auto = 0, guess = 0, none = 0;
      lines.forEach(l => {
        if (!l.match)                       none++;
        else if (l.match.confidence === "auto")  auto++;
        else                                guess++;
      });
      return { auto, guess, none };
    }, [lines]);

    const confirmCount = lines.filter(l => l._checked && l.match).length;

    const toggle = (i) => {
      setLines(ls => ls.map((l, idx) => idx === i ? { ...l, _checked: !l._checked } : l));
    };
    const swap = (i, altName) => {
      setLines(ls => ls.map((l, idx) =>
        idx === i ? {
          ...l,
          match: { ...l.match, name: altName, confidence: "auto" }
        } : l
      ));
    };

    // Group by confidence
    const grouped = useMemo(() => {
      const auto  = lines.map((l, i) => ({ ...l, _i: i })).filter(l => l.match && l.match.confidence === "auto");
      const guess = lines.map((l, i) => ({ ...l, _i: i })).filter(l => l.match && l.match.confidence === "guess");
      const none  = lines.map((l, i) => ({ ...l, _i: i })).filter(l => !l.match);
      return { auto, guess, none };
    }, [lines]);

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        {/* Header */}
        <div style={{
          padding: "22px 28px 18px", borderBottom: "1px solid var(--line)",
          background: "var(--paper-warm)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 11,
              background: "var(--orange-tint)", color: "var(--orange-deep)",
              display: "grid", placeItems: "center", flex: "0 0 auto",
            }}>
              <Icon name="receipt" size={22}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>
                {RECEIPT.store} · {RECEIPT.when}
              </div>
              <div className="serif" style={{ fontSize: 22, color: "var(--ink)",
                              marginTop: 4, letterSpacing: -0.3 }}>
                {lines.length} items found · <span className="tnum">${RECEIPT.total.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 12,
                              color: "var(--ink-muted)", alignItems: "center" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--green)" }}/>
                  {summary.auto} auto-matched
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--amber)" }}/>
                  {summary.guess} need a look
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--tomato)" }}/>
                  {summary.none} couldn't match
                </span>
                <button onClick={() => setShowHow(v => !v)} style={{
                  marginLeft: "auto", background: "transparent", border: "none",
                  color: "var(--ink-soft)", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                  fontFamily: "inherit",
                }}>
                  <Icon name="info" size={13}/> How it works
                </button>
              </div>
            </div>
          </div>

          {showHow && (
            <div style={{
              marginTop: 14, padding: "12px 14px",
              background: "var(--green-tint)", border: "1px solid var(--green-soft)",
              borderRadius: 10, fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.55,
            }}>
              <strong style={{ color: "var(--green-deep)" }}>Pilot's matching:</strong>{" "}
              receipt lines are abbreviated, so each one runs through {RECEIPT.store}'s SKU
              catalog (or PLU codes for produce) plus fuzzy text matching against past
              purchases. Expiry uses category averages — milk ~7d, eggs ~28d, fresh
              produce 3–7d, pantry shelf-stable months. You can always edit before saving.
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 100px",
                        background: "var(--bg)" }}>
          {grouped.guess.length > 0 && (
            <Section title="Needs a look" count={grouped.guess.length}
                     subtitle="Pilot's best guess — tap to swap if it's wrong."
                     accent="var(--amber)" defaultOpen>
              <div style={{ display: "grid", gap: 10 }}>
                {grouped.guess.map(l => (
                  <ItemRow key={l._i} line={l} checked={l._checked}
                            onToggle={() => toggle(l._i)}
                            onSwap={(alt) => swap(l._i, alt)}/>
                ))}
              </div>
            </Section>
          )}

          {grouped.none.length > 0 && (
            <Section title="Couldn't match" count={grouped.none.length}
                     subtitle="Pilot didn't recognize this line. Add it yourself or skip."
                     accent="var(--tomato)" defaultOpen>
              <div style={{ display: "grid", gap: 10 }}>
                {grouped.none.map(l => (
                  <ItemRow key={l._i} line={l} checked={false} onToggle={() => {}}/>
                ))}
              </div>
            </Section>
          )}

          <Section title="Auto-matched" count={grouped.auto.length}
                   subtitle={`Pilot is confident on these — expiry estimated from category averages.`}
                   accent="var(--green)" defaultOpen>
            <div style={{ display: "grid", gap: 8 }}>
              {grouped.auto.map(l => (
                <ItemRow key={l._i} line={l} checked={l._checked}
                          onToggle={() => toggle(l._i)}/>
              ))}
            </div>
          </Section>
        </div>

        {/* Sticky footer */}
        <div style={{
          padding: "14px 28px", borderTop: "1px solid var(--line)",
          background: "var(--paper-warm)",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Ready to save</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
              {confirmCount} of {lines.length} items will be added to your pantry
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" iconRight="arrowRight" size="lg"
                  onClick={() => onConfirm(lines.filter(l => l._checked && l.match))}>
            Add {confirmCount} to pantry
          </Button>
        </div>
      </div>
    );
  };

  // Collapsible section
  const Section = ({ title, count, subtitle, accent, defaultOpen, children }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => setOpen(o => !o)} style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "8px 0 10px", background: "transparent", border: "none",
          textAlign: "left", cursor: "pointer", fontFamily: "inherit",
          borderBottom: "1px solid var(--line)",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }}/>
          <span style={{ fontSize: 11, letterSpacing: 0.6, fontWeight: 700,
                            color: "var(--ink)", textTransform: "uppercase" }}>
            {title}
          </span>
          <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{count}</span>
          <span style={{ flex: 1 }}/>
          <span style={{ color: "var(--ink-muted)" }}>
            <Icon name={open ? "chevronUp" : "chevronDown"} size={14}/>
          </span>
        </button>
        {subtitle && (
          <div style={{ fontSize: 12, color: "var(--ink-muted)", margin: "10px 0 12px" }}>
            {subtitle}
          </div>
        )}
        {open && children}
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════════
  //  Phase 4 — DONE
  // ═════════════════════════════════════════════════════════════════════════
  const DonePhase = ({ count, soon, onViewPantry, onClose }) => (
    <div style={{
      padding: "44px 32px 28px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 22,
      textAlign: "center",
    }}>
      <div style={{
        width: 88, height: 88, borderRadius: 999,
        background: "var(--green-tint)", border: "3px solid var(--green)",
        display: "grid", placeItems: "center",
        color: "var(--green-deep)",
        animation: "ppPop 320ms ease-out",
      }}>
        <Icon name="check" size={44}/>
      </div>
      <div>
        <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
          Pantry updated · {count} items added
        </h2>
        <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5 }}>
          Each item has an estimated expiry. Pilot will nudge you when something's about to turn.
        </div>
      </div>

      {soon.length > 0 && (
        <Card pad={18} style={{ width: "100%", maxWidth: 460,
                                  background: "var(--amber-soft)", borderColor: "var(--amber-line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ color: "var(--amber-ink)" }}><Icon name="alert" size={14}/></span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--amber-ink)",
                              textTransform: "uppercase", letterSpacing: 0.5 }}>
              Eat first
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {soon.map(item => (
              <div key={item.match.name} style={{
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 32, height: 32, borderRadius: 8,
                                background: "var(--on-tint-pad)", display: "grid", placeItems: "center" }}>
                  <Illo name={item.match.illo} size={22}/>
                </div>
                <div style={{ flex: 1, textAlign: "left", fontSize: 13, color: "var(--ink-2)" }}>
                  {item.match.name}
                </div>
                <Pill tone={expiryTone(item.match.expDays)} size="sm">
                  {expiryLabel(item.match.expDays)}
                </Pill>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Button variant="secondary" onClick={onClose}>Done</Button>
        <Button variant="primary" iconRight="arrowRight" onClick={onViewPantry}>
          View pantry
        </Button>
      </div>
    </div>
  );

  // ═════════════════════════════════════════════════════════════════════════
  //  Top-level overlay
  // ═════════════════════════════════════════════════════════════════════════
  const ScanReceipt = ({ onClose, onPushToast, onNav }) => {
    const [phase, setPhase] = useState("capture");
    const [confirmed, setConfirmed] = useState([]);

    const soon = useMemo(
      () => confirmed.filter(l => l.match && l.match.expDays > 0 && l.match.expDays <= 7),
      [confirmed]
    );

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
      <div className="pp-overlay" style={{ alignItems: "stretch", justifyContent: "stretch",
                                              padding: "5vh 5vw", overflow: "hidden" }}>
        <div style={{
          width: "100%", maxWidth: 880, margin: "0 auto",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: 22,
          boxShadow: "var(--sh-lift)",
          display: "flex", flexDirection: "column",
          minHeight: 0, maxHeight: "90vh",
          overflow: "hidden",
          animation: "ppPop 220ms ease-out",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 22px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12,
            borderBottom: "1px solid var(--line)",
            background: "var(--paper-warm)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--orange-deep)" }}>
                <Icon name="receipt" size={16}/>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                Scan receipt
              </span>
              {/* Phase pips */}
              <span style={{ marginLeft: 14, display: "flex", gap: 4 }}>
                {["capture", "detecting", "review", "done"].map(p => (
                  <span key={p} style={{
                    width: phase === p ? 22 : 6, height: 6, borderRadius: 999,
                    background: ["capture", "detecting", "review", "done"].indexOf(p)
                              <= ["capture", "detecting", "review", "done"].indexOf(phase)
                                ? "var(--orange)" : "var(--line-strong)",
                    transition: "width 200ms ease, background 200ms ease",
                  }}/>
                ))}
              </span>
            </div>
            <button onClick={onClose} style={{
              width: 30, height: 30, display: "grid", placeItems: "center",
              background: "transparent", border: "none", color: "var(--ink-muted)",
              borderRadius: 8, cursor: "pointer",
            }}>
              <Icon name="close" size={16}/>
            </button>
          </div>

          {/* Phase body */}
          <div style={{ flex: 1, overflow: "auto", minHeight: 0,
                          display: phase === "review" ? "flex" : "block",
                          flexDirection: "column" }}>
            {phase === "capture" && (
              <CapturePhase
                onCapture={() => setPhase("detecting")}
                onClose={onClose}
              />
            )}
            {phase === "detecting" && (
              <DetectingPhase onDone={() => setPhase("review")}/>
            )}
            {phase === "review" && (
              <ReviewPhase
                onConfirm={(items) => {
                  setConfirmed(items);
                  setPhase("done");
                  onPushToast?.(`${items.length} items added to pantry`, { icon: "check" });
                }}
                onClose={onClose}
              />
            )}
            {phase === "done" && (
              <DonePhase
                count={confirmed.length}
                soon={soon}
                onViewPantry={() => { onNav?.("pantry"); onClose(); }}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  window.PPScanReceipt = { ScanReceipt };
})();
