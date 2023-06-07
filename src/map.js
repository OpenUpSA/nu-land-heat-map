import suburbAreasJson from "./data/suburbareas.json";
import suburbsGeoJson from "./data/suburbs.json";
import * as mapStyles from "./config/map-style.json";
import {
  getAvailable,
  isMobile,
  filterByProperty,
  updateUrlFilltered,
  totalSuburbAreaFromParcels,
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

  googleMap = new Map(document.getElementById("map"), {
    center: new google.maps.LatLng(-34, 18.5241),
    zoom: isMobile() ? 10.5 : 12,
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

  googleMap.data.addListener("click", function (event) {
    const feature = event.feature;
    const suburb = feature.getProperty("OFC_SBRB_NAME");
    const areaForSuburb = feature.getProperty("Area m2");
    infowindow.setContent(`
        <table>
          <thead>
            <tr>
              <th>
                Claremont
              </th>
              <th class="padded">
                ${148.2}km<sup>2</sup>
              </th>
              <th>
                <span class="tag">
                  27 parcels
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="owner-type">
                <span class="fill" style="width: 100%">City of Cape Town</span>
              </td>
              <td class="padded">
                21.4km<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  12 parcels
                </span>
              </td>
            </tr>
            <tr>
              <td class="owner-type">
                <span class="fill" style="width: 75%">Western Cape Government</span>
              </td>
              <td class="padded">
                11.3km<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  6 parcels
                </span>
              </td>
            </tr>
            <tr>
              <td class="owner-type">
                <span class="fill" style="width: 50%">National Goverrnment</span>
              </td>
              <td class="padded">
                4.8km<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  6 parcels
                </span>
              </td>
            </tr>
            <tr>
              <td class="owner-type">
                <span class="fill" style="width: 25%">SOEs</span>
              </td>
              <td class="padded">
                8.2km<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  2 parcels
                </span>
              </td>
            </tr>
            <tr>
              <td class="owner-type">
                <span class="fill" style="width: 5%">Multi-government</span>
              </td>
              <td class="padded">
                2.1km<sup>2</sup>
              </td>
              <td class="is-text-align-right">
                <span class="tag">
                  1 parcel
                </span>
              </td>
            </tr>
          </tbody>
        </table>
    `);
    infowindow.setPosition(event.latLng);
    infowindow.open(googleMap);
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
    let fillColor = "";
    let opacity = 0;
    let cursor = "default";
    let clickable = false;
    const areaForSuburb = feature.getProperty("Area m2");
    if (areaForSuburb) {
      clickable = true;
      cursor = "pointer";
      opacity = 0.75;
      const areaOpacity = Math.log10(areaForSuburb) / 10;
      fillColor = "hsla(352, 94%, 26%," + areaOpacity + ")";
    }
    return {
      fillColor: fillColor,
      fillOpacity: opacity,
      strokeWeight: 1,
      strokeColor: "white",
      strokeOpacity: 0.75,
      clickable: clickable,
      cursor: cursor,
    };
  });

  updateUrlFilltered(selected);
};

loader.load().then(initMap);
