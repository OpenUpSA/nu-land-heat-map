import geojson from "./data/parcels.json";
import * as mapStyles from "./config/map-style.json";

const urlSearch = new URLSearchParams(window.location.search);

const getScaledValue = (
  value,
  sourceRangeMin,
  sourceRangeMax,
  targetRangeMin,
  targetRangeMax
) => {
  var targetRange = targetRangeMax - targetRangeMin;
  var sourceRange = sourceRangeMax - sourceRangeMin;
  return (
    ((value - sourceRangeMin) * targetRange) / sourceRange + targetRangeMin
  );
};

// Determine the Size m2 range and scale the heatmap accordingly
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
    gradient: [
      "rgba(0, 255, 255, 0)",
      "rgba(0, 255, 255, 1)",
      "rgba(0, 191, 255, 1)",
      "rgba(0, 127, 255, 1)",
      "rgba(0, 63, 255, 1)",
      "rgba(0, 0, 255, 1)",
      "rgba(0, 0, 223, 1)",
      "rgba(0, 0, 191, 1)",
      "rgba(0, 0, 159, 1)",
      "rgba(0, 0, 127, 1)",
      "rgba(63, 0, 91, 1)",
      "rgba(127, 0, 63, 1)",
      "rgba(191, 0, 31, 1)",
      "rgba(255, 0, 0, 1)",
    ],
    maxIntensity: parseInt(urlSearch.get("maxintensity")) || 75,
  });
  heatmap.setMap(map);
};
