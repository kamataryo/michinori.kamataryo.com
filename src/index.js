import { drawStyles } from "./mapbox-style";
import { serialize, deserialize } from "./url";
import { calcLength } from "./util";

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

map.addControl(draw, "top-right");

document.getElementById("clip").addEventListener("click", () => {
  var url = document.getElementById("url");
  url.select();
  url.setSelectionRange(0, 99999);
  document.execCommand("copy");
  url.setSelectionRange(0, 0);
});

map.on("load", () => {
  const geojson = deserialize();
  geojson && draw.set(geojson);

  setTimeout(() => {
    document.getElementById("wizard1").style.display = "block";
    document.getElementById("wizard2").style.display = "block";
  }, 1000);

  // line text
  map.addLayer({
    id: "symbols",
    type: "symbol",
    source: "mapbox-gl-draw-cold",
    filter: ["all", ["has", "distance"], ["all", ["has", "unit"]]],
    layout: {
      "symbol-placement": "line",
      "text-font": ["Noto Sans Regular"],
      "text-field": "a{distance}{unit}b",
      "text-size": 16,
    },
    paint: {},
  });

  // map.on("click", (e) => {
  //   if (draw.getMode() === "draw_line_string") {
  //     const wizard = document.getElementById("wizard1");
  //     wizard && wizard.remove();
  //   }
  // });

  // map.on("draw.selectionchange", (e) => {
  //   const wizard = document.getElementById("wizard1");
  //   wizard && wizard.remove();
  // });

  map.on("draw.create", (e) => {
    const feature = e.features[0];
    const distance = calcLength(feature.geometry);
    feature.properties = {
      distance: distance.toString(),
      unit: "km",
    };
    draw.deleteAll();
    draw.set({
      type: "FeatureCollection",
      features: [feature],
    });
    // draw.setFeatureProperties(feature.id, "distance", distance);
    // draw.setFeatureProperties(feature.id, "unit", "km");
    serialize(feature);
  });

  map.on("draw.update", (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      const feature = draw.getAll().features[0];
      const distance = calcLength(feature.geometry);
      feature.properties.distance = distance;
      serialize(feature);
    }
  });
});
