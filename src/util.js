export const calcLength = async (geometry) => {
  const turf = await import("@turf/turf");
  const { coordinates } = geometry;
  let distance = 0;
  for (let index = 1; index < coordinates.length; index++) {
    const from = turf.point(coordinates[index - 1]);
    const to = turf.point(coordinates[index]);
    distance += turf.distance(from, to);
  }
  return distance;
};
