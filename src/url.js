const searchParams = new URLSearchParams(window.location.search);
const input = document.getElementById("url");

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
  input.value = window.location.href;
};

/**
 * deserialize url into GeoJSON
 * @return {GeoJSON.Feature<GeoJSON.Geometry.LineString>}
 */
export const deserialize = () => {
  input.value = window.location.href;
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

const linkIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="20px" height="20px" viewBox="0 0 84 84" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="Group-2" transform="translate(-9.000000, -8.000000)" fill="#000000" fill-rule="nonzero">
            <g id="Group" transform="translate(51.073130, 50.399487) scale(-1, 1) rotate(45.000000) translate(-51.073130, -50.399487) translate(0.073130, 30.399487)">
                <path d="M41.1538462,0 C51.9871239,0 60.7692308,8.80468294 60.7692308,19.6658098 C60.7692308,30.4183253 52.1618879,39.1553202 41.4782224,39.3289849 L41.1538462,39.3316195 L19.6153846,39.3316195 C8.78210683,39.3316195 0,30.5269366 0,19.6658098 C0,17.5361771 1.72198173,15.8097686 3.84615385,15.8097686 C5.94343771,15.8097686 7.64864877,17.4927471 7.69148263,19.5851342 L7.69230769,19.6658098 C7.69230769,26.2016526 12.924222,31.512375 19.4182147,31.6179358 L19.6153846,31.6195373 L41.1538462,31.6195373 C47.7387797,31.6195373 53.0769231,26.2676712 53.0769231,19.6658098 C53.0769231,13.129967 47.8450088,7.81924458 41.351016,7.71368372 L41.1538462,7.71208226 L19.6153846,7.71208226 C17.4912125,7.71208226 15.7692308,5.98567384 15.7692308,3.85604113 C15.7692308,1.7533658 17.4478939,0.0437711512 19.5349159,0.000827187325 L19.6153846,0 L41.1538462,0 Z" id="Rectangle" transform="translate(30.384615, 19.665810) scale(-1, -1) translate(-30.384615, -19.665810) "></path>
                <path d="M81.9230769,0 C92.7563547,0 101.538462,8.80468294 101.538462,19.6658098 C101.538462,30.4183253 92.9311186,39.1553202 82.2474532,39.3289849 L81.9230769,39.3316195 L60.3846154,39.3316195 C49.5513376,39.3316195 40.7692308,30.5269366 40.7692308,19.6658098 C40.7692308,17.5361771 42.4912125,15.8097686 44.6153846,15.8097686 C46.7126685,15.8097686 48.4178795,17.4927471 48.4607134,19.5851342 L48.4615385,19.6658098 C48.4615385,26.2016526 53.6934528,31.512375 60.1874455,31.6179358 L60.3846154,31.6195373 L81.9230769,31.6195373 C88.5080105,31.6195373 93.8461538,26.2676712 93.8461538,19.6658098 C93.8461538,13.129967 88.6142395,7.81924458 82.1202468,7.71368372 L81.9230769,7.71208226 L60.3846154,7.71208226 C58.2604433,7.71208226 56.5384615,5.98567384 56.5384615,3.85604113 C56.5384615,1.7533658 58.2171247,0.0437711512 60.3041466,0.000827187325 L60.3846154,0 L81.9230769,0 Z" id="Rectangle"></path>
            </g>
        </g>
    </g>
</svg>`;

export class CopyUrlToClipboardControl {
  constructor(options) {
    this.options = options;
  }

  onAdd() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    const button = document.createElement("button");
    button.className = "maplibregl-ctrl-icon mapbox-gl-copy-to-clipboard";
    button.style.display = "flex";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.type = "button";
    button.setAttribute("aria-label", "copy url to clipboard");
    button.innerHTML = linkIcon;
    this.container.appendChild(button);

    const onClickHandler = () => {
      input.select();
      input.setSelectionRange(0, 99999);
      document.execCommand("copy");
      input.setSelectionRange(0, 0);
      input.blur(); // expect the device hide virtual keyboard
      typeof this.options.callback === "function" && this.options.callback();
    };

    button.addEventListener("click", onClickHandler);
    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      onClickHandler(e);
    });
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
  }
}

export class SwitchControl {
  constructor(options) {
    this.options = options;
  }

  onAdd() {
    this.container = document.createElement("div");
    this.container.className = "maplibregl-ctrl maplibregl-ctrl-group";

    const button = document.createElement("button");
    button.className = "maplibregl-ctrl-icon mapbox-gl-switch-style";
    button.style.display = "flex";
    button.style.justifyContent = "center";
    button.style.alignItems = "center";
    button.type = "button";
    button.setAttribute("aria-label", "switch style");
    button.innerHTML = "EL.";
    this.container.appendChild(button);

    button.addEventListener("click", this.options.onClick);
    button.addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.options.onClick(e);
    });

    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
  }
}

export const getStyle = () => {
  return {
    "version": 8,
    "name": "GSI Japan based style",
    "glyphs": "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    "sources": {
      'gsi-photo': {
        type: 'raster',
        tiles: ['https://maps.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'],
        tileSize: 256,
        attribution: '国土地理院 シームレス空中写真',
      }
    },
    "layers": [
      {
        'id': 'gsi-photo',
        'type': 'raster',
        'source': 'gsi-photo',
        'minzoom': 0,
        'maxzoom': 22,
      }
    ]
  }
}
