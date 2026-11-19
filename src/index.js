import { drawStyles, getVerticeStyle, endCircleStyle } from "./mapbox-style";
import {
  serialize,
  deserialize,
  // SwitchControl,
  CopyUrlToClipboardControl,
  getStyle,
  getBasemapFromUrl,
  setBasemapToUrl,
  clearGeometry,
} from "./url";
import { generateVertices } from "./util";
import { toggleWizard } from "./wizard";
import ExportControl from "./mbgl-export-control";
import { BasemapControl } from "./basemap-control";
import {
  DEFAULT_BASEMAP,
  getBasemapSource,
  getGazeVisibility,
} from "./basemaps";

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
  locale: {
    "NavigationControl.ZoomIn": "拡大",
    "NavigationControl.ZoomOut": "縮小",
    "NavigationControl.ResetBearing": "北を上にする",
    "GeolocateControl.FindMyLocation": "現在地を表示",
    "GeolocateControl.LocationNotAvailable": "現在地を取得できません",
  },
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
    if (map.getLayer("basemap-layer")) {
      // スタイル全体を入れ替えると線やラベルが消えるので、背景のタイルだけ差し替える
      map.removeLayer("basemap-layer");
      map.removeSource("basemap");
      map.addSource("basemap", getBasemapSource(newBasemapId));
      map.addLayer(
        { id: "basemap-layer", type: "raster", source: "basemap" },
        "gaze"
      );
      map.setLayoutProperty(
        "gaze",
        "visibility",
        getGazeVisibility(newBasemapId)
      );
    } else {
      // 初期スタイルの読み込み前
      map.setStyle(getStyle(newBasemapId));
    }

    // Update URL
    setBasemapToUrl(newBasemapId);
  },
});

map.addControl(draw, "top-right");
map.addControl(basemapControl, "top-left");
// map.addControl(switchControl);
map.addControl(exportControl);
map.addControl(copyUrlControl);

const lineButton = document.querySelector(".mapbox-gl-draw_line");
const trashButton = document.querySelector(".mapbox-gl-draw_trash");
lineButton.title = "みちのりを描く";
trashButton.title = "みちのりを削除";

const isTouchDevice = "ontouchstart" in window;
if (isTouchDevice) {
  document.getElementById("wizard-drawing").textContent =
    "タップで点を追加、✓ で完了";
}

map.on("load", async () => {
  const geojson = deserialize();

  const download = document.querySelector("button.maplibre-gl-download");
  download.addEventListener("click", () => toggleWizard("download", false));
  download.addEventListener("touchstart", () => {
    toggleWizard("download", false);
  });

  /**
   * Set vertice symbol and its distance labels
   * @param {GeoJSON | false} vertice falsy to clear
   */
  const setSymbols = (vertice) => {
    const data = vertice || { type: "FeatureCollection", features: [] };
    const source = map.getSource("app-vertice");
    if (source) {
      source.setData(data);
      return;
    }
    map.addSource("app-vertice", { type: "geojson", data });
    map.addLayer(getVerticeStyle(withElevation));
    map.addLayer(endCircleStyle);
  };

  /**
   * 残っている線に合わせて距離ラベルを作り直す。線がなければ消す
   * @return {Promise<GeoJSON.Feature | undefined>} the trail
   */
  const syncSymbols = async () => {
    const feature = draw.getAll().features[0];
    setSymbols(feature && (await generateVertices(feature.geometry)).vertice);
    return feature;
  };

  // initial draw
  if (geojson) {
    draw.set(geojson);
    await syncSymbols();
    // 共有された線が画面に収まっていなければ、収まるように動かす
    const bounds = geojson.features[0].geometry.coordinates.reduce(
      (acc, coord) => acc.extend(coord),
      new maplibregl.LngLatBounds()
    );
    const view = map.getBounds();
    if (
      !view.contains(bounds.getSouthWest()) ||
      !view.contains(bounds.getNorthEast())
    ) {
      // 傾いたままだと収まり方がずれるので真上からにする
      map.fitBounds(bounds, { padding: 60, animate: false, pitch: 0 });
    }
  } else {
    toggleWizard("trail", true, 1000);
  }

  map.on("draw.create", async (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({
      type: "FeatureCollection",
      features: [feature],
    });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("download", true, 1000);
    toggleWizard("copy", true, 1000);
    toggleWizard("download", false, 11000);
    toggleWizard("copy", false, 11000);
    serialize(feature);
    await syncSymbols();
  });

  map.on("draw.update", async (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      toggleWizard("trail", false);
      const feature = await syncSymbols();
      if (feature) {
        serialize(feature);
      }
    }
  });

  // 線を選んだら（描き終えた直後も含む）、もう一度クリックさせずに頂点の編集に入る
  map.on("draw.selectionchange", (e) => {
    if (draw.getMode() === "simple_select" && e.features.length > 0) {
      draw.changeMode("direct_select", { featureId: e.features[0].id });
    }
  });

  const onTrailDeleted = () => {
    setSymbols(false);
    clearGeometry();
    toggleWizard("copied", false);
    toggleWizard("copy", false);
    toggleWizard("download", false);
    toggleWizard("trail", true, 1000);
  };
  map.on("draw.delete", onTrailDeleted);

  // Draw 標準のゴミ箱は「線を選択中」しか効かない。
  // 選択していなくても、頂点編集モードでも、線ごと消せるようにする。
  // Draw のハンドラはボタン上で伝播を止めるうえ、先にモードを変えてしまうので、
  // 親要素のキャプチャ段階で Draw より先に受ける。
  trashButton.parentElement.addEventListener(
    "click",
    (e) => {
      if (
        !trashButton.contains(e.target) ||
        draw.getMode() === "draw_line_string" || // 描画のキャンセルは Draw に任せる
        draw.getSelectedPoints().features.length > 0 || // 頂点の削除は Draw に任せる
        draw.getAll().features.length === 0
      ) {
        return;
      }
      draw.deleteAll();
      onTrailDeleted();
    },
    true
  );

  // 描画をやめたとき（確定・Esc・ゴミ箱）にラベルを線に合わせ直す
  map.on("draw.modechange", async (e) => {
    const drawing = e.mode === "draw_line_string";
    toggleWizard("drawing", drawing);
    if (drawing) {
      toggleWizard("trail", false);
    } else if (!(await syncSymbols())) {
      toggleWizard("trail", true);
    }
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
  if (isTouchDevice) {
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

        // Add wider transparent line for better click area (RIV)
        map.addLayer({
          id: `${sourceId}-river-line-hitarea`,
          type: 'line',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            ['==', ['get', 'concise'], 'RIV']
          ],
          paint: {
            'line-color': conciseColorMap['RIV'],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 10,
              14, 15,
              18, 20
            ],
            'line-opacity': 0
          }
        });

        // Add visible line layer for RIV (rivers)
        map.addLayer({
          id: `${sourceId}-river-line`,
          type: 'line',
          source: sourceId,
          minzoom: 10,
          filter: [
            'all',
            ['in', ['geometry-type'], ['literal', ['LineString', 'MultiLineString']]],
            ['==', ['get', 'concise'], 'RIV']
          ],
          paint: {
            'line-color': conciseColorMap['RIV'],
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 1,
              14, 2,
              18, 3
            ],
            'line-opacity': 0.7
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
              10, 2,
              12, 3,
              16, 4
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
            ['==', ['get', 'concise'], 'ISL'],
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
            ['==', ['get', 'concise'], 'ISL'],
            ['!=', ['get', 'name'], 'Haida Gwaii'],
            ['!=', ['get', 'name'], 'Îles de la Reine-Charlotte'],
            ['!=', ['get', 'name'], 'Queen Charlotte Islands']
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
            'text-offset': [0, 0.3],
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
          `${sourceId}-river-line-hitarea`,
          `${sourceId}-river-line`,
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
