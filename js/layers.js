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

  carriers.forEach((c) => {
    // U.S. strike radius — blue
    layer.add(new Graphic({
      geometry: circle(c.longitude, c.latitude, c.strikeRadius),
      symbol: {
        type: "simple-fill",
        color: [0, 180, 216, 15],
        outline: { color: [0, 180, 216, 120], width: 2, style: "dash" }
      },
      attributes: { name: c.name + " — F-35C Strike Radius", radius: c.strikeRadius + " km" },
      popupTemplate: {
        title: "{name}",
        content: "<b>Combat radius:</b> {radius} (F-35C Lightning II)"
      }
    }));

    // Label at edge of radius (north)
    const labelLat = c.latitude + (c.strikeRadius / 6371) * (180 / Math.PI);
    const tag = c.name.includes("Ford") ? "FORD STRIKE RANGE" : "LINCOLN STRIKE RANGE";
    layer.add(new Graphic({
      geometry: pt(c.longitude, labelLat),
      symbol: labelSymbol(tag + " (1,100 km)", [0, 180, 216, 180], 9, 0)
    }));
  });

  // Iranian ballistic missile range — red
  layer.add(new Graphic({
    geometry: circle(51.39, 35.7, 2000),
    symbol: {
      type: "simple-fill",
      color: [214, 40, 40, 10],
      outline: { color: [214, 40, 40, 100], width: 2, style: "dash" }
    },
    attributes: { name: "Iranian Ballistic Missile Range", radius: "~2,000 km" },
    popupTemplate: {
      title: "Iranian Ballistic Missile Range (Shahab-3 / Emad)",
      content: "<b>Estimated range:</b> ~2,000 km from Tehran"
    }
  }));

  // Label at north edge of Iranian range
  const iranLabelLat = 35.7 + (2000 / 6371) * (180 / Math.PI);
  layer.add(new Graphic({
    geometry: pt(51.39, iranLabelLat),
    symbol: labelSymbol("IRAN MISSILE RANGE (2,000 km)", [255, 120, 120, 200], 9, 0, [40, 10, 10, 200])
  }));

  return layer;
}
