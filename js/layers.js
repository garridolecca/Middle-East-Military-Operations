/* ================================================
   ArcGIS Layer Definitions — Scale-Dependent Labels
   ================================================ */
import {
  carriers, destroyers, iranSites, iranAttacks,
  alliedBases, carrierRoutes
} from "./data.js";

// ─── Geometry Helpers ───
function pt(lon, lat) {
  return { type: "point", longitude: lon, latitude: lat };
}

function polyline(paths) {
  return { type: "polyline", paths: [paths.map(([lon, lat]) => [lon, lat])] };
}

function circle(lon, lat, radiusKm, steps = 72) {
  const R = 6371;
  const rings = [];
  for (let i = 0; i <= steps; i++) {
    const angle = (2 * Math.PI * i) / steps;
    const dLat = (radiusKm / R) * Math.cos(angle) * (180 / Math.PI);
    const dLon = (radiusKm / R) * Math.sin(angle) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);
    rings.push([lon + dLon, lat + dLat]);
  }
  return { type: "polygon", rings: [rings] };
}

function calcBearing([lon1, lat1], [lon2, lat2]) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Reusable label symbol ───
function labelSym(text, color, size = 11, yOffset = -20, haloColor = [10, 10, 30, 220]) {
  return {
    type: "text",
    text,
    color,
    font: { size, family: "Avenir Next", weight: "bold" },
    haloColor,
    haloSize: 2,
    yoffset: yOffset,
    horizontalAlignment: "center"
  };
}

// ═══════════════════════════════════════════════════════
// FEATURE LAYERS (markers, lines, polygons — NO labels)
// ═══════════════════════════════════════════════════════

// ─── Carrier Strike Groups ───
export function createCarrierLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "carriers", title: "U.S. Carrier Strike Groups" });

  carriers.forEach((c) => {
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker", style: "circle",
        color: [0, 119, 182, 255], size: 26,
        outline: { color: [173, 232, 244, 255], width: 3 }
      },
      attributes: { ...c },
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px;line-height:1.7;color:#e0e0e0">
          <b style="color:#48cae4">Type:</b> {type}<br/>
          <b style="color:#48cae4">Status:</b> {status}<br/>
          <b style="color:#48cae4">Aircraft:</b> {aircraft}<br/>
          <b style="color:#48cae4">Complement:</b> {complement}<br/>
          <b style="color:#48cae4">Mission:</b> {mission}<br/>
          <b style="color:#48cae4">Strike Radius:</b> {strikeRadius} km</div>`
      }
    }));
    // Inner diamond
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker", style: "diamond",
        color: [202, 240, 248, 255], size: 12,
        outline: { color: [0, 119, 182, 255], width: 1 }
      }
    }));
    // Glow ring
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker", style: "circle",
        color: [0, 0, 0, 0], size: 40,
        outline: { color: [0, 180, 216, 80], width: 2 }
      }
    }));
  });
  return layer;
}

// ─── Destroyers ───
export function createDestroyerLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "destroyers", title: "Destroyers / Missile Defense" });

  destroyers.forEach((d) => {
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: {
        type: "simple-marker", style: "diamond",
        color: [72, 202, 228, 255], size: 20,
        outline: { color: [255, 255, 255, 240], width: 2.5 }
      },
      attributes: { ...d },
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px;line-height:1.7;color:#e0e0e0">
          <b style="color:#48cae4">Type:</b> {type}<br/>
          <b style="color:#48cae4">Status:</b> {status}<br/>
          <b style="color:#48cae4">Systems:</b> {systems}<br/>
          <b style="color:#48cae4">Mission:</b> {mission}</div>`
      }
    }));
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: {
        type: "simple-marker", style: "x",
        color: [255, 255, 255, 200], size: 8,
        outline: { color: [255, 255, 255, 200], width: 2 }
      }
    }));
  });
  return layer;
}

// ─── Iranian Military Sites ───
export function createIranSitesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "iran-sites", title: "Iranian Military / Nuclear Sites" });

  iranSites.forEach((s) => {
    const isNuclear = s.type.toLowerCase().includes("nuclear") || s.type.toLowerCase().includes("enrichment");

    if (isNuclear) {
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker", style: "circle",
          color: [214, 40, 40, 255], size: 20,
          outline: { color: [255, 220, 100, 255], width: 3 }
        },
        attributes: { ...s },
        popupTemplate: sitePopup()
      }));
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker", style: "circle",
          color: [255, 220, 100, 255], size: 8,
          outline: { color: [214, 40, 40, 255], width: 1 }
        }
      }));
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker", style: "circle",
          color: [0, 0, 0, 0], size: 32,
          outline: { color: [255, 220, 100, 60], width: 2 }
        }
      }));
    } else {
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker", style: "square",
          color: [180, 30, 30, 240], size: 16,
          outline: { color: [255, 150, 150, 220], width: 2 }
        },
        attributes: { ...s },
        popupTemplate: sitePopup()
      }));
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker", style: "x",
          color: [255, 200, 200, 200], size: 7,
          outline: { color: [255, 200, 200, 200], width: 1.5 }
        }
      }));
    }
  });
  return layer;

  function sitePopup() {
    return {
      title: "{name}",
      content: `<div style="font-size:13px;line-height:1.7;color:#e0e0e0">
        <b style="color:#ffdc64">Facility Type:</b> {type}<br/>
        <b style="color:#ffdc64">Threat Assessment:</b> {threat}<br/>
        <b style="color:#ffdc64">Status:</b> {status}</div>`
    };
  }
}

// ─── Iranian Attack Vectors ───
export function createAttackLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "iran-attacks", title: "Iranian Attack Vectors" });

  const attackColors = {
    "Direct Strike":     [255, 50, 50, 230],
    "Ballistic Missile": [255, 80, 40, 230],
    "Proxy — Anti-Ship": [247, 160, 0, 220],
    "Proxy — Rockets":   [255, 140, 50, 220],
    "Naval Provocation": [255, 200, 50, 200],
    "Proxy — Drones":    [247, 127, 0, 210]
  };

  iranAttacks.forEach((a) => {
    const color = attackColors[a.type] || [247, 127, 0, 200];

    // Glow
    layer.add(new Graphic({
      geometry: polyline([a.from, a.to]),
      symbol: { type: "simple-line", color: [color[0], color[1], color[2], 50], width: 8, style: "solid" }
    }));
    // Main line
    layer.add(new Graphic({
      geometry: polyline([a.from, a.to]),
      symbol: { type: "simple-line", color, width: 3.5, style: "dash" },
      attributes: { name: a.name, type: a.type, detail: a.detail, date: a.date },
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px;line-height:1.7;color:#e0e0e0">
          <b style="color:#f4a261">Type:</b> {type}<br/>
          <b style="color:#f4a261">Date:</b> {date}<br/>
          <b style="color:#f4a261">Details:</b> {detail}</div>`
      }
    }));
    // Origin triangle
    layer.add(new Graphic({
      geometry: pt(a.from[0], a.from[1]),
      symbol: {
        type: "simple-marker", style: "triangle", color, size: 16,
        angle: calcBearing(a.from, a.to),
        outline: { color: [255, 255, 255, 180], width: 1.5 }
      }
    }));
    // Target crosshair
    layer.add(new Graphic({
      geometry: pt(a.to[0], a.to[1]),
      symbol: {
        type: "simple-marker", style: "circle",
        color: [0, 0, 0, 0], size: 18,
        outline: { color: [255, 60, 60, 255], width: 3 }
      }
    }));
    layer.add(new Graphic({
      geometry: pt(a.to[0], a.to[1]),
      symbol: {
        type: "simple-marker", style: "x",
        color: [255, 60, 60, 255], size: 14,
        outline: { color: [255, 60, 60, 255], width: 3 }
      }
    }));
    // Midpoint arrow
    const mid = [(a.from[0] + a.to[0]) / 2, (a.from[1] + a.to[1]) / 2];
    layer.add(new Graphic({
      geometry: pt(mid[0], mid[1]),
      symbol: {
        type: "simple-marker", style: "triangle", color, size: 12,
        angle: calcBearing(a.from, a.to),
        outline: { color: [255, 255, 255, 140], width: 1 }
      }
    }));
  });
  return layer;
}

// ─── Allied Bases ───
export function createBasesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "bases", title: "U.S. / Allied Bases" });

  alliedBases.forEach((b) => {
    layer.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: {
        type: "simple-marker", style: "circle",
        color: [0, 0, 0, 0], size: 24,
        outline: { color: [6, 214, 160, 120], width: 2 }
      }
    }));
    layer.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: {
        type: "simple-marker", style: "square",
        color: [6, 214, 160, 240], size: 14, angle: 45,
        outline: { color: [255, 255, 255, 220], width: 2 }
      },
      attributes: { ...b },
      popupTemplate: {
        title: "{name}",
        content: `<div style="font-size:13px;line-height:1.7;color:#e0e0e0">
          <b style="color:#06d6a0">Country:</b> {country}<br/>
          <b style="color:#06d6a0">Branch:</b> {branch}<br/>
          <b style="color:#06d6a0">Assets:</b> {assets}</div>`
      }
    }));
  });
  return layer;
}

// ─── Carrier Routes ───
export function createRoutesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "routes", title: "Carrier Movement Routes" });
  const routeColors = { "CVN-78": [100, 180, 255, 200], "CVN-72": [130, 220, 180, 200] };

  carrierRoutes.forEach((r) => {
    const color = routeColors[r.vessel] || [244, 162, 97, 180];
    // Glow
    layer.add(new Graphic({
      geometry: polyline(r.path),
      symbol: { type: "simple-line", color: [color[0], color[1], color[2], 40], width: 8, style: "solid" }
    }));
    // Line
    layer.add(new Graphic({
      geometry: polyline(r.path),
      symbol: { type: "simple-line", color, width: 3, style: "short-dot" },
      attributes: { name: r.name, vessel: r.vessel },
      popupTemplate: { title: "{name}", content: "<b>Vessel:</b> {vessel}" }
    }));
    // Direction arrows
    r.path.forEach((point, i) => {
      if (i > 0 && i < r.path.length - 1) {
        layer.add(new Graphic({
          geometry: pt(point[0], point[1]),
          symbol: {
            type: "simple-marker", style: "triangle", color, size: 14,
            angle: calcBearing(r.path[i - 1], point),
            outline: { color: [255, 255, 255, 160], width: 1.5 }
          }
        }));
      }
    });
  });
  return layer;
}

// ─── Strike / Threat Radii (outline only, no fill) ───
export function createRadiiLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "radii", title: "Strike / Threat Radii" });

  const ford = carriers.find(c => c.name.includes("Ford"));
  const lincoln = carriers.find(c => c.name.includes("Lincoln"));

  // Ford radius — blue dashed outline
  layer.add(new Graphic({
    geometry: circle(ford.longitude, ford.latitude, ford.strikeRadius),
    symbol: {
      type: "simple-fill", color: [0, 0, 0, 0],
      outline: { color: [0, 180, 216, 180], width: 2.5, style: "dash" }
    },
    attributes: { name: "USS Ford — F-35C / F/A-18 Strike Radius", radius: ford.strikeRadius + " km" },
    popupTemplate: {
      title: "USS Gerald R. Ford (CVN-78) — Strike Radius",
      content: `<div style="font-size:13px;line-height:1.8;color:#e0e0e0">
        <b style="color:#00b4d8">Combat Radius:</b> 1,100 km (F-35C Lightning II)<br/><br/>
        <b style="color:#00b4d8">KEY ASSETS IN RANGE:</b><br/>
        &#8226; All of <b>Israel</b> — direct air support & strike missions<br/>
        &#8226; <b>Southern Lebanon / Hezbollah</b> — counter-rocket operations<br/>
        &#8226; <b>Syria</b> — regime & Iranian proxy targets<br/>
        &#8226; <b>Western Iraq</b> — militia staging areas<br/>
        &#8226; <b>USS Bulkeley & Roosevelt</b> — integrated Aegis defense<br/>
        &#8226; <b>RAF Akrotiri, Incirlik</b> — coalition coordination<br/><br/>
        <b style="color:#ffdc64">WHY IT MATTERS:</b> Western prong of a two-carrier pincer.
        Defends Israel, suppresses Hezbollah & Syrian proxies, interdicts
        Iranian weapons through the Levant.</div>`
    }
  }));

  // Lincoln radius — teal dashed outline
  layer.add(new Graphic({
    geometry: circle(lincoln.longitude, lincoln.latitude, lincoln.strikeRadius),
    symbol: {
      type: "simple-fill", color: [0, 0, 0, 0],
      outline: { color: [0, 220, 180, 180], width: 2.5, style: "dash" }
    },
    attributes: { name: "USS Lincoln — F-35C / F/A-18 Strike Radius", radius: lincoln.strikeRadius + " km" },
    popupTemplate: {
      title: "USS Abraham Lincoln (CVN-72) — Strike Radius",
      content: `<div style="font-size:13px;line-height:1.8;color:#e0e0e0">
        <b style="color:#06d6a0">Combat Radius:</b> 1,100 km (F-35C Lightning II)<br/><br/>
        <b style="color:#06d6a0">KEY IRANIAN TARGETS IN RANGE:</b><br/>
        &#8226; <b style="color:#ffdc64">Natanz</b> — primary enrichment (60%+ purity)<br/>
        &#8226; <b style="color:#ffdc64">Isfahan</b> — uranium conversion facility<br/>
        &#8226; <b style="color:#ffdc64">Fordow</b> — hardened mountain bunker<br/>
        &#8226; <b style="color:#ffdc64">Bushehr</b> — nuclear power reactor<br/>
        &#8226; <b style="color:#d62828">Tehran / IRGC HQ</b> — missile command (borderline)<br/>
        &#8226; <b>Bandar Abbas</b> — IRGC Navy, Strait of Hormuz<br/>
        &#8226; <b>Kharg Island</b> — 90% of Iran's oil exports<br/><br/>
        <b style="color:#ffdc64">WHY IT MATTERS:</b> Tip of the spear. Can strike every major
        Iranian nuclear facility plus the IRGC naval base and oil
        economy simultaneously.</div>`
    }
  }));

  // Iranian ballistic missile range — red dashed outline
  layer.add(new Graphic({
    geometry: circle(51.39, 35.7, 2000),
    symbol: {
      type: "simple-fill", color: [0, 0, 0, 0],
      outline: { color: [214, 40, 40, 160], width: 2.5, style: "dash" }
    },
    attributes: { name: "Iranian Ballistic Missile Range", radius: "~2,000 km" },
    popupTemplate: {
      title: "Iranian Ballistic Missile Range (Shahab-3 / Emad / Sejjil)",
      content: `<div style="font-size:13px;line-height:1.8;color:#e0e0e0">
        <b style="color:#d62828">Range:</b> ~2,000 km from Tehran<br/><br/>
        <b style="color:#d62828">U.S. / ALLIED ASSETS UNDER THREAT:</b><br/>
        &#8226; <b style="color:#ffdc64">Israel</b> — ~1,500 km, Shahab-3 & Emad<br/>
        &#8226; <b style="color:#00b4d8">Both carrier strike groups</b><br/>
        &#8226; <b style="color:#00b4d8">Both Aegis destroyers</b> (why BMD is critical)<br/>
        &#8226; <b style="color:#06d6a0">All U.S./allied bases</b> — Al Udeid, Al Dhafra, Bahrain, Arifjan, Incirlik<br/><br/>
        <b style="color:#ffdc64">WHY IT MATTERS:</b> Every U.S. asset operates inside Iran's
        threat envelope. This is why Aegis BMD and Arrow-3 are on
        full alert.</div>`
    }
  }));

  return layer;
}

// ═══════════════════════════════════════════════════════
// SCALE-DEPENDENT LABEL LAYERS
// 3 tiers: overview (always), regional (zoom 6+), detail (zoom 8+)
//
// ArcGIS scale reference:
//   zoom 4 ≈ 36,978,595   zoom 5 ≈ 18,489,297
//   zoom 6 ≈ 9,244,648    zoom 7 ≈ 4,622,324
//   zoom 8 ≈ 2,311,162    zoom 9 ≈ 1,155,581
// ═══════════════════════════════════════════════════════

export function createLabelLayers(Graphic, GraphicsLayer) {

  // ────────────────────────────────────────────
  // TIER 1 — OVERVIEW (always visible)
  // Only the most important: carrier names + 3 radius edge tags
  // ────────────────────────────────────────────
  const overview = new GraphicsLayer({
    id: "labels-overview",
    title: "Labels — Overview"
  });

  // Carrier names
  carriers.forEach((c) => {
    const tag = c.name.includes("Ford") ? "USS FORD" : "USS LINCOLN";
    overview.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: labelSym(tag, [173, 232, 244, 255], 12, -28)
    }));
  });

  // Radius edge tags — Ford
  const ford = carriers.find(c => c.name.includes("Ford"));
  const fordEdgeLat = ford.latitude + (ford.strikeRadius / 6371) * (180 / Math.PI);
  overview.add(new Graphic({
    geometry: pt(ford.longitude, fordEdgeLat),
    symbol: labelSym("FORD STRIKE RANGE\n1,100 km", [0, 180, 216, 200], 10, 6)
  }));

  // Radius edge tags — Lincoln
  const lincoln = carriers.find(c => c.name.includes("Lincoln"));
  const lincolnEdgeLat = lincoln.latitude + (lincoln.strikeRadius / 6371) * (180 / Math.PI);
  overview.add(new Graphic({
    geometry: pt(lincoln.longitude, lincolnEdgeLat),
    symbol: labelSym("LINCOLN STRIKE RANGE\n1,100 km", [0, 220, 180, 200], 10, 6)
  }));

  // Radius edge tag — Iran
  const iranEdgeLat = 35.7 + (2000 / 6371) * (180 / Math.PI);
  overview.add(new Graphic({
    geometry: pt(51.39, iranEdgeLat),
    symbol: labelSym("IRAN MISSILE RANGE\n2,000 km (Shahab-3 / Emad)", [255, 100, 100, 220], 10, 6, [50, 10, 10, 220])
  }));

  // ────────────────────────────────────────────
  // TIER 2 — REGIONAL (zoom 6+, minScale ~10M)
  // Destroyers, allied bases, top Iranian sites, "all forces inside envelope"
  // ────────────────────────────────────────────
  const regional = new GraphicsLayer({
    id: "labels-regional",
    title: "Labels — Regional",
    minScale: 10000000
  });

  // Destroyer labels
  destroyers.forEach((d) => {
    const tag = d.name.includes("Bulkeley") ? "USS BULKELEY\nAegis BMD" : "USS ROOSEVELT\nAegis BMD";
    regional.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: labelSym(tag, [144, 224, 239, 255], 10, -22)
    }));
  });

  // Allied base names
  alliedBases.forEach((b) => {
    const short = b.name.replace(/ Air Base| Naval Support Activity/i, "");
    regional.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: labelSym(short, [6, 214, 160, 230], 9, -20, [10, 40, 30, 200])
    }));
  });

  // Top 3 Iranian sites: Natanz, Fordow, Tehran IRGC
  const topIranSites = ["Natanz", "Fordow", "IRGC"];
  iranSites.filter(s => topIranSites.some(t => s.name.includes(t))).forEach((s) => {
    const short = s.name.replace(/ Nuclear.*| Fuel.*| Aerospace.*/i, "");
    const isNuclear = s.type.toLowerCase().includes("nuclear") || s.type.toLowerCase().includes("enrichment");
    regional.add(new Graphic({
      geometry: pt(s.longitude, s.latitude),
      symbol: labelSym(
        short + (isNuclear ? "\nNUCLEAR" : "\nMISSILE CMD"),
        isNuclear ? [255, 220, 100, 255] : [255, 150, 150, 240],
        9, -24, [40, 10, 10, 200]
      )
    }));
  });

  // Iran envelope warning (west side of red circle)
  const iranWLon = 51.39 - (2000 / 6371) * (180 / Math.PI) / Math.cos(35.7 * Math.PI / 180);
  regional.add(new Graphic({
    geometry: pt(iranWLon + 2, 35.7),
    symbol: labelSym("ALL U.S. FORCES\nINSIDE THIS ENVELOPE", [255, 160, 160, 220], 9, 0, [50, 10, 10, 200])
  }));

  // Carrier hull numbers under the name
  carriers.forEach((c) => {
    const hull = c.name.includes("Ford") ? "CVN-78" : "CVN-72";
    regional.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: labelSym(hull, [120, 190, 230, 180], 9, -42)
    }));
  });

  // ────────────────────────────────────────────
  // TIER 3 — DETAIL (zoom 8+, minScale ~3M)
  // All remaining Iranian sites, attack type labels, route labels,
  // radius callouts with connectors, base country tags
  // ────────────────────────────────────────────
  const detail = new GraphicsLayer({
    id: "labels-detail",
    title: "Labels — Detail",
    minScale: 3000000
  });

  // Remaining Iranian site labels
  const topNames = ["Natanz", "Fordow", "IRGC"];
  iranSites.filter(s => !topNames.some(t => s.name.includes(t))).forEach((s) => {
    const short = s.name.replace(/ Nuclear.*| Fuel.*| Military.*| Naval.*| Oil.*/i, "");
    const isNuclear = s.type.toLowerCase().includes("nuclear") || s.type.toLowerCase().includes("enrichment");
    detail.add(new Graphic({
      geometry: pt(s.longitude, s.latitude),
      symbol: labelSym(
        short + "\n" + (isNuclear ? "NUCLEAR" : "MILITARY"),
        isNuclear ? [255, 220, 100, 240] : [255, 150, 150, 220],
        8, -22, [40, 10, 10, 180]
      )
    }));
  });

  // Attack vector type labels at midpoints
  iranAttacks.forEach((a) => {
    const mid = [(a.from[0] + a.to[0]) / 2, (a.from[1] + a.to[1]) / 2];
    detail.add(new Graphic({
      geometry: pt(mid[0], mid[1]),
      symbol: labelSym(a.type, [255, 220, 180, 240], 8, 14, [60, 20, 0, 180])
    }));
  });

  // Route labels
  carrierRoutes.forEach((r) => {
    const color = r.vessel === "CVN-78" ? [100, 180, 255, 200] : [130, 220, 180, 200];
    const tag = r.vessel === "CVN-78" ? "FORD ROUTE" : "LINCOLN ROUTE";
    detail.add(new Graphic({
      geometry: pt(r.path[0][0], r.path[0][1]),
      symbol: labelSym(tag, color, 9, 16)
    }));
  });

  // Allied base country subtitles
  alliedBases.forEach((b) => {
    detail.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: labelSym(b.country, [6, 214, 160, 160], 8, -32, [10, 40, 30, 180])
    }));
  });

  // Ford radius callouts
  detail.add(new Graphic({
    geometry: pt(35.2, 32.0),
    symbol: labelSym("ISRAEL\nFull air cover", [120, 200, 255, 255], 9, 0, [10, 20, 50, 220])
  }));
  detail.add(new Graphic({
    geometry: polyline([[ford.longitude, ford.latitude], [35.2, 32.3]]),
    symbol: { type: "simple-line", color: [0, 180, 216, 60], width: 1, style: "dot" }
  }));
  detail.add(new Graphic({
    geometry: pt(38.5, 35.5),
    symbol: labelSym("SYRIA\nProxy targets in range", [120, 200, 255, 220], 8, 0, [10, 20, 50, 200])
  }));

  // Lincoln radius callouts — nuclear targets
  const lincolnCallouts = [
    { lon: 51.727, lat: 33.724, text: "NATANZ\nPrimary enrichment", yOff: -22 },
    { lon: 51.668, lat: 32.652, text: "ISFAHAN\nConversion facility", yOff: 18 },
    { lon: 50.5, lat: 35.2, text: "FORDOW\nHardened bunker", yOff: -16 },
    { lon: 50.884, lat: 28.5, text: "BUSHEHR\nNuclear reactor", yOff: 14 },
    { lon: 56.27, lat: 27.6, text: "BANDAR ABBAS\nIRGC Navy — Hormuz", yOff: -18 },
    { lon: 50.32, lat: 29.6, text: "KHARG ISLAND\n90% Iran oil exports", yOff: -16 }
  ];
  lincolnCallouts.forEach((c) => {
    detail.add(new Graphic({
      geometry: pt(c.lon, c.lat),
      symbol: labelSym(c.text, [255, 220, 100, 240], 8, c.yOff, [60, 20, 10, 200])
    }));
    detail.add(new Graphic({
      geometry: polyline([[lincoln.longitude, lincoln.latitude], [c.lon, c.lat]]),
      symbol: { type: "simple-line", color: [0, 220, 180, 40], width: 1, style: "dot" }
    }));
  });

  // Iran range — threat callouts
  detail.add(new Graphic({
    geometry: pt(35.21, 31.0),
    symbol: labelSym("ISRAEL\nShahab-3 target (~1,500 km)", [255, 130, 130, 240], 8, 0, [50, 10, 10, 200])
  }));
  detail.add(new Graphic({
    geometry: polyline([[51.39, 35.7], [35.21, 31.5]]),
    symbol: { type: "simple-line", color: [214, 40, 40, 35], width: 1, style: "dot" }
  }));
  detail.add(new Graphic({
    geometry: pt(51.315, 24.3),
    symbol: labelSym("AL UDEID + BAHRAIN\nCENTCOM & 5th Fleet at risk", [255, 130, 130, 220], 8, 0, [50, 10, 10, 200])
  }));
  detail.add(new Graphic({
    geometry: pt(35.425, 37.6),
    symbol: labelSym("INCIRLIK\nNATO base at risk", [255, 130, 130, 200], 8, -14, [50, 10, 10, 200])
  }));

  return { overview, regional, detail };
}
