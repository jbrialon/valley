# Valley

A 3D travelgram of the Langtang valley, on a real terrain map (Mapbox terrain-RGB + satellite tiles) rendered with three.js.

The previous version lives on the `backup/v1-old` branch.

## Setup

```bash
# Mapbox token
cp .env.sample .env

# Install dependencies (only the first time)
npm install

# Run the local server at localhost:5173
npm run dev

# Build for production in the dist/ directory
npm run build
```

`http://localhost:5173/#debug` shows the debug panel and stats.
