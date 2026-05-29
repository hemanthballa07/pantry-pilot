// screens/cook-mode.jsx — Pre-cook setup + Cook Now mode with card deck.
//   Exports window.PPCookMode = { CookNow }

(function () {
  const { useState, useMemo, useEffect } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button } = window.PPUI;

  // ═════════════════════════════════════════════════════════════════════
  //  Recipe definitions (base 2 servings, scaled at runtime)
  // ═════════════════════════════════════════════════════════════════════
  const BASE_SERVINGS = 2;
  const SPICE_MULT  = { mild: 0.5, medium: 1, spicy: 1.6, extra: 2.4 };
  const SPICE_LABEL = { mild: "Mild", medium: "Medium", spicy: "Spicy", extra: "Extra spicy" };

  // Recipe ingredient lists + step scripts live in src/screens/recipe-defs.js
  const { RECIPE_DEF, ingrIllo } = window.PPRecipeDefs;

  function fmtQty(qty, unit) {
    if (qty == null) return "";
    const rounded = Math.round(qty * 4) / 4;
    const whole = Math.floor(rounded);
    const f = rounded - whole;
    const frac = f === 0 ? "" : f === 0.25 ? "¼" : f === 0.5 ? "½" : "¾";
    const num = whole === 0 ? (frac || "0") : (frac ? `${whole} ${frac}` : `${whole}`);
    return unit ? `${num} ${unit}` : num;
  }

  function scaleIngredients(recipe, servings, spice) {
    const def = RECIPE_DEF[recipe.id];
    if (!def) {
      return (recipe.uses || []).map(u => ({ name: u, qty: null, unit: "", illo: ingrIllo(u) }));
    }
    const scale = servings / BASE_SERVINGS;
    const spiceMult = SPICE_MULT[spice] ?? 1;
    return def.ingredients.map(it => ({
      ...it,
      qty: it.qty * scale * (it.spice ? spiceMult : 1),
    }));
  }

  function buildSteps(recipe, servings, spice, ingredients) {
    const get = (name) => ingredients.find(i => i.name === name) || { qty: 0, unit: "" };
    const q   = (name) => fmtQty(get(name).qty, get(name).unit);

    const def = RECIPE_DEF[recipe.id];
    if (def && def.steps) return def.steps(q, spice);

    // Generic recipe fallback (recipes without a full step script)
    const spiceLine = spice === "mild"  ? "Go easy on salt and chili — let the produce speak."
                    : spice === "extra" ? "Lean into the heat. Add chili flakes or extra hot sauce."
                    :                     "Season to taste. Salt, acid, fat, heat — adjust one at a time.";
    return [
      { title: "Gather and prep everything first.",
        body: `Pull out and prep: ${(recipe.uses || []).join(", ")}. Wash, chop, and measure before the heat goes on.` },
      { title: "Build a flavor base.",
        body: "Warm oil over medium-high. Add aromatics — onion, garlic, anything bright — and cook until soft and fragrant.",
        timer: 3 },
      { title: "Add the main ingredients.",
        body: "Layer in proteins and bigger vegetables. Don't crowd the pan. Let things get color before stirring.",
        timer: 4 },
      { title: "Season, taste, and adjust.",
        body: spiceLine },
      { title: "Plate and finish.",
        body: "Top with anything fresh you have — herbs, citrus zest, a drizzle of good oil.",
        tip: "Pilot will save extras as a leftover and remind you to use them within 3 days." },
    ];
  }

  function beginnerCue(idx) {
    const cues = [
      "All your ingredients are measured and chopped, with nothing left in the bag or wrapper.",
      "Onions look slightly translucent (clear, not brown), and you can smell the garlic — about 60 seconds.",
      "Eggs are no longer wet but still soft and slightly glossy. Pull them off heat before they brown.",
      "Rice edges crisp slightly and grains are separate, not clumped. About 2 minutes of high heat.",
      "Sauce coats every grain evenly. Taste — add a pinch of salt if it's flat. Serve hot.",
    ];
    return cues[Math.min(idx, cues.length - 1)];
  }

  // ═════════════════════════════════════════════════════════════════════
  //  Small bits
  // ═════════════════════════════════════════════════════════════════════
  // ═════════════════════════════════════════════════════════════════════
  //  Dynamic adaptations — Pilot rewrites step guidance from user inputs
  // ═════════════════════════════════════════════════════════════════════
  const ADAPTATIONS = [
    { id: "healthier", label: "Healthier",  icon: "leaf",  tone: "var(--green-deep)", bg: "var(--green-tint)",
      delta: { cals: -90, protein: 2 }, match: /oil|fry|saut|butter|heat the/i,
      note: "Use half the fat and finish with a squeeze of lemon or a splash of water. Add a handful of greens for fiber and volume." },
    { id: "protein", label: "+ Protein", icon: "fire", tone: "var(--tomato)", bg: "var(--tomato-soft)",
      delta: { cals: 70, protein: 16 }, match: /egg|tofu|chicken|bean|chickpea|paneer|finish|serve|plate/i,
      note: "Stir in an extra egg, ½ block of tofu, or a scoop of beans for roughly +16g protein." },
    { id: "spicier", label: "Spicier", icon: "flame", tone: "var(--orange-deep)", bg: "var(--orange-tint)",
      delta: { cals: 5 }, match: /sauce|chili|spice|season|schezwan|masala|sriracha|soy/i,
      note: "Add a chopped green chili or an extra teaspoon of chili flakes when the sauce goes in." },
    { id: "crispier", label: "Crispier", icon: "flame", tone: "var(--amber-ink)", bg: "var(--amber-soft)",
      delta: {}, match: /sear|fry|roast|crisp|brown|char|toast|golden/i,
      note: "Spread it thin, crank the heat, and leave it undisturbed a minute longer — let the edges char before you toss." },
    { id: "lowercarb", label: "Lower carb", icon: "leaf", tone: "var(--green-deep)", bg: "var(--green-tint)",
      delta: { cals: -80 }, match: /rice|noodle|pasta|tortilla|bread|oat/i,
      note: "Swap half the rice or noodles for riced cauliflower or extra veg to cut the carbs." },
    { id: "quicker", label: "In a hurry", icon: "timer", tone: "var(--sky-ink)", bg: "var(--sky-soft)",
      delta: {}, match: /prep|gather|chop|dice|heat/i,
      note: "Prep while the pan heats and combine steps where you can — saves about 5 minutes." },
  ];

  function applyAdaptations(steps, activeIds) {
    const out = steps.map(s => ({ ...s, pilotNotes: [] }));
    ADAPTATIONS.filter(a => activeIds.has(a.id)).forEach(a => {
      let idx = out.findIndex(s => a.match.test(`${s.title} ${s.body}`));
      if (idx < 0) idx = 0;
      out[idx].pilotNotes.push({ label: a.label, tone: a.tone, bg: a.bg, text: a.note });
    });
    return out;
  }

  function adaptDelta(activeIds) {
    let cals = 0, protein = 0;
    ADAPTATIONS.filter(a => activeIds.has(a.id)).forEach(a => {
      cals += a.delta.cals || 0; protein += a.delta.protein || 0;
    });
    return { cals, protein };
  }

  // suggested adaptations from the user's taste inputs
  function suggestedAdapts(spice, usesHeat) {
    const s = new Set(["healthier"]);
    if (usesHeat && (spice === "spicy" || spice === "extra")) s.add("spicier");
    return s;
  }

  // Does this dish have a heat element worth asking about? (parfaits, pancakes,
  // pasta etc. don't — so we skip the spice question for them.)
  function recipeUsesHeat(recipe, ingredients) {
    if (ingredients && ingredients.some(i => i.spice)) return true;
    const uses = (recipe.uses || []).join(" ");
    if (/sriracha|schezwan|chili|salsa|hot sauce|jalape/i.test(uses)) return true;
    if (/curry|masala|spicy|taco|kung pao|chili|stir fry|schezwan|enchilada|burrito|fajita/i.test(recipe.name)) return true;
    return ["Indian", "Mexican", "Chinese", "Indo-Chinese", "Thai", "Asian"].includes(recipe.cuisine);
  }

  // a step that browns/roasts/fries earns a live "cook to your taste" control
  const DONE_RE = /sear|fry|roast|crisp|brown|char|toast|saut|golden|simmer/i;
  function donenessFor(step) {
    if (step.choice) return step.choice;
    if (step.timer && DONE_RE.test(`${step.title} ${step.body}`)) {
      return {
        q: "Cook it to your taste",
        options: [
          { label: "Lighter",    dt: -1, cue: "Pull it early — softer and milder, less colour." },
          { label: "Just right", dt: 0,  cue: null },
          { label: "Deeper",     dt: 1,  cue: "Take it a shade further — more browning, deeper, nuttier flavour." },
        ],
      };
    }
    return null;
  }

  const SectionLabel = ({ n, title, sub }) => (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="serif tnum" style={{
          fontSize: 13, color: "var(--green-deep)", fontWeight: 700,
          background: "var(--green-tint)", padding: "3px 10px", borderRadius: 8,
          border: "1px solid var(--green-soft)",
        }}>
          {String(n).padStart(2, "0")}
        </span>
        <h2 className="serif" style={{ margin: 0, fontSize: 22, letterSpacing: -0.3, color: "var(--ink)" }}>
          {title}
        </h2>
      </div>
      {sub && (
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, marginLeft: 50 }}>
          {sub}
        </div>
      )}
    </div>
  );

  const FlameDots = ({ level, color }) => {
    const filled = { mild: 1, medium: 2, spicy: 3, extra: 4 }[level] || 0;
    return (
      <div style={{ display: "flex", gap: 2 }}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} style={{
            display: "inline-flex",
            color: i < filled ? color : "var(--line-strong)",
            opacity: i < filled ? 1 : 0.55,
          }}>
            <Icon name="flame" size={14}/>
          </span>
        ))}
      </div>
    );
  };

  const PilotNote = ({ tone = "ok", text, style }) => {
    const cfg = tone === "warn"
      ? { bg: "var(--amber-soft)", bd: "var(--amber-line)", fg: "var(--amber-ink)", icon: "alert" }
      : { bg: "var(--green-tint)", bd: "var(--green-soft)", fg: "var(--green-deep)", icon: "sparkles" };
    return (
      <div style={{
        padding: "11px 14px", background: cfg.bg, border: `1px solid ${cfg.bd}`,
        borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start", ...style,
      }}>
        <span style={{ color: cfg.fg, flex: "0 0 auto", marginTop: 2 }}>
          <Icon name={cfg.icon} size={14}/>
        </span>
        <div style={{ fontSize: 13, color: cfg.fg, lineHeight: 1.5 }}>
          <strong>Pilot:</strong> {text}
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  //  Setup screen — servings + spice + scaled mise en place
  // ═════════════════════════════════════════════════════════════════════
  const CookSetup = ({ recipe, servings, setServings, spice, setSpice,
                       ingredients, usesHeat, onStart, onExit }) => {
    const pantryNote = useMemo(() => {
      const missing = recipe.missing || [];
      if (missing.length === 0) {
        return { tone: "ok",   text: `Pantry has everything for ${servings} ${servings === 1 ? "serving" : "servings"}. You're set.` };
      }
      return   { tone: "warn", text: `You're missing ${missing.join(", ")}. Pilot will offer subs or add to your list.` };
    }, [servings, recipe]);

    const spiceSpec = {
      mild:   { body: "Gentle warmth, family-friendly. Pilot dials Schezwan back to ½×.",  color: "var(--green-deep)" },
      medium: { body: "Balanced kick — the original chef intent.",                          color: "var(--amber)" },
      spicy:  { body: "Real heat. Pilot bumps Schezwan to 1.6×.",                           color: "var(--orange)" },
      extra:  { body: "Pilot doubles the Schezwan. Keep yogurt or milk nearby.",            color: "var(--tomato)" },
    };

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "var(--bg)",
                      display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          padding: "16px 28px", display: "flex", alignItems: "center", gap: 16,
          borderBottom: "1px solid var(--line)", background: "var(--paper-warm)",
        }}>
          <button onClick={onExit} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", color: "var(--ink-muted)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <Icon name="close" size={16}/> Cancel
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Before you start</div>
            <div className="serif" style={{ fontSize: 18, color: "var(--ink)", marginTop: 2 }}>
              {recipe.name}
            </div>
          </div>
          <div style={{ width: 70 }}/>
        </div>

        {/* Body (scrollable) */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 860, width: "100%", margin: "0 auto",
                          padding: "30px 28px 24px", display: "grid", gap: 22 }}>
            {/* Hero */}
            <Card pad={0} style={{ overflow: "hidden" }}>
              <div style={{
                padding: "26px 30px", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center",
                background: `linear-gradient(135deg, ${recipe.tone}26 0%, transparent 100%)`,
              }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                                  fontWeight: 700, textTransform: "uppercase" }}>Tonight's cook</div>
                  <h1 className="serif" style={{ margin: "8px 0 6px", fontSize: 34, letterSpacing: -0.6, lineHeight: 1.1, textWrap: "balance" }}>
                    {recipe.name}
                  </h1>
                  <div style={{ fontSize: 13.5, color: "var(--ink-muted)", maxWidth: 460, lineHeight: 1.5 }}>
                    Pilot scales every ingredient and tunes the heat before you turn on the burner.
                  </div>
                  <div style={{ display: "flex", gap: 18, marginTop: 14, fontSize: 12,
                                  color: "var(--ink-muted)" }}>
                    <span><Icon name="timer" size={12}/> ~{recipe.time} min</span>
                    <span>·</span>
                    <span><Icon name="wallet" size={12}/> ${recipe.cost.toFixed(2)}/serving</span>
                    <span>·</span>
                    <span><Icon name="fire" size={12}/> {recipe.cals} cal</span>
                  </div>
                </div>
                <div style={{ width: 96, height: 96, borderRadius: 18, background: "var(--paper)",
                                border: "1px solid var(--line-soft)", display: "grid", placeItems: "center" }}>
                  <Illo name={(ingredients[0] && ingredients[0].illo) || "rice"} size={64}/>
                </div>
              </div>
            </Card>

            {/* Servings */}
            <Card pad={26}>
              <SectionLabel n={1} title="Who are you cooking for?"
                            sub="Pilot scales every ingredient to match your headcount."/>
              <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap",
                              marginTop: 20, marginLeft: 50 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 4, 6].map(n => (
                    <button key={n} onClick={() => setServings(n)} style={{
                      width: 62, height: 62, borderRadius: 14,
                      background: servings === n ? "var(--ink)" : "var(--paper-warm)",
                      color: servings === n ? "var(--paper-warm)" : "var(--ink-2)",
                      border: `1px solid ${servings === n ? "var(--ink)" : "var(--line)"}`,
                      fontSize: 22, fontWeight: 600, fontFamily: "var(--font-display)",
                      cursor: "pointer", boxShadow: servings === n ? "var(--sh-2)" : "none",
                      transition: "all 160ms ease",
                    }}>{n}</button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>or</span>
                  <div style={{ display: "flex", alignItems: "center",
                                  background: "var(--paper-warm)", border: "1px solid var(--line)",
                                  borderRadius: 12, padding: 4 }}>
                    <button onClick={() => setServings(s => Math.max(1, s - 1))} style={stepBtn}>
                      <Icon name="chevronLeft" size={14}/>
                    </button>
                    <div className="tnum" style={{ minWidth: 90, textAlign: "center",
                                                       fontSize: 13.5, fontWeight: 600, color: "var(--ink-2)" }}>
                      {servings} {servings === 1 ? "serving" : "servings"}
                    </div>
                    <button onClick={() => setServings(s => s + 1)} style={stepBtn}>
                      <Icon name="chevronRight" size={14}/>
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 18, marginLeft: 50 }}>
                <PilotNote tone={pantryNote.tone} text={pantryNote.text}/>
              </div>
            </Card>

            {/* Spice (only when the dish actually has a heat element) */}
            {usesHeat && (
            <Card pad={26}>
              <SectionLabel n={2} title="How spicy do you want it?"
                            sub="Pilot tunes sauce, chili, and seasoning to match your tolerance."/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
                              marginTop: 20, marginLeft: 50 }}>
                {Object.entries(spiceSpec).map(([key, spec]) => {
                  const isOn = spice === key;
                  return (
                    <button key={key} onClick={() => setSpice(key)} style={{
                      padding: "14px 14px",
                      background: isOn ? "var(--paper-warm)" : "var(--paper)",
                      border: `1.5px solid ${isOn ? spec.color : "var(--line)"}`,
                      borderRadius: 14, cursor: "pointer", textAlign: "left",
                      transition: "all 160ms ease",
                      boxShadow: isOn ? `0 0 0 3px ${spec.color}22, var(--sh-1)` : "none",
                      fontFamily: "inherit",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <FlameDots level={key} color={spec.color}/>
                      </div>
                      <div className="serif" style={{ fontSize: 16, color: "var(--ink)", letterSpacing: -0.2 }}>
                        {SPICE_LABEL[key]}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.45, marginTop: 4 }}>
                        {spec.body}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
            )}

            {/* Scaled ingredients */}
            <Card pad={26}>
              <SectionLabel n={usesHeat ? 3 : 2} title="Your scaled mise en place"
                            sub={`${ingredients.length} ingredients · ready before you start the burner`}/>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                              columnGap: 28, rowGap: 0, marginTop: 14, marginLeft: 50 }}>
                {ingredients.map((it, i) => (
                  <div key={it.name} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 0",
                    borderBottom: i < ingredients.length - (ingredients.length % 2 || 2)
                                  ? "1px solid var(--line-soft)" : "1px solid var(--line-soft)",
                  }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--paper-warm)",
                                    border: "1px solid var(--line-soft)",
                                    display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                      <Illo name={it.illo} size={24}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: "var(--ink-2)" }}>
                      {it.name}
                      {it.spice && spice !== "medium" && (
                        <span style={{ fontSize: 11, color: "var(--tomato)", marginLeft: 8, fontWeight: 600 }}>
                          {spice === "mild" ? "½×" : spice === "spicy" ? "1.6×" : "2.4×"}
                        </span>
                      )}
                    </div>
                    <div className="tnum serif" style={{
                      fontSize: 15,
                      background: it.spice ? "var(--tomato-soft)" : "transparent",
                      color: it.spice ? "var(--tomato)" : "var(--ink)",
                      padding: it.spice ? "3px 9px" : "0",
                      borderRadius: it.spice ? 8 : 0,
                      fontWeight: it.spice ? 600 : 500,
                    }}>
                      {fmtQty(it.qty, it.unit) || "to taste"}
                    </div>
                  </div>
                ))}
              </div>
              {recipe.missing && recipe.missing.length > 0 && (
                <div style={{ marginTop: 18, marginLeft: 50 }}>
                  <PilotNote tone="warn"
                    text={`Pantry's missing ${recipe.missing.join(", ")}. Tap "Add to list" or substitute as you go.`}/>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{
          padding: "16px 28px", borderTop: "1px solid var(--line)",
          background: "var(--paper-warm)",
        }}>
          <div style={{ maxWidth: 860, margin: "0 auto",
                          display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>Ready when you are</div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2 }}>
                {servings} {servings === 1 ? "serving" : "servings"}{usesHeat ? ` · ${SPICE_LABEL[spice]}` : ""} · ~{recipe.time} min
              </div>
            </div>
            <Button variant="primary" iconRight="arrowRight" size="lg" onClick={onStart}>
              Start cooking
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  //  Step card (renders inside the deck)
  // ═════════════════════════════════════════════════════════════════════
  const StepCard = ({ step, index, total, level, className, pref = 1, onPref, interactive }) => {
    const done = donenessFor(step);
    const opt = done ? done.options[pref] : null;
    const shownTimer = step.timer ? Math.max(1, step.timer + (opt ? opt.dt : 0)) : null;
    return (
    <div className={className}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span className="tnum serif" style={{ fontSize: 22, color: "var(--green-deep)" }}>
          Step {index + 1}
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>of {total}</span>
        {shownTimer && (
          <Pill tone="orange" size="md" icon="timer">{shownTimer} min</Pill>
        )}
      </div>
      <h2 className="serif" style={{
        fontSize: 40, lineHeight: 1.12, letterSpacing: -0.6, margin: 0,
        color: "var(--ink)", textWrap: "balance",
      }}>
        {step.title}
      </h2>
      <p style={{ fontSize: 16.5, lineHeight: 1.55, color: "var(--ink-2)",
                    marginTop: 14, maxWidth: 620 }}>
        {step.body}
      </p>

      {/* Live "cook to your taste" control */}
      {done && (
        <div style={{ marginTop: 18, maxWidth: 540 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 8,
                          display: "flex", alignItems: "center", gap: 6 }}>
            <Icon name="sparkles" size={12}/> {done.q}
          </div>
          <div style={{ display: "inline-flex", background: "var(--bg-tint)", padding: 4,
                          borderRadius: 11, border: "1px solid var(--line)", gap: 3 }}>
            {done.options.map((o, oi) => (
              <button key={o.label} onClick={() => interactive && onPref && onPref(oi)} style={{
                padding: "7px 16px", fontSize: 13, fontWeight: 600, borderRadius: 8,
                background: pref === oi ? "var(--paper)" : "transparent",
                color: pref === oi ? "var(--ink)" : "var(--ink-muted)",
                border: "none", cursor: interactive ? "pointer" : "default",
                boxShadow: pref === oi ? "var(--sh-1)" : "none", fontFamily: "inherit",
              }}>{o.label}</button>
            ))}
          </div>
          {opt && opt.cue && (
            <div style={{ fontSize: 13.5, color: "var(--ink-muted)", marginTop: 10,
                            display: "flex", gap: 8, alignItems: "flex-start" }}>
              <span style={{ color: "var(--green)", flex: "0 0 auto" }}>→</span>
              <span>{opt.cue}</span>
            </div>
          )}
        </div>
      )}

      {/* Pilot adaptation notes (driven by the chips you toggle) */}
      {step.pilotNotes && step.pilotNotes.map((n, ni) => (
        <div key={ni} style={{
          marginTop: 14, padding: "12px 16px", background: n.bg,
          border: `1px solid ${n.tone}33`, borderLeft: `3px solid ${n.tone}`,
          borderRadius: 12, maxWidth: 540, display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ color: n.tone, flex: "0 0 auto", marginTop: 2 }}>
            <Icon name="sparkles" size={14}/>
          </span>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            <strong style={{ color: n.tone }}>Pilot · {n.label}:</strong> {n.text}
          </div>
        </div>
      ))}

      {level === "beginner" && (
        <div style={{
          marginTop: 18, padding: "12px 16px",
          background: "var(--amber-soft)", border: "1px solid var(--amber-line)",
          borderRadius: 12, maxWidth: 540,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <span style={{ color: "var(--amber-ink)", flex: "0 0 auto", marginTop: 2 }}>
            <Icon name="info" size={14}/>
          </span>
          <div style={{ fontSize: 13, color: "var(--amber-ink)", lineHeight: 1.5 }}>
            <strong>How to know it's ready:</strong> {step.cue || beginnerCue(index)}
          </div>
        </div>
      )}
      {step.tip && level !== "advanced" && (
        <div style={{
          marginTop: 18, padding: "14px 18px",
          background: "var(--green-tint)", border: "1px solid var(--green-soft)",
          borderRadius: 14, display: "flex", gap: 10, maxWidth: 540,
        }}>
          <span style={{ color: "var(--green-deep)", flex: "0 0 auto", marginTop: 1 }}>
            <Icon name="sparkles" size={16}/>
          </span>
          <div style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            <strong>Pilot:</strong> {step.tip}
          </div>
        </div>
      )}
    </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  //  Cooking phase — card deck + side panel
  // ═════════════════════════════════════════════════════════════════════
  const CookFlow = ({ recipe, servings, spice, ingredients, steps,
                      usesHeat, level, setLevel, onBackToSetup, onExit, onFinish }) => {
    const [step, setStep] = useState(0);
    const [checked, setChecked] = useState(() => new Set());
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [adapt, setAdapt] = useState(() => new Set());
    const [prefs, setPrefs] = useState({});

    const suggested = useMemo(() => suggestedAdapts(spice, usesHeat), [spice, usesHeat]);
    const adaptList = usesHeat ? ADAPTATIONS : ADAPTATIONS.filter(a => a.id !== "spicier");
    const adaptedSteps = useMemo(() => applyAdaptations(steps, adapt), [steps, adapt]);
    const delta = adaptDelta(adapt);
    const toggleAdapt = (id) => setAdapt(s => {
      const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;
    });

    useEffect(() => {
      if (!timerRunning) return;
      const t = setInterval(() => setTimer(x => Math.max(0, x - 1)), 1000);
      return () => clearInterval(t);
    }, [timerRunning]);

    const goNext = () => setStep(s => Math.min(steps.length - 1, s + 1));
    const goPrev = () => setStep(s => Math.max(0, s - 1));

    useEffect(() => {
      const onKey = (e) => {
        if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev(); }
        if (e.key === "Escape")     onExit();
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    });

    const isLast = step === steps.length - 1;

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "var(--bg)",
                      display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{
          padding: "14px 28px", display: "flex", alignItems: "center", gap: 14,
          borderBottom: "1px solid var(--line)", background: "var(--paper-warm)",
        }}>
          <button onClick={onExit} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", color: "var(--ink-muted)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <Icon name="close" size={16}/> Exit cook mode
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Now cooking</div>
            <div className="serif" style={{ fontSize: 17, color: "var(--ink)", marginTop: 1 }}>
              {recipe.name}
            </div>
          </div>

          {/* Setup readout — click to re-edit */}
          <button onClick={onBackToSetup} title="Edit servings or spice" style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "6px 12px", background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 10, color: "var(--ink-2)", fontSize: 12.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Icon name="users" size={13}/> {servings}
            </span>
            {usesHeat && (
              <>
                <span style={{ width: 1, height: 14, background: "var(--line-strong)" }}/>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
                                  color: spice === "extra" || spice === "spicy" ? "var(--tomato)" : "var(--ink-2)" }}>
                  <Icon name="flame" size={13}/> {SPICE_LABEL[spice]}
                </span>
              </>
            )}
            <span style={{ color: "var(--ink-soft)", marginLeft: 2 }}>
              <Icon name="edit" size={11}/>
            </span>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 4,
                          background: "var(--bg-tint)", padding: 4, borderRadius: 10,
                          border: "1px solid var(--line)" }}>
            {["beginner", "intermediate", "advanced"].map(l => (
              <button key={l} onClick={() => setLevel(l)} style={{
                padding: "5px 10px", fontSize: 11.5, fontWeight: 600,
                background: level === l ? "var(--paper)" : "transparent",
                color: level === l ? "var(--ink)" : "var(--ink-muted)",
                border: "none", borderRadius: 7, cursor: "pointer",
                boxShadow: level === l ? "var(--sh-1)" : "none",
                textTransform: "capitalize", fontFamily: "inherit",
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1.55fr 1fr",
                        gap: 24, padding: 24, overflow: "hidden", minHeight: 0 }}>
          {/* Card deck pane */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="cook-deck">
              {steps.map((s, i) => {
                const offset = i - step;
                let cls = "cook-card";
                if (offset === 0)      cls += " cook-card--top";
                else if (offset === 1) cls += " cook-card--peek-1";
                else if (offset === 2) cls += " cook-card--peek-2";
                else if (offset === 3) cls += " cook-card--peek-3";
                else if (offset < 0)   cls += " cook-card--past";
                else                   cls += " cook-card--hidden";
                return (
                  <StepCard key={i} className={cls} step={adaptedSteps[i]} index={i}
                            total={steps.length} level={level}
                            interactive={offset === 0}
                            pref={prefs[i] ?? 1}
                            onPref={(v) => setPrefs(p => ({ ...p, [i]: v }))}/>
                );
              })}
            </div>

            {/* Controls */}
            <div style={{
              marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, padding: "14px 4px 0", borderTop: "1px solid var(--line-soft)",
            }}>
              <div style={{ opacity: step === 0 ? 0.4 : 1, pointerEvents: step === 0 ? "none" : "auto" }}>
                <Button variant="secondary" icon="chevronLeft" onClick={goPrev}>
                  Previous
                </Button>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {steps.map((_, i) => (
                  <div key={i} style={{
                    width: i === step ? 26 : 6, height: 6, borderRadius: 999,
                    background: i <= step ? "var(--green)" : "var(--line-strong)",
                    transition: "width 280ms ease, background 280ms ease",
                  }}/>
                ))}
              </div>
              {isLast ? (
                <Button variant="primary" iconRight="check" onClick={onFinish}>Finish cooking</Button>
              ) : (
                <Button variant="primary" iconRight="arrowRight" onClick={goNext}>
                  Next step
                </Button>
              )}
            </div>
          </div>

          {/* Side: adapt + ingredients + timer + pilot */}
          <div style={{ display: "grid", gap: 14, alignContent: "start", overflowY: "auto", paddingRight: 4 }}>
            {/* Adapt with Pilot — dynamic */}
            <Card pad={18} style={{ background: "var(--ink)", color: "var(--paper-warm)", borderColor: "var(--ink)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ color: "var(--amber)" }}><Icon name="sparkles" size={14}/></span>
                <span style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                                  fontWeight: 700, textTransform: "uppercase" }}>Adapt with Pilot</span>
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(253,250,243,.7)", lineHeight: 1.45, marginBottom: 12 }}>
                Tap a tweak and Pilot rewrites the steps as you go.
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {adaptList.map(a => {
                  const on = adapt.has(a.id);
                  const sug = !on && suggested.has(a.id);
                  return (
                    <button key={a.id} onClick={() => toggleAdapt(a.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6, height: 34,
                      padding: "0 12px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit",
                      fontSize: 12.5, fontWeight: 600,
                      background: on ? "var(--amber)" : "rgba(255,255,255,.06)",
                      color: on ? "var(--ink)" : "var(--paper-warm)",
                      border: `1px solid ${on ? "var(--amber)" : sug ? "rgba(230,180,90,.5)" : "rgba(255,255,255,.14)"}`,
                    }}>
                      <Icon name={a.icon} size={12}/>{a.label}
                      {sug && <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--amber)" }}/>}
                    </button>
                  );
                })}
              </div>
              {[...suggested].some(id => !adapt.has(id)) && (
                <div style={{ fontSize: 11, color: "rgba(253,250,243,.5)", marginTop: 10 }}>
                  <span style={{ color: "var(--amber)" }}>•</span> Suggested for your taste
                </div>
              )}
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.1)",
                              display: "flex", alignItems: "baseline", gap: 14 }}>
                <div>
                  <span className="serif tnum" style={{ fontSize: 22, color: "var(--paper-warm)" }}>
                    {Math.round(recipe.cals + delta.cals)}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(253,250,243,.55)" }}> cal</span>
                  {delta.cals !== 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 6,
                                      color: delta.cals < 0 ? "#9FD08C" : "var(--amber)" }}>
                      {delta.cals > 0 ? "+" : ""}{delta.cals}
                    </span>
                  )}
                </div>
                <div>
                  <span className="serif tnum" style={{ fontSize: 22, color: "var(--paper-warm)" }}>
                    {recipe.protein + delta.protein}g
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(253,250,243,.55)" }}> protein</span>
                  {delta.protein !== 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, marginLeft: 6, color: "#9FD08C" }}>
                      +{delta.protein}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "rgba(253,250,243,.45)", marginLeft: "auto" }}>per serving</span>
              </div>
            </Card>

            <Card pad={20}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                              marginBottom: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase" }}>
                  Ingredients · {servings} {servings === 1 ? "serving" : "servings"}
                </div>
                {usesHeat && <Pill tone="ghost" size="sm" icon="flame">{SPICE_LABEL[spice]}</Pill>}
              </div>
              <div style={{ display: "grid", gap: 0 }}>
                {ingredients.map(it => {
                  const isChecked = checked.has(it.name);
                  return (
                    <button key={it.name} onClick={() => setChecked(s => {
                      const n = new Set(s); isChecked ? n.delete(it.name) : n.add(it.name); return n;
                    })} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "8px 4px",
                      background: "transparent", border: "none", textAlign: "left",
                      borderBottom: "1px solid var(--line-soft)", cursor: "pointer",
                      fontFamily: "inherit",
                    }}>
                      <span style={{
                        width: 19, height: 19, borderRadius: 6,
                        border: `1.5px solid ${isChecked ? "var(--green)" : "var(--line-strong)"}`,
                        background: isChecked ? "var(--green)" : "transparent",
                        color: "#FDFAF3", display: "grid", placeItems: "center", flex: "0 0 auto",
                      }}>
                        {isChecked && <Icon name="check" size={12}/>}
                      </span>
                      <span style={{
                        flex: 1, fontSize: 13,
                        color: isChecked ? "var(--ink-soft)" : "var(--ink-2)",
                        textDecoration: isChecked ? "line-through" : "none",
                      }}>{it.name}</span>
                      <span className="tnum" style={{
                        fontSize: 12, color: it.spice ? "var(--tomato)" : "var(--ink-muted)",
                        fontWeight: it.spice ? 600 : 500,
                      }}>{fmtQty(it.qty, it.unit)}</span>
                      <Illo name={it.illo} size={20}/>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card pad={20}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                              marginBottom: 10 }}>
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase" }}>Timer</div>
                <Pill tone="ghost" size="sm">Optional</Pill>
              </div>
              <div className="serif tnum" style={{ fontSize: 42, color: "var(--ink)",
                              letterSpacing: -1, lineHeight: 1, textAlign: "center", padding: "6px 0 12px" }}>
                {Math.floor(timer / 60).toString().padStart(2, "0")}:{(timer % 60).toString().padStart(2, "0")}
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[1, 3, 5, 10].map(m => (
                  <button key={m} onClick={() => { setTimer(t => t + m * 60); setTimerRunning(true); }}
                    style={chipBtn}>+{m}m</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Button full size="sm" variant={timerRunning ? "secondary" : "primary"}
                        onClick={() => setTimerRunning(r => !r)}>
                  {timerRunning ? "Pause" : "Start"}
                </Button>
                <Button size="sm" variant="ghost"
                        onClick={() => { setTimer(0); setTimerRunning(false); }}>
                  Reset
                </Button>
              </div>
            </Card>

            <Card pad={20} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                                      borderColor: "var(--ink)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ color: "var(--amber)" }}><Icon name="sparkles" size={14}/></span>
                <span style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                                  fontWeight: 700, textTransform: "uppercase" }}>Pilot says</span>
              </div>
              <div style={{ fontSize: 13.5, color: "var(--paper-warm)", lineHeight: 1.55 }}>
                Cooking for {servings} — you'll have {Math.max(0, Math.round((servings - 1) * 0.5))} servings left over.
                Want me to save and track them?
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                <button onClick={() => window.PPToast?.("Saved leftovers · use by Friday", { icon: "save" })}
                  style={{ ...chipBtn, background: "rgba(255,255,255,.06)", color: "var(--paper-warm)",
                              borderColor: "rgba(255,255,255,.15)" }}>Save leftovers</button>
                <button onClick={() => window.PPToast?.("Dismissed")}
                  style={{ ...chipBtn, background: "transparent", color: "rgba(253,250,243,.5)",
                              borderColor: "rgba(255,255,255,.1)" }}>Dismiss</button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  //  Post-cook summary — auto-decrement + restock + leftovers
  // ═════════════════════════════════════════════════════════════════════
  const hashPct = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h % 100; };

  const CookSummary = ({ recipe, servings, ingredients, onDone }) => {
    // pseudo "remaining %" after this cook, derived deterministically per item
    const used = useMemo(() => ingredients.map(it => {
      const remaining = Math.max(2, (hashPct(it.name) % 80) - (it.spice ? 18 : 0));
      return { ...it, remaining, low: remaining < 30 };
    }), [ingredients, recipe.id]);

    const lowItems = used.filter(u => u.low);
    const [restock, setRestock] = useState(() => new Set(lowItems.map(u => u.name)));
    const leftoverServings = Math.max(0, Math.round((servings - 1) * 0.5) + (servings >= 4 ? 1 : 0));
    const [saveLeftovers, setSaveLeftovers] = useState(leftoverServings > 0);

    const toggle = (name) => setRestock(s => {
      const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n;
    });

    const finish = () => {
      const bits = [];
      if (restock.size) bits.push(`${restock.size} added to grocery list`);
      if (saveLeftovers && leftoverServings) bits.push(`${leftoverServings} servings saved`);
      window.PPToast?.(bits.length ? `Pantry updated · ${bits.join(" · ")}` : "Pantry updated", { icon: "check" });
      onDone();
    };

    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "var(--bg)",
                      display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 28px", display: "flex", alignItems: "center", gap: 16,
                        borderBottom: "1px solid var(--line)", background: "var(--paper-warm)" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Cook complete</div>
            <div className="serif" style={{ fontSize: 18, color: "var(--ink)", marginTop: 1 }}>{recipe.name}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 28px 24px", display: "grid", gap: 20 }}>
            {/* Hero */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: "var(--green-tint)",
                              border: "3px solid var(--green)", color: "var(--green-deep)",
                              display: "grid", placeItems: "center", flex: "0 0 auto",
                              animation: "ppPop 320ms ease-out" }}>
                <Icon name="check" size={32}/>
              </div>
              <div>
                <h1 className="serif" style={{ margin: 0, fontSize: 30, letterSpacing: -0.5 }}>Nicely done.</h1>
                <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 4 }}>
                  Pilot's updated your pantry — here's what changed.
                </div>
              </div>
            </div>

            {/* What you used */}
            <Card pad={22}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
                Ingredients used · auto-deducted
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {used.map(u => (
                  <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--paper-warm)",
                                    border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                                    flex: "0 0 auto" }}>
                      <Illo name={u.illo} size={24}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: "var(--ink-2)", fontWeight: 600 }}>{u.name}</div>
                      <div style={{ height: 5, borderRadius: 999, background: "var(--bg-tint)", marginTop: 5,
                                      overflow: "hidden", maxWidth: 280 }}>
                        <div style={{ width: `${u.remaining}%`, height: "100%", borderRadius: 999,
                                        background: u.low ? "var(--tomato)" : "var(--green)" }}/>
                      </div>
                    </div>
                    <span className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)", flex: "0 0 auto" }}>
                      −{fmtQty(u.qty, u.unit) || "some"}
                    </span>
                    <span style={{ width: 64, textAlign: "right", flex: "0 0 auto" }}>
                      {u.low
                        ? <Pill tone="tomato" size="sm">Low</Pill>
                        : <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }} className="tnum">{u.remaining}% left</span>}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Restock */}
            {lowItems.length > 0 && (
              <Card pad={22} style={{ background: "var(--amber-soft)", borderColor: "var(--amber-line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ color: "var(--amber-ink)" }}><Icon name="cart" size={15}/></span>
                  <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--amber-ink)",
                                    fontWeight: 700, textTransform: "uppercase" }}>Running low after this cook</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--amber-ink)", marginBottom: 14, opacity: 0.9 }}>
                  Tap to add to your grocery list — Pilot already pre-selected the essentials.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {lowItems.map(u => {
                    const on = restock.has(u.name);
                    return (
                      <button key={u.name} onClick={() => toggle(u.name)} style={{
                        display: "inline-flex", alignItems: "center", gap: 8, height: 40,
                        padding: "0 14px 0 8px", borderRadius: 999,
                        background: on ? "var(--green)" : "var(--paper)",
                        color: on ? "#FDFAF3" : "var(--ink-2)",
                        border: `1px solid ${on ? "var(--green)" : "var(--on-tint-border)"}`,
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}>
                        <span style={{ width: 26, height: 26, borderRadius: 999,
                                         background: on ? "rgba(255,255,255,.18)" : "var(--bg-tint)",
                                         display: "grid", placeItems: "center" }}>
                          <Illo name={u.illo} size={18}/>
                        </span>
                        {u.name}
                        <Icon name={on ? "check" : "plus"} size={13}/>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Leftovers */}
            {leftoverServings > 0 && (
              <Card pad={20}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--green-tint)",
                                  color: "var(--green-deep)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                    <Icon name="save" size={20}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>
                      Save {leftoverServings} {leftoverServings === 1 ? "serving" : "servings"} as a leftover
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 2 }}>
                      Pilot will track it and remind you to eat it by Friday.
                    </div>
                  </div>
                  <button onClick={() => setSaveLeftovers(v => !v)} style={{
                    width: 50, height: 30, borderRadius: 999, border: "none", cursor: "pointer",
                    background: saveLeftovers ? "var(--green)" : "var(--line-strong)",
                    position: "relative", transition: "background 180ms", flex: "0 0 auto",
                  }}>
                    <span style={{ position: "absolute", top: 3, left: saveLeftovers ? 23 : 3,
                                     width: 24, height: 24, borderRadius: 999, background: "#fff",
                                     transition: "left 180ms" }}/>
                  </button>
                </div>
              </Card>
            )}

            <PilotNote tone="ok"
              text={`That's about $${(recipe.cost * servings * 4).toFixed(0)} saved versus takeout this week, and nothing headed for the bin. Keep it up.`}/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 28px", borderTop: "1px solid var(--line)", background: "var(--paper-warm)" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <Button variant="ghost" onClick={onDone}>Skip</Button>
            <div style={{ flex: 1 }}/>
            <Button variant="primary" size="lg" iconRight="check" onClick={finish}>
              Update pantry &amp; finish
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ═════════════════════════════════════════════════════════════════════
  //  Top-level: phase machine
  // ═════════════════════════════════════════════════════════════════════
  const CookNow = ({ recipeId, onExit }) => {
    const recipe = D.recipes.find(r => r.id === recipeId) || D.recipes[0];
    const [phase, setPhase] = useState("setup");
    const [servings, setServings] = useState(2);
    const [spice, setSpice] = useState("medium");
    const [level, setLevel] = useState("beginner");

    const ingredients = useMemo(
      () => scaleIngredients(recipe, servings, spice),
      [recipe.id, servings, spice]
    );
    const steps = useMemo(
      () => buildSteps(recipe, servings, spice, ingredients),
      [recipe.id, servings, spice, ingredients]
    );
    const usesHeat = useMemo(() => recipeUsesHeat(recipe, ingredients), [recipe.id, ingredients]);

    if (phase === "setup") {
      return (
        <CookSetup
          recipe={recipe}
          servings={servings} setServings={setServings}
          spice={spice}       setSpice={setSpice}
          ingredients={ingredients}
          usesHeat={usesHeat}
          onStart={() => setPhase("cook")}
          onExit={onExit}
        />
      );
    }
    if (phase === "summary") {
      return (
        <CookSummary recipe={recipe} servings={servings} ingredients={ingredients} onDone={onExit}/>
      );
    }
    return (
      <CookFlow
        recipe={recipe}
        servings={servings} spice={spice}
        ingredients={ingredients}
        steps={steps}
        usesHeat={usesHeat}
        level={level} setLevel={setLevel}
        onBackToSetup={() => setPhase("setup")}
        onExit={onExit}
        onFinish={() => setPhase("summary")}
      />
    );
  };

  // ─── shared styles ─────────────────────────────────────────────────────
  const stepBtn = {
    width: 28, height: 28, display: "grid", placeItems: "center",
    background: "transparent", border: "none", color: "var(--ink-muted)",
    cursor: "pointer", borderRadius: 6,
  };
  const chipBtn = {
    height: 28, padding: "0 10px", background: "var(--bg-tint)",
    border: "1px solid var(--line)", borderRadius: 8, fontSize: 12,
    fontWeight: 600, color: "var(--ink-2)", cursor: "pointer",
    fontFamily: "inherit",
  };

  window.PPCookMode = { CookNow };
})();
