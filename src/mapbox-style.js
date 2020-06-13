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
      "line-color": "#e74230",
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
      "line-color": "#e74230",
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
];

export const verticeStyle = {
  id: "app-vertice",
  type: "symbol",
  source: "app-vertice",
  filter: ["all", ["has", "cumulative_length"]],
  paint: {
    "text-color": "#000",
    "text-halo-color": "#FFF",
    "text-halo-width": 2,
  },
  layout: {
    "text-field": "aaa",
    "text-field": [
      "concat",
      [
        "to-string",
        ["/", ["round", ["*", 100, ["get", "cumulative_length"]]], 100],
      ],
      " km",
    ],
    "text-size": 14,
    "text-font": ["Noto Sans Regular"],
    "text-offset": [0, 1],
    "text-allow-overlap": false,
  },
};

export const endCircleStyle = {
  id: "app-end-circle",
  type: "circle",
  source: "app-vertice",
  filter: ["all", ["==", "isEnd", true]],
  paint: {
    "circle-radius": 8,
    "circle-color": "#e74230",
  },
};
