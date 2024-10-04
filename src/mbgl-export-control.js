import 'canvas-toBlob'
import FileSaver from 'file-saver'

const loading = `
<svg style="width: 100%; height: 100%;" width="45" height="45" viewBox="0 0 45 45" stroke="#fff">
    <g fill="none" fill-rule="evenodd" transform="translate(1 1)" stroke-width="2">
      <circle cx="22" cy="22" r="6" stroke-opacity="0">
        <animate attributeName="r" begin="1.5s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite"></animate>
        <animate attributeName="stroke-opacity" begin="1.5s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite"></animate>
        <animate attributeName="stroke-width" begin="1.5s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite"></animate>
      </circle>
      <circle cx="22" cy="22" r="6" stroke-opacity="0">
        <animate attributeName="r" begin="3s" dur="3s" values="6;22" calcMode="linear" repeatCount="indefinite"></animate>
        <animate attributeName="stroke-opacity" begin="3s" dur="3s" values="1;0" calcMode="linear" repeatCount="indefinite"></animate>
        <animate attributeName="stroke-width" begin="3s" dur="3s" values="2;0" calcMode="linear" repeatCount="indefinite"></animate>
      </circle>
      <circle cx="22" cy="22" r="8">
        <animate attributeName="r" begin="0s" dur="1.5s" values="6;1;2;3;4;5;6" calcMode="linear" repeatCount="indefinite"></animate>
      </circle>
    </g>
  </svg>
  `

const download = `
<svg height="19px" viewBox="0 0 14 19" width="14px" xmlns="http://www.w3.org/2000/svg">
    <title></title><desc></desc><defs></defs>
    <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">
      <g fill="#000000" id="Core" transform="translate(-383.000000, -213.000000)">
        <g id="file-download" transform="translate(383.000000, 213.500000)">
          <path d="M14,6 L10,6 L10,0 L4,0 L4,6 L0,6 L7,13 L14,6 L14,6 Z M0,15 L0,17 L14,17 L14,15 L0,15 L0,15 Z" id="Shape"></path>
        </g>
      </g>
    </g>
  </svg>
`

export default class ExportControl {

  static defaultOptions = {
    dpi: 300,
    callback: async (blob) => blob,
  }

  constructor(options = {}) {
    this.options = { ...ExportControl.defaultOptions, ...options }
  }

  onAdd(map) {
    this.container = document.createElement('div')
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group'

    const btn = document.createElement('button')
    btn.className = 'maplibregl-ctrl-icon maplibre-gl-download'
    btn.type = "button"
    btn.setAttribute("aria-label", "Download")
    btn.innerHTML = download

    this.container.appendChild(btn)

    btn.addEventListener('click', async () => {
      const actualPixelRatio = window.devicePixelRatio;
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => this.options.dpi / 96
      });

      const _loading = this.loading()

      const _container = document.createElement('div')
      _container.className = 'tmp-container'
      document.body.appendChild(_container)

      const width = map.getContainer().offsetWidth
      const height = map.getContainer().offsetHeight

      this.setStyles(_container, {
        visibility: "hidden",
        position: "absolute",
        top: '-9999px',
        bottom: '-9999px',
        width: `${width}px`,
        height: `${height}px`,
      })

      let fontFamily = 'Noto Sans Regular'
      if (map.style.glyphManager && map.style.glyphManager.localIdeographFontFamily) {
        fontFamily = map.style.glyphManager.localIdeographFontFamily
      }

      const copiedStyle = JSON.parse(JSON.stringify(map.getStyle()))

      const _map = new maplibregl.Map({
        container: _container,
        center: map.getCenter(),
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
        style: copiedStyle,
        localIdeographFontFamily: fontFamily,
        hash: false,
        preserveDrawingBuffer: true,
        interactive: false,
        attributionControl: false,
      })

      _map.once('load', () => {
        setTimeout(() => {          console.log(2)
          _map.getCanvas().toBlob(async (blob) => {
            if(blob) {
              console.log(4, this.options.callback)
              const transformed = await this.options.callback(blob)
              console.log(5)
              FileSaver.saveAs(transformed, `${_map.getCenter().toArray().join('-')}.png`)
            }
            _map.remove()
            if(_container.parentNode) {
              _container.parentNode.removeChild(_container)
            }
            if(_loading.parentNode) {
              _loading.parentNode.removeChild(_loading)
            }
            Object.defineProperty(window, 'devicePixelRatio', {
              get: () => actualPixelRatio
            });
        })
        }, 3000)
      })


    })

    return this.container;
  }

  onRemove() {
    if(this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }

  loading() {
    const container = document.createElement('div')
    document.body.appendChild(container)

    this.setStyles(container, {
      position: "absolute",
      top: '0',
      bottom: '0',
      width: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      zIndex: '9999',
    })

    const icon = document.createElement('div')
    icon.innerHTML = loading

    this.setStyles(icon, {
      position: "absolute",
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      zIndex: '9999',
      margin: "auto",
      width: "120px",
      height: "120px",
    })

    container.appendChild(icon)

    return container;
  }

  setStyles(element, styles) {
    for (const style in styles) {
      // @ts-ignore
      element.style[style] = styles[style]
    }
  }
}
