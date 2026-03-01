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
  createRadiiLayer
} from "./layers.js";

// ─── Wait for ArcGIS modules ───
async function init() {
  const [
    { default: Map },
    { default: MapView },
    { default: Graphic },
    { default: GraphicsLayer },
    { default: Legend },
    { default: BasemapToggle },
    { default: ScaleBar },
    { default: Locate },
    reactiveUtils
  ] = await Promise.all([
    import("https://js.arcgis.com/5.0/esri/Map.js"),
    import("https://js.arcgis.com/5.0/esri/views/MapView.js"),
    import("https://js.arcgis.com/5.0/esri/Graphic.js"),
    import("https://js.arcgis.com/5.0/esri/layers/GraphicsLayer.js"),
    import("https://js.arcgis.com/5.0/esri/widgets/Legend.js"),
    import("https://js.arcgis.com/5.0/esri/widgets/BasemapToggle.js"),
    import("https://js.arcgis.com/5.0/esri/widgets/ScaleBar.js"),
    import("https://js.arcgis.com/5.0/esri/widgets/Locate.js"),
    import("https://js.arcgis.com/5.0/esri/core/reactiveUtils.js")
  ]);

  // ─── Build Layers ───
  const radiiLayer = createRadiiLayer(Graphic, GraphicsLayer);
  const routesLayer = createRoutesLayer(Graphic, GraphicsLayer);
  const attackLayer = createAttackLayer(Graphic, GraphicsLayer);
  const basesLayer = createBasesLayer(Graphic, GraphicsLayer);
  const iranSitesLayer = createIranSitesLayer(Graphic, GraphicsLayer);
  const destroyerLayer = createDestroyerLayer(Graphic, GraphicsLayer);
  const carrierLayer = createCarrierLayer(Graphic, GraphicsLayer);

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
      carrierLayer
    ]
  });

  const homeCenter = [45, 30];
  const homeZoom = 5;

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
      { center: [45, 30], zoom: 5 },
      { duration: 2000, easing: "ease-in-out" }
    );
  });
}

init().catch((err) => console.error("App initialization failed:", err));
