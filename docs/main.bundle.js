/*! For license information please see main.bundle.js.LICENSE.txt */
(()=>{var e,t,n={3554:function(){!function(e){"use strict";var t,n=e.Uint8Array,o=e.HTMLCanvasElement,i=o&&o.prototype,a=/\s*;\s*base64\s*(?:;|$)/i,r="toDataURL",l=function(e){for(var o,i,a=e.length,r=new n(a/4*3|0),l=0,s=0,c=[0,0],d=0,p=0;a--;)i=e.charCodeAt(l++),255!==(o=t[i-43])&&void 0!==o&&(c[1]=c[0],c[0]=i,p=p<<6|o,4==++d&&(r[s++]=p>>>16,61!==c[1]&&(r[s++]=p>>>8),61!==c[0]&&(r[s++]=p),d=0));return r};n&&(t=new n([62,-1,-1,-1,63,52,53,54,55,56,57,58,59,60,61,-1,-1,-1,0,-1,-1,-1,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,-1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51])),!o||i.toBlob&&i.toBlobHD||(i.toBlob||(i.toBlob=function(e,t){if(t||(t="image/png"),this.mozGetAsFile)e(this.mozGetAsFile("canvas",t));else if(this.msToBlob&&/^\s*image\/png\s*(?:$|;)/i.test(t))e(this.msToBlob());else{var o,i=Array.prototype.slice.call(arguments,1),s=this[r].apply(this,i),c=s.indexOf(","),d=s.substring(c+1),p=a.test(s.substring(0,c));Blob.fake?((o=new Blob).encoding=p?"base64":"URI",o.data=d,o.size=d.length):n&&(o=p?new Blob([l(d)],{type:t}):new Blob([decodeURIComponent(d)],{type:t})),e(o)}}),!i.toBlobHD&&i.toDataURLHD?i.toBlobHD=function(){r="toDataURLHD";var e=this.toBlob();return r="toDataURL",e}:i.toBlobHD=i.toBlob)}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content||this)},8598:function(e,t,n){var o,i=i||function(e){"use strict";if(!(void 0===e||"undefined"!=typeof navigator&&/MSIE [1-9]\./.test(navigator.userAgent))){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),i="download"in o,a=/constructor/i.test(e.HTMLElement)||e.safari,r=/CriOS\/[\d]+/.test(navigator.userAgent),l=function(t){(e.setImmediate||e.setTimeout)((function(){throw t}),0)},s=function(e){setTimeout((function(){"string"==typeof e?n().revokeObjectURL(e):e.remove()}),4e4)},c=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob([String.fromCharCode(65279),e],{type:e.type}):e},d=function(t,d,p){p||(t=c(t));var u,h=this,m="application/octet-stream"===t.type,g=function(){!function(e,t,n){for(var o=(t=[].concat(t)).length;o--;){var i=e["on"+t[o]];if("function"==typeof i)try{i.call(e,e)}catch(e){l(e)}}}(h,"writestart progress write writeend".split(" "))};if(h.readyState=h.INIT,i)return u=n().createObjectURL(t),void setTimeout((function(){var e,t;o.href=u,o.download=d,e=o,t=new MouseEvent("click"),e.dispatchEvent(t),g(),s(u),h.readyState=h.DONE}));!function(){if((r||m&&a)&&e.FileReader){var o=new FileReader;return o.onloadend=function(){var t=r?o.result:o.result.replace(/^data:[^;]*;/,"data:attachment/file;");e.open(t,"_blank")||(e.location.href=t),t=void 0,h.readyState=h.DONE,g()},o.readAsDataURL(t),void(h.readyState=h.INIT)}u||(u=n().createObjectURL(t)),m?e.location.href=u:e.open(u,"_blank")||(e.location.href=u),h.readyState=h.DONE,g(),s(u)}()},p=d.prototype;return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t,n){return t=t||e.name||"download",n||(e=c(e)),navigator.msSaveOrOpenBlob(e,t)}:(p.abort=function(){},p.readyState=p.INIT=0,p.WRITING=1,p.DONE=2,p.error=p.onwritestart=p.onprogress=p.onwrite=p.onabort=p.onerror=p.onwriteend=null,function(e,t,n){return new d(e,t||e.name||"download",n)})}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);e.exports?e.exports.saveAs=i:null!==n.amdD&&null!==n.amdO&&(void 0===(o=function(){return i}.call(t,n,t,e))||(e.exports=o))}},o={};function i(e){var t=o[e];if(void 0!==t)return t.exports;var a=o[e]={exports:{}};return n[e].call(a.exports,a,a.exports,i),a.exports}i.m=n,i.amdD=function(){throw new Error("define cannot be used indirect")},i.amdO={},i.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return i.d(t,{a:t}),t},i.d=(e,t)=>{for(var n in t)i.o(t,n)&&!i.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},i.f={},i.e=e=>Promise.all(Object.keys(i.f).reduce(((t,n)=>(i.f[n](e,t),t)),[])),i.u=e=>e+".main.bundle.js",i.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),i.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="@geolonia/michinori.geolonia.com:",i.l=(n,o,a,r)=>{if(e[n])e[n].push(o);else{var l,s;if(void 0!==a)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var p=c[d];if(p.getAttribute("src")==n||p.getAttribute("data-webpack")==t+a){l=p;break}}l||(s=!0,(l=document.createElement("script")).charset="utf-8",l.timeout=120,i.nc&&l.setAttribute("nonce",i.nc),l.setAttribute("data-webpack",t+a),l.src=n),e[n]=[o];var u=(t,o)=>{l.onerror=l.onload=null,clearTimeout(h);var i=e[n];if(delete e[n],l.parentNode&&l.parentNode.removeChild(l),i&&i.forEach((e=>e(o))),t)return t(o)},h=setTimeout(u.bind(null,void 0,{type:"timeout",target:l}),12e4);l.onerror=u.bind(null,l.onerror),l.onload=u.bind(null,l.onload),s&&document.head.appendChild(l)}},i.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;i.g.importScripts&&(e=i.g.location+"");var t=i.g.document;if(!e&&t&&(t.currentScript&&(e=t.currentScript.src),!e)){var n=t.getElementsByTagName("script");n.length&&(e=n[n.length-1].src)}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),i.p=e})(),(()=>{var e={179:0};i.f.j=(t,n)=>{var o=i.o(e,t)?e[t]:void 0;if(0!==o)if(o)n.push(o[2]);else{var a=new Promise(((n,i)=>o=e[t]=[n,i]));n.push(o[2]=a);var r=i.p+i.u(t),l=new Error;i.l(r,(n=>{if(i.o(e,t)&&(0!==(o=e[t])&&(e[t]=void 0),o)){var a=n&&("load"===n.type?"missing":n.type),r=n&&n.target&&n.target.src;l.message="Loading chunk "+t+" failed.\n("+a+": "+r+")",l.name="ChunkLoadError",l.type=a,l.request=r,o[1](l)}}),"chunk-"+t,t)}};var t=(t,n)=>{var o,a,[r,l,s]=n,c=0;for(o in l)i.o(l,o)&&(i.m[o]=l[o]);for(s&&s(i),t&&t(n);c<r.length;c++)a=r[c],i.o(e,a)&&e[a]&&e[a][0](),e[r[c]]=0},n=self.webpackChunk_geolonia_michinori_geolonia_com=self.webpackChunk_geolonia_michinori_geolonia_com||[];n.forEach(t.bind(null,0)),n.push=t.bind(null,n.push.bind(n))})(),(()=>{"use strict";const e=(e=!0)=>({id:"app-vertice",type:"symbol",source:"app-vertice",filter:["all",["has","cumulative_length"]],paint:{"text-color":"#000","text-halo-color":"#FFF","text-halo-width":2},layout:{"text-field":["format",["to-string",["/",["round",["*",100,["get","cumulative_length"]]],100]],{"font-scale":1}," km",{"font-scale":1},...e?[" (EL.",{"font-scale":.8},["get","elevation_str"],{"font-scale":.8},")",{"font-scale":.8}]:[]],"text-size":16,"text-font":["Noto Sans Regular"],"text-offset":[0,1],"text-variable-anchor":["bottom","top"],"text-allow-overlap":!1}}),t={id:"app-end-circle",type:"circle",source:"app-vertice",filter:["all",["==","isEnd",!0]],paint:{"circle-radius":8,"circle-color":"#e74230"}},n=new URLSearchParams(window.location.search),o=document.getElementById("url"),a=e=>{n.set("g",e.geometry.coordinates.map((e=>e.join(","))).join(";")),window.history.replaceState({},"",`?${n.toString()}${window.location.hash}`),o.value=window.location.href},r=async e=>{const t=await i.e(331).then(i.bind(i,7331)),{coordinates:n}=e,o={type:"FeatureCollection",features:[{type:"Feature",properties:{cumulative_length:0,isEnd:!0},geometry:{type:"Point",coordinates:n[0]}}]};let a=0;for(let e=1;e<n.length;e++){const i=t.point(n[e-1]),r=t.point(n[e]);a+=t.distance(i,r),o.features.push({type:"Feature",properties:{cumulative_length:a,isEnd:e===n.length-1},geometry:{type:"Point",coordinates:n[e]}})}return(await s(o)).reduce(((e,t,n)=>{if(t&&t.elevation){const{elevation:i,hsrc:a}=t;o.features[n].properties.elevation=i,o.features[n].properties.elevation_str=Math.round(100*("number"==typeof i?i:0))/100+"m",o.features[n].properties.hsrc=a;let r="";if(null!==e){const t=0===n?0:i-e;o.features[n].properties.elevation_diff=t,t>0?r=`(+${Math.round(100*t)/100}m)`:t<0&&(r=`(-${Math.round(100*Math.abs(t))/100}m)`)}return o.features[n].properties.elevation_diff_str=r,i}return null}),0),{vertice:o}},l={},s=e=>Promise.all(e.features.map((e=>{const[t,n]=e.geometry.coordinates,o=`${t}/${n}`;return l[o]?l[o]:fetch(`https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon=${t}&lat=${n}&outtype=JSON`).then((e=>{if(e.status<300)return e.json();throw e})).then((e=>(l[o]=e,e))).catch((e=>(console.error(e),!1)))}))),c=document.getElementById("wizard-trail"),d=document.getElementById("wizard-switch"),p=document.getElementById("wizard-download"),u=document.getElementById("wizard-copy"),h=document.getElementById("wizard-copied"),m=(e,t,n=0)=>{const o=t?"block":"none";let i=null;switch(e){case"trail":i=c;break;case"switch":i=d;break;case"download":i=p;break;case"copy":i=u;break;case"copied":i=h}i&&setTimeout((()=>i.style.display=o),n)};i(3554);var g=i(8598),f=i.n(g);const y={loading:'\n  <svg style="width: 100%; height: 100%;" width="45" height="45" viewBox="0 0 45 45" stroke="#fff">\n    <g fill="none" fill-rule="evenodd" transform="translate(1 1)" stroke-width="2">\n      <circle cx="22" cy="22" r="6" stroke-opacity="0">\n        <animate attributeName="r"\n              begin="1.5s" dur="3s"\n              values="6;22"\n              calcMode="linear"\n              repeatCount="indefinite" />\n        <animate attributeName="stroke-opacity"\n              begin="1.5s" dur="3s"\n              values="1;0" calcMode="linear"\n              repeatCount="indefinite" />\n        <animate attributeName="stroke-width"\n              begin="1.5s" dur="3s"\n              values="2;0" calcMode="linear"\n              repeatCount="indefinite" />\n      </circle>\n      <circle cx="22" cy="22" r="6" stroke-opacity="0">\n        <animate attributeName="r"\n              begin="3s" dur="3s"\n              values="6;22"\n              calcMode="linear"\n              repeatCount="indefinite" />\n        <animate attributeName="stroke-opacity"\n              begin="3s" dur="3s"\n              values="1;0" calcMode="linear"\n              repeatCount="indefinite" />\n        <animate attributeName="stroke-width"\n              begin="3s" dur="3s"\n              values="2;0" calcMode="linear"\n              repeatCount="indefinite" />\n      </circle>\n      <circle cx="22" cy="22" r="8">\n        <animate attributeName="r"\n              begin="0s" dur="1.5s"\n              values="6;1;2;3;4;5;6"\n              calcMode="linear"\n              repeatCount="indefinite" />\n      </circle>\n    </g>\n  </svg>\n  ',download:'\n  <svg height="19px" viewBox="0 0 14 19" width="14px" xmlns="http://www.w3.org/2000/svg">\n    <title/><desc/><defs/>\n    <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">\n      <g fill="#000000" id="Core" transform="translate(-383.000000, -213.000000)">\n        <g id="file-download" transform="translate(383.000000, 213.500000)">\n          <path d="M14,6 L10,6 L10,0 L4,0 L4,6 L0,6 L7,13 L14,6 L14,6 Z M0,15 L0,17 L14,17 L14,15 L0,15 L0,15 Z" id="Shape"/>\n        </g>\n      </g>\n    </g>\n  </svg>\n  '},v=new geolonia.Map({container:"#map",style:(()=>{const e="https://raw.githubusercontent.com/%s/master/style.json";let t;const n=new URLSearchParams(location.search).get("style");if(n)if(n.match(/^https:\/\//))t=n;else{const o=n.split(/\//);t=e.replace("%s",o.join("/"))}else t=e.replace("%s","geolonia/basic");return t})()}),b=new MapboxDraw({controls:{point:!1,polygon:!1,combine_features:!1,uncombine_features:!1},styles:[{id:"gl-draw-line-inactive",type:"line",filter:["all",["==","active","false"],["==","$type","LineString"],["!=","mode","static"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#e74230","line-width":2}},{id:"gl-draw-line-active",type:"line",filter:["all",["==","$type","LineString"],["==","active","true"]],layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#e74230","line-dasharray":[.2,2],"line-width":2}}]}),w=new class{constructor(e={}){this.options=Object.assign({dpi:300,attribution:"© OpenStreetMap Contributors",textFont:[]},e)}onAdd(e){this.container=document.createElement("div"),this.container.className="mapboxgl-ctrl mapboxgl-ctrl-group";const t=document.createElement("button");return t.className="mapboxgl-ctrl-icon mapbox-gl-download",t.type="button",t.setAttribute("aria-label","Download"),t.innerHTML=y.download,this.container.appendChild(t),t.addEventListener("click",(()=>{const t=window.devicePixelRatio;Object.defineProperty(window,"devicePixelRatio",{get:()=>this.options.dpi/96});const n=this.loading(),o=document.createElement("div");document.body.appendChild(o);const i=e.getContainer().offsetWidth,a=e.getContainer().offsetHeight,r=e.unproject([i,a]).toArray();this.setStyles(o,{visibility:"hidden",position:"absolute",top:0,bottom:0,width:`${i}px`,height:`${a}px`});let l,s=[];e.style.glyphManager&&e.style.glyphManager.localIdeographFontFamily&&(s=e.style.glyphManager.localIdeographFontFamily),l=void 0!==window.geolonia?window.geolonia.Map:mapboxgl.Map;const c=new l({container:o,center:e.getCenter(),zoom:e.getZoom(),bearing:e.getBearing(),pitch:e.getPitch(),style:e.getStyle(),localIdeographFontFamily:s,hash:!1,preserveDrawingBuffer:!0,interactive:!1,attributionControl:!1});c.once("load",(()=>{const i={type:"FeatureCollection",features:[{type:"Feature",geometry:{type:"Point",coordinates:r},properties:{text:this.options.attribution}}]};c.addSource("attribution-for-image",{type:"geojson",data:i});let a=[];if(this.options.textFont.length)a=this.options.textFont;else{const t=e.getStyle().layers;for(let n=0;n<t.length;n++)try{const o=e.getLayoutProperty(t[n].id,"text-font");if(o&&o.length){a=o;break}}catch(e){}}c.addLayer({id:"markers",type:"symbol",source:"attribution-for-image",paint:{"text-color":"#000000","text-halo-color":"rgba(255, 255, 255, 1)","text-halo-width":2},layout:{"text-field":"{text}","text-font":a,"text-size":18,"text-anchor":"bottom-right","text-max-width":28,"text-offset":[-.5,-.5],"text-allow-overlap":!0}}),setTimeout((()=>{c.getCanvas().toBlob((e=>{f().saveAs(e,`${c.getCenter().toArray().join("-")}.png`),c.remove(),o.parentNode.removeChild(o),n.parentNode.removeChild(n),Object.defineProperty(window,"devicePixelRatio",{get:()=>t})}))}),3e3)}))})),this.container}onRemove(){this.container.parentNode.removeChild(this.container)}loading(){const e=document.createElement("div");document.body.appendChild(e),this.setStyles(e,{position:"absolute",top:0,bottom:0,width:"100%",backgroundColor:"rgba(0, 0, 0, 0.6)",zIndex:9999});const t=document.createElement("div");return t.innerHTML=y.loading,this.setStyles(t,{position:"absolute",top:0,bottom:0,left:0,right:0,zIndex:9999,margin:"auto",width:"120px",height:"120px"}),e.appendChild(t),e}setStyles(e,t){for(const n in t)e.style[n]=t[n]}}({dpi:300,attribution:"© Geolonia | © OpenMapTiles | © OpenStreetMap"});let x=!0;const L=new class{constructor(e){this.options=e}onAdd(){this.container=document.createElement("div"),this.container.className="mapboxgl-ctrl mapboxgl-ctrl-group";const e=document.createElement("button");return e.className="mapboxgl-ctrl-icon mapbox-gl-switch-style",e.style.display="flex",e.style.justifyContent="center",e.style.alignItems="center",e.type="button",e.setAttribute("aria-label","switch style"),e.innerHTML="EL.",this.container.appendChild(e),e.addEventListener("click",this.options.onClick),e.addEventListener("touchstart",(e=>{e.preventDefault(),this.options.onClick(e)})),this.container}onRemove(){this.container.parentNode.removeChild(this.container)}}({onClick:()=>{x=!x;const n=e(x);v.removeLayer(n.id),v.removeLayer("app-end-circle"),v.addLayer(n),v.addLayer(t)}}),C=new class{constructor(e){this.options=e}onAdd(){this.container=document.createElement("div"),this.container.className="mapboxgl-ctrl mapboxgl-ctrl-group";const e=document.createElement("button");e.className="mapboxgl-ctrl-icon mapbox-gl-copy-to-clipboard",e.style.display="flex",e.style.justifyContent="center",e.style.alignItems="center",e.type="button",e.setAttribute("aria-label","copy url to clipboard"),e.innerHTML='<?xml version="1.0" encoding="UTF-8"?>\n<svg width="20px" height="20px" viewBox="0 0 84 84" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="Group-2" transform="translate(-9.000000, -8.000000)" fill="#000000" fill-rule="nonzero">\n            <g id="Group" transform="translate(51.073130, 50.399487) scale(-1, 1) rotate(45.000000) translate(-51.073130, -50.399487) translate(0.073130, 30.399487)">\n                <path d="M41.1538462,0 C51.9871239,0 60.7692308,8.80468294 60.7692308,19.6658098 C60.7692308,30.4183253 52.1618879,39.1553202 41.4782224,39.3289849 L41.1538462,39.3316195 L19.6153846,39.3316195 C8.78210683,39.3316195 0,30.5269366 0,19.6658098 C0,17.5361771 1.72198173,15.8097686 3.84615385,15.8097686 C5.94343771,15.8097686 7.64864877,17.4927471 7.69148263,19.5851342 L7.69230769,19.6658098 C7.69230769,26.2016526 12.924222,31.512375 19.4182147,31.6179358 L19.6153846,31.6195373 L41.1538462,31.6195373 C47.7387797,31.6195373 53.0769231,26.2676712 53.0769231,19.6658098 C53.0769231,13.129967 47.8450088,7.81924458 41.351016,7.71368372 L41.1538462,7.71208226 L19.6153846,7.71208226 C17.4912125,7.71208226 15.7692308,5.98567384 15.7692308,3.85604113 C15.7692308,1.7533658 17.4478939,0.0437711512 19.5349159,0.000827187325 L19.6153846,0 L41.1538462,0 Z" id="Rectangle" transform="translate(30.384615, 19.665810) scale(-1, -1) translate(-30.384615, -19.665810) "></path>\n                <path d="M81.9230769,0 C92.7563547,0 101.538462,8.80468294 101.538462,19.6658098 C101.538462,30.4183253 92.9311186,39.1553202 82.2474532,39.3289849 L81.9230769,39.3316195 L60.3846154,39.3316195 C49.5513376,39.3316195 40.7692308,30.5269366 40.7692308,19.6658098 C40.7692308,17.5361771 42.4912125,15.8097686 44.6153846,15.8097686 C46.7126685,15.8097686 48.4178795,17.4927471 48.4607134,19.5851342 L48.4615385,19.6658098 C48.4615385,26.2016526 53.6934528,31.512375 60.1874455,31.6179358 L60.3846154,31.6195373 L81.9230769,31.6195373 C88.5080105,31.6195373 93.8461538,26.2676712 93.8461538,19.6658098 C93.8461538,13.129967 88.6142395,7.81924458 82.1202468,7.71368372 L81.9230769,7.71208226 L60.3846154,7.71208226 C58.2604433,7.71208226 56.5384615,5.98567384 56.5384615,3.85604113 C56.5384615,1.7533658 58.2171247,0.0437711512 60.3041466,0.000827187325 L60.3846154,0 L81.9230769,0 Z" id="Rectangle"></path>\n            </g>\n        </g>\n    </g>\n</svg>',this.container.appendChild(e);const t=()=>{o.select(),o.setSelectionRange(0,99999),document.execCommand("copy"),o.setSelectionRange(0,0),o.blur(),"function"==typeof this.options.callback&&this.options.callback()};return e.addEventListener("click",t),e.addEventListener("touchstart",(e=>{e.preventDefault(),t()})),this.container}onRemove(){this.container.parentNode.removeChild(this.container)}}({callback:()=>{m("copy",!1,0),m("copied",!0,0),m("copied",!1,3e3)}}),_=new class{constructor(){this._input=null,this._map=null,this._search=()=>{this._input&&this._map&&this._input.value&&window.getLatLng(this._input.value,(e=>{this._map.flyTo({center:e})}),(e=>{alert(e.messge||"見つかりませんでした。もっと詳細な住所を入力してみてください。")}))}}onAdd(e){return this._map=e,this._container=document.createElement("div"),this._container.style.display="flex",this._container.className="mapboxgl-ctrl mapboxgl-ctrl-group",this._input=document.createElement("input"),this._input.placeholder="例: 東京都千代田区霞が関1-3-1",this._button=document.createElement("button"),this._button.innerText="検索",this._button.style.width="50px",this._button.addEventListener("click",(()=>this._search())),this._container.appendChild(this._input),this._container.appendChild(this._button),this._container}onRemove(){this._container.parentNode.removeChild(this._container)}};v.addControl(b,"top-right"),v.addControl(L),v.addControl(w),v.addControl(C),v.addControl(_,"bottom-left"),v.on("load",(async()=>{const i=(()=>{let e;o.value=window.location.href;const t=n.get("g");if(t){try{e=t.split(";").map((e=>e.split(",").map((e=>parseFloat(e)))))}catch(e){console.error(e)}if(e){const t={type:"LineString",coordinates:e};try{return{type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:t}]}}catch(e){return console.error(e),null}}}})(),l=document.querySelector("button.mapbox-gl-download");l.addEventListener("click",(()=>m("download",!1))),l.addEventListener("touchstart",(()=>{m("switch",!1),m("download",!1)}));const s=n=>{const o=e(x);n?(v.getSource("app-vertice")&&(v.removeLayer(o.id),v.removeLayer("app-end-circle"),v.removeSource("app-vertice")),v.addSource("app-vertice",{type:"geojson",data:n}),v.addLayer(o),v.addLayer(t)):(v.removeLayer(o.id),v.removeLayer("app-end-circle"),v.removeSource("app-vertice"))};if(i){b.set(i);const e=i.features[0],{vertice:t}=await r(e.geometry);s(t)}if(m("trail",!0,1e3),v.on("draw.create",(async e=>{const t=e.features[0];b.deleteAll(),b.set({type:"FeatureCollection",features:[t]}),m("trail",!1),m("copied",!1),m("switch",!0,1e3),m("download",!0,1e3),m("copy",!0,1e3),m("switch",!1,11e3),m("download",!1,11e3),m("copy",!1,11e3);const{vertice:n}=await r(t.geometry);a(t),s(n)})),v.on("draw.update",(async e=>{if("move"===e.action||"change_coordinates"===e.action){m("trail",!1);const e=b.getAll().features[0],{vertice:t}=await r(e.geometry);a(e),s(t)}})),v.on("draw.delete",(()=>{s(!1),m("copied",!1),m("copy",!1),m("switch",!1),m("download",!1),m("trail",!0,1e3)})),v.on("click",(async()=>{if("draw_line_string"===b.getMode()){const{features:e}=b.getAll(),t=e[e.length-1];if(t.geometry.coordinates.length<3)return;{const e=t.geometry.coordinates.slice(0,t.geometry.coordinates.length-1),n={...t.geometry,coordinates:e},{vertice:o}=await r(n);s(o)}}})),"ontouchstart"in window){const e=document.getElementById("done");e.addEventListener("touchstart",(()=>{e.style.display="none",b.changeMode("simple_select")})),v.on("draw.modechange",(t=>{"draw_line_string"===t.mode?e.style.display="block":e.style.display="none"}))}}))})()})();