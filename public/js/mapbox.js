console.log('Hi');
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiY29kaW5nbmluamEiLCJhIjoiY2xscHRwb2g0MDhhajNsbDBua2o2MGc1aiJ9.5UJt0BwVEq8SsGV9ExOVyw';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  //   center: [-118.113491, 34.111745], // starting position [lng, lat]. Note that lat must be set between -90 and 90
  //   zoom: 10, // starting zoom
  style: 'mapbox://styles/codingninja/cmgcgerdj00cj01sadbwtectb',
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //   add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // add pop
  new mapboxgl.Popup()
    .setLngLat(loc.coordinates)
    .setHTML(
      `<p>
    Day ${loc.day}: ${loc.description}
    </p>`
    )
    .addTo(map);

  // extends map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
