import { drawStyles, verticeStyle } from "./mapbox-style";
import { serialize, deserialize } from "./url";
import { calcLength } from "./util";
import { toggleWizard, setDistance } from "./ui";

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

map.addControl(draw, "top-right");

map.on("load", async () => {
  const geojson = deserialize();

  let startMarker;
  let endMarker;
  const setMarker = (feature) => {
    if (startMarker) {
      startMarker.remove();
    }
    if (endMarker) {
      endMarker.remove();
    }
    if (feature) {
      startMarker = new geolonia.Marker();
      endMarker = new geolonia.Marker();
      const lastIndex = feature.geometry.coordinates.length - 1;
      startMarker.setLngLat(feature.geometry.coordinates[0]).addTo(map);
      endMarker.setLngLat(feature.geometry.coordinates[lastIndex]).addTo(map);
    }
  };

  if (geojson) {
    draw.set(geojson);
    const feature = geojson.features[0];
    const { distance, vertice } = await calcLength(feature.geometry);
    map.addSource("app-vertice", { type: "geojson", data: vertice });
    map.addLayer(verticeStyle);
    setDistance(distance);
    setMarker(feature);
  }
  toggleWizard("trail", true, 1000);

  map.on("draw.create", async (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({ type: "FeatureCollection", features: [feature] });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("copy", true, 1000);
    serialize(feature);
    const { distance, vertice } = await calcLength(feature.geometry);
    const source = map.getSource("app-vertice");
    if (source) {
      map.removeLayer(verticeStyle.id);
      map.removeSource("app-vertice");
    }
    map.addSource("app-vertice", { type: "geojson", data: vertice });
    map.addLayer(verticeStyle);
    setDistance(distance);
    setMarker(feature);
  });

  map.on("draw.update", async (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      const feature = draw.getAll().features[0];
      toggleWizard("trail", false);
      serialize(feature);
      const { distance, vertice } = await calcLength(feature.geometry);
      const source = map.getSource("app-vertice");
      if (source) {
        map.removeLayer(verticeStyle.id);
        map.removeSource("app-vertice");
      }
      map.addSource("app-vertice", { type: "geojson", data: vertice });
      map.addLayer(verticeStyle);
      setDistance(distance);
      setMarker(feature);
    }
  });

  map.on("draw.delete", () => {
    map.removeLayer(verticeStyle.id);
    map.removeSource("app-vertice");
    setMarker(false);
    toggleWizard("copied", false);
    toggleWizard("copy", false);
    toggleWizard("trail", true, 1000);
  });
});
