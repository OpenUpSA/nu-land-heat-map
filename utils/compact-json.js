"use strict";

const fs = require("fs");

let rawdata = fs.readFileSync("data/complete.json");
let geojson = JSON.parse(rawdata);

geojson["features"].forEach((feature) => {
  console.log("Original feature", feature);
  let lat = 0;
  let lng = 0;
  if (feature["geometry"]["type"] === "LineString") {
    lat = feature["geometry"]["coordinates"][0][1];
    lng = feature["geometry"]["coordinates"][0][0];
  } else if (feature["geometry"]["type"] === "MultiLineString") {
    lat = feature["geometry"]["coordinates"][0][0][1];
    lng = feature["geometry"]["coordinates"][0][0][0];
  }
  feature["geometry"]["type"] = "Point";
  feature["geometry"]["coordinates"] = [lng, lat];
  feature["geometry"]["Size m2"] = feature["properties"]["Size m2"].replace(/,/g, "");
  feature["properties"] = {
    "Owner type": feature["properties"]["Owner type"],
  };
  console.log("Compacted feature", feature);
});

let data = JSON.stringify(geojson);
fs.writeFileSync("src/data/parcels.json", data);
