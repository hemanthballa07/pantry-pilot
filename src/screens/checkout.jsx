// screens/checkout.jsx — One-tap grocery checkout. window.PPCheckout = { Checkout }
//   The monetization moment: review basket → pick retailer/fulfillment →
//   place order → items auto-add to pantry on arrival.
//   Phases: cart → placing → done.

(function () {
  const { useState, useEffect, useMemo } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;
  const { Pill, Card, Button } = window.PPUI;
  const D = window.PP_DATA;

  const ingrIllo = (window.PPRecipeDefs || {}).ingrIllo || (() => "egg");

  // retailers with a price multiplier vs. baseline + fulfillment
  const RETAILERS = [
    { id: "aldi",    name: "Aldi",         mult: 0.86, fee: 3.99, eta: "Today, 2–3 PM",  badge: "Cheapest" },
    { id: "walmart", name: "Walmart",      mult: 0.95, fee: 0.00, eta: "Today, 4–6 PM",  badge: "Free delivery" },
    { id: "publix",  name: "Publix",       mult: 1.10, fee: 4.99, eta: "Today, 1–2 PM",  badge: "Fastest" },
    { id: "wholef",  name: "Whole Foods",  mult: 1.24, fee: 0.00, eta: "Tomorrow AM",    badge: "Organic" },
  ];

  const Checkout = ({ onClose, onPushToast, onNav }) => {
    const [phase, setPhase] = useState("cart");
    const [retailer, setRetailer] = useState("aldi");
    const [fulfillment, setFulfillment] = useState("delivery");
    const [excluded, setExcluded] = useState(() => new Set());

    const cart = useMemo(() => D.grocery.filter(g => !g.bought), []);
    const included = cart.filter(c => !excluded.has(c.id));
    const r = RETAILERS.find(x => x.id === retailer);

    const baseSubtotal = included.reduce((s, c) => s + c.price, 0);
    const subtotal = baseSubtotal * r.mult;
    const deliveryFee = fulfillment === "pickup" ? 0 : r.fee;
    const serviceFee = +(subtotal * 0.05).toFixed(2);
    const total = subtotal + deliveryFee + serviceFee;
    // savings vs. the priciest retailer, same basket
    const priciest = Math.max(...RETAILERS.map(x => x.mult)) * baseSubtotal;
    const savings = Math.max(0, priciest - subtotal);

    useEffect(() => {
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
      if (phase !== "placing") return;
      const t = setTimeout(() => setPhase("done"), 1700);
      return () => clearTimeout(t);
    }, [phase]);

    const toggle = (id) => setExcluded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

    const phases = ["cart", "placing", "done"];

    return (
      <div className="pp-overlay" style={{ alignItems: "stretch", justifyContent: "stretch",
                                              padding: "5vh 5vw", overflow: "hidden" }}>
        <div style={{ width: "100%", maxWidth: 920, margin: "0 auto", background: "var(--paper)",
                        border: "1px solid var(--line)", borderRadius: 22, boxShadow: "var(--sh-lift)",
                        display: "flex", flexDirection: "column", minHeight: 0, maxHeight: "90vh",
                        overflow: "hidden", animation: "ppPop 220ms ease-out" }}>
          {/* Header */}
          <div style={{ padding: "14px 22px", display: "flex", alignItems: "center",
                          justifyContent: "space-between", gap: 12, borderBottom: "1px solid var(--line)",
                          background: "var(--paper-warm)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "var(--green-deep)" }}><Icon name="cart" size={16}/></span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Checkout</span>
              <span style={{ marginLeft: 14, display: "flex", gap: 4 }}>
                {phases.map(p => (
                  <span key={p} style={{ width: phase === p ? 22 : 6, height: 6, borderRadius: 999,
                              background: phases.indexOf(p) <= phases.indexOf(phase) ? "var(--green)" : "var(--line-strong)",
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

          {/* CART */}
          {phase === "cart" && (
            <div style={{ flex: 1, overflow: "hidden", minHeight: 0,
                            display: "grid", gridTemplateColumns: "1fr 340px" }}>
              {/* Left: basket + retailer */}
              <div style={{ overflowY: "auto", padding: "22px 24px", borderRight: "1px solid var(--line)" }}>
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Your basket</div>
                <div className="serif" style={{ fontSize: 22, color: "var(--ink)", marginBottom: 16, letterSpacing: -0.3 }}>
                  {included.length} items · delivered to Apartment 4B
                </div>

                <div style={{ display: "grid", gap: 6, marginBottom: 24 }}>
                  {cart.map(c => {
                    const on = !excluded.has(c.id);
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12,
                                      padding: "9px 10px", borderRadius: 10,
                                      background: on ? "var(--paper-warm)" : "transparent",
                                      border: "1px solid var(--line-soft)", opacity: on ? 1 : 0.5 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--bg-tint)",
                                        border: "1px solid var(--line-soft)", display: "grid", placeItems: "center",
                                        flex: "0 0 auto" }}>
                          <Illo name={ingrIllo(c.name)} size={22}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)",
                                          textDecoration: on ? "none" : "line-through" }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{c.qty} · {c.section}</div>
                        </div>
                        <span className="tnum" style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 600 }}>
                          ${(c.price * r.mult).toFixed(2)}
                        </span>
                        <button onClick={() => toggle(c.id)} style={{ width: 26, height: 26, borderRadius: 7,
                                        background: "transparent", border: "none", cursor: "pointer",
                                        color: "var(--ink-soft)", display: "grid", placeItems: "center" }}>
                          <Icon name={on ? "trash" : "plus"} size={13}/>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Retailer choice */}
                <div style={{ fontSize: 11, letterSpacing: 0.6, color: "var(--ink-muted)",
                                fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>
                  Choose a store · same basket, live prices
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {RETAILERS.map(x => {
                    const on = retailer === x.id;
                    const xt = baseSubtotal * x.mult;
                    return (
                      <button key={x.id} onClick={() => setRetailer(x.id)} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                        background: on ? "var(--green-tint)" : "var(--paper)",
                        border: `1.5px solid ${on ? "var(--green)" : "var(--line)"}`,
                        borderRadius: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{x.name}</span>
                            {x.id === "aldi" && <Pill tone="green" size="sm">{x.badge}</Pill>}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 2 }}>{x.eta}</div>
                        </div>
                        <span className="serif tnum" style={{ fontSize: 16, color: "var(--ink)" }}>${xt.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: fulfillment + totals */}
              <div style={{ display: "flex", flexDirection: "column", background: "var(--bg)", minHeight: 0 }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px" }}>
                  {/* Fulfillment toggle */}
                  <div style={{ display: "flex", gap: 6, background: "var(--bg-tint)", padding: 4,
                                  borderRadius: 10, border: "1px solid var(--line)", marginBottom: 18 }}>
                    {[["delivery", "Delivery"], ["pickup", "Pickup"]].map(([k, l]) => (
                      <button key={k} onClick={() => setFulfillment(k)} style={{
                        flex: 1, padding: "8px 0", fontSize: 12.5, fontWeight: 600,
                        background: fulfillment === k ? "var(--paper)" : "transparent",
                        color: fulfillment === k ? "var(--ink)" : "var(--ink-muted)",
                        border: "none", borderRadius: 7, cursor: "pointer", fontFamily: "inherit",
                        boxShadow: fulfillment === k ? "var(--sh-1)" : "none" }}>{l}</button>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5,
                                  color: "var(--ink-2)", marginBottom: 18 }}>
                    <Icon name="timer" size={14} stroke="var(--green-deep)"/>
                    {fulfillment === "pickup" ? "Ready for pickup in ~2 hours" : `Arrives ${r.eta}`}
                  </div>

                  {/* Totals */}
                  <div style={{ display: "grid", gap: 9, fontSize: 13, color: "var(--ink-muted)" }}>
                    <Row l={`Subtotal · ${included.length} items`} v={`$${subtotal.toFixed(2)}`}/>
                    <Row l={fulfillment === "pickup" ? "Pickup" : "Delivery"} v={deliveryFee === 0 ? "Free" : `$${deliveryFee.toFixed(2)}`}/>
                    <Row l="Service fee" v={`$${serviceFee.toFixed(2)}`}/>
                  </div>
                  <div style={{ height: 1, background: "var(--line)", margin: "14px 0" }}/>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>Total</span>
                    <span className="serif tnum" style={{ fontSize: 26, color: "var(--ink)" }}>${total.toFixed(2)}</span>
                  </div>

                  {savings > 0.5 && (
                    <div style={{ marginTop: 14, padding: "10px 12px", background: "var(--green-tint)",
                                    border: "1px solid var(--green-soft)", borderRadius: 10,
                                    display: "flex", gap: 8, alignItems: "center" }}>
                      <Icon name="sparkles" size={14} stroke="var(--green-deep)"/>
                      <span style={{ fontSize: 12, color: "var(--green-deep)", fontWeight: 600 }}>
                        Pilot picked {r.name} — saving you ${savings.toFixed(2)} on this basket.
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ padding: "14px 22px", borderTop: "1px solid var(--line)",
                                background: "var(--paper-warm)" }}>
                  <Button full variant="primary" size="lg" iconRight="arrowRight"
                          onClick={() => setPhase("placing")} disabled={included.length === 0}>
                    Place order · ${total.toFixed(2)}
                  </Button>
                  <div style={{ fontSize: 10.5, color: "var(--ink-soft)", textAlign: "center",
                                  marginTop: 10, lineHeight: 1.5 }}>
                    PantryPilot is free — we earn a small partner commission, never a markup on your cart.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PLACING */}
          {phase === "placing" && (
            <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 40 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 999, margin: "0 auto 18px",
                                border: "3px solid var(--green-soft)", borderTopColor: "var(--green)",
                                animation: "ppSpin 800ms linear infinite" }}/>
                <div className="serif" style={{ fontSize: 22, color: "var(--ink)" }}>
                  Placing your order with {r.name}…
                </div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)", marginTop: 6 }}>
                  Confirming live prices and your {fulfillment === "pickup" ? "pickup slot" : "delivery window"}.
                </div>
              </div>
              <style>{`@keyframes ppSpin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* DONE */}
          {phase === "done" && (
            <div style={{ flex: 1, overflowY: "auto", padding: "44px 32px 28px",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: 999, background: "var(--green-tint)",
                              border: "3px solid var(--green)", display: "grid", placeItems: "center",
                              color: "var(--green-deep)", animation: "ppPop 320ms ease-out" }}>
                <Icon name="check" size={44}/>
              </div>
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: 28, letterSpacing: -0.4 }}>
                  Order placed with {r.name}
                </h2>
                <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 8, lineHeight: 1.5, maxWidth: 460 }}>
                  {fulfillment === "pickup" ? "Ready for pickup in ~2 hours." : `Arriving ${r.eta}.`} The {included.length} items
                  will auto-add to your pantry the moment they arrive — no scanning needed.
                </div>
              </div>

              <Card pad={18} style={{ width: "100%", maxWidth: 460 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Order total</span>
                  <span className="tnum" style={{ fontWeight: 700, color: "var(--ink)" }}>${total.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "var(--ink-muted)" }}>Saved vs. priciest store</span>
                  <span className="tnum" style={{ fontWeight: 700, color: "var(--green-deep)" }}>${savings.toFixed(2)}</span>
                </div>
              </Card>

              <div style={{ display: "flex", gap: 10 }}>
                <Button variant="secondary" onClick={() => { onPushToast?.("Order tracked"); onClose(); }}>Track order</Button>
                <Button variant="primary" iconRight="arrowRight"
                        onClick={() => { onPushToast?.("Order placed · items will sync to pantry"); onNav?.("pantry"); onClose(); }}>
                  View pantry
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Row = ({ l, v }) => (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>{l}</span><span className="tnum" style={{ color: "var(--ink-2)" }}>{v}</span>
    </div>
  );

  window.PPCheckout = { Checkout };
})();
