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
}

init().catch((err) => console.error("App initialization failed:", err));
