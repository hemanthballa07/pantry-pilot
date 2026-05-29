// screens/dashboard.jsx — New Today-focused Dashboard. window.PPDashboard

(function () {
  const { useState } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, Ring, Progress, Avatar, AvatarStack, ExpiryBadge,
          IngredientTile, Bars, ActivityRow, SectionHead, Chip } = window.PPUI;

  const Dashboard = ({ onNav, onOpenItem, onOpenRecipe, onAskPilot, onCookNow }) => {
    return (
      <div style={{ padding: "28px 28px 56px", display: "grid", gap: 20,
                      gridTemplateColumns: "minmax(0, 1fr) 360px" }}>
        {/* MAIN COLUMN ---------------------------------------------------- */}
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>

          {/* Today's Plan — hero */}
          <TodayPlan onOpenRecipe={onOpenRecipe} onCookNow={onCookNow}/>

          {/* Coverage + Waste Rescue */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20 }}>
            <CoverageScore onNav={onNav}/>
            <WasteRescue onCookNow={onCookNow} onOpenRecipe={onOpenRecipe}/>
          </div>

          {/* Expiring + Pilot */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            <ExpiringCard onOpenItem={onOpenItem} onCookNow={onCookNow} onNav={onNav}/>
            <PilotCard onAskPilot={onAskPilot}/>
          </div>

          {/* Kitchen Wins */}
          <KitchenWins/>

          {/* Plan + Budget row */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
            <WeekPreview onNav={onNav} onOpenRecipe={onOpenRecipe}/>
            <BudgetMini onNav={onNav}/>
          </div>
        </div>

        {/* SIDE COLUMN ---------------------------------------------------- */}
        <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
          <GroceryMini onNav={onNav}/>
          <LeftoversMini onNav={onNav}/>
          <NutritionMini onNav={onNav}/>
          <ActivityCard/>
        </div>
      </div>
    );
  };

  // ─── Today's Plan ────────────────────────────────────────────────────────
  const TodayPlan = ({ onOpenRecipe, onCookNow }) => {
    const tp = D.todayPlan;
    return (
      <Card pad={0} style={{ overflow: "hidden",
        background: "linear-gradient(165deg, var(--green-tint) 0%, #F2EBD1 100%)",
        borderColor: "var(--green-soft)" }}>
        <div style={{ padding: "26px 28px 20px", display: "flex",
                        alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                            fontWeight: 700, textTransform: "uppercase" }}>
              Today · Wednesday, Nov 25
            </div>
            <h2 className="serif" style={{ margin: "6px 0 6px", fontSize: 32, letterSpacing: -0.6,
                     lineHeight: 1.1, textWrap: "balance" }}>
              What you'll eat today.
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", maxWidth: 520, lineHeight: 1.5 }}>
              {tp.summary}
            </p>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <Pill tone="green" size="md" icon="check">No shopping needed</Pill>
            <Pill tone="orange" size="md" icon="alert">Uses spinach</Pill>
          </div>
        </div>
        <div style={{ padding: "0 28px 28px",
                        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {tp.slots.map(s => <PlanSlot key={s.slot} slot={s}
                              onOpen={() => s.recipe && onOpenRecipe(s.recipe)}
                              onCook={() => s.recipe && onCookNow(s.recipe)}/>)}
        </div>
      </Card>
    );
  };

  const PlanSlot = ({ slot, onOpen, onCook }) => {
    const slotLabel = { B: "Breakfast", L: "Lunch", D: "Dinner", S: "Snack" }[slot.slot];
    const isCook = slot.status === "tonight";
    return (
      <div className="lift" onClick={onOpen} style={{
        cursor: "pointer", background: "var(--paper)", borderRadius: 14,
        border: "1px solid var(--line)", padding: 0, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: 6, background: slot.tone }}/>
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10.5, color: slot.tone, fontWeight: 700,
                            letterSpacing: 0.5, textTransform: "uppercase" }}>{slotLabel}</span>
            <span className="tnum" style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 600 }}>
              {slot.time}
            </span>
          </div>
          <div className="serif" style={{ fontSize: 17, color: "var(--ink)", lineHeight: 1.2,
                                            letterSpacing: -0.2, marginBottom: 6 }}>
            {slot.name}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginBottom: 10 }}>
            {slot.kind}
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
            {slot.uses.slice(0, 3).map(u => (
              <span key={u} style={{ fontSize: 10, color: "var(--ink-muted)",
                                       background: "var(--bg-tint)", padding: "2px 6px",
                                       borderRadius: 999 }}>{u}</span>
            ))}
          </div>
          <div className="tnum" style={{ marginTop: "auto", display: "flex",
                                            gap: 10, fontSize: 11, color: "var(--ink-soft)" }}>
            <span>{slot.cal} cal</span>
            <span>·</span>
            <span>{slot.p}g protein</span>
          </div>
          <Button size="sm" variant={isCook ? "primary" : "secondary"} full
                  iconRight={isCook ? "arrowRight" : null}
                  onClick={(e) => { e.stopPropagation(); isCook ? onCook() : window.PPToast?.(`${slotLabel} ready`); }}
                  style={{ marginTop: 10 }}>
            {slot.status === "tonight" ? "Start cooking" :
             slot.status === "leftover" ? "Reheat" :
             slot.status === "ready" ? "Mark eaten" : "Open"}
          </Button>
        </div>
      </div>
    );
  };

  // ─── Pantry Coverage Score ───────────────────────────────────────────────
  const CoverageScore = ({ onNav }) => {
    const c = D.mealCoverage;
    return (
      <Card pad={22}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Pantry coverage</div>
          <button onClick={() => onNav("pantry")} style={linkBtn}>Open pantry<Icon name="chevronRight" size={12}/></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14 }}>
          <Ring value={c.days} max={7} size={92} stroke={10} color="var(--green)">
            <div style={{ textAlign: "center" }}>
              <div className="serif tnum" style={{ fontSize: 26, color: "var(--ink)", lineHeight: 1 }}>
                {c.days}
              </div>
              <div style={{ fontSize: 9.5, color: "var(--ink-muted)", marginTop: 2,
                              fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>days</div>
            </div>
          </Ring>
          <div style={{ flex: 1, display: "grid", gap: 6 }}>
            {[
              { l: "Breakfasts", v: c.breakfasts, max: 7, c: "var(--amber)" },
              { l: "Lunches",    v: c.lunches,    max: 7, c: "var(--green)" },
              { l: "Dinners",    v: c.dinners,    max: 7, c: "var(--tomato)" },
              { l: "Snacks",     v: c.snacks,     max: 7, c: "var(--orange)" },
            ].map(r => (
              <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ flex: "0 0 76px", fontSize: 11.5, color: "var(--ink-muted)" }}>{r.l}</div>
                <div style={{ flex: 1, height: 4, background: "var(--line-soft)", borderRadius: 999 }}>
                  <div style={{ width: `${(r.v / r.max) * 100}%`, height: "100%", background: r.c, borderRadius: 999 }}/>
                </div>
                <div className="tnum" style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--green-tint)",
                        border: "1px solid var(--green-soft)", borderRadius: 10,
                        display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="sparkles" size={14} stroke="var(--green-deep)"/>
          <span style={{ fontSize: 12, color: "var(--green-deep)", fontWeight: 600, flex: 1 }}>
            Buy <strong>tortillas</strong> and <strong>canned tomatoes</strong> to unlock 5 more meals.
          </span>
        </div>
      </Card>
    );
  };

  // ─── Waste Rescue preview ────────────────────────────────────────────────
  const WasteRescue = ({ onCookNow, onOpenRecipe }) => {
    const wr = D.wasteRescue;
    return (
      <Card pad={22}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--tomato)",
                            fontWeight: 700, textTransform: "uppercase" }}>3-Day Waste Rescue</div>
            <div className="serif" style={{ fontSize: 19, color: "var(--ink)", marginTop: 4 }}>
              Save ~<span className="tnum">${(wr.risk / 100).toFixed(2)}</span> this week
            </div>
          </div>
          <Pill tone="tomato" size="sm" dot>3 actions</Pill>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {wr.plan.map(p => (
            <div key={p.day} onClick={() => p.recipe && onOpenRecipe(p.recipe)}
              style={{
                display: "grid", gridTemplateColumns: "60px 1fr auto", gap: 10, alignItems: "center",
                padding: "10px 12px", background: "var(--paper-warm)",
                border: "1px solid var(--line-soft)", borderRadius: 10, cursor: "pointer",
              }}>
              <div style={{ fontSize: 11, color: "var(--tomato)", fontWeight: 700,
                              letterSpacing: 0.3, textTransform: "uppercase" }}>{p.day}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600, lineHeight: 1.25 }}>
                  {p.action}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>
                  {p.why}
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {p.illos.map(i => (
                  <div key={i} style={{ width: 26, height: 26, background: "var(--paper)",
                                          border: "1px solid var(--line-soft)", borderRadius: 7,
                                          display: "grid", placeItems: "center" }}>
                    <Illo name={i} size={18}/>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <Button full variant="primary" iconRight="arrowRight" style={{ marginTop: 14 }}
                onClick={() => onCookNow("r1")}>
          Start tonight's rescue
        </Button>
      </Card>
    );
  };

  // ─── Expiring card ───────────────────────────────────────────────────────
  const ExpiringCard = ({ onOpenItem, onCookNow, onNav }) => {
    const expiring = D.items.filter(i => ["today", "tomorrow", "week"].includes(i.status))
                              .sort((a, b) => a.expDays - b.expDays).slice(0, 6);
    return (
      <Card pad={22}>
        <SectionHead title="Expiring soon"
          eyebrow={`${expiring.length} items`}
          action={<button onClick={() => onNav("pantry")} style={linkBtn}>
            Use first<Icon name="chevronRight" size={12}/>
          </button>}/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {expiring.map(it => (
            <IngredientTile key={it.id} item={it} compact onClick={() => onOpenItem(it.id)}/>
          ))}
        </div>
      </Card>
    );
  };

  // ─── Pilot dark card ─────────────────────────────────────────────────────
  const PilotCard = ({ onAskPilot }) => (
    <Card pad={22} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                              borderColor: "var(--ink)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: "rgba(255,255,255,.06)",
                        color: "var(--amber)", display: "grid", placeItems: "center" }}>
          <Icon name="sparkles" size={15}/>
        </div>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.8, color: "rgba(253,250,243,.6)",
                          fontWeight: 700, textTransform: "uppercase" }}>Pilot</div>
          <div style={{ fontSize: 14.5, fontWeight: 600 }}>4 nudges for today</div>
        </div>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {D.pilotSuggestions.slice(0, 3).map(s => (
          <PilotSuggestion key={s.id} s={s}/>
        ))}
      </div>
      <Button full variant="ghost" iconRight="arrowRight" onClick={onAskPilot} style={{
        marginTop: 14, color: "var(--paper-warm)", borderColor: "rgba(255,255,255,.12)",
        background: "rgba(255,255,255,.03)",
      }}>
        Ask Pilot anything
      </Button>
    </Card>
  );

  const PilotSuggestion = ({ s }) => {
    const toneColor = {
      green:  "var(--green)",   tomato: "var(--tomato)",
      orange: "var(--orange)",  amber:  "var(--amber)",
    }[s.tone];
    return (
      <div style={{
        padding: "12px 14px",
        background: "rgba(255,255,255,.04)",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: 12, display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <div style={{ width: 26, height: 26, borderRadius: 8, background: `${toneColor}40`,
                        color: toneColor, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
          <Icon name={s.icon === "spark" ? "sparkles" : s.icon === "wallet" ? "wallet" :
                          s.icon === "leaf" ? "leaf" : "alert"} size={13}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--paper-warm)", marginBottom: 3 }}>
            {s.title}
          </div>
          <div style={{ fontSize: 12, color: "rgba(253,250,243,.65)", lineHeight: 1.45 }}>
            {s.body}
          </div>
        </div>
      </div>
    );
  };

  // ─── Kitchen Wins ────────────────────────────────────────────────────────
  const KitchenWins = () => (
    <Card pad={22}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Kitchen wins</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
            Quiet bragging rights · this month
          </div>
        </div>
        <Pill tone="green" size="sm" icon="sparkles">On a streak</Pill>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {D.kitchenWins.map(w => <WinCard key={w.id} win={w}/>)}
      </div>
    </Card>
  );

  const WinCard = ({ win }) => {
    const tone = {
      green:  { bg: "var(--green-tint)",  fg: "var(--green-deep)" },
      orange: { bg: "var(--orange-tint)", fg: "var(--orange-deep)" },
      amber:  { bg: "var(--amber-soft)",  fg: "var(--amber-ink)" },
      tomato: { bg: "var(--tomato-soft)", fg: "var(--tomato-ink)" },
    }[win.tone];
    return (
      <div style={{
        padding: "14px 16px", background: tone.bg, borderRadius: 12,
        border: `1px solid ${tone.fg}22`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: tone.fg, marginBottom: 8 }}>
          <Icon name={win.icon} size={14}/>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>
            {win.title}
          </span>
        </div>
        <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", lineHeight: 1.1, letterSpacing: -0.3 }}>
          {win.value}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.4 }}>
          {win.sub}
        </div>
      </div>
    );
  };

  // ─── Week preview ────────────────────────────────────────────────────────
  const WeekPreview = ({ onNav, onOpenRecipe }) => {
    const recipeById = (id) => D.recipes.find(r => r.id === id);
    return (
      <Card pad={22}>
        <SectionHead title="This week" eyebrow="Mon · Nov 23 — Sun · Nov 29"
          action={<button onClick={() => onNav("plan")} style={linkBtn}>Open plan<Icon name="chevronRight" size={12}/></button>}/>
        <div style={{ display: "grid", gridTemplateColumns: "auto repeat(7, 1fr)", gap: 6 }}>
          <div/>
          {D.days.map(d => (
            <div key={d} style={{ fontSize: 11, color: d === "Wed" ? "var(--ink)" : "var(--ink-muted)",
                                    fontWeight: 700, textAlign: "center", padding: "4px 0",
                                    letterSpacing: 0.4, textTransform: "uppercase" }}>
              {d}
            </div>
          ))}
          {["B", "L", "D"].map(slot => (
            <React.Fragment key={slot}>
              <div style={{ fontSize: 10, color: "var(--ink-soft)", padding: "8px 8px 0 0",
                              fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                {slot === "B" ? "Br" : slot === "L" ? "Lun" : "Din"}
              </div>
              {D.days.map(d => {
                const rid = D.mealPlan[d][slot];
                const r = rid ? recipeById(rid) : null;
                return (
                  <div key={d + slot} onClick={() => r && onOpenRecipe(r.id)} style={{
                    minHeight: 44, borderRadius: 8, padding: "6px 8px", cursor: r ? "pointer" : "default",
                    background: r ? "var(--paper-warm)" : "var(--bg-tint)",
                    border: `1px solid ${r ? "var(--line-soft)" : "var(--line-soft)"}`,
                    position: "relative", overflow: "hidden",
                  }}>
                    {r ? (
                      <>
                        <div style={{ position: "absolute", top: 0, left: 0, width: 2, height: "100%",
                                        background: r.tone }}/>
                        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-2)", lineHeight: 1.2,
                                        paddingLeft: 4 }}>
                          {r.name.split(" ").slice(0, 2).join(" ")}
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 9.5, color: "var(--ink-soft)", textAlign: "center",
                                      paddingTop: 6, fontStyle: "italic" }}>
                        {slot === "L" ? "leftover" : "—"}
                      </div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>
    );
  };

  // ─── Budget mini ─────────────────────────────────────────────────────────
  const BudgetMini = ({ onNav }) => {
    const b = D.budget;
    const pct = (b.spent / b.monthly) * 100;
    return (
      <Card pad={22} hover onClick={() => onNav("insights")} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Budget · November</div>
          <Pill tone="green" size="sm" icon="check">On track</Pill>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
          <span className="serif tnum" style={{ fontSize: 30, color: "var(--ink)", lineHeight: 1 }}>
            ${b.spent.toFixed(0)}
          </span>
          <span className="tnum" style={{ fontSize: 14, color: "var(--ink-muted)" }}>/ ${b.monthly}</span>
        </div>
        <Progress value={pct} max={100} tone="green" height={8}/>
        <div className="tnum" style={{ display: "flex", justifyContent: "space-between",
                          marginTop: 8, fontSize: 11.5, color: "var(--ink-muted)" }}>
          <span>{Math.round(pct)}% used</span>
          <span style={{ color: "var(--green-deep)", fontWeight: 600 }}>+$42 saved this week</span>
        </div>
      </Card>
    );
  };

  // ─── Nutrition mini ──────────────────────────────────────────────────────
  const NutritionMini = ({ onNav }) => {
    const n = D.nutrition;
    return (
      <Card pad={22} hover onClick={() => onNav("insights")} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Today's plate</div>
          <Pill tone="amber" size="sm">+ protein</Pill>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "space-around" }}>
          {[
            { label: "Cals",    v: n.cals.value,    max: n.cals.target,    color: "var(--orange)", unit: "" },
            { label: "Protein", v: n.protein.value, max: n.protein.target, color: "var(--tomato)", unit: "g" },
            { label: "Fiber",   v: n.fiber.value,   max: n.fiber.target,   color: "var(--green)",  unit: "g" },
          ].map(it => (
            <Ring key={it.label} value={it.v} max={it.max} size={60} stroke={6} color={it.color}>
              <div style={{ textAlign: "center" }}>
                <div className="tnum" style={{ fontSize: 12, color: "var(--ink)", fontWeight: 700, lineHeight: 1 }}>
                  {it.v}{it.unit}
                </div>
                <div style={{ fontSize: 8.5, color: "var(--ink-muted)", marginTop: 2, fontWeight: 700, letterSpacing: 0.4 }}>
                  {it.label.toUpperCase()}
                </div>
              </div>
            </Ring>
          ))}
        </div>
      </Card>
    );
  };

  // ─── Grocery mini ────────────────────────────────────────────────────────
  const GroceryMini = ({ onNav }) => {
    const items = D.grocery.filter(g => !g.bought);
    const total = items.reduce((s, g) => s + g.price, 0);
    return (
      <Card pad={22} hover onClick={() => onNav("shop")} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Grocery list</div>
          <Pill tone="neutral" size="sm">{items.length} items</Pill>
        </div>
        <div className="serif tnum" style={{ fontSize: 26, color: "var(--ink)", lineHeight: 1, marginBottom: 4 }}>
          ${total.toFixed(2)}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 14 }}>
          Cheapest at Aldi · ~$10.90 less
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {items.slice(0, 4).map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10,
                          padding: "7px 0", borderBottom: "1px solid var(--line-soft)" }}>
              <div style={{ width: 16, height: 16, borderRadius: 5, border: "1.5px solid var(--line-strong)",
                              flex: "0 0 auto" }}/>
              <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)", minWidth: 0,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.name}</div>
              <div className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 600 }}>
                ${g.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        <Button full variant="soft" iconRight="arrowRight" onClick={(e) => { e.stopPropagation(); onNav("shop"); }}
                style={{ marginTop: 12 }}>
          Open list
        </Button>
      </Card>
    );
  };

  // ─── Leftovers mini ──────────────────────────────────────────────────────
  const LeftoversMini = ({ onNav }) => {
    const list = D.leftovers;
    const openLeftovers = () => {
      onNav("pantry");
      setTimeout(() => window.PPPantryTab?.("leftovers"), 0);
    };
    return (
      <Card pad={22} hover onClick={openLeftovers} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase" }}>Leftovers to use</div>
          <Pill tone="orange" size="sm" dot>{list.filter(l => l.days <= 1).length} soon</Pill>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {list.slice(0, 3).map(l => {
            const eatToday = l.days === 0;
            return (
              <div key={l.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: 10,
                background: eatToday ? "var(--tomato-soft)" :
                             l.days === 1 ? "var(--amber-soft)" : "var(--paper-warm)",
                border: `1px solid ${eatToday ? "var(--tomato-line)" : l.days === 1 ? "var(--amber-line)" : "var(--line-soft)"}`,
              }}>
                <div style={{ width: 32, height: 32, background: "var(--on-tint-pad)",
                                borderRadius: 8, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Illo name={l.illo} size={22}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25,
                                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.meal}
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 1 }}>
                    {l.servings} serving{l.servings > 1 ? "s" : ""} · use by {l.useBy}
                  </div>
                </div>
                {eatToday && <Pill tone="tomato" size="sm">Today</Pill>}
              </div>
            );
          })}
        </div>
        <Button full variant="soft" iconRight="arrowRight" onClick={(e) => { e.stopPropagation(); openLeftovers(); }}
                style={{ marginTop: 12 }}>
          Open leftovers
        </Button>
      </Card>
    );
  };

  // ─── Activity card ───────────────────────────────────────────────────────
  const ActivityCard = () => (
    <Card pad={22}>
      <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                      fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
        Kitchen activity
      </div>
      <div>
        {D.activity.slice(0, 5).map((a, i) => <ActivityRow key={i} act={a}/>)}
      </div>
    </Card>
  );

  const linkBtn = {
    border: "none", background: "transparent", color: "var(--ink-muted)",
    fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex",
    alignItems: "center", gap: 3,
  };

  window.PPDashboard = { Dashboard };
})();
