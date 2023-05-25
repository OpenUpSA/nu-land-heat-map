export const getScaledValue = (
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

export const getMinMax = (features) => {
  let min = 0;
  let max = 0;
  features.forEach((feature) => {
    const area = feature["properties"]["Size m2"];
    if (area > max) {
      max = area;
    }
    if (area < min) {
      min = area;
    }
  });
  return [min, max];
};

export const filterByProperty = (features, selected) => {
  return features.filter((feature) => {
    return (
      selected[0] === "" ||
      selected.includes(feature["properties"]["Owner type"])
    );
  });
};

export const buildHeatMapData = (geojson, byArea) => {
  let minMax = getMinMax(geojson["features"]);

  let heatmapData = [];

  geojson["features"].forEach((feature) => {
    let latlng = new google.maps.LatLng(
      feature["geometry"]["coordinates"][1],
      feature["geometry"]["coordinates"][0]
    );
    heatmapData.push({
      location: latlng,
      weight: byArea
        ? getScaledValue(
            feature["properties"]["Size m2"],
            minMax[0],
            minMax[1],
            0,
            100
          )
        : 1,
      maxIntensity: 1,
    });
  });
  return heatmapData;
};
