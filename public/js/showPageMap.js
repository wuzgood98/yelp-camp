mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v11", // style URL
  center: JSON.parse(campground).geometry.coordinates, // starting position [lng, lat]
  zoom: 10, // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker()
  .setLngLat(JSON.parse(campground).geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${JSON.parse(campground).title}</h3><p>${
        JSON.parse(campground).location
      }</p>`
    )
  )
  .addTo(map);
