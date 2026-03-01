/* ================================================
   Military Deployment Data — February 2026
   ================================================ */

// ─── U.S. Carrier Strike Groups ───
export const carriers = [
  {
    name: "USS Gerald R. Ford (CVN-78)",
    type: "Nimitz-class Supercarrier",
    longitude: 33.5,
    latitude: 33.8,
    status: "Transiting Eastern Mediterranean → Suez",
    aircraft: "F-35C Lightning II, F/A-18E/F Super Hornet, EA-18G Growler, E-2D Hawkeye",
    complement: "~4,500 crew + Air Wing",
    mission: "Power projection, strike capability against Iranian targets, support to Israel",
    strikeRadius: 1100 // km — combat radius of F-35C
  },
  {
    name: "USS Abraham Lincoln (CVN-72)",
    type: "Nimitz-class Supercarrier",
    longitude: 52.5,
    latitude: 25.8,
    status: "Stationed in Persian Gulf — 'Mobile Fortress'",
    aircraft: "F-35C Lightning II, F/A-18E/F Super Hornet, EA-18G Growler, E-2D Hawkeye",
    complement: "~4,500 crew + Air Wing",
    mission: "Direct deterrence of Iran, strike range to nuclear facilities (Natanz, Isfahan, Fordow)",
    strikeRadius: 1100
  }
];

// ─── U.S. Destroyers (Missile Defense) ───
export const destroyers = [
  {
    name: "USS Bulkeley (DDG-84)",
    type: "Arleigh Burke-class Destroyer",
    longitude: 34.2,
    latitude: 34.5,
    status: "Eastern Mediterranean — Missile Defense Station",
    systems: "Aegis Combat System, SM-3 / SM-6 interceptors, Tomahawk cruise missiles",
    mission: "Ballistic missile defense shield for Israel, Aegis-Iron Dome integration"
  },
  {
    name: "USS Roosevelt (DDG-80)",
    type: "Arleigh Burke-class Destroyer",
    longitude: 33.0,
    latitude: 34.0,
    status: "Eastern Mediterranean — Anti-Ballistic Missile Watch",
    systems: "Aegis Combat System, SM-3 / SM-6 interceptors, THAAD radar coordination",
    mission: "Integrated air & missile defense, THAAD-capable radar coordination with Israeli systems"
  }
];

// ─── Iranian Military / Nuclear Sites ───
export const iranSites = [
  {
    name: "Natanz Nuclear Facility",
    type: "Uranium Enrichment (Underground)",
    longitude: 51.727,
    latitude: 33.724,
    threat: "Primary enrichment site — thousands of centrifuges, deeply buried",
    status: "Active — enrichment at 60%+ purity"
  },
  {
    name: "Isfahan Nuclear Complex",
    type: "Uranium Conversion Facility",
    longitude: 51.668,
    latitude: 32.652,
    threat: "Converts yellowcake to UF6 for enrichment pipeline",
    status: "Active — key supply node"
  },
  {
    name: "Fordow Fuel Enrichment Plant",
    type: "Underground Enrichment (Hardened)",
    longitude: 51.0,
    latitude: 34.88,
    threat: "Built inside mountain — extremely hardened, near-weapons-grade enrichment",
    status: "Active — hardened bunker facility"
  },
  {
    name: "Bushehr Nuclear Power Plant",
    type: "Nuclear Power Reactor",
    longitude: 50.884,
    latitude: 28.831,
    threat: "Russian-built reactor — civilian but dual-use concerns",
    status: "Operational"
  },
  {
    name: "Parchin Military Complex",
    type: "Weapons Research / Testing",
    longitude: 51.77,
    latitude: 35.52,
    threat: "Suspected weapons research, explosive testing chambers",
    status: "Restricted access — IAEA disputes"
  },
  {
    name: "Bandar Abbas Naval Base",
    type: "IRIN / IRGC Navy HQ",
    longitude: 56.27,
    latitude: 27.18,
    threat: "Fast-attack craft, midget submarines, anti-ship missiles",
    status: "Active — Strait of Hormuz operations"
  },
  {
    name: "IRGC Aerospace Force HQ — Tehran",
    type: "Ballistic Missile Command",
    longitude: 51.39,
    latitude: 35.7,
    threat: "Shahab-3, Emad, Sejjil ballistic missiles — range 2000+ km",
    status: "Active — launch authority"
  },
  {
    name: "Kharg Island Oil Terminal",
    type: "Strategic Oil Export Hub",
    longitude: 50.32,
    latitude: 29.23,
    threat: "90% of Iranian oil exports — economic pressure point",
    status: "Critical infrastructure"
  }
];

// ─── Iranian Attack Vectors (recent strikes / proxy actions) ───
export const iranAttacks = [
  {
    name: "Operation True Promise — Apr 2024",
    from: [51.39, 35.7],    // Tehran
    to: [35.21, 31.77],     // Israel
    type: "Direct Strike",
    detail: "300+ drones, cruise missiles & ballistic missiles launched at Israel. Mostly intercepted by Iron Dome, Arrow, and coalition forces.",
    date: "April 13-14, 2024"
  },
  {
    name: "Ballistic Missile Salvo — Oct 2024",
    from: [51.39, 35.7],
    to: [34.78, 32.08],     // Central Israel
    type: "Ballistic Missile",
    detail: "Salvo of ballistic missiles targeting Israeli military installations. Partial interception.",
    date: "October 2024"
  },
  {
    name: "Houthi Anti-Ship Campaign (Red Sea)",
    from: [44.2, 15.35],    // Yemen / Hodeidah
    to: [42.5, 13.0],       // Bab el-Mandeb strait
    type: "Proxy — Anti-Ship",
    detail: "Iran-backed Houthis launch anti-ship missiles & drones at commercial vessels transiting Red Sea / Bab el-Mandeb. Ongoing since late 2023.",
    date: "2023-2026 (ongoing)"
  },
  {
    name: "Hezbollah Rocket Barrages (Lebanon → Israel)",
    from: [35.5, 33.27],    // Southern Lebanon
    to: [35.53, 32.95],     // Northern Israel
    type: "Proxy — Rockets",
    detail: "Hezbollah launches thousands of rockets and precision-guided munitions into northern Israel. Escalated significantly after Oct 2023.",
    date: "2023-2026 (ongoing)"
  },
  {
    name: "IRGC Fast-Boat Swarms (Strait of Hormuz)",
    from: [56.27, 27.18],   // Bandar Abbas
    to: [56.4, 26.6],       // Strait of Hormuz
    type: "Naval Provocation",
    detail: "IRGC Navy fast-attack boats conduct aggressive close-approach maneuvers against U.S. warships and commercial tankers.",
    date: "Feb 2026"
  },
  {
    name: "Iraqi Militia Drone Attacks (Iran-backed)",
    from: [44.36, 33.31],   // Baghdad area
    to: [47.0, 29.5],       // Kuwait / U.S. bases
    type: "Proxy — Drones",
    detail: "Iran-backed Iraqi militias launch one-way attack drones at U.S. bases in Iraq and Kuwait.",
    date: "2024-2026"
  }
];

// ─── U.S. / Allied Bases in Region ───
export const alliedBases = [
  {
    name: "Al Udeid Air Base",
    country: "Qatar",
    longitude: 51.315,
    latitude: 25.117,
    branch: "USAF / CENTCOM Forward HQ",
    assets: "F-15E, F-22, KC-135, MQ-9, C2 infrastructure"
  },
  {
    name: "Al Dhafra Air Base",
    country: "UAE",
    longitude: 54.547,
    latitude: 24.248,
    branch: "USAF",
    assets: "F-22 Raptor, RQ-4 Global Hawk, KC-10, F-35A"
  },
  {
    name: "Naval Support Activity Bahrain",
    country: "Bahrain",
    longitude: 50.604,
    latitude: 26.236,
    branch: "U.S. Navy 5th Fleet HQ",
    assets: "Coastal patrol, mine countermeasures, fleet logistics"
  },
  {
    name: "Camp Arifjan",
    country: "Kuwait",
    longitude: 48.1,
    latitude: 29.05,
    branch: "U.S. Army Central",
    assets: "Ground force staging, logistics hub, Patriot batteries"
  },
  {
    name: "Incirlik Air Base",
    country: "Turkey",
    longitude: 35.425,
    latitude: 37.002,
    branch: "USAF / NATO",
    assets: "F-16, tankers, ISR platforms, nuclear-capable"
  },
  {
    name: "RAF Akrotiri",
    country: "Cyprus (UK)",
    longitude: 32.988,
    latitude: 34.584,
    branch: "Royal Air Force / Coalition",
    assets: "Typhoon, Voyager tankers, ISR, special forces staging"
  }
];

// ─── Carrier Movement Routes (polylines) ───
export const carrierRoutes = [
  {
    name: "USS Ford — Atlantic → Eastern Med",
    vessel: "CVN-78",
    path: [
      [-5.6, 36.0],   // Gibraltar
      [3.0, 37.5],     // Western Med
      [15.0, 36.5],    // Central Med
      [25.0, 34.5],    // Crete
      [33.5, 33.8]     // Current position
    ]
  },
  {
    name: "USS Lincoln — Arabian Sea → Persian Gulf",
    vessel: "CVN-72",
    path: [
      [60.0, 22.0],    // Arabian Sea
      [58.5, 23.5],    // Gulf of Oman approach
      [56.5, 26.0],    // Strait of Hormuz
      [52.5, 25.8]     // Current position — Persian Gulf
    ]
  }
];
