import * as turf from "@turf/turf";

export const calcLength = (geometry) => {
  const { coordinates } = geometry;
  let distance = 0;
  for (let index = 1; index < coordinates.length; index++) {
    const from = turf.point(coordinates[index - 1]);
    const to = turf.point(coordinates[index]);
    distance += turf.distance(from, to);
  }
  return distance;
};
