export class CommunityGeocoderControl {
  constructor() {
    this._input = null;
    this._map = null;
    this._search = () => {
      if (!this._input || !this._map) {
        return;
      } else {
        if (this._input.value) {
          window.getLatLng(
            this._input.value,
            (latlng) => {
              this._map.flyTo({ center: latlng });
            },
            (e) => {
              alert(e.messge);
            }
          );
        }
      }
    };
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.style.display = "flex";
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
    this._input = document.createElement("input");
    this._input.placeholder = "例: 東京都千代田区霞が関1-3-1";
    this._button = document.createElement("button");
    this._button.innerText = "検索";
    this._button.style.width = "50px";
    this._button.addEventListener("click", () => this._search());

    this._container.appendChild(this._input);
    this._container.appendChild(this._button);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
  }
}
