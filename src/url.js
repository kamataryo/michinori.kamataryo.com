const searchParams = new URLSearchParams(window.location.search);

/**
 * serialize feature geometry as url
 * @param {GeoJSON.Feature<GeoJSON.Geometry.LineString>} feature
 */
export const serialize = (feature) => {
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

/**
 * deserialize url into GeoJSON
 * @return {GeoJSON.Feature<GeoJSON.Geometry.LineString>}
 */
export const deserialize = () => {
  document.getElementById("url").value = window.location.href;
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
    const geometry = { type: "LineString", coordinates };
    try {
      return {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry,
          },
        ],
      };
    } catch (error) {
      console.error(error);
      return null;
    }
  }
};
