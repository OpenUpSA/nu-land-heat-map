import suburbAreasJson from "./data/suburbareas.json";
import suburbsGeoJson from "./data/suburbs.json";
import * as mapStyles from "./config/map-style.json";
import * as ownerTypes from "./config/owner-types.json";
import {
  getAvailable,
  isMobile,
  filterByProperty,
  updateUrlFilltered,
  totalSuburbAreaFromParcels,
  pluralize,
} from "./utils.js";
import { Loader } from "@googlemaps/js-api-loader";
import { legendControl } from "./legend-control";
import cssString from "bundle-text:./map.scss";
let style = document.createElement("style");
style.textContent = cssString;
document.head.appendChild(style);

const urlSearch = new URLSearchParams(window.location.search);
const available = getAvailable(suburbAreasJson);
let selected = urlSearch.get("filtered")
  ? (urlSearch.get("filtered") || "").split(",")
  : available;
let googleMap;
const loader = new Loader({
  apiKey: "AIzaSyDNhC5KPQu7govGn9bXQOF1PE3mjKTrctg",
  version: "weekly",
  libraries: ["visualization"],
});

const initMap = async () => {
  const { Map } = await google.maps.importLibrary("maps");
  googleMap = new Map(document.getElementById("nulandmap"), {
    center: new google.maps.LatLng(-34, 18.5241),
    zoom: isMobile() ? 10.5 : 11.5,
    controlSize: isMobile() ? 30 : 40,
    maxZoom: 14,
    minZoom: isMobile() ? 10 : 11,
    styles: mapStyles,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
    mapTypeId: google.maps.MapTypeId.TERRAIN,
  });

  googleMap.data.addGeoJson(suburbsGeoJson);
  let infowindow = new google.maps.InfoWindow({});

  google.maps.event.addListener(infowindow, "domready", function () {
    document
      .getElementsByClassName("gm-style-iw")[0]
      .addEventListener("click", function () {
        infowindow.close(googleMap);
      });
  });

  googleMap.data.addListener("mouseover", function (event) {
    googleMap.data.revertStyle();
    googleMap.data.overrideStyle(event.feature, {
      strokeWeight: 3,
      strokeOpacity: 1,
      strokeColor: "hsla(352, 94%, 26%, 1)",
      zIndex: 1000,
    });
  });

  googleMap.data.addListener("mouseout", function (event) {
    googleMap.data.revertStyle();
  });

  googleMap.addListener("click", function (event) {
    infowindow.close(googleMap);
  });

  googleMap.data.addListener("click", function (event) {
    const feature = event.feature;
    const suburb = feature.getProperty("OFC_SBRB_NAME");
    const parcelCount = feature.getProperty("parcels").length;
    const totalAreaForSuburbm2 = feature.getProperty("Total Area m2");
    const totalAreaForSuburbkm2 = totalAreaForSuburbm2 / Math.pow(1000, 2);

    let unit = "km";
    let totalAreaForSuburb = totalAreaForSuburbkm2.toPrecision(2);
    if (totalAreaForSuburbkm2 < 1) {
      unit = "m";
      totalAreaForSuburb = totalAreaForSuburbm2.toLocaleString();
    }

    const areaByOwnerType = feature.getProperty("Size m2 by Owner type");
    const parcelsByOwnerType = feature.getProperty("Parcels by Owner type");
    let content = `
        <table>
          <thead>
            <tr>
              <th>
                ${suburb}
              </th>
              <th class="padded">
                ${
                  totalAreaForSuburb.toString().endsWith(".0")
                    ? Math.round(totalAreaForSuburb)
                    : totalAreaForSuburb
                }${unit}<sup>2</sup>
              </th>
              <th>
                <span class="tag">
                  ${pluralize(parcelCount, "parcel")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
          `;
    Object.keys(areaByOwnerType).forEach((key) => {
      unit = "km";
      let totalAreaForSuburbByOwnerType = (
        areaByOwnerType[key] / Math.pow(1000, 2)
      ).toPrecision(2);
      if (totalAreaForSuburbByOwnerType < 1) {
        unit = "m";
        totalAreaForSuburbByOwnerType = areaByOwnerType[key].toLocaleString();
      }

      content += `
            <tr>
              <td>
                <div class="owner-type">
                  <span class="fill" style="width: ${
                    (areaByOwnerType[key] / totalAreaForSuburbm2) * 100
                  }%">${ownerTypes[key]}</span>
                </div>
              </td>
              <td class="padded">
                ${totalAreaForSuburbByOwnerType}${unit}<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  ${pluralize(parcelsByOwnerType[key], "parcel")}
                </span>
              </td>
            </tr>
            `;
    });
    content += `
          </tbody>
        </table>`;
    infowindow.setContent(content);

    infowindow.setPosition(event.latLng);
    infowindow.open(googleMap);
  });

  const legendControlDiv = document.createElement("div");
  legendControlDiv.id = "legend-control";
  legendControlDiv.className = "map-control";
  legendControlDiv.index = 100;
  legendControlDiv.innerHTML = legendControl(available, selected);
  // TODO: Fix filter
  //googleMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(
  //  legendControlDiv
  //);

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("on-click-toggle-ul")) {
      document.getElementsByClassName("toggleable")[0].classList.toggle("hide");
    }
  });

  document.addEventListener("change", (event) => {
    const selected = Array.from(
      document.querySelectorAll(".on-change-update-map-layer:checked")
    ).map((checkbox) => checkbox.value);
    updateMapLayer(selected);
  });

  updateMapLayer(selected);
};

const updateMapLayer = (selected) => {
  const data = filterByProperty(suburbAreasJson, selected);
  const suburbAreas = totalSuburbAreaFromParcels(data);

  suburbsGeoJson.features.forEach((feature) => {
    const suburb = feature.properties.OFC_SBRB_NAME.replaceAll(
      " ",
      ""
    ).toLowerCase();
    const areaForSuburb = suburbAreas[suburb];
    if (areaForSuburb) {
      feature.properties["Area m2"] = areaForSuburb;
    } else {
      feature.properties["Area m2"] = null;
    }
  });

  googleMap.data.setStyle(function (feature) {
    const areaForSuburb = feature.getProperty("Area m2");
    const areaOpacity = Math.log10(areaForSuburb) / 10;
    return {
      fillColor: "hsla(352, 94%, 26%," + areaOpacity + ")",
      fillOpacity: 0.75,
      strokeWeight: 1,
      strokeColor: "white",
      strokeOpacity: 0.75,
      clickable: true,
      cursor: "pointer",
    };
  });

  updateUrlFilltered(selected);
};

loader.load().then(initMap);
