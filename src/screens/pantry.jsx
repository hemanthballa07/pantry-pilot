// screens/pantry.jsx — Pantry with internal tabs.
// window.PPPantry = { Pantry }

(function () {
  const { useState, useMemo } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, ExpiryBadge, IngredientTile, Tabs, Chip,
          SectionHead, Avatar, Progress, Ring } = window.PPUI;

  const TABS = [
    { label: "Inventory",      value: "inventory" },
    { label: "Use first",      value: "expiry",     count: 6 },
    { label: "Low stock",      value: "lowstock",   count: 4 },
    { label: "Leftovers",      value: "leftovers",  count: 3 },
    { label: "Auto-restock",   value: "restock" },
    { label: "Staples builder",value: "staples" },
    { label: "Kitchen memory", value: "memory" },
  ];

  const Pantry = ({ onOpenItem, onAddItem, search }) => {
    const [tab, setTab] = useState("inventory");

    // Allow external nav to jump to a specific tab
    React.useEffect(() => {
      window.PPPantryTab = setTab;
      return () => { delete window.PPPantryTab; };
    }, []);

    return (
      <div style={{ padding: "28px 28px 0 28px" }}>
        {/* Stat row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 18 }}>
          <StatStrip label="Total items"  value={D.items.length}  sub="across 4 locations"     icon="pantry"  tone="green"/>
          <StatStrip label="Use soon"     value={D.items.filter(i => i.expDays <= 3 && i.status !== "frozen").length}
                                          sub="next 3 days"             icon="alert"   tone="tomato"/>
          <StatStrip label="Low staples"  value={4}                sub="and below threshold"   icon="info"    tone="amber"/>
          <StatStrip label="Coverage"     value="6.5 days"         sub="meals you can cook"    icon="leaf"    tone="green"/>
        </div>

        {/* Tabs row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
          <Tabs tabs={TABS} value={tab} onChange={setTab}/>
          {tab === "inventory" && (
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" variant="ghost" icon="receipt" onClick={() => window.PPInbox?.()}>Scan receipt</Button>
              <Button size="sm" variant="primary" icon="plus" onClick={onAddItem}>Add item</Button>
            </div>
          )}
        </div>

        <div style={{ paddingBottom: 56 }}>
          {tab === "inventory" && <InventoryView onOpenItem={onOpenItem} search={search}/>}
          {tab === "expiry"    && <UseFirstView   onOpenItem={onOpenItem}/>}
          {tab === "lowstock"  && <LowStockView/>}
          {tab === "leftovers" && <LeftoversView/>}
          {tab === "restock"   && <AutoRestockView/>}
          {tab === "staples"   && <StaplesView/>}
          {tab === "memory"    && <KitchenMemoryView/>}
        </div>
      </div>
    );
  };

  const StatStrip = ({ label, value, sub, icon, tone }) => {
    const toneFg = {
      green: "var(--green)", tomato: "var(--tomato)", amber: "var(--amber)", ink: "var(--ink-muted)",
    }[tone];
    const toneBg = {
      green: "var(--green-tint)", tomato: "var(--tomato-soft)", amber: "var(--amber-soft)", ink: "var(--bg-tint)",
    }[tone];
    return (
      <Card pad={18}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: toneBg, color: toneFg,
                          display: "grid", placeItems: "center" }}>
            <Icon name={icon} size={16}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600,
                            letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
            <div className="serif tnum" style={{ fontSize: 22, color: "var(--ink)", lineHeight: 1.1 }}>{value}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>{sub}</div>
          </div>
        </div>
      </Card>
    );
  };

  // ═════════════ INVENTORY VIEW (with grid/shelf/table) ════════════════════
  const CAT_CHIPS = ["All", "Vegetables", "Dairy", "Meat", "Grains", "Frozen", "Canned", "Sauces", "Oils", "Fruits", "Leftovers"];
  const LOC_TABS = [
    { label: "All",     value: "all" },
    { label: "Fridge",  value: "Fridge" },
    { label: "Freezer", value: "Freezer" },
    { label: "Pantry",  value: "Pantry" },
    { label: "Counter", value: "Counter" },
  ];
  const VIEW_OPTS = [
    { label: "Grid", value: "grid", icon: "grid" },
    { label: "Shelf", value: "shelf", icon: "fridge" },
    { label: "Table", value: "table", icon: "list" },
  ];

  const InventoryView = ({ onOpenItem, search }) => {
    const [loc, setLoc] = useState("all");
    const [cat, setCat] = useState("All");
    const [view, setView] = useState("grid");
    const [sort, setSort] = useState("expiry");

    const items = useMemo(() => {
      let r = D.items;
      if (loc !== "all") r = r.filter(i => i.loc === loc);
      if (cat !== "All") r = r.filter(i => i.cat === cat);
      if (search) {
        const q = search.toLowerCase();
        r = r.filter(i => i.name.toLowerCase().includes(q));
      }
      r = [...r];
      if (sort === "expiry") r.sort((a, b) => a.expDays - b.expDays);
      if (sort === "name")   r.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "cat")    r.sort((a, b) => a.cat.localeCompare(b.cat));
      return r;
    }, [loc, cat, sort, search]);

    const counts = LOC_TABS.reduce((a, l) => {
      a[l.value] = l.value === "all" ? D.items.length : D.items.filter(i => i.loc === l.value).length;
      return a;
    }, {});

    return (
      <>
        <Card pad={14} style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
          <Tabs tabs={LOC_TABS.map(t => ({ ...t, count: counts[t.value] }))} value={loc} onChange={setLoc}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
              {CAT_CHIPS.map(c => (
                <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11.5, color: "var(--ink-muted)", marginRight: 2 }}>Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={selStyle}>
              <option value="expiry">Soonest expiry</option>
              <option value="name">Name A→Z</option>
              <option value="cat">Category</option>
            </select>
            <div style={{ display: "inline-flex", gap: 2, background: "var(--bg-tint)",
                            padding: 3, borderRadius: 9, border: "1px solid var(--line)" }}>
              {VIEW_OPTS.map(v => (
                <button key={v.value} onClick={() => setView(v.value)} title={v.label}
                  style={{
                    width: 28, height: 26, display: "grid", placeItems: "center",
                    background: view === v.value ? "var(--paper)" : "transparent",
                    color: view === v.value ? "var(--ink)" : "var(--ink-muted)",
                    border: "none", borderRadius: 6, cursor: "pointer",
                    boxShadow: view === v.value ? "var(--sh-1)" : "none",
                  }}>
                  <Icon name={v.icon} size={14}/>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {view === "grid"  && <GridView items={items} onOpenItem={onOpenItem}/>}
        {view === "shelf" && <ShelfView items={D.items} onOpenItem={onOpenItem}/>}
        {view === "table" && <TableView items={items} onOpenItem={onOpenItem}/>}
      </>
    );
  };

  const GridView = ({ items, onOpenItem }) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
      {items.map(it => (
        <IngredientTile key={it.id} item={it} onClick={() => onOpenItem(it.id)}/>
      ))}
      <button onClick={() => window.PPAddItem?.()} style={{
        background: "var(--paper-warm)", border: "2px dashed var(--line-strong)",
        borderRadius: 16, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 8,
        minHeight: 196, color: "var(--ink-muted)", cursor: "pointer",
      }}>
        <Icon name="plus" size={22}/>
        <span style={{ fontSize: 12, fontWeight: 600 }}>Add item</span>
      </button>
    </div>
  );

  const ShelfView = ({ items, onOpenItem }) => {
    const locs = [
      { name: "Fridge",  illo: "fridge",     count: items.filter(i => i.loc === "Fridge").length },
      { name: "Freezer", illo: "snowflake",  count: items.filter(i => i.loc === "Freezer").length },
      { name: "Pantry",  illo: "pantry",     count: items.filter(i => i.loc === "Pantry").length },
      { name: "Counter", illo: "leaf",       count: items.filter(i => i.loc === "Counter").length },
    ];
    return (
      <div style={{ display: "grid", gap: 18 }}>
        {locs.map(loc => {
          const list = items.filter(i => i.loc === loc.name);
          if (!list.length) return null;
          return (
            <Card key={loc.name} pad={20}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--bg-tint)",
                                color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
                  <Icon name={loc.illo} size={16}/>
                </div>
                <h3 className="serif" style={{ margin: 0, fontSize: 18 }}>{loc.name}</h3>
                <Pill tone="neutral" size="sm">{loc.count} items</Pill>
              </div>
              <div style={{
                position: "relative", background: "var(--paper-warm)",
                border: "1px solid var(--line)", borderRadius: 14, padding: 14,
                backgroundImage:
                  "linear-gradient(180deg, transparent calc(50% - 1px), var(--line) calc(50% - 1px), var(--line) calc(50%), transparent calc(50%))",
              }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {list.slice(0, Math.ceil(list.length / 2)).map(it => (
                    <ShelfItem key={it.id} item={it} onClick={() => onOpenItem(it.id)}/>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}>
                  {list.slice(Math.ceil(list.length / 2)).map(it => (
                    <ShelfItem key={it.id} item={it} onClick={() => onOpenItem(it.id)}/>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  const ShelfItem = ({ item, onClick }) => {
    const dot = {
      today: "var(--tomato)", tomorrow: "var(--tomato)", week: "var(--amber)",
      fresh: "var(--green)", frozen: "var(--sky)", expired: "var(--ink-muted)",
    }[item.status];
    return (
      <button onClick={onClick} title={`${item.name} · ${item.expires}`} style={{
        width: 76, height: 96, padding: 6, background: "var(--paper)",
        border: "1px solid var(--line)", borderRadius: 10, cursor: "pointer",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative",
      }}>
        <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6,
                        borderRadius: 999, background: dot }}/>
        <Illo name={item.illo} size={40}/>
        <div style={{ fontSize: 10.5, color: "var(--ink-2)", fontWeight: 600,
                        textAlign: "center", lineHeight: 1.1, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
          {item.name}
        </div>
        <div style={{ fontSize: 9.5, color: "var(--ink-muted)" }}>{item.qty.split(" ")[0]}</div>
      </button>
    );
  };

  const TableView = ({ items, onOpenItem }) => (
    <Card pad={0} style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--bg-tint)" }}>
            {["Item", "Category", "Quantity", "Location", "Expires", "Owner", ""].map(h => (
              <th key={h} style={{
                padding: "12px 18px", textAlign: "left", fontSize: 11, color: "var(--ink-muted)",
                letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 700,
                borderBottom: "1px solid var(--line)",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id} onClick={() => onOpenItem(it.id)} style={{
              borderBottom: "1px solid var(--line-soft)", cursor: "pointer",
            }}>
              <td style={{ padding: "10px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: "var(--bg-tint)",
                                  borderRadius: 8, display: "grid", placeItems: "center" }}>
                    <Illo name={it.illo} size={22}/>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--ink)" }}>{it.name}</div>
                </div>
              </td>
              <td style={{ padding: "10px 18px", color: "var(--ink-muted)" }}>{it.cat}</td>
              <td style={{ padding: "10px 18px", color: "var(--ink-2)" }} className="tnum">{it.qty}</td>
              <td style={{ padding: "10px 18px", color: "var(--ink-muted)" }}>{it.loc}</td>
              <td style={{ padding: "10px 18px" }}>
                <ExpiryBadge status={it.status} expires={it.expires} size="sm"/>
              </td>
              <td style={{ padding: "10px 18px" }}>
                <span style={{ fontSize: 12, color: "var(--ink-muted)" }}>{it.owner}</span>
              </td>
              <td style={{ padding: "10px 18px", textAlign: "right" }}>
                <Icon name="chevronRight" size={14} stroke="var(--ink-soft)"/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );

  // ═════════════ USE FIRST (expiry) ════════════════════════════════════════
  const UseFirstView = ({ onOpenItem }) => {
    const today    = D.items.filter(i => i.status === "today");
    const tomorrow = D.items.filter(i => i.status === "tomorrow");
    const thisWeek = D.items.filter(i => i.status === "week");
    const wasteCost = (today.length + tomorrow.length) * 2.40;
    const useTogether = D.recipes.filter(r => r.expiringUsed.length >= 2);

    return (
      <div style={{ display: "grid", gap: 18 }}>
        <Card pad={22} style={{
          background: "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
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
            <ExpStat label="Today" count={today.length}/>
            <ExpStat label="Tomorrow" count={tomorrow.length}/>
            <ExpStat label="This week" count={thisWeek.length}/>
          </div>
          <div style={{ position: "absolute", right: -10, top: -20, opacity: 0.35 }}>
            <Illo name="spinach" size={130}/>
          </div>
        </Card>

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
                  background: "var(--paper-warm)", border: "1px solid var(--line)", borderRadius: 14,
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
                      {r.expiringUsed.map(u => (<Pill key={u} tone="tomato" size="sm">{u}</Pill>))}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 10 }}>
                      <Button size="sm" variant="primary" onClick={() => window.PPCookNow?.(r.id)}>Cook now</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <ExpirySection title="Today"            items={today}    onOpenItem={onOpenItem} tone="tomato"/>
        <ExpirySection title="Tomorrow"         items={tomorrow} onOpenItem={onOpenItem} tone="tomato"/>
        <ExpirySection title="Within the week"  items={thisWeek} onOpenItem={onOpenItem} tone="amber"/>
      </div>
    );
  };

  const ExpStat = ({ label, count }) => (
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

  // ═════════════ LOW STOCK ═════════════════════════════════════════════════
  const LowStockView = () => (
    <Card pad={22}>
      <SectionHead title="Running low" eyebrow="Below threshold"
        action={<Button variant="ghost" size="sm" iconRight="cart"
                          onClick={() => window.PPNav?.("shop")}>Add all to list</Button>}/>
      <div style={{ display: "grid", gap: 10 }}>
        {D.lowStock.map(it => (
          <div key={it.name} style={{
            display: "grid", gridTemplateColumns: "auto 1fr 180px auto", gap: 14, alignItems: "center",
            padding: "14px 16px", borderRadius: 12,
            background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
          }}>
            <div style={{ width: 44, height: 44, background: "var(--paper)", borderRadius: 10,
                            display: "grid", placeItems: "center", border: "1px solid var(--line-soft)" }}>
              <Illo name={it.illo} size={32}/>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{it.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 2 }}>{it.qty}</div>
            </div>
            <div>
              <Progress value={it.level} tone={it.status === "low" ? "tomato" : "amber"} height={6}/>
              <div className="tnum" style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>{it.level}%</div>
            </div>
            <Button size="sm" variant="primary" icon="plus"
                    onClick={() => window.PPToast?.(`${it.name} added to shopping list`, { icon: "check" })}>
              Add to list
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );

  // ═════════════ LEFTOVERS ═════════════════════════════════════════════════
  const LeftoversView = () => {
    const [items, setItems] = useState(D.leftovers);
    const remove = (id, msg) => {
      setItems(arr => arr.filter(x => x.id !== id));
      window.PPToast?.(msg, { icon: "check" });
    };
    const eatToday = items.filter(l => l.days === 0).length;
    const totalServings = items.reduce((s, l) => s + l.servings, 0);

    return (
      <div style={{ display: "grid", gap: 18 }}>
        <Card pad={22} style={{ background: "var(--orange-tint)", borderColor: "var(--orange-soft)",
                                  position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--on-tint-pad)",
                            color: "var(--orange-deep)", display: "grid", placeItems: "center" }}>
              <Icon name="save" size={20}/>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--orange-deep)",
                              fontWeight: 700, textTransform: "uppercase" }}>The leftover shelf</div>
              <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 22, letterSpacing: -0.3 }}>
                {items.length} portions saved · {totalServings} servings on deck
                {eatToday > 0 && <> · <span style={{ color: "var(--tomato)" }}>{eatToday} needs eating today</span></>}.
              </h2>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
                Pilot remembers each one and surfaces remix ideas before it spoils.
              </div>
            </div>
            <Button variant="primary" icon="plus"
                    onClick={() => window.PPToast?.("Save a leftover from your last cook", { icon: "save" })}>
              Save a leftover
            </Button>
          </div>
          <div style={{ position: "absolute", right: -10, bottom: -20, opacity: 0.35 }}>
            <Illo name="rice" size={120}/>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }}>
          {items.map(l => <LeftoverCard key={l.id} l={l}
                              onFinish={() => remove(l.id, `${l.meal} marked finished`)}
                              onWaste={() => remove(l.id, `${l.meal} marked wasted — Pilot logged it`)}
                              onAddToPlan={() => window.PPToast?.(`${l.meal} pinned to Plan`, { icon: "calendar" })}/>)}
          <Card pad={22} style={{
            background: "var(--paper-warm)", border: "2px dashed var(--line-strong)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            minHeight: 320, color: "var(--ink-muted)", textAlign: "center", cursor: "pointer",
          }} onClick={() => window.PPToast?.("Save a leftover from your last cook")}>
            <Icon name="plus" size={22}/>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>Add today's leftover</div>
            <div style={{ fontSize: 11.5, marginTop: 4, color: "var(--ink-soft)", maxWidth: 220 }}>
              Pilot will pick a safe-by date and remix ideas
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const LeftoverCard = ({ l, onFinish, onWaste, onAddToPlan }) => {
    const toneMap = { amber: "var(--amber)", tomato: "var(--tomato)", green: "var(--green)" };
    const bgMap   = { amber: "var(--amber-soft)", tomato: "var(--tomato-soft)", green: "var(--green-tint)" };
    const eatToday = l.days === 0;
    return (
      <Card pad={0} hover style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{
          padding: "14px 18px", background: bgMap[l.tone],
          borderBottom: `1px solid ${toneMap[l.tone]}33`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <Pill tone={l.tone} size="sm" dot>
            {eatToday ? "Eat today" : l.days === 1 ? "1 day left" : `${l.days} days left`}
          </Pill>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
            Cooked {l.cooked}
          </span>
        </div>
        <div style={{ padding: "18px 18px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 56, height: 56, background: "var(--paper-warm)",
                            border: "1px solid var(--line-soft)", borderRadius: 12,
                            display: "grid", placeItems: "center", flex: "0 0 auto" }}>
              <Illo name={l.illo} size={40}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 20, color: "var(--ink)", letterSpacing: -0.3, lineHeight: 1.15 }}>
                {l.meal}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4 }}>
                {l.servings} serving{l.servings > 1 ? "s" : ""} · safe through {l.useBy}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <FieldMini label="Storage" value={l.storage}/>
            <FieldMini label="Cooked" value={l.cooked}/>
          </div>

          <div style={{
            padding: "10px 12px", background: "var(--bg-tint)", borderRadius: 10,
            border: "1px solid var(--line-soft)",
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Icon name="info" size={14} stroke="var(--ink-muted)"/>
            <div style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--ink)" }}>Reheat:</strong> {l.reheat}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10.5, color: "var(--ink-soft)", fontWeight: 700,
                            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>
              Pilot's remix ideas
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {l.remix.map(r => (<Pill key={r} tone="neutral" size="sm">{r}</Pill>))}
            </div>
          </div>

          <div style={{ marginTop: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Button size="sm" variant="primary" icon="chef"
                    onClick={() => window.PPCookNow?.("r1")}>Remix into recipe</Button>
            <Button size="sm" variant="secondary" icon="check" onClick={onFinish}>Finished</Button>
            <Button size="sm" variant="ghost" icon="calendar" onClick={onAddToPlan}>Pin to plan</Button>
            <Button size="sm" variant="ghost" icon="trash"
                    style={{ color: "var(--tomato)", marginLeft: "auto" }}
                    onClick={onWaste}>Wasted</Button>
          </div>
        </div>
      </Card>
    );
  };

  const FieldMini = ({ label, value }) => (
    <div style={{ padding: "8px 10px", background: "var(--paper-warm)",
                    border: "1px solid var(--line-soft)", borderRadius: 8 }}>
      <div style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 700,
                      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, marginTop: 3 }}>{value}</div>
    </div>
  );

  // ═════════════ AUTO-RESTOCK ══════════════════════════════════════════════
  const AutoRestockView = () => {
    const [rules, setRules] = useState(D.autoRestockRules);
    const toggle = (id) => setRules(r => r.map(x => x.id === id ? { ...x, on: !x.on } : x));
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <Card pad={22} style={{ background:
          "linear-gradient(160deg, var(--green-tint) 0%, #F2EBD1 100%)",
          borderColor: "var(--green-soft)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--on-tint-pad)",
                            color: "var(--green-deep)", display: "grid", placeItems: "center" }}>
              <Icon name="sparkles" size={20}/>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--green-deep)",
                              fontWeight: 700, textTransform: "uppercase" }}>Auto-restock</div>
              <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 22, letterSpacing: -0.3 }}>
                Rules that quietly maintain your kitchen.
              </h2>
              <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 4 }}>
                Pilot adds these items to your grocery list automatically when they hit a threshold.
                {" "}<strong>{rules.filter(r => r.on).length}</strong> active · 2 will trigger this week.
              </div>
            </div>
            <Button variant="primary" icon="plus">New rule</Button>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {rules.map(r => (
            <Card key={r.id} pad={20} style={{ opacity: r.on ? 1 : 0.7 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--bg-tint)",
                                display: "grid", placeItems: "center",
                                border: "1px solid var(--line-soft)" }}>
                  <Illo name={r.illo} size={38}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>{r.item}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 3 }}>{r.rule}</div>
                </div>
                <Switch on={r.on} onClick={() => toggle(r.id)}/>
              </div>
              <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--paper-warm)",
                              borderRadius: 10, border: "1px solid var(--line-soft)",
                              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Field label="Threshold" value={r.threshold}/>
                <Field label="Cadence"  value={r.freq}/>
                <Field label="Next add" value={r.next}/>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const Field = ({ label, value }) => (
    <div>
      <div style={{ fontSize: 10, color: "var(--ink-soft)", fontWeight: 700,
                      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
      <div className="tnum" style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600, marginTop: 3 }}>
        {value}
      </div>
    </div>
  );

  const Switch = ({ on, onClick }) => (
    <button onClick={onClick} style={{
      width: 40, height: 22, borderRadius: 999, padding: 2,
      background: on ? "var(--green)" : "var(--line-strong)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background 200ms",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: 999, background: "#FDFAF3",
        transform: `translateX(${on ? 18 : 0}px)`, transition: "transform 200ms cubic-bezier(.2,.8,.2,1)",
        boxShadow: "0 1px 3px rgba(0,0,0,.2)",
      }}/>
    </button>
  );

  // ═════════════ STAPLES BUILDER ═══════════════════════════════════════════
  const StaplesView = () => (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 18 }}>
      <Card pad={22}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Ring value={D.staples.score} size={140} stroke={14} color="var(--amber)">
            <div style={{ textAlign: "center" }}>
              <div className="serif tnum" style={{ fontSize: 36, color: "var(--ink)", lineHeight: 1 }}>
                {D.staples.score}
              </div>
              <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 4, fontWeight: 700,
                              letterSpacing: 0.4, textTransform: "uppercase" }}>OF 100</div>
            </div>
          </Ring>
          <div style={{ textAlign: "center" }}>
            <div className="serif" style={{ fontSize: 19, color: "var(--ink)" }}>Staples score</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-muted)", marginTop: 4, maxWidth: 240, lineHeight: 1.5 }}>
              Add a few essentials and you unlock dozens of simple meals.
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: "var(--line-soft)", margin: "20px 0" }}/>
        <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                        fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
          You already have
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {D.staples.have.map(s => (<Pill key={s} tone="green" size="sm">{s}</Pill>))}
        </div>
      </Card>

      <Card pad={22}>
        <SectionHead title="Recommended staples"
          eyebrow="Unlock more meals"
          action={<Button size="sm" variant="primary" icon="cart"
                            onClick={() => window.PPToast?.(`${D.staples.missing.length} staples added to list`, { icon: "check" })}>
            Add all
          </Button>}/>
        <div style={{ display: "grid", gap: 10 }}>
          {D.staples.missing.map(s => (
            <div key={s.name} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 14, alignItems: "center",
              padding: "12px 14px", borderRadius: 12,
              background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
            }}>
              <div style={{ width: 40, height: 40, background: "var(--paper)", borderRadius: 9,
                              display: "grid", placeItems: "center", border: "1px solid var(--line-soft)" }}>
                <Illo name={s.illo} size={28}/>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{s.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-muted)", marginTop: 2 }}>
                  Unlocks <strong style={{ color: "var(--green-deep)" }}>{s.unlocks} meals</strong>
                </div>
              </div>
              <Pill tone="green" size="sm">+{s.unlocks}</Pill>
              <div className="tnum serif" style={{ fontSize: 16, color: "var(--ink)" }}>
                ${s.price.toFixed(2)}
              </div>
              <Button size="sm" variant="secondary" icon="plus"
                      onClick={() => window.PPToast?.(`${s.name} added`, { icon: "check" })}>
                Add
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ═════════════ KITCHEN MEMORY ════════════════════════════════════════════
  const KitchenMemoryView = () => (
    <div style={{ display: "grid", gap: 14 }}>
      <Card pad={22} style={{ background: "var(--ink)", color: "var(--paper-warm)",
                                borderColor: "var(--ink)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(255,255,255,.06)",
                          color: "var(--amber)", display: "grid", placeItems: "center" }}>
            <Icon name="sparkles" size={20}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, letterSpacing: 0.6, color: "rgba(253,250,243,.6)",
                            fontWeight: 700, textTransform: "uppercase" }}>Kitchen memory</div>
            <h2 className="serif" style={{ margin: "6px 0 0", fontSize: 22, letterSpacing: -0.3 }}>
              The patterns Pilot is learning.
            </h2>
            <div style={{ fontSize: 13, color: "rgba(253,250,243,.65)", marginTop: 4 }}>
              Quiet, personalized cooking intelligence — built from your last 90 days.
            </div>
          </div>
        </div>
      </Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {D.kitchenMemory.map(m => (
          <Card key={m.id} pad={22}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--bg-tint)",
                              color: "var(--ink-2)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                <Icon name={m.icon} size={17}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="serif" style={{ fontSize: 17, color: "var(--ink)", letterSpacing: -0.2, lineHeight: 1.2 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6, lineHeight: 1.5 }}>
                  {m.body}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const selStyle = {
    height: 30, padding: "0 8px", border: "1px solid var(--line)", borderRadius: 8,
    background: "var(--paper)", fontSize: 12.5, color: "var(--ink-2)", fontFamily: "inherit",
  };

  window.PPPantry = { Pantry };
})();
