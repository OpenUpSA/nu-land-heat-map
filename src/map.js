import geojson from "./data/parcels.json";
import * as heatmapGradient from "./config/heatmap-gradient.json";
import * as mapStyles from "./config/map-style.json";
import { isMobile, buildHeatMapData, filterByProperty } from "./utils.js";
import { Loader } from "@googlemaps/js-api-loader";

const urlSearch = new URLSearchParams(window.location.search);
const selected = (urlSearch.get("filtered") || "").split(",");
const loader = new Loader({
  apiKey: "AIzaSyDNhC5KPQu7govGn9bXQOF1PE3mjKTrctg",
  version: "weekly",
  libraries: ["visualization"],
});

const initMap = async () => {
  const { Map } = await google.maps.importLibrary("maps");

  let googleMap = new Map(document.getElementById("map"), {
    center: new google.maps.LatLng(-34, 18.5241),
    zoom: isMobile() ? 10 : 12,
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

  geojson["features"] = filterByProperty(geojson["features"], selected);

  let heatmapData = buildHeatMapData(geojson, urlSearch.get("byarea"));

  let heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    radius: parseInt(urlSearch.get("radius")) || 25,
    gradient: heatmapGradient,
    maxIntensity: parseInt(urlSearch.get("maxintensity")) || 75,
  });
  heatmap.setMap(googleMap);
};

loader.load().then(initMap);
