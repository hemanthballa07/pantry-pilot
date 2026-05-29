// components.jsx — shared UI primitives. Attached to window.PPUI.
// Depends on window.PPIcon and window.PPIllo.

(function () {
  const { useState, useEffect, useRef } = React;
  const { Icon } = window.PPIcon;
  const { Illo } = window.PPIllo;

  // ─── Pill / Badge ─────────────────────────────────────────────────────────
  const Pill = ({ tone = "neutral", size = "md", children, icon, dot }) => {
    const tones = {
      neutral:  { bg: "var(--line-soft)", fg: "var(--ink-2)",      bd: "var(--line)" },
      green:    { bg: "var(--green-soft)", fg: "var(--green-deep)", bd: "var(--green)" },
      orange:   { bg: "var(--orange-soft)",fg: "var(--orange-deep)",bd: "var(--orange)" },
      amber:    { bg: "var(--amber-soft)", fg: "var(--amber-ink)",           bd: "var(--amber)" },
      tomato:   { bg: "var(--tomato-soft)",fg: "var(--tomato-ink)",           bd: "var(--tomato)" },
      sky:      { bg: "var(--sky-soft)",   fg: "var(--sky-ink)",           bd: "var(--sky)" },
      ink:      { bg: "var(--ink)",        fg: "var(--paper-warm)", bd: "var(--ink)" },
      ghost:    { bg: "transparent",       fg: "var(--ink-muted)",  bd: "var(--line)" },
    };
    const t = tones[tone] || tones.neutral;
    const sz = size === "sm"
      ? { padding: "2px 8px",    fontSize: 10.5, gap: 4, h: 18 }
      : size === "lg"
      ? { padding: "5px 12px",   fontSize: 12.5, gap: 6, h: 26 }
      :                            { padding: "3px 10px", fontSize: 11.5, gap: 5, h: 22 };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: sz.gap,
        background: t.bg, color: t.fg,
        border: tone === "ghost" ? `1px solid ${t.bd}` : "none",
        borderRadius: 999,
        padding: sz.padding, fontSize: sz.fontSize, fontWeight: 600,
        lineHeight: 1, height: sz.h, letterSpacing: 0.1,
        whiteSpace: "nowrap",
      }}>
        {dot && <span style={{ width: 6, height: 6, borderRadius: 99,
                                background: t.fg, display: "inline-block" }}/>}
        {icon && <Icon name={icon} size={sz.fontSize}/>}
        {children}
      </span>
    );
  };

  // ─── Expiry badge — picks tone from status ────────────────────────────────
  const ExpiryBadge = ({ status, expires, size = "md" }) => {
    const map = {
      today:    { tone: "tomato",  text: "Use today",   icon: "alert" },
      tomorrow: { tone: "tomato",  text: "Tomorrow",    icon: "alert" },
      week:     { tone: "amber",   text: expires,       icon: "clock" },
      fresh:    { tone: "green",   text: expires,       icon: null    },
      frozen:   { tone: "sky",     text: "Frozen",      icon: "snowflake" },
      expired:  { tone: "ink",     text: "Expired",     icon: "alert" },
    };
    const m = map[status] || map.fresh;
    return <Pill tone={m.tone} size={size} icon={m.icon}>{m.text}</Pill>;
  };

  // ─── Button ───────────────────────────────────────────────────────────────
  const Button = ({ variant = "primary", size = "md", icon, iconRight, children, onClick, full, disabled, style: extra }) => {
    const v = {
      primary:   { bg: "var(--ink)",          fg: "var(--paper-warm)", bd: "var(--ink)" },
      secondary: { bg: "var(--paper)",        fg: "var(--ink)",        bd: "var(--line-strong)" },
      green:     { bg: "var(--green)",        fg: "#FDFAF3",           bd: "var(--green)" },
      orange:    { bg: "var(--orange)",       fg: "#FDFAF3",           bd: "var(--orange)" },
      ghost:     { bg: "transparent",         fg: "var(--ink-2)",      bd: "transparent" },
      soft:      { bg: "var(--bg-tint)",      fg: "var(--ink-2)",      bd: "var(--line)" },
    }[variant];
    const s = size === "sm"
      ? { p: "6px 12px", fs: 12, h: 30, r: 10 }
      : size === "lg"
      ? { p: "12px 20px", fs: 15, h: 48, r: 14 }
      :                   { p: "9px 16px", fs: 13.5, h: 38, r: 12 };
    return (
      <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        background: v.bg, color: v.fg, border: `1px solid ${v.bd}`,
        height: s.h, padding: s.p, borderRadius: s.r,
        fontSize: s.fs, fontWeight: 600, letterSpacing: -0.1,
        transition: "transform .12s, box-shadow .18s, background .18s",
        boxShadow: variant === "primary" || variant === "green" || variant === "orange"
          ? "0 1px 0 rgba(255,255,255,.12) inset, 0 1px 2px rgba(60,50,30,.12)" : "none",
        width: full ? "100%" : "auto",
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...extra,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(1px)"; }}
      onMouseUp={(e) => e.currentTarget.style.transform = "translateY(0)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
        {icon && <Icon name={icon} size={s.fs + 2}/>}
        {children}
        {iconRight && <Icon name={iconRight} size={s.fs + 2}/>}
      </button>
    );
  };

  // ─── Card ─────────────────────────────────────────────────────────────────
  const Card = ({ children, style, pad = 18, tone = "paper", className = "", hover = false, ...rest }) => {
    const bgs = {
      paper:      "var(--paper)",
      paperWarm:  "var(--paper-warm)",
      tint:       "var(--bg-tint)",
      green:      "var(--green-tint)",
      orange:     "var(--orange-tint)",
      ink:        "var(--ink)",
    };
    return (
      <div className={`${hover ? "lift" : ""} ${className}`}
           style={{
             background: bgs[tone] || tone,
             border: "1px solid var(--line)",
             borderRadius: 18,
             padding: pad,
             boxShadow: "var(--sh-1)",
             ...style,
           }} {...rest}>
        {children}
      </div>
    );
  };

  // ─── Section header (used in card tops) ──────────────────────────────────
  const SectionHead = ({ eyebrow, title, action, link }) => (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
                  marginBottom: 14 }}>
      <div>
        {eyebrow && <div style={{ fontSize: 10.5, letterSpacing: 0.8, textTransform: "uppercase",
                                  color: "var(--ink-muted)", fontWeight: 700, marginBottom: 4 }}>{eyebrow}</div>}
        <h3 className="serif" style={{ margin: 0, fontSize: 20, color: "var(--ink)" }}>{title}</h3>
      </div>
      {action || (link && (
        <button onClick={link.onClick} style={{
          border: "none", background: "transparent", color: "var(--ink-muted)",
          fontSize: 12.5, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4,
        }}>{link.label}<Icon name="chevronRight" size={14}/></button>
      ))}
    </div>
  );

  // ─── Progress (linear) ────────────────────────────────────────────────────
  const Progress = ({ value, max = 100, tone = "green", height = 6, showLabel }) => {
    const pct = Math.min(100, (value / max) * 100);
    const colors = { green: "var(--green)", orange: "var(--orange)", tomato: "var(--tomato)", amber: "var(--amber)" };
    return (
      <div style={{ width: "100%" }}>
        <div style={{ height, background: "var(--line-soft)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: colors[tone] || tone,
                        borderRadius: 999, transition: "width 600ms cubic-bezier(.2,.8,.2,1)" }}/>
        </div>
        {showLabel && (
          <div className="tnum" style={{ display: "flex", justifyContent: "space-between",
                                          marginTop: 6, fontSize: 11.5, color: "var(--ink-muted)" }}>
            <span>{value}</span><span>{max}</span>
          </div>
        )}
      </div>
    );
  };

  // ─── Ring / circle progress ───────────────────────────────────────────────
  const Ring = ({ value, max = 100, size = 80, stroke = 8, color = "var(--green)", trackColor, children }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.min(1, value / max);
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} className="ring-track"
                  stroke={trackColor || "var(--line)"} strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} className="ring-fill"
                  stroke={color} strokeWidth={stroke}
                  strokeDasharray={c} strokeDashoffset={c * (1 - pct)}/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center",
                       textAlign: "center" }}>
          {children}
        </div>
      </div>
    );
  };

  // ─── Avatar ───────────────────────────────────────────────────────────────
  const Avatar = ({ initials, color = "var(--green)", size = 28, ring }) => (
    <div style={{
      width: size, height: size, borderRadius: 999, background: color,
      color: "#FDFAF3", display: "grid", placeItems: "center",
      fontSize: size * 0.4, fontWeight: 700, letterSpacing: 0.3,
      boxShadow: ring ? `0 0 0 2px var(--paper), 0 0 0 3px ${color}` : "none",
      flex: "0 0 auto",
    }}>{initials}</div>
  );

  const AvatarStack = ({ people, size = 24, max = 4 }) => (
    <div style={{ display: "flex" }}>
      {people.slice(0, max).map((p, i) => (
        <div key={p.id || i} style={{ marginLeft: i === 0 ? 0 : -8,
              border: "2px solid var(--paper)", borderRadius: 999 }}>
          <Avatar initials={p.initials} color={p.color} size={size}/>
        </div>
      ))}
      {people.length > max && (
        <div style={{ marginLeft: -8, border: "2px solid var(--paper)", borderRadius: 999,
                       width: size, height: size, background: "var(--bg-tint)",
                       color: "var(--ink-muted)", fontSize: size * 0.36, fontWeight: 700,
                       display: "grid", placeItems: "center" }}>
          +{people.length - max}
        </div>
      )}
    </div>
  );

  // ─── Ingredient tile ─────────────────────────────────────────────────────
  // Big presentation: tone gradient bg + Illo + name + qty + expiry pill
  const IngredientTile = ({ item, onClick, compact }) => {
    const toneMap = {
      today:    "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
      tomorrow: "linear-gradient(160deg, #F5D9D2 0%, #F2C6BC 100%)",
      week:     "linear-gradient(160deg, #F4E6C8 0%, #EFD7A4 100%)",
      fresh:    "linear-gradient(160deg, #E5EBD5 0%, #D2DFB6 100%)",
      frozen:   "linear-gradient(160deg, #D9E4EC 0%, #BFD1DE 100%)",
      expired:  "linear-gradient(160deg, #E0D9C8 0%, #C8BFA6 100%)",
    };
    return (
      <button onClick={onClick} className="lift" style={{
        display: "flex", flexDirection: "column", alignItems: "stretch",
        background: "var(--paper)", border: "1px solid var(--line)",
        borderRadius: 16, padding: 0, overflow: "hidden", textAlign: "left",
        cursor: "pointer", width: "100%",
      }}>
        <div style={{
          height: compact ? 64 : 88, background: toneMap[item.status],
          display: "grid", placeItems: "center", position: "relative",
        }}>
          <Illo name={item.illo} size={compact ? 44 : 60}/>
          <div style={{ position: "absolute", top: 8, right: 8 }}>
            <ExpiryBadge status={item.status} expires={item.expires} size="sm"/>
          </div>
        </div>
        <div style={{ padding: compact ? "10px 12px" : "12px 14px" }}>
          <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: "var(--ink)",
                         lineHeight: 1.2, marginBottom: 3 }}>{item.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--ink-muted)", display: "flex",
                         justifyContent: "space-between", alignItems: "center" }}>
            <span className="tnum">{item.qty}</span>
            <span>· {item.loc}</span>
          </div>
        </div>
      </button>
    );
  };

  // ─── Mini sparkline / bars ───────────────────────────────────────────────
  const Bars = ({ values, max, height = 32, color = "var(--green)", gap = 3, highlightIdx }) => {
    const m = max || Math.max(...values);
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap, height }}>
        {values.map((v, i) => (
          <div key={i} style={{
            flex: 1, height: `${(v / m) * 100}%`,
            background: highlightIdx === i ? color : "var(--line-strong)",
            borderRadius: 3, opacity: highlightIdx === i ? 1 : 0.7,
            transition: "all 240ms ease",
          }}/>
        ))}
      </div>
    );
  };

  // ─── Drawer ──────────────────────────────────────────────────────────────
  const Drawer = ({ open, onClose, children, width = 480 }) => {
    useEffect(() => {
      if (!open) return;
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open]);
    if (!open) return null;
    return (
      <>
        <div className="pp-overlay" onClick={onClose}/>
        <div className="pp-drawer" style={{ width }}>{children}</div>
      </>
    );
  };

  const Modal = ({ open, onClose, children, width = 560 }) => {
    useEffect(() => {
      if (!open) return;
      const onKey = (e) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open]);
    if (!open) return null;
    return (
      <>
        <div className="pp-overlay" onClick={onClose}/>
        <div className="pp-modal" style={{ width, maxWidth: "92vw" }}>{children}</div>
      </>
    );
  };

  // ─── Toast host ──────────────────────────────────────────────────────────
  // window.PPUI.useToast() → [toast, push]; render <ToastHost toast={...}/>
  const useToast = () => {
    const [toast, setToast] = useState(null);
    const tref = useRef();
    const push = (msg, opts = {}) => {
      clearTimeout(tref.current);
      setToast({ msg, icon: opts.icon || "check", tone: opts.tone || "green" });
      tref.current = setTimeout(() => setToast(null), opts.duration || 2600);
    };
    return [toast, push];
  };
  const ToastHost = ({ toast }) => {
    if (!toast) return null;
    return (
      <div className="pp-toast">
        <span style={{
          display: "inline-grid", placeItems: "center", width: 22, height: 22,
          borderRadius: 999,
          background: toast.tone === "green" ? "var(--green)" :
                       toast.tone === "tomato" ? "var(--tomato)" : "var(--orange)",
        }}>
          <Icon name={toast.icon} size={14} stroke="#FDFAF3"/>
        </span>
        <span>{toast.msg}</span>
      </div>
    );
  };

  // ─── Tab strip ───────────────────────────────────────────────────────────
  const Tabs = ({ tabs, value, onChange, dense }) => (
    <div style={{ display: "inline-flex", gap: 4, background: "var(--bg-tint)",
                    padding: 4, borderRadius: 12, border: "1px solid var(--line)" }}>
      {tabs.map(t => (
        <button key={t.value || t} onClick={() => onChange(t.value || t)} style={{
          padding: dense ? "5px 10px" : "7px 14px",
          fontSize: dense ? 12 : 12.5, fontWeight: 600,
          background: value === (t.value || t) ? "var(--paper)" : "transparent",
          color: value === (t.value || t) ? "var(--ink)" : "var(--ink-muted)",
          border: "none", borderRadius: 8,
          boxShadow: value === (t.value || t) ? "var(--sh-1)" : "none",
          transition: "all 160ms ease",
        }}>
          {t.label || t}
          {t.count != null && (
            <span style={{ marginLeft: 6, color: "var(--ink-soft)", fontWeight: 600 }}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );

  // ─── Chip (filter chip) ──────────────────────────────────────────────────
  const Chip = ({ active, onClick, children, icon, count }) => (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 12px", height: 30,
      background: active ? "var(--ink)" : "var(--paper)",
      color: active ? "var(--paper-warm)" : "var(--ink-2)",
      border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
      borderRadius: 999, fontSize: 12.5, fontWeight: 600,
      whiteSpace: "nowrap",
      transition: "all 160ms ease",
    }}>
      {icon && <Icon name={icon} size={13}/>}
      {children}
      {count != null && (
        <span style={{ opacity: 0.6, fontWeight: 500 }}>· {count}</span>
      )}
    </button>
  );

  // ─── Stat ────────────────────────────────────────────────────────────────
  const Stat = ({ label, value, sub, tone, icon, big }) => (
    <div>
      {icon && <div style={{ color: tone || "var(--ink-muted)", marginBottom: 6 }}>
        <Icon name={icon} size={16}/>
      </div>}
      <div className="tnum serif" style={{ fontSize: big ? 36 : 28, color: "var(--ink)", lineHeight: 1.05 }}>
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 12.5, color: "var(--ink-muted)" }}>{label}</div>
      {sub && <div style={{ marginTop: 2, fontSize: 11.5, color: tone || "var(--ink-soft)" }}>{sub}</div>}
    </div>
  );

  // ─── Activity row ────────────────────────────────────────────────────────
  const ActivityRow = ({ act }) => {
    const iconBg = {
      alert: "var(--tomato-soft)", chef: "var(--orange-tint)", cart: "var(--green-soft)",
      bag: "var(--bg-tint)", scan: "var(--sky-soft)", save: "var(--amber-soft)", plus: "var(--green-tint)",
    }[act.icon] || "var(--line-soft)";
    const iconFg = {
      alert: "var(--tomato)", chef: "var(--orange)", cart: "var(--green)",
      bag: "var(--ink-muted)", scan: "var(--sky)", save: "var(--amber)", plus: "var(--green)",
    }[act.icon] || "var(--ink-muted)";
    return (
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 0",
                     borderBottom: "1px solid var(--line-soft)" }}>
        <div style={{ width: 28, height: 28, borderRadius: 999, background: iconBg, color: iconFg,
                       display: "grid", placeItems: "center", flex: "0 0 auto" }}>
          <Icon name={act.icon} size={14}/>
        </div>
        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
          <span style={{ color: "var(--ink-2)" }}>
            <strong style={{ fontWeight: 600 }}>{act.who}</strong> {act.action}
          </span>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2 }}>{act.when}</div>
        </div>
      </div>
    );
  };

  window.PPUI = {
    Pill, ExpiryBadge, Button, Card, SectionHead, Progress, Ring,
    Avatar, AvatarStack, IngredientTile, Bars,
    Drawer, Modal, useToast, ToastHost,
    Tabs, Chip, Stat, ActivityRow,
  };
})();
