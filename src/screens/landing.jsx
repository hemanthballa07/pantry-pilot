// screens/landing.jsx — Marketing landing page. window.PPLanding

(function () {
  const { useState } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Button, Pill, Card, ExpiryBadge, IngredientTile, Ring, Avatar, AvatarStack } = window.PPUI;
  const { Logo } = window.PPShell;

  const Landing = ({ onEnter, onOnboard }) => {
    const goto = (id) => (e) => {
      e?.preventDefault();
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const navLinks = [
      { label: "Product",    onClick: goto("section-features") },
      { label: "Recipes",    onClick: () => onEnter("cook") },
      { label: "Households", onClick: () => onEnter("household") },
      { label: "Pricing",    onClick: goto("section-cta") },
      { label: "About",      onClick: goto("section-quote") },
    ];
    const footerLinks = [
      { label: "Help",    onClick: () => onEnter("settings") },
      { label: "Privacy", onClick: goto("section-features") },
      { label: "Terms",   onClick: goto("section-features") },
      { label: "Status",  onClick: goto("section-features") },
      { label: "Press",   onClick: goto("section-quote") },
    ];
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--ink)" }}>
        {/* Top nav */}
        <header style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(250,246,238,.82)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--line-soft)",
          padding: "16px 48px",
          display: "flex", alignItems: "center", gap: 28,
        }}>
          <button onClick={goto("page-top")} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
          }}>
            <Logo size={30}/>
            <div className="serif" style={{ fontSize: 19, letterSpacing: -0.3, color: "var(--ink)" }}>
              PantryPilot
            </div>
          </button>
          <nav style={{ display: "flex", gap: 22, marginLeft: 24 }}>
            {navLinks.map(l => (
              <button key={l.label} onClick={l.onClick} style={{
                background: "transparent", border: "none", cursor: "pointer", padding: 0,
                color: "var(--ink-muted)", fontSize: 13.5, fontWeight: 500, fontFamily: "inherit",
                transition: "color 120ms",
              }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--ink)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--ink-muted)"}>
                {l.label}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1 }}/>
          <button onClick={() => onEnter("dashboard")} style={{
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            color: "var(--ink-muted)", fontSize: 13.5, fontWeight: 500, fontFamily: "inherit",
          }}>Sign in</button>
          <Button variant="primary" size="sm" onClick={onOnboard} iconRight="arrowRight">
            Open kitchen
          </Button>
        </header>
        <div id="page-top"/>

        {/* Hero */}
        <section style={{ padding: "72px 48px 48px", position: "relative", overflow: "hidden" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid",
                          gridTemplateColumns: "1.05fr .95fr", gap: 56, alignItems: "center" }}>
            <div>
              <Pill tone="green" size="lg" icon="sparkles">Backed by Pilot, your kitchen AI</Pill>
              <h1 className="serif" style={{
                fontSize: 76, lineHeight: 1.02, letterSpacing: -1.5,
                margin: "20px 0 22px", color: "var(--ink)",
                textWrap: "balance",
              }}>
                Waste less food. <br/>
                <em style={{ fontStyle: "italic", color: "var(--green-deep)" }}>Cook smarter</em> every week.
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 540,
                            margin: "0 0 32px" }}>
                PantryPilot knows what's in your kitchen, nudges you before food expires,
                and turns what you already have into dinner — without another grocery run.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Button variant="primary" size="lg" onClick={onOnboard} iconRight="arrowRight">
                  Start your kitchen
                </Button>
                <Button variant="secondary" size="lg" icon="circle" onClick={onEnter}>
                  Watch the demo · 90s
                </Button>
              </div>
              <div style={{ marginTop: 36, display: "flex", alignItems: "center", gap: 14 }}>
                <AvatarStack people={[
                  { initials: "HB", color: "#3B6E3D" },
                  { initials: "AC", color: "#D9722B" },
                  { initials: "MP", color: "#6E3A4F" },
                  { initials: "JD", color: "#3A5F7A" },
                  { initials: "KR", color: "#C73E2E" },
                ]} size={30}/>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                  <strong style={{ color: "var(--ink-2)" }}>14,200+</strong> households cooking from their pantry
                </div>
              </div>
            </div>

            {/* Hero visual: stacked dashboard glimpse */}
            <HeroVisual/>
          </div>

          {/* Decorative produce floats */}
          <FloatProduce/>
        </section>

        {/* Logo strip / pain band */}
        <section style={{ padding: "32px 48px", borderTop: "1px solid var(--line-soft)",
                            borderBottom: "1px solid var(--line-soft)", background: "var(--paper-warm)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto",
                          display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap",
                          justifyContent: "space-between" }}>
            <div style={{ fontSize: 12, letterSpacing: 1, color: "var(--ink-muted)",
                           textTransform: "uppercase", fontWeight: 700 }}>
              The kitchen most of us actually run
            </div>
            {[
              { num: "$1,500", label: "wasted on spoiled food / household / year" },
              { num: "32%",    label: "of groceries thrown out before they're used" },
              { num: "4.5×",   label: "more takeout when nothing in the fridge inspires" },
              { num: "21 min", label: "the average decide-what-to-cook spiral" },
            ].map(s => (
              <div key={s.num} style={{ display: "flex", flexDirection: "column" }}>
                <div className="serif" style={{ fontSize: 24, color: "var(--ink)" }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", maxWidth: 200 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features 1 — Three pillars */}
        <section id="section-features" style={{ padding: "96px 48px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <SectionHead
              eyebrow="What PantryPilot does"
              title={<>One question, every day: <em style={{ color: "var(--green-deep)", fontStyle: "italic" }}>what should I cook?</em></>}
              sub="Inventory, expiry, recipes, planning, grocery, budget — all in one calm place."
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 40 }}>
              <FeatureCard tone="green" icon="pantry"
                title="Know what you have"
                body="A clean inventory across pantry, fridge, freezer, and leftovers. Scan a receipt or barcode; everything organizes itself."
                visual={<InventoryGlance/>}/>
              <FeatureCard tone="orange" icon="clock"
                title="Stop tossing food"
                body="Color-coded expiry, friendly nudges, and recipes that use what's about to spoil — before it does."
                visual={<ExpiryGlance/>}/>
              <FeatureCard tone="amber" icon="chef"
                title="Cook from what you have"
                body="Pilot suggests meals you can make right now, ranks them by ingredient match and freshness, and walks you through cooking."
                visual={<RecipeGlance/>}/>
            </div>
          </div>
        </section>

        {/* Big visual split — Meal planner */}
        <section style={{ padding: "0 48px 96px" }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            background: "linear-gradient(165deg, #F4EEDF 0%, #ECE3CB 100%)",
            borderRadius: 28, padding: "64px 56px", overflow: "hidden", position: "relative",
            border: "1px solid var(--line)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr", gap: 56, alignItems: "center" }}>
              <div>
                <Pill tone="green" size="md">Weekly meal plan</Pill>
                <h2 className="serif" style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: -1,
                       margin: "16px 0 18px", textWrap: "balance" }}>
                  Plan a whole week in one calm screen.
                </h2>
                <p style={{ fontSize: 17, lineHeight: 1.55, color: "var(--ink-2)", maxWidth: 480 }}>
                  Drag recipes onto a calendar. Pilot balances protein, fits your budget, and prefers ingredients
                  you already have. Your grocery list writes itself.
                </p>
                <ul style={{ marginTop: 24, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
                  {["Auto-fills around what's expiring", "Generates a sectioned grocery list", "Adjusts for high-protein, vegetarian, or under-$60 weeks"]
                    .map(x => (
                    <li key={x} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5, color: "var(--ink-2)" }}>
                      <span style={{ width: 22, height: 22, borderRadius: 999, background: "var(--green-soft)",
                                       color: "var(--green-deep)", display: "grid", placeItems: "center" }}>
                        <Icon name="check" size={13}/>
                      </span>
                      {x}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 30 }}>
                  <Button variant="primary" iconRight="arrowRight" onClick={onEnter}>Open meal planner</Button>
                </div>
              </div>
              <PlannerGlance/>
            </div>
          </div>
        </section>

        {/* Quote band */}
        <section id="section-quote" style={{ padding: "32px 48px 96px" }}>
          <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: 36, color: "var(--green-deep)", marginBottom: 12 }} className="serif">“</div>
            <p className="serif" style={{ fontSize: 32, lineHeight: 1.25, letterSpacing: -0.5,
                                            color: "var(--ink)", margin: 0, textWrap: "balance" }}>
              I haven't ordered Uber Eats out of decision fatigue in three weeks. The fridge actually
              tells me what to cook now — and I throw out almost nothing.
            </p>
            <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Avatar initials="MR" color="var(--plum)" size={32}/>
              <div style={{ textAlign: "left", fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: "var(--ink)" }}>Mira R.</div>
                <div style={{ color: "var(--ink-muted)" }}>Graduate student · Brooklyn</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features 2 — Budget + Household + AI */}
        <section style={{ padding: "0 48px 96px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto",
                          display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            <Card pad={36} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                                     borderColor: "var(--ink)", overflow: "hidden", position: "relative" }}>
              <Pill tone="ghost" size="md">
                <span style={{ color: "var(--amber)" }}><Icon name="sparkles" size={12}/></span>
                <span style={{ color: "var(--paper-warm)", opacity: 0.85 }}>Ask Pilot</span>
              </Pill>
              <h2 className="serif" style={{ fontSize: 38, margin: "18px 0 14px",
                       lineHeight: 1.1, letterSpacing: -0.6 }}>
                Your kitchen's quiet co-pilot.
              </h2>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(253,250,243,.78)",
                            maxWidth: 460, margin: 0 }}>
                Pilot watches your pantry, suggests recipes from what's about to expire,
                rewrites your shopping list when you change your mind, and texts you
                a heads-up before you double-buy.
              </p>
              <div style={{ marginTop: 28, display: "grid", gap: 10 }}>
                {[
                  "“What can I make with rice, eggs, and onions in 20 minutes?”",
                  "“Plan a $60 high-protein week.”",
                  "“What's expiring this week?”",
                ].map(q => (
                  <div key={q} style={{
                    padding: "12px 14px",
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 12, fontSize: 13.5,
                    color: "var(--paper-warm)",
                  }}>{q}</div>
                ))}
              </div>
              {/* Decorative grain dot pattern */}
              <div style={{
                position: "absolute", right: -40, bottom: -40, width: 220, height: 220,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(217,114,43,0.25) 0%, transparent 70%)",
                pointerEvents: "none",
              }}/>
            </Card>
            <div style={{ display: "grid", gap: 20 }}>
              <Card pad={28} style={{ background: "var(--green-tint)", borderColor: "var(--green-soft)" }}>
                <Pill tone="green" size="md" icon="wallet">Budget aware</Pill>
                <h3 className="serif" style={{ fontSize: 26, margin: "12px 0 10px", letterSpacing: -0.3 }}>
                  See where your $250 goes.
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55, maxWidth: 420 }}>
                  Monthly budget rings, store comparisons, and a waste cost line so you can spot the
                  spinach that keeps coming home and leaving in the bin.
                </p>
                <BudgetGlance/>
              </Card>
              <Card pad={28} style={{ background: "var(--orange-tint)", borderColor: "var(--orange-soft)" }}>
                <Pill tone="orange" size="md" icon="users">Shared kitchens</Pill>
                <h3 className="serif" style={{ fontSize: 26, margin: "12px 0 10px", letterSpacing: -0.3 }}>
                  Built for roommates and families.
                </h3>
                <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55, maxWidth: 420 }}>
                  Shared pantry, personal items, ownership labels, and a grocery list that warns the
                  second person before they buy that third box of pasta.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: "0 48px 120px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <SectionHead eyebrow="How it works" title="Three steps to a calmer kitchen."/>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 32 }}>
              {[
                { n: "01", t: "Stock the pantry",
                  d: "Snap a grocery receipt, scan barcodes, or add items by hand. Expiry dates fill in automatically.",
                  icon: "scan", tone: "var(--green)" },
                { n: "02", t: "Pilot watches everything",
                  d: "Quietly tracks freshness, low staples, your habits — and surfaces the ones that matter today.",
                  icon: "sparkles", tone: "var(--orange)" },
                { n: "03", t: "Cook, plan, repeat",
                  d: "Recipes from what you have. A meal plan that fits your week. A grocery list that fits your budget.",
                  icon: "chef", tone: "var(--tomato)" },
              ].map(s => (
                <Card key={s.n} pad={28} style={{ minHeight: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: "var(--bg-tint)",
                      color: s.tone, display: "grid", placeItems: "center",
                      border: "1px solid var(--line)",
                    }}>
                      <Icon name={s.icon} size={18}/>
                    </div>
                    <span className="serif tnum" style={{ color: "var(--ink-soft)", fontSize: 18 }}>{s.n}</span>
                  </div>
                  <h3 className="serif" style={{ fontSize: 22, margin: "0 0 8px", letterSpacing: -0.3 }}>{s.t}</h3>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>{s.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="section-cta" style={{ padding: "0 48px 80px" }}>
          <div style={{
            maxWidth: 1280, margin: "0 auto",
            background: "var(--ink)", borderRadius: 28, padding: "64px 56px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 32, flexWrap: "wrap", color: "var(--paper-warm)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ maxWidth: 620, position: "relative", zIndex: 2 }}>
              <h2 className="serif" style={{ fontSize: 52, lineHeight: 1.05, letterSpacing: -1,
                       margin: "0 0 16px" }}>
                Open your kitchen.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(253,250,243,.7)", margin: 0, maxWidth: 480 }}>
                Free to start. No card. Connects with grocery receipts, barcodes, and your household.
                Two minutes to set up, calmer kitchen by Friday.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 2 }}>
              <Button variant="orange" size="lg" iconRight="arrowRight" onClick={onOnboard}>
                Open kitchen
              </Button>
              <Button size="lg" onClick={onEnter} style={{
                background: "transparent", color: "var(--paper-warm)",
                border: "1px solid rgba(253,250,243,.25)",
              }}>View demo</Button>
            </div>
            {/* Decorative produce */}
            <div style={{ position: "absolute", right: -30, bottom: -30, opacity: 0.4 }}>
              <Illo name="tomato" size={180}/>
            </div>
            <div style={{ position: "absolute", right: 160, top: -20, opacity: 0.35 }}>
              <Illo name="spinach" size={120}/>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: "32px 48px 48px", borderTop: "1px solid var(--line-soft)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex",
                          alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo size={24}/>
              <span className="serif" style={{ fontSize: 15 }}>PantryPilot</span>
              <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>· Made for kitchens that get used</span>
            </div>
            <div style={{ display: "flex", gap: 22 }}>
              {footerLinks.map(l => (
                <button key={l.label} onClick={l.onClick} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: 0,
                  color: "var(--ink-muted)", fontSize: 12.5, fontFamily: "inherit",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--ink-2)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--ink-muted)"}>
                  {l.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>© 2026 PantryPilot Co-op</div>
          </div>
        </footer>
      </div>
    );
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const SectionHead = ({ eyebrow, title, sub }) => (
    <div style={{ maxWidth: 760 }}>
      {eyebrow && (
        <div style={{ fontSize: 12, letterSpacing: 1, color: "var(--green-deep)",
                       fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
          {eyebrow}
        </div>
      )}
      <h2 className="serif" style={{ fontSize: 42, lineHeight: 1.05, letterSpacing: -0.8,
            margin: "0 0 12px", textWrap: "balance" }}>{title}</h2>
      {sub && <p style={{ fontSize: 16, color: "var(--ink-muted)", margin: 0, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );

  const FeatureCard = ({ tone, icon, title, body, visual }) => {
    const toneMap = {
      green:  { bg: "var(--green-tint)",  bd: "var(--green-soft)",  pillBg: "var(--green-soft)",  pillFg: "var(--green-deep)" },
      orange: { bg: "var(--orange-tint)", bd: "var(--orange-soft)", pillBg: "var(--orange-soft)", pillFg: "var(--orange-deep)" },
      amber:  { bg: "var(--amber-soft)",  bd: "var(--line)",        pillBg: "#F1E2BA",            pillFg: "var(--amber-ink)" },
    }[tone];
    return (
      <Card pad={0} hover style={{ overflow: "hidden", background: toneMap.bg, borderColor: toneMap.bd, height: 460 }}>
        <div style={{ padding: 28 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: toneMap.pillBg,
                          color: toneMap.pillFg, display: "grid", placeItems: "center",
                          marginBottom: 16, border: "1px solid var(--on-tint-border)" }}>
            <Icon name={icon} size={18}/>
          </div>
          <h3 className="serif" style={{ fontSize: 26, margin: "0 0 10px", letterSpacing: -0.4, textWrap: "balance" }}>
            {title}
          </h3>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: 0, lineHeight: 1.55 }}>{body}</p>
        </div>
        <div style={{ flex: 1, padding: "0 28px 28px", display: "flex", alignItems: "flex-end" }}>
          {visual}
        </div>
      </Card>
    );
  };

  // Tiny dashboard preview embedded in hero
  const HeroVisual = () => (
    <div style={{ position: "relative", height: 540 }}>
      {/* Back card — pantry grid */}
      <Card pad={20} style={{
        position: "absolute", top: 0, right: 0, width: 460, transform: "rotate(2.5deg)",
        boxShadow: "var(--sh-3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 11.5, letterSpacing: 0.8, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Your fridge · today</div>
          <Pill tone="tomato" size="sm" icon="alert">4 use soon</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {["spinach", "egg", "rice", "tomato", "yogurt", "carrot"].map((n, i) => (
            <div key={n} style={{
              background: i < 2 ? "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)"
                                 : i < 4 ? "linear-gradient(160deg, #F4E6C8 0%, #EFD7A4 100%)"
                                 : "linear-gradient(160deg, #E5EBD5 0%, #D2DFB6 100%)",
              borderRadius: 12, padding: 12, display: "grid", placeItems: "center",
              border: "1px solid var(--on-tint-border)",
            }}>
              <Illo name={n} size={42}/>
            </div>
          ))}
        </div>
      </Card>

      {/* Front card — Pilot suggestion */}
      <Card pad={22} style={{
        position: "absolute", top: 200, left: 0, width: 380,
        boxShadow: "var(--sh-lift)", borderColor: "var(--line-strong)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: "var(--ink)",
                          color: "var(--amber)", display: "grid", placeItems: "center" }}>
            <Icon name="sparkles" size={15}/>
          </div>
          <div style={{ fontSize: 11.5, letterSpacing: 0.8, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Pilot suggests · 7:14 pm</div>
        </div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.2, color: "var(--ink)",
                                          letterSpacing: -0.3, marginBottom: 12 }}>
          Make Schezwan fried rice tonight.
        </div>
        <div style={{ fontSize: 13.5, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 14 }}>
          Uses your <strong style={{ color: "var(--tomato)" }}>spinach</strong>, leftover rice, and eggs.
          18 minutes, $2.40 a serving.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); window.PPToast?.("Open the kitchen to start cooking"); }}>Cook now</Button>
          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); window.PPToast?.("Saved"); }}>Save</Button>
        </div>
      </Card>

      {/* Floating ring */}
      <Card pad={18} style={{
        position: "absolute", bottom: 0, right: 40, width: 200,
        transform: "rotate(-3deg)", boxShadow: "var(--sh-3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Ring value={84} size={62} stroke={7} color="var(--green)">
            <div className="serif tnum" style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>84</div>
          </Ring>
          <div>
            <div style={{ fontSize: 11.5, color: "var(--ink-muted)", fontWeight: 600 }}>Pantry health</div>
            <div style={{ fontSize: 12, color: "var(--green-deep)", fontWeight: 600 }}>Good</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const FloatProduce = () => (
    <>
      <div style={{ position: "absolute", left: -30, top: 320, opacity: 0.5,
                       transform: "rotate(-12deg)" }}>
        <Illo name="carrot" size={120}/>
      </div>
      <div style={{ position: "absolute", left: 80, bottom: -20, opacity: 0.4,
                       transform: "rotate(6deg)" }}>
        <Illo name="onion" size={90}/>
      </div>
    </>
  );

  const InventoryGlance = () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, width: "100%" }}>
      {["egg", "milk", "pepper", "rice", "tomato", "spinach", "garlic", "yogurt"].map(n => (
        <div key={n} style={{ aspectRatio: "1 / 1", background: "var(--paper-warm)",
                               borderRadius: 10, display: "grid", placeItems: "center",
                               border: "1px solid var(--line-soft)" }}>
          <Illo name={n} size={32}/>
        </div>
      ))}
    </div>
  );

  const ExpiryGlance = () => (
    <div style={{ width: "100%", display: "grid", gap: 8 }}>
      {[
        { n: "spinach", name: "Spinach",     status: "tomorrow", time: "Tomorrow" },
        { n: "rice",    name: "Cooked rice", status: "today",    time: "Use today" },
        { n: "milk",    name: "Whole milk",  status: "week",     time: "2 days" },
        { n: "egg",     name: "Eggs",        status: "fresh",    time: "9 days" },
      ].map(r => (
        <div key={r.n} style={{
          background: "var(--paper-warm)", borderRadius: 10, padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line-soft)",
        }}>
          <Illo name={r.n} size={28}/>
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{r.name}</div>
          <ExpiryBadge status={r.status} expires={r.time} size="sm"/>
        </div>
      ))}
    </div>
  );

  const RecipeGlance = () => (
    <div style={{ width: "100%", background: "var(--paper)", border: "1px solid var(--line)",
                    borderRadius: 14, overflow: "hidden" }}>
      <div style={{
        height: 90, background:
          "linear-gradient(135deg, #C73E2E 0%, #D9722B 100%)",
        display: "grid", placeItems: "center", position: "relative",
      }}>
        <Illo name="rice" size={56}/>
        <div style={{ position: "absolute", top: 8, left: 8 }}>
          <Pill tone="ink" size="sm">92% match</Pill>
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Schezwan Egg Fried Rice</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>18 min · Easy · $2.40/serving</div>
      </div>
    </div>
  );

  const PlannerGlance = () => {
    const meals = [
      ["B", "Banana oat pancakes", "var(--amber)"],
      ["L", "Chickpea rice bowl",  "var(--green)"],
      ["D", "Schezwan fried rice", "var(--tomato)"],
    ];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <Card pad={20} style={{ boxShadow: "var(--sh-3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 17 }}>This week</div>
          <Pill tone="green" size="sm" icon="check">Balanced</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: 6,
                        fontSize: 11, color: "var(--ink-muted)", marginBottom: 8, fontWeight: 600 }}>
          <div/>
          {days.map(d => <div key={d} style={{ textAlign: "center" }}>{d}</div>)}
        </div>
        {meals.map(([k, label, tone]) => (
          <div key={k} style={{ display: "grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: 6, marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, padding: "8px 8px 0 0" }}>{k}</div>
            {days.map((d, i) => (
              <div key={d} style={{
                height: 46, borderRadius: 8, background: i === 1 && k === "L" ? "var(--bg-tint)" : "var(--paper-warm)",
                border: "1px solid var(--line)", padding: "4px 6px",
                position: "relative", overflow: "hidden",
              }}>
                {i === 1 && k === "L" ? (
                  <div style={{ fontSize: 9.5, color: "var(--ink-soft)", textAlign: "center", marginTop: 14 }}>leftover</div>
                ) : (
                  <>
                    <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: tone }}/>
                    <div style={{ fontSize: 9.5, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.2,
                                    paddingLeft: 4 }}>
                      {label.split(" ").slice(0, 2).join(" ")}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}
        <div style={{ marginTop: 18, padding: "12px 14px", background: "var(--green-tint)",
                        border: "1px solid var(--green-soft)", borderRadius: 12,
                        display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="sparkles" size={16} stroke="var(--green-deep)"/>
          <div style={{ fontSize: 12.5, color: "var(--green-deep)", fontWeight: 600, flex: 1 }}>
            Pilot built a grocery list: 11 items · est. $42
          </div>
          <Icon name="chevronRight" size={14} stroke="var(--green-deep)"/>
        </div>
      </Card>
    );
  };

  const BudgetGlance = () => (
    <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 18 }}>
      <Ring value={74} size={84} stroke={9} color="var(--green)" trackColor="rgba(60,50,30,.08)">
        <div style={{ textAlign: "center" }}>
          <div className="serif tnum" style={{ fontSize: 20, color: "var(--ink)", lineHeight: 1 }}>$184</div>
          <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2, fontWeight: 600 }}>of $250</div>
        </div>
      </Ring>
      <div style={{ flex: 1 }}>
        {[
          { c: "Produce", v: 42, color: "var(--green)" },
          { c: "Dairy",   v: 22, color: "var(--amber)" },
          { c: "Meat",    v: 17, color: "var(--tomato)" },
          { c: "Grains",  v: 12, color: "var(--orange)" },
        ].map(r => (
          <div key={r.c} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: r.color }}/>
            <div style={{ fontSize: 11.5, color: "var(--ink-2)", flex: 1, fontWeight: 600 }}>{r.c}</div>
            <div className="tnum" style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{r.v}%</div>
          </div>
        ))}
      </div>
    </div>
  );

  window.PPLanding = { Landing };
})();
