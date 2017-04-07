/**
 * ab-leaflet-map.js
 *
 */

/**
 * This defines the standard leaflet map control.
 */
Ab.namespace('leaflet');

Ab.leaflet.Base = Base.extend({

  //@begin_translatable
  z_MESSAGE_WORLD_IMAGERY_WITH_LABELS: 'World Imagery with Labels',
  z_MESSAGE_NATGEO_WORLD_MAP: 'National Geographic World Map',
  z_MESSAGE_OCEAN_BASEMAP: 'Oceans Basemap',  
  z_MESSAGE_WORLD_IMAGERY: 'World Imagery', 
  z_MESSAGE_WORLD_STREET_MAP: 'World Street Map',   
  z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY: 'World Shaded Relief Imagery',     
  z_MESSAGE_WORLD_TOPOGRAPHIC_MAP: 'World Topographic Map',
  z_MESSAGE_WORLD_LIGHT_GRAY_BASE: 'World Light Gray Canvas', 
  z_MESSAGE_WORLD_DARK_GRAY_BASE: 'World Dark Gray Canvas', 
  z_MESSAGE_NO_REFERENCE_LAYER: 'None',
  
  z_MESSAGE_USA_HOUSEHOLD_SIZE: 'USA Average Household Size',
  z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX: 'USA Social Vulnerability Index',
  z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE: 'USA Labor Force Participation Rate',
  z_MESSAGE_USA_MEDIAN_AGE: 'USA Median Age',
  z_MESSAGE_USA_MEDIAN_HOME_VALUE: 'USA Median Home Value',
  z_MESSAGE_USA_MEDIAN_NET_WORTH: 'USA Median Net Worth',
  z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING: 'USA Owner Occupied Housing',
  z_MESSAGE_USA_POPULATION_BY_SEX: 'USA Population by Sex',
  z_MESSAGE_USA_PERCENT_OVER_64: 'Percentage of U.S. Population Older than Age 64',
  z_MESSAGE_USA_PERCENT_UNDER_18: 'Percentage of U.S. Population Aged Younger than 18 Years',
  z_MESSAGE_USA_POPULATION_DENSITY: 'USA Population Density',
  z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE: 'USA Projected Population Change',
  z_MESSAGE_USA_RECENT_POPULATION_CHANGE: 'USA Population Change 2000-2010',
  z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL: 'USA Retail Spending Potential',
  z_MESSAGE_USA_TAPESTRY: 'USA Tapestry Segmentation',
  z_MESSAGE_USA_UNEMPLOYMENT_RATE: 'USA Unemployment Percentage Rate',
  
  z_MESSAGE_ROADMAP: 'Road Map',
  z_MESSAGE_SATELLITE: 'Satellite',  
  z_MESSAGE_HYBRID: 'Satellite with Labels', 
  z_MESSAGE_TERRAIN: 'Terrain',   
  // @end_translatable

  // Ext.util.MixedCollection of custom event listeners for this control
  eventListeners: null,

  // the map is implemented as either an Esri or Google map.
  mapImplementation: null,

  //the div which holds the map
  //the div and panel which hold the map
  divId: '',
  panelId: '',

  // holds a reference to the leaflet map (L.map)
  map: null,

  // Ext.util.MixedCollection
  // holds a list of basemap layerName-keyValue pairs
  basemapLayerList: null,

  // holds a reference to the leaflet basemap layer group
  basemapLayerGroup: null,

  // Ext.util.MixedCollection
  // holds a list of reference layerName-keyValue pairs
  referenceLayerList: null, 

  // holds a reference to the leaflet reference layer group
  referenceLayerGroup: null,   

  // Ext.util.MixedCollection
  // holds a list of reference layerName-keyValue pairs
  markerLayerList: null, 

  // a reference to the L.geoJSON marker layer
  markerLayer: null,

  // holds a reference to the leaflet reference layer group
  markerLayerGroup: null,   

  // the marker action callback function
  markerActionCallback: null,

  // Ext.util.MixedCollection
  // holds a list of datasource-MarkerProperty pairs
  // key is the dataSource, value is the corresponding LeafletMarkerProperty
  dataSourceMarkerPairs: null, 

  /**
   * Registers custom event listener with this control.
   * @param {eventName}   Event name, specific to the control type.
   * @param {listener}    Either a function reference, or an array of commands. 
   */
  addEventListener: function(eventName, listener, scope) {
      
      if(!this.eventListeners){
        this.eventListeners = new Ext.util.MixedCollection(true); // allow functions to be stored
      }

      if (listener && listener.constructor === Array) {
          // create command chain from an array of command configuration objects
          var command = new Ab.command.commandChain();
          command.addCommands(listener);
          listener = command;
          
      } else {
          // if listener is a name, get global (window object) function
          if (listener && listener.constructor === String) {
              listener = window[listener];
          }
          // if scope is specified, the listener is a function that must be called in scope
          if (valueExists(scope)) {
              listener = listener.createDelegate(scope);
          }
      }
      
      if (this.eventListeners.containsKey(eventName)) {
          this.eventListeners.replace(eventName, listener);
      } else {
          this.eventListeners.add(eventName, listener);
      }
  },

  /**
   * Returns registered event listener.
   * @param {eventName}   Event name, specific to the control type.
   */
  getEventListener: function(eventName) {
      var listener = null;
      if (this.eventListeners) {
        listener = this.eventListeners.get(eventName);
      }
      if (!valueExists(listener)) {
          listener = null;
      }
      return listener;
  },

  _createMapPanelEventHandlers: function(){

    var mapControl = this;
    var mapPanel = View.panels.get(this.panelId);
    var mapDiv = document.getElementById(this.divId);


    mapPanel.afterResize = function(){
      var mapPanel = View.panels.get(mapControl.panelId);
      var mapDiv = Ext.get(mapControl.divId);

      var height = mapPanel.determineHeight();

      // make adjustments for tabs and instructions
      var adjHeight = 0;
      if (this.singleVisibleTabPanel()){
        adjHeight = adjHeight + this.getTitlebarHeight(); //31
      }
      adjHeight = adjHeight + this.getInstructionsHeight(); //25

      height = height - adjHeight; //56 
      mapDiv.setHeight(height);
      mapDiv.parent().setHeight(height);

      if (mapControl.map !== null) {
        mapControl.map.invalidateSize();
      }
    };

    mapPanel.syncHeight = function(){
      mapPanel.afterResize();
    };

    mapPanel.afterLayout = function() {
      var regionPanel = this.getLayoutRegionPanel();
      if (regionPanel){
        if(!mapPanel.resizeListenerAttached){
          mapPanel.resizeListenerAttached = true;

          regionPanel.addListener('resize', function(){
            mapPanel.afterResize();
          });
          regionPanel.addListener('expand', function() {
                  mapPanel.afterResize();
              });
        }
      }
    };

    mapPanel.isScrollInLayout = function() {
      return false;
    };

    mapDiv.style.position = 'relative';

    mapPanel.afterLayout();
    mapPanel.afterResize();

  },  

  _createTooltipDomElement: function() {

    // create the tooltip element
    var tooltipDiv = document.createElement('div');
    tooltipDiv.id = this.divId + '_leafletMapMarkerTooltip';
    tooltipDiv.className = 'leaflet-map-marker-tooltip';
    tooltipDiv.style.display = 'none';
    // append the tooltip element to the map element
    var mapDiv = document.getElementById(this.divId);
    mapDiv.appendChild(tooltipDiv);

  },

  _createMarkerInfoWindowDomElement: function() {

    var markerLayerInfoWindow = document.createElement('div');
    markerLayerInfoWindow.id = this.divId + '_leafletMapMarkerInfoWindow';
    markerLayerInfoWindow.className = 'leaflet-map-marker-infowindow';
    var markerLayerInfoWindowContent = document.createElement('div');
    markerLayerInfoWindowContent.id = this.divId + '_leafletMapMarkerInfoWindowContent';
    markerLayerInfoWindowContent.className = 'leaflet-map-marker-infowindow-content';
    markerLayerInfoWindow.appendChild(markerLayerInfoWindowContent);
    markerLayerInfoWindow.style.display = 'none';
    var mapDiv = document.getElementById(this.divId);
    mapDiv.appendChild(markerLayerInfoWindow);

  },

  _createLegendContainer: function() {
    // add legend display elements
    var leafletLegendContainer = document.createElement("div");
    leafletLegendContainer.id = this.divId + '_leafletLegendContainer';
    leafletLegendContainer.className = 'leaflet-legend-container';
    var leafletLegendCloseButton = document.createElement("div");
    leafletLegendCloseButton.id = this.divId + '_leafletLegendCloseButton'; 
    leafletLegendCloseButton.className = 'leaflet-legend-close-button';
    leafletLegendContainer.appendChild( leafletLegendCloseButton );
    
    var leafletLegendContent = document.createElement("div");
    leafletLegendContent.id = this.divId + '_leafletLegendContent';
    leafletLegendContent.className = 'leaflet-legend-content';
    leafletLegendContainer.appendChild( leafletLegendContent );
    leafletLegendContainer.style.display = 'none';
    var mapPanel = document.getElementById( this.panelId );
    mapPanel.appendChild( leafletLegendContainer );
    
    // wire up close event to close button
    var _mapControl = this;
    leafletLegendCloseButton.onclick = function(){_mapControl.hideMarkerLegend();};
  },

  _updateLegendContent: function(markerProperties) {

    //console.log('Ab.leaflet.Base -> updateLegendContent...');  

    var htmlContent;
    var renderer = markerProperties.markerOptions.renderer;
    var title, title2, thematicRenderer, graduatedRenderer, backgroundColor, label, imageSize;

    switch (renderer) {

      case 'simple':
        // TODO 
        // var title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.titleField);
        // var backgroundColor = markerProperties.markerOptions.fillColor;
        // htmlContent = '<table>';
        // htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td>Locations</td></tr>';
        // htmlContent += '</table>';
        htmlContent = "";
        break;

      case 'thematic-unique-values':
      case 'thematic-proportional-unique-values':
        title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.thematicField);
        thematicRenderer = markerProperties.markerOptions.thematicRenderer;
        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title + "</td></tr>";
        for (var i=0; i<thematicRenderer.length; i++) {
          backgroundColor = thematicRenderer[i].color;
          label = markerProperties.markerOptions.thematicRenderer[i].label || thematicRenderer[i].uniqueValue;
          htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        }
        htmlContent += '</table>';
        break;

      case 'thematic-graduated-unique-values':
        title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.thematicField);
        thematicRenderer = markerProperties.markerOptions.thematicRenderer;
        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title + "</td></tr>";
        for (var i=0; i<thematicRenderer.length; i++) {
          backgroundColor = thematicRenderer[i].color;
          label = markerProperties.markerOptions.thematicRenderer[i].label || thematicRenderer[i].uniqueValue;
          htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        }

        title2 = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.graduatedField);
        graduatedRenderer = markerProperties.markerOptions.graduatedRenderer;
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title2 + "</td></tr>";
        for (var i=0; i<graduatedRenderer.length; i++) {
          if (i===0) {
            label = markerProperties.markerOptions.graduatedRenderer[i].label || '< ' + graduatedRenderer[i].maxValue;
          } else if (i===graduatedRenderer.length-1) {
            label = markerProperties.markerOptions.graduatedRenderer[i].label || '> ' + graduatedRenderer[i].minValue;
          } else {
            label = markerProperties.markerOptions.graduatedRenderer[i].label || graduatedRenderer[i].minValue + ' - ' + graduatedRenderer[i].maxValue;
          }
          imageSize = graduatedRenderer[i].radius * 2;
          htmlContent += '<tr><td class="leaflet-legend-image"><img src="/archibus/schema/ab-core/graphics/icons/view/ab-circle-1000.png" height="' + imageSize + '" width="' + imageSize + '"></td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        } 
        htmlContent += '</table>';
        break;  

      case 'thematic-class-breaks':
      case 'thematic-proportional-class-breaks':
        title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.thematicField);
        thematicRenderer = markerProperties.markerOptions.thematicRenderer;
        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title + "</td></tr>";
        for (i=0; i<thematicRenderer.length; i++) {
          backgroundColor = thematicRenderer[i].color;
          if (i===0) {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || '< ' + thematicRenderer[i].maxValue; //label = '< ' + thematicRenderer[i].maxValue;
          } else if (i===thematicRenderer.length-1) {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || '> ' + thematicRenderer[i].minValue; //label = '> ' + thematicRenderer[i].minValue;
          } else {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || thematicRenderer[i].minValue + ' - ' + thematicRenderer[i].maxValue; //label = thematicRenderer[i].minValue + ' - ' + thematicRenderer[i].maxValue;
          }
          htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        }
        htmlContent += '</table>';
        break;

      case 'thematic-graduated-class-breaks':
        title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.thematicField);
        thematicRenderer = markerProperties.markerOptions.thematicRenderer;
        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title + "</td></tr>";
        for (var i=0; i<thematicRenderer.length; i++) {
          backgroundColor = thematicRenderer[i].color;
          if (i===0) {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || '< ' + thematicRenderer[i].maxValue;
          } else if (i===thematicRenderer.length-1) {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || '> ' + thematicRenderer[i].minValue;
          } else {
            label = markerProperties.markerOptions.thematicLegendLabels[i] || thematicRenderer[i].minValue + ' - ' + thematicRenderer[i].maxValue;
          }
          htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        }

        title2 = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.graduatedField);
        graduatedRenderer = markerProperties.markerOptions.graduatedRenderer;
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title2 + "</td></tr>";
        for (var i=0; i<graduatedRenderer.length; i++) {
          if (i === 0) {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || '< ' + graduatedRenderer[i].maxValue;
          } else if (i === graduatedRenderer.length-1) {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || '> ' + graduatedRenderer[i].minValue;
          } else {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || graduatedRenderer[i].minValue + ' - ' + graduatedRenderer[i].maxValue;
          }
          imageSize = graduatedRenderer[i].radius * 2;
          htmlContent += '<tr><td class="leaflet-legend-image"><img src="/archibus/schema/ab-core/graphics/icons/view/ab-circle-1000.png" height="' + imageSize + '" width="' + imageSize + '"></td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        } 
        htmlContent += '</table>';
        break;

      case 'graduated-class-breaks':
        title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.markerOptions.graduatedField);
        graduatedRenderer = markerProperties.markerOptions.graduatedRenderer;

        htmlContent = "<table>";
        htmlContent += "<tr><td colspan='2' class='leaflet-legend-title'>" + title + "</td></tr>";
        for (var i=0; i<graduatedRenderer.length; i++) {
          if (i === 0) {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || '< ' + graduatedRenderer[i].maxValue;
          } else if (i === graduatedRenderer.length-1) {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || '> ' + graduatedRenderer[i].minValue;
          } else {
            label = markerProperties.markerOptions.graduatedLegendLabels[i] || graduatedRenderer[i].minValue + ' - ' + graduatedRenderer[i].maxValue;
          }
          imageSize = graduatedRenderer[i].radius * 2;
          htmlContent += '<tr><td class="leaflet-legend-image"><img src="/archibus/schema/ab-core/graphics/icons/view/ab-circle-1000.png" height="' + imageSize + '" width="' + imageSize + '"></td><td class="leaflet-legend-label">' + label + '</td></tr>';          
        } 
        htmlContent += '</table>';
        break; 

      case 'proportional':
        //TODO
        break;

       default:
        break;

    }

    document.getElementById(this.divId + '_leafletLegendContent').innerHTML = htmlContent;

  },

  clearMarkers: function(){
    this.markerLayerGroup.clearLayers();
  },

  showMarkerLegend: function() {
    //console.log('Ab.leaflet.Base -> showMarkerLegend...');
    document.getElementById(this.divId + '_leafletLegendContainer').style.display = 'block';
  },

  showMarkerInfoWindow: function(htmlContent){
    document.getElementById(this.divId + '_leafletMapMarkerInfoWindowContent').innerHTML = htmlContent;
    document.getElementById(this.divId + '_leafletMapMarkerInfoWindow').style.display = 'block';
  },

  hideMarkerInfoWindow: function(){
    document.getElementById(this.divId + '_leafletMapMarkerInfoWindow').style.display = 'none';
  },

  hideMarkerLegend: function() {
    //console.log('Ab.leaflet.Base -> hideMarkerLegend...');
    document.getElementById(this.divId + '_leafletLegendContainer').style.display = 'none';
  },

  /*
   *  get layer names for all available basemap layers 
   */ 
  getBasemapLayerList: function() { 
    return this.basemapLayerList.keys;
  },

  /*
   *  get layer names for all available reference layers 
   */
  getReferenceLayerList: function() {
    return this.referenceLayerList.keys;
  },  

  /*
   *  create marker definition for the specified datasource with the specified marker properties 
   */
  createMarkers: function(dataSource, keyFields, geometryFields, titleField, contentFields, markerProperties) {
      var _markerProperties;
      
      var _renderer = markerProperties.renderer || 'simple';
      switch (_renderer) {
        case 'simple':
          _markerProperties = new Ab.leaflet.Marker(dataSource, keyFields, geometryFields, titleField, contentFields, markerProperties);
          break;

        case 'thematic-class-breaks':
        case 'thematic-unique-values':
        case 'graduated-class-breaks':
        case 'thematic-graduated-class-breaks':
        case 'thematic-graduated-unique-values':
        case 'proportional':
        case 'thematic-proportional-unique-values':
        case 'thematic-proportional-class-breaks':
          _markerProperties = new Ab.leaflet.ThematicMarker(dataSource, keyFields, geometryFields, titleField, contentFields, markerProperties);
          break;

        default:
          //console.log('Ab.leaflet.Base -> Error - Unsupported marker renderer : ' + _renderer);
          break;    

      }

      // if (!markerProperties.renderer || markerProperties.renderer == 'simple') {
      //   _markerProperties = new Ab.leaflet.Marker(dataSource, geometryFields, titleField, contentFields, markerProperties);
      // } else if (markerProperties.renderer == 'thematic-class-breaks' || markerProperties.renderer == 'thematic-unique-values' || 
      //     markerProperties.renderer == 'graduated-class-breaks' || markerProperties.renderer == 'thematic-graduated-unique-values' || 
      //     markerProperties.renderer == 'thematic-graduated-class-breaks') {
      //   _markerProperties = new Ab.leaflet.ThematicMarker(dataSource, geometryFields, titleField, contentFields, markerProperties);
      // }

      if( this._getMarkerPropertiesByDataSource(dataSource) === null ) {
        this.dataSourceMarkerPairs.add(dataSource, _markerProperties);
      }
      else {
        this.dataSourceMarkerPairs.replace(dataSource, _markerProperties);
      }
  },

  /*
   *  show markers for the specified dataSource and restriction 
   */
  showMarkers: function(dataSource, restriction){
    
    var markerProperties = this._getMarkerPropertiesByDataSource(dataSource);

    if( markerProperties ) {
      
      //TODO
      if (markerProperties.markerOptions.markerActionTitle && markerProperties.markerOptions.markerActionTitle) {
        this.markerActionCallback = markerProperties.markerOptions.markerActionCallback;
      }  

      //create marker data from dataSource
      var markerData = this._createMarkerData(dataSource, restriction);

      //display the markers
      if (markerData.features.length > 0) {
        this._displayMarkers(dataSource, markerData);
      } else {
        // clear the markers for the dataSource
        this._removeLayerFromLayerGroup(dataSource, this.markerLayerGroup);
        var msg = 'Ab.leaflet.Base -> No features for dataSource: ' + dataSource +  '  with current restriction.';
        //console.log(msg);
      }

    } else {
      // return, display and log error
      //console.log('Ab.leaflet.Base -> Marker definition does not exist for dataSource: ' + dataSource);
    }

  },

  selectMarkersByAssetIds: function(assetIds, dataSourceId){
    var me = this;

    // clear existing selected features
    this.clearSelectedMarkers();

    // get the feature layer 
    var markerLayer = this.markerLayer;

    // asset key field
    var assetIdField = this.dataSourceMarkerPairs.get(dataSourceId)['keyFields'][0];

    // get the markers from the layer
    var selectMarkers = [];
    for (var each in markerLayer._layers) {
      if ( _.indexOf(assetIds, markerLayer._layers[each].feature.properties[assetIdField]) !== -1 ){
        var feature = markerLayer._layers[each].feature;
        feature.properties.options = markerLayer._layers[each].options;
        selectMarkers.push(feature);
      }
    }

    var selectionGeoJson = {
        'type': 'FeatureCollection',
        'features': selectMarkers
    };

    var selectionStyle = {
      color: '#000',
      stroke: true,
      weight: 2.0,
      opacity: 1.0,
      fillColor: '#000',
      fillOpacity: 0.3
    };

    var selectionLayer = L.geoJson(selectionGeoJson, {
        
        getDataSourceId: function(){
          return 'selectionLayer';
        },                    

        // style: function(feature){
        //   selectionStyle.radius = feature.properties.options.radius;
        //   return selectionStyle;
        // },

        pointToLayer: function(feature, latlng){
          selectionStyle.radius = feature.properties.options.radius;
          return L.circleMarker(latlng, selectionStyle);;
        },

        onEachFeature: function(feature, layer){

          layer.on('mouseover', function(evt){

              // get title from marker
              var feature = evt.target.feature;
              var title = feature.properties.popupTitle; //ab_title;

              // update the marker tooltip
              document.getElementById(me.divId + "_leafletMapMarkerTooltip").innerHTML = title; 

              // get the mouse location
              var px, py;        
              if (evt.containerPoint.x && evt.containerPoint.y) { 
                px = evt.containerPoint.x;
                py = evt.containerPoint.y;
              }

              // show the tooltip at the mouse location
              var tooltipEl = document.getElementById(me.divId + "_leafletMapMarkerTooltip");          
              tooltipEl.style.display = 'none';
              tooltipEl.style.position = '';
              tooltipEl.style.left = (px + 15) + "px";
              tooltipEl.style.top = (py) + "px";
              tooltipEl.style.display = '';  
              tooltipEl.style.position = '';

              // call the mouse over listener
              var markerMouseOver = me.getEventListener('markerMouseOver');
              if (markerMouseOver) {
                var assetId = feature.properties[assetIdField];
                markerMouseOver(assetId, feature);
              }   
          });

           layer.on('mouseout', function(evt){
              var tooltipEl = document.getElementById(me.divId + "_leafletMapMarkerTooltip");          
              tooltipEl.innerHTML = ""; 
              tooltipEl.style.display = "none";

              // call the mouse out listener
              var markerMouseOut = me.getEventListener('markerMouseOut');
              if (markerMouseOut) {
                markerMouseOut(evt.target);
              }  
          });

          layer.on('click', function(evt){
              var markerClick = me.getEventListener('markerClick');
              if (markerClick) {
                var assetId = feature.properties[assetIdField];
                markerClick(assetId, feature);                  
              }
          }); 
        }                     
    });
    this.markerLayerGroup.addLayer(selectionLayer);
    selectionLayer.bringToFront();

  },

  clearSelectedMarkers: function(){
    this._removeLayerFromLayerGroup('selectionLayer' , this.markerLayerGroup );
  },

  panToMarker: function(assetId, dataSourceId) {
    var me = this;

    // get the feature layer 
    var markerLayer = this.markerLayer;
    var assetIds = [assetId];

    // asset key field
    var assetIdField = this.dataSourceMarkerPairs.get(dataSourceId)['keyFields'][0];

    // get the markers from the layer
    var selectMarkers = [];
    for (var each in markerLayer._layers) {
      if ( _.indexOf(assetIds, markerLayer._layers[each].feature.properties[assetIdField]) !== -1 ){
        var feature = markerLayer._layers[each].feature;
        feature.properties.options = markerLayer._layers[each].options;
        selectMarkers.push(feature);
      }
    }    

    // pan to the marker coordinates
    if (selectMarkers.length > 0){
      var lat = Number(selectMarkers[0].geometry.coordinates[0]);
      var lng = Number(selectMarkers[0].geometry.coordinates[1]);

      this.map.panTo([lng, lat]);
    }

  },

  zoomToMarker: function(assetId, dataSourceId, zoomLevel){
    var me = this;

    // get the feature layer 
    var markerLayer = this.markerLayer;
    var assetIds = [assetId];

    // asset key field
    var assetIdField = this.dataSourceMarkerPairs.get(dataSourceId)['keyFields'][0];

    // get the markers from the layer
    var selectMarkers = [];
    for (var each in markerLayer._layers) {
      if ( _.indexOf(assetIds, markerLayer._layers[each].feature.properties[assetIdField]) !== -1 ){
        var feature = markerLayer._layers[each].feature;
        feature.properties.options = markerLayer._layers[each].options;
        selectMarkers.push(feature);
      }
    }    

    // pan to the marker coordinates
    if (selectMarkers.length > 0){
      var lat = Number(selectMarkers[0].geometry.coordinates[0]);
      var lng = Number(selectMarkers[0].geometry.coordinates[1]);

      me.setView([lng, lat], zoomLevel);
    }
  },

  /*
   *  return the markerProperties for given ds
   *  @param dataSource. The dataSource name
   */
  _getMarkerPropertiesByDataSource: function(dataSource){
    return this.dataSourceMarkerPairs.get(dataSource);
  },

  /*
  *  Helper / Convenience Methods
  */

  /**
   *  get map data
   *  @param dataSourc. The dataSource name.
   *  @param restriction. The Restriction.
   *  @return. The map data (geoJson).
   */
  _createMarkerData: function(dataSource, restriction) {
      var markerData,
          records;

      //get records from dataSource
      records = this._getDataSourceRecords(dataSource, restriction);

      // convert record data to geoJson
      markerData = this._recordsToGeoJson(dataSource, records);

      return markerData;
  },

  _recordsToGeoJson: function(dataSource, records) {
    var markerData = {};
    var features = [];
    var markerProperties = this._getMarkerPropertiesByDataSource(dataSource);
    var xCoord = markerProperties.geometryFields[0];
    var yCoord = markerProperties.geometryFields[1];
    var keyFields = markerProperties.keyFields;
    var contentFields = markerProperties.contentFields;

    // TODO add try/catch here
    // create geoJson for each record
    for (var i=0; i<records.length; i++) {

      if ( records[i].values[xCoord] && records[i].values[yCoord] ) {

        var feature = {};

        // type
        feature.type = 'Feature';

        // geometry
        var geometry = {};
        geometry.type = 'Point';
        
        var coordinates = [ 
          records[i].values[xCoord],
          records[i].values[yCoord]
        ];
        geometry.coordinates = coordinates;

        feature.geometry = geometry;              

        // properties
        var properties = {};
        var popupContent = '<div class="leaflet-popup-content-fields" id="leafletPopupContentFields">';

        for (var j=0; j<contentFields.length; j++) {
          var fieldTitle = this._getFieldTitle(dataSource, contentFields[j]);
          var fieldValue = records[i].values[contentFields[j]];
          popupContent += '<b>' + fieldTitle + '</b>: ' + fieldValue + '</br>';
          properties[contentFields[j]] = fieldValue;
        }
        popupContent += "</div>";
        feature.properties = properties;
        
        // format the title based on the title field and/or its lookup field
        var titleFieldValue = records[i].values[markerProperties.titleField];
        titleFieldValue = View.dataSources.get(dataSource).formatLookupValue(
            markerProperties.titleField, titleFieldValue, records[i].values);

        var popupTitle = '<span class="leaflet-popup-content-title" id="leafletPopupContentTitle">';
        popupTitle += titleFieldValue + '</span>';
        feature.properties.popupTitle = popupTitle;
        
        //add marker action to popup
        if (markerProperties.markerOptions.markerActionTitle && markerProperties.markerOptions.markerActionCallback) {
          //<a class="action" id="actionLink" href="javascript: void(0);">Show Details</a>
          var popupAction = '<span class="leaflet-popup-action" id="leafletPopupAction"><a href="javascript: void(0);">';
          popupAction += markerProperties.markerOptions.markerActionTitle;
          popupAction += '</a></span>';

          popupContent += popupAction;
        }
        feature.properties.popupContent = popupContent;

        var keyValues = '';
        for (var k=0; k<keyFields.length; k++){
          var keyValue = records[k].values[keyFields[k]];
          if (k === 0) {
            keyValues = keyValue;
          } else if (k > 0) {
            keyValues += '|' + keyValue;
          }
        }
        feature.properties.keyValues = keyValues;

        // add to features
        features.push(feature);        
      } 
    }

    markerData.type = 'Feature Collection';
    markerData.features = features;

    return markerData;    
  },

  _displayMarkers: function(dataSource, markerData) {

    var me = this;

    // clear the marker layer
    //this.markerLayerGroup.clearLayers();
    // clear markers for this datasource only
    this._removeLayerFromLayerGroup(dataSource, this.markerLayerGroup);

    // get the marker properties
    var markerProperties = this._getMarkerPropertiesByDataSource(dataSource); 
    var usePopup = markerProperties.markerOptions.usePopup;   
    var geoJsonLayer = L.geoJson(markerData, {
        getDataSourceId: function(){
          return dataSource;
        },
        pointToLayer: function (feature, latlng) {
            var markerOptions = {
                    radius: getMarkerRadius(feature, markerProperties), 
                    fillColor: getMarkerFillColor(feature, markerProperties),
                    fillOpacity: markerProperties.markerOptions.fillOpacity,
                    stroke: markerProperties.markerOptions.stroke,
                    color: markerProperties.markerOptions.color,
                    weight: markerProperties.markerOptions.weight,
                    opacity: markerProperties.markerOptions.opacity,
                    riseOnHover: markerProperties.markerOptions.riseOnHover,
                    title: feature.properties.popupTitle,
                    content: feature.properties.popupContent,
                    dataSourceId: dataSource
            };

            var marker;
            switch (markerProperties.markerOptions.renderer){
              case 'proportional':
              case 'thematic-proportional-unique-values':
              case 'thematic-proportional-class-breaks':
                marker = L.circle(latlng, markerOptions.radius, markerOptions);
                break;

              default:
                marker = L.circleMarker(latlng, markerOptions);
                break;
            }
            return marker;            
        },

        onEachFeature: function(feature, layer){

            if (usePopup === true) {
              layer.bindPopup(
                  feature.properties.popupTitle + 
                  feature.properties.popupContent
              );              
            }

            layer.on('mouseover', function(evt){
                //console.log('Ab.leaflet.Base -> markerMouseOver...');

                // get title from marker
                var title = evt.target.options.title;

                // update the marker tooltip
                document.getElementById(me.divId + "_leafletMapMarkerTooltip").innerHTML = title; 

                // get the mouse location
                var px, py;        
                if (evt.containerPoint.x && evt.containerPoint.y) { 
                  px = evt.containerPoint.x;
                  py = evt.containerPoint.y;
                }
                //console.log('clientX:' + px + ",clientY: " + py);

                // show the tooltip at the mouse location
                var tooltipEl = document.getElementById(me.divId + "_leafletMapMarkerTooltip");          
                tooltipEl.style.display = 'none';
                tooltipEl.style.position = '';
                tooltipEl.style.left = (px + 15) + "px";
                tooltipEl.style.top = (py) + "px";
                tooltipEl.style.display = '';  
                tooltipEl.style.position = '';

                // add marker highlight
                var marker = evt.target;                
                marker.setStyle({
                    color: '#000',
                    stroke: true,
                    weight: 2.0,
                    opacity: 0.8,
                    fillOpacity: 1
                });  

                marker.bringToFront();

                // call the mouse over listener
                var markerMouseOver = me.getEventListener('markerMouseOver');
                if (markerMouseOver) {
                  var assetId = marker.feature.properties[markerProperties.keyFields[0]];
                  markerMouseOver(assetId, marker.feature);
                }     

            });
            layer.on('mouseout', function(evt){
                //console.log('Ab.leaflet.Base -> markerMouseOut...');

                var tooltipEl = document.getElementById(me.divId + "_leafletMapMarkerTooltip");          
                tooltipEl.innerHTML = ""; 
                tooltipEl.style.display = "none";

                // reset the marker style
                var marker = evt.target;
                var dataSourceId = marker.options.dataSourceId;
                var markerProperties = me._getMarkerPropertiesByDataSource(dataSourceId);
                marker.setStyle({
                    stroke: markerProperties.markerOptions.stroke,
                    color: markerProperties.markerOptions.color,
                    weight: markerProperties.markerOptions.weight,
                    opacity: markerProperties.markerOptions.opacity,
                    fillOpacity: markerProperties.markerOptions.fillOpacity
                });

                // call the mouse out listener
                var markerMouseOut = me.getEventListener('markerMouseOut');
                if (markerMouseOut) {
                  var assetId = marker.feature.properties[markerProperties.keyFields[0]];
                  markerMouseOut(assetId, marker.feature);
                }  

            });
            layer.on('click', function(evt){
                //console.log('Ab.leaflet.Base -> markerClick...');
                // call the mouse click listener
                var marker = evt.target;
                var markerClick = me.getEventListener('markerClick');
                if (markerClick) {
                  var assetId = marker.feature.properties[markerProperties.keyFields[0]];
                  markerClick(assetId, marker.feature);
                }     
            });        
        }
    });

    if (markerProperties.markerOptions.useClusters === true) {
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
                html: '<div style="leaflet-div-cluster-marker-label">' + (count) + '</div>',
                className: 'leaflet-div-cluster-marker',
                iconSize: [25,25]
            });
          }
      });
      markerClusters.addLayer(geoJsonLayer);
      this.map.addLayer(markerClusters);
      markerClusters.bringToFront();
      this.map.fitBounds(markerClusters.getBounds());
    } else {    
      this.markerLayerGroup.addLayer(geoJsonLayer);
      geoJsonLayer.bringToFront();
      this.map.fitBounds(geoJsonLayer.getBounds());
    }

    function getMarkerFillColor(feature, markerProperties){
      
      var fillColor, featureValue;

      switch (markerProperties.markerOptions.renderer) {
        
        case 'simple':
        case 'graduated-class-breaks':
        case 'proportional':
          fillColor = markerProperties.markerOptions.fillColor;
          break;

        case 'thematic-unique-values':
        case 'thematic-graduated-unique-values':
        case 'thematic-proportional-unique-values':

          featureValue = feature.properties[markerProperties.markerOptions.thematicField];
          for (var i=0; i<markerProperties.markerOptions.thematicRenderer.length; i++) {
            if (featureValue === markerProperties.markerOptions.thematicRenderer[i].uniqueValue){
              fillColor = markerProperties.markerOptions.thematicRenderer[i].color;   
            }
          }
          break;

        case 'thematic-class-breaks':
        case 'thematic-graduated-class-breaks':
        case 'thematic-proportional-class-breaks':
          featureValue = feature.properties[markerProperties.markerOptions.thematicField];
          for (var i=0; i<markerProperties.markerOptions.thematicRenderer.length; i++) {
            if (i === 0) {
              // first class break
              if (featureValue < markerProperties.markerOptions.thematicRenderer[0].maxValue) {
                fillColor = markerProperties.markerOptions.thematicRenderer[0].color;
                break;
              }
            } else if (i === markerProperties.markerOptions.thematicRenderer.length) {
              // last class break
              if (featureValue >= markerProperties.markerOptions.thematicRenderer[i].minValue) {
                fillColor = markerProperties.markerOptions.thematicRenderer[i].color;
                break;
              }          
            }
            else {
              // intermediate class break
              if (featureValue >= markerProperties.markerOptions.thematicRenderer[i].minValue && featureValue < markerProperties.markerOptions.thematicRenderer[i].maxValue) {
                fillColor = markerProperties.markerOptions.thematicRenderer[i].color;
                break;
              }             
            }
          }
          break;

        default:  
          break;  
      }
      //console.log('getMarkerFillColor-> value: ' + featureValue + ' color: ' + fillColor);
      return fillColor;

    }

    function getMarkerRadius(feature, markerProperties) {
      var markerRadius, proportionalField, radius, radiusIncrement, graduatedRenderer, graduatedField, featureValue;
      switch (markerProperties.markerOptions.renderer) {

        case 'graduated-class-breaks':
        case 'thematic-graduated-unique-values':
        case 'thematic-graduated-class-breaks':
          radius = markerProperties.markerOptions.radius;
          radiusIncrement = markerProperties.markerOptions.radiusIncrement;
          graduatedRenderer = markerProperties.markerOptions.graduatedRenderer;
          graduatedField = markerProperties.markerOptions.graduatedField;
          featureValue = feature.properties[graduatedField];

          for (var i=0; i<graduatedRenderer.length; i++) {
            if (i === 0) {
              // first class break
              if (featureValue < graduatedRenderer[0].maxValue) {
                markerRadius = graduatedRenderer[0].radius;
                break;
              }              

            } else if (i === graduatedRenderer.length) {
              // last class break
              if (featureValue >= graduatedRenderer[i].minValue) {
                markerRadius = graduatedRenderer[i].radius;
                break;
              }   
            }
            else {
              // intermediate class break
              if (featureValue >= graduatedRenderer[i].minValue && featureValue < graduatedRenderer[i].maxValue) {
                markerRadius = graduatedRenderer[i].radius;
                break;
              }            
            }
          }

          break;

        case 'proportional':
        case 'thematic-proportional-unique-values':
        case 'thematic-proportional-class-breaks':
          proportionalField = markerProperties.markerOptions.proportionalField;
          featureValue = feature.properties[proportionalField];
          markerRadius = parseFloat(featureValue);
          break;

        default:
          markerRadius = markerProperties.markerOptions.radius;
          break;  
      }
      //console.log('Ab.leaflet.Base -> getMarkerRadius -> value: ' + featureValue + ' radius: ' + markerRadius);
      return markerRadius;
    }

    // update marker layer
    this.markerLayer = geoJsonLayer;
    // update the legend
    this._updateLegendContent(markerProperties);
  },

  /**
   *  get data records
   *  @param dataSourceName. The dataSourceName.
   *  @param restriction. The Restriction.
   *  @return. The dataRecords.
   */
  _getDataSourceRecords: function(dataSourceName, restriction){
    var ds = View.dataSources.get(dataSourceName);
    return ds.getRecords(restriction);
  },

  /**
   *  get the field title from the dataSource 
   *  @param dataSource. The data source name.
   *  @param field. The field name; e.g. 'bl.bl_id'
   */
  _getFieldTitle: function(dataSource, field) {
    var ds = View.dataSources.get(dataSource);
    var items = ds.fieldDefs.items;
    
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var id = item.id;
      if( field === id ) {
        return item.title;
      }
    }     
    return "";
  },

  _removeLayerFromLayerGroup: function(dataSourceId, layerGroup){

    var layers = layerGroup._layers;
    for (var layerId in layers) {
      var layer = layers[layerId];
      if (layer.hasOwnProperty('options')) {
        if (layer.options.getDataSourceId() === dataSourceId){
          layerGroup.removeLayer(layer._leaflet_id);
        }
      }
    }

  },

  setView: function (center, zoom) {
      var me = this;

      if (me.map) {
          me.map.setView(center, zoom);
      }
  },

  getZoom: function(){
    var me = this,
             zoomLevel;

    if (me.map) {
      zoomLevel = me.map.getZoom();
    }
    
    return zoomLevel;
  },

  /*
  * Common marker group methods
  */
  createMarkerGroupLayer: function (lat, lon, markerOptions, popupContent) {
      var me = this,
          layer;

      if (Ext.isEmpty(lat) || Ext.isEmpty(lon)) {
          Log.log('Cannot create marker layer', 'error');
      } else {
          layer = L.circleMarker([lat, lon], 
                  markerOptions).bindPopup(popupContent);  
          me.markerLayerGroup.addLayer(layer);                
      }
  },

  clearMarkerGroupLayer: function (layerName) {
      var me = this,
          layer,
          layers = me.markerLayerGroup._layers;
      
      for (var layerId in layers) {
          layer = layers[layerId];
          if (layer.hasOwnProperty('options')) {
              if (layer.options.layerId === layerName) {
                  me.markerLayerGroup.removeLayer(layer._leaflet_id);
                  me.markerLayer = null;
              }
          }
      }  
  },

  getMarkerIdsInMapView: function( dataSourceId ) {
    var assetIds = [];
    var markerLayer = this.markerLayer;
    var mapExtent = this.map.getBounds();
    var markerProperties = this.dataSourceMarkerPairs.get(dataSourceId);
    var keyFields =  markerProperties.keyFields;

    // loop over markers in marker layer
    if (markerLayer){
      var markers = markerLayer._layers;
      for (var markerId in markers) {
        var marker = markers[markerId];       
        if (marker.hasOwnProperty('feature')) {
            if (mapExtent.contains(marker.getLatLng())){
              assetIds.push(marker.feature.properties[keyFields[0]]);
            }
        }
      }
    }

    return assetIds;
  },

 /**
  *
  * Locate asset methods.
  */
  startLocateAsset: function (lat, lon) {
      var me = this,
          mapCenter;
          
      // add the locate asset marker
      if(Ext.isEmpty(lat) || Ext.isEmpty(lon)){
          mapCenter = me.map.getCenter();
          lat = mapCenter.lat;
          lon = mapCenter.lng;
      } 
      me.addLocateAssetMaker(lat, lon);
      me.setView([lat, lon], 16); 

      // listen for map click
      // me.map.on('click', function(evt) {
      //     latLng = evt.latlng;
      //     lat = latLng.lat;
      //     lon = latLng.lng;
      //     me.moveLocateAssetMarker(lat, lon);
      // });
      
      me.map.on('click', me.onAssetLocateMapClick, this);
  },

  onAssetLocateMapClick: function(evt) {
      var me = this,
          latLng = evt.latlng,
          lat = latLng.lat,
          lon = latLng.lng;

      me.moveLocateAssetMarker(lat, lon);
  },

  addLocateAssetMaker: function (lat, lon) {
      var me = this,
          markerOptions = {
              radius: 10,
              fillColor: '#ffd700',
              fillOpacity: 1.0,
              stroke: true,
              color: '#fff',
              weight: 3,
              layerId: 'locateAssetLayer'
              //riseOnHover: _markerOptions.riseOnHover,
              //title: feature.id,
              //content: feature.properties
              },
          popupContent = '<div class="ab-map-popup-content-fields" id="abMapPopupContentFields">' +
                         'Asset location: <br>' + Number(lat).toFixed(7) + ', ' + Number(lon).toFixed(7) + '<br><br>' +
                         'Click to relocate this asset.' +
                         '</div>';
      
      me.createMarkerGroupLayer(lat, lon, markerOptions, popupContent);
  },

  moveLocateAssetMarker: function (lat, lon) {
      var me = this;

      me.clearMarkerGroupLayer('locateAssetLayer');
      me.addLocateAssetMaker(lat, lon);
  },

  finishLocateAsset: function () {
      var me = this,
          lat,
          lon,
          layers = me.markerLayerGroup._layers;

      // get final lat-lon
      for (var layerId in layers) {
          var layer = layers[layerId];
          if (layer.hasOwnProperty('options')) {
              if (layer.options.layerId === 'locateAssetLayer') {
                  lat = layer._latlng.lat;
                  lon = layer._latlng.lng;
                  break;
              }
          }
      }         

      // clear the locate asset layer
      me.clearMarkerGroupLayer('locateAssetLayer');

      // remove map click event
      me.map.off('click', me.onAssetLocateMapClick, this);

      // return the lat-lon
      return [Number(lat).toFixed(7), Number(lon).toFixed(7)];
  },

  cancelLocateAsset: function(){
    var me = this;

    // remove map click event
    me.map.off('click', me.onAssetLocateMapClick, this);
    
    // clear the locate asset layer
    me.clearMarkerGroupLayer('locateAssetLayer');
  },


});


Ab.leaflet.Map = Ab.view.Component.extend({
  
  // the Ab.leaflet.EsriMap or Ab.leaflet.GoogleMap control 
  mapClass: null,

  constructor: function(panelIdParam, divIdParam, configObject) {
    var variant = "ESRI";

    if (configObject.mapImplementation) {
      variant = configObject.mapImplementation.toUpperCase();
    }
    //console.log('Ab.leaflet.Map -> constructor... ' + variant);
    if (variant === "ESRI") {
      this.mapClass = new Ab.leaflet.EsriMap(panelIdParam, divIdParam, configObject);
    }
    else if (variant === "GOOGLE") {
      this.mapClass = new Ab.leaflet.GoogleMap(panelIdParam, divIdParam, configObject);
    }
    else {
      //console.log('Ab.leaflet.Map  -> Map constructor requested for unknown implementation: ' + variant);
    }
  },

  // create public map methods here to call respective _map implementation

  /*
  *  get layer names for all available basemap layers 
  */ 
  getBasemapLayerList: function() { 
    return this.mapClass.getBasemapLayerList();
  },

  /*
  *  get layer names for all available reference layers 
  */ 
  getReferenceLayerList: function() { 
    return this.mapClass.getReferenceLayerList();
  },

  /*
  *  switch the basemap layer 
  *  @param layerName Required The esri/google basemap layer name
  */ 
  switchBasemapLayer: function(layerName) { 
    this.mapClass.switchBasemapLayer(layerName);
  },

  /*
  *  switch the reference layer 
  *  @param layerName Required The esri/google basemap layer name
  */ 
  switchReferenceLayer: function(layerName) { 
    this.mapClass.switchReferenceLayer(layerName);
  },

  createMarkers: function(dataSource, keyFields, geometryFields, titleField, contentFields, markerProperties){
    this.mapClass.createMarkers(dataSource, keyFields, geometryFields, titleField, contentFields, markerProperties);
  },

  showMarkers: function(dataSource, restriction){
    this.mapClass.showMarkers(dataSource,restriction);
  },

  getMarkerIdsInMapView: function(dataSourceId){
    return this.mapClass.getMarkerIdsInMapView(dataSourceId);
  },

  clearMarkers: function(){
    this.mapClass.clearMarkers();
  },

  selectMarkersByAssetIds: function(assetIds, dataSourceId){
    this.mapClass.selectMarkersByAssetIds(assetIds, dataSourceId);
  },

  panToMarker: function(assetId, dataSourceId){
    this.mapClass.panToMarker(assetId, dataSourceId);
  },

  zoomToMarker: function(assetId, dataSourceId, zoomLevel){
    this.mapClass.zoomToMarker(assetId, dataSourceId, zoomLevel);
  },

  clearSelectedMarkers: function(){
    this.mapClass.clearSelectedMarkers();
  },

  showMarkerInfoWindow: function(htmlContent){
    this.mapClass.showMarkerInfoWindow(htmlContent);
  },

  hideMarkerInfoWindow: function(){
    this.mapClass.hideMarkerInfoWindow();
  },

  showMarkerLegend: function(){
    this.mapClass.showMarkerLegend();
  },

  hideMarkerLegend: function(){
    this.mapClass.hideMarkerLegend();
  },

  setView: function(center, zoom) {
    this.mapClass.setView(center, zoom);
  },

  getZoom: function(){
    return this.mapClass.getZoom();
  },

  startLocateAsset: function(lat, lon){
    this.mapClass.startLocateAsset(lat, lon);
  },

  finishLocateAsset: function(){
    return this.mapClass.finishLocateAsset();
  },

  cancelLocateAsset: function(){
    this.mapClass.cancelLocateAsset();
  }
  
});

/*
*   
*/
Ab.leaflet.EsriMap = Ab.leaflet.Base.extend({

  constructor: function(panelIdParam, divIdParam, configObject){
    //console.log('Ab.leaflet.EsriMap -> constructor...');

    this.inherit(panelIdParam, divIdParam, configObject);

    this.mapImplementation = "ESRI";

    // set the panel and div ids
    this.divId = divIdParam;
    this.panelId = panelIdParam;

    // initialize marker pairs
    this.dataSourceMarkerPairs = new Ext.util.MixedCollection();

    this._initMap(configObject);
  },

  // initialize the map
  _initMap: function(configObject) {

    var me = this;

    // create panel event handlers     
    this._createMapPanelEventHandlers();

    // create tooltip dom element
    this._createTooltipDomElement();

    // create the infowindow dom element
    this._createMarkerInfoWindowDomElement();

    // create legend dom element
    this._createLegendContainer();

    // default center and zoom 
    // North America
    var mapCenter =  [37.30028, -98.26172],
        mapZoom = 3;

    if (configObject.mapCenter) {
      mapCenter = configObject.mapCenter;
    }    
    if (configObject.mapZoom) {
      mapZoom = configObject.mapZoom;
    }

    // create the leaflet map
    this.map = L.map(this.divId);

    // add map load listener
    this.map.on('load', function(){
      //console.log('Ab.leaflet.EsriMap -> mapLoad...');
      if (configObject.onMapLoad){
        var onMapLoad = configObject.onMapLoad;
        onMapLoad();
      }
    });

    // add map extent change listeners
    this.map.on('moveend', function(event){
      //console.log('Ab.leaflet.EsriMap -> mapViewChange...');
      var mapViewChange = me.getEventListener('mapViewChange');
      if (mapViewChange) {
        mapViewChange(event.target);
      }  
    });

    // add map click listeners
    this.map.on('click', function(event){
      //console.log('Ab.leaflet.EsriMap -> mapClick...');
      var mapClick = me.getEventListener('mapClick');
      if (mapClick) {
        mapClick(event.target);
      }  
    });    

    // set the initial view
    this.map.setView(mapCenter, mapZoom);

    // add basemap layer group
    this.basemapLayerGroup = L.layerGroup();
    this.basemapLayerGroup.addTo(this.map);

    // build the basemap layer list
    this._buildBasemapLayerList();

    // add reference layer group
    this.referenceLayerGroup = L.layerGroup();
    this.referenceLayerGroup.addTo(this.map);

    // add marker layer group
    this.markerLayerGroup = L.layerGroup();
    this.markerLayerGroup.addTo(this.map);

    // build the reference layer list
    this._buildReferenceLayerList();

    // set default basemap
    var basemap = this.basemapLayerList.keys[0];
    if (configObject.basemap) {
      basemap = configObject.basemap;
    }
    this.switchBasemapLayer(basemap);  

    //TODO rewire this using event listeners
    //add popup listeners -- copy to google control as well
    var mapControl = this;
    this.map.on('popupopen', function(e) {
      var marker = e.popup._source;
      //console.log('Ab.leaflet.EsriMap -> Popup opened...');
      var popupAction = document.getElementById('leafletPopupAction');
      if (popupAction) {
        popupAction.addEventListener('click', function() {
          //console.log('Ab.leaflet.EsriMap -> Popup action clicked...');
          //var leafletPopupTitle = document.getElementById('leafletPopupContentTitle').innerHTML;
          //mapControl.markerActionCallback(leafletPopupTitle);
          var keyValues = marker.feature.properties.keyValues;
          mapControl.markerActionCallback(keyValues);
        });
      }
    }); 

  },

  // build the layerName-layerKey pairs for Esri basemap layers
  _buildBasemapLayerList: function() {

    this.basemapLayerList = new Ext.util.MixedCollection();
    
    var msg = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY_WITH_LABELS);
    this.basemapLayerList.add(msg, {layerKey: "ImageryLabels"});
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_IMAGERY);
    this.basemapLayerList.add(msg, {layerKey: "Imagery"}); 
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_STREET_MAP);
    this.basemapLayerList.add(msg, {layerKey: "Streets"});
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY);
    this.basemapLayerList.add(msg, {layerKey: "ShadedRelief"});   
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_TOPOGRAPHIC_MAP);
    this.basemapLayerList.add(msg, {layerKey: "Topographic"});
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_LIGHT_GRAY_BASE);
    this.basemapLayerList.add(msg, {layerKey: "Gray"});
    msg = View.getLocalizedString(this.z_MESSAGE_WORLD_DARK_GRAY_BASE);
    this.basemapLayerList.add(msg, {layerKey: "DarkGray"});
    msg = View.getLocalizedString(this.z_MESSAGE_NATGEO_WORLD_MAP);
    this.basemapLayerList.add(msg, {layerKey: "NationalGeographic"});
    msg = View.getLocalizedString(this.z_MESSAGE_OCEAN_BASEMAP);
    this.basemapLayerList.add(msg, {layerKey: "Oceans"}); 

  },

  // build the layerName-layerKey pairs for esri reference layers
  _buildReferenceLayerList: function() {

    this.referenceLayerList = new Ext.util.MixedCollection();

    var msg = View.getLocalizedString(this.z_MESSAGE_NO_REFERENCE_LAYER);
    this.referenceLayerList.add(msg, "");

    msg = View.getLocalizedString(this.z_MESSAGE_USA_HOUSEHOLD_SIZE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Average_Household_Size/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_SOCIAL_VULNERABILITY_INDEX);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Social_Vulnerability_Index/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_LABOR_FORCE_PARTICIPATION_RATE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Labor_Force_Participation_Rate/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_AGE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Age/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_HOME_VALUE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Home_Value/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_MEDIAN_NET_WORTH);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Median_Net_Worth/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_OWNER_OCCUPIED_HOUSING);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Owner_Occupied_Housing/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_BY_SEX);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_by_Sex/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_OVER_64);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Over_64/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_PERCENT_UNDER_18);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Percent_Under_18/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_POPULATION_DENSITY);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Population_Density/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_PROJECTED_POPULATION_CHANGE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Projected_Population_Change/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_RECENT_POPULATION_CHANGE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Recent_Population_Change/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_RETAIL_SPENDING_POTENTIAL);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Retail_Spending_Potential/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_TAPESTRY);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Tapestry/MapServer"});
    msg = View.getLocalizedString(this.z_MESSAGE_USA_UNEMPLOYMENT_RATE);
    this.referenceLayerList.add(msg, {url: "https://server.arcgisonline.com/ArcGIS/rest/services/Demographics/USA_Unemployment_Rate/MapServer"});

  },

  /*
  *  switch the basemap layer 
  * @param layerName Required The esri basemap layerName
  */ 
  switchBasemapLayer: function(layerName) { 
    var basemap,
        layer,
        labelsLayer;

    // clear basemap layers
    this.basemapLayerGroup.clearLayers();

    // get the layer key
    basemap = this.basemapLayerList.get(layerName).layerKey;

    // handle bad layerName
    if (!basemap){
      //console.log('Ab.leaflet.Map -> Invalid basemap layer name: ' + layerName);
      basemap = 'ImageryLabels';
    }
    
    if (basemap === 'ImageryLabels') {
      layer = L.esri.basemapLayer('Imagery',{
        id: 'basemap',
        attribution: ''
      });
      this.basemapLayerGroup.addLayer(layer);
      labelsLayer = L.esri.basemapLayer('ImageryLabels', {
        id: 'basemapLabels',
        attribution: ''
      });
      this.basemapLayerGroup.addLayer(labelsLayer);
    } else if (basemap === 'Oceans' || basemap === 'ShadedRelief') {
      layer = L.esri.basemapLayer(basemap, {
        id: 'basemap',
        attribution: ''
      });
      this.basemapLayerGroup.addLayer(layer, {
        id: 'basemapLabels',
        attribution: ''
      });
      labelsLayer = L.esri.basemapLayer(basemap + 'Labels');
      this.basemapLayerGroup.addLayer(labelsLayer);
    } else {
      layer = L.esri.basemapLayer(basemap, {
        id: 'basemap',
        attribution: ''
      });
      this.basemapLayerGroup.addLayer(layer);
    }

  },

  /*
   *  switch the reference layer
   *  @param layerName  Required  The new layer name
   */
  switchReferenceLayer: function(layerName) {
    var layer,
        layerUrl,
        layerOptions;

    // clear referene layers
    this.referenceLayerGroup.clearLayers();

    // get the layer url
    layerUrl = this.referenceLayerList.get(layerName).url;

    // set layer options
    layerOptions = {
      opacity: 0.75
    };

    // add the reference layer
    layer = L.esri.tiledMapLayer(layerUrl, layerOptions);
    this.referenceLayerGroup.addLayer(layer);

  }

});

Ab.leaflet.GoogleMap = Ab.leaflet.Base.extend({

  constructor: function(panelIdParam, divIdParam, configObject){
    this.inherit(panelIdParam, divIdParam, configObject);

    this.mapImplementation = "GOOGLE";

    // set the panel and div ids
    this.divId = divIdParam;
    this.panelId = panelIdParam;

    // initialize marker pairs
    this.dataSourceMarkerPairs = new Ext.util.MixedCollection();

    this._initMap(configObject); 
  },

  // initialize the map
  _initMap: function(configObject) {

    // add panel event handlers     
    this._createMapPanelEventHandlers();

    // create tooltop dom element
    this._createTooltipDomElement();

    // create legend dom element
    this._createLegendContainer();

    // default center and zoom 
    // North America
    var mapCenter =  [37.30028, -98.26172],
        mapZoom = 3;

    if (configObject.mapCenter) {
      mapCenter = configObject.mapCenter;
    }    
    if (configObject.mapZoom) {
      mapZoom = configObject.mapZoom;
    }

    // create the leaflet map
    this.map = L.map(this.divId).setView(mapCenter, mapZoom);
    
    // add basemap layer group
    this.basemapLayerGroup = L.layerGroup();
    this.basemapLayerGroup.addTo(this.map);

    // add marker layer group
    this.markerLayerGroup = L.layerGroup();
    this.markerLayerGroup.addTo(this.map);

    // build the basemap layer list
    this._buildBasemapLayerList();

    // set default basemap
    var basemap = this.basemapLayerList.keys[2];
    if (configObject.basemap) {
      basemap = configObject.basemap;
    }
    this.switchBasemapLayer(basemap); 

    //add popup listeners
    var mapControl = this;
    this.map.on('popupopen', function(e) {
      var marker = e.popup._source;
      //console.log('Ab.leaflet.GoogleMap -> Popup opened...');
      var popupAction = document.getElementById('leafletPopupAction');
      if (popupAction) {
        popupAction.addEventListener('click', function() {
          //console.log('Ab.leaflet.GoogleMap -> Popup action clicked...');
          //var leafletPopupTitle = document.getElementById('leafletPopupContentTitle').innerHTML;
          //mapControl.markerActionCallback(leafletPopupTitle);
          var keyValues = marker.feature.properties.keyValues;
          mapControl.markerActionCallback(keyValues);
        });
      }
    }); 

  },

    // build the layerName-layerKey pairs for google basemap layers
  _buildBasemapLayerList: function() {

    this.basemapLayerList = new Ext.util.MixedCollection();

    var msg = View.getLocalizedString(this.z_MESSAGE_ROADMAP);
    this.basemapLayerList.add(msg, {layerKey: "ROADMAP"}); 
    msg = View.getLocalizedString(this.z_MESSAGE_SATELLITE);
    this.basemapLayerList.add(msg, {layerKey: "SATELLITE"});
    msg = View.getLocalizedString(this.z_MESSAGE_HYBRID);
    this.basemapLayerList.add(msg, {layerKey: "HYBRID"});   
    msg = View.getLocalizedString(this.z_MESSAGE_TERRAIN);
    this.basemapLayerList.add(msg, {layerKey: "TERRAIN"});

  },

  /*
  *  switch the basemap layer 
  * @param layerName Required The esri basemap layerName
  */ 
  switchBasemapLayer: function(layerName) { 

    var basemap;

    // clear basemap layers
    this.basemapLayerGroup.clearLayers();

    // get the layer key
    basemap = this.basemapLayerList.get(layerName).layerKey;

    // handle bad layerName
    if (!basemap){
      //console.log('Ab.leaflet.GoogleMap -> Invalid basemap layer name: ' + layerName);
      basemap = 'HYBRID';
    }
    
    var google = new L.Google(basemap);
    this.basemapLayerGroup.addLayer(google);
  
  }

});

/*
 *   This class define common properties for a group of markers 
 */ 
Ab.leaflet.Marker = Base.extend({    

  //the dataSource associated with markers
  dataSource: null,
  
  //fields defined in dataSource
  keyFields: null,
  geometryFields: null,
  titleField: null,
  contentFields: null,

  //default marker options
  markerOptions: null,
    // renderer:
    // radius:
    // fillColor:
    // fillOpacity: 
    // stroke:
    // color:
    // weight: 
    // riseOnHover:

  /*
     *  constructor
     *  @param dataSourceParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param titleFieldParam. The data field which defines the popup title.
     *  @param contentFieldsParam.  The data fields which define the popup content.
     *  @param markerOptionsParam. Overide various marker options.
     */
  constructor: function(dataSourceParam, keyFieldsParam, geometryFieldsParam, titleFieldParam, contentFieldsParam, markerOptionsParam) {

      this.dataSource = dataSourceParam;
      this.keyFields = keyFieldsParam;
      this.geometryFields = geometryFieldsParam;
      this.titleField = titleFieldParam;
      this.contentFields = contentFieldsParam;

      if (!markerOptionsParam){
        markerOptionsParam = {};
      }
      this._parseMarkerOptions(markerOptionsParam);

  },

  _parseMarkerOptions: function(markerOptions){

    var _markerOptions = {};

    _markerOptions.renderer = 'simple';
    _markerOptions.radius = markerOptions.radius || 7;
    _markerOptions.fillColor = markerOptions.fillColor || '#e41a1c';
    _markerOptions.fillOpacity = markerOptions.fillOpacity || 0.9;
    
    _markerOptions.stroke = true;
    if (markerOptions.hasOwnProperty('stroke')){
      if (markerOptions.stroke === 'false' || markerOptions.stroke === false) {
        _markerOptions.stroke = false;
      }
    } 

    _markerOptions.color = markerOptions.strokeColor || '#fff';
    _markerOptions.weight = markerOptions.strokeWeight || 1.0;
    _markerOptions.opacity = markerOptions.opacity || 1.0;
    
    _markerOptions.riseOnHover = true;
    if (markerOptions.hasOwnProperty('riseOnHover')){
      if (markerOptions.riseOnHover === 'false' || markerOptions.riseOnHover === false) {
      _markerOptions.riseOnHover = false;
      } 
    } 
    _markerOptions.useClusters = false;
    if (markerOptions.hasOwnProperty('useClusters')){
      if (markerOptions.useClusters === 'true' || markerOptions.useClusters === true) {
        _markerOptions.useClusters = true;
      } 
    } 
    _markerOptions.usePopup = true;
    if (markerOptions.hasOwnProperty('usePopup')){
      if (markerOptions.usePopup === 'false' || markerOptions.usePopup === false) {
        _markerOptions.usePopup = false;
      } 
    } 

    _markerOptions.markerActionTitle = markerOptions.markerActionTitle || null;
    _markerOptions.markerActionCallback = markerOptions.markerActionCallback || null;

    this.markerOptions = _markerOptions;

  },

  _getUniqueValues: function(field){
    // TODO
    // add restriction to this method if possible
    // current behavior returns all unique values and does not respect 
    // a restriction that might be defined in the data source
    // it would be nice to respect the restriction defined in the datasource

    var values = [];
    try {
      var temp = field.split(".");
      var table = temp[0];
      var parameters = {
        tableName: table,
        fieldNames: toJSON([field]),
        sortValues: toJSON([{'fieldName': field, 'sortOrder':1}]), 
        recordLimit: 0,     
        isDistinct: true
      };

      var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
      var rows = result.data.records;
      for(var i=0; i<rows.length; i++){
        values.push(rows[i][field]);
      }
      return values;
    } catch (e) {
      Workflow.handleError(e);
    }
    return values;
  },

  _getColorbrewerColors: function(colorBrewerClass, numberOfColors){
    var colors = [];
    if (colorbrewer && colorbrewer[colorBrewerClass][numberOfColors]) {
      colors = colorbrewer[colorBrewerClass][numberOfColors];
    } else if (colorbrewer) {
      var colors = _.values(colorbrewer[colorBrewerClass])[_.values(colorbrewer[colorBrewerClass]).length-1];
      var colorsNeeded = numberOfColors - colors.length;
      for (i=0;i<colorsNeeded;i++){
        colors.push(colors[i]);
      }
    } else {
      // colorbrewer is not loaded
    }
    return colors;
  }

});

/*
 *   This class define common properties for a group of thematic, graduated, and/or proportional markers 
 */ 

Ab.leaflet.ThematicMarker = Ab.leaflet.Marker.extend({    

  /*
     *  constructor
     *  @param dataSourceParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param titleFieldParam. The data field which defines the popup title.
     *  @param contentFieldsParam.  The data fields which define the popup content.
     *  @param markerOptionsParam. Overide various marker options.
     */
     
  constructor: function(dataSourceParam, keyFieldsParam, geometryFieldsParam, titleFieldParam, contentFieldsParam, markerOptionsParam) {
      this.inherit(dataSourceParam, keyFieldsParam, geometryFieldsParam, titleFieldParam, contentFieldsParam, markerOptionsParam);
  },

  //thematic  marker options
    // renderer: 'thematic-unique-values', 'thematic-class-breaks'
    // thematicField:
    // thematicClassBreaks: 
    // uniqueValues:
    // colorBrewerClass:

  _parseMarkerOptions: function(markerOptions){

    var _markerOptions = {};

    _markerOptions.renderer = markerOptions.renderer;
    _markerOptions.radius = markerOptions.radius || 7;
    _markerOptions.fillColor = markerOptions.fillColor || '#e41a1c';
    _markerOptions.fillOpacity = markerOptions.fillOpacity || 0.9;
    
    _markerOptions.stroke = true;
    if (markerOptions.hasOwnProperty('stroke')){
      if (markerOptions.stroke === 'false' || markerOptions.stroke === false) {
        _markerOptions.stroke = false;
      }
    } 

    _markerOptions.color = markerOptions.strokeColor || '#fff';
    _markerOptions.weight = markerOptions.strokeWeight || 1.0;
    _markerOptions.opacity = markerOptions.opacity || 1.0;

    _markerOptions.riseOnHover = true;
    if (markerOptions.hasOwnProperty('riseOnHover')){
      if (markerOptions.riseOnHover === 'false' || markerOptions.riseOnHover === false) {
      _markerOptions.riseOnHover = false;
      } 
    } 
    _markerOptions.useClusters = false;
    if (markerOptions.hasOwnProperty('useClusters')){
      if (markerOptions.useClusters === 'true' || markerOptions.useClusters === true) {
        _markerOptions.useClusters = true;
      } 
    } 
    _markerOptions.usePopup = true;
    if (markerOptions.hasOwnProperty('usePopup')){
      if (markerOptions.usePopup === 'false' || markerOptions.usePopup === false) {
        _markerOptions.usePopup = false;
      } 
    } 

    _markerOptions.markerActionTitle = markerOptions.markerActionTitle || null;
    _markerOptions.markerActionCallback = markerOptions.markerActionCallback || null;

    //thematic marker options
    _markerOptions.thematicField = markerOptions.thematicField;
    _markerOptions.uniqueValues = markerOptions.uniqueValues || [];
    _markerOptions.thematicClassBreaks = markerOptions.thematicClassBreaks || [];
    _markerOptions.thematicLegendLabels = markerOptions.thematicLegendLabels || [];
    _markerOptions.colorBrewerClass = markerOptions.colorBrewerClass || '';

    // graduated marker options
    _markerOptions.graduatedField = markerOptions.graduatedField;
    _markerOptions.graduatedClassBreaks = markerOptions.graduatedClassBreaks || [];
    _markerOptions.graduatedLegendLabels = markerOptions.graduatedLegendLabels || [];
    _markerOptions.radiusIncrement = markerOptions.radiusIncrement || 5;

    // proportional marker options
    _markerOptions.proportionalField = markerOptions.proportionalField;

    this.markerOptions = _markerOptions;

    var thematicRenderer = [];
    var graduatedRenderer = [];
    var rendererColors; 

    switch (this.markerOptions.renderer) {
      
      case 'thematic-unique-values':
      case 'thematic-proportional-unique-values':
        // get distinct fields
        if (this.markerOptions.uniqueValues.length === 0){
          this.markerOptions.uniqueValues = this._getUniqueValues(this.markerOptions.thematicField);
        }
        // get colorBrewer colors
        if (this.markerOptions.colorBrewerClass === '') {
          this.markerOptions.colorBrewerClass = 'Paired2';
        }
        rendererColors = this._getColorbrewerColors(this.markerOptions.colorBrewerClass, this.markerOptions.uniqueValues.length);
        // create renderer
        for (i=0; i<this.markerOptions.uniqueValues.length; i++) {
          thematicRenderer.push({
            uniqueValue: this.markerOptions.uniqueValues[i],
            color: rendererColors[i]
          });

        }
        this.markerOptions.thematicRenderer = thematicRenderer;
        break;

      case 'thematic-class-breaks':
      case 'thematic-proportional-class-breaks':
        // get colorBrewer colors
        if (this.markerOptions.colorBrewerClass === '') {
          this.markerOptions.colorBrewerClass = 'Reds';
        }
        rendererColors = this._getColorbrewerColors(this.markerOptions.colorBrewerClass, this.markerOptions.thematicClassBreaks.length+1);
        
        // create renderer
        for (i=0; i<this.markerOptions.thematicClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            thematicRenderer.push({
              minValue: -Infinity,
              maxValue: this.markerOptions.thematicClassBreaks[0],
              color: rendererColors[0]
            });
          } else if (i === this.markerOptions.thematicClassBreaks.length) {
            // last class break
            thematicRenderer.push({
              minValue: this.markerOptions.thematicClassBreaks[i-1],
              maxValue: +Infinity,
              color: rendererColors[i]
            });            
          }
          else {
            // intermediate class break
            thematicRenderer.push({
              minValue: this.markerOptions.thematicClassBreaks[i-1],
              maxValue: this.markerOptions.thematicClassBreaks[i],
              color: rendererColors[i]
            }); 
          }
        }
        break;

      case 'graduated-class-breaks':
        // create renderer
        for (i=0; i<this.markerOptions.graduatedClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            graduatedRenderer.push({
              minValue: -Infinity,
              maxValue: this.markerOptions.graduatedClassBreaks[0],
              radius: this.markerOptions.radius
            });
          } else if (i === this.markerOptions.graduatedClassBreaks.length) {
            // last class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: +Infinity,
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            });            
          }
          else {
            // intermediate class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: this.markerOptions.graduatedClassBreaks[i],
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            }); 
          }
        }

        break;

      case 'thematic-graduated-unique-values':
        // get distinct fields
        if (this.markerOptions.uniqueValues.length === 0){
          this.markerOptions.uniqueValues = this._getUniqueValues(this.markerOptions.thematicField);
        }
        // get colorBrewer colors
        if (this.markerOptions.colorBrewerClass === '') {
          this.markerOptions.colorBrewerClass = 'Paired2';
        }
        rendererColors = this._getColorbrewerColors(this.markerOptions.colorBrewerClass, this.markerOptions.uniqueValues.length);
        // create thematic renderer
        thematicRenderer = []; 
        for (var i=0; i<this.markerOptions.uniqueValues.length; i++) {

          thematicRenderer.push({
            uniqueValue: this.markerOptions.uniqueValues[i],
            color: rendererColors[i]
          });

        }

        // create graduated renderer
        for (var i=0; i<this.markerOptions.graduatedClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            graduatedRenderer.push({
              minValue: -Infinity,
              maxValue: this.markerOptions.graduatedClassBreaks[0],
              radius: this.markerOptions.radius
            });
          } else if (i === this.markerOptions.graduatedClassBreaks.length) {
            // last class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: +Infinity,
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            });            
          }
          else {
            // intermediate class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: this.markerOptions.graduatedClassBreaks[i],
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            }); 
          }
        }
        break;

      case 'thematic-graduated-class-breaks':
        // create thematic renderer
        // get colorBrewer colors
        if (this.markerOptions.colorBrewerClass === '') {
          this.markerOptions.colorBrewerClass = 'Reds';
        }
        rendererColors = this._getColorbrewerColors(this.markerOptions.colorBrewerClass, this.markerOptions.thematicClassBreaks.length+1);
        for (var i=0; i<this.markerOptions.thematicClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            thematicRenderer.push({
              minValue: -Infinity,
              maxValue: this.markerOptions.thematicClassBreaks[0],
              color: rendererColors[0]
            });
          } else if (i === this.markerOptions.thematicClassBreaks.length) {
            // last class break
            thematicRenderer.push({
              minValue: this.markerOptions.thematicClassBreaks[i-1],
              maxValue: +Infinity,
              color: rendererColors[i]
            });            
          }
          else {
            // intermediate class break
            thematicRenderer.push({
              minValue: this.markerOptions.thematicClassBreaks[i-1],
              maxValue: this.markerOptions.thematicClassBreaks[i],
              color: rendererColors[i]
            }); 
          }
        }
        // add thematic labels
        if (this.markerOptions.thematicLegendLabels.length === this.markerOptions.thematicClassBreaks.length+1) {
          for (var j=0; j<this.markerOptions.thematicClassBreaks.length+1; j++){
            var label = this.markerOptions.thematicLegendLabels[j];
            thematicRenderer[j].label = label;
          }
        }

        // create graduated renderer
        for (var i=0; i<this.markerOptions.graduatedClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            graduatedRenderer.push({
              minValue: -Infinity,
              maxValue: this.markerOptions.graduatedClassBreaks[0],
              radius: this.markerOptions.radius
            });
          } else if (i === this.markerOptions.graduatedClassBreaks.length) {
            // last class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: +Infinity,
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            });            
          }
          else {
            // intermediate class break
            graduatedRenderer.push({
              minValue: this.markerOptions.graduatedClassBreaks[i-1],
              maxValue: this.markerOptions.graduatedClassBreaks[i],
              radius: this.markerOptions.radius +  (i * this.markerOptions.radiusIncrement)
            }); 
          }
        }
        // add graduated labels
        if (this.markerOptions.graduatedLegendLabels.length === this.markerOptions.graduatedClassBreaks.length+1) {
          for (var j=0; j<this.markerOptions.graduatedClassBreaks.length+1; j++){
            var label = this.markerOptions.graduatedLegendLabels[j];
            graduatedRenderer[j].label = label;
          }
        }
        break;

      default:
        //console.log('Ab.leaflet.ThematicMarker -> Marker renderer not found: ' + this.markerOptions.renderer);
        break;    
    }

    this.markerOptions.thematicRenderer = thematicRenderer;
    this.markerOptions.graduatedRenderer = graduatedRenderer;
    
  }

});