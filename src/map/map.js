import suburbAreasJson from "./data/suburbareas.json";
import suburbsGeoJson from "./data/suburbs.json";
import * as mapStyles from "./config/map-style.json";
import * as ownerTypes from "./config/owner-types.json";
import {
  getAvailable,
  isMobile,
  filterByProperty,
  totalSuburbAreaFromParcels,
  showModalWindow,
} from "./utils.js";
import { Loader } from "@googlemaps/js-api-loader";
import { legendControl } from "./legend-control";
import { panelControl } from "./panel-control";
import cssString from "bundle-text:./map.scss";

let style = document.createElement("style");
style.textContent = cssString;
document.head.appendChild(style);

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
  let infoWindow = new google.maps.InfoWindow({});

  google.maps.event.addListener(infoWindow, "domready", function () {
    document
      .getElementsByClassName("gm-style-iw")[0]
      .addEventListener("click", function (event) {
        event.target.closest("div.gm-style-iw-c").classList.toggle("expanded");
      });
  });

  googleMap.data.addListener("click", function (event) {
    const feature = event.feature;
  });

  googleMap.data.addListener("mouseover", (event) =>
    showModalWindow(event, googleMap, ownerTypes, infoWindow)
  );
  googleMap.data.addListener("click", (event) =>
    showModalWindow(event, googleMap, ownerTypes, infoWindow, true)
  );

  googleMap.addListener("click", function (event) {
    infoWindow.close(googleMap);
  });

  googleMap.data.addListener("mouseout", function (event) {
    googleMap.data.revertStyle();
  });

  const availableOwnerTypes = getAvailable(suburbAreasJson);

  const legendControlDiv = document.createElement("div");
  legendControlDiv.id = "legend-control";
  legendControlDiv.className = "map-control";
  legendControlDiv.index = 100;
  legendControlDiv.innerHTML = legendControl(availableOwnerTypes);
  googleMap.controls[google.maps.ControlPosition.LEFT_CENTER].push(
    legendControlDiv
  );

  const panelControlDiv = document.createElement("div");
  panelControlDiv.id = "panel-control";
  panelControlDiv.className = "map-control";
  panelControlDiv.index = 100;
  panelControlDiv.innerHTML = panelControl();
  googleMap.controls[google.maps.ControlPosition.RIGHT_CENTER].push(
    panelControlDiv
  );

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("on-click-toggle-ul")) {
      document.getElementsByClassName("toggleable")[0].classList.toggle("hide");
    }

    if (e.target.classList.contains("panel-control-heading")) {
      $(".story").parent().toggleClass("panel-toggled");
    }
  });

  document.addEventListener("change", (event) => {
    const selectedOwnerTypes = Array.from(
      document.querySelectorAll(".on-change-update-map-layer:checked")
    ).map((checkbox) => checkbox.value);
    updateMapLayer(selectedOwnerTypes);
  });

  updateMapLayer(availableOwnerTypes);
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
      fillOpacity: areaForSuburb ? 0.75 : 0,
      strokeWeight: 1,
      strokeColor: "white",
      strokeOpacity: 0.75,
      clickable: true,
      cursor: "pointer",
      title: feature.getProperty("OFC_SBRB_NAME"),
    };
  });
};

loader.load().then(initMap);
