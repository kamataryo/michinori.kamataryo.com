import { drawStyles, drawLineTextStyle } from "./mapbox-style";
import { serialize, deserialize } from "./url";
// import { calcLength } from "./util";
import { toggleWizard } from "./wizard-ui";

const map = new geolonia.Map({
  container: document.getElementById("map"),
  hash: true,
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
// map.addLayer(drawLineTextStyle);

map.addControl(draw, "top-right");

map.on("load", () => {
  const geojson = deserialize();
  geojson && draw.set(geojson);
  toggleWizard("trail", true, 1000);

  map.on("draw.create", (e) => {
    const feature = e.features[0];
    draw.deleteAll();
    draw.set({ type: "FeatureCollection", features: [feature] });
    toggleWizard("trail", false);
    toggleWizard("copy", true, 1000);
    serialize(feature);
  });

  map.on("draw.update", (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      const feature = draw.getAll().features[0];
      toggleWizard("trail", false);
      serialize(feature);
    }
  });
});
