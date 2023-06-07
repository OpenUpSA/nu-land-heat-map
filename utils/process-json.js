// Converts parcels.json into relevant data for the map
"use strict";

const fs = require("fs");

let rawdata = fs.readFileSync("data/parcels.json");
let geojson = JSON.parse(rawdata);
let suburbAreas = {};

geojson["features"].forEach((feature) => {
  const name =
    feature["properties"]["Suburb"] + " " + feature["properties"]["Name"];
  if (!suburbAreas[name]) {
    suburbAreas[name] = {
      "Owner type": feature["properties"]["Owner type"],
      "Size m2": parseInt(feature["properties"]["Size m2"].replace(/,/g, "")),
      Suburb: feature["properties"]["Suburb"],
    };
  }
  console.log("Suburb area", feature);
});

let data = JSON.stringify(suburbAreas);
fs.writeFileSync("src/data/suburbareas.json", data);
