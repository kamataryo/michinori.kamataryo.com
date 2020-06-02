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
});

map.addControl(draw, "top-right");
const searchParams = new URLSearchParams(window.location.search);

const deserialize = () => {
  let coordinates;
  const serializedValue = searchParams.get("g");
  if (!serializedValue) {
    return;
  }
  try {
    coordinates = serializedValue
      .split(";")
      .map((coord) => coord.split(",").map((num) => parseFloat(num)));
  } catch (error) {
    console.error(error);
  }
  if (coordinates) {
    try {
      draw.set({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { title: "aaa" },
            geometry: {
              type: "LineString",
              coordinates,
            },
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  }
  return coordinates;
};

const serialize = (feature) => {
  searchParams.set(
    "g",
    feature.geometry.coordinates.map((coord) => coord.join(",")).join(";")
  );
  window.history.replaceState(
    {},
    "",
    `?${searchParams.toString()}${window.location.hash}`
  );
  document.getElementById("url").value = window.location.href;
};

const calcLength = (feature) => {
  const { coordinates } = feature.geometry;
  let distance = 0;
  for (let index = 1; index < coordinates.length; index++) {
    const from = turf.point(coordinates[index - 1]);
    const to = turf.point(coordinates[index]);
    distance += turf.distance(from, to);
  }
  return distance;
};

document.getElementById("clip").addEventListener("click", () => {
  var url = document.getElementById("url");
  url.select();
  url.setSelectionRange(0, 99999);
  document.execCommand("copy");
  url.setSelectionRange(0, 0);
});

map.on("load", () => {
  let lastCreated;
  deserialize();
  document.getElementById("url").value = window.location.href;
  setTimeout(() => {
    document.getElementById("wizard1").style.display = "block";
    document.getElementById("wizard2").style.display = "block";
  }, 1000);

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
    const distance = calcLength(feature);
    feature.properties.distance = distance;
    serialize(feature);
    setTimeout(() => {
      const wizard = document.getElementById("wizard2");
      wizard.style.display = "block";
    }, 500);
    console.log(distance);

    lastCreated = feature.id;
    const { features } = draw.getAll();
    for (const feature of features) {
      if (feature.id !== lastCreated) {
        draw.delete(feature.id);
      }
    }
  });

  map.on("draw.update", (e) => {
    if (e.action === "move" || e.action === "change_coordinates") {
      const feature = draw.getAll().features[0];
      const distance = calcLength(feature);
      feature.properties.distance = distance;
      serialize(feature);
    }
  });
});
