/* ================================================
   ArcGIS Layer Definitions
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

// ─── Carrier Strike Group Layer ───
export function createCarrierLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "carriers", title: "U.S. Carrier Strike Groups" });

  carriers.forEach((c) => {
    layer.add(new Graphic({
      geometry: pt(c.longitude, c.latitude),
      symbol: {
        type: "picture-marker",
        url: "assets/carrier-icon.svg",
        width: "48px",
        height: "48px"
      },
      attributes: { ...c },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.6">
            <b>Type:</b> {type}<br/>
            <b>Status:</b> {status}<br/>
            <b>Aircraft:</b> {aircraft}<br/>
            <b>Complement:</b> {complement}<br/>
            <b>Mission:</b> {mission}<br/>
            <b>Strike Radius:</b> {strikeRadius} km
          </div>`
      }
    }));
  });

  return layer;
}

// ─── Destroyer Layer ───
export function createDestroyerLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "destroyers", title: "Destroyers / Missile Defense" });

  destroyers.forEach((d) => {
    layer.add(new Graphic({
      geometry: pt(d.longitude, d.latitude),
      symbol: {
        type: "simple-marker",
        style: "diamond",
        color: [72, 202, 228, 220],
        size: 16,
        outline: { color: [255, 255, 255, 200], width: 2 }
      },
      attributes: { ...d },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.6">
            <b>Type:</b> {type}<br/>
            <b>Status:</b> {status}<br/>
            <b>Systems:</b> {systems}<br/>
            <b>Mission:</b> {mission}
          </div>`
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
    layer.add(new Graphic({
      geometry: pt(s.longitude, s.latitude),
      symbol: {
        type: "simple-marker",
        style: isNuclear ? "circle" : "square",
        color: isNuclear ? [214, 40, 40, 220] : [214, 40, 40, 160],
        size: isNuclear ? 14 : 11,
        outline: { color: [255, 200, 200, 200], width: isNuclear ? 2.5 : 1.5 }
      },
      attributes: { ...s },
      popupTemplate: {
        title: "🔴 {name}",
        content: `
          <div style="font-size:13px;line-height:1.6">
            <b>Facility Type:</b> {type}<br/>
            <b>Threat Assessment:</b> {threat}<br/>
            <b>Status:</b> {status}
          </div>`
      }
    }));
  });

  return layer;
}

// ─── Iranian Attack Vectors ───
export function createAttackLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "iran-attacks", title: "Iranian Attack Vectors" });

  iranAttacks.forEach((a) => {
    // Arrow line from → to
    layer.add(new Graphic({
      geometry: polyline([a.from, a.to]),
      symbol: {
        type: "simple-line",
        color: [247, 127, 0, 200],
        width: 2.5,
        style: "dash"
      },
      attributes: {
        name: a.name,
        type: a.type,
        detail: a.detail,
        date: a.date
      },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.6">
            <b>Type:</b> {type}<br/>
            <b>Date:</b> {date}<br/>
            <b>Details:</b> {detail}
          </div>`
      }
    }));

    // Origin marker
    layer.add(new Graphic({
      geometry: pt(a.from[0], a.from[1]),
      symbol: {
        type: "simple-marker",
        style: "triangle",
        color: [247, 127, 0, 200],
        size: 10,
        angle: 0,
        outline: { color: [255, 255, 255, 150], width: 1 }
      }
    }));

    // Impact marker
    layer.add(new Graphic({
      geometry: pt(a.to[0], a.to[1]),
      symbol: {
        type: "simple-marker",
        style: "x",
        color: [230, 57, 70, 255],
        size: 12,
        outline: { color: [230, 57, 70, 255], width: 3 }
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
        type: "simple-marker",
        style: "square",
        color: [6, 214, 160, 200],
        size: 12,
        outline: { color: [255, 255, 255, 180], width: 1.5 }
      },
      attributes: { ...b },
      popupTemplate: {
        title: "{name}",
        content: `
          <div style="font-size:13px;line-height:1.6">
            <b>Country:</b> {country}<br/>
            <b>Branch:</b> {branch}<br/>
            <b>Assets:</b> {assets}
          </div>`
      }
    }));
  });

  return layer;
}

// ─── Carrier Routes ───
export function createRoutesLayer(Graphic, GraphicsLayer) {
  const layer = new GraphicsLayer({ id: "routes", title: "Carrier Movement Routes" });

  carrierRoutes.forEach((r) => {
    layer.add(new Graphic({
      geometry: polyline(r.path),
      symbol: {
        type: "simple-line",
        color: [244, 162, 97, 180],
        width: 2,
        style: "short-dot"
      },
      attributes: { name: r.name, vessel: r.vessel },
      popupTemplate: {
        title: "{name}",
        content: "<b>Vessel:</b> {vessel}"
      }
    }));

    // Direction arrows along route
    r.path.forEach((point, i) => {
      if (i > 0 && i < r.path.length - 1) {
        layer.add(new Graphic({
          geometry: pt(point[0], point[1]),
          symbol: {
            type: "simple-marker",
            style: "triangle",
            color: [244, 162, 97, 160],
            size: 8,
            angle: calcBearing(r.path[i - 1], point),
            outline: { color: [255, 255, 255, 100], width: 0.5 }
          }
        }));
      }
    });
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
    layer.add(new Graphic({
      geometry: circle(c.longitude, c.latitude, c.strikeRadius),
      symbol: {
        type: "simple-fill",
        color: [0, 180, 216, 20],
        outline: { color: [0, 180, 216, 100], width: 1.5, style: "dash" }
      },
      attributes: { name: c.name + " — Strike Radius", radius: c.strikeRadius + " km" },
      popupTemplate: {
        title: "{name}",
        content: "<b>Combat radius:</b> {radius} (F-35C)"
      }
    }));
  });

  // Iranian ballistic missile range from Tehran (2000 km — Shahab-3 / Emad)
  layer.add(new Graphic({
    geometry: circle(51.39, 35.7, 2000),
    symbol: {
      type: "simple-fill",
      color: [214, 40, 40, 12],
      outline: { color: [214, 40, 40, 80], width: 1.5, style: "dash" }
    },
    attributes: { name: "Iranian Ballistic Missile Range (Shahab-3/Emad)", radius: "~2,000 km" },
    popupTemplate: {
      title: "{name}",
      content: "<b>Estimated range:</b> {radius}"
    }
  }));

  return layer;
}
