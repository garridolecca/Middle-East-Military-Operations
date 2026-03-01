/* ================================================
   ArcGIS Layer Definitions — Enhanced Symbology
   ================================================ */
import {
  carriers, destroyers, iranSites, iranAttacks,
  alliedBases, carrierRoutes
} from "./data.js";

// ─── Helpers ───
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

// ─── Reusable label symbol ───
function labelSymbol(text, color, size = 11, yOffset = -20, haloColor = [10, 10, 30, 220]) {
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

// ─── Carrier Strike Group Layer ───
export function createCarrierLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "carriers", title: "U.S. Carrier Strike Groups" });

  carriers.forEach((c) => {
    // Large anchor-shaped marker
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [0, 119, 182, 255],
        size: 26,
        outline: { color: [173, 232, 244, 255], width: 3 }
      },
      attributes: { ...c },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.7;color:#e0e0e0">
            <b style="color:#48cae4">Type:</b> {type}<br/>
            <b style="color:#48cae4">Status:</b> {status}<br/>
            <b style="color:#48cae4">Aircraft:</b> {aircraft}<br/>
            <b style="color:#48cae4">Complement:</b> {complement}<br/>
            <b style="color:#48cae4">Mission:</b> {mission}<br/>
            <b style="color:#48cae4">Strike Radius:</b> {strikeRadius} km
          </div>`
      }
    }));

    // Inner star icon to signify carrier
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker",
        style: "diamond",
        color: [202, 240, 248, 255],
        size: 12,
        outline: { color: [0, 119, 182, 255], width: 1 }
      }
    }));

    // Pulsing glow ring
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [0, 0, 0, 0],
        size: 40,
        outline: { color: [0, 180, 216, 80], width: 2 }
      }
    }));

    // Text label
    const shortName = c.name.includes("Ford") ? "USS FORD (CVN-78)" : "USS LINCOLN (CVN-72)";
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: labelSymbol(shortName, [173, 232, 244, 255], 11, -28)
    }));
  });

  return layer;
}

// ─── Destroyer Layer ───
export function createDestroyerLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "destroyers", title: "Destroyers / Missile Defense" });

  destroyers.forEach((d) => {
    // Diamond marker
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: {
        type: "simple-marker",
        style: "diamond",
        color: [72, 202, 228, 255],
        size: 20,
        outline: { color: [255, 255, 255, 240], width: 2.5 }
      },
      attributes: { ...d },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.7;color:#e0e0e0">
            <b style="color:#48cae4">Type:</b> {type}<br/>
            <b style="color:#48cae4">Status:</b> {status}<br/>
            <b style="color:#48cae4">Systems:</b> {systems}<br/>
            <b style="color:#48cae4">Mission:</b> {mission}
          </div>`
      }
    }));

    // Inner cross to signify missile defense
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: {
        type: "simple-marker",
        style: "x",
        color: [255, 255, 255, 200],
        size: 8,
        outline: { color: [255, 255, 255, 200], width: 2 }
      }
    }));

    // Label
    const shortName = d.name.includes("Bulkeley") ? "USS BULKELEY" : "USS ROOSEVELT";
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: labelSymbol(shortName + "\nAegis BMD", [144, 224, 239, 255], 10, -22)
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
      // Nuclear: bright red circle with radioactive-style rings
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: [214, 40, 40, 255],
          size: 20,
          outline: { color: [255, 220, 100, 255], width: 3 }
        },
        attributes: { ...s },
        popupTemplate: nuclearPopup()
      }));
      // Inner warning dot
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: [255, 220, 100, 255],
          size: 8,
          outline: { color: [214, 40, 40, 255], width: 1 }
        }
      }));
      // Outer warning ring
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker",
          style: "circle",
          color: [0, 0, 0, 0],
          size: 32,
          outline: { color: [255, 220, 100, 60], width: 2 }
        }
      }));
    } else {
      // Military: red square with white cross
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker",
          style: "square",
          color: [180, 30, 30, 240],
          size: 16,
          outline: { color: [255, 150, 150, 220], width: 2 }
        },
        attributes: { ...s },
        popupTemplate: nuclearPopup()
      }));
      // Inner cross
      layer.add(new Graphic({
        geometry: pt(s.longitude, s.latitude),
        symbol: {
          type: "simple-marker",
          style: "x",
          color: [255, 200, 200, 200],
          size: 7,
          outline: { color: [255, 200, 200, 200], width: 1.5 }
        }
      }));
    }

    // Label
    const label = s.name.replace(/ Nuclear.*| Fuel.*| Military.*| Naval.*| Aerospace.*| Oil.*/i, "");
    const typeTag = isNuclear ? "NUCLEAR" : "MILITARY";
    layer.add(new Graphic({
      geometry: pt(s.longitude, s.latitude),
      symbol: labelSymbol(
        label + "\n" + typeTag,
        isNuclear ? [255, 220, 100, 255] : [255, 150, 150, 240],
        9, -24, [40, 10, 10, 200]
      )
    }));
  });

  return layer;

  function nuclearPopup() {
    return {
      title: "{name}",
      content: `
        <div style="font-size:13px;line-height:1.7;color:#e0e0e0">
          <b style="color:#ffdc64">Facility Type:</b> {type}<br/>
          <b style="color:#ffdc64">Threat Assessment:</b> {threat}<br/>
          <b style="color:#ffdc64">Status:</b> {status}
        </div>`
    };
  }
}

// ─── Iranian Attack Vectors ───
export function createAttackLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "iran-attacks", title: "Iranian Attack Vectors" });

  const attackColors = {
    "Direct Strike":    [255, 50, 50, 230],
    "Ballistic Missile":[255, 80, 40, 230],
    "Proxy — Anti-Ship":[247, 160, 0, 220],
    "Proxy — Rockets":  [255, 140, 50, 220],
    "Naval Provocation": [255, 200, 50, 200],
    "Proxy — Drones":   [247, 127, 0, 210]
  };

  iranAttacks.forEach((a) => {
    const color = attackColors[a.type] || [247, 127, 0, 200];

    // Main attack line — thick and visible
    layer.add(new Graphic({
      geometry: polyline([a.from, a.to]),
      symbol: {
        type: "simple-line",
        color,
        width: 3.5,
        style: "dash"
      },
      attributes: { name: a.name, type: a.type, detail: a.detail, date: a.date },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.7;color:#e0e0e0">
            <b style="color:#f4a261">Type:</b> {type}<br/>
            <b style="color:#f4a261">Date:</b> {date}<br/>
            <b style="color:#f4a261">Details:</b> {detail}
          </div>`
      }
    }));

    // Glow line underneath
    layer.add(new Graphic({
      geometry: polyline([a.from, a.to]),
      symbol: {
        type: "simple-line",
        color: [color[0], color[1], color[2], 50],
        width: 8,
        style: "solid"
      }
    }));

    // Origin: filled triangle (launch point)
    layer.add(new Graphic({
      geometry: pt(a.from[0], a.from[1]),
      symbol: {
        type: "simple-marker",
        style: "triangle",
        color,
        size: 16,
        angle: calcBearing(a.from, a.to),
        outline: { color: [255, 255, 255, 180], width: 1.5 }
      }
    }));

    // Target: bold crosshair (impact zone)
    layer.add(new Graphic({
      geometry: pt(a.to[0], a.to[1]),
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [0, 0, 0, 0],
        size: 18,
        outline: { color: [255, 60, 60, 255], width: 3 }
      }
    }));
    layer.add(new Graphic({
      geometry: pt(a.to[0], a.to[1]),
      symbol: {
        type: "simple-marker",
        style: "x",
        color: [255, 60, 60, 255],
        size: 14,
        outline: { color: [255, 60, 60, 255], width: 3 }
      }
    }));

    // Arrowhead at midpoint to show direction
    const mid = [(a.from[0] + a.to[0]) / 2, (a.from[1] + a.to[1]) / 2];
    layer.add(new Graphic({
      geometry: pt(mid[0], mid[1]),
      symbol: {
        type: "simple-marker",
        style: "triangle",
        color,
        size: 12,
        angle: calcBearing(a.from, a.to),
        outline: { color: [255, 255, 255, 140], width: 1 }
      }
    }));

    // Attack label at midpoint
    layer.add(new Graphic({
      geometry: pt(mid[0], mid[1]),
      symbol: labelSymbol(a.type, [255, 220, 180, 240], 9, 14, [60, 20, 0, 180])
    }));
  });

  return layer;
}

// ─── Allied Bases ───
export function createBasesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "bases", title: "U.S. / Allied Bases" });

  alliedBases.forEach((b) => {
    // Outer ring
    layer.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: {
        type: "simple-marker",
        style: "circle",
        color: [0, 0, 0, 0],
        size: 24,
        outline: { color: [6, 214, 160, 120], width: 2 }
      }
    }));

    // Star marker
    layer.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: {
        type: "simple-marker",
        style: "square",
        color: [6, 214, 160, 240],
        size: 14,
        angle: 45,
        outline: { color: [255, 255, 255, 220], width: 2 }
      },
      attributes: { ...b },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.7;color:#e0e0e0">
            <b style="color:#06d6a0">Country:</b> {country}<br/>
            <b style="color:#06d6a0">Branch:</b> {branch}<br/>
            <b style="color:#06d6a0">Assets:</b> {assets}
          </div>`
      }
    }));

    // Label
    layer.add(new Graphic({
      geometry: pt(b.longitude, b.latitude),
      symbol: labelSymbol(
        b.name.replace(/ Air Base| Naval Support Activity/i, "") + "\n" + b.country,
        [6, 214, 160, 240], 9, -22, [10, 40, 30, 200]
      )
    }));
  });

  return layer;
}

// ─── Carrier Routes ───
export function createRoutesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "routes", title: "Carrier Movement Routes" });

  const routeColors = {
    "CVN-78": [100, 180, 255, 200],  // Ford — light blue
    "CVN-72": [130, 220, 180, 200]   // Lincoln — teal
  };

  carrierRoutes.forEach((r) => {
    const color = routeColors[r.vessel] || [244, 162, 97, 180];

    // Glow line
    layer.add(new Graphic({
      geometry: polyline(r.path),
      symbol: {
        type: "simple-line",
        color: [color[0], color[1], color[2], 40],
        width: 8,
        style: "solid"
      }
    }));

    // Main route line
    layer.add(new Graphic({
      geometry: polyline(r.path),
      symbol: {
        type: "simple-line",
        color,
        width: 3,
        style: "short-dot"
      },
      attributes: { name: r.name, vessel: r.vessel },
      popupTemplate: {
        title: "{name}",
        content: "<b>Vessel:</b> {vessel}"
      }
    }));

    // Direction arrows along route — larger and clearer
    r.path.forEach((point, i) => {
      if (i > 0 && i < r.path.length - 1) {
        layer.add(new Graphic({
          geometry: pt(point[0], point[1]),
          symbol: {
            type: "simple-marker",
            style: "triangle",
            color,
            size: 14,
            angle: calcBearing(r.path[i - 1], point),
            outline: { color: [255, 255, 255, 160], width: 1.5 }
          }
        }));
      }
    });

    // Route label at first waypoint
    layer.add(new Graphic({
      geometry: pt(r.path[0][0], r.path[0][1]),
      symbol: labelSymbol(r.vessel === "CVN-78" ? "FORD ROUTE" : "LINCOLN ROUTE", color, 9, 16)
    }));
  });

  return layer;
}

function calcBearing([lon1, lat1], [lon2, lat2]) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// ─── Strike / Threat Radii ───
export function createRadiiLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "radii", title: "Strike / Threat Radii" });

  // Helper: place a callout annotation at a specific point
  function callout(lon, lat, text, color, bgColor, size = 9, yOff = 0) {
    layer.add(new Graphic({
      geometry: pt(lon, lat),
      symbol: labelSymbol(text, color, size, yOff, bgColor)
    }));
  }

  // Helper: dashed connector line from radius edge to callout
  function connector(fromLon, fromLat, toLon, toLat, color) {
    layer.add(new Graphic({
      geometry: polyline([[fromLon, fromLat], [toLon, toLat]]),
      symbol: { type: "simple-line", color, width: 1, style: "dot" }
    }));
  }

  // ════════════════════════════════════════════════════
  // USS FORD (CVN-78) — Eastern Med — 1,100 km radius
  // Covers: Israel, Lebanon, Syria, Cyprus, W. Iraq
  // ════════════════════════════════════════════════════
  const ford = carriers.find(c => c.name.includes("Ford"));
  const fordR = ford.strikeRadius;

  layer.add(new Graphic({
    geometry: circle(ford.longitude, ford.latitude, fordR),
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: { color: [0, 180, 216, 180], width: 2.5, style: "dash" }
    },
    attributes: {
      name: "USS Ford — F-35C / F/A-18 Strike Radius",
      radius: fordR + " km"
    },
    popupTemplate: {
      title: "USS Gerald R. Ford (CVN-78) — Strike Radius",
      content: `
        <div style="font-size:13px;line-height:1.8;color:#e0e0e0">
          <b style="color:#00b4d8">Combat Radius:</b> 1,100 km (F-35C Lightning II)<br/><br/>
          <b style="color:#00b4d8">KEY ASSETS IN RANGE:</b><br/>
          &#8226; All of <b>Israel</b> — direct air support & strike missions<br/>
          &#8226; <b>Southern Lebanon / Hezbollah</b> positions — counter-rocket operations<br/>
          &#8226; <b>Syria</b> — regime & Iranian proxy targets<br/>
          &#8226; <b>Western Iraq</b> — militia staging areas<br/>
          &#8226; <b>USS Bulkeley & USS Roosevelt</b> — integrated Aegis defense<br/>
          &#8226; <b>RAF Akrotiri (Cyprus)</b> — coalition coordination<br/>
          &#8226; <b>Incirlik AB (Turkey)</b> — NATO tanker & ISR support<br/><br/>
          <b style="color:#ffdc64">WHY IT MATTERS:</b> The Ford CSG provides the western prong of a two-carrier
          pincer. Its air wing can defend Israel, suppress Hezbollah & Syrian proxies,
          and interdict Iranian weapons shipments through the Levant — all without
          entering Iranian airspace.
        </div>`
    }
  }));

  // Ford — edge labels (N, S, E, W cardinal points)
  const fordNLat = ford.latitude + (fordR / 6371) * (180 / Math.PI);
  const fordSLat = ford.latitude - (fordR / 6371) * (180 / Math.PI);
  const fordELon = ford.longitude + (fordR / 6371) * (180 / Math.PI) / Math.cos(ford.latitude * Math.PI / 180);

  callout(ford.longitude, fordNLat, "FORD STRIKE RANGE — 1,100 km", [0, 180, 216, 220], [10, 20, 40, 220], 10, 8);

  // Ford — asset callouts inside the radius
  callout(35.2, 32.0, "ISRAEL\nFull air cover", [120, 200, 255, 255], [10, 20, 50, 220], 9, 0);
  connector(ford.longitude, ford.latitude, 35.2, 32.3, [0, 180, 216, 60]);

  callout(35.5, 33.8, "HEZBOLLAH\nCounter-rocket ops", [255, 180, 100, 240], [50, 20, 10, 200], 8, 14);

  callout(38.5, 35.5, "SYRIA\nProxy targets in range", [120, 200, 255, 220], [10, 20, 50, 200], 8, 0);
  connector(ford.longitude, ford.latitude, 38.5, 35.3, [0, 180, 216, 40]);

  // ════════════════════════════════════════════════════
  // USS LINCOLN (CVN-72) — Persian Gulf — 1,100 km radius
  // Covers: ALL major Iranian nuclear sites, Tehran,
  //         Bandar Abbas, Kharg Island, Gulf bases
  // ════════════════════════════════════════════════════
  const lincoln = carriers.find(c => c.name.includes("Lincoln"));
  const lincolnR = lincoln.strikeRadius;

  layer.add(new Graphic({
    geometry: circle(lincoln.longitude, lincoln.latitude, lincolnR),
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: { color: [0, 220, 180, 180], width: 2.5, style: "dash" }
    },
    attributes: {
      name: "USS Lincoln — F-35C / F/A-18 Strike Radius",
      radius: lincolnR + " km"
    },
    popupTemplate: {
      title: "USS Abraham Lincoln (CVN-72) — Strike Radius",
      content: `
        <div style="font-size:13px;line-height:1.8;color:#e0e0e0">
          <b style="color:#06d6a0">Combat Radius:</b> 1,100 km (F-35C Lightning II)<br/><br/>
          <b style="color:#06d6a0">KEY IRANIAN TARGETS IN RANGE:</b><br/>
          &#8226; <b style="color:#ffdc64">Natanz</b> — primary uranium enrichment (underground, 60%+ purity)<br/>
          &#8226; <b style="color:#ffdc64">Isfahan</b> — uranium conversion facility (UF6 pipeline)<br/>
          &#8226; <b style="color:#ffdc64">Fordow</b> — hardened mountain bunker enrichment<br/>
          &#8226; <b style="color:#ffdc64">Bushehr</b> — nuclear power reactor<br/>
          &#8226; <b style="color:#d62828">Tehran / IRGC HQ</b> — ballistic missile command (borderline)<br/>
          &#8226; <b style="color:#d62828">Parchin</b> — weapons research complex (borderline)<br/>
          &#8226; <b>Bandar Abbas</b> — IRGC Navy HQ, Strait of Hormuz<br/>
          &#8226; <b>Kharg Island</b> — 90% of Iran's oil exports<br/><br/>
          <b style="color:#ffdc64">WHY IT MATTERS:</b> The Lincoln is the tip of the spear.
          From the Persian Gulf, its air wing can strike <b>every major Iranian
          nuclear facility</b> — Natanz, Isfahan, Fordow, and Bushehr — plus
          the IRGC naval base controlling the Strait of Hormuz. This single
          carrier group holds Iran's entire nuclear program and oil economy
          at risk simultaneously.
        </div>`
    }
  }));

  // Lincoln — edge labels
  const lincolnNLat = lincoln.latitude + (lincolnR / 6371) * (180 / Math.PI);
  callout(lincoln.longitude, lincolnNLat, "LINCOLN STRIKE RANGE — 1,100 km", [0, 220, 180, 220], [10, 30, 30, 220], 10, 8);

  // Lincoln — asset callouts: nuclear targets in range
  callout(51.727, 33.724, "NATANZ\nPrimary enrichment", [255, 220, 100, 255], [60, 20, 10, 220], 9, -22);
  connector(lincoln.longitude, lincoln.latitude, 51.727, 33.3, [0, 220, 180, 50]);

  callout(51.668, 32.652, "ISFAHAN\nConversion facility", [255, 220, 100, 255], [60, 20, 10, 220], 9, 18);
  connector(lincoln.longitude, lincoln.latitude, 51.668, 32.9, [0, 220, 180, 50]);

  callout(50.5, 35.2, "FORDOW\nHardened bunker", [255, 220, 100, 255], [60, 20, 10, 220], 9, -16);
  connector(lincoln.longitude, lincoln.latitude, 50.5, 34.88, [0, 220, 180, 50]);

  callout(50.884, 28.5, "BUSHEHR\nNuclear reactor", [255, 180, 120, 240], [50, 20, 10, 200], 8, 14);

  callout(56.27, 27.6, "BANDAR ABBAS\nIRGC Navy — Hormuz", [255, 150, 150, 240], [50, 15, 15, 200], 8, -18);
  connector(lincoln.longitude, lincoln.latitude, 56.27, 27.18, [0, 220, 180, 40]);

  callout(50.32, 29.6, "KHARG ISLAND\n90% Iran oil exports", [255, 200, 130, 230], [50, 25, 10, 200], 8, -16);

  // ════════════════════════════════════════════════════
  // IRANIAN BALLISTIC MISSILE RANGE — 2,000 km from Tehran
  // Covers: Israel, ALL U.S. bases, BOTH carriers,
  //         Saudi Arabia, Turkey, Egypt
  // ════════════════════════════════════════════════════
  layer.add(new Graphic({
    geometry: circle(51.39, 35.7, 2000),
    symbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0],
      outline: { color: [214, 40, 40, 160], width: 2.5, style: "dash" }
    },
    attributes: { name: "Iranian Ballistic Missile Range", radius: "~2,000 km" },
    popupTemplate: {
      title: "Iranian Ballistic Missile Range (Shahab-3 / Emad / Sejjil)",
      content: `
        <div style="font-size:13px;line-height:1.8;color:#e0e0e0">
          <b style="color:#d62828">Range:</b> ~2,000 km from Tehran (IRGC Aerospace Force HQ)<br/><br/>
          <b style="color:#d62828">U.S. / ALLIED ASSETS UNDER THREAT:</b><br/>
          &#8226; <b style="color:#ffdc64">Israel</b> — ~1,500 km, well within range of Shahab-3 & Emad<br/>
          &#8226; <b style="color:#00b4d8">USS Ford CSG</b> — Eastern Med, within missile envelope<br/>
          &#8226; <b style="color:#00b4d8">USS Lincoln CSG</b> — Persian Gulf, within missile envelope<br/>
          &#8226; <b style="color:#00b4d8">USS Bulkeley & Roosevelt</b> — in range (why Aegis BMD is critical)<br/>
          &#8226; <b style="color:#06d6a0">Al Udeid AB (Qatar)</b> — CENTCOM forward HQ at risk<br/>
          &#8226; <b style="color:#06d6a0">Al Dhafra AB (UAE)</b> — F-22 / F-35 base at risk<br/>
          &#8226; <b style="color:#06d6a0">NSA Bahrain</b> — 5th Fleet HQ at risk<br/>
          &#8226; <b style="color:#06d6a0">Camp Arifjan (Kuwait)</b> — Army staging hub at risk<br/>
          &#8226; <b style="color:#06d6a0">Incirlik AB (Turkey)</b> — NATO base at risk<br/>
          &#8226; <b>Saudi Arabia, Egypt, S. Turkey</b> — major population centers<br/><br/>
          <b style="color:#ffdc64">WHY IT MATTERS:</b> Iran's Shahab-3, Emad, and Sejjil missiles
          can reach <b>every single U.S. asset in the region</b> — both carriers,
          all destroyers, and every allied air base. This is precisely why the
          USS Bulkeley and Roosevelt are positioned for <b>Aegis ballistic missile
          defense</b>, and why Israel's Arrow-3 and Iron Dome are on full alert.
          The entire U.S. deployment operates inside Iran's threat envelope.
        </div>`
    }
  }));

  // Iran range — edge labels (multiple sides for visibility)
  const iranNLat = 35.7 + (2000 / 6371) * (180 / Math.PI);
  const iranSLat = 35.7 - (2000 / 6371) * (180 / Math.PI);
  const iranWLon = 51.39 - (2000 / 6371) * (180 / Math.PI) / Math.cos(35.7 * Math.PI / 180);

  callout(51.39, iranNLat, "IRAN MISSILE RANGE — 2,000 km (Shahab-3 / Emad)", [255, 100, 100, 230], [50, 10, 10, 220], 10, 8);
  callout(iranWLon + 2, 35.7, "ALL U.S. FORCES\nINSIDE THIS ENVELOPE", [255, 160, 160, 220], [50, 10, 10, 200], 9, 0);

  // Threat callouts — what Iran can hit
  callout(35.21, 31.0, "ISRAEL\nShahab-3 target (~1,500 km)", [255, 130, 130, 240], [50, 10, 10, 200], 8, 0);
  connector(51.39, 35.7, 35.21, 31.5, [214, 40, 40, 35]);

  callout(51.315, 24.3, "AL UDEID + NSA BAHRAIN\nCENTCOM & 5th Fleet at risk", [255, 130, 130, 220], [50, 10, 10, 200], 8, 0);

  callout(35.425, 37.6, "INCIRLIK\nNATO base at risk", [255, 130, 130, 200], [50, 10, 10, 200], 8, -14);

  return layer;
}
