// screens/grocery.jsx — Smart Grocery List. window.PPGrocery

(function () {
  const { useState, useMemo } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, Chip, Tabs, Progress, Avatar } = window.PPUI;

  const Grocery = ({ onNav, onPushToast, onOpenRecipe, onCookNow }) => {
    const { ScanReceipt } = window.PPScanReceipt || {};
    const [mode, setMode] = useState("plan"); // plan | store | budget | household
    const [items, setItems] = useState(D.grocery);
    const [filter, setFilter] = useState("all");
    const [showCBS, setShowCBS] = useState(true);
    const [scanOpen, setScanOpen] = useState(false);

    const filtered = items.filter(i => {
      if (filter === "all") return true;
      if (filter === "open") return !i.bought;
      if (filter === "done") return i.bought;
      return i.section === filter;
    });

    const sectioned = useMemo(() => {
      const map = {};
      filtered.forEach(i => { (map[i.section] = map[i.section] || []).push(i); });
      return Object.entries(map);
    }, [filtered]);

    const totalOpen = items.filter(i => !i.bought).reduce((s, i) => s + i.price, 0);
    const totalDone = items.filter(i => i.bought).reduce((s, i) => s + i.price, 0);
    const totalAll  = totalOpen + totalDone;
    const budgetUsed = totalAll;
    const budgetCap = 60;

    const toggle = (id) => {
      setItems(arr => arr.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
      const it = items.find(i => i.id === id);
      if (it && !it.bought) onPushToast?.(`Added ${it.name} to inventory`, { icon: "check" });
    };

    // ── STORE MODE: simplified, large-touch, "in store" UI ─────────────────
    if (mode === "store") {
      return (
        <StoreMode items={items} setItems={setItems} onExit={() => setMode("plan")} onPushToast={onPushToast}/>
      );
    }

    return (
      <>
      <div style={{ padding: "28px 28px 56px", display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) 340px", gap: 18 }}>
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
          {/* Cook Before You Shop hero — dismissable */}
          {showCBS && (
            <CookBeforeShop onDismiss={() => setShowCBS(false)} onCookNow={onCookNow} onOpenRecipe={onOpenRecipe}/>
          )}

          {/* Header */}
          <Card pad={22}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase" }}>This week's run</div>
                <h2 className="serif" style={{ margin: "6px 0 4px", fontSize: 26, letterSpacing: -0.4 }}>
                  {items.filter(i => !i.bought).length} items left to buy · est. ${totalOpen.toFixed(2)}
                </h2>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                  Cheapest at <strong style={{ color: "var(--ink-2)" }}>Aldi</strong> — about $10.90 less than Publix.
                </div>
              </div>
              <Tabs tabs={[
                { label: "Plan",      value: "plan" },
                { label: "In store",  value: "store" },
                { label: "Budget",    value: "budget" },
                { label: "Household", value: "household" },
              ]} value={mode} onChange={setMode}/>
              <button onClick={() => setScanOpen(true)} style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 14px",
                background: "var(--orange-tint)",
                color: "var(--orange-deep)",
                border: "1px solid var(--orange-soft)",
                borderRadius: 10, cursor: "pointer",
                fontFamily: "inherit", fontWeight: 600, fontSize: 12.5,
                whiteSpace: "nowrap",
                transition: "transform 120ms, background 160ms",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}>
                <Icon name="receipt" size={14}/>
                Scan receipt
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
                                  background: "var(--orange)", color: "#FDFAF3",
                                  padding: "1px 6px", borderRadius: 999, textTransform: "uppercase" }}>
                  New
                </span>
              </button>
            </div>
          </Card>

          {/* Warnings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card pad={16} style={{ background: "var(--amber-soft)", borderColor: "var(--amber-line)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--on-tint-pad)",
                                color: "var(--amber-ink)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Icon name="alert" size={14}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber-ink)" }}>
                    Duplicate warning · 2 items
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--amber-ink)", opacity: 0.85, lineHeight: 1.5, marginTop: 2 }}>
                    You already have eggs (8 left) and an unopened jar of peanut butter. Pilot grayed them out.
                  </div>
                </div>
              </div>
            </Card>
            <Card pad={16} style={{ background: "var(--green-tint)", borderColor: "var(--green-soft)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--on-tint-pad)",
                                color: "var(--green-deep)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Icon name="sparkles" size={14}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--green-deep)" }}>
                    Save $4.20 with bulk yogurt
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--green-deep)", opacity: 0.85, lineHeight: 1.5, marginTop: 2 }}>
                    32oz tub at Aldi is $1.04/serving vs. $1.64 for the 12oz. You use yogurt 3x/wk.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Auto-restock pending */}
          <AutoRestockStrip onPushToast={onPushToast}/>

          {/* Filter chips */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <Chip active={filter === "all"}     onClick={() => setFilter("all")}>All</Chip>
            <Chip active={filter === "open"}    onClick={() => setFilter("open")}>To buy</Chip>
            <Chip active={filter === "done"}    onClick={() => setFilter("done")}>Bought</Chip>
            <div style={{ width: 1, height: 22, background: "var(--line-strong)", margin: "0 4px" }}/>
            {["Produce", "Dairy", "Bakery", "Household"].map(s => (
              <Chip key={s} active={filter === s} onClick={() => setFilter(s)}>{s}</Chip>
            ))}
            <div style={{ flex: 1 }}/>
            <Button variant="ghost" size="sm" icon="sparkles"
                    onClick={() => window.PPAskPilot?.()}>Pilot suggest</Button>
            <Button variant="primary" size="sm" icon="plus"
                    onClick={() => window.PPAddItem?.()}>Add item</Button>
          </div>

          {/* Sections */}
          <div style={{ display: "grid", gap: 14 }}>
            {sectioned.map(([section, list]) => (
              <Card key={section} pad={0} style={{ overflow: "hidden" }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 18px", background: "var(--paper-warm)",
                  borderBottom: "1px solid var(--line)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <SectionIcon name={section}/>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.1 }}>
                      {section}
                    </span>
                    <Pill tone="neutral" size="sm">{list.length}</Pill>
                  </div>
                  <div className="tnum" style={{ fontSize: 12.5, color: "var(--ink-muted)", fontWeight: 600 }}>
                    ${list.reduce((s, i) => s + i.price, 0).toFixed(2)}
                  </div>
                </div>
                <div>
                  {list.map(it => (
                    <GroceryRow key={it.id} item={it} onToggle={() => toggle(it.id)} showOwner={mode === "household"}/>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div style={{ display: "grid", gap: 18, alignContent: "start" }}>
          {/* Budget */}
          <Card pad={20}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
              This trip
            </div>
            <div className="serif tnum" style={{ fontSize: 32, color: "var(--ink)", lineHeight: 1 }}>
              ${totalAll.toFixed(2)}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4, marginBottom: 14 }}>
              of <strong style={{ color: "var(--ink-2)" }}>${budgetCap}</strong> trip budget
            </div>
            <Progress value={budgetUsed} max={budgetCap} tone={budgetUsed > budgetCap ? "tomato" : "green"} height={8}/>
            <div className="tnum" style={{ display: "flex", justifyContent: "space-between", marginTop: 8,
                              fontSize: 11, color: "var(--ink-muted)" }}>
              <span>{Math.round((budgetUsed / budgetCap) * 100)}% used</span>
              <span>${(budgetCap - budgetUsed).toFixed(2)} left</span>
            </div>
            <div style={{ height: 1, background: "var(--line-soft)", margin: "16px 0" }}/>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
                            color: "var(--ink-muted)", marginBottom: 6 }}>
              <span>To buy</span><span className="tnum">${totalOpen.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12,
                            color: "var(--ink-muted)" }}>
              <span>Already bought</span><span className="tnum">${totalDone.toFixed(2)}</span>
            </div>
            <Button full variant="primary" icon="cart" style={{ marginTop: 16 }}
                    onClick={() => window.PPCheckoutOpen?.()}>
              Check out · ${totalOpen.toFixed(2)}
            </Button>
          </Card>

          {/* Store comparison */}
          <Card pad={20}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase" }}>Where to shop</div>
              <Icon name="info" size={14} stroke="var(--ink-soft)"/>
            </div>
            {[
              { name: "Aldi",         price: 38.20, fav: true,  miss: 0, dist: "1.4 mi", tone: "green"  },
              { name: "Walmart",      price: 42.80, fav: false, miss: 0, dist: "2.8 mi", tone: "neutral"},
              { name: "Trader Joe's", price: 46.10, fav: false, miss: 1, dist: "3.1 mi", tone: "neutral"},
              { name: "Publix",       price: 49.10, fav: false, miss: 0, dist: "1.2 mi", tone: "neutral"},
            ].map(s => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "10px 12px", marginBottom: 6, borderRadius: 10,
                background: s.fav ? "var(--green-tint)" : "var(--paper-warm)",
                border: `1px solid ${s.fav ? "var(--green-soft)" : "var(--line-soft)"}`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{s.name}</span>
                    {s.fav && <Pill tone="green" size="sm">Best</Pill>}
                    {s.miss > 0 && <Pill tone="amber" size="sm">{s.miss} missing</Pill>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>
                    {s.dist} · pickup available
                  </div>
                </div>
                <div className="serif tnum" style={{ fontSize: 17, color: "var(--ink)" }}>
                  ${s.price.toFixed(2)}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-muted)", lineHeight: 1.5 }}>
              Pilot says: Aldi saves <strong style={{ color: "var(--green-deep)" }}>~$10.90</strong>,
              but Publix is closer and stocks everything.
            </div>
          </Card>

          {/* Household contributors */}
          <Card pad={20}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>
              Added by
            </div>
            {D.household.map(p => {
              const count = items.filter(i => i.addedBy === p.name.split(" ")[0]).length;
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Avatar initials={p.initials} color={p.color} size={26}/>
                  <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>{p.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>{count} items</div>
                </div>
              );
            })}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
              <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--ink)",
                              color: "var(--amber)", display: "grid", placeItems: "center" }}>
                <Icon name="sparkles" size={12}/>
              </div>
              <div style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>Pilot</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                {items.filter(i => i.addedBy === "Pilot").length} items
              </div>
            </div>
          </Card>
        </div>
      </div>
      {scanOpen && ScanReceipt && (
        <ScanReceipt
          onClose={() => setScanOpen(false)}
          onPushToast={onPushToast}
          onNav={(n) => { setScanOpen(false); onNav?.(n); }}
        />
      )}
      </>
    );
  };

  const GroceryRow = ({ item, onToggle, showOwner }) => {
    const reason = item.needed[0];
    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto auto auto",
        alignItems: "center", gap: 14,
        padding: "12px 18px",
        borderBottom: "1px solid var(--line-soft)",
        opacity: item.bought ? 0.55 : 1,
        transition: "opacity 200ms",
      }}>
        <button onClick={onToggle} style={{
          width: 22, height: 22, borderRadius: 7,
          border: `1.5px solid ${item.bought ? "var(--green)" : "var(--line-strong)"}`,
          background: item.bought ? "var(--green)" : "transparent",
          color: "#FDFAF3", display: "grid", placeItems: "center", cursor: "pointer", padding: 0,
          transition: "all 160ms",
        }}>
          {item.bought && <Icon name="check" size={13}/>}
        </button>
        <div>
          <div style={{
            fontSize: 13.5, fontWeight: 600, color: "var(--ink)",
            textDecoration: item.bought ? "line-through" : "none",
          }}>{item.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2,
                          display: "flex", alignItems: "center", gap: 6 }}>
            <span>{reason}</span>
            {showOwner && item.addedBy !== "Pilot" && (
              <>
                <span>·</span>
                <span>{item.addedBy}</span>
              </>
            )}
            {item.addedBy === "Pilot" && (
              <>
                <span>·</span>
                <span style={{ color: "var(--ink-soft)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  <Icon name="sparkles" size={10}/> Pilot
                </span>
              </>
            )}
          </div>
        </div>
        <div className="tnum" style={{ fontSize: 12.5, color: "var(--ink-muted)" }}>
          {item.qty}
        </div>
        {item.priority === "high" && <Pill tone="tomato" size="sm">Priority</Pill>}
        {item.priority === "medium" && <Pill tone="neutral" size="sm">{item.section}</Pill>}
        {item.priority === "low" && <Pill tone="ghost" size="sm">Low</Pill>}
        <div className="tnum serif" style={{ fontSize: 16, color: "var(--ink)" }}>
          ${item.price.toFixed(2)}
        </div>
      </div>
    );
  };

  const SectionIcon = ({ name }) => {
    const map = {
      Produce:   { icon: "leaf",   bg: "var(--green-soft)",  fg: "var(--green-deep)" },
      Dairy:     { icon: "circle", bg: "var(--amber-soft)",  fg: "var(--amber-ink)" },
      Bakery:    { icon: "bread",  bg: "var(--orange-soft)", fg: "var(--orange-deep)" },
      Household: { icon: "house",  bg: "var(--bg-tint)",     fg: "var(--ink-muted)" },
      Meat:      { icon: "circle", bg: "var(--tomato-soft)", fg: "var(--tomato-ink)" },
      Frozen:    { icon: "snowflake", bg: "var(--sky-soft)", fg: "var(--sky)" },
    };
    const m = map[name] || map.Household;
    return (
      <div style={{ width: 26, height: 26, borderRadius: 8, background: m.bg, color: m.fg,
                      display: "grid", placeItems: "center" }}>
        <Icon name={m.icon === "bread" ? "knife" : m.icon} size={13}/>
      </div>
    );
  };

  // ─── Cook Before You Shop hero ───────────────────────────────────────────
  const CookBeforeShop = ({ onDismiss, onCookNow, onOpenRecipe }) => {
    const cbs = D.cookBeforeShop;
    const recipes = cbs.meals.map(m => ({ ...D.recipes.find(r => r.id === m.recipe), reason: m.reason }));
    return (
      <Card pad={0} style={{
        overflow: "hidden",
        background: "linear-gradient(160deg, var(--orange-tint) 0%, var(--orange-soft) 100%)",
        borderColor: "var(--orange-soft)",
      }}>
        <div style={{ padding: "22px 22px 18px",
                        display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--on-tint-pad)",
                          color: "var(--orange-deep)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
            <Icon name="leaf" size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                            fontWeight: 700, textTransform: "uppercase" }}>Cook before you shop</div>
            <div className="serif" style={{ fontSize: 22, color: "var(--ink)", marginTop: 4, letterSpacing: -0.3 }}>
              You can cook <strong style={{ color: "var(--orange-deep)" }}>{cbs.can} meals</strong> from
              what's already in your pantry.
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
              That's ~<strong className="tnum" style={{ color: "var(--green-deep)" }}>${cbs.save.toFixed(2)}</strong> avoided
              and one less trip. Stretch the pantry first?
            </div>
          </div>
          <button onClick={onDismiss} style={{
            width: 28, height: 28, background: "transparent", border: "none",
            color: "var(--ink-muted)", cursor: "pointer",
          }}><Icon name="close" size={14}/></button>
        </div>
        <div style={{ padding: "0 22px 22px",
                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {recipes.map(r => (
            <div key={r.id} onClick={() => onOpenRecipe(r.id)} style={{
              display: "flex", gap: 12, padding: "10px 12px", background: "var(--on-tint-pad)",
              border: "1px solid var(--on-tint-border)", borderRadius: 10, cursor: "pointer",
              transition: "transform 160ms",
            }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
              <div style={{
                width: 40, height: 40, flex: "0 0 auto",
                background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
                borderRadius: 9, display: "grid", placeItems: "center",
              }}>
                <Illo name="rice" size={26}/>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.2 }}>
                  {r.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>{r.reason}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          padding: "12px 22px",
          borderTop: "1px solid var(--on-tint-divider)",
          background: "var(--on-tint-pad-soft)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <Button size="sm" variant="ghost" onClick={onDismiss}>Continue shopping</Button>
          <Button size="sm" variant="primary" iconRight="arrowRight"
                  onClick={() => onCookNow(recipes[0].id)}>Cook these first</Button>
        </div>
      </Card>
    );
  };

  // ─── Auto-restock strip ──────────────────────────────────────────────────
  const AutoRestockStrip = ({ onPushToast }) => {
    const pending = D.autoRestockRules.filter(r => r.on && /day|Mon|Sun/.test(r.next)).slice(0, 3);
    if (!pending.length) return null;
    return (
      <Card pad={16}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Icon name="sparkles" size={16} stroke="var(--green-deep)"/>
          <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
            Auto-restock will add these on Sunday:
          </span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {pending.map(p => (
              <Pill key={p.id} tone="green" size="sm">
                {p.item} · {p.next}
              </Pill>
            ))}
          </div>
          <div style={{ flex: 1 }}/>
          <Button size="sm" variant="ghost" onClick={() => window.PPNav?.("pantry")}>Rules</Button>
          <Button size="sm" variant="secondary"
                  onClick={() => onPushToast?.("Added now to your list", { icon: "check" })}>
            Add now
          </Button>
        </div>
      </Card>
    );
  };

  // ─── Store Mode (large touch UI) ─────────────────────────────────────────
  const StoreMode = ({ items, setItems, onExit, onPushToast }) => {
    const [filter, setFilter] = useState("open");
    const list = items.filter(i => filter === "open" ? !i.bought : true);
    const sections = useMemo(() => {
      const map = {};
      list.forEach(i => { (map[i.section] = map[i.section] || []).push(i); });
      return Object.entries(map);
    }, [list]);
    const toggle = (id) => {
      setItems(arr => arr.map(i => i.id === id ? { ...i, bought: !i.bought } : i));
    };
    const open = items.filter(i => !i.bought).length;
    const bought = items.filter(i => i.bought).length;
    const totalLeft = items.filter(i => !i.bought).reduce((s, i) => s + i.price, 0);

    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "20px 16px 80px",
                      maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button onClick={onExit} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 12px", background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: 10, color: "var(--ink-2)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>
            <Icon name="chevronLeft" size={14}/> Exit store mode
          </button>
          <div style={{ flex: 1 }}/>
          <div style={{ display: "flex", gap: 4, background: "var(--bg-tint)", padding: 3, borderRadius: 9,
                          border: "1px solid var(--line)" }}>
            {[
              { l: "To buy", v: "open" },
              { l: "All",    v: "all" },
            ].map(t => (
              <button key={t.v} onClick={() => setFilter(t.v)} style={{
                padding: "5px 10px", fontSize: 12, fontWeight: 600,
                background: filter === t.v ? "var(--paper)" : "transparent",
                color: filter === t.v ? "var(--ink)" : "var(--ink-muted)",
                border: "none", borderRadius: 6, cursor: "pointer",
                boxShadow: filter === t.v ? "var(--sh-1)" : "none",
              }}>{t.l}</button>
            ))}
          </div>
        </div>

        <Card pad={20} style={{ marginBottom: 20, background: "var(--ink)",
                                  color: "var(--paper-warm)", borderColor: "var(--ink)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                              fontWeight: 700, textTransform: "uppercase" }}>Store mode · Aldi</div>
              <div className="serif" style={{ fontSize: 30, marginTop: 6, letterSpacing: -0.3, lineHeight: 1 }}>
                {open} <span style={{ color: "rgba(253,250,243,.55)", fontSize: 22 }}>· {bought} done</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "rgba(253,250,243,.6)", fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
                Running total
              </div>
              <div className="serif tnum" style={{ fontSize: 28, color: "var(--amber)", marginTop: 4 }}>
                ${totalLeft.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        {sections.map(([section, list]) => (
          <div key={section} style={{ marginBottom: 24 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 16px", background: "var(--paper-warm)",
              border: "1px solid var(--line)", borderRadius: 12, marginBottom: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", letterSpacing: -0.1 }}>
                {section}
              </span>
              <Pill tone="neutral" size="sm">{list.length}</Pill>
            </div>
            {list.map(it => (
              <button key={it.id} onClick={() => toggle(it.id)} style={{
                width: "100%", display: "grid", gridTemplateColumns: "auto 1fr auto",
                alignItems: "center", gap: 14,
                padding: "16px 18px", marginBottom: 6, borderRadius: 12,
                background: it.bought ? "var(--paper-warm)" : "var(--paper)",
                border: `1px solid ${it.bought ? "var(--line-soft)" : "var(--line)"}`,
                cursor: "pointer", textAlign: "left", opacity: it.bought ? 0.55 : 1,
              }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 9,
                  border: `2px solid ${it.bought ? "var(--green)" : "var(--line-strong)"}`,
                  background: it.bought ? "var(--green)" : "transparent",
                  color: "#FDFAF3", display: "grid", placeItems: "center",
                }}>{it.bought && <Icon name="check" size={18}/>}</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)",
                                  textDecoration: it.bought ? "line-through" : "none" }}>
                    {it.name}
                  </div>
                  <div className="tnum" style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>
                    {it.qty}
                  </div>
                </div>
                <div className="serif tnum" style={{ fontSize: 20, color: "var(--ink)" }}>
                  ${it.price.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        ))}

        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--paper-warm)",
          padding: "12px 20px", borderRadius: 14, boxShadow: "var(--sh-lift)",
          display: "flex", alignItems: "center", gap: 12, zIndex: 30,
        }}>
          <div style={{ fontSize: 12 }}>
            <span style={{ opacity: 0.6 }}>Trip · </span>
            <span className="tnum" style={{ fontWeight: 700 }}>${totalLeft.toFixed(2)}</span>
          </div>
          <Button size="sm" variant="orange"
                  onClick={() => { onPushToast?.("Trip complete · synced to pantry", { icon: "check" }); onExit(); }}>
            Finish trip
          </Button>
        </div>
      </div>
    );
  };

  window.PPGrocery = { Grocery };
})();
