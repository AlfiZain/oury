import { map, tileLayer, Icon, icon, marker, popup, latLng } from "leaflet";
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import CONFIG from "../config.js";

export default class Map {
  #zoom = 5;
  #map = null;

  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);
      url.searchParams.set("key", CONFIG.MAP_SERVICE_API_KEY);
      url.searchParams.set("language", "id");
      url.searchParams.set("limit", 1);

      const response = await fetch(url);
      const json = await response.json();

      const place = json.features[0].place_name.split(", ");
      return [place.at(-2), place.at(-1)].map((name) => name).join(", ");
    } catch (error) {
      console.error("getPlaceNameByCoordinate: error:", error);
      return `${latitude}, ${longitude}`;
    }
  }

  static isGeolocationAvailable() {
    return "geolocation" in navigator;
  }

  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      if (!Map.isGeolocationAvailable()) {
        reject("Geolocation API unsupported");
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Reference of using this static method:
   * https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   * */
  static async build(selector, options = {}) {
    if ("center" in options && options.center) {
      return new Map(selector, options);
    }

    const jakartaCoordinate = [-6.2, 106.816666];

    //   Using Geolocation API
    if ("locate" in options && options.locate) {
      try {
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        console.error("build: error", error);

        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  constructor(selector, options = {}) {
    this.#zoom = options.zoom ?? this.#zoom;

    // Set base map using osm
    const tileOsm = tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    // Add MapTiler layer
    const mtLayer = new MaptilerLayer({
      apiKey: "bEpqjzY2qeum9ZgwOsEq",
      style: "https://api.maptiler.com/maps/01966de6-050e-7d12-a285-558336df4a7f/style.json?key=dXv46U3o5msf2wGU2u2o",
    });

    // Create a new map
    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      ...options,
    });

    const baseMaps = {
      OpenStreetMap: tileOsm,
      "Jakarta's Popular Places": mtLayer,
    };

    // Add layer control
    const layerControl = L.control.layers(baseMaps);
    layerControl.addTo(this.#map);
  }

  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }

    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  // Create custome icon
  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  // Create marker or popup
  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    if (typeof markerOptions !== "object") {
      throw new Error("markerOptions must be an object");
    }

    // Create a new marker
    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    // Create a new popup if there is popupOptions
    if (popupOptions) {
      if (typeof popupOptions !== "object") {
        throw new Error("popupOptions must be an object");
      }

      if (!("content" in popupOptions)) {
        throw new Error("popupOptions must include `content` property");
      }

      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }

    newMarker.addTo(this.#map);

    return newMarker;
  }

  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
