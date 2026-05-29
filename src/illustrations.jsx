// illustrations.jsx — line-art ingredient illustrations, warm-toned, single fill
// Each takes { size = 40 } and renders an SVG. Style: 1.4–1.6 stroke,
// rounded joins, slightly hand-drawn warmth. Exposed as window.PPIllo.

(function () {
  const S = ({ size = 40, children, vb = 32 }) => (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`}
         fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );

  // Color helpers (tints we use across icons)
  const C = {
    green:  "#5C8B4E",
    leaf:   "#3B6E3D",
    orange: "#D9722B",
    tomato: "#C73E2E",
    yolk:   "#E8A53D",
    cream:  "#F5E6CB",
    milk:   "#F8F2DF",
    brown:  "#7A4A2A",
    husk:   "#C99325",
    ink:    "#3D372E",
    plum:   "#6E3A4F",
    sky:    "#7AA2C0",
  };

  const ILL = {
    // Greens
    spinach: () => (
      <S>
        <path d="M16 5c-4 2-7 6-7 11 0 4 2 7 5 9l2-2c2-2 4-5 4-9 0-4-1-7-4-9z" fill="#D8E5BD" stroke={C.leaf}/>
        <path d="M16 7v18M12 11c2 1 3 2 4 3M12 16c2 1 3 2 4 3M12 21c1 1 2 1 3 2M20 11c-1 1-2 2-3 3M20 16c-1 1-2 2-3 3" stroke={C.leaf}/>
        <path d="M14 25c-1 0-3 1-3 2M18 25c1 0 3 1 3 2" stroke={C.leaf}/>
      </S>
    ),
    egg: () => (
      <S>
        <ellipse cx="16" cy="18" rx="8" ry="10" fill="#FBF0D8" stroke={C.brown}/>
        <circle cx="14" cy="16" r="1.4" fill={C.brown}/>
      </S>
    ),
    milk: () => (
      <S>
        <path d="M11 9V6h10v3l1 4v13a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V13l1-4z"
              fill="#F8F2DF" stroke={C.ink}/>
        <path d="M11 13h10" stroke={C.ink}/>
        <rect x="13" y="18" width="6" height="5" rx="0.5" stroke={C.sky} fill="#E8F1F5"/>
      </S>
    ),
    yogurt: () => (
      <S>
        <path d="M9 12h14l-1 13a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2L9 12z" fill="#FBF7EA" stroke={C.ink}/>
        <rect x="9" y="9" width="14" height="4" rx="1" fill={C.plum} stroke={C.plum}/>
        <path d="M13 16c2-1 4-1 6 0" stroke={C.plum}/>
      </S>
    ),
    rice: () => (
      <S>
        <path d="M5 19c3-4 8-6 11-6s8 2 11 6" stroke={C.ink}/>
        <path d="M5 19h22l-2 7a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 19z" fill="#FBF7EA" stroke={C.ink}/>
        <ellipse cx="11" cy="17" rx="1.1" ry="0.6" fill={C.cream} stroke="none"/>
        <ellipse cx="14" cy="15.5" rx="1.1" ry="0.6" fill={C.cream} stroke="none"/>
        <ellipse cx="17" cy="14.5" rx="1.1" ry="0.6" fill={C.cream} stroke="none"/>
        <ellipse cx="20" cy="15.5" rx="1.1" ry="0.6" fill={C.cream} stroke="none"/>
        <ellipse cx="22" cy="17" rx="1.1" ry="0.6" fill={C.cream} stroke="none"/>
      </S>
    ),
    pepper: () => (
      <S>
        <path d="M14 6c0 1 0 3-1 4l-1 1c-2 2-3 4-3 7 0 4 3 8 7 8s7-4 7-8c0-3-1-5-3-7-1-1-2-3-2-4" fill="#F0C9A3" stroke={C.orange}/>
        <path d="M14 6c-1 0-2 1-2 2M18 6c1 0 2 1 2 2" stroke={C.leaf}/>
        <path d="M16 5v6" stroke={C.leaf}/>
      </S>
    ),
    onion: () => (
      <S>
        <path d="M16 9c-5 0-8 4-8 9s3 8 8 8 8-3 8-8-3-9-8-9z" fill="#F4E3B8" stroke={C.husk}/>
        <path d="M16 9c-2 3-2 7-2 9s0 6 2 8M16 9c2 3 2 7 2 9s0 6-2 8" stroke={C.husk}/>
        <path d="M16 9V5M14 7l2 2 2-2" stroke={C.leaf}/>
      </S>
    ),
    garlic: () => (
      <S>
        <path d="M16 7c-3 1-6 4-6 9s3 9 6 9 6-4 6-9-3-8-6-9z" fill="#F8F2DF" stroke={C.ink}/>
        <path d="M16 7c-1 3-1 7-1 9s0 6 1 8M16 7c1 3 1 7 1 9s0 6-1 8" stroke={C.ink}/>
        <path d="M16 7V4" stroke={C.leaf}/>
      </S>
    ),
    tomato: () => (
      <S>
        <circle cx="16" cy="18" r="9" fill="#E89479" stroke={C.tomato}/>
        <path d="M11 10c1-1 2-2 3-2M21 10c-1-1-2-2-3-2M16 8v3" stroke={C.leaf}/>
        <path d="M12 8c1 2 3 3 4 3M20 8c-1 2-3 3-4 3" stroke={C.leaf}/>
        <path d="M13 17c1-1 2-2 3-2" stroke="#FBC9B6"/>
      </S>
    ),
    carrot: () => (
      <S>
        <path d="M11 11l8 14c1 2 2 2 3 1l2-2c1-1 1-2 0-3L11 11z" fill="#F0B07C" stroke={C.orange}/>
        <path d="M14 14l1 1M16 16l1 1M18 19l1 1M20 22l1 1" stroke={C.orange}/>
        <path d="M11 11c-1-2 0-5 1-6M11 11c-3-1-5 0-6 2M11 11c0-3 2-5 4-5" stroke={C.leaf}/>
      </S>
    ),
    ricebag: () => (
      <S>
        <path d="M9 11l1-3h12l1 3v15a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V11z" fill="#FBF7EA" stroke={C.ink}/>
        <path d="M9 11h14" stroke={C.ink}/>
        <rect x="12" y="15" width="8" height="6" rx="1" fill="#F1E2BA" stroke={C.husk}/>
        <text x="16" y="20" fontFamily="sans-serif" fontSize="3.5" fontWeight="600"
              fill={C.husk} stroke="none" textAnchor="middle">RICE</text>
      </S>
    ),
    pasta: () => (
      <S>
        <rect x="7" y="6" width="18" height="22" rx="2" fill="#FBF0D8" stroke={C.husk}/>
        <path d="M11 10v14M13 10v14M15 10v14M17 10v14M19 10v14M21 10v14" stroke={C.husk}/>
        <path d="M7 10h18" stroke={C.ink}/>
      </S>
    ),
    bread: () => (
      <S>
        <path d="M6 14c0-4 3-6 6-6h8c3 0 6 2 6 6 0 2-1 3-2 3v8a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-8c-1 0-2-1-2-3z"
              fill="#E8B97A" stroke={C.brown}/>
        <path d="M12 11c0 1 0 3 1 3M16 10c0 1 0 4 1 4M20 11c0 1 0 3 1 3" stroke={C.brown}/>
      </S>
    ),
    chicken: () => (
      <S>
        <path d="M9 17c-2-2-2-5 0-7 3-3 8-3 11 0l4 4c2 2 2 5 0 7l-3 3c-2 2-5 2-7 0l-5-7z"
              fill="#F2CDA8" stroke={C.brown}/>
        <path d="M14 14l4 4" stroke={C.brown}/>
        <circle cx="12" cy="13" r="0.8" fill={C.brown} stroke="none"/>
      </S>
    ),
    tofu: () => (
      <S>
        <path d="M7 11l9-4 9 4v10l-9 4-9-4z" fill="#FBF7EA" stroke={C.ink}/>
        <path d="M7 11l9 4 9-4M16 15v10" stroke={C.ink}/>
      </S>
    ),
    frozenveg: () => (
      <S>
        <rect x="6" y="8" width="20" height="18" rx="2" fill="#E8F1F5" stroke={C.sky}/>
        <circle cx="11" cy="14" r="2" fill="#A8C68A" stroke={C.leaf}/>
        <circle cx="17" cy="13" r="2" fill="#D9722B" stroke={C.orange}/>
        <circle cx="22" cy="16" r="2" fill="#C99325" stroke={C.husk}/>
        <circle cx="13" cy="20" r="2" fill="#A8C68A" stroke={C.leaf}/>
        <circle cx="19" cy="21" r="2" fill="#D9722B" stroke={C.orange}/>
        <path d="M6 12h20" stroke={C.sky}/>
      </S>
    ),
    berries: () => (
      <S>
        <circle cx="12" cy="18" r="5" fill="#6E3A4F" stroke="#4E2538"/>
        <circle cx="20" cy="20" r="5" fill="#C73E2E" stroke="#8E2A1F"/>
        <circle cx="16" cy="12" r="4" fill="#3B6E3D" stroke="#234524"/>
        <path d="M16 8v-2M14 9l-1-1M18 9l1-1" stroke={C.leaf}/>
      </S>
    ),
    beans: () => (
      <S>
        <rect x="9" y="7" width="14" height="20" rx="1.5" fill="#F4E3B8" stroke={C.brown}/>
        <rect x="9" y="11" width="14" height="9" fill="#FFF" stroke={C.brown}/>
        <text x="16" y="18" fontFamily="sans-serif" fontSize="4.5" fontWeight="700"
              fill={C.brown} stroke="none" textAnchor="middle">BEAN</text>
        <path d="M11 23h10" stroke={C.brown}/>
      </S>
    ),
    oil: () => (
      <S>
        <path d="M13 6h6v3l2 2v15a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V11l2-2V6z"
              fill="#F0DC8A" stroke={C.husk}/>
        <rect x="13" y="14" width="6" height="9" rx="0.5" fill="#FFF" stroke={C.husk}/>
        <path d="M14 17h4M14 19h4" stroke={C.husk}/>
      </S>
    ),
    soy: () => (
      <S>
        <path d="M11 8h10v3l1 2v13a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V13l1-2V8z"
              fill="#3D372E" stroke="#0F0A05"/>
        <rect x="13" y="15" width="6" height="6" fill="#FBF0D8" stroke="#0F0A05"/>
      </S>
    ),
    chili: () => (
      <S>
        <rect x="10" y="9" width="12" height="19" rx="2" fill="#C73E2E" stroke="#8E2A1F"/>
        <rect x="10" y="9" width="12" height="4" fill="#3D372E" stroke="#0F0A05"/>
        <path d="M14 17h4M14 20h4M14 23h2" stroke="#FBF0D8"/>
      </S>
    ),
    peanutbutter: () => (
      <S>
        <rect x="9" y="7" width="14" height="21" rx="1.5" fill="#C99325" stroke="#7A4A2A"/>
        <rect x="9" y="11" width="14" height="9" fill="#FBF0D8" stroke="#7A4A2A"/>
        <text x="16" y="18" fontFamily="sans-serif" fontSize="3.5" fontWeight="700"
              fill="#7A4A2A" stroke="none" textAnchor="middle">PB</text>
      </S>
    ),
    oats: () => (
      <S>
        <path d="M8 11h16l-1 14a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2L8 11z" fill="#F4E3B8" stroke={C.husk}/>
        <ellipse cx="16" cy="8" rx="8" ry="3" fill="#FBF0D8" stroke={C.husk}/>
        <ellipse cx="13" cy="18" rx="0.8" ry="1.4" fill={C.husk} stroke="none"/>
        <ellipse cx="16" cy="20" rx="0.8" ry="1.4" fill={C.husk} stroke="none"/>
        <ellipse cx="19" cy="18" rx="0.8" ry="1.4" fill={C.husk} stroke="none"/>
        <ellipse cx="15" cy="23" rx="0.8" ry="1.4" fill={C.husk} stroke="none"/>
        <ellipse cx="18" cy="23" rx="0.8" ry="1.4" fill={C.husk} stroke="none"/>
      </S>
    ),
    banana: () => (
      <S>
        <path d="M7 10c0 8 6 14 14 16 1 0 2-1 2-2-7-2-12-7-14-14 0-1-1-1-2 0z"
              fill="#F0DC8A" stroke={C.husk}/>
        <path d="M21 26c1 0 1-1 1-1M7 10c1-1 1-1 2-1" stroke={C.husk}/>
      </S>
    ),
    apple: () => (
      <S>
        <path d="M16 11c-3-2-7-1-8 2-1 4 1 9 4 12 2 1 3 1 4 0 1 1 2 1 4 0 3-3 5-8 4-12-1-3-5-4-8-2z"
              fill="#C73E2E" stroke="#8E2A1F"/>
        <path d="M16 11V8c0-1 1-2 2-2" stroke={C.leaf}/>
        <path d="M18 6c1 0 2 1 2 1" stroke={C.leaf}/>
      </S>
    ),
    cheese: () => (
      <S>
        <path d="M6 14L20 7l6 5v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7z"
              fill="#F0C95A" stroke={C.husk}/>
        <circle cx="11" cy="17" r="1.2" fill="#FBF0D8" stroke="none"/>
        <circle cx="17" cy="15" r="1.2" fill="#FBF0D8" stroke="none"/>
        <circle cx="21" cy="19" r="1.2" fill="#FBF0D8" stroke="none"/>
        <circle cx="14" cy="20" r="1.2" fill="#FBF0D8" stroke="none"/>
      </S>
    ),
    coffee: () => (
      <S>
        <path d="M9 11h14l-1 14a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2L9 11z" fill="#7A4A2A" stroke="#3D2410"/>
        <rect x="9" y="11" width="14" height="3" fill="#3D2410" stroke="#3D2410"/>
        <text x="16" y="22" fontFamily="serif" fontSize="6" fontWeight="700"
              fill="#FBF0D8" stroke="none" textAnchor="middle">C</text>
      </S>
    ),
    salt: () => (
      <S>
        <path d="M11 8h10v3l1 2v13a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V13l1-2V8z"
              fill="#FBF7EA" stroke={C.ink}/>
        <circle cx="14" cy="10" r="0.6" fill={C.ink} stroke="none"/>
        <circle cx="16" cy="9.4" r="0.6" fill={C.ink} stroke="none"/>
        <circle cx="18" cy="10" r="0.6" fill={C.ink} stroke="none"/>
      </S>
    ),

    // ── Added for world-cuisine recipes ──
    lime: () => (
      <S>
        <circle cx="16" cy="17" r="9" fill="#A9C24B" stroke={C.leaf}/>
        <path d="M16 8.5v17M9 13.5l14 7M9 20.5l14-7" stroke="#EAF3C9" strokeWidth="1"/>
        <circle cx="16" cy="17" r="9" stroke={C.leaf}/>
      </S>
    ),
    ginger: () => (
      <S>
        <path d="M9 18c-2-3 0-7 3-7 1 0 2 1 3 0 2-2 5-1 6 1 1 2 0 4 2 5 2 1 2 4 0 5-2 1-4 0-6 1-2 1-4 1-6-1-2-1-1-3-2-5z"
              fill="#E6C79A" stroke={C.brown}/>
        <path d="M13 14c1 1 1 3 0 4M18 17c1 1 1 2 0 3" stroke={C.brown} strokeWidth="1"/>
      </S>
    ),
    lentils: () => (
      <S>
        <path d="M6 16h20c0 5-4 9-10 9S6 21 6 16z" fill="#F4E3B8" stroke={C.husk}/>
        <path d="M6 16c0-1 4-2 10-2s10 1 10 2" stroke={C.husk}/>
        <circle cx="12" cy="11" r="1.3" fill={C.yolk} stroke="none"/>
        <circle cx="16" cy="9.5" r="1.3" fill="#D98A2B" stroke="none"/>
        <circle cx="20" cy="11" r="1.3" fill={C.yolk} stroke="none"/>
        <circle cx="14" cy="12.5" r="1.1" fill="#D98A2B" stroke="none"/>
        <circle cx="18" cy="12.5" r="1.1" fill={C.yolk} stroke="none"/>
      </S>
    ),
    noodles: () => (
      <S>
        <path d="M6 16h20c0 5-4 9-10 9S6 21 6 16z" fill="#F5E6CB" stroke={C.husk}/>
        <path d="M9 15c2-3 4-7 3-9M14 14c1-4 1-7-1-8M18 14c2-3 4-6 3-8M22 15c1-2 3-4 2-6"
              stroke={C.yolk} strokeWidth="1.2"/>
        <path d="M20 8l5-3M20 8l5 1" stroke={C.ink} strokeWidth="1"/>
      </S>
    ),
    tortilla: () => (
      <S>
        <ellipse cx="16" cy="17" rx="11" ry="9" fill="#F1DCA8" stroke={C.husk}/>
        <ellipse cx="16" cy="17" rx="7" ry="5.5" stroke={C.husk} strokeWidth="1"/>
        <circle cx="12" cy="14" r="0.7" fill={C.brown} stroke="none"/>
        <circle cx="20" cy="20" r="0.7" fill={C.brown} stroke="none"/>
        <circle cx="20" cy="13" r="0.6" fill={C.brown} stroke="none"/>
      </S>
    ),
    paneer: () => (
      <S>
        <path d="M7 12l9-4 9 4v9l-9 4-9-4z" fill="#FCF8EE" stroke={C.husk}/>
        <path d="M16 8v17M7 12l9 4 9-4" stroke={C.husk} strokeWidth="1"/>
        <path d="M11.5 14v8.5M20.5 14v8.5" stroke={C.husk} strokeWidth="0.8"/>
      </S>
    ),
    cilantro: () => (
      <S>
        <path d="M16 27V14" stroke={C.leaf}/>
        <path d="M16 14c-2-3-6-3-7-1 2 3 5 3 7 1zM16 14c2-3 6-3 7-1-2 3-5 3-7 1zM16 18c-2-2-5-2-6 0 2 2 4 2 6 0zM16 18c2-2 5-2 6 0-2 2-4 2-6 0z"
              fill="#C7DD9A" stroke={C.green}/>
      </S>
    ),
    peanuts: () => (
      <S>
        <path d="M11 9c-3 1-4 4-2 6 1 1 1 2 0 3-2 2-1 5 2 6 3 1 6-1 6-4 0-1 0-2 1-2 3-1 4-4 2-6-1-1-1-2 0-3 1-3-2-6-5-5-2 1-2 1-4 .5z"
              fill="#E6C79A" stroke={C.brown}/>
        <path d="M10 13c2 1 4 1 6 0M11 21c2 1 4 1 6 0" stroke={C.brown} strokeWidth="1"/>
      </S>
    ),
    scallion: () => (
      <S>
        <path d="M12 28V13M16 28V11M20 28V13" stroke="#F1DCA8"/>
        <path d="M12 13c-1-4 0-7 0-9M16 11c0-4 0-7 1-9M20 13c1-4 1-6 2-8"
              stroke={C.green} strokeWidth="1.6"/>
        <path d="M10 25h12" stroke="#FCF8EE" strokeWidth="2.4"/>
      </S>
    ),
  };

  // Fallback placeholder
  const placeholder = () => (
    <S>
      <rect x="7" y="9" width="18" height="18" rx="3" fill="#F4EEDF" stroke="#9A917F" strokeDasharray="2 2"/>
      <circle cx="16" cy="18" r="3" fill="#DDD3BA" stroke="none"/>
    </S>
  );

  const Illo = ({ name, size = 40 }) => {
    const F = ILL[name] || placeholder;
    return <F size={size} />;
  };

  window.PPIllo = { Illo, ILL };
})();
