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

export const updateUrlFilltered = (selected) => {
  const url = new URL(window.location);
  url.searchParams.set("filtered", selected.join(","));
  history.pushState({}, "", url);
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
