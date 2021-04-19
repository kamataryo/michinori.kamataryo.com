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
        properties: {
          cumulative_length: 0,
          isEnd: true,
        },
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
  const elevationItems = await getElevations(vertice);

  elevationItems.reduce((prev, elevationItem, index) => {
    if (elevationItem && elevationItem.elevation) {
      const { elevation, hsrc } = elevationItem;
      vertice.features[index].properties.elevation = elevation;
      vertice.features[index].properties.elevation_str = `${
        Math.round((typeof elevation === "number" ? elevation : 0) * 100) / 100
      }m`;
      vertice.features[index].properties.hsrc = hsrc;
      let elevation_diff_str = "";

      if (prev !== null) {
        const elevation_diff = index === 0 ? 0 : elevation - prev;
        vertice.features[index].properties.elevation_diff = elevation_diff;
        if (elevation_diff > 0) {
          elevation_diff_str = `(+${Math.round(elevation_diff * 100) / 100}m)`;
        } else if (elevation_diff < 0) {
          elevation_diff_str = `(-${
            Math.round(Math.abs(elevation_diff) * 100) / 100
          }m)`;
        }
      }
      vertice.features[
        index
      ].properties.elevation_diff_str = elevation_diff_str;
      return elevation;
    }
    return null;
  }, 0);

  return { vertice };
};

const elevationCache = {}

/**
 * request GSI and get elevations
 * @param {GeoJSON[]} verices
 * @return {{elevation: number, hsrc: string}} result
 */
export const getElevations = (vertice) => {
  return Promise.all(
    vertice.features.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const key = `${lng}/${lat}`
      if(elevationCache[key]) {
        return elevationCache[key]
      }
      return fetch(
        `https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=${lng}&lat=${lat}&outtype=JSON`
      )
        .then((res) => {
          if (res.status < 300) {
            return res.json();
          } else {
            throw res;
          }
        })
        .then(data => {
          elevationCache[key] = data
          return data
        })
        .catch((err) => {
          console.error(err);
          return false;
        });
    })
  );
};
