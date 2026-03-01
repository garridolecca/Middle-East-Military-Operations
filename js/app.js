/* ================================================
   Middle East Military Operations — App Entry
   ArcGIS Maps SDK for JavaScript 5.0
   ================================================ */
import {
  createCarrierLayer,
  createDestroyerLayer,
  createIranSitesLayer,
  createAttackLayer,
  createBasesLayer,
  createRoutesLayer,
  createRadiiLayer,
  createLabelLayers
} from "./layers.js";

// ─── Load ArcGIS modules via $arcgis.import() ───
async function init() {
  const [Map, MapView, Graphic, GraphicsLayer, Legend, BasemapToggle, ScaleBar] =
    await Promise.all([
      $arcgis.import("@arcgis/core/Map.js"),
      $arcgis.import("@arcgis/core/views/MapView.js"),
      $arcgis.import("@arcgis/core/Graphic.js"),
      $arcgis.import("@arcgis/core/layers/GraphicsLayer.js"),
      $arcgis.import("@arcgis/core/widgets/Legend.js"),
      $arcgis.import("@arcgis/core/widgets/BasemapToggle.js"),
      $arcgis.import("@arcgis/core/widgets/ScaleBar.js")
    ]);

  // ─── Build Feature Layers ───
  const radiiLayer = createRadiiLayer(Graphic, GraphicsLayer);
  const routesLayer = createRoutesLayer(Graphic, GraphicsLayer);
  const attackLayer = createAttackLayer(Graphic, GraphicsLayer);
  const basesLayer = createBasesLayer(Graphic, GraphicsLayer);
  const iranSitesLayer = createIranSitesLayer(Graphic, GraphicsLayer);
  const destroyerLayer = createDestroyerLayer(Graphic, GraphicsLayer);
  const carrierLayer = createCarrierLayer(Graphic, GraphicsLayer);

  // ─── Build Scale-Dependent Label Layers ───
  const labels = createLabelLayers(Graphic, GraphicsLayer);

  // ─── Map ───
  const map = new Map({
    basemap: "dark-gray-vector",
    layers: [
      radiiLayer,
      routesLayer,
      attackLayer,
      basesLayer,
      iranSitesLayer,
      destroyerLayer,
      carrierLayer,
      // Labels on top, ordered by zoom tier
      labels.detail,    // zoom 8+ (bottom of label stack)
      labels.regional,  // zoom 6+
      labels.overview   // always visible (top of label stack)
    ]
  });

  const homeCenter = [45, 30];
  const homeZoom = 4;

  // ─── View ───
  const view = new MapView({
    container: "viewDiv",
    map,
    center: homeCenter,
    zoom: homeZoom,
    constraints: { minZoom: 3, maxZoom: 12 },
    popup: {
      dockEnabled: true,
      dockOptions: { breakpoint: false, position: "bottom-right" }
    }
  });

  // ─── Widgets ───
  const legend = new Legend({
    view,
    container: document.getElementById("legend-container")
  });

  const basemapToggle = new BasemapToggle({
    view,
    nextBasemap: "satellite"
  });
  view.ui.add(basemapToggle, "bottom-right");

  const scaleBar = new ScaleBar({ view, unit: "metric" });
  view.ui.add(scaleBar, "bottom-left");

  // ─── Header Button Handlers ───
  document.getElementById("btn-home").addEventListener("click", () => {
    view.goTo({ center: homeCenter, zoom: homeZoom }, { duration: 1200 });
  });

  document.getElementById("btn-legend-toggle").addEventListener("click", () => {
    const panel = document.getElementById("panel-end");
    panel.collapsed = !panel.collapsed;
  });

  document.getElementById("btn-basemap").addEventListener("click", () => {
    basemapToggle.toggle();
  });

  // ─── Layer Toggle Switches ───
  const toggleMap = {
    "toggle-carriers": carrierLayer,
    "toggle-destroyers": destroyerLayer,
    "toggle-iran-sites": iranSitesLayer,
    "toggle-iran-attacks": attackLayer,
    "toggle-bases": basesLayer,
    "toggle-routes": routesLayer,
    "toggle-radii": radiiLayer
  };

  Object.entries(toggleMap).forEach(([id, layer]) => {
    document.getElementById(id).addEventListener("calciteSwitchChange", (e) => {
      layer.visible = e.target.checked;
    });
  });

  // ─── Opening animation ───
  view.when(() => {
    view.goTo(
      { center: [45, 30], zoom: 4 },
      { duration: 2000, easing: "ease-in-out" }
    );
  });

  // ─── Mobile: adjust popup dock position ───
  if (isMobile()) {
    view.popup.dockOptions = {
      breakpoint: false,
      position: "bottom-center"
    };
  }

  // ─── Initialize Mobile UI ───
  initMobile(view, basemapToggle, homeCenter, homeZoom);
}

// ═══════════════════════════════════════════════════════
// MOBILE — Native App UI Logic
// ═══════════════════════════════════════════════════════

function isMobile() {
  return window.matchMedia("(max-width: 768px)").matches;
}

function initMobile(view, basemapToggle, homeCenter, homeZoom) {
  if (!isMobile()) return;

  const nav = document.getElementById("mobile-nav");
  const backdrop = document.getElementById("mobile-backdrop");
  const fabGroup = document.getElementById("mobile-fab-group");
  const panelStart = document.getElementById("panel-start");
  const panelEnd = document.getElementById("panel-end");
  const tabs = nav.querySelectorAll(".mobile-nav-tab");

  let activePanel = null; // "intel" | "timeline" | null

  // ─── Panel mapping ───
  const panelMap = {
    intel: panelStart,
    timeline: panelEnd
  };

  // ─── Open a panel ───
  function openPanel(name) {
    // Close any currently open panel first
    closeAllPanels();

    const panel = panelMap[name];
    if (!panel) return;

    activePanel = name;
    panel.classList.add("mobile-open");
    backdrop.classList.add("visible");
    fabGroup.classList.add("hidden");

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  // ─── Close all panels ───
  function closeAllPanels() {
    Object.values(panelMap).forEach((p) => p.classList.remove("mobile-open"));
    backdrop.classList.remove("visible");
    fabGroup.classList.remove("hidden");
    activePanel = null;
    document.body.style.overflow = "";
  }

  // ─── Tab click handlers ───
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.panel;

      // Update active tab styling
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (target === "map") {
        closeAllPanels();
      } else {
        // If tapping the same panel that's open, close it
        if (activePanel === target) {
          closeAllPanels();
          // Reset to map tab
          tabs.forEach((t) => t.classList.remove("active"));
          nav.querySelector('[data-panel="map"]').classList.add("active");
        } else {
          openPanel(target);
        }
      }
    });
  });

  // ─── Backdrop tap to close ───
  backdrop.addEventListener("click", () => {
    closeAllPanels();
    tabs.forEach((t) => t.classList.remove("active"));
    nav.querySelector('[data-panel="map"]').classList.add("active");
  });

  // ─── Mobile FAB handlers ───
  const btnHome = document.getElementById("mobile-btn-home");
  const btnBasemap = document.getElementById("mobile-btn-basemap");

  if (btnHome) {
    btnHome.addEventListener("click", () => {
      view.goTo({ center: homeCenter, zoom: homeZoom }, { duration: 1200 });
    });
  }

  if (btnBasemap) {
    btnBasemap.addEventListener("click", () => {
      basemapToggle.toggle();
    });
  }

  // ─── Swipe-to-dismiss on panels ───
  Object.entries(panelMap).forEach(([name, panel]) => {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    panel.addEventListener("touchstart", (e) => {
      // Only start drag from top area (first 60px)
      const rect = panel.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      if (touchY > 60) return;

      startY = e.touches[0].clientY;
      currentY = startY;
      isDragging = true;
      panel.style.transition = "none";
    }, { passive: true });

    panel.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const delta = currentY - startY;

      // Only allow downward drag
      if (delta > 0) {
        panel.style.transform = `translateY(${delta}px)`;
        // Fade backdrop proportionally
        const progress = Math.min(delta / 300, 1);
        backdrop.style.opacity = 1 - progress;
      }
    }, { passive: true });

    panel.addEventListener("touchend", () => {
      if (!isDragging) return;
      isDragging = false;

      const delta = currentY - startY;
      panel.style.transition = "";
      backdrop.style.opacity = "";

      // If dragged down more than 100px, dismiss
      if (delta > 100) {
        closeAllPanels();
        tabs.forEach((t) => t.classList.remove("active"));
        nav.querySelector('[data-panel="map"]').classList.add("active");
      } else {
        // Snap back
        panel.style.transform = "";
        panel.classList.add("mobile-open");
      }
    }, { passive: true });
  });

  // ─── Close panel on map popup open (so user can see it) ───
  view.popup.watch("visible", (visible) => {
    if (visible && activePanel) {
      closeAllPanels();
      tabs.forEach((t) => t.classList.remove("active"));
      nav.querySelector('[data-panel="map"]').classList.add("active");
    }
  });
}

init().catch((err) => console.error("App initialization failed:", err));
