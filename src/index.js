import { drawStyles, verticeStyle, endCircleStyle } from "./mapbox-style";
import { serialize, deserialize } from "./url";
import { calcLength } from "./util";
import { toggleWizard, setDistance } from "./ui";
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

map.addControl(draw, "top-right");
map.addControl(exportControl);

map.on("load", async () => {
  const geojson = deserialize();

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
    const { distance, vertice } = await calcLength(feature.geometry);
    setSymbols(vertice);
    setMarker(feature);
    setDistance(distance);
  }
  toggleWizard("trail", true, 1000);

  map.on("draw.create", async (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({ type: "FeatureCollection", features: [feature] });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("copy", true, 1000);
    const { distance, vertice } = await calcLength(feature.geometry);
    serialize(feature);
    setSymbols(vertice);
    setDistance(distance);
  });

  map.on("draw.update", async (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      toggleWizard("trail", false);
      const feature = draw.getAll().features[0];
      const { distance, vertice } = await calcLength(feature.geometry);
      serialize(feature);
      setSymbols(vertice);
      setDistance(distance);
    }
  });

  map.on("draw.delete", () => {
    setSymbols(false);
    toggleWizard("copied", false);
    toggleWizard("copy", false);
    toggleWizard("trail", true, 1000);
  });
});
