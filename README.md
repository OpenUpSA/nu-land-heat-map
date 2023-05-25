# NU Land Heat Map

Google Maps heat map using Ndifuna Ukwazi land parcel data.

## Usage

### Iframe method

You can embed the map using an iframe e.g.

```
<iframe src="https://nu-land-heat-map.openup.org.za"></iframe>
```

It will default to showing land parcels by the number of them together. To show land parcels by area too add `byarea=true` to the URL e.g.

```
<iframe src="https://nu-land-heat-map.openup.org.za?byarea=true"></iframe>
```

You can also tweak the `maxintensity` and `radius` properties via the URL.

## Development, Build, Deployment

See [package.json](./package.json)

## Utils

To reduce the multi-megabyte original complete.json run:

```
node utils/compact-json.js
```