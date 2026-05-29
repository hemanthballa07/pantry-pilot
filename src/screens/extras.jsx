// screens/extras.jsx — Lighter supporting screens.
// Exposes window.PPExtras = { Expiry, Budget, Nutrition, Leftovers, Household, Imports, Settings }

(function () {
  const { useState } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, Chip, Tabs, Progress, Ring, Avatar, AvatarStack,
          ExpiryBadge, IngredientTile, Bars, ActivityRow } = window.PPUI;

  // ═══════════════════════════════════════════════════════════════════════
  // EXPIRY ALERTS
  // ═══════════════════════════════════════════════════════════════════════
  const Expiry = ({ onOpenItem, onCookNow }) => {
    const today    = D.items.filter(i => i.status === "today");
    const tomorrow = D.items.filter(i => i.status === "tomorrow");
    const thisWeek = D.items.filter(i => i.status === "week");
    const fresh    = D.items.filter(i => i.status === "fresh").slice(0, 8);

    const wasteCost = (today.length + tomorrow.length) * 2.40;
    const useTogether = D.recipes.filter(r => r.expiringUsed.length >= 2);

    return (
      <div style={{ padding: "28px 28px 56px", display: "grid", gap: 18 }}>
        <Card pad={22} style={{ background:
          "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
          borderColor: "var(--tomato-line)", position: "relative", overflow: "hidden",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
                          gap: 24, alignItems: "center", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--tomato-ink)",
                              fontWeight: 700, textTransform: "uppercase" }}>Use first</div>
              <h2 className="serif" style={{ margin: "6px 0 4px", fontSize: 26, letterSpacing: -0.4,
                       lineHeight: 1.2 }}>
                {today.length + tomorrow.length} items want a job in the next 36 hours.
              </h2>
              <div style={{ fontSize: 13, color: "#7A1E11" }}>
                Cooking tonight saves about ${wasteCost.toFixed(2)}.
              </div>
            </div>
            <ExpStat label="Today" count={today.length} tone="tomato"/>
            <ExpStat label="Tomorrow" count={tomorrow.length} tone="tomato"/>
            <ExpStat label="This week" count={thisWeek.length} tone="amber"/>
          </div>
          <div style={{ position: "absolute", right: -10, top: -20, opacity: 0.35 }}>
            <Illo name="spinach" size={130}/>
          </div>
        </Card>

        {/* Use these together */}
        {useTogether.length > 0 && (
          <Card pad={22}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Icon name="sparkles" size={16} stroke="var(--amber)"/>
              <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>Use these together</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {useTogether.map(r => (
                <div key={r.id} style={{
                  display: "flex", gap: 14, padding: 14,
                  background: "var(--paper-warm)", border: "1px solid var(--line)",
                  borderRadius: 14,
                }}>
                  <div style={{
                    width: 80, height: 80, flex: "0 0 auto",
                    background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
                    borderRadius: 12, display: "grid", placeItems: "center",
                  }}>
                    <Illo name="rice" size={42}/>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <div className="serif" style={{ fontSize: 17, color: "var(--ink)", lineHeight: 1.2 }}>{r.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4 }}>
                      Uses {r.expiringUsed.length} expiring · {r.time} min · ${r.cost.toFixed(2)}/srv
                    </div>
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {r.expiringUsed.map(u => (
                        <Pill key={u} tone="tomato" size="sm">{u}</Pill>
                      ))}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 10 }}>
                      <Button size="sm" variant="primary" onClick={() => onCookNow(r.id)}>Cook now</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Item lists */}
        <ExpirySection title="Today" items={today} onOpenItem={onOpenItem} tone="tomato"/>
        <ExpirySection title="Tomorrow" items={tomorrow} onOpenItem={onOpenItem} tone="tomato"/>
        <ExpirySection title="Within the week" items={thisWeek} onOpenItem={onOpenItem} tone="amber"/>
        <ExpirySection title="Plenty of time" items={fresh} onOpenItem={onOpenItem} tone="green"/>
      </div>
    );
  };

  const ExpStat = ({ label, count, tone }) => (
    <div>
      <div className="serif tnum" style={{ fontSize: 36, color: "var(--ink)", lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 11.5, color: "#7A1E11", marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  );

  const ExpirySection = ({ title, items, onOpenItem, tone }) => {
    if (!items.length) return null;
    return (
      <Card pad={22}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 6, height: 6, borderRadius: 999,
                          background: tone === "tomato" ? "var(--tomato)" :
                                      tone === "amber" ? "var(--amber)" : "var(--green)" }}/>
          <span className="serif" style={{ fontSize: 18, color: "var(--ink)" }}>{title}</span>
          <Pill tone="neutral" size="sm">{items.length}</Pill>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {items.map(it => (
            <IngredientTile key={it.id} item={it} compact onClick={() => onOpenItem(it.id)}/>
          ))}
        </div>
      </Card>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // BUDGET
  // ═══════════════════════════════════════════════════════════════════════
  const Budget = () => {
    const b = D.budget;
    const total = b.byCategory.reduce((s, c) => s + c.amount, 0);
    let cumAngle = 0;
    const segments = b.byCategory.map(c => {
      const pct = c.amount / total;
      const start = cumAngle;
      cumAngle += pct * 360;
      return { ...c, start, end: cumAngle, pct };
    });

    return (
      <div style={{ padding: "28px 28px 56px", display: "grid", gap: 18 }}>
        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <BudgetStat label="Spent this month"   value={`$${b.spent.toFixed(0)}`} sub={`of $${b.monthly} budget`}
                      tone="green" icon="wallet"/>
          <BudgetStat label="Saved from pantry"  value={`$${b.savedFromPantry}`} sub="vs. takeout average"
                      tone="green" icon="leaf" up/>
          <BudgetStat label="Food waste"         value={`$${b.waste.toFixed(2)}`} sub="3 items · -28% MoM"
                      tone="tomato" icon="trash" down/>
          <BudgetStat label="Avg meal cost"      value="$1.85" sub="based on 19 meals"
                      tone="neutral" icon="chef"/>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Spending trend */}
          <Card pad={22}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase" }}>Weekly spend · November</div>
                <div className="serif tnum" style={{ fontSize: 30, color: "var(--ink)", marginTop: 6, lineHeight: 1 }}>
                  ${b.spent.toFixed(2)}
                </div>
              </div>
              <Pill tone="green" size="sm" icon="arrowDown">12% vs October</Pill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, alignItems: "end",
                            height: 200 }}>
              {b.weekly.map((w, i) => {
                const max = Math.max(...b.weekly);
                const h = (w / max) * 160;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <div className="tnum" style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>
                      ${w.toFixed(0)}
                    </div>
                    <div style={{
                      width: "100%", height: h, borderRadius: "12px 12px 4px 4px",
                      background: i === 3 ? "var(--green)" :
                                  `linear-gradient(180deg, var(--orange) 0%, var(--orange-deep) 100%)`,
                      opacity: i === 3 ? 1 : 0.85 - i * 0.05,
                      transition: "height 600ms cubic-bezier(.2,.8,.2,1)",
                    }}/>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>W{i + 1}</div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Donut by category */}
          <Card pad={22}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>
              Where it goes
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut segments={segments} size={170}/>
              <div style={{ flex: 1, display: "grid", gap: 6 }}>
                {b.byCategory.map(c => (
                  <div key={c.cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color }}/>
                    <span style={{ flex: 1, fontSize: 12, color: "var(--ink-2)", fontWeight: 500 }}>{c.cat}</span>
                    <span className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                      ${c.amount.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Stores + Insights */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 18 }}>
          <Card pad={22}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>By store</span>
              <Pill tone="green" size="sm">Aldi · best value</Pill>
            </div>
            {b.stores.map(s => {
              const pct = (s.amount / Math.max(...b.stores.map(x => x.amount))) * 100;
              return (
                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 14,
                                              padding: "10px 0", borderBottom: "1px solid var(--line-soft)" }}>
                  <div style={{ flex: "0 0 110px", fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 8, background: "var(--line-soft)", borderRadius: 999 }}>
                      <div style={{ width: `${pct}%`, height: "100%",
                                      background: "linear-gradient(90deg, var(--green) 0%, var(--basil) 100%)",
                                      borderRadius: 999 }}/>
                    </div>
                  </div>
                  <div className="tnum" style={{ flex: "0 0 60px", fontSize: 12.5, color: "var(--ink-2)",
                                                    textAlign: "right", fontWeight: 600 }}>
                    ${s.amount.toFixed(0)}
                  </div>
                  <div style={{ flex: "0 0 60px", fontSize: 11.5, color: "var(--ink-muted)", textAlign: "right" }}>
                    {s.trips} trip{s.trips > 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </Card>

          <Card pad={22} style={{ background: "var(--ink)", color: "var(--paper-warm)", borderColor: "var(--ink)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: "var(--amber)" }}><Icon name="sparkles" size={14}/></span>
              <span style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                              fontWeight: 700, textTransform: "uppercase" }}>Pilot's insights</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { t: "$42 saved this week",    b: "Four pantry-based meals instead of takeout." },
                { t: "Spinach: 60% of waste",  b: "You've tossed it twice. Try the smaller bag — or freeze on day 4." },
                { t: "Milk every 6 days",      b: "You buy half-gallons every 6 days. Pilot pre-staged that on the list." },
              ].map(i => (
                <div key={i.t} style={{
                  padding: "12px 14px", background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(255,255,255,.08)", borderRadius: 12,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--paper-warm)", marginBottom: 4 }}>{i.t}</div>
                  <div style={{ fontSize: 12, color: "rgba(253,250,243,.65)", lineHeight: 1.45 }}>{i.b}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const BudgetStat = ({ label, value, sub, tone, icon, up, down }) => {
    const fg = tone === "green" ? "var(--green)" : tone === "tomato" ? "var(--tomato)" :
                tone === "amber" ? "var(--amber)" : "var(--ink-muted)";
    return (
      <Card pad={20}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: fg }}><Icon name={icon} size={16}/></span>
          {up && <Pill tone="green" size="sm" icon="arrowUp">Saved</Pill>}
          {down && <Pill tone="green" size="sm" icon="arrowDown">-28%</Pill>}
        </div>
        <div className="serif tnum" style={{ fontSize: 28, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 4, fontWeight: 600,
                       textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 4 }}>{sub}</div>
      </Card>
    );
  };

  // Donut chart (simple)
  const Donut = ({ segments, size = 160 }) => {
    const r = size / 2 - 16;
    const cx = size / 2, cy = size / 2;
    const toXY = (a) => [cx + r * Math.cos((a - 90) * Math.PI / 180),
                         cy + r * Math.sin((a - 90) * Math.PI / 180)];
    return (
      <svg width={size} height={size}>
        {segments.map((s, i) => {
          const [x1, y1] = toXY(s.start);
          const [x2, y2] = toXY(s.end);
          const large = s.end - s.start > 180 ? 1 : 0;
          return (
            <path key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={s.color} stroke="var(--paper)" strokeWidth="3"/>
          );
        })}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="var(--paper)"/>
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-display)" fontSize="20"
              fill="var(--ink)" fontWeight="500">$184</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontFamily="var(--font-sans)" fontSize="10.5"
              fill="var(--ink-muted)" fontWeight="600" style={{ letterSpacing: 0.5 }}>SPENT</text>
      </svg>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════
  // INSIGHTS — tabbed: Budget · Waste · Nutrition · Memory · Takeout
  // ═══════════════════════════════════════════════════════════════════════
  const Insights = () => {
    const [tab, setTab] = useState("budget");
    return (
      <div style={{ padding: "28px 28px 0" }}>
        <div style={{ marginBottom: 18 }}>
          <Tabs tabs={[
            { label: "Budget",        value: "budget" },
            { label: "Food waste",    value: "waste" },
            { label: "Nutrition",     value: "nutrition" },
            { label: "Memory",        value: "memory" },
            { label: "Takeout swap",  value: "takeout" },
          ]} value={tab} onChange={setTab}/>
        </div>
        <div style={{ paddingBottom: 56, margin: "0 -28px" }}>
          {tab === "budget"    && <Budget/>}
          {tab === "nutrition" && <Nutrition/>}
          {tab === "waste"     && <Waste/>}
          {tab === "memory"    && <MemoryDeep/>}
          {tab === "takeout"   && <TakeoutSwap/>}
        </div>
      </div>
    );
  };

  // ─── Waste Analytics ─────────────────────────────────────────────────────
  const Waste = () => {
    const monthCost = D.wasteLog.reduce((s, x) => s + x.cost, 0);
    const byReason = {};
    D.wasteLog.forEach(l => { byReason[l.reason] = (byReason[l.reason] || 0) + l.cost; });
    const reasons = Object.entries(byReason).sort((a, b) => b[1] - a[1]);
    const byCat = {};
    D.wasteLog.forEach(l => { byCat[l.cat] = (byCat[l.cat] || 0) + l.cost; });

    return (
      <div style={{ padding: "0 28px 28px", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <BudgetStat label="Wasted this month"  value={`$${monthCost.toFixed(2)}`} sub="5 items · -28% MoM" tone="tomato" icon="trash"/>
          <BudgetStat label="Items rescued"      value="3"   sub="cooked before expiry"  tone="green" icon="leaf" up/>
          <BudgetStat label="Most wasted"        value="Spinach" sub="60% of produce waste" tone="amber" icon="alert"/>
          <BudgetStat label="No-waste days"      value="7"   sub="current streak"        tone="green" icon="sparkles"/>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          <Card pad={22}>
            <SectionHead title="Waste log" eyebrow="Last 30 days"/>
            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-tint)" }}>
                    {["Item", "Reason", "Qty", "Cost", "Date"].map(h => (
                      <th key={h} style={{
                        padding: "10px 14px", textAlign: "left", fontSize: 11,
                        color: "var(--ink-muted)", letterSpacing: 0.4, textTransform: "uppercase",
                        fontWeight: 700,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {D.wasteLog.map((l, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--line-soft)" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--ink)" }}>{l.item}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <Pill tone="ghost" size="sm">{l.reason}</Pill>
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--ink-muted)" }} className="tnum">{l.qty}</td>
                      <td style={{ padding: "10px 14px", color: "var(--tomato)", fontWeight: 600 }} className="tnum">
                        ${l.cost.toFixed(2)}
                      </td>
                      <td style={{ padding: "10px 14px", color: "var(--ink-soft)" }} className="tnum">{l.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Card pad={22}>
              <SectionHead title="Why food is dying" eyebrow="By reason"/>
              <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                {reasons.map(([r, c]) => (
                  <div key={r}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>{r}</span>
                      <span className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
                        ${c.toFixed(2)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: "var(--line-soft)", borderRadius: 999 }}>
                      <div style={{ width: `${(c / monthCost) * 100}%`, height: "100%",
                                      background: "var(--tomato)", borderRadius: 999 }}/>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card pad={22} style={{ background: "var(--green-tint)", borderColor: "var(--green-soft)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <Icon name="sparkles" size={14} stroke="var(--green-deep)"/>
                <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                                  fontWeight: 700, textTransform: "uppercase" }}>Pilot's tip</span>
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.55 }}>
                You waste fresh produce most often when you buy bunches over 6oz. Try smaller bags or use
                frozen — the math says you'd save <strong className="tnum">~$11/month</strong>.
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  // ─── Memory Deep ─────────────────────────────────────────────────────────
  const MemoryDeep = () => (
    <div style={{ padding: "0 28px 28px", display: "grid", gap: 18 }}>
      <Card pad={26} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                                borderColor: "var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,.06)",
                          color: "var(--amber)", display: "grid", placeItems: "center" }}>
            <Icon name="sparkles" size={22}/>
          </div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                            fontWeight: 700, textTransform: "uppercase" }}>Kitchen memory · 90 days</div>
            <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 28, letterSpacing: -0.4 }}>
              The patterns that quietly run your kitchen.
            </h2>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        <Card pad={22}>
          <SectionHead title="Insights" eyebrow="What Pilot has learned"/>
          <div style={{ display: "grid", gap: 10 }}>
            {D.kitchenMemory.map(m => (
              <div key={m.id} style={{
                display: "flex", gap: 12, padding: 14,
                background: "var(--paper-warm)", border: "1px solid var(--line-soft)", borderRadius: 12,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-tint)",
                                color: "var(--ink-2)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Icon name={m.icon} size={16}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", lineHeight: 1.25 }}>{m.title}</div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4, lineHeight: 1.5 }}>{m.body}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card pad={22}>
          <SectionHead title="Cooking calendar" eyebrow="Days you actually cooked"/>
          <CookHeatmap/>
        </Card>
      </div>
    </div>
  );

  const CookHeatmap = () => {
    // 12-week heatmap
    const days = [];
    for (let i = 0; i < 84; i++) {
      const intensity = Math.random() > 0.45 ? Math.floor(Math.random() * 4) + 1 : 0;
      days.push(intensity);
    }
    const colors = ["var(--line-soft)", "#D2DFB6", "#A8C68A", "#6B8E4E", "var(--green-deep)"];
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 3 }}>
          {Array.from({ length: 12 }, (_, w) => (
            <div key={w} style={{ display: "grid", gridTemplateRows: "repeat(7, 1fr)", gap: 3 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const v = days[w * 7 + d];
                return (
                  <div key={d} style={{
                    aspectRatio: "1", borderRadius: 3, background: colors[v],
                  }}/>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14,
                        fontSize: 11.5, color: "var(--ink-muted)" }}>
          <span>Less</span>
          {colors.map((c, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }}/>
          ))}
          <span>More</span>
          <span style={{ marginLeft: "auto" }}>12 weeks</span>
        </div>
      </div>
    );
  };

  // ─── Takeout Swap ────────────────────────────────────────────────────────
  const TakeoutSwap = () => {
    const totalSaved = D.takeoutSwaps.reduce((s, x) => s + x.save, 0);
    return (
      <div style={{ padding: "0 28px 28px", display: "grid", gap: 18 }}>
        <Card pad={26} style={{
          background: "linear-gradient(160deg, var(--orange-tint) 0%, #F2C99C 100%)",
          borderColor: "var(--orange-soft)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--on-tint-pad)",
                            color: "var(--orange-deep)", display: "grid", placeItems: "center" }}>
              <Icon name="bag" size={22}/>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                              fontWeight: 700, textTransform: "uppercase" }}>Takeout swap</div>
              <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 26, letterSpacing: -0.4 }}>
                Tonight's craving, homemade — <em style={{ color: "var(--tomato)", fontStyle: "italic" }}>save ${totalSaved.toFixed(2)}</em>.
              </h2>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
                When the takeout app calls, Pilot points out the home version you have ingredients for.
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }}>
          {D.takeoutSwaps.map(s => (
            <Card key={s.id} pad={0} hover style={{ overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr",
                              borderBottom: "1px solid var(--line-soft)" }}>
                <div style={{ padding: "16px 18px", background: "var(--tomato-soft)" }}>
                  <div style={{ fontSize: 10.5, color: "var(--tomato-ink)", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                    Takeout
                  </div>
                  <div className="serif" style={{ fontSize: 18, color: "var(--ink)", marginTop: 4, lineHeight: 1.2 }}>
                    {s.takeout}
                  </div>
                  <div className="serif tnum" style={{ fontSize: 24, color: "var(--tomato-ink)", marginTop: 6, lineHeight: 1 }}>
                    ${s.takeoutCost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--tomato-ink)", opacity: 0.7, marginTop: 4 }}>
                    ~35 min · delivery fee + tip
                  </div>
                </div>
                <div style={{ padding: "16px 18px", background: "var(--green-tint)" }}>
                  <div style={{ fontSize: 10.5, color: "var(--green-deep)", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                    Pilot's home swap
                  </div>
                  <div className="serif" style={{ fontSize: 18, color: "var(--ink)", marginTop: 4, lineHeight: 1.2 }}>
                    {s.home}
                  </div>
                  <div className="serif tnum" style={{ fontSize: 24, color: "var(--green-deep)", marginTop: 6, lineHeight: 1 }}>
                    ${s.homeCost.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--green-deep)", opacity: 0.8, marginTop: 4 }}>
                    {s.time} min · ingredients in pantry
                  </div>
                </div>
              </div>
              <div style={{ padding: "14px 18px",
                              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>
                    You save
                  </div>
                  <div className="serif tnum" style={{ fontSize: 22, color: "var(--green-deep)", lineHeight: 1, marginTop: 4 }}>
                    ${s.save.toFixed(2)}
                  </div>
                </div>
                <Button variant="primary" iconRight="arrowRight"
                        onClick={() => window.PPCookNow?.(s.recipe)}>Cook the swap</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  // ═══════════════════════════════════════════════════════════════════════
  const Nutrition = () => {
    const n = D.nutrition;
    return (
      <div style={{ padding: "28px 28px 56px", display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
          <Card pad={26}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>
              Today · Wednesday
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
              <div style={{ position: "relative", width: 200, height: 200 }}>
                <Ring value={n.cals.value} max={n.cals.target} size={200} stroke={16}
                       color="var(--orange)" trackColor="var(--bg-tint)">
                  <Ring value={n.protein.value} max={n.protein.target} size={158} stroke={14}
                          color="var(--tomato)" trackColor="var(--bg-tint)">
                    <Ring value={n.fiber.value} max={n.fiber.target} size={118} stroke={12}
                            color="var(--green)" trackColor="var(--bg-tint)">
                      <div style={{ textAlign: "center" }}>
                        <div className="serif tnum" style={{ fontSize: 24, color: "var(--ink)", lineHeight: 1 }}>
                          {Math.round((n.cals.value / n.cals.target) * 100)}%
                        </div>
                        <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 3, fontWeight: 600,
                                        letterSpacing: 0.4 }}>OF TARGET</div>
                      </div>
                    </Ring>
                  </Ring>
                </Ring>
              </div>
              <div style={{ flex: 1, display: "grid", gap: 12 }}>
                <NutLine label="Calories" v={n.cals} unit="" color="var(--orange)"/>
                <NutLine label="Protein"  v={n.protein} color="var(--tomato)"/>
                <NutLine label="Fiber"    v={n.fiber}   color="var(--green)"/>
                <NutLine label="Carbs"    v={n.carbs}   color="var(--amber)"/>
                <NutLine label="Fat"      v={n.fat}     color="var(--basil)"/>
              </div>
            </div>
          </Card>

          <Card pad={22} style={{ background: "var(--green-tint)", borderColor: "var(--green-soft)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: "var(--green-deep)" }}><Icon name="sparkles" size={14}/></span>
              <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                              fontWeight: 700, textTransform: "uppercase" }}>Pilot suggests</span>
            </div>
            <div className="serif" style={{ fontSize: 22, color: "var(--ink)", letterSpacing: -0.3,
                       lineHeight: 1.2, marginBottom: 10 }}>
              Dinner is light on protein. Want to add eggs or tofu to your fried rice?
            </div>
            <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "0 0 16px", lineHeight: 1.55 }}>
              You're 22g under target. A 3-egg add-in covers 18g without extending cook time.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {[
                { l: "+3 eggs",       p: "+18g", c: "+0.50" },
                { l: "+½ tofu block", p: "+10g", c: "+0.80" },
                { l: "+Greek yogurt", p: "+12g", c: "+0.90" },
              ].map(s => (
                <div key={s.l} style={{
                  padding: "8px 10px", background: "var(--on-tint-pad)",
                  border: "1px solid var(--green-soft)", borderRadius: 10,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{s.l}</div>
                  <div style={{ fontSize: 10.5, color: "var(--green-deep)", marginTop: 2 }}>
                    {s.p} · ${s.c}
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="primary"
                    onClick={() => window.PPToast?.("+3 eggs added to dinner", { icon: "check" })}>Apply suggestion</Button>
          </Card>
        </div>

        {/* Weekly trend */}
        <Card pad={22}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>This week · protein</div>
              <div className="serif tnum" style={{ fontSize: 26, color: "var(--ink)", marginTop: 6, lineHeight: 1 }}>
                72g <span style={{ fontSize: 14, color: "var(--ink-muted)" }}>avg / day</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <Legend color="var(--tomato)" label="Protein"/>
              <Legend color="var(--green)" label="Fiber"/>
              <Legend color="var(--orange-soft)" label="Target"/>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, alignItems: "end",
                          height: 180 }}>
            {[68, 84, 72, 90, 65, 76, 60].map((v, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  position: "relative", width: "100%", height: 140,
                  display: "flex", flexDirection: "column", justifyContent: "flex-end",
                }}>
                  <div style={{ position: "absolute", left: 0, right: 0,
                                  top: `${140 - (90 / 100) * 140}px`,
                                  height: 1, borderTop: "1px dashed var(--orange)" }}/>
                  <div style={{
                    height: `${(v / 100) * 140}px`, borderRadius: "8px 8px 3px 3px",
                    background: v >= 90 ? "var(--green)" : "var(--tomato)",
                    opacity: i === 2 ? 1 : 0.55,
                    transition: "height 600ms cubic-bezier(.2,.8,.2,1)",
                  }}/>
                </div>
                <div className="tnum" style={{ fontSize: 11, color: "var(--ink-2)", fontWeight: 600 }}>{v}g</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{D.days[i]}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Meals breakdown */}
        <Card pad={22}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
            Today's meals
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[
              { meal: "Breakfast", name: "Banana Oat Pancakes", cal: 320, p: 14, c: 52, f: 6,    color: "var(--amber)" },
              { meal: "Lunch",     name: "Chickpea Rice Bowl",  cal: 560, p: 22, c: 88, f: 12,   color: "var(--green)" },
              { meal: "Dinner",    name: "Schezwan Fried Rice", cal: 480, p: 18, c: 62, f: 14,   color: "var(--tomato)" },
              { meal: "Snack",     name: "Greek Yogurt Parfait",cal: 290, p: 18, c: 38, f: 6,    color: "var(--plum)" },
            ].map(m => (
              <div key={m.meal} style={{
                display: "grid", gridTemplateColumns: "80px 1fr repeat(4, 70px)",
                gap: 12, alignItems: "center",
                padding: "12px 16px", borderRadius: 10,
                background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
              }}>
                <div style={{ fontSize: 11.5, color: m.color, fontWeight: 700,
                                letterSpacing: 0.4, textTransform: "uppercase" }}>{m.meal}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{m.name}</div>
                {[m.cal + " cal", m.p + "g pro", m.c + "g car", m.f + "g fat"].map((v, i) => (
                  <div key={i} className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)", textAlign: "right" }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  const NutLine = ({ label, v, unit, color }) => {
    const pct = (v.value / v.target) * 100;
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 600 }}>{label}</span>
          <span className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)" }}>
            <strong style={{ color: "var(--ink)" }}>{v.value}{v.unit || unit || ""}</strong>
            <span style={{ marginLeft: 4 }}>/ {v.target}{v.unit || unit || ""}</span>
          </span>
        </div>
        <div style={{ height: 6, background: "var(--line-soft)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color,
                          borderRadius: 999, transition: "width 600ms cubic-bezier(.2,.8,.2,1)" }}/>
        </div>
      </div>
    );
  };

  const Legend = ({ color, label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-muted)" }}>
      <span style={{ width: 10, height: 10, borderRadius: 2, background: color }}/>{label}
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // LEFTOVERS
  // ═══════════════════════════════════════════════════════════════════════
  const Leftovers = ({ onCookNow }) => (
    <div style={{ padding: "28px 28px 56px", display: "grid", gap: 18 }}>
      <Card pad={22} style={{ background: "var(--orange-tint)", borderColor: "var(--orange-soft)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--on-tint-pad)",
                          color: "var(--orange-deep)", display: "grid", placeItems: "center" }}>
            <Icon name="save" size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                            fontWeight: 700, textTransform: "uppercase" }}>The leftover shelf</div>
            <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 24, letterSpacing: -0.3 }}>
              {D.leftovers.length} portions in the fridge. One needs eating today.
            </h2>
          </div>
          <Button variant="primary" icon="plus"
                  onClick={() => window.PPToast?.("Save a leftover from your last meal")}>Save a leftover</Button>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {D.leftovers.map(l => {
          const toneMap = { amber: "var(--amber)", tomato: "var(--tomato)", green: "var(--green)" };
          const bgMap = { amber: "var(--amber-soft)", tomato: "var(--tomato-soft)", green: "var(--green-tint)" };
          return (
            <Card key={l.id} pad={0} hover style={{ overflow: "hidden" }}>
              <div style={{
                padding: "14px 18px",
                background: bgMap[l.tone],
                borderBottom: `1px solid ${toneMap[l.tone]}33`,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <Pill tone={l.tone} size="sm" dot>
                  {l.days === 0 ? "Eat today" : l.days === 1 ? "1 day left" : `${l.days} days left`}
                </Pill>
                <div style={{ flex: 1 }}/>
                <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                  Cooked {l.cooked}
                </span>
              </div>
              <div style={{ padding: 18 }}>
                <div className="serif" style={{ fontSize: 20, color: "var(--ink)", letterSpacing: -0.2 }}>
                  {l.meal}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 6, marginBottom: 12 }}>
                  {l.servings} serving{l.servings > 1 ? "s" : ""} · safe through {l.useBy}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700,
                                letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>
                  Pilot's remix ideas
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 16 }}>
                  {l.remix.map(r => (
                    <Pill key={r} tone="neutral" size="sm">{r}</Pill>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Button size="sm" variant="primary" icon="chef" onClick={() => onCookNow?.("r1")}>Remix</Button>
                  <Button size="sm" variant="secondary"
                          onClick={() => window.PPToast?.("Marked leftover as finished", { icon: "check" })}>Mark finished</Button>
                </div>
              </div>
            </Card>
          );
        })}
        <Card pad={22} style={{
          background: "var(--paper-warm)", border: "2px dashed var(--line-strong)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: 280, color: "var(--ink-muted)", textAlign: "center",
        }}>
          <Icon name="plus" size={22}/>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Add today's leftover</div>
          <div style={{ fontSize: 11.5, marginTop: 4, color: "var(--ink-soft)" }}>
            Pilot will remind you in 2 days
          </div>
        </Card>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // HOUSEHOLD
  // ═══════════════════════════════════════════════════════════════════════
  const Household = () => (
    <div style={{ padding: "28px 28px 56px", display: "grid", gap: 18 }}>
      <Card pad={26}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <AvatarStack people={D.household} size={48}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Apartment 4B</div>
            <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 26, letterSpacing: -0.4 }}>
              Three roommates, one shared pantry.
            </h2>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
              12 shared items · $254 spent together this month · 0 duplicate-buy mishaps.
            </div>
          </div>
          <Button variant="primary" icon="plus"
                  onClick={() => window.PPToast?.("Invite link copied to clipboard", { icon: "check" })}>Invite a roommate</Button>
        </div>
      </Card>

      {/* Members */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {D.household.map(p => (
          <Card key={p.id} pad={22}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar initials={p.initials} color={p.color} size={42}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{p.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{p.role}</div>
              </div>
              <Pill tone="green" size="sm" dot>Online</Pill>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", lineHeight: 1 }}>{p.added}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>items added</div>
              </div>
              <div>
                <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", lineHeight: 1 }}>
                  ${p.spent.toFixed(0)}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>spent this month</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Shared pantry preview */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 18 }}>
        <Card pad={22}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span className="serif" style={{ fontSize: 18 }}>Shared shelf · 12 items</span>
            <Button variant="ghost" size="sm" iconRight="chevronRight"
                    onClick={() => window.PPNav?.("pantry")}>Open pantry</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {D.items.filter(i => i.owner === "Shared").slice(0, 8).map(it => (
              <div key={it.id} style={{
                padding: 12, background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
                borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              }}>
                <Illo name={it.illo} size={36}/>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--ink)", textAlign: "center", lineHeight: 1.2 }}>
                  {it.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>{it.qty.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card pad={22}>
          <span className="serif" style={{ fontSize: 18 }}>Activity</span>
          <div style={{ marginTop: 10 }}>
            {D.activity.slice(0, 6).map((a, i) => <ActivityRow key={i} act={a}/>)}
          </div>
        </Card>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // IMPORTS / RECEIPTS
  // ═══════════════════════════════════════════════════════════════════════
  const Imports = ({ onPushToast }) => {
    const methods = [
      { kind: "receipt", icon: "receipt", title: "Scan a receipt",
        desc: "Snap a grocery receipt — Pilot reads every line, matches the store catalog, and estimates expiry.",
        soft: "var(--orange-tint)", ink: "var(--orange-deep)", meta: "Best after a shop" },
      { kind: "barcode", icon: "barcode", title: "Scan barcodes",
        desc: "Scan packaged items one by one. Pulls name, brand, size, nutrition, and shelf life.",
        soft: "var(--sky-soft)", ink: "var(--sky-ink)", meta: "Great for staples" },
      { kind: "fridge", icon: "camera", title: "Photo of your fridge",
        desc: "One open-fridge photo. Pilot detects what's inside and flags what to eat first.",
        soft: "#EDE2EA", ink: "var(--plum)", meta: "Fastest full refresh" },
    ];
    return (
      <div style={{ padding: "28px 28px 56px", display: "grid", gap: 20 }}>
        <Card pad={24} style={{ background:
          "linear-gradient(150deg, var(--paper-warm) 0%, var(--green-tint) 100%)",
          borderColor: "var(--green-soft)" }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Quick add</div>
          <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
            Skip the typing. Snap, scan, or paste.
          </h2>
          <p style={{ margin: "8px 0 0", color: "var(--ink-2)", fontSize: 14, maxWidth: 560, lineHeight: 1.55 }}>
            Three ways to fill your pantry in seconds. Pilot handles the matching, expiry estimates,
            and waste tracking for you.
          </p>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {methods.map(m => (
            <Card key={m.kind} pad={0} hover
                  style={{ overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column" }}
                  onClick={() => window.PPCapture?.(m.kind)}>
              <div style={{ height: 124, position: "relative", borderBottom: "1px solid var(--line-soft)",
                              background: `linear-gradient(140deg, ${m.soft} 0%, transparent 100%)`,
                              display: "grid", placeItems: "center" }}>
                <div style={{ width: 62, height: 62, borderRadius: 16, background: "var(--paper)",
                                border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                                color: m.ink, boxShadow: "var(--sh-1)" }}>
                  <Icon name={m.icon} size={28}/>
                </div>
                <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10.5, fontWeight: 700,
                                  letterSpacing: 0.3, color: m.ink, background: "var(--paper)",
                                  padding: "3px 9px", borderRadius: 999, border: "1px solid var(--line-soft)" }}>
                  {m.meta}
                </span>
              </div>
              <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
                <div className="serif" style={{ fontSize: 19, letterSpacing: -0.2, color: "var(--ink)" }}>
                  {m.title}
                </div>
                <p style={{ margin: "6px 0 16px", fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>
                  {m.desc}
                </p>
                <div style={{ marginTop: "auto" }}>
                  <Button full variant="primary" iconRight="arrowRight"
                          onClick={(e) => { e.stopPropagation(); window.PPCapture?.(m.kind); }}>Open</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recipe URL import */}
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
            Or import a recipe
          </div>
          <RecipeImport/>
        </div>
      </div>
    );
  };

  const ReceiptScanner = ({ onPushToast }) => {
    const detected = [
      { name: "Whole Milk",     qty: "½ gal",   cat: "Dairy",     price: 3.79, exp: "Dec 2",  conf: 0.98 },
      { name: "Spinach",        qty: "1 bag",   cat: "Produce",   price: 3.49, exp: "Nov 26", conf: 0.94 },
      { name: "Bell Peppers",   qty: "3 ct",    cat: "Produce",   price: 2.99, exp: "Dec 1",  conf: 0.95 },
      { name: "Eggs",           qty: "1 dozen", cat: "Dairy",     price: 4.20, exp: "Dec 6",  conf: 0.99 },
      { name: "Jasmine Rice",   qty: "2.5 lb",  cat: "Grains",    price: 5.99, exp: "Jul 27", conf: 0.91 },
      { name: "Olive Oil",      qty: "16 oz",   cat: "Pantry",    price: 8.49, exp: "Sep 27", conf: 0.88 },
      { name: "Greek Yogurt",   qty: "32 oz",   cat: "Dairy",     price: 5.49, exp: "Dec 4",  conf: 0.97 },
    ];
    const [picked, setPicked] = useState(() => new Set(detected.map((_, i) => i)));
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 18 }}>
        <Card pad={20}>
          <div style={{ aspectRatio: "3/4", borderRadius: 14,
                          background: "var(--paper-warm)", border: "1px dashed var(--line-strong)",
                          padding: 18, position: "relative", overflow: "hidden",
                          fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.7,
                          color: "var(--ink-2)" }}>
            <div style={{ textAlign: "center", fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
              ALDI · MARKETPLACE
            </div>
            <div style={{ textAlign: "center", fontSize: 9, color: "var(--ink-muted)", marginBottom: 12 }}>
              123 Madison Ave · 11/23/26 · 6:42 PM
            </div>
            <div style={{ borderTop: "1px dashed var(--line-strong)", margin: "0 -18px 12px" }}/>
            {detected.map(d => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{d.name.toUpperCase()}</span>
                <span>${d.price.toFixed(2)}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px dashed var(--line-strong)", margin: "12px -18px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontWeight: 700 }}>
              <span>TOTAL</span>
              <span>${detected.reduce((s, d) => s + d.price, 0).toFixed(2)}</span>
            </div>
            {/* scanning line */}
            <div style={{
              position: "absolute", left: 0, right: 0, top: "30%",
              height: 2, background: "var(--green)",
              boxShadow: "0 0 12px var(--green)",
              animation: "ppScan 2.4s ease-in-out infinite",
            }}/>
          </div>
          <style>{`@keyframes ppScan { 0% { top: 8%; } 50% { top: 88%; } 100% { top: 8%; } }`}</style>
        </Card>

        <Card pad={20}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>Detected · 7 items</div>
              <div className="serif" style={{ fontSize: 20, marginTop: 4 }}>
                Aldi · Nov 23 · $34.44
              </div>
            </div>
            <Pill tone="green" size="md" icon="check">{picked.size} selected</Pill>
          </div>
          <div style={{ display: "grid", gap: 6, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
            {detected.map((d, i) => (
              <label key={d.name} style={{
                display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
                alignItems: "center", gap: 12, padding: "10px 12px",
                background: picked.has(i) ? "var(--paper-warm)" : "transparent",
                border: "1px solid var(--line-soft)", borderRadius: 10, cursor: "pointer",
              }}>
                <input type="checkbox" checked={picked.has(i)}
                       onChange={() => setPicked(s => {
                         const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n;
                       })}
                       style={{ width: 16, height: 16, accentColor: "var(--green)" }}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{d.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                    {d.cat} · expires {d.exp}
                  </div>
                </div>
                <div className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)" }}>{d.qty}</div>
                <div className="tnum" style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
                  ${d.price.toFixed(2)}
                </div>
                <Pill tone={d.conf > 0.95 ? "green" : "amber"} size="sm">
                  {Math.round(d.conf * 100)}%
                </Pill>
              </label>
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>
              Expiry dates estimated from category averages.
            </span>
            <Button variant="primary" iconRight="check"
                    onClick={() => onPushToast?.(`Imported ${picked.size} items to pantry`)}>
              Import {picked.size} items
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  const BarcodeScanner = () => (
    <Card pad={36} style={{ textAlign: "center", color: "var(--ink-muted)" }}>
      <div style={{ display: "inline-flex", padding: 24, background: "var(--bg-tint)",
                      borderRadius: 18, marginBottom: 16 }}>
        <Icon name="barcode" size={48} stroke="var(--ink-soft)"/>
      </div>
      <div className="serif" style={{ fontSize: 22, color: "var(--ink-2)" }}>Point your camera at a barcode</div>
      <div style={{ fontSize: 13, marginTop: 6, maxWidth: 380, margin: "6px auto 0" }}>
        Pilot auto-fills name, brand, category, nutrition, and estimated shelf life.
      </div>
    </Card>
  );

  const FridgeScanner = () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <Card pad={20}>
        <div style={{
          aspectRatio: "4/3", borderRadius: 14, background:
            "linear-gradient(180deg, #C7DBE3 0%, #A5BFCB 100%)",
          display: "grid", placeItems: "center", color: "var(--ink-2)",
          fontSize: 13, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap",
                          padding: 30, gap: 20, alignContent: "center", justifyContent: "center" }}>
            {["spinach", "egg", "milk", "tomato", "carrot", "yogurt"].map(n => (
              <Illo key={n} name={n} size={64}/>
            ))}
          </div>
          <div style={{ position: "absolute", inset: 14, border: "2px dashed rgba(255,255,255,.7)",
                          borderRadius: 12 }}/>
        </div>
      </Card>
      <Card pad={20}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                        fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>
          Detected items · 6
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {[
            { n: "Spinach", c: 0.92 }, { n: "Eggs (carton)", c: 0.99 },
            { n: "Milk (½ gal)", c: 0.96 }, { n: "Tomatoes", c: 0.88 },
            { n: "Carrots", c: 0.85 }, { n: "Greek Yogurt", c: 0.93 },
          ].map(d => (
            <div key={d.n} style={{ display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 12px", border: "1px solid var(--line-soft)",
                          borderRadius: 10, background: "var(--paper-warm)" }}>
              <input type="checkbox" defaultChecked style={{ accentColor: "var(--green)" }}/>
              <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{d.n}</div>
              <Pill tone={d.c > 0.9 ? "green" : "amber"} size="sm">{Math.round(d.c * 100)}%</Pill>
            </div>
          ))}
        </div>
        <Button full variant="primary" iconRight="check" style={{ marginTop: 14 }}
                onClick={() => window.PPToast?.("Added 6 items to pantry", { icon: "check" })}>Add to pantry</Button>
      </Card>
    </div>
  );

  const RecipeImport = () => (
    <Card pad={26}>
      <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 8 }}>Paste a recipe URL</div>
      <div style={{ display: "flex", gap: 8 }}>
        <input defaultValue="https://www.seriouseats.com/schezwan-fried-rice-recipe"
               style={{ flex: 1, height: 44, padding: "0 14px", border: "1px solid var(--line)",
                          borderRadius: 12, background: "var(--paper)", fontSize: 13.5,
                          color: "var(--ink-2)", fontFamily: "inherit" }}/>
        <Button variant="primary" iconRight="arrowRight"
                onClick={() => window.PPToast?.("Importing recipe… 12 ingredients detected", { icon: "check" })}>Import</Button>
      </div>
      <div style={{ marginTop: 18, padding: 16, background: "var(--paper-warm)",
                      border: "1px solid var(--line)", borderRadius: 12,
                      display: "flex", gap: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: 10,
                        background: "linear-gradient(135deg, var(--tomato) 0%, var(--orange) 100%)",
                        display: "grid", placeItems: "center" }}>
          <Illo name="rice" size={42}/>
        </div>
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 17 }}>Schezwan Fried Rice</div>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
            12 ingredients · 4 already in your pantry · 8 missing
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            <Pill tone="green" size="sm">Save recipe</Pill>
            <Pill tone="orange" size="sm">Add missing to grocery</Pill>
          </div>
        </div>
      </div>
    </Card>
  );

  // ═══════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════
  const Settings = () => {
    const [section, setSection] = useState("Profile");
    return (
    <div style={{ padding: "28px 28px 56px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 22 }}>
      <aside>
        {["Profile", "Preferences", "Equipment", "Notifications", "Household", "Connections", "Privacy"]
          .map(s => {
            const active = section === s;
            return (
            <button key={s} onClick={() => setSection(s)} style={{
              display: "block", width: "100%", textAlign: "left",
              padding: "9px 14px", borderRadius: 10,
              background: active ? "var(--paper)" : "transparent",
              border: "1px solid", borderColor: active ? "var(--line)" : "transparent",
              color: active ? "var(--ink)" : "var(--ink-muted)",
              fontSize: 13.5, fontWeight: active ? 600 : 500, marginBottom: 2,
              boxShadow: active ? "var(--sh-1)" : "none", cursor: "pointer",
              fontFamily: "inherit",
            }}>{s}</button>
            );
          })}
      </aside>
      <div style={{ display: "grid", gap: 18 }}>
        <Card pad={26}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <Avatar initials="HB" color="var(--green)" size={64}/>
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 22 }}>Hemanth Balla</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>hemanth@apt4b.house · Graduate student</div>
            </div>
            <Button variant="secondary" icon="edit"
                    onClick={() => window.PPToast?.("Editing your profile")}>Edit profile</Button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, padding: 16,
                          background: "var(--paper-warm)", borderRadius: 12, border: "1px solid var(--line-soft)" }}>
            <Field label="Monthly budget"     value="$250"/>
            <Field label="Cooking skill"      value="Intermediate"/>
            <Field label="Household members"  value="3"/>
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>Diet & allergies</div>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8, fontWeight: 600 }}>Preferences</div>
            <DietPrefs/>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginBottom: 8, fontWeight: 600 }}>Avoid</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Pill tone="tomato" size="md" icon="alert">Shellfish</Pill>
            </div>
          </div>
        </Card>
        <Card pad={26}>
          <div className="serif" style={{ fontSize: 18, marginBottom: 14 }}>Kitchen equipment</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {[
              { l: "Stove", on: true }, { l: "Microwave", on: true },
              { l: "Air fryer", on: true }, { l: "Rice cooker", on: true },
              { l: "Oven", on: false },   { l: "Blender", on: false },
              { l: "Instant Pot", on: false }, { l: "Grill", on: false },
              { l: "Toaster", on: true }, { l: "Coffee maker", on: true },
            ].map(e => (
              <div key={e.l} style={{
                padding: "12px 10px", borderRadius: 10, textAlign: "center",
                background: e.on ? "var(--green-tint)" : "var(--paper-warm)",
                border: `1px solid ${e.on ? "var(--green-soft)" : "var(--line-soft)"}`,
                color: e.on ? "var(--green-deep)" : "var(--ink-soft)",
              }}>
                <div style={{ fontSize: 11, fontWeight: 600 }}>{e.l}</div>
                <div style={{ fontSize: 9.5, marginTop: 3, opacity: 0.7 }}>
                  {e.on ? "Available" : "Not yet"}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
    );
  };

  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600,
                     letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
      <div className="serif" style={{ fontSize: 18, color: "var(--ink)", marginTop: 3 }}>{value}</div>
    </div>
  );

  const DietPrefs = () => {
    const [prefs, setPrefs] = useState({
      "High protein": true, "Budget friendly": true,
      "Vegetarian": false, "Vegan": false,
      "Gluten-free": false, "Dairy-free": false,
      "No pork": true,
    });
    const toggle = (k) => setPrefs(p => ({ ...p, [k]: !p[k] }));
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(prefs).map(k => (
          <Chip key={k} active={prefs[k]} onClick={() => toggle(k)}>{k}</Chip>
        ))}
      </div>
    );
  };

  window.PPExtras = { Expiry, Budget, Nutrition, Leftovers, Household, Imports, Settings, Insights };
})();
