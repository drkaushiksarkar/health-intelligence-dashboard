# Health Intelligence Dashboard

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-yellow?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Dashboard](https://img.shields.io/badge/Type-Intelligence%20Dashboard-blue)](https://github.com/drkaushiksarkar/health-intelligence-dashboard)
[![Geospatial](https://img.shields.io/badge/Mapping-Leaflet%20%7C%20MapBox-brightgreen)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

Real-time health intelligence platform with geospatial mapping, epidemiological trend visualisation, and alert monitoring. Built for district and national public health teams who need a single operational view of disease burden across geographic and temporal dimensions.

## Overview

The dashboard aggregates surveillance data from multiple sources and presents it as interactive maps, time-series charts, and ranked alert tables. Users can drill from national to sub-district level, filter by disease and date range, and export summary reports for situation reporting.

## Features

- **Choropleth mapping**: District-level incidence rendered on interactive maps with zoom to upazila
- **Time-series panel**: Rolling case counts, 4-week forecast bands, and outbreak threshold lines
- **Alert ticker**: Ranked list of active amber and red alerts with district, disease, and trigger date
- **Data freshness indicator**: Timestamp of last ingest per source with staleness warning
- **Export**: PNG snapshot of current map view, CSV download of filtered case table
- **Responsive layout**: Functional on tablet and desktop; optimised for government workstation browsers

## Architecture

```
Browser (Vanilla JS + CSS Grid)
  |-- Map Panel        Leaflet.js + GeoJSON district boundaries
  |-- Chart Panel      Chart.js time-series and bar charts
  |-- Alert Panel      Polling REST API every 5 min
  |-- Filter Bar       Date range, disease, admin level selectors
        |
        v
REST API (AWS API Gateway + Lambda)
        |
        v
OpenSearch  +  S3 (GeoJSON assets)
```

Static assets are deployed to S3 and served via CloudFront. No server-side rendering -- all data fetched client-side from the API layer.

## Data Sources

- DGHS weekly surveillance case counts (Bangladesh)
- BMDO climate observations (temperature, rainfall, humidity)
- OpenStreetMap district/upazila boundary GeoJSON
- EWARS Bangladesh forecast API (7/14/28-day ahead)

## Tech Stack

HTML5, CSS3 (Grid + Flexbox), JavaScript ES2020, Leaflet.js, Chart.js, AWS (S3, CloudFront, API Gateway, Lambda, OpenSearch)

## Usage

```bash
# Local development
npm install
npm run dev
# Opens on http://localhost:3000

# Production build
npm run build
aws s3 sync dist/ s3://your-dashboard-bucket --delete
```

Configure the API endpoint in `src/config.js` before deploying.
