// screens/planner.jsx — Meal Planner. window.PPPlanner

(function () {
  const { useState } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, Chip, Tabs, Progress } = window.PPUI;

  const PLAN_TEMPLATES = [
    { id: "balanced", l: "Use what I have", icon: "leaf",   tone: "green" },
    { id: "protein",  l: "High-protein",    icon: "flame",  tone: "tomato" },
    { id: "budget",   l: "Under $60",       icon: "wallet", tone: "amber" },
    { id: "veg",      l: "Vegetarian",      icon: "leaf",   tone: "green" },
    { id: "prep",     l: "Meal prep Sun.",  icon: "save",   tone: "orange" },
    { id: "fast",     l: "20-min meals",    icon: "timer",  tone: "neutral" },
  ];

  const Planner = ({ onOpenRecipe, onNav, onPushToast }) => {
    const [tab, setTab] = useState("week");
    return (
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
                        justifyContent: "space-between", marginBottom: 18 }}>
          <Tabs tabs={[
            { label: "Weekly plan",   value: "week" },
            { label: "Budget basket", value: "basket" },
            { label: "Occasions",     value: "occasion" },
          ]} value={tab} onChange={setTab}/>
        </div>
        <div style={{ paddingBottom: 56 }}>
          {tab === "week"     && <WeeklyPlan onOpenRecipe={onOpenRecipe} onNav={onNav} onPushToast={onPushToast}/>}
          {tab === "basket"   && <BudgetBasket onOpenRecipe={onOpenRecipe} onPushToast={onPushToast}/>}
          {tab === "occasion" && <OccasionPlans onPushToast={onPushToast}/>}
        </div>
      </div>
    );
  };

  // ─── Weekly Plan (was Planner before) ────────────────────────────────────
  const WeeklyPlan = ({ onOpenRecipe, onNav, onPushToast }) => {
    const [template, setTemplate] = useState("balanced");
    const [draggedRecipe, setDraggedRecipe] = useState(null);
    const [hovered, setHovered] = useState(null); // { day, slot }
    const [plan, setPlan] = useState(() => JSON.parse(JSON.stringify(D.mealPlan)));

    const recipeById = (id) => D.recipes.find(r => r.id === id);
    const totalRecipes = D.days.flatMap(d => Object.values(plan[d])).filter(Boolean).length;
    const totalCost = D.days.flatMap(d => Object.values(plan[d]))
                              .filter(Boolean).map(id => recipeById(id)?.cost || 0)
                              .reduce((s, c) => s + c * 2, 0); // 2 servings each
    const protein = D.days.flatMap(d => Object.values(plan[d]))
                             .filter(Boolean).map(id => recipeById(id)?.protein || 0)
                             .reduce((s, p) => s + p, 0);

    const onDrop = (day, slot) => {
      if (!draggedRecipe) return;
      setPlan(p => ({ ...p, [day]: { ...p[day], [slot]: draggedRecipe } }));
      onPushToast?.(`Added ${recipeById(draggedRecipe)?.name} to ${day} · ${slot}`, { icon: "check" });
      setDraggedRecipe(null);
      setHovered(null);
    };

    const clearSlot = (day, slot) => {
      setPlan(p => ({ ...p, [day]: { ...p[day], [slot]: null } }));
    };

    return (
      <div style={{ display: "grid", gap: 18 }}>
        {/* Top stats + auto-plan */}
        <Card pad={22} style={{ background:
          "linear-gradient(160deg, #F2EBD1 0%, var(--green-tint) 100%)",
          borderColor: "var(--green-soft)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr auto",
                          gap: 24, alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                              fontWeight: 700, textTransform: "uppercase" }}>Week of Nov 23</div>
              <h2 className="serif" style={{ margin: "6px 0 4px", fontSize: 26, letterSpacing: -0.4 }}>
                {totalRecipes} meals planned · feels balanced.
              </h2>
              <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                Mix of pantry-first cooking and one quick takeout-style night.
              </div>
            </div>
            <PlanStat label="Est. cost" value={`$${totalCost.toFixed(0)}`} sub="2 servings each"/>
            <PlanStat label="Protein/day" value={`${Math.round(protein / 7)}g`} sub="avg target 90g"/>
            <PlanStat label="Pantry coverage" value="74%" sub="6 items to buy"/>
            <Button variant="primary" icon="sparkles" onClick={() => onPushToast?.("Pilot rewrote your week — review the changes", { icon: "sparkles" })}>
              Auto-plan
            </Button>
          </div>
          <div style={{ position: "absolute", right: -10, top: -30, opacity: 0.3 }}>
            <Illo name="oats" size={140}/>
          </div>
        </Card>

        {/* Template chips */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 11.5, color: "var(--ink-muted)", fontWeight: 600,
                          letterSpacing: 0.4, textTransform: "uppercase", marginRight: 4 }}>
            Plan style
          </div>
          {PLAN_TEMPLATES.map(t => (
            <Chip key={t.id} active={template === t.id} icon={t.icon} onClick={() => setTemplate(t.id)}>
              {t.l}
            </Chip>
          ))}
        </div>

        {/* Body — calendar + recipe drawer */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, minHeight: 540 }}>
          <Card pad={0} style={{ overflow: "hidden" }}>
            {/* Calendar grid */}
            <div style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)",
                            borderBottom: "1px solid var(--line)" }}>
              <div style={{ padding: "12px 16px", fontSize: 11, color: "var(--ink-muted)",
                              fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Week
              </div>
              {D.days.map(d => (
                <div key={d} style={{
                  padding: "12px 14px",
                  borderLeft: "1px solid var(--line-soft)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 700,
                                  letterSpacing: 0.4, textTransform: "uppercase" }}>{d}</div>
                  <div className="serif tnum" style={{ fontSize: 18, color: "var(--ink)", marginTop: 2 }}>
                    {23 + D.days.indexOf(d)}
                  </div>
                </div>
              ))}
            </div>
            {["B", "L", "D"].map(slot => {
              const slotLabel = { B: "Breakfast", L: "Lunch", D: "Dinner" }[slot];
              return (
                <div key={slot} style={{ display: "grid", gridTemplateColumns: "80px repeat(7, 1fr)",
                                            borderBottom: "1px solid var(--line)" }}>
                  <div style={{ padding: "10px 16px",
                                  borderRight: "1px solid var(--line-soft)",
                                  background: "var(--paper-warm)" }}>
                    <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700,
                                    letterSpacing: 0.5, textTransform: "uppercase" }}>{slot}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 2, fontWeight: 600 }}>
                      {slotLabel}
                    </div>
                  </div>
                  {D.days.map(d => {
                    const id = plan[d][slot];
                    const r = id ? recipeById(id) : null;
                    const isHover = hovered?.day === d && hovered?.slot === slot;
                    return (
                      <div key={d + slot}
                        onDragOver={(e) => { e.preventDefault(); setHovered({ day: d, slot }); }}
                        onDragLeave={() => setHovered(null)}
                        onDrop={() => onDrop(d, slot)}
                        style={{
                          padding: 8, borderLeft: "1px solid var(--line-soft)", minHeight: 92,
                          background: isHover ? "var(--green-tint)" : "transparent",
                          transition: "background 160ms",
                        }}>
                        {r ? <PlannedMeal recipe={r} onClick={() => onOpenRecipe(r.id)} onClear={() => clearSlot(d, slot)}/> :
                          <EmptySlot/>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Bottom hint */}
            <div style={{ padding: "12px 18px", background: "var(--bg-tint)",
                            borderTop: "1px solid var(--line)",
                            display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--ink-muted)" }}>
              <Icon name="info" size={14}/>
              Drag a recipe from the right pane onto any slot. Click a meal to open it.
            </div>
          </Card>

          {/* Recipe drawer */}
          <Card pad={16}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div className="serif" style={{ fontSize: 16, color: "var(--ink)" }}>Drag to plan</div>
              <Pill tone="green" size="sm">{D.recipes.length} recipes</Pill>
            </div>
            <div style={{ display: "grid", gap: 8, maxHeight: 600, overflowY: "auto", paddingRight: 4 }}>
              {D.recipes.map(r => (
                <div key={r.id}
                  draggable
                  onDragStart={() => setDraggedRecipe(r.id)}
                  onDragEnd={() => { setDraggedRecipe(null); setHovered(null); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", borderRadius: 10, cursor: "grab",
                    background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
                    transition: "transform 120ms",
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = "translateX(2px)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "translateX(0)"}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: `linear-gradient(135deg, ${r.tone}CC 0%, ${r.tone}88 100%)`,
                    display: "grid", placeItems: "center", flex: "0 0 auto",
                  }}>
                    <Illo name={recipeIllo(r)} size={22}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink)",
                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 2 }}>
                      {r.time}m · ${r.cost.toFixed(2)} · {r.match}% match
                    </div>
                  </div>
                  <Icon name="drag" size={14} stroke="var(--ink-soft)"/>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Generate grocery list */}
        <Card pad={22} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                                  borderColor: "var(--ink)",
                                  display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(255,255,255,.06)",
                          color: "var(--amber)", display: "grid", placeItems: "center" }}>
            <Icon name="cart" size={18}/>
          </div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div className="serif" style={{ fontSize: 19, letterSpacing: -0.2 }}>
              Pilot built a grocery list from your week.
            </div>
            <div style={{ fontSize: 13, color: "rgba(253,250,243,.65)", marginTop: 4 }}>
              11 items · est. <span style={{ color: "var(--amber)", fontWeight: 600 }}>$42.10</span> at Aldi ·
              warns on 2 duplicates with your pantry
            </div>
          </div>
          <Button variant="orange" iconRight="arrowRight" onClick={() => onNav("grocery")}>
            Open grocery list
          </Button>
        </Card>
      </div>
    );
  };

  const PlanStat = ({ label, value, sub }) => (
    <div>
      <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--ink-muted)",
                      fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", marginTop: 4, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{sub}</div>
    </div>
  );

  const PlannedMeal = ({ recipe, onClick, onClear }) => (
    <div onClick={onClick} className="lift" style={{
      cursor: "pointer", background: "var(--paper)", border: "1px solid var(--line)",
      borderRadius: 10, padding: "8px 10px", position: "relative", height: "100%",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
                      background: recipe.tone, borderRadius: "10px 0 0 10px" }}/>
      <div style={{ display: "flex", gap: 6, alignItems: "center", paddingLeft: 4 }}>
        <Illo name={recipeIllo(recipe)} size={20}/>
        <button onClick={(e) => { e.stopPropagation(); onClear(); }} style={{
          marginLeft: "auto", border: "none", background: "transparent",
          color: "var(--ink-soft)", padding: 0, opacity: 0.6, cursor: "pointer",
        }}>
          <Icon name="close" size={12}/>
        </button>
      </div>
      <div style={{ paddingLeft: 4, marginTop: 4, fontSize: 11.5, fontWeight: 600,
                      color: "var(--ink-2)", lineHeight: 1.25, flex: 1,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {recipe.name}
      </div>
      <div style={{ paddingLeft: 4, fontSize: 10, color: "var(--ink-soft)", marginTop: 2 }}>
        {recipe.time}m · ${recipe.cost.toFixed(2)}
      </div>
    </div>
  );

  const EmptySlot = () => (
    <div style={{
      height: "100%", minHeight: 70, display: "grid", placeItems: "center",
      border: "1.5px dashed var(--line-strong)", borderRadius: 10,
      color: "var(--ink-soft)", fontSize: 11,
    }}>
      <span>Drop here</span>
    </div>
  );

  function recipeIllo(r) {
    if (/rice/i.test(r.name)) return "rice";
    if (/pasta/i.test(r.name)) return "pasta";
    if (/yogurt|parfait/i.test(r.name)) return "yogurt";
    if (/oat|pancake/i.test(r.name)) return "oats";
    if (/omelette|egg/i.test(r.name)) return "egg";
    if (/wrap|sandwich/i.test(r.name)) return "bread";
    if (/tofu/i.test(r.name)) return "tofu";
    if (/bean/i.test(r.name)) return "beans";
    if (/chicken/i.test(r.name)) return "chicken";
    return "rice";
  }

  // ═════════════ BUDGET BASKET ═════════════════════════════════════════════
  const BudgetBasket = ({ onOpenRecipe, onPushToast }) => {
    const [budget, setBudget] = useState(35);
    const [meals, setMeals] = useState(5);
    // Pick the cheapest N recipes that fit
    const picked = D.recipes.slice().sort((a, b) => a.cost - b.cost).slice(0, meals);
    const total = picked.reduce((s, r) => s + r.cost * 2, 0); // 2 servings each
    const totalProtein = picked.reduce((s, r) => s + r.protein, 0);

    return (
      <div style={{ display: "grid", gap: 18 }}>
        <Card pad={26} style={{
          background: "linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)",
          borderColor: "var(--green-soft)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                          fontWeight: 700, textTransform: "uppercase" }}>Budget basket</div>
          <h2 className="serif" style={{ margin: "6px 0 6px", fontSize: 30, letterSpacing: -0.5, lineHeight: 1.1 }}>
            Build me <em style={{ color: "var(--green-deep)", fontStyle: "italic" }}>{meals} dinners</em> under
            <em style={{ color: "var(--green-deep)", fontStyle: "italic" }}> ${budget}</em>.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
                          gap: 24, alignItems: "center", marginTop: 22 }}>
            <BasketControl label="Meals" value={meals} min={3} max={10} onChange={setMeals}/>
            <BasketControl label="Budget" value={budget} prefix="$" min={15} max={100} step={5} onChange={setBudget}/>
            <BasketStat label="Estimated total" value={`$${total.toFixed(2)}`}
                          tone={total <= budget ? "green" : "tomato"}/>
            <BasketStat label="Avg protein" value={`${Math.round(totalProtein / meals)}g`}/>
            <Button variant="primary" iconRight="arrowRight"
                    onClick={() => onPushToast?.("Basket added to your meal plan", { icon: "check" })}>
              Apply to plan
            </Button>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {picked.map((r, i) => (
            <Card key={r.id} pad={0} hover style={{ overflow: "hidden", cursor: "pointer" }}
                  onClick={() => onOpenRecipe(r.id)}>
              <div style={{
                height: 100,
                background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
                display: "grid", placeItems: "center", position: "relative",
              }}>
                <Illo name="rice" size={50}/>
                <div style={{ position: "absolute", top: 8, left: 8 }}>
                  <Pill tone="ink" size="sm">Meal {i + 1}</Pill>
                </div>
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <Pill tone="green" size="sm" dot>${r.cost.toFixed(2)}/srv</Pill>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div className="serif" style={{ fontSize: 15, color: "var(--ink)", lineHeight: 1.2 }}>{r.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>
                  {r.time}m · {r.protein}g protein
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const BasketControl = ({ label, value, prefix, min, max, step = 1, onChange }) => (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--ink-muted)", fontWeight: 700,
                      letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={() => onChange(Math.max(min, value - step))} style={stepBtn}>−</button>
        <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", width: 56, textAlign: "center", lineHeight: 1 }}>
          {prefix || ""}{value}
        </div>
        <button onClick={() => onChange(Math.min(max, value + step))} style={stepBtn}>+</button>
      </div>
    </div>
  );

  const BasketStat = ({ label, value, tone }) => (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--ink-muted)", fontWeight: 700,
                      letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div className="serif tnum" style={{
        fontSize: 22, lineHeight: 1,
        color: tone === "green" ? "var(--green-deep)" : tone === "tomato" ? "var(--tomato)" : "var(--ink)",
      }}>{value}</div>
    </div>
  );

  const stepBtn = {
    width: 26, height: 26, borderRadius: 7,
    background: "rgba(255,255,255,.7)", border: "1px solid var(--line)",
    color: "var(--ink-2)", fontSize: 14, fontWeight: 700, cursor: "pointer",
  };

  // ═════════════ OCCASION PLANS ════════════════════════════════════════════
  const OccasionPlans = ({ onPushToast }) => (
    <div style={{ display: "grid", gap: 18 }}>
      <Card pad={22} style={{
        background: "linear-gradient(160deg, var(--orange-tint) 0%, var(--orange-soft) 100%)",
        borderColor: "var(--orange-soft)",
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                        fontWeight: 700, textTransform: "uppercase" }}>Occasion plans</div>
        <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 24, letterSpacing: -0.3 }}>
          One-tap plans for the way the week actually goes.
        </h2>
        <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
          Pre-built around context — exam crunches, lazy weekends, friends coming by.
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {D.occasions.map(o => (
          <Card key={o.id} pad={22} hover style={{ cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--bg-tint)",
                              color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
                <Icon name={o.icon} size={17}/>
              </div>
              <div className="serif" style={{ fontSize: 18, color: "var(--ink)", letterSpacing: -0.2 }}>
                {o.name}
              </div>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 14 }}>
              {o.desc}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14,
                            paddingBottom: 14, borderBottom: "1px solid var(--line-soft)" }}>
              <OccasionStat label="Meals" value={o.meals}/>
              <OccasionStat label="Hours" value={o.hours}/>
              <OccasionStat label="Cost"  value={o.cost === 0 ? "Free" : `$${o.cost}`}/>
            </div>
            <Button size="sm" variant="primary" full iconRight="arrowRight"
                    onClick={() => onPushToast?.(`Loaded "${o.name}" into your plan`, { icon: "check" })}>
              Use this plan
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );

  const OccasionStat = ({ label, value }) => (
    <div>
      <div className="serif tnum" style={{ fontSize: 18, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 4, fontWeight: 600,
                      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
    </div>
  );

  window.PPPlanner = { Planner };
})();
