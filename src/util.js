/**
 * generate Points GeoJSON for each vertex of the trail
 * @param {GeoJSON.geometry} geometry
 */
export const generateVertice = async (geometry) => {
  const turf = await import("@turf/turf");
  const { coordinates } = geometry;

  const vertice = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { cumulative_length: 0, isEnd: true },
        geometry: {
          type: "Point",
          coordinates: coordinates[0],
        },
      },
    ],
  };
  let distance = 0;
  for (let index = 1; index < coordinates.length; index++) {
    const from = turf.point(coordinates[index - 1]);
    const to = turf.point(coordinates[index]);
    const length = turf.distance(from, to);
    distance += length;
    vertice.features.push({
      type: "Feature",
      properties: {
        cumulative_length: distance,
        isEnd: index === coordinates.length - 1,
      },
      geometry: {
        type: "Point",
        coordinates: coordinates[index],
      },
    });
  }
  return { vertice };
};
