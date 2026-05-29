// app.jsx — Root PantryPilot app

(function () {
  const { useState, useEffect } = React;
  const { Sidebar, TopBar, NAV } = window.PPShell;
  const { Landing } = window.PPLanding;
  const { Dashboard } = window.PPDashboard;
  const { Pantry } = window.PPPantry;
  const { Cook, CookNow } = window.PPRecipes;
  const { Planner } = window.PPPlanner;
  const { Grocery } = window.PPGrocery;
  const { Household, Imports, Settings, Insights } = window.PPExtras;
  const { Health } = window.PPHealth || {};
  const { ItemDrawer, RecipeDrawer, AskPilot, AddItemModal, KitchenInbox } = window.PPOverlays;
  const { ScanReceipt } = window.PPScanReceipt || {};
  const { ScanBarcode } = window.PPScanBarcode || {};
  const { ScanFridge } = window.PPScanFridge || {};
  const { Onboarding } = window.PPOnboarding || {};
  const { Checkout } = window.PPCheckout || {};
  const { useToast, ToastHost } = window.PPUI;
  const { TweaksPanel, useTweaks, TweakSection, TweakToggle, TweakRadio, TweakSelect, TweakColor, TweakButton } = window;

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "dark": false,
    "density": "balanced",
    "visualStyle": "warm",
    "userType": "student",
    "budgetMode": "student",
    "diet": "any",
    "expiryUrgency": "normal",
    "foodVisuals": "icons",
    "sidebarCollapsed": false
  }/*EDITMODE-END*/;

  const SCREEN_META = {
    landing:   { title: "Welcome",                  subtitle: "PantryPilot · 2026" },
    dashboard: { title: "Today",                    subtitle: "Wednesday · November 25" },
    pantry:    { title: "Pantry",                   subtitle: "Inventory · expiry · auto-restock" },
    cook:      { title: "Cook",                     subtitle: "Discover · craving · unlocks · notebook" },
    plan:      { title: "Plan",                     subtitle: "Weekly · budget basket · occasions" },
    shop:      { title: "Shop",                     subtitle: "Smart grocery list" },
    health:    { title: "Health",                   subtitle: "Calories · macros · balanced plate" },
    insights:  { title: "Insights",                 subtitle: "Budget · waste · nutrition · memory" },
    household: { title: "Apartment 4B",             subtitle: "Three roommates · one shared kitchen" },
    settings:  { title: "Settings",                 subtitle: "Your kitchen profile" },
    imports:   { title: "Quick imports",            subtitle: "Receipts · barcodes · photos" },
  };

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const [screen, setScreen] = useState("landing");
    const [collapsed, setCollapsed] = useState(false);
    const [search, setSearch] = useState("");
    const [itemId, setItemId] = useState(null);
    const [recipeId, setRecipeId] = useState(null);
    const [askOpen, setAskOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [inboxOpen, setInboxOpen] = useState(false);
    const [cookId, setCookId] = useState(null);
    const [capture, setCapture] = useState(null); // 'receipt' | 'barcode' | 'fridge'
    const [onboard, setOnboard] = useState(false);
    const [checkout, setCheckout] = useState(false);
    const [toast, pushToast] = useToast();

    // Expose toast + actions globally so deep components can call without prop drilling
    useEffect(() => {
      window.PPToast = pushToast;
      window.PPNav = nav;
      window.PPAskPilot = () => setAskOpen(true);
      window.PPAddItem = () => setAddOpen(true);
      window.PPInbox = () => setInboxOpen(true);
      window.PPOpenRecipe = (rid) => setRecipeId(rid);
      window.PPCookNow = (rid) => setCookId(rid);
      window.PPCapture = (kind) => setCapture(kind);
      window.PPOnboard = () => setOnboard(true);
      window.PPCheckoutOpen = () => setCheckout(true);
    }, [pushToast]);

    // Apply theme to root
    useEffect(() => {
      document.documentElement.setAttribute("data-theme", t.dark ? "dark" : "light");
    }, [t.dark]);

    // Keyboard ⌘K to open Pilot
    useEffect(() => {
      const onKey = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
          e.preventDefault();
          setAskOpen(o => !o);
        }
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    const nav = (id) => { setScreen(id); setSearch(""); };
    const cookNow = (rid) => setCookId(rid);

    if (screen === "landing") {
      return (
        <>
          <Landing onEnter={(s) => nav(s || "dashboard")} onOnboard={() => setOnboard(true)}/>
          {onboard && Onboarding &&
            <Onboarding onFinish={() => { setOnboard(false); nav("dashboard"); }}/>}
          <Tweaks t={t} setTweak={setTweak}/>
          <ToastHost toast={toast}/>
        </>
      );
    }

    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar active={screen} onNav={nav} collapsed={collapsed} onCollapse={setCollapsed}/>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TopBar {...SCREEN_META[screen]}
                   onAskPilot={() => setAskOpen(true)}
                   onAddItem={() => setAddOpen(true)}
                   onInbox={() => setInboxOpen(true)}
                   onTheme={() => setTweak("dark", !t.dark)}
                   onSettings={() => nav("settings")}
                   dark={t.dark}
                   search={search} setSearch={setSearch}/>
          <main style={{ flex: 1 }}>
            {screen === "dashboard" &&
              <Dashboard onNav={nav}
                          onOpenItem={setItemId}
                          onOpenRecipe={setRecipeId}
                          onAskPilot={() => setAskOpen(true)}
                          onCookNow={cookNow}/>
            }
            {screen === "pantry"    && <Pantry onOpenItem={setItemId} onAddItem={() => setAddOpen(true)} search={search}/>}
            {screen === "cook"      && <Cook onOpenRecipe={setRecipeId} onCookNow={cookNow} search={search}/>}
            {screen === "plan"      && <Planner onOpenRecipe={setRecipeId} onNav={nav} onPushToast={pushToast}/>}
            {screen === "shop"      && <Grocery onNav={nav} onPushToast={pushToast}
                                                  onOpenRecipe={setRecipeId} onCookNow={cookNow}/>}
            {screen === "insights"  && <Insights/>}
            {screen === "health"    && Health && <Health onCookNow={cookNow}/>}
            {screen === "household" && <Household/>}
            {screen === "settings"  && <Settings/>}
            {screen === "imports"   && <Imports onPushToast={pushToast}/>}
          </main>
        </div>

        {/* Floating sidebar expand handle when collapsed */}
        {collapsed && (
          <button onClick={() => setCollapsed(false)} style={{
            position: "fixed", left: 64, top: 22, width: 24, height: 28,
            background: "var(--paper)", border: "1px solid var(--line)",
            borderRadius: "0 8px 8px 0", color: "var(--ink-muted)",
            display: "grid", placeItems: "center", cursor: "pointer", zIndex: 50,
          }}>
            <span>›</span>
          </button>
        )}

        <ItemDrawer itemId={itemId} onClose={() => setItemId(null)} onPushToast={pushToast}/>
        <RecipeDrawer recipeId={recipeId} onClose={() => setRecipeId(null)}
                       onCook={(rid) => { setRecipeId(null); cookNow(rid); }}
                       onPushToast={pushToast}/>
        <AskPilot open={askOpen} onClose={() => setAskOpen(false)}/>
        <AddItemModal open={addOpen} onClose={() => setAddOpen(false)} onPushToast={pushToast}/>
        <KitchenInbox open={inboxOpen} onClose={() => setInboxOpen(false)}/>
        {cookId && <CookNow recipeId={cookId} onExit={() => { setCookId(null); pushToast("Nicely done. Inventory updated."); }}/>}

        {capture === "receipt" && ScanReceipt &&
          <ScanReceipt onClose={() => setCapture(null)} onPushToast={pushToast} onNav={nav}/>}
        {capture === "barcode" && ScanBarcode &&
          <ScanBarcode onClose={() => setCapture(null)} onPushToast={pushToast} onNav={nav}/>}
        {capture === "fridge" && ScanFridge &&
          <ScanFridge onClose={() => setCapture(null)} onPushToast={pushToast} onNav={nav}/>}

        {onboard && Onboarding &&
          <Onboarding onFinish={() => { setOnboard(false); nav("dashboard"); }}/>}
        {checkout && Checkout &&
          <Checkout onClose={() => setCheckout(false)} onPushToast={pushToast} onNav={nav}/>}

        <ToastHost toast={toast}/>
        <Tweaks t={t} setTweak={setTweak}/>
      </div>
    );
  }

  function Tweaks({ t, setTweak }) {
    return (
      <TweaksPanel>
        <TweakSection label="Look & feel"/>
        <TweakToggle label="Dark mode" value={t.dark} onChange={(v) => setTweak("dark", v)}/>
        <TweakRadio label="Density" value={t.density}
                     options={["calm", "balanced", "detailed"]}
                     onChange={(v) => setTweak("density", v)}/>
        <TweakRadio label="Visual style" value={t.visualStyle}
                     options={["minimal", "warm", "premium"]}
                     onChange={(v) => setTweak("visualStyle", v)}/>
        <TweakRadio label="Food visuals" value={t.foodVisuals}
                     options={["icons", "photo", "mixed"]}
                     onChange={(v) => setTweak("foodVisuals", v)}/>

        <TweakSection label="Persona & data"/>
        <TweakSelect label="User type" value={t.userType}
                     options={["student", "professional", "family", "roommates"]}
                     onChange={(v) => setTweak("userType", v)}/>
        <TweakSelect label="Diet preference" value={t.diet}
                     options={["any", "vegetarian", "vegan", "high-protein", "budget"]}
                     onChange={(v) => setTweak("diet", v)}/>
        <TweakRadio label="Budget mode" value={t.budgetMode}
                     options={["off", "student", "family"]}
                     onChange={(v) => setTweak("budgetMode", v)}/>
        <TweakRadio label="Expiry urgency" value={t.expiryUrgency}
                     options={["normal", "high-risk"]}
                     onChange={(v) => setTweak("expiryUrgency", v)}/>
      </TweaksPanel>
    );
  }

  // Mount
  const root = ReactDOM.createRoot(document.getElementById("app"));
  root.render(<App/>);
})();
