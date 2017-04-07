//- Process Map Control
/**
 * Main process method for the the map control.
 *
 */

/**
 *
 * @returns {{}}
 */
function loadMapControls() {
    var bucketMapHash = {};

    //- Loop thru each bucket having class horizontalBarChart
    $(".pgnav-map").each( function(n) {
        var parentContainer = $(this);
        var elBucketId = parentContainer.parents(".bucket-process").attr("id");
        // this is the div element containing the map
        // in this position, the resulting id is 'bucket_map_h5'
        // the title is in a child element h2 class='process-title' 
        var elPlot = elBucketId + '_map' + n;

        var config = getMapConfig(parentContainer, elBucketId, n);
        if (config.elementId) {
            bucketMapHash[elBucketId] =  getDataAndConstructMap(config, elPlot, parentContainer);
        }
    });

    return bucketMapHash;
}

/**
 * Return the configuration object
 * containing default values augmented by attributes from the DOM's container element.
 *
 * @param container
 * @param elBucket
 * @param index
 * @returns object
 */
function getMapConfig(container, elBucket, index) {
    var config = {
        elementId: elBucket,
        bucketWidth: $("#"+elBucket).width(),
        // common parameters
        abbreviateValues: 'true',
        recordLimit: '200',
        valueOnTop: 'largest',
        // do not change
        useStoplightColors: 'false',
        subtitle: '',
        controlIndex: index
    };

    //- parameters required by process map control:
    if (container.attr("mapImplementation")) { config.mapImplementation = container.attr("mapImplementation").toUpperCase();} else { config.mapImplementation = "ESRI"; }
    if (container.attr("metricName")) { config.metricName = container.attr("metricName");}
    if (container.attr("granularity")) { config.granularity = container.attr("granularity");}
    if (container.attr("granularityLocation")) { config.granularityLocation = container.attr("granularityLocation");}
    if (container.attr("useStoplightColors")) { config.useStoplightColors = container.attr("useStoplightColors") === "true" ? "true" : "false";}
    if (container.attr("basemapLayer")) { config.basemapLayer = container.attr("basemapLayer").toUpperCase();}
    if (container.attr("markerRadius")) { config.markerRadius = container.attr("markerRadius");} else { config.markerRadius ="7"; }
    if (container.attr("markerOpacity")) { config.markerOpacity = container.attr("markerOpacity");} else { config.markerOpacity ="0.9"; }
    if (container.attr("useClusters")) { config.useClusters = container.attr("useClusters");} else { config.markerOpacity ="false"; }

    //- common parameters:
    if (container.attr("recordLimit")) { config.recordLimit = container.attr("recordLimit");}
    if (container.attr("valueOnTop")) { config.valueOnTop = container.attr("valueOnTop");}
    if (container.attr("subtitle")) { config.subtitle = container.attr("subtitle");}
    if (container.attr("abbreviateValues")) { config.abbreviateValues = container.attr("abbreviateValues");}

    return config;
}


/**
 * Retrieve Map Control data and construct the map, appending it to the parent container.
 *
 * Reused for process metrics control drill down dialog.
 *
 * @param config
 * @param elPlot
 * @param parentContainer
 */
function getDataAndConstructMap(config, elPlot, parentContainer) {
    // get metrics data
    var mapData = [];
    var mapData = getPlotData(config, elPlot);
    if (!mapData || mapData.length === 0) { return; }

    // append the map plot to the parent
    var mapMarkup = mapBucket_Plot(config, elPlot, mapData);
    parentContainer.append(mapMarkup);

    // get location for map data
    mapData = preProcessMapData(config, mapData);
    
    // specify the map div 
    var mapDiv = 'pgnavMap';
    if (config.popupMap){
        mapDiv = 'pgnavMapPopup';
    }

    // create the map config
    var mapConfig = {
        'mapImplementation' : config.mapImplementation,
        'basemapLayer': config.basemapLayer || '',
        'markerRadius': config.markerRadius,
        'markerOpacity': config.markerOpacity,
        'useClusters': config.useClusters
    };

    return initMap(mapDiv, mapData, mapConfig);
}

/**
 * Process the data before using in map construction.
 * First fetch the location information for the metrics data, merge this with the metric data,
 * then structure data in geojson format for presentation in the map control.
 *
 * @param config
 * @param data
 * @returns {*}
 */
function preProcessMapData(config, mapData) {
    var features = [];

    // get the plot location data
    try {
        var parameters;
        
        if (config.granularity && config.granularityLocation ){
            parameters = {
                tableName: config.granularityLocation,
                fieldNames: toJSON([config.granularity, 'lat', 'lon'])
            };
        }
        
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        var locData = result.data.records;    
        
        if (!locData || locData.length === 0) { return; }

        for (var i=0; i<mapData.length ; i++ ) {

            // properties
            var key = mapData[i].barLabel;
            var label = mapData[i].pointLabel;
            var value = mapData[i].value;
            var color = mapData[i].barClass;
            var drillDownView = mapData[i].drillDownView;

            var location = [];
            var lat, lon;
            var keyField = config.granularityLocation + '.' + config.granularity;
            
            var latField, lonField;            
            
            location =   $.grep(locData, function(v) {
                return v[keyField] === key && v[latField] !== "" && v[lonField] !== ""; 
            }); 

            if (location.length > 0 ) { 
                
                // use raw values if available
                if (config.granularityLocation + '.lat.raw' in location[0]) {
                    latField = config.granularityLocation+ '.lat.raw';
                    lonField = config.granularityLocation + '.lon.raw';
                } else {
                    latField = config.granularityLocation+ '.lat';
                    lonField = config.granularityLocation + '.lon';
                }

                // geometry
                var lat = location[0][latField];    
                var lon = location[0][lonField];
                
                if (lat && lon) {
                    var coordinates = [lon,lat];
                    // create geojson feature
                    var feature = {
                        "type": "Feature",
                        "geometry" : {
                            "type": "Point",
                            "coordinates": coordinates
                        },
                        "properties" : {
                            "key" : key,
                            "label" : label,
                            "value" : value,
                            "color" : color,
                            "drillDownView" : drillDownView
                        }
                    };
                    // add to features array
                    features.push(feature);   
                }
            }
        }

    } catch (e) {
        mapBucketErrorMessage(config, 'wfrerror');
        //Workflow.handleError(e);
    }

    var featureCollection = {
        "type": "FeatureCollection",
        "features": features
    };

    console.log(JSON.stringify(featureCollection));  
    return featureCollection;
}

/**`
 * Return the HTML that implements the map.
 *
 * @param config
 * @param elPlot
 * @param data
 * @returns {string}
 */
function mapBucket_Plot(config, elPlot, data) {
    
    var mapDiv = 'pgnavMap';
    if (config.popupMap) {
        mapDiv = 'pgnavMapPopup';
    }

    var mapHtml =  '<div id="' + mapDiv + '"style="width:520px; height:350px">';
        mapHtml += '<div id="pgnavMapMarkerTooltip" class="pgnav-map-marker-tooltip" style="position:fixed; display:none;"></div>';
        mapHtml += '<div id="pgnavMapError" class="pgnav-map-error" style="position:absolute; display:none;"></div>';
        mapHtml += '</div>';
    return mapHtml;

}

/**`
 * Initialize the map control.
 *
 * @param div
 * @param data
 *
 */
function initMap(mapDiv, mapData, mapOptions) {

    // LOCATION : CENTER, ZOOM || BOUNDS
    // World : [ 19.973348786110602, -15.468749999999998 ], 1 || [[-76.6797, -182.8125], [76.6797, 182.8125]]
    // North America : [37.30028, -98.26172], 3 || [[9.4490, -143.9648], [57.7041, -52.5585]]
    // Downtown Boston : [42.35803652353272, -71.06163024902344], 13 || 
    //var map = L.map(mapDiv).setView([37.30028, -98.26172], 3); 
    var map = L.map(mapDiv).fitBounds([[-76.6797, -182.8125], [76.6797, 182.8125]]);

    // get the map implementation
    if (mapOptions.mapImplementation === 'GOOGLE') {
        var googleBasemap = getBasemapLayer('GOOGLE', mapOptions.basemapLayer);
        var googleLayer = new L.Google(googleBasemap);
        map.addLayer(googleLayer);
    } else {
        var esriBasemap = getBasemapLayer('ESRI', mapOptions.basemapLayer);
        if (esriBasemap == 'ImageryLabels') {
            var basemapLayerGroup = L.layerGroup();
            basemapLayerGroup.addTo(map);
            // TODO are layer & labelsLayer intended to be globals? If not, use var layer...
            layer = L.esri.basemapLayer('Imagery',{
                id: 'basemap',
                attribution: ''
            });
           basemapLayerGroup.addLayer(layer);
            labelsLayer = L.esri.basemapLayer('ImageryLabels', {
                id: 'basemapLabels',
                attribution: ''
            });
            basemapLayerGroup.addLayer(labelsLayer);
        } else {
            L.esri.basemapLayer(esriBasemap).addTo(map);            
        }
    }
   
    // event logging for development purposes only
    map.on('click', function(evt){
        var map = evt.target;
        console.log();
    });
    
    // get the features
    var features = mapData.features;
    if (!features || features.length === 0) { return map; }

    // create the geoJson layer
    var geoJsonLayer = L.geoJson(features, {
        pointToLayer: function (feature, latlng) {
            var markerOptions = {
                    color: 'white',
                    fillColor: barClassToColor(feature.properties.color), //TODO do this earlier
                    fillOpacity: mapOptions.markerOpacity,
                    radius: parseInt(mapOptions.markerRadius),
                    riseOnHover: true,
                    stroke: false,
                    title: feature.properties.key + '<br>' + '<b>' + feature.properties.label + '</b>'
            };

            return L.circleMarker(latlng, markerOptions);
        },
        onEachFeature: function(feature, layer){
            console.log();

            layer.on('mouseover', function(evt){
                console.log('pgnav-map-marker-mouseover');

                // get content from marker
                var title = evt.target.options.title;
                var fillOpacity = (evt.target.options.fillOpacity)*0.5;

                // update the marker tooltip
                $(".pgnav-map-marker-tooltip").html(title);

                // get the mouse location
                var px, py;        
                if (evt.originalEvent.clientX && evt.originalEvent.clientY) { 
                  px = evt.originalEvent.clientX;
                  py = evt.originalEvent.clientY;
                }
                console.log('clientX:' + px + ",clientY: " + py);

                // show the tooltip at the mouse location         
                $(".pgnav-map-marker-tooltip").css({"display": "none"});
                $(".pgnav-map-marker-tooltip").css({"left": (px + 15) + "px", "top": (py) + "px" });
                $(".pgnav-map-marker-tooltip").css({"display": ""});  

                // add marker highlight
                var marker = evt.target;
                marker.setStyle({
                    stroke: true,
                    weight: 3,
                    color: '#000',
                    fillOpacity: fillOpacity
                });    

            });

            layer.on('mouseout', function(evt){
                console.log('pgnav-map-marker-mouseout');
                
                var fillOpacity = (evt.target.options.fillOpacity)*2.0;

                $(".pgnav-map-marker-tooltip").css({"display": "none"});

                // reset the marker style
                var marker = evt.target;
                marker.setStyle({
                    stroke: false,
                    fillOpacity: fillOpacity
                });    
            });

            layer.on('click', function(evt){
                //open drilldown view, pass asset id as parameter
                var feature = evt.target.feature;
                if (feature) {
                    var drillDownView = feature.properties.drillDownView;
                    var assetId = feature.properties.key;
                    //alert('Drilldown View: ' + drillDownView + '\nAsset ID: ' + assetId);
                    // TODO use webAppContextPath value in case installation is not to /archibus/ dir
                    window.open("/archibus/" + drillDownView);
                }
            });
        }
    });

    // check for clusters
    if (mapOptions.useClusters == "true"){
        var markerClusters = L.markerClusterGroup({
          polygonOptions: {
            fillColor: '#000',
            color: '#000',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.25
          }, 
          iconCreateFunction: function(cluster){
            var count = cluster.getChildCount();
            return L.divIcon({
                html: '<div style="width:25px;">' + (count) + '</div>',
                className: 'leaflet-div-cluster-marker',
                iconSize: [25,25]
            })
          }            
        });
        markerClusters.addLayer(geoJsonLayer);
        map.addLayer(markerClusters);
        markerClusters.bringToFront();
        map.fitBounds(markerClusters.getBounds());
    } else {
        map.addLayer(geoJsonLayer);
        geoJsonLayer.bringToFront();
        map.fitBounds(geoJsonLayer.getBounds());
    }

    return map;
}

/**
 * Append an error message into the bucket when data is not retrieved correctly.
 *
 * @param config
 * @param elPlot
 * @param data
 */
function mapBucketErrorMessage(config, data) {
    var error_msg = (data === 'wfrerror') ?
        getLocalizedString(pageNavStrings.z_PAGENAV_NO_DATA_AVAILABLE):
        getLocalizedString(pageNavStrings.z_PAGENAV_BUCKET_DEF_ERROR);
    var content = '<div id="pgnavMapError">'+error_msg+'</div>';

    if (config.popupMap) {
        $('#pgnavMapPopup').find('#pgnavMapError').html(content);
        $('#pgnavMapPopup').find('#pgnavMapError').css({"display": ""});
    } else {
        $('#pgnavMap').find('#pgnavMapError').html(content);
        $('#pgnavMap').find('#pgnavMapError').css({"display": ""});
    }
}

function getBasemapLayer(mapImplementation, basemapLayerParam) {

    var basemapLayer;
    
//    ESRI BASEMAPS = ['Imagery', 'ImageryLabels', 'Gray', 'DarkGray', 'Streets','Topographic','NationalGeographic','Oceans','ShadedRelief'],
//    GOOGLE BASEMAPS = ['SATTELITE', 'ROADMAP', 'HYBRID', 'TERRAIN'];

    if (mapImplementation === 'ESRI') {
        switch (basemapLayerParam.toLowerCase()) {
            case 'world imagery':
                basemapLayer = 'Imagery';
                break;
            case 'world imagery with labels':
                basemapLayer =  'ImageryLabels';    
                break;
            case 'world light gray canvas':
                basemapLayer =  'Gray';
                break;
            case 'world dark gray canvas':
                basemapLayer =  'DarkGray';
                break;
            case 'world street map':
                basemapLayer = 'Streets';
                break;
            case 'world shaded relief':
                basemapLayer = 'ShadedRelief';
                break;
            case 'world topographic':
                basemapLayer = 'Topographic';
                break;
            case 'national geographic world map':
                basemapLayer = 'NationalGeographic';
                break;
            case 'oceans basemap':
                basemapLayer = 'Oceans';
                break;
            default:
                basemapLayer = 'ImageryLabels';
                break;
        }

    } else if (mapImplementation === 'GOOGLE') {
        switch (basemapLayerParam.toLowerCase()){
            case 'satellite':
                basemapLayer = 'SATELLITE';
                break;
            case 'satellite with labels':
                basemapLayer = 'HYBRID';
                break;
            case 'road map':
                basemapLayer = 'ROADMAP';
                break;
            case 'terrain':
                basemapLayer = 'TERRAIN';
                break;                
            default:
                basemapLayer = 'HYBRID';
                break;
        }

    } 

    return basemapLayer;
}


/**`
 * Return a hex color code for a metric bar chart css class name.
 *
 * @param string
 * @returns {string}
 */
function barClassToColor(color) {
    var colorCode = '#5f5f5f';

    if (color == "pos"){
        colorCode = '#5f5f5f';
    } else if (color == "neg") {
        colorCode = '#ff0000';
    } else if (color == "red") {
        colorCode = '#9b3636';
    } else if (color == "green")  {
        colorCode = '#589358';
    } else if (color == "yellow") {
        colorCode = '#dab300';
    } else if (color == "black")  {
        colorCode = '#5f5f5f';
    }

    return colorCode;
}

