mapboxgl.accessToken = 'pk.eyJ1Ijoib2xsZXNlZ2VyZ3JlbiIsImEiOiJja25rM2NpdWkwN2Z2MnFwbjJlbW45bHRqIn0.EXeF-Oh9YK5qGLpR_z0ruA';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/outdoors-v11', 
center: [16.321998712,62.38583179],
zoom: 6,
minZoom: 3.6
});
jsonDATA = null;
map.on('style.load', function () {
    map.addLayer({
            "id": "Riksintressen",
            "type": "fill",
            "source": {
                type: 'vector',
                url: 'mapbox://ollesegergren.0gutz198'
              },
            'source-layer': 'data_och_underlag_projektuppg-4rxszy',
            'minzoom':5,
            "paint": {
              "fill-color": "#e6a72e",
              "fill-opacity": 0.5
            }
        });
    map.getCanvas().style.cursor = 'default';
    $.getJSON('https://o11.se/RAA/data.json', function(data){
        jsonDATA = data.data;
    });
});
var hoveredRiksintresse = null;

map.on('mousemove', 'Riksintressen', function (e) {
  console.log("Mouse move!")
  if (e.features.length > 0) {
    if (hoveredRiksintresse !== null) {
      
      map.setFeatureState(
        { source: 'Riksintressen', id: hoveredRiksintresse, sourceLayer: "data_och_underlag_projektuppg-4rxszy" },
        { hover: false }
      );
    }
    hoveredRiksintresse = e.features[0].properties.RI_id;
    map.getCanvas().style.cursor = 'pointer';
      map.setFeatureState(
        { source: 'Riksintressen', id: hoveredRiksintresse, sourceLayer: "data_och_underlag_projektuppg-4rxszy"},
        { hover: true }
      );
  }
});

map.on('mouseleave', 'Riksintressen', function () {
  map.getCanvas().style.cursor = 'default';
});

/*$.ajaxSetup({
    async: false
});
*/

map.on('click', 'Riksintressen', function (e) {
  selectedJSON = null;
  jsonDATA.forEach(element => {
      if(String(e.features[0].properties.RI_id).includes(String(element.RI_ID)) || String(element.RI_ID).includes(String(e.features[0].properties.RI_id))){
        selectedJSON = element;
      }
  });
  console.log(selectedJSON);
  console.log(e.features[0].properties.RI_id);

  areaInformation = "<div class='popup'><p class='name'>" + e.features[0].properties.NAMN + "</p>";
  
  if(selectedJSON != null && selectedJSON.hasOwnProperty('Län')){
    areaInformation += "<p>Län: " + selectedJSON.Län  + "</p>";
  }
  if(selectedJSON != null && selectedJSON.hasOwnProperty('Kn')){
    areaInformation += "<p>Kommun: " + selectedJSON.Kn + "</p>";
  }
  areaInformation += "</div>";

  new mapboxgl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(areaInformation)
    .addTo(map);

  document.getElementById("name").innerText = e.features[0].properties.NAMN;
  document.getElementById("id").innerText = e.features[0].properties.RI_id;
  document.getElementById("description").innerText = selectedJSON.Uttryck_för_RI;

});