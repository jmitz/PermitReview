
function buildCountyChartOptions(countyAttributes){
  options = {
    data: [
    {
      value: countyAttributes.Total_BOA,
      color:"#F38630",
      label: 'BOA',
      labelColor: '#000',
      labelFontSize: '.8em'
    },
    {
      value : countyAttributes.Total_BOW,
      color : "#E0E4CC",
      label: 'BOW',
      labelColor: '#000',
      labelFontSize: '.8em'
    }
    ]
  };
  return options;
}

function dispChart(divName,options){
  divString = '#' + divName;
  var ctx = $(divString)[0].getContext("2d");
  var data = options.data;
  var chartOptions = {
    animation: false
  };
  var chart = new Chart(ctx).Pie(data, chartOptions);
  return this;
}

var permitMap = function(){
  var maxMapBounds = L.latLngBounds(L.latLng(36.9, -91.6),L.latLng(42.6, -87.4));

  var map = {};
  var baseMap = L.esri.basemapLayer("Topographic");

  var baseMapOverlay = L.esri.dynamicMapLayer('http://geoservices.epa.illinois.gov/ArcGIS/rest/services/SWAP/Location/MapServer',{
    opacity: 0.75,
    layers: [10, 12]
  });

  function colorCountyFeature(feature){
    var colorVal = '#F00';
    if (feature.properties.TotalBOA_BOW < 50){
      colorVal = '#0FF';
    }
    else if (feature.properties.TotalBOA_BOW < 100){
      colorVal = '#0F0';
    }
    else if (feature.properties.TotalBOA_BOW < 300){
      colorVal = '#FF0';
    }
    else if (feature.properties.TotalBOA_BOW < 1000){
      colorVal = '#F60';
    }
    return {color: colorVal};
  }

  function configureCountyFeature(feature, layer) {
    layer.on('mouseover mousemove', function(e){
      var hover_bubble = new L.Rrose({
        offset: new L.Point(0,-10),
        closeButton: false,
        autoPan: false}
        ).setContent('<p>'+feature.properties.NAME_LC+'<br>'+feature.properties.TotalBOA_BOW + ' Permits</p>')
      .setLatLng(e.latlng)
      .openOn(map);
    });
    layer.on('mouseout', function(e){
      map.closePopup();
    });
    layer.on('click', function(e){
      var html = '<h4>{{CountyName}} County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>';
      $('#divFeatureInfo').html('<h4>'+feature.properties.NAME_LC+' County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>');
      dispChart("localChart",buildCountyChartOptions(feature.properties));
       // Put together an UL with the Total Permits for the County and the Total for each of the bureaus.

console.log(feature.properties);
    });
      // layer.on('mousedown', function(e){
      //   //layer.off('mouseover mousemove');
      //   var popup = new L.Popup({
      //     offset: new L.Point(0,-10),
      //     closeButton: true,
      //     autoPan: true})
      //   .setContent(feature.properties.NAME_LC)
      //   .setLatLng(e.latlng)
      //   .openOn(map);
      // });
}

var featureLayers = new L.esri.FeatureLayer("http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/TPservices/PermitTotalsCounty_WM/FeatureServer/0", {
  style: colorCountyFeature,
  onEachFeature: configureCountyFeature
});

map = L.map('divMap',{
  maxZoom: 17,
  minZoom: 6,
  layers: [baseMap],
  maxBounds: maxMapBounds
}).setView([40, -89.5],7).addLayer(featureLayers, true);

//baseMapOverlay.bringToBack();

}();

permitData={
  boa: {
    name: 'Bureau of Air',
    abbrev: 'BOA',
    total: 7810,
    programs: [
    {name: 'ROSS',
    total: 2506,
    pending: 5
  },
  {name: 'USEPA',
  total: 75,
  pending: 0
},
{name: 'Permits',
total: 4133,
pending: 50
},
{name: 'Exempt',
total: 1096,
pending: 21
}
]
},
bol: {
  name: 'Bureau of Land',
  abbrev: 'BOL',
  total: 4133,
  programs: [
  {name: 'Permits',
  total: 4133,
  pending: 50
}
]
},
bow: {
  name: 'Bureau of Water',
  abbrev: 'BOW',
  total: 5262,
  programs: [
  {name: 'NPDES',
  total: 2303,
  pending: 53
},
{name: 'CWS Wells',
total: 2959,
pending: 75
}
]
}};


var stateChartOptions = {
  data: [
  {
    value: 7810,
    color:"#F38630",
    label: 'BOA',
    labelColor: '#000',
    labelFontSize: '.8em'
  },
  {
    value : 4133,
    color : "#E0E4CC",
    label: 'BOW',
    labelColor: '#000',
    labelFontSize: '.8em'
  },
  {
    value : 5262,
    color : "#69D2E7",
    label: 'BOL',
    labelColor: '#000',
    labelFontSize: '.8em'
  }
  ]
};


dispChart('stateChart', stateChartOptions);