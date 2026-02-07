import { drawStyles, getVerticeStyle, endCircleStyle } from "./mapbox-style";
import {
  serialize,
  deserialize,
  // SwitchControl,
  CopyUrlToClipboardControl,
  getStyle,
  getBasemapFromUrl,
  setBasemapToUrl,
} from "./url";
import { generateVertices } from "./util";
import { toggleWizard } from "./wizard";
import ExportControl from "./mbgl-export-control";
import { BasemapControl } from "./basemap-control";
import { DEFAULT_BASEMAP } from "./basemaps";

MapboxDraw.constants.classes.CONTROL_BASE  = 'maplibregl-ctrl';
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';

// Determine initial basemap: URL > localStorage > default
const urlBasemap = getBasemapFromUrl();
const storedBasemap = localStorage.getItem('preferredBasemap');
const initialBasemap = urlBasemap || storedBasemap || DEFAULT_BASEMAP;

const map = new maplibregl.Map({
  container: "map",
  center: [139.7690, 35.6804],
  zoom: 10,
  style: getStyle(initialBasemap),
  hash: true,
  localIdeographFontFamily: '"Noto Sans Regular", sans-serif',

});

const draw = new MapboxDraw({
  controls: {
    point: false,
    polygon: false,
    combine_features: false,
    uncombine_features: false,
  },
  styles: drawStyles,
});

map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.GeolocateControl());
map.addControl(new maplibregl.ScaleControl());

const exportControl = new ExportControl({
  dpi: 300,
});

let withElevation = false;
// const switchControl = new SwitchControl({
//   onClick: () => {
//     withElevation = !withElevation;
//     const verticeStyle = getVerticeStyle(withElevation);
//     if(map.getLayer(verticeStyle.id)) {
//       map.removeLayer(verticeStyle.id);
//     }
//     map.removeLayer("app-end-circle");
//     map.addLayer(verticeStyle);
//     map.addLayer(endCircleStyle);
//   },
// });
const copyUrlControl = new CopyUrlToClipboardControl({
  callback: () => {
    toggleWizard("copy", false, 0);
    toggleWizard("copied", true, 0);
    toggleWizard("copied", false, 3000);
  },
});

const basemapControl = new BasemapControl({
  initialBasemap: initialBasemap,
  onBasemapChange: (newBasemapId) => {
    const newStyle = getStyle(newBasemapId);

    // Save current draw data and vertice data
    const currentDrawData = draw.getAll();
    const hasDrawData = currentDrawData.features.length > 0;

    // Save current vertice source data if it exists
    let currentVerticeData = null;
    const verticeSource = map.getSource('app-vertice');
    if (verticeSource) {
      currentVerticeData = verticeSource._data;
    }

    // Update style
    map.setStyle(newStyle);

    // Restore data after style loads
    map.once('style.load', () => {
      // Restore draw data
      if (hasDrawData) {
        draw.set(currentDrawData);
      }

      // Restore vertice symbols
      if (currentVerticeData) {
        map.addSource('app-vertice', {
          type: 'geojson',
          data: currentVerticeData,
        });
        const verticeStyle = getVerticeStyle(withElevation);
        map.addLayer(verticeStyle);
        map.addLayer(endCircleStyle);
      }
    });

    // Update URL
    setBasemapToUrl(newBasemapId);
  },
});

map.addControl(draw, "top-right");
map.addControl(basemapControl, "top-left");
// map.addControl(switchControl);
map.addControl(exportControl);
map.addControl(copyUrlControl);

map.on("load", async () => {
  const geojson = deserialize();

  const download = document.querySelector("button.maplibre-gl-download");
  download.addEventListener("click", () => toggleWizard("download", false));
  download.addEventListener("touchstart", () => {
    toggleWizard("switch", false);
    toggleWizard("download", false);
  });

  /**
   * Set vertice symbol and its distance labels
   * @param {GeoJSON} vertice
   * @param {boolean} withElevation
   */
  const setSymbols = (vertice) => {
    const verticeStyle = getVerticeStyle(withElevation);
    if (vertice) {
      const source = map.getSource("app-vertice");
      if (source) {
        map.removeLayer(verticeStyle.id);
        map.removeLayer("app-end-circle");
        map.removeSource("app-vertice");
      }
      map.addSource("app-vertice", {
        type: "geojson",
        data: vertice,
      });
      map.addLayer(verticeStyle);
      map.addLayer(endCircleStyle);
    } else {
      map.removeLayer(verticeStyle.id);
      map.removeLayer("app-end-circle");
      map.removeSource("app-vertice");
    }
  };

  // initial draw
  if (geojson) {
    draw.set(geojson);
    const feature = geojson.features[0];
    const { vertice } = await generateVertices(feature.geometry);
    setSymbols(vertice);
  }
  toggleWizard("trail", true, 1000);

  map.on("draw.create", async (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({
      type: "FeatureCollection",
      features: [feature],
    });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("switch", true, 1000);
    toggleWizard("download", true, 1000);
    toggleWizard("copy", true, 1000);
    toggleWizard("switch", false, 11000);
    toggleWizard("download", false, 11000);
    toggleWizard("copy", false, 11000);
    const { vertice } = await generateVertices(feature.geometry);
    serialize(feature);
    setSymbols(vertice);
  });

  map.on("draw.update", async (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      toggleWizard("trail", false);
      const feature = draw.getAll().features[0];
      const { vertice } = await generateVertices(feature.geometry);
      serialize(feature);
      setSymbols(vertice);
    }
  });

  map.on("draw.delete", () => {
    setSymbols(false);
    toggleWizard("copied", false);
    toggleWizard("copy", false);
    toggleWizard("switch", false);
    toggleWizard("download", false);
    toggleWizard("trail", true, 1000);
  });

  map.on("click", async () => {
    const curentMode = draw.getMode();
    if (curentMode === "draw_line_string") {
      // get current drawing feature
      const { features } = draw.getAll();
      const feature = features[features.length - 1];
      if (feature.geometry.coordinates.length < 3) {
        return;
      } else {
        const intermediateCoordinates = feature.geometry.coordinates.slice(
          0,
          feature.geometry.coordinates.length - 1
        );
        const intermediateGeometry = {
          ...feature.geometry,
          coordinates: intermediateCoordinates,
        };
        const { vertice } = await generateVertices(intermediateGeometry);
        // serialize(feature);
        setSymbols(vertice);
      }
    }
  });

  // for touch device
  if ("ontouchstart" in window) {
    const done = document.getElementById("done");

    done.addEventListener("touchstart", () => {
      done.style.display = "none";
      draw.changeMode("simple_select");
    });
    map.on("draw.modechange", (e) => {
      if (e.mode === "draw_line_string") {
        done.style.display = "block";
      } else {
        done.style.display = "none";
      }
    });
  }

  // Load and display Haida GeoJSON files
  const haidaFiles = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '10', '11', '12', '13', '14', '15', '16', '17', '18'
  ];

  // Color mapping based on concise property (geographical feature type)
  const conciseColorMap = {
    'ISL': '#3498db',    // Island - Blue
    'MTN': '#8B4513',    // Mountain - Brown
    'BAY': '#00CED1',    // Bay - Turquoise
    'CAPE': '#FF8C00',   // Cape - Dark Orange
    'CHAN': '#1E90FF',   // Channel - Dodger Blue
    'RIV': '#4169E1',    // River - Royal Blue
    'RIVF': '#4682B4',   // River Feature - Steel Blue
    'LAKE': '#87CEEB',   // Lake - Sky Blue
    'BCH': '#F4A460',    // Beach - Sandy Brown
    'CLF': '#696969',    // Cliff - Dim Gray
    'SHL': '#FFD700',    // Shoal - Gold
    'SEAU': '#FFA500',   // Sea Feature - Orange
    'PARK': '#228B22',   // Park - Forest Green
    'VEGL': '#32CD32',   // Vegetation - Lime Green
    'UNP': '#DC143C',    // Unpopulated - Crimson
    'VILG': '#FF6347',   // Village - Tomato
    'MUN1': '#FF4500',   // Municipality - Orange Red
    'IR': '#8B008B',     // Indian Reserve - Dark Magenta
    'PROV': '#800080',   // Province - Purple
    'MIL': '#B22222',    // Military - Fire Brick
    'PLN': '#ADFF2F',    // Plain - Green Yellow
    'default': '#999999' // Default gray for unknown types
  };

  // Japanese translation for concise types
  const conciseNameMap = {
    'ISL': '島',
    'MTN': '山',
    'BAY': '湾',
    'CAPE': '岬',
    'CHAN': '水路',
    'RIV': '川',
    'RIVF': '河川地形',
    'LAKE': '湖',
    'BCH': '海岸',
    'CLF': '崖',
    'SHL': '浅瀬',
    'SEAU': '海洋地形',
    'PARK': '公園',
    'VEGL': '植生',
    'UNP': '無人地域',
    'VILG': '村',
    'MUN1': '自治体',
    'IR': '先住民居留地',
    'PROV': '州',
    'MIL': '軍事施設',
    'PLN': '平野'
  };

  // Track current popup to manage highlight correctly
  let currentHaidaPopup = null;

  const loadHaidaLayers = async () => {
    // Add source for selected polygon highlight
    if (!map.getSource('haida-selected')) {
      map.addSource('haida-selected', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add highlight layer for selected polygons
      map.addLayer({
        id: 'haida-selected-outline',
        type: 'line',
        source: 'haida-selected',
        paint: {
          'line-color': '#FFFF99',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });
    }

    // Add mountain peak icon
    const mountainPeakSvg = `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 6 L26 26 L6 26 Z" fill="${conciseColorMap['MTN']}" stroke="#fff" stroke-width="2"/>
      </svg>
    `;
    const mountainPeakImage = new Image(32, 32);
    mountainPeakImage.onload = () => {
      if (!map.hasImage('mountain-peak')) {
        map.addImage('mountain-peak', mountainPeakImage);
      }
    };
    mountainPeakImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(mountainPeakSvg);

    for (const filename of haidaFiles) {
      try {
        const response = await fetch(`/additions/haida/${filename}.geojson`);
        const geojson = await response.json();

        const sourceId = `haida-${filename}`;

        map.addSource(sourceId, {
          type: 'geojson',
          data: geojson,
          attribution: '<a href="https://natural-resources.canada.ca/maps-tools-publications/maps/geographical-names-canada/geographical-names-canada" target="_blank">Natural Resources Canada - Geographical Names of Canada</a>'
        });

        // Add mountain peak icon layer
        map.addLayer({
          id: `${sourceId}-mountain`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
            ['==', ['get', 'concise'], 'MTN']
          ],
          layout: {
            'icon-image': 'mountain-peak',
            'icon-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0.5,
              12, 0.7,
              16, 1.0
            ],
            'icon-allow-overlap': true
          }
        });

        // Add point/multipoint layer (for specific locations except mountains, bays, and channels)
        map.addLayer({
          id: `${sourceId}-circle`,
          type: 'circle',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
            ['!=', ['get', 'concise'], 'MTN'],
            ['!=', ['get', 'concise'], 'BAY'],
            ['!=', ['get', 'concise'], 'CHAN']
          ],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 4,
              12, 6,
              16, 10
            ],
            'circle-color': [
              'match',
              ['get', 'concise'],
              ...Object.entries(conciseColorMap).flatMap(([key, color]) => [key, color]),
              conciseColorMap.default
            ],
            'circle-opacity': 0.8,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
        });

        // Add labels for islands (ISL) - LineString/MultiLineString (from zoom 7, no offset)
        map.addLayer({
          id: `${sourceId}-label-line-island`,
          type: 'symbol',
          source: sourceId,
          minzoom: 7,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            ['==', ['get', 'concise'], 'ISL']
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 10,
              10, 12,
              14, 16,
              18, 20
            ],
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'viewport',
            'text-max-angle': 45,
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': conciseColorMap['ISL'],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for islands (ISL) - other geometries (from zoom 7, no offset, center anchor)
        map.addLayer({
          id: `${sourceId}-label-point-island`,
          type: 'symbol',
          source: sourceId,
          minzoom: 7,
          filter: [
            'all',
            ['!', ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]]],
            ['==', ['get', 'concise'], 'ISL']
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 10,
              10, 12,
              14, 16,
              18, 20
            ],
            'text-anchor': 'center',
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': conciseColorMap['ISL'],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for BAY, CHAN - LineString/MultiLineString (no offset)
        map.addLayer({
          id: `${sourceId}-label-line-no-circle`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            ['in', ['get', 'concise'], ['literal', ['BAY', 'CHAN']]]
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 12,
              14, 16,
              18, 20
            ],
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'viewport',
            'text-max-angle': 45,
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': [
              'match',
              ['get', 'concise'],
              ...Object.entries(conciseColorMap).flatMap(([key, color]) => [key, color]),
              conciseColorMap.default
            ],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for BAY, CHAN - other geometries (no offset, center anchor)
        map.addLayer({
          id: `${sourceId}-label-point-no-circle`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['!', ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]]],
            ['in', ['get', 'concise'], ['literal', ['BAY', 'CHAN']]]
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 12,
              14, 16,
              18, 20
            ],
            'text-anchor': 'center',
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': [
              'match',
              ['get', 'concise'],
              ...Object.entries(conciseColorMap).flatMap(([key, color]) => [key, color]),
              conciseColorMap.default
            ],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for MTN (mountain icon, no offset, center anchor)
        map.addLayer({
          id: `${sourceId}-label-mountain`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]],
            ['==', ['get', 'concise'], 'MTN']
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 12,
              14, 16,
              18, 20
            ],
            'text-anchor': 'top',
            'text-offset': [0, 0.7],
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': conciseColorMap['MTN'],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for LineString/MultiLineString (along the line) - with circles
        map.addLayer({
          id: `${sourceId}-label-line`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            ['!=', ['get', 'concise'], 'PARK'],
            ['!=', ['get', 'concise'], 'PROV'],
            ['!=', ['get', 'concise'], 'ISL'],
            ['!=', ['get', 'concise'], 'BAY'],
            ['!=', ['get', 'concise'], 'CHAN']
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 12,
              14, 16,
              18, 20
            ],
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'text-pitch-alignment': 'viewport',
            'text-max-angle': 45,
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': [
              'match',
              ['get', 'concise'],
              ...Object.entries(conciseColorMap).flatMap(([key, color]) => [key, color]),
              conciseColorMap.default
            ],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add labels for Point/MultiPoint and Polygon/MultiPolygon (with circles)
        map.addLayer({
          id: `${sourceId}-label-point`,
          type: 'symbol',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['!', ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]]],
            ['!=', ['get', 'concise'], 'PARK'],
            ['!=', ['get', 'concise'], 'PROV'],
            ['!=', ['get', 'concise'], 'ISL'],
            ['!=', ['get', 'concise'], 'BAY'],
            ['!=', ['get', 'concise'], 'CHAN'],
            ['!=', ['get', 'concise'], 'MTN']
          ],
          layout: {
            'text-field': ['get', 'name'],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 12,
              14, 16,
              18, 20
            ],
            'text-offset': [0, 0.7],
            'text-anchor': 'top',
            'text-optional': true
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': [
              'match',
              ['get', 'concise'],
              ...Object.entries(conciseColorMap).flatMap(([key, color]) => [key, color]),
              conciseColorMap.default
            ],
            'text-halo-width': 2,
            'text-halo-blur': 1
          }
        });

        // Add popup on click for all layers
        const showPopup = (e) => {
          // Remove event listener from previous popup before closing
          if (currentHaidaPopup) {
            currentHaidaPopup.off('close');
            currentHaidaPopup.remove();
          }

          const feature = e.features[0];
          const props = feature.properties;
          const conciseType = props.concise || 'N/A';
          const conciseJapanese = conciseNameMap[conciseType] || conciseType;

          // Highlight polygon if clicked
          if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            map.getSource('haida-selected').setData({
              type: 'FeatureCollection',
              features: [feature]
            });
          }

          currentHaidaPopup = new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <strong>${props.name || 'Unknown'}</strong><br/>
              種別: ${conciseJapanese} (${conciseType})<br/>
              ${props.location ? `場所: ${props.location}<br/>` : ''}
            `)
            .addTo(map);

          // Clear highlight when popup is closed
          currentHaidaPopup.on('close', () => {
            map.getSource('haida-selected').setData({
              type: 'FeatureCollection',
              features: []
            });
            currentHaidaPopup = null;
          });
        };

        // Add click events for all layers
        const layerIds = [
          `${sourceId}-mountain`,
          `${sourceId}-circle`,
          `${sourceId}-label-line`,
          `${sourceId}-label-point`,
          `${sourceId}-label-line-island`,
          `${sourceId}-label-point-island`,
          `${sourceId}-label-line-no-circle`,
          `${sourceId}-label-point-no-circle`,
          `${sourceId}-label-mountain`
        ];

        layerIds.forEach(layerId => {
          map.on('click', layerId, showPopup);
        });

        // Change cursor on hover
        const setCursorPointer = () => {
          map.getCanvas().style.cursor = 'pointer';
        };
        const setCursorDefault = () => {
          map.getCanvas().style.cursor = '';
        };

        layerIds.forEach(layerId => {
          map.on('mouseenter', layerId, setCursorPointer);
          map.on('mouseleave', layerId, setCursorDefault);
        });

      } catch (error) {
        console.warn(`Failed to load ${filename}.geojson:`, error);
      }
    }
  };

  // Load Haida layers only if haida=true query parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  const shouldLoadHaida = urlParams.get('haida') === 'true';

  if (shouldLoadHaida) {
    loadHaidaLayers();
  }
});
