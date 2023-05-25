import geojson from "./data/parcels.json";
import * as mapStyles from "./config/map-style.json";
import * as heatmapGradient from "./config/heatmap-gradient.json";
import {getScaledValue} from "./utils.js";

const urlSearch = new URLSearchParams(window.location.search);

let min = 0;
let max = 0;
geojson["features"].forEach((feature) => {
  const area = parseInt(feature["properties"]["Size m2"]);
  feature["properties"]["Size m2"] = area;
  if (area > max) {
    max = area;
  }
  if (area < min) {
    min = area;
  }
});

window.initMap = () => {
  const filtered = (urlSearch.get("filtered") || "").split(",");

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
    const scaledWeight = getScaledValue(
      feature["properties"]["Size m2"],
      min,
      max,
      0,
      100
    );
    heatmapData.push({
      location: latlng,
      weight: urlSearch.get("byarea") ? scaledWeight : 1,
      maxIntensity: 1,
    });
  });

  var center = new google.maps.LatLng(-34, 18.5241);

  window.map = new google.maps.Map(document.getElementById("map"), {
    center: center,
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
};
