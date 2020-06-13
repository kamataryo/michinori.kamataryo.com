import { drawStyles, verticeStyle, endCircleStyle } from "./mapbox-style";
import { serialize, deserialize, CopyUrlToClipboardControl } from "./url";
import { generateVertice } from "./util";
import { toggleWizard } from "./wizard";
import ExportControl from "@tilecloud/mbgl-export-control";

const map = new geolonia.Map("#map");
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
  attribution: "© Geolonia © OpenStreetMap Contributors",
});

const copyUrlControl = new CopyUrlToClipboardControl({
  callback: () => {
    toggleWizard("copy", false, 0);
    toggleWizard("copied", true, 0);
    toggleWizard("copied", false, 3000);
  },
});

map.addControl(draw, "top-right");
map.addControl(exportControl);
map.addControl(copyUrlControl);

map.on("load", async () => {
  const geojson = deserialize();

  document
    .querySelector("button.mapbox-gl-download")
    .addEventListener("click", () => {
      toggleWizard("download", false);
    });

  /**
   * Set vertice symbol and its distance labels
   * @param {GeoJSON} vertice
   */
  const setSymbols = (vertice) => {
    if (vertice) {
      const source = map.getSource("app-vertice");
      if (source) {
        map.removeLayer(verticeStyle.id);
        map.removeLayer("app-end-circle");
        map.removeSource("app-vertice");
      }
      map.addSource("app-vertice", { type: "geojson", data: vertice });
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
    draw.set({ type: "FeatureCollection", features: [feature] });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("download", true, 1000);
    toggleWizard("copy", true, 1000);
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
    toggleWizard("download", false);
    toggleWizard("trail", true, 1000);
  });
});
