const displayMap = (locations) => {
  if (typeof L === 'undefined') return;

  const map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
  });

  const coords = locations.map((el) => [el.coordinates[1], el.coordinates[0]]);

  locations.forEach((loc, i) => {
    const el = document.createElement('div');
    el.className = 'marker';

    const marker = L.marker(coords[i], {
      icon: L.divIcon({
        html: el,
        iconSize: [0, 0],
        className: 'flexBoxAlign',
      }),
    })
      .bindPopup(`<p>Day ${loc.day}: ${loc.description} </p>`, {
        offset: [0, -25],
      })
      .openPopup();

    marker.addTo(map);
  });

  L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}',
    {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: 'png',
    },
  ).addTo(map);

  map.fitBounds(coords, {
    padding: [50, 100],
  });
};

export default displayMap;
