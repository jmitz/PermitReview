var map, sidebar, countySearch = []; //, theaterSearch = [], museumSearch = [];
var featureCount = 0;
var permitCount;
var displayPermitTypes = [];

var permits = {
  url: 'http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/Mitzelfelt/PermitReviewViewSingleService/FeatureServer/0',
  types: {
    AIR: {
      PERMIT: {
        name: 'FESOP or LSO Permits',
        mediaType: 'AIR',
        interestType: 'PERMIT',
        color: '#C563E6',
        markerIcon: 'img/airPermit.png',
        popupTemplate: "<h5>Air Permit - FESOP or LSO<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name"
      },
      ROSS: {
        name: 'ROSS Permits',
        mediaType: 'AIR',
        interestType: 'ROSS',
        color: '#C563B6',
        markerIcon: 'img/rossPermit.png',
        popupTemplate: "<h5>Air Permit - ROSS<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name"
      },
      USEPA: {
        name: 'CAAPP Permits',
        mediaType: 'AIR',
        interestType: 'USEPA',
        color: '#C56386',
        markerIcon: 'img/caappPermit.png',
        popupTemplate: "<h5>Air Permit - CAAPP<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name"
      }
    },
    WATER: {
      BOW: {
        name: 'NPDES Permits',
        mediaType: 'WATER',
        interestType: 'BOW',
        color: '#88F0D3',
        markerIcon: 'img/npdesPermit.png',
        popupTemplate: "<h5>Water Permit - NPDES<h5><h3><%= properties.Name %></h3><p><%= properties.Address %><br><%= properties.City %>,  IL</p><p><%= properties.SiteId %></p>",
        markerTitle: "Name"
      }
    }
  }
};

$.getJSON('data/permitCount.json', function(data){
  permitCount = data;
});

var maxMapBounds = L.latLngBounds(L.latLng(36.9, -91.6),L.latLng(42.6, -87.4));

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

function getViewport() {
  if (sidebar.isVisible()) {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: $(".leaflet-sidebar").css("width"),
      right: "0px",
      height: $("#map").css("height")
    });
  } else {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });
  }
}

function buildCountyChartOptions(countyAttributes){
  var options = {
    data: [
    {
      value: countyAttributes.Total_BOA,
      color:"#C563E6",
      label: 'BOA',
      labelColor: '#000',
      labelFontSize: '.8em'
    },
    {
      value : countyAttributes.Total_BOW,
      color : "#88F0D3",
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
  // if (!isCanvasSupported()){
  //   G_vmlCanvasManager.initElement(divString);
  // }
  var ctx = $(divString)[0].getContext("2d");
  var data = options.data;
  var chartOptions = {
    animation: false
  };
  var chart = new Chart(ctx).Pie(data, chartOptions);
  return this;
}

var stateChartOptions = {
  data: [
  {
    value: 18880,
    color:"#C563E6",
    label: 'BOA',
    labelColor: '#000',
    labelFontSize: '.8em'
  },
  {
    value : 3384,
    color : "#88F0D3",
    label: 'BOW',
    labelColor: '#000',
    labelFontSize: '.8em'
  // },
  // {
  //   value : 5262,
  //   color : "#69D2E7",
  //   label: 'BOL',
  //   labelColor: '#000',
  //   labelFontSize: '.8em'
  }
]};

dispChart('stateChart', stateChartOptions);

$(document).ready(function() {
  getViewport();
  /* Hack to refresh tabs after append */
  $("#poi-tabs a[href='#counties']").tab("show");
});

function sidebarClick(lat, lng, id, layer) {
  /* If sidebar takes up entire screen, hide it and go to the map */
  if (document.body.clientWidth <= 767) {
    sidebar.hide();
    getViewport();
  }
  map.setView([lat, lng], 17);
  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
  map._layers[id].fire("click");
}

/* Basemap Layers */
var baseStreetMap = L.esri.basemapLayer("Topographic");
var baseSatteliteMap = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var baseSatteliteWithTransportMap = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Overlay Layers */
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
  countySearch.push({
    name: layer.feature.properties.NAME_LC,
    source: "Counties",
    id: L.stamp(layer),
    bounds: layer.getBounds()
  });
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
    if (!sidebar.isVisible()){
      sidebar.show();
    }
    var html = '<h4>{{CountyName}} County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>';
    $('#divFeatureInfo').html('<h4>'+feature.properties.NAME_LC+' County</h4><p><canvas id="localChart" class="pieChart"></canvas></p><span id="localTable"></span>');
    dispChart("localChart",buildCountyChartOptions(feature.properties));
       // Put together an UL with the Total Permits for the County and the Total for each of the bureaus.
       var infoHtml = '<ul><li>Total Permits - ' + feature.properties.TotalBOA_BOW + '</li><li>Bureau of Air - ' +
       feature.properties.Total_BOA + '</li><li>Bureau of Water - ' +
       feature.properties.Total_BOW + '</li></ul>';
       $('#localTable').html(infoHtml);
     });
  layer.on('dblclick', function(e){
    console.log('doubleclick');
    map.fitBounds(e.target.getBounds());

  });
}

var generalPermitLayer = new L.esri.FeatureLayer("http://epa084dgis01.iltest.illinois.gov:6080/arcgis/rest/services/TPservices/PermitTotalsCounty_WM/FeatureServer/0", {
  style: colorCountyFeature,
  onEachFeature: configureCountyFeature
});

/* Single marker cluster layer to hold all clusters */
var localPermitMarkers = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true
});

// function makePermitMarker(inPermitType){
//   return function(geojson, latlng){
//     return L.marker(latlng, {icon: L.icon({
//       iconUrl: inPermitType.markerIcon,
//       iconRetinaUrl: inPermitType.markerIcon,
//       iconSize: [32, 37],
//       iconAnchor: [16, 37],
//       popupAnchor:[0, -27]
//     }),
//     title: geojson.properties[inPermitType.markerTitle],
//     riseOnHover: true
//   });
//   };
// }

function bindPermitMarker(inGeoJson, inMarker){
  var permitType = permits.types[inGeoJson.properties.MediaCode][inGeoJson.properties.InterestType];
  featureCount++;
  inMarker.bindPopup(_.template(permitType.popupTemplate,inGeoJson));
}

function makePermitMarker(inGeoJson, inLatLng){
  var permitType = permits.types[inGeoJson.properties.MediaCode][inGeoJson.properties.InterestType];
  var iconUrl = permitType.markerIcon;
  var markerTitle = permitType.markerTitle;
  return L.marker(inLatLng, {
    icon: L.icon({
      iconUrl: iconUrl,
      iconRetinaUrl: iconUrl,
      iconSize: [32, 37],
      iconAnchor: [16, 37],
      popupAnchor:[0, -27]
    }),
    title: inGeoJson.properties[markerTitle],
    riseOnHover: true
  });
}

function testFunction(inVal){
  console.log(inVal);
}

function getPermitTypes (inPermitTypes, inFunction){
  for (var key in inPermitTypes){
    if (typeof(inPermitTypes[key]) === "object"){
      if (inPermitTypes[key].hasOwnProperty('name')){
        inFunction(inPermitTypes[key]);
      }
      getPermitTypes(inPermitTypes[key], inFunction);
    }
  }
}

function buildWhere(inArray){
  var returnString = '';
  var buildArray = [];
  var template = "(MediaCode = '<%= mediaType %>' and InterestType = '<%= interestType %>')";
  var index;
  for (index = 0; index < inArray.length; ++index){
    if (inArray[index].active) {
      buildArray.push(_.template(template,inArray[index]));
    }
  }
//  return "(MediaCode = 'AIR' and InterestType = 'PERMIT') or (MediaCode = 'AIR' and InterestType = 'ROSS') or (MediaCode = 'AIR' and InterestType = 'USEPA') or (MediaCode = 'WATER' and InterestType = 'BOW')";
  return (buildArray.length > 0)? buildArray.join(' or ') : "MediaCode = 'NONSENSE'";
}

permitCluster = new L.esri.ClusteredFeatureLayer(permits.url,{
  createMarker: makePermitMarker,
  onEachMarker: bindPermitMarker,
  where: "(MediaCode = 'AIR' and InterestType = 'PERMIT') or (MediaCode = 'AIR' and InterestType = 'ROSS') or (MediaCode = 'AIR' and InterestType = 'USEPA') or (MediaCode = 'WATER' and InterestType = 'BOW')"
});

var map = L.map("map", {
  maxZoom: 17,
  minZoom:6,
  zoom: 7,
  center: [40, -89.5],
  layers: [baseStreetMap, generalPermitLayer],
  zoomControl: false,
  attributionControl: true,
//      maxBounds: maxMapBounds,
bounceAtZoomLimits: false
});

map.on('viewreset', function(e){
  if (map.getZoom()>10){
    map.removeLayer(generalPermitLayer);
    $('#heatPatch').css('visibility', 'hidden');
    map.closePopup();
    map.addLayer(permitCluster);
  }
  else{
    map.removeLayer(permitCluster);
    $('#heatPatch').css('visibility', 'visible');
    map.addLayer(generalPermitLayer);
  }
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e){
  var index;
  for (index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer) {
      displayPermitTypes[index].active = true;
      permitCluster.setWhere(buildWhere(displayPermitTypes));
      //localPermitMarkers.addLayer(displayPermitTypes[index].clusterLayer);
    }
  }
});

map.on('overlayremove', function(e){
  var index;
  var removeLayer;
  for (index = 0; index < displayPermitTypes.length; ++index){
    if (e.layer === displayPermitTypes[index].testLayer){
      displayPermitTypes[index].active = false;
      permitCluster.setWhere(buildWhere(displayPermitTypes));
      //localPermitMarkers.removeLayer(displayPermitTypes[index].clusterLayer);
    }
  }
});


function buildPermitInfo(inPermitType){
  var newPermitLayer = {};
  newPermitLayer.name = inPermitType.name;
  newPermitLayer.testLayer = L.geoJson(null);
  newPermitLayer.mediaType = inPermitType.mediaType;
  newPermitLayer.interestType = inPermitType.interestType;
  newPermitLayer.active = true;
  map.addLayer(newPermitLayer.testLayer);
  displayPermitTypes.push(newPermitLayer);  
}

getPermitTypes(permits.types, buildPermitInfo);


/* Attribution control */
// function updateAttribution(e) {
//   $.each(map._layers, function(index, layer) {
//     if (layer.getAttribution) {
//       $("#attribution").html((layer.getAttribution()));
//     }
//   });
// }
// map.on("layeradd", updateAttribution);
// map.on("layerremove", updateAttribution);

// var attributionControl = L.control({
//   position: "bottomright"
// });
// attributionControl.onAdd = function (map) {
//   var div = L.DomUtil.create("div", "leaflet-control-attribution");
//   div.innerHTML = "Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
//   return div;
// };
//map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 17,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

var baseLayers = {
  "Street Map": baseStreetMap,
  "Aerial Imagery": baseSatteliteMap,
  "Imagery with Streets": baseSatteliteWithTransportMap
};


//Build with Function
var groupedOverlays = {
  "BOA Permits": {
    "<img src='img/airPermit.png' width='24' height='28'>&nbsp;FESOP or LSO  Permits": displayPermitTypes[0].testLayer,
    "<img src='img/rossPermit.png' width='24' height='28'>&nbsp;ROSS Permits": displayPermitTypes[1].testLayer,
    "<img src='img/caappPermit.png' width='24' height='28'>&nbsp;CAAPP Permits": displayPermitTypes[2].testLayer
  },
  "BOW Permits": {
    "<img src='img/npdesPermit.png' width='24' height='28'>&nbsp;NPDES Permits": displayPermitTypes[3].testLayer
  }
};

/* Larger screens get expanded layer control */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed,
  closeButton: true
}).addTo(map);

sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "left"
}).on("shown", function () {
  getViewport();
}).on("hidden", function () {
  getViewport();
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  /* Fit map to county bounds */
  //map.fitBounds(generalPermitLayer.getBounds());
  $("#loading").hide();

  var countyBH = new Bloodhound({
    name: "Counties",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: countySearch,
    limit: 10
  });

  countyBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "Counties",
    displayKey: "name",
    source: countyBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'>Counties</h4>"
    }}).on("typeahead:selected", function (obj, datum) {
      if (datum.source === "Counties") {
        map.fitBounds(datum.bounds);
      }
      if ($(".navbar-collapse").height() > 50) {
        $(".navbar-collapse").collapse("hide");
      }
    }).on("typeahead:opened", function () {
      $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
      $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
    }).on("typeahead:closed", function () {
      $(".navbar-collapse.in").css("max-height", "");
      $(".navbar-collapse.in").css("height", "");
    });
    $(".twitter-typeahead").css("position", "static");
    $(".twitter-typeahead").css("display", "block");
  });

/* Placeholder hack for IE */
if (navigator.appName === "Microsoft Internet Explorer") {
  $("input").each(function () {
    if ($(this).val() === "" && $(this).attr("placeholder") !== "") {
      $(this).val($(this).attr("placeholder"));
      $(this).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) {
          $(this).val("");
        }
      });
      $(this).blur(function () {
        if ($(this).val() === "") {
          $(this).val($(this).attr("placeholder"));
        }
      });
    }
  });
}
