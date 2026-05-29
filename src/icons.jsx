// icons.jsx — Lucide-style UI icons, attached to window.PPIcon

(function () {
  const Svg = ({ size = 18, stroke = "currentColor", children }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );

  const I = {
    // Navigation
    home: <><path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></>,
    pantry: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chef: <><path d="M6 13a4 4 0 1 1 2-7.5 4 4 0 0 1 8 0A4 4 0 1 1 18 13v4H6z"/><path d="M6 17h12v3a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    cart: <><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 2-1.5L21 8H6"/></>,
    wallet: <><path d="M3 8a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><rect x="3" y="8" width="18" height="12" rx="2"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/></>,
    leaf: <><path d="M11 20A7 7 0 0 1 4 13c0-5 5-10 16-9 1 11-4 16-9 16z"/><path d="M4 21c3-5 7-9 13-11"/></>,
    heart: <><path d="M12 21s-7-4.5-9-9c-1.5-3 1-7 5-7 2 0 3 1 4 2 1-1 2-2 4-2 4 0 6.5 4 5 7-2 4.5-9 9-9 9z"/></>,
    house: <><path d="M3 21V11l9-7 9 7v10"/><path d="M9 21v-6h6v6"/></>,
    scan: <><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.4 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.4-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.4h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    // Action
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    sparkles: <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 16l.8 2.2 2.2.8-2.2.8L19 22l-.8-2.2-2.2-.8 2.2-.8z"/></>,
    chevronRight: <><path d="M9 6l6 6-6 6"/></>,
    chevronDown: <><path d="M6 9l6 6 6-6"/></>,
    chevronLeft: <><path d="M15 6l-6 6 6 6"/></>,
    chevronUp: <><path d="M6 15l6-6 6 6"/></>,
    arrowRight: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown: <><path d="M12 5v14M5 12l7 7 7-7"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-5"/></>,
    circle: <><circle cx="12" cy="12" r="9"/></>,
    dot: <><circle cx="12" cy="12" r="3" fill="currentColor"/></>,
    filter: <><path d="M3 5h18l-7 9v6l-4-2v-4z"/></>,
    sort: <><path d="M3 6h13M3 12h9M3 18h5"/><path d="M17 14v6M14 17l3 3 3-3"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="0.8" fill="currentColor"/><circle cx="4" cy="12" r="0.8" fill="currentColor"/><circle cx="4" cy="18" r="0.8" fill="currentColor"/></>,
    flame: <><path d="M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 1-5s-2-3-2-3 4 0 6-2z"/></>,
    flask: <><path d="M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3"/></>,
    bookmark: <><path d="M6 3h12v18l-6-4-6 4z"/></>,
    bookmarkFill: <><path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/></>,
    moon: <><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></>,
    save: <><path d="M5 3h11l3 3v15a0 0 0 0 1 0 0H5a0 0 0 0 1 0 0V3z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></>,
    upload: <><path d="M12 16V4M5 11l7-7 7 7"/><path d="M3 20h18"/></>,
    camera: <><path d="M4 8a2 2 0 0 1 2-2h2l1.5-2h5L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></>,
    bag: <><path d="M6 7h12l-1 13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/><path d="M9 7a3 3 0 1 1 6 0"/></>,
    edit: <><path d="M14 4l6 6L9 21H3v-6z"/></>,
    trash: <><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14"/></>,
    drag: <><circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></>,
    alert: <><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/></>,
    fire: <><path d="M12 2c0 4 5 5 5 11a5 5 0 0 1-10 0c0-1 1-3 2-4-1 4 3 4 3 4-2-3 0-7 0-11z"/></>,
    timer: <><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6M12 5V2"/></>,
    knife: <><path d="M3 20l16-16 2 2L5 22z"/><path d="M14 9l4 4"/></>,
    snowflake: <><path d="M12 3v18M5 7l14 10M5 17L19 7"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="7" r="2.5"/><path d="M16 14a5 5 0 0 1 6 5"/></>,
    receipt: <><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    barcode: <><path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14"/></>,
    fridge: <><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M6 10h12M9 6v1M9 13v3"/></>,
    truck: <><rect x="1" y="6" width="14" height="11" rx="1"/><path d="M15 8h4l2 3v6h-6"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    chart: <><path d="M3 3v18h18"/><path d="M7 14l3-3 3 2 5-6"/></>,
    pie: <><path d="M12 3v9h9a9 9 0 1 1-9-9z"/><path d="M14 3a7 7 0 0 1 7 7h-7z"/></>,
    apple: <><path d="M12 6c-3-3-9-1-9 5 0 7 4 11 7 11 1 0 1-1 2-1s1 1 2 1c3 0 7-4 7-11 0-6-6-8-9-5z"/><path d="M12 6V3"/></>,
    sliders: <><path d="M4 8h6M14 8h6M4 16h6M14 16h6"/><circle cx="12" cy="8" r="2"/><circle cx="12" cy="16" r="2"/></>,
  };

  const Icon = ({ name, size = 18, stroke = "currentColor" }) => {
    const child = I[name];
    if (!child) return null;
    return <Svg size={size} stroke={stroke}>{child}</Svg>;
  };

  window.PPIcon = { Icon, names: Object.keys(I) };
})();
