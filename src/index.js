import { drawStyles } from "./mapbox-style";
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

map.on("load", () => {
  const geojson = deserialize();
  if (geojson) {
    const distance = calcLength(geojson.features[0].geometry);
    setDistance(distance);
    draw.set(geojson);
  }
  toggleWizard("trail", true, 1000);

  map.on("draw.create", (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({ type: "FeatureCollection", features: [feature] });
    toggleWizard("trail", false);
    toggleWizard("copied", false);
    toggleWizard("copy", true, 1000);
    serialize(feature);
    const distance = calcLength(feature.geometry);
    setDistance(distance);
  });

  map.on("draw.update", (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      const feature = draw.getAll().features[0];
      toggleWizard("trail", false);
      serialize(feature);
      const distance = calcLength(feature.geometry);
      setDistance(distance);
    }
  });
});
