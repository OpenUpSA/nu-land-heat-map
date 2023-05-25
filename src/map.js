import geojson from "./data/parcels.json";
import * as mapStyles from "./config/map-style.json";
import * as heatmapGradient from "./config/heatmap-gradient.json";
import { getScaledValue } from "./utils.js";
import { Loader } from "@googlemaps/js-api-loader";

const urlSearch = new URLSearchParams(window.location.search);
const filtered = (urlSearch.get("filtered") || "").split(",");
const loader = new Loader({
  apiKey: "AIzaSyDNhC5KPQu7govGn9bXQOF1PE3mjKTrctg",
  version: "weekly",
  libraries: ["visualization"],
});

let map;
let min = 0;
let max = 0;

geojson["features"].forEach((feature) => {
  const area = feature["properties"]["Size m2"];
  if (area > max) {
    max = area;
  }
  if (area < min) {
    min = area;
  }
});

loader.load().then(async () => {
  const { Map } = await google.maps.importLibrary("maps");

  if (filtered[0] !== "") {
    geojson["features"] = geojson["features"].filter((feature) => {
      return filtered.includes(feature["properties"]["Owner type"]);
    });
  }

  let heatmapData = [];
  geojson["features"].forEach((feature) => {
    let latlng = new google.maps.LatLng(
      feature["geometry"]["coordinates"][1],
      feature["geometry"]["coordinates"][0]
    );
    heatmapData.push({
      location: latlng,
      weight: urlSearch.get("byarea")
        ? getScaledValue(feature["properties"]["Size m2"], min, max, 0, 100)
        : 1,
      maxIntensity: 1,
    });
  });

  map = new Map(document.getElementById("map"), {
    center: new google.maps.LatLng(-34, 18.5241),
    zoom: 12,
    maxZoom: 14,
    styles: mapStyles,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    mapTypeId: google.maps.MapTypeId.TERRAIN,
  });

  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    radius: parseInt(urlSearch.get("radius")) || 25,
    gradient: heatmapGradient,
    maxIntensity: parseInt(urlSearch.get("maxintensity")) || 75,
  });
  heatmap.setMap(map);
});
