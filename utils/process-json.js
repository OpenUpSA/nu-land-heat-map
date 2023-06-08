// Converts parcels.json into relevant data for the map
"use strict";

const fs = require("fs");

let suburbsData = fs.readFileSync("data/suburbs.json");
let suburbsGeoJson = JSON.parse(suburbsData);

let parcelsData = fs.readFileSync("data/parcels.json");
let parcelsGeoJson = JSON.parse(parcelsData);

let keptParcels = {};
parcelsGeoJson["features"].forEach((feature) => {
  const suburbAndName =
    feature["properties"]["Suburb"] + " " + feature["properties"]["Name"];
  feature = {
    "Size m2": parseInt(feature["properties"]["Size m2"].replace(/,/g, "")),
    Suburb: feature["properties"]["Suburb"].replaceAll(" ", "").toLowerCase(),
    "Owner type": feature["properties"]["Owner type"],
  };
  keptParcels[suburbAndName] = feature;
});

const parcels = Object.values(keptParcels);

const suburbTotalArea = parcels.reduce((acc, parcel) => {
  const suburb = parcel["Suburb"];
  const area = parcel["Size m2"];
  if (acc[suburb]) {
    acc[suburb] += area;
  } else {
    acc[suburb] = area;
  }
  return acc;
}, {});
console.log("Parcels", parcels.length);

let parcelSuburbs = Array.from(
  new Set(parcels.map((parcel) => parcel["Suburb"]))
);

suburbsGeoJson["features"] = suburbsGeoJson["features"].filter((feature) => {
  const suburbName = feature["properties"]["OFC_SBRB_NAME"]
    .replaceAll(" ", "")
    .toLowerCase();

  if (parcelSuburbs.includes(suburbName)) {
    feature["properties"]["Total Area m2"] = suburbTotalArea[suburbName];
    feature["properties"]["parcels"] = parcels.filter((parcel) => {
      return parcel["Suburb"] === suburbName;
    });
    // Total Size m2 by owner type
    feature["properties"]["Size m2 by Owner type"] = parcels
      .filter((parcel) => {
        return parcel["Suburb"] === suburbName;
      })
      .reduce((acc, parcel) => {
        const ownerType = parcel["Owner type"];
        const area = parcel["Size m2"];
        if (acc[ownerType]) {
          acc[ownerType] += area;
        } else {
          acc[ownerType] = area;
        }
        return acc;
      }, {});
    // Number of parcels by owner type
    feature["properties"]["Parcels by Owner type"] = parcels

      .filter((parcel) => {
        return parcel["Suburb"] === suburbName;
      })
      .reduce((acc, parcel) => {
        const ownerType = parcel["Owner type"];
        if (acc[ownerType]) {
          acc[ownerType] += 1;
        } else {
          acc[ownerType] = 1;
        }
        return acc;
      }, {});

    return feature;
  }
});

console.log("Suburbs", suburbsGeoJson["features"].length);

fs.writeFileSync("src/data/suburbs.json", JSON.stringify(suburbsGeoJson));
