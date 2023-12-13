export const touchDevice = () => {
  return "ontouchstart" in document.documentElement;
};
export const filterByProperty = (features, selected) => {
  let keep = {};

  for (var key in features) {
    const feature = features[key];
    if (selected.includes(feature["Owner type"])) {
      keep[key] = feature;
    }
  }

  return keep;
};

export const isMobile = () => {
  return window.innerWidth < 768;
};

export const getAvailable = (features) => {
  let available = [];
  for (var key in features) {
    const feature = features[key];
    available.push(feature["Owner type"]);
  }
  return Array.from(new Set(available)).sort();
};

export const totalSuburbAreaFromParcels = function (parcels) {
  let suburbAreas = {};
  for (var key in parcels) {
    const parcel = parcels[key];
    const suburb = parcel["Suburb"];
    const area = parcel["Size m2"];
    if (suburbAreas[suburb]) {
      suburbAreas[suburb.toLowerCase()] += area;
    } else {
      suburbAreas[suburb.toLowerCase()] = area;
    }
  }
  return suburbAreas;
};

export const pluralize = (count, noun, suffix = "s") =>
  `${count} ${noun}${count !== 1 ? suffix : ""}`;

export const showModalWindow = (
  event,
  googleMap,
  ownerTypes,
  infoWindow,
  expanded = false
) => {
  const feature = event.feature;
  const suburb = feature.getProperty("OFC_SBRB_NAME");
  const parcelCount = feature.getProperty("parcels").length;
  const totalAreaForSuburbm2 = feature.getProperty("Total Area m2");
  const totalAreaForSuburbkm2 = totalAreaForSuburbm2 / Math.pow(1000, 2);

  googleMap.data.revertStyle();
  googleMap.data.overrideStyle(feature, {
    strokeWeight: 3,
    strokeOpacity: 1,
    strokeColor: "hsla(352, 94%, 26%, 1)",
    zIndex: 1000,
  });

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
              <th class="is-text-align-right">
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
  infoWindow.setContent(content);
  infoWindow.open(googleMap);
  infoWindow.setPosition(event.latLng);

  if (expanded) {
    document.querySelector("div.gm-style-iw-c").classList.add("expanded");
  }
};

export const closeModalWindow = (infoWindow, googleMap) => {
  googleMap.data.revertStyle();
  infoWindow.close(googleMap);
};
