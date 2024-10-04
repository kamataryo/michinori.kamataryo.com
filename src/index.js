import '@geolonia/geolonia-draw/dist/mapbox-gl-draw.css';

import { drawStyles, getVerticeStyle, endCircleStyle } from "./mapbox-style";
import {
  serialize,
  deserialize,
  SwitchControl,
  CopyUrlToClipboardControl,
  getStyle,
} from "./url";
import { CommunityGeocoderControl } from "./geocoder";
import { generateVertice } from "./util";
import { toggleWizard } from "./wizard";
import ExportControl from "@geolonia/mbgl-export-control";
// import MapboxDraw from '@geolonia/geolonia-draw'

const map = new geolonia.Map({ container: "#map", style: getStyle() });
const draw = new MapboxDraw({
  controls: {
    point: false,
    polygon: false,
    combine_features: false,
    uncombine_features: false,
  },
  styles: drawStyles,
});
const exportControl = new ExportControl({
  dpi: 300,
  attribution: "© Geolonia | © OpenStreetMap",
});
let withElevation = true;
const switchControl = new SwitchControl({
  onClick: () => {
    withElevation = !withElevation;
    const verticeStyle = getVerticeStyle(withElevation);
    map.removeLayer(verticeStyle.id);
    map.removeLayer("app-end-circle");
    map.addLayer(verticeStyle);
    map.addLayer(endCircleStyle);
  },
});
const copyUrlControl = new CopyUrlToClipboardControl({
  callback: () => {
    toggleWizard("copy", false, 0);
    toggleWizard("copied", true, 0);
    toggleWizard("copied", false, 3000);
  },
});
const communityGeocoderControl = new CommunityGeocoderControl();

map.addControl(draw, "top-right");
map.addControl(switchControl);
map.addControl(exportControl);
map.addControl(copyUrlControl);
map.addControl(communityGeocoderControl, "bottom-left");

map.on("load", async () => {
  const geojson = deserialize();

  const download = document.querySelector("button.mapbox-gl-download");
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
    const { vertice } = await generateVertice(feature.geometry);
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
    const { vertice } = await generateVertice(feature.geometry);
    serialize(feature);
    setSymbols(vertice);
  });

  map.on("draw.update", async (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      toggleWizard("trail", false);
      const feature = draw.getAll().features[0];
      const { vertice } = await generateVertice(feature.geometry);
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
        const { vertice } = await generateVertice(intermediateGeometry);
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
});
