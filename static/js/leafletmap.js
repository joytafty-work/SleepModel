<link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.css" />
<!--[if lte IE 8]><link rel="stylesheet" href="http://leafletjs.com/examples/dist/leaflet.ie.css" /></link><![endif]-->
   
<style>
      #map {
        width: 800px;
        height: 500px;
      }
   
      .info {
        padding: 6px 8px;
        font: 14px/16px Arial, Helvetica, sans-serif;
        background: white;
        background: rgba(255,255,255,0.8);
        box-shadow: 0 0 15px rgba(0,0,0,0.2);
        border-radius: 5px;
      }
      .info h4 {
        margin: 0 0 5px;
        color: #777;
      }
   
      .legend {
        text-align: left;
        line-height: 18px;
        color: #555;
      }
      .legend i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
      }
</style>

<script src="http://cdn.leafletjs.com/leaflet-0.5.1/leaflet.js"></script>   
<script type="text/javascript" src="http://leafletjs.com/examples/us-states.js"></script>
<script type="text/javascript">
  var map = L.map('map').setView([37.8, -96], 4);
  var cloudmade = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/{styleId}/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &#169; 2011 OpenStreetMap contributors, Imagery &#169; 2011 CloudMade',
        key: '6703ff226f4746adab2f7548e3826fce',
        styleId: 22677
      }).addTo(map);
  // control that shows state info on hover
  var info = L.control();
   
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };
  
  info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' +  (props ?
    '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
    : 'Hover over a state');
    };
    info.addTo(map);

      //add popup
      var marker = L.marker([37.8, -96]).addTo(map);

      // get color depending on population density value
      function getColor(d) {
        return d > 1000 ? '#800026' :
             d > 500  ? '#BD0026' :
             d > 200  ? '#E31A1C' :
             d > 100  ? '#FC4E2A' :
             d > 50   ? '#FD8D3C' :
             d > 20   ? '#FEB24C' :
             d > 10   ? '#FED976' :
                  '#FFEDA0';
      }
   
      function style(feature) {
        return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: getColor(feature.properties.density)
        };
      }
   
      function highlightFeature(e) {
        var layer = e.target;
   
        layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.7
        });
   
        if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
        }
   
        info.update(layer.feature.properties);
      }
   
      var geojson;
   
      function resetHighlight(e) {
        geojson.resetStyle(e.target);
        info.update();
      }
   
      function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
      }
   
      function onEachFeature(feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
        });
      }
   
      geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
      }).addTo(map);
   
      map.attributionControl.addAttribution('Population data &#169; <a href="http://census.gov/">US Census Bureau</a>');
   
   
      var legend = L.control({position: 'bottomright'});
   
      legend.onAdd = function (map) {
   
        var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 10, 20, 50, 100, 200, 500, 1000],
          labels = [],
          from, to;
   
        for (var i = 0; i < grades.length; i++) {
          from = grades[i];
          to = grades[i + 1];
   
          labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&#8211;' + to : '+'));
        }
   
        div.innerHTML = labels.join('<br />');
        return div;
      };
  legend.addTo(map);
</script>