import geojson from "./data/parcels.json";
import * as defaultHeatmapGradient from "./config/heatmap-gradient.json";
import * as mapStyles from "./config/map-style.json";
import {
  getAvailable,
  isMobile,
  buildHeatMapData,
  filterByProperty,
  updateUrlFilltered,
} from "./utils.js";
import { Loader } from "@googlemaps/js-api-loader";
import { legendControl } from "./legend-control";

const urlSearch = new URLSearchParams(window.location.search);
const available = getAvailable(geojson);
let selected = urlSearch.get("filtered")
  ? (urlSearch.get("filtered") || "").split(",")
  : available;
let googleMap, heatmap;
const loader = new Loader({
  apiKey: "AIzaSyDNhC5KPQu7govGn9bXQOF1PE3mjKTrctg",
  version: "weekly",
  libraries: ["visualization"],
});

const initMap = async () => {
  const { Map } = await google.maps.importLibrary("maps");
  const radius = parseInt(urlSearch.get("radius")) || 25;
  const maxIntensity = parseInt(urlSearch.get("maxintensity")) || 75;

  googleMap = new Map(document.getElementById("map"), {
    center: new google.maps.LatLng(-34, 18.5241),
    zoom: isMobile() ? 10.5 : 12,
    controlSize: isMobile() ? 30 : 40,
    maxZoom: 14,
    styles: mapStyles,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    mapTypeId: google.maps.MapTypeId.TERRAIN,
  });

  const legendControlDiv = document.createElement("div");
  legendControlDiv.id = "legend-control";
  legendControlDiv.className = "map-control";
  legendControlDiv.index = 100;
  legendControlDiv.innerHTML = legendControl(available, selected);
  googleMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(
    legendControlDiv
  );

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("on-click-toggle-ul")) {
      document.getElementsByClassName("toggleable")[0].classList.toggle("hide");
    }
  });

  document.addEventListener("change", (event) => {
    const selected = Array.from(
      document.querySelectorAll(".on-change-update-heatmap:checked")
    ).map((checkbox) => checkbox.value);
    addHeatmapLayer(selected, radius, maxIntensity, defaultHeatmapGradient);
  });

  addHeatmapLayer(selected, radius, maxIntensity, defaultHeatmapGradient);
};

const addHeatmapLayer = (selected, radius, maxIntensity, heatmapGradient) => {
  let data = {};
  data["features"] = filterByProperty(geojson["features"], selected);

  let heatmapData = buildHeatMapData(data, urlSearch.get("byarea"));

  if (heatmap) {
    heatmap.setMap(null);
  }
  heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    radius: radius,
    gradient: heatmapGradient,
    maxIntensity: maxIntensity,
  });
  heatmap.setMap(googleMap);
  updateUrlFilltered(selected);
};

loader.load().then(initMap);
