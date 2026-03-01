# Middle East Military Operations

Interactive ArcGIS JavaScript API 5.0 application visualizing U.S. naval deployments, Iranian military sites, regional attack vectors, and allied base infrastructure in the Middle East as of February 2026.

## Features

- **Carrier Strike Groups** — USS Gerald R. Ford and USS Abraham Lincoln positions with strike radii
- **Missile Defense** — USS Bulkeley and USS Roosevelt Aegis destroyer positions
- **Iranian Military/Nuclear Sites** — Natanz, Isfahan, Fordow, Parchin, Bandar Abbas, and more
- **Attack Vectors** — Iranian direct strikes, Houthi anti-ship campaign, Hezbollah rockets, IRGC provocations
- **Allied Bases** — Al Udeid, Al Dhafra, NSA Bahrain, Camp Arifjan, Incirlik, RAF Akrotiri
- **Carrier Movement Routes** — Ford (Atlantic → Med) and Lincoln (Arabian Sea → Gulf)
- **Threat/Strike Radii** — F-35C combat radius and Iranian Shahab-3 ballistic missile range
- **Interactive Timeline** — Key events from April 2024 through February 2026
- **Layer Toggle Controls** — Show/hide any data layer
- **Dark military theme** — Calcite Design System dark mode

## Tech Stack

- ArcGIS Maps SDK for JavaScript 5.0
- Calcite Design System (dark mode)
- Vanilla ES modules (no build step required)

## Usage

1. Open `index.html` in a web browser, or
2. Use VS Code Live Server extension for local development

```bash
# If using a simple HTTP server
npx serve .
```

## Project Structure

```
middle-east-military-operations/
├── index.html          # App shell (Calcite layout)
├── css/
│   └── main.css        # Styles and theming
├── js/
│   ├── app.js          # Map initialization and UI wiring
│   ├── data.js         # Military deployment data
│   └── layers.js       # ArcGIS layer construction
├── assets/
│   └── carrier-icon.svg  # Custom carrier map symbol
├── .gitignore
└── README.md
```

## Data Sources

Deployment data compiled from publicly available news reports and open-source intelligence. Positions are approximate and for visualization purposes.
