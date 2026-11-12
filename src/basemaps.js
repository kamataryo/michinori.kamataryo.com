/**
 * Basemap configuration module
 * Defines available basemaps and provides functions to generate MapLibre styles
 */

export const basemaps = {
  'gsi-photo': {
    id: 'gsi-photo',
    name: '航空写真（日本）',
    type: 'raster',
    tiles: ['https://maps.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
    tileSize: 256,
    attribution: '国土地理院 シームレス空中写真',
    maxzoom: 22,
  },
  'esri-world': {
    id: 'esri-world',
    name: 'World Imagery',
    type: 'raster',
    tiles: [
      'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    attribution:
      'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxzoom: 19,
  },
  osm: {
    id: 'osm',
    name: 'OpenStreetMap',
    type: 'raster',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
    tileSize: 256,
    attribution: '© OpenStreetMap contributors',
    maxzoom: 19,
    // タイル自体に地名が入っているので、地名レイヤーは重ねない
    hasLabels: true,
  },
}

export const DEFAULT_BASEMAP = 'gsi-photo'

/**
 * Generate MapLibre GL raster source for a given basemap
 * @param {string} basemapId - The ID of the basemap to use
 * @returns {object} MapLibre GL source specification
 */
export function getBasemapSource(basemapId) {
  const { type, tiles, tileSize, attribution, maxzoom } =
    basemaps[basemapId] || basemaps[DEFAULT_BASEMAP]
  return { type, tiles, tileSize, attribution, maxzoom }
}

/**
 * Visibility of the place name layer for a given basemap
 * @param {string} basemapId - The ID of the basemap to use
 * @returns {'visible' | 'none'}
 */
export function getGazeVisibility(basemapId) {
  return basemaps[basemapId]?.hasLabels ? 'none' : 'visible'
}

/**
 * Generate MapLibre GL style object for a given basemap
 * @param {string} basemapId - The ID of the basemap to use
 * @returns {object} MapLibre GL style specification
 */
export function getStyleForBasemap(basemapId) {
  const basemap = basemaps[basemapId] || basemaps[DEFAULT_BASEMAP]

  return {
    version: 8,
    name: `Style with ${basemap.name}`,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      basemap: getBasemapSource(basemapId),
      gaze: {
        type: 'geojson',
        data: 'https://kamataryo.github.io/gazetteer-of-japan/gaze.geojson',
      },
    },
    layers: [
      {
        id: 'basemap-layer',
        type: 'raster',
        source: 'basemap',
      },
      {
        id: 'gaze',
        type: 'symbol',
        source: 'gaze',
        minzoom: 8,
        layout: {
          visibility: getGazeVisibility(basemapId),
          'text-field': '{name}',
          'text-font': ['Noto Sans Regular'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
      },
    ],
  }
}
