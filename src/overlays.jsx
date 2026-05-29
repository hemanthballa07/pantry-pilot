// overlays.jsx — Drawers and modals for item/recipe details, AskPilot, AddItem
// Attached to window.PPOverlays

(function () {
  const { useState, useEffect, useRef } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const D = window.PP_DATA;
  const { Pill, Card, Button, Drawer, Modal, ExpiryBadge, Avatar, Ring, Progress, Chip } = window.PPUI;

  // Storage / freshness tips, by category & name
  const storageTip = (item) => {
    const byName = {
      "Spinach": "Wrap loosely in a damp paper towel inside a sealed container. Freezes well for smoothies and soups.",
      "Wheat Bread": "Freeze half if not using within 3 days. Slice it first — toaster does the rest.",
      "Bananas": "Store away from other fruit. Once spotty, peel and freeze for pancakes or smoothies.",
      "Whole Milk": "Coldest part of the fridge, away from the door. Lasts longer.",
      "Cooked Rice": "Eat or freeze within 4 days. Cool quickly, store in flat portions.",
      "Eggs": "Carton on a fridge shelf, not the door. Lasts 4-5 weeks past purchase.",
      "Onions": "Cool, dark, dry — pantry, not fridge. Keep away from potatoes (they sprout each other).",
      "Garlic": "Same as onions. Once cut, refrigerate, but use within 5 days.",
      "Chicken Breast": "Coldest shelf, on a plate to catch drips. Freeze if not using within 2 days.",
      "Greek Yogurt": "Lid tight, no double-dipping. Whey on top is fine — stir it back in.",
    };
    if (byName[item.name]) return byName[item.name];
    const byCat = {
      "Vegetables": "Most veg lasts longer in the crisper drawer. Store unwashed; rinse just before using.",
      "Fruits":     "Apples and bananas off-gas — keep them away from greens and grapes.",
      "Dairy":      "Coldest part of the fridge. Door shelves swing in temperature.",
      "Meat":       "Always on the bottom shelf to avoid drip contamination.",
      "Frozen":     "Keep below 0°F (-18°C). Once thawed, don't refreeze raw.",
      "Grains":     "Airtight containers in the pantry. Lasts months.",
      "Sauces":     "Refrigerate after opening unless label says otherwise.",
    };
    return byCat[item.cat] || "Pilot will learn the best home for this and remind you next time.";
  };

  // ─── Item detail drawer ──────────────────────────────────────────────────
  const ItemDrawer = ({ itemId, onClose, onPushToast }) => {
    const item = itemId ? D.items.find(i => i.id === itemId) : null;
    if (!item) return null;
    const bg = {
      today:    "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
      tomorrow: "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
      week:     "linear-gradient(160deg, #F4E6C8 0%, #EFD7A4 100%)",
      fresh:    "linear-gradient(160deg, #E5EBD5 0%, #D2DFB6 100%)",
      frozen:   "linear-gradient(160deg, #D9E4EC 0%, #BFD1DE 100%)",
    }[item.status];
    const recipes = D.recipes.filter(r => r.uses.includes(item.name)).slice(0, 3);

    return (
      <Drawer open={!!itemId} onClose={onClose}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{
            padding: "20px 24px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: "1px solid var(--line)",
          }}>
            <span style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase" }}>Inventory item</span>
            <div style={{ flex: 1 }}/>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, background: "var(--bg-tint)",
              color: "var(--ink-muted)", border: "1px solid var(--line)",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}><Icon name="close" size={15}/></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ height: 220, background: bg, display: "grid", placeItems: "center",
                            position: "relative" }}>
              <Illo name={item.illo} size={120}/>
              <div style={{ position: "absolute", top: 16, left: 16 }}>
                <ExpiryBadge status={item.status} expires={item.expires} size="lg"/>
              </div>
            </div>
            <div style={{ padding: "22px 24px" }}>
              <h2 className="serif" style={{ fontSize: 30, margin: 0, letterSpacing: -0.5 }}>
                {item.name}
              </h2>
              <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 4 }}>
                {item.cat} · added by {item.owner} · from {item.store}
              </div>

              {/* Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22,
                              padding: 16, background: "var(--paper-warm)", borderRadius: 12,
                              border: "1px solid var(--line-soft)" }}>
                <DetailField label="Quantity"  value={item.qty}/>
                <DetailField label="Location"  value={item.loc}/>
                <DetailField label="Expires"   value={item.expires} accent="var(--tomato)"/>
                <DetailField label="Price"     value={item.price ? `$${item.price.toFixed(2)}` : "—"}/>
              </div>

              {/* Quick actions */}
              <div style={{ marginTop: 22 }}>
                <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                  Quick actions
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                  <Button variant="primary" icon="check" full
                          onClick={() => { onPushToast?.(`${item.name} marked as used`); onClose(); }}>
                    Mark as used
                  </Button>
                  <Button variant="secondary" icon="cart" full
                          onClick={() => { onPushToast?.(`${item.name} added to grocery list`, { icon: "check" }); onClose(); }}>Add to grocery</Button>
                  <Button variant="secondary" icon="snowflake" full
                          onClick={() => { onPushToast?.(`${item.name} moved to freezer`, { icon: "check" }); onClose(); }}>Freeze it</Button>
                  <Button variant="secondary" icon="save" full
                          onClick={() => { onPushToast?.(`${item.name} saved as leftover`, { icon: "check" }); onClose(); }}>Move to leftovers</Button>
                </div>
              </div>

              {/* Storage guidance */}
              <div style={{ marginTop: 22, padding: 14,
                              background: "var(--bg-tint)", border: "1px solid var(--line-soft)",
                              borderRadius: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon name="info" size={14} stroke="var(--green-deep)"/>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--green-deep)",
                                    letterSpacing: 0.4, textTransform: "uppercase" }}>Freshness guide</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>
                  {storageTip(item)}
                </div>
              </div>

              {/* Recipes */}
              {recipes.length > 0 && (
                <div style={{ marginTop: 26 }}>
                  <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                                  fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                    Cook with this
                  </div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {recipes.map(r => (
                      <div key={r.id} style={{
                        display: "flex", alignItems: "center", gap: 12,
                        padding: "10px 12px", borderRadius: 10,
                        background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 9,
                          background: `linear-gradient(135deg, ${r.tone}CC, ${r.tone}88)`,
                          display: "grid", placeItems: "center",
                        }}>
                          <Illo name="rice" size={22}/>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{r.name}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                            {r.time} min · {r.match}% match
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" iconRight="chevronRight"
                                onClick={() => { onClose(); window.PPOpenRecipe?.(r.id); }}>Open</Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pilot tip */}
              {item.status === "today" || item.status === "tomorrow" ? (
                <div style={{ marginTop: 22, padding: 16, background: "var(--ink)",
                                borderRadius: 12, color: "var(--paper-warm)" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <Icon name="sparkles" size={14} stroke="var(--amber)"/>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                                     textTransform: "uppercase", color: "rgba(253,250,243,.6)" }}>Pilot</span>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
                    {item.name} fits the Schezwan fried rice you have ingredients for tonight.
                    Cooking it saves about $3.49 from the waste line.
                  </div>
                </div>
              ) : null}
            </div>
          </div>
          <div style={{ padding: "14px 24px", borderTop: "1px solid var(--line)",
                          display: "flex", justifyContent: "space-between" }}>
            <Button variant="ghost" icon="trash" style={{ color: "var(--tomato)" }}
                    onClick={() => { onPushToast?.(`${item.name} removed from pantry`, { icon: "check", tone: "tomato" }); onClose(); }}>Delete</Button>
            <Button variant="primary" icon="edit"
                    onClick={() => onPushToast?.("Editing item…")}>Edit</Button>
          </div>
        </div>
      </Drawer>
    );
  };

  const DetailField = ({ label, value, accent }) => (
    <div>
      <div style={{ fontSize: 10.5, color: "var(--ink-muted)", fontWeight: 700,
                      letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 14, color: accent || "var(--ink)", marginTop: 3, fontWeight: 600 }}>{value}</div>
    </div>
  );

  // ─── Recipe detail drawer ────────────────────────────────────────────────
  const RecipeDrawer = ({ recipeId, onClose, onCook, onPushToast }) => {
    const r = recipeId ? D.recipes.find(x => x.id === recipeId) : null;
    if (!r) return null;
    const ingrIllo = (name) => {
      const map = {
        "Cooked Rice": "rice", "Eggs": "egg", "Bell Peppers": "pepper", "Carrots": "carrot",
        "Garlic": "garlic", "Schezwan Sauce": "chili", "Spaghetti": "pasta", "Spinach": "spinach",
        "Chickpeas": "beans", "Jasmine Rice": "ricebag", "Onions": "onion",
        "Olive Oil": "oil", "Chicken Breast": "chicken", "Greek Yogurt": "yogurt",
        "Sriracha": "chili", "Bananas": "banana", "Whole Milk": "milk", "Rolled Oats": "oats",
        "Frozen Berries": "berries", "Cheddar Cheese": "cheese", "Wheat Bread": "bread",
        "Firm Tofu": "tofu", "Soy Sauce": "soy", "Black Beans": "beans", "Roma Tomatoes": "tomato",
      };
      return map[name] || "egg";
    };
    const heroIllo = (() => {
      const n = r.name;
      if (/noodle|chow mein|hakka/i.test(n)) return "noodles";
      if (/taco|quesadilla|burrito|huevos|ranchero/i.test(n)) return "tortilla";
      if (/paneer/i.test(n)) return "paneer";
      if (/dal|lentil/i.test(n)) return "lentils";
      if (/kung pao|tofu/i.test(n)) return "tofu";
      if (/chana|chickpea|bean/i.test(n)) return "beans";
      if (/curry|egg|omelette/i.test(n)) return "egg";
      if (/pasta/i.test(n)) return "pasta";
      if (/yogurt|parfait/i.test(n)) return "yogurt";
      if (/oat|pancake/i.test(n)) return "oats";
      if (/wrap|sandwich/i.test(n)) return "bread";
      if (/chicken/i.test(n)) return "chicken";
      return "rice";
    })();
    return (
      <Drawer open={!!recipeId} onClose={onClose} width={520}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{
            position: "relative", height: 240,
            background: `linear-gradient(135deg, ${r.tone}E6 0%, ${r.tone}99 100%)`,
            display: "grid", placeItems: "center", flex: "0 0 auto",
          }}>
            <Illo name={heroIllo} size={120}/>
            <button onClick={onClose} style={{
              position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,.92)", color: "var(--ink-2)",
              border: "none", display: "grid", placeItems: "center", cursor: "pointer",
            }}><Icon name="close" size={16}/></button>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
              <Pill tone="ink" size="md">{r.match}% match</Pill>
              {r.expiringUsed.length > 0 && (
                <Pill tone="orange" size="md" icon="alert">Uses {r.expiringUsed.length} expiring</Pill>
              )}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "22px 24px" }}>
            <h2 className="serif" style={{ fontSize: 28, margin: 0, letterSpacing: -0.4, lineHeight: 1.1 }}>
              {r.name}
            </h2>
            <p style={{ marginTop: 8, marginBottom: 18, fontSize: 14, color: "var(--ink-muted)",
                          lineHeight: 1.55 }}>{r.desc}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22,
                            paddingBottom: 18, borderBottom: "1px solid var(--line-soft)" }}>
              {[
                { l: "Time",    v: `${r.time}m`,   c: "var(--ink)" },
                { l: "Cost",    v: `$${r.cost.toFixed(2)}`, c: "var(--green-deep)" },
                { l: "Cals",    v: r.cals,         c: "var(--orange)" },
                { l: "Protein", v: `${r.protein}g`, c: "var(--tomato)" },
              ].map(s => (
                <div key={s.l}>
                  <div className="serif tnum" style={{ fontSize: 22, color: s.c, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 4,
                                  fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>

            {/* Match breakdown */}
            <div style={{ marginBottom: 16, padding: 16, background: "var(--green-tint)",
                            border: "1px solid var(--green-soft)", borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green-deep)",
                              letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 10 }}>
                Ingredient match · {r.match}%
              </div>
              <div style={{ display: "grid", gap: 4 }}>
                <MatchRow label={`${r.uses.length - r.missing.length} ingredients available`} ok/>
                <MatchRow label={`${r.expiringUsed.length} expiring ingredients used`} tone="orange"/>
                {r.missing.length > 0 && (
                  <MatchRow label={`${r.missing.length} missing — Pilot added them to your list`} tone="tomato"/>
                )}
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginBottom: 22, padding: 16,
                            background: "var(--paper-warm)", border: "1px solid var(--line)",
                            borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-muted)",
                                  letterSpacing: 0.4, textTransform: "uppercase" }}>Pilot's confidence</span>
                <span className="serif tnum" style={{ fontSize: 22, color: "var(--green-deep)", lineHeight: 1 }}>
                  {Math.min(99, r.match + 4)}%
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.5, marginBottom: 10 }}>
                Easy win — beginner-friendly, equipment matches, ingredients on hand.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <ConfTag ok label={`Skill: ${r.difficulty}`}/>
                <ConfTag ok label="Equipment match"/>
                <ConfTag ok label="Time fits weeknight"/>
                <ConfTag warn={r.missing.length > 0} label={r.missing.length > 0 ? `${r.missing.length} missing item` : "Fully stocked"}/>
              </div>
            </div>

            {/* Ingredients */}
            <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
              Ingredients · serves 2
            </div>
            <div style={{ display: "grid", gap: 6, marginBottom: 22 }}>
              {r.uses.map(u => (
                <div key={u} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
                }}>
                  <div style={{ width: 28, height: 28, background: "var(--paper)", borderRadius: 7,
                                  display: "grid", placeItems: "center" }}>
                    <Illo name={ingrIllo(u)} size={20}/>
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--ink-2)" }}>{u}</span>
                  <Pill tone="green" size="sm">In pantry</Pill>
                </div>
              ))}
              {r.missing.map(m => (
                <div key={m} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--tomato-soft)", border: "1px solid var(--tomato-line)",
                }}>
                  <div style={{ width: 28, height: 28, background: "var(--on-tint-pad)", borderRadius: 7,
                                  display: "grid", placeItems: "center", color: "var(--tomato-ink)" }}>
                    <Icon name="plus" size={16}/>
                  </div>
                  <span style={{ flex: 1, fontSize: 13, color: "var(--tomato-ink)", fontWeight: 600 }}>{m}</span>
                  <Pill tone="tomato" size="sm">Missing</Pill>
                </div>
              ))}
            </div>

            {/* Substitutions */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                              fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
                Smart substitutions
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-muted)", lineHeight: 1.55 }}>
                No spring onions? Use the green tops of regular onions, or skip entirely — the Schezwan sauce carries it.
              </div>
            </div>
          </div>

          <div style={{ padding: "16px 24px", borderTop: "1px solid var(--line)",
                          display: "flex", gap: 8 }}>
            <Button full variant="primary" iconRight="arrowRight" onClick={() => onCook(r.id)}>
              Start cooking
            </Button>
            <Button variant="secondary" icon="bookmark"
                    onClick={() => onPushToast?.("Recipe saved", { icon: "check" })}>Save</Button>
            <Button variant="secondary" icon="cart"
                    onClick={() => onPushToast?.("Added missing ingredients to grocery list", { icon: "check" })}>
              Add missing
            </Button>
          </div>
        </div>
      </Drawer>
    );
  };

  const MatchRow = ({ label, ok, tone }) => {
    const c = ok ? "var(--green-deep)" : tone === "tomato" ? "var(--tomato)" : "var(--orange-deep)";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: c }}>
        <Icon name={ok ? "check" : tone === "tomato" ? "alert" : "info"} size={13}/>
        <span>{label}</span>
      </div>
    );
  };

  const ConfTag = ({ label, ok, warn }) => {
    const c = warn ? "var(--amber)" : ok ? "var(--green)" : "var(--ink-muted)";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--ink-2)" }}>
        <Icon name={warn ? "info" : "check"} size={12} stroke={c}/>
        <span>{label}</span>
      </div>
    );
  };

  // ─── Ask Pilot drawer ────────────────────────────────────────────────────
  const AskPilot = ({ open, onClose }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
      { role: "pilot", text: "I see you've got spinach expiring tomorrow, leftover rice from Monday, and a half-jar of Schezwan sauce. The obvious move tonight is fried rice — 18 minutes, $2.40 a serving." },
    ]);
    const [thinking, setThinking] = useState(false);
    const scroll = useRef();

    useEffect(() => { scroll.current?.scrollTo({ top: 99999, behavior: "smooth" }); }, [messages, thinking]);

    const send = async (text) => {
      const t = (text || input).trim();
      if (!t) return;
      setMessages(m => [...m, { role: "user", text: t }]);
      setInput("");
      setThinking(true);
      try {
        const sys = `You are Pilot, a kitchen AI inside the PantryPilot demo. Be warm, calm, and concise.
Always reply in 2-4 sentences. The user (Hemanth) lives in Apartment 4B with 2 roommates,
$250/month budget. His pantry includes: rice, eggs, milk, Greek yogurt, spinach (tomorrow!),
bell peppers, onions, garlic, tomatoes, carrots, jasmine rice, spaghetti, bread, chicken,
tofu, frozen mixed veg, frozen berries, chickpeas, black beans, olive oil, soy sauce,
Schezwan sauce, peanut butter, oats, bananas, cheddar, coffee. Leftover cooked rice (2 servings, use today).`;
        const out = await window.claude.complete({
          messages: [{ role: "user", content: `${sys}\n\nUser: ${t}` }],
        });
        setMessages(m => [...m, { role: "pilot", text: out }]);
      } catch (e) {
        setMessages(m => [...m, { role: "pilot", text: "I'm not sure right now — but with what's in your fridge, I'd lean on the Schezwan fried rice tonight." }]);
      } finally {
        setThinking(false);
      }
    };

    const quickPrompts = [
      "What can I cook in 20 minutes?",
      "Use my expiring vegetables",
      "Plan a $60 high-protein week",
      "Suggest meals under $3 / serving",
    ];

    return (
      <Drawer open={open} onClose={onClose} width={460}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%",
                        background: "var(--bg)" }}>
          {/* Header */}
          <div style={{
            padding: "16px 22px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: "1px solid var(--line)", background: "var(--paper-warm)",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--ink)",
                            color: "var(--amber)", display: "grid", placeItems: "center" }}>
              <Icon name="sparkles" size={16}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 17, color: "var(--ink)" }}>Pilot</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>Knows your kitchen</div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, background: "transparent",
              color: "var(--ink-muted)", border: "1px solid var(--line)",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}><Icon name="close" size={15}/></button>
          </div>

          {/* Conversation */}
          <div ref={scroll} style={{ flex: 1, overflowY: "auto", padding: 20 }}>
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.text}/>
            ))}
            {thinking && <Bubble role="pilot" text="…" thinking/>}
          </div>

          {/* Context strip */}
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--line)",
                          background: "var(--paper-warm)" }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-muted)", fontWeight: 700,
                            letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 8 }}>
              Try asking
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {quickPrompts.map(p => (
                <button key={p} onClick={() => send(p)} style={{
                  padding: "6px 10px", borderRadius: 999,
                  background: "var(--paper)", border: "1px solid var(--line)",
                  fontSize: 11.5, color: "var(--ink-2)", fontWeight: 500,
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: 16, borderTop: "1px solid var(--line)", background: "var(--paper-warm)" }}>
            <div style={{
              display: "flex", alignItems: "flex-end", gap: 8,
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 14, padding: 8,
            }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask Pilot something about your kitchen…"
                rows={1}
                style={{
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontSize: 13.5, color: "var(--ink)", padding: "8px 10px", resize: "none",
                  fontFamily: "inherit", lineHeight: 1.45,
                }}/>
              <button onClick={() => send()} disabled={!input.trim() || thinking} style={{
                width: 34, height: 34, borderRadius: 9,
                background: input.trim() ? "var(--ink)" : "var(--bg-tint)",
                color: input.trim() ? "var(--paper-warm)" : "var(--ink-soft)",
                border: "none", display: "grid", placeItems: "center",
                cursor: input.trim() ? "pointer" : "default",
                transition: "all 160ms",
              }}>
                <Icon name="arrowRight" size={15}/>
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    );
  };

  const Bubble = ({ role, text, thinking }) => {
    if (role === "user") {
      return (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={{
            maxWidth: "82%", padding: "10px 14px", background: "var(--ink)",
            color: "var(--paper-warm)", borderRadius: "14px 14px 4px 14px",
            fontSize: 13.5, lineHeight: 1.5,
          }}>{text}</div>
        </div>
      );
    }
    return (
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 999, background: "var(--ink)",
                        color: "var(--amber)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
          <Icon name="sparkles" size={12}/>
        </div>
        <div style={{
          maxWidth: "85%", padding: "10px 14px", background: "var(--paper)",
          border: "1px solid var(--line)", color: "var(--ink-2)",
          borderRadius: "4px 14px 14px 14px", fontSize: 13.5, lineHeight: 1.5,
        }}>
          {thinking ? <span style={{ color: "var(--ink-soft)" }}>thinking…</span> : text}
        </div>
      </div>
    );
  };

  // ─── Add item modal ──────────────────────────────────────────────────────
  const AddItemModal = ({ open, onClose, onPushToast }) => {
    const [name, setName] = useState("");
    const [cat, setCat] = useState("Vegetables");
    const [loc, setLoc] = useState("Fridge");
    const [qty, setQty] = useState("1");

    const handle = () => {
      onPushToast?.(`Added ${name || "item"} to ${loc}`, { icon: "check" });
      onClose();
      setName("");
    };

    return (
      <Modal open={open} onClose={onClose} width={560}>
        <div style={{ padding: "22px 26px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                          fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
            Add to pantry
          </div>
          <h2 className="serif" style={{ margin: 0, fontSize: 22, letterSpacing: -0.3 }}>
            New item
          </h2>
        </div>
        <div style={{ padding: 26 }}>
          {/* Quick options */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <QuickAction icon="receipt" label="Scan receipt"/>
            <QuickAction icon="barcode" label="Scan barcode"/>
            <QuickAction icon="scan" label="Photo of fridge"/>
          </div>

          <Label>Item name</Label>
          <input value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Spinach" autoFocus
                 style={inputStyle}/>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <Label>Category</Label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} style={inputStyle}>
                {["Vegetables", "Dairy", "Meat", "Grains", "Frozen", "Canned", "Sauces", "Oils", "Fruits"].map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Location</Label>
              <select value={loc} onChange={(e) => setLoc(e.target.value)} style={inputStyle}>
                {["Fridge", "Freezer", "Pantry", "Counter"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 14 }}>
            <div>
              <Label>Quantity</Label>
              <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="1 bag" style={inputStyle}/>
            </div>
            <div>
              <Label>Expires</Label>
              <input placeholder="Pilot will estimate" style={inputStyle}/>
            </div>
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--green-tint)",
                          border: "1px solid var(--green-soft)", borderRadius: 10,
                          display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="sparkles" size={14} stroke="var(--green-deep)"/>
            <span style={{ fontSize: 12, color: "var(--green-deep)" }}>
              Pilot will estimate the expiry date and grocery section for you.
            </span>
          </div>
        </div>
        <div style={{ padding: "14px 26px", borderTop: "1px solid var(--line)",
                        display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" iconRight="check" onClick={handle}>Add item</Button>
        </div>
      </Modal>
    );
  };

  const Label = ({ children }) => (
    <div style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--ink-muted)",
                    fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>
      {children}
    </div>
  );
  const inputStyle = {
    width: "100%", height: 40, padding: "0 14px",
    border: "1px solid var(--line)", borderRadius: 10,
    background: "var(--paper)", fontSize: 13.5, color: "var(--ink)", fontFamily: "inherit",
  };

  const QuickAction = ({ icon, label }) => (
    <button onClick={() => window.PPToast?.(`${label} — coming up`)} style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      padding: "12px 8px", background: "var(--paper-warm)", border: "1px solid var(--line-soft)",
      borderRadius: 10, cursor: "pointer", color: "var(--ink-2)",
    }}>
      <Icon name={icon} size={18}/>
      <span style={{ fontSize: 11.5, fontWeight: 600 }}>{label}</span>
    </button>
  );

  // ─── Kitchen Inbox drawer ────────────────────────────────────────────────
  const KitchenInbox = ({ open, onClose }) => {
    const [items, setItems] = useState(D.inbox);
    const [input, setInput] = useState("");

    const add = () => {
      if (!input.trim()) return;
      setItems(arr => [{ id: `in${Date.now()}`, type: "todo", text: input, when: "just now" }, ...arr]);
      setInput("");
      window.PPToast?.("Captured", { icon: "check" });
    };

    const iconFor = (type) => ({
      recipe: "chef", grocery: "cart", voice: "info", photo: "scan", todo: "check",
    })[type] || "info";

    const toneFor = (type) => ({
      recipe: "var(--orange)", grocery: "var(--green)", voice: "var(--sky)", photo: "var(--plum)", todo: "var(--amber)",
    })[type] || "var(--ink-muted)";

    return (
      <Drawer open={open} onClose={onClose} width={460}>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{
            padding: "16px 22px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: "1px solid var(--line)", background: "var(--paper-warm)",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-tint)",
                            color: "var(--ink-2)", display: "grid", placeItems: "center" }}>
              <Icon name="bookmark" size={16}/>
            </div>
            <div style={{ flex: 1 }}>
              <div className="serif" style={{ fontSize: 17, color: "var(--ink)" }}>Kitchen Inbox</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-muted)" }}>
                Capture anything. Pilot files it later.
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, background: "transparent",
              color: "var(--ink-muted)", border: "1px solid var(--line)",
              display: "grid", placeItems: "center", cursor: "pointer",
            }}><Icon name="close" size={15}/></button>
          </div>

          {/* Capture input */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: 12, padding: 8,
            }}>
              <input value={input} onChange={(e) => setInput(e.target.value)}
                     onKeyDown={(e) => e.key === "Enter" && add()}
                     placeholder="Buy oat milk · try TikTok feta pasta · use spinach…"
                     style={{
                       flex: 1, border: "none", outline: "none", background: "transparent",
                       fontSize: 13, color: "var(--ink)", padding: "6px 8px", fontFamily: "inherit",
                     }}/>
              <button onClick={add} disabled={!input.trim()} style={{
                width: 30, height: 30, borderRadius: 7,
                background: input.trim() ? "var(--ink)" : "var(--bg-tint)",
                color: input.trim() ? "var(--paper-warm)" : "var(--ink-soft)",
                border: "none", display: "grid", placeItems: "center", cursor: "pointer",
              }}><Icon name="plus" size={14}/></button>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              <QuickInbox icon="receipt"  label="Snap receipt"  onClick={() => window.PPToast?.("Camera ready…")}/>
              <QuickInbox icon="upload"   label="Paste URL"     onClick={() => window.PPToast?.("Paste anywhere — Pilot will parse it")}/>
              <QuickInbox icon="info"     label="Voice note"    onClick={() => window.PPToast?.("Listening…")}/>
            </div>
          </div>

          {/* Inbox items */}
          <div style={{ flex: 1, overflowY: "auto", padding: 20, background: "var(--bg)" }}>
            <div style={{ fontSize: 10.5, letterSpacing: 0.5, color: "var(--ink-muted)",
                            fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
              {items.length} captured · oldest first will be auto-archived in 30d
            </div>
            {items.map(it => (
              <div key={it.id} style={{
                display: "flex", gap: 12, padding: "12px 14px", marginBottom: 8,
                background: "var(--paper)", border: "1px solid var(--line)",
                borderRadius: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8,
                                background: `${toneFor(it.type)}1F`, color: toneFor(it.type),
                                display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Icon name={iconFor(it.type)} size={13}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.4 }}>{it.text}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4,
                                  display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ textTransform: "capitalize" }}>{it.type}</span>
                    <span>·</span>
                    <span>{it.when}</span>
                  </div>
                </div>
                <button onClick={() => setItems(arr => arr.filter(x => x.id !== it.id))} style={{
                  width: 22, height: 22, background: "transparent", border: "none",
                  color: "var(--ink-soft)", cursor: "pointer", opacity: 0.6,
                }}><Icon name="close" size={12}/></button>
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ textAlign: "center", padding: 36, color: "var(--ink-muted)" }}>
                <Icon name="bookmark" size={32} stroke="var(--ink-soft)"/>
                <div style={{ marginTop: 10, fontSize: 13 }}>Inbox zero. Capture something.</div>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    );
  };

  const QuickInbox = ({ icon, label, onClick }) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 10px", background: "var(--paper-warm)",
      border: "1px solid var(--line-soft)", borderRadius: 999,
      fontSize: 11.5, color: "var(--ink-2)", fontWeight: 600, cursor: "pointer",
    }}>
      <Icon name={icon} size={12}/> {label}
    </button>
  );

  window.PPOverlays = { ItemDrawer, RecipeDrawer, AskPilot, AddItemModal, KitchenInbox };
})();
