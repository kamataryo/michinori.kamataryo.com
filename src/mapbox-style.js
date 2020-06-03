export const drawStyles = [
  {
    id: "gl-draw-line-inactive",
    type: "line",
    filter: [
      "all",
      ["==", "active", "false"],
      ["==", "$type", "LineString"],
      ["!=", "mode", "static"],
    ],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "rgb(255, 0, 0)",
      "line-width": 2,
    },
  },
  {
    id: "gl-draw-line-active",
    type: "line",
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#fbb03b",
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
];

export const drawLineTextStyle = {
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
};
