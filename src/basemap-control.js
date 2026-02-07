/**
 * Basemap Control for MapLibre GL
 * A custom control that allows users to switch between different basemaps
 */

import { basemaps, DEFAULT_BASEMAP } from './basemaps.js'

export class BasemapControl {
  /**
   * Create a new BasemapControl
   * @param {object} options - Configuration options
   * @param {string} options.initialBasemap - The initial basemap ID to display
   * @param {function} options.onBasemapChange - Callback function when basemap changes
   */
  constructor(options = {}) {
    this._map = null
    this._container = null
    this._currentBasemap = options.initialBasemap || DEFAULT_BASEMAP
    this._onBasemapChange = options.onBasemapChange || (() => {})
  }

  /**
   * Called when the control is added to the map
   * @param {maplibregl.Map} map - The MapLibre GL map instance
   * @returns {HTMLElement} The control container element
   */
  onAdd(map) {
    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    const select = document.createElement('select')
    select.className = 'basemap-select'
    select.title = 'ベースマップを選択'

    Object.values(basemaps).forEach((basemap) => {
      const option = document.createElement('option')
      option.value = basemap.id
      option.textContent = basemap.name
      option.selected = basemap.id === this._currentBasemap
      select.appendChild(option)
    })

    select.addEventListener('change', (e) => {
      const newBasemapId = e.target.value
      this._currentBasemap = newBasemapId

      this._onBasemapChange(newBasemapId)

      localStorage.setItem('preferredBasemap', newBasemapId)
    })

    this._container.appendChild(select)
    return this._container
  }

  /**
   * Called when the control is removed from the map
   */
  onRemove() {
    this._container.parentNode.removeChild(this._container)
    this._map = null
  }

  /**
   * Get the currently selected basemap ID
   * @returns {string} The current basemap ID
   */
  getCurrentBasemap() {
    return this._currentBasemap
  }
}
