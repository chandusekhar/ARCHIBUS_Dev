/**
 * ab-leaflet-map-extensions.js
 *
 */

/**
 * This defines the enhanced leaflet map control.
 */
Ab.namespace('leaflet');

Ab.leaflet.BaseExtensions = Ab.leaflet.Base.extend({

    // Ext.util.MixedCollection
    // A list of feature layer names and layer configuration options 
    featureLayerList: null,

    // holds a reference to the leaflet feature layer group
    feautreLayerGroup: null,

    // featureLayer tooltip
    featureLayerTooltip: null,

    // featureLayer info window
    featureLayerInfoWindow: null,

    // the current feature layer name
    featureLayerName: null,

    // the current feature properties id
    featurePropertiesId: null,

    // holds a list of feature properties
    featurePropertiesPairs: null, 

    // a list of feature data
    // Ext.util.MixedCollection
    featureData: null,

    // feature layer geometry
    // GeoJSON Feature Collection
    featureGeometry : null,

});

Ab.leaflet.MapExtensions = Ab.view.Component.extend({
 
  // the Ab.leaflet.EsriMap or Ab.leaflet.GoogleMap control 
  mapClass: null,

  constructor: function(panelIdParam, divIdParam, configObject) {
    var variant = "ESRI";

    // initialize event listeners
    this.eventListeners = new Ext.util.MixedCollection(true);

    if (configObject.mapImplementation) {
      variant = configObject.mapImplementation.toUpperCase();
    }
    //console.log('Ab.leaflet.MapExtensions -> constructor... ' + variant);
    if (variant === "ESRI") {
      this.mapClass = new Ab.leaflet.EsriMapExtensions(panelIdParam, divIdParam, configObject);
    }
    else if (variant === "GOOGLE") {
      //this.mapClass = new Ab.leaflet.GoogleMapExtensions(panelIdParam, divIdParam, configObject);
      //console.log('Google Map implementation not supported at this time.');
    }
    else {
      //console.log('Map constructor requested for unknown implementation: ' + variant);
    }
  },

  // create public map methods here to call respective _map implementation


  /**
   *  Enhanced map control functions
   */

   getBasemapLayerList: function(){
      return this.mapClass.getBasemapLayerList();
   },

  getReferenceLayerList: function() { 
    return this.mapClass.getReferenceLayerList();
  },

  switchBasemapLayer: function(layerName) { 
    this.mapClass.switchBasemapLayer(layerName);
  },

  switchReferenceLayer: function(layerName) { 
    this.mapClass.switchReferenceLayer(layerName);
  },
  
   createFeatureProperties: function(featurePropertiesId, dataSourceType, dataSource, keyField, titleField, contentFields, featureProperties){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.createFeatureProperties(featurePropertiesId, dataSourceType, dataSource, keyField, titleField, contentFields, featureProperties);
    }
   },

  showFeatures: function(featureLayerName, featurePropertiesId, restriction){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.showFeatures(featureLayerName, featurePropertiesId, restriction);
    }
  },

  selectFeaturesByAssetIds: function(assetIds) {
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.selectFeaturesByAssetIds(assetIds);
    }
  },

  clearSelectedFeatures: function(){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.clearSelectedFeatures();
    } 
  },

  highlightFeaturesByAssetIds: function(assetIds){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.highlightFeaturesByAssetIds(assetIds);
    } 
  },

  clearHighlightedFeatures: function(){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.clearHighlightedFeatures();
    } 
  },

  clearFeatures: function(){
    if (this.mapClass.mapImplementation === "ESRI"){
      this.mapClass.clearFeatures();
    }     
  },

  /*
  *  Common enhanced map control functions
  */

  getDistinctFieldValuesFromDataSource: function(field, whereClause){
    var values = [];
    try {
        var temp = field.split(".");
        var table = temp[0];
        var parameters = {
            tableName: table,
            fieldNames: toJSON([field]),
            sortValues: toJSON([{'fieldName': field, 'sortOrder':1}]), 
            recordLimit: 0,         
            isDistinct: true,
            restriction: toJSON(whereClause)
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

  getDistinctFieldValuesDataSourceForWhereClause: function(field, whereClause){

    var fieldValuesString = '';
    var fieldValuesArray = this.getDistinctFieldValuesFromDataSource(field, whereClause);

    for (var i=0; i<fieldValuesArray.length; i++) {
      if (i === 0) {
        fieldValuesString = "'" + fieldValuesArray[i] + "'";
      } else {
        fieldValuesString += ",'" + fieldValuesArray[i] + "'";
      }
    } 

    return fieldValuesString;
  },

});

Ab.leaflet.EsriMapExtensions = Ab.leaflet.EsriMap.extend({

  constructor: function(panelIdParam, divIdParam, configObject){
    //console.log('Ab.leaflet.EsriMapExtensions -> constructor...');

    this.inherit(panelIdParam, divIdParam, configObject);
    
    this.featurePropertiesPairs = new Ext.util.MixedCollection();

    this.initFeatureLayer(configObject);
  },


  initFeatureLayer: function(configObject) {

    this.buildFeatureLayerList(configObject);

    this.createFeatureTooltipDomElements();

    //TODO

    //this._createFeatureLayerInfoWindowDomElements();
    //this._createFeatureLayerLegendDomElements();
    //this._createFeatureLayerDefaultSymbol();

    // create the feature layer group
    this.featureLayerGroup = L.layerGroup();
    this.featureLayerGroup.addTo(this.map);

  },

  buildFeatureLayerList: function(configObject){

    //console.log('Ab.leaflet.EsriMapExtensions -> buildFeatureLayerList...');

    this.featureLayerList = new Ext.util.MixedCollection();

    if (configObject.hasOwnProperty('featureLayerList')) {
        var _featureLayerList = configObject.featureLayerList;

       for (var i = 0; i < _featureLayerList.length; i++) {
            this.featureLayerList.add(_featureLayerList[i].name, {
                url: _featureLayerList[i].url,
                assetIdField: _featureLayerList[i].assetIdField,
                objectIdField: _featureLayerList[i].objectIdField,
                outFields: _featureLayerList[i].outFields || '[*]',
                toolTipField: _featureLayerList[i].toolTipField || '',
                assetTypeField: _featureLayerList[i].assetTypeField,
            });
        }

    } else {
        // TODO message user
        //console.log('Ab.leaflet.EsriMapExtensions -> configObject.featureLayerList does not exist.');
    }


  },

  createFeatureTooltipDomElements: function() {

    // create the tooltip element
    var tooltipDiv = document.createElement('div');
    tooltipDiv.id = this.divId + '_leafletFeatureTooltip';
    tooltipDiv.className = 'leaflet-feature-tooltip';
    tooltipDiv.style.display = 'none';
    // append the tooltip element to the map element
    var mapDiv = document.getElementById(this.divId);
    mapDiv.appendChild(tooltipDiv);

  }, 


  createFeatureProperties: function(featurePropertiesId, dataSourceType, dataSource, keyField, titleField, contentFields, featureProperties){

      var _featureProperties;
      
      var _renderer = featureProperties.renderer || 'simple';
      switch (_renderer) {
        case 'simple':
          _featureProperties = new Ab.leaflet.FeatureProperties(dataSourceType, dataSource, keyField, titleField, contentFields, featureProperties);
          break;

        case 'thematic-class-breaks':
        case 'thematic-unique-values':
          _featureProperties = new Ab.leaflet.FeatureProperties(dataSourceType, dataSource, keyField, titleField, contentFields, featureProperties);
          break;

        default:
          //console.log('Error - Unsupported feature renderer : ' + _renderer);
          break;    
      }   

      if( this._getFeaturePropertiesById(featurePropertiesId) === null ) {
        this.featurePropertiesPairs.add(featurePropertiesId, _featureProperties);
      }
      else {
        this.featurePropertiesPairs.replace(featurePropertiesId, _featureProperties);
      }      

  },

  // 
  showFeatures: function(featureLayerName, featurePropertiesId, restriction){
    //console.log('Ab.leaflet.EsriMapExtensions -> showFeatures -> featureLayerName=' + featureLayerName); 

    // clear existing features
    this.featureLayerGroup.clearLayers();
    this.featureLayerName = null;
    this.featurePropertiesId = null;
    this.featureData = null;
    this.featureGeometry = null;

    this.featureLayerName = featureLayerName;
    this.featurePropertiesId = featurePropertiesId;

    var featureProperties = this._getFeaturePropertiesById(featurePropertiesId);

    if( featureProperties ) {
      
      // //TODO
      // if (featureProperties.featureOptions.featureActionTitle && featureProperties.featureOptions.featureActionTitle) {
      //   this.featureActionCallback = featureProperties.featureOptions.featureActionCallback;
      // }  

      //create feature data
      this.createFeatureData(featurePropertiesId, restriction);

      //display the markers
      this.createFeatureGeometry(featureLayerName, featurePropertiesId);

    } else {
      // return, display and log error
      //console.log('Feature properties do not exist for the feature properties id : ' + featurePropertiesId);
    }

  },

  selectFeaturesByAssetIds: function(assetIds){
      var me = this;

      // clear existing selected features
      this.clearSelectedFeatures();

      // get the feature layer 
      var featureLayer = this.getLayerFromLayerGroup('featureLayer', this.featureLayerGroup);

      // get the features from the layer
      var selectFeatures = [];
      for (var each in featureLayer._layers) {
        if ( _.indexOf(assetIds, featureLayer._layers[each].feature.properties.ab_asset_id) !== -1 ){
          selectFeatures.push(featureLayer._layers[each].feature);
        }
      }

      var selectionGeoJson = {
          'type': 'FeatureCollection',
          'features': selectFeatures
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
          getFeatureLayerName: function(){
            return 'selectionLayer';
          },                    
          style: function(feature){
            return selectionStyle;
          },
          onEachFeature: function(feature, layer){

            layer.on('mouseover', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureMouseOver...');

                // get title from marker
                var feature = evt.target.feature;
                var title = feature.properties.popupTitle; //ab_title;

                // update the marker tooltip
                document.getElementById(me.divId + "_leafletFeatureTooltip").innerHTML = title; 

                // get the mouse location
                var px, py;        
                if (evt.containerPoint.x && evt.containerPoint.y) { 
                  px = evt.containerPoint.x;
                  py = evt.containerPoint.y;
                }

                // show the tooltip at the mouse location
                var tooltipEl = document.getElementById(me.divId + "_leafletFeatureTooltip");          
                tooltipEl.style.display = 'none';
                tooltipEl.style.position = '';
                tooltipEl.style.left = (px + 15) + "px";
                tooltipEl.style.top = (py) + "px";
                tooltipEl.style.display = '';  
                tooltipEl.style.position = '';

                // call the mouse over listener
                var featureMouseOver = me.getEventListener('featureMouseOver');
                if (featureMouseOver) {
                  var assetId = feature.properties.ab_asset_id;
                  var assetType = feature.properties.ab_asset_type;
                  featureMouseOver(assetId, assetType, feature);
                }   
            });

             layer.on('mouseout', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureMouseOut...');

                var tooltipEl = document.getElementById(me.divId + "_leafletFeatureTooltip");          
                tooltipEl.innerHTML = ""; 
                tooltipEl.style.display = "none";

                // call the mouse out listener
                var featureMouseOut = me.getEventListener('featureMouseOut');
                if (featureMouseOut) {
                  featureMouseOut(evt.target);
                }  
            });

            layer.on('click', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureClick...');
                var featureClick = me.getEventListener('featureClick');
                if (featureClick) {
                  var assetId = feature.properties.ab_asset_id;
                  var assetType = feature.properties.ab_asset_type;
                  featureClick(assetId, assetType, feature);                  
                }
            }); 
          }                     
      });
      this.featureLayerGroup.addLayer(selectionLayer);
      selectionLayer.bringToFront();

  },

  highlightFeaturesByThematicValue: function(thematicValue){
      var me = this;

      // get the feature layer 
      var featureLayer = this.getLayerFromLayerGroup('featureLayer', this.featureLayerGroup);
      
      for (var each in featureLayer._layers) {
        if ( featureLayer._layers[each].feature.properties.ab_thematic === thematicValue ){
          featureLayer._layers[each].setStyle({
                    color: '636363', //#000',
                    stroke: true,
                    weight: 2.0,
                    opacity: 0.9,
                    //fillColor: evtColor,
                    fillOpacity: 1,
                    riseOnHover: true 
                }); 
        }
      }
  },

  highlightFeaturesByAssetIds: function(assetIds){
      // clear existing highlights
      this.clearHighlightedFeatures();

      // get the feature layer 
      var featureLayer = this.getLayerFromLayerGroup('featureLayer', this.featureLayerGroup);
      
      for (var each in featureLayer._layers) {
        if ( _.indexOf(assetIds, featureLayer._layers[each].feature.properties.ab_asset_id) !== -1 ){
          featureLayer._layers[each].setStyle({
                    color: '#000',
                    stroke: true,
                    weight: 2.0,
                    opacity: 0.8,
                    //fillColor: evtColor,
                    fillOpacity: 1
                }); 
        }
      }
  },

  clearHighlightedFeatures: function(){
    var featureLayer = this.getLayerFromLayerGroup('featureLayer', this.featureLayerGroup);
    //featureLayer.resetStyle();

     for (var each in featureLayer._layers) {
          featureLayer.resetStyle(featureLayer._layers[each]);
      }

  },

  getLayerFromLayerGroup: function(layerName, layerGroup){
      var _layer;
      var layers = layerGroup._layers;
      for (var layerId in layers){
        var layer = layers[layerId];
        if (layer.hasOwnProperty('options')){
          if (layer.options.getFeatureLayerName() === layerName){
            _layer = layer;
          }
        }
      }
      return _layer; 
  },

  clearSelectedFeatures: function(){
    this._removeLayerFromLayerGroup('selectionLayer' , this.featureLayerGroup );
  },

  clearFeatures: function(){
    this.featureLayerGroup.clearLayers();
    this._hideFeatureLayerTooltip();
    this.featureLayerName = null;
    this.featurePropertiesId = null;
    this.featureData = null;
    this.featureGeometry = null;
  },

  _hideFeatureLayerTooltip: function(){
    document.getElementById(this.divId + "_leafletFeatureTooltip").style.display = 'none';
  },

  _removeLayerFromLayerGroup: function( layerName, layerGroup ){

    var layers = layerGroup._layers;
    for (var layerId in layers) {
      var layer = layers[layerId];
      if (layer.hasOwnProperty('options')) {
        if (layer.options.getFeatureLayerName() === layerName){
          layerGroup.removeLayer(layer._leaflet_id);
        }
      }
    }
  },

  /*
   *  return the feaureProperties for given feature properties id.
   *  @param featurePropertiesId. The feature properties id.
   */
  _getFeaturePropertiesById: function(featurePropertiesId){
    return this.featurePropertiesPairs.get(featurePropertiesId);
  },

  createFeatureData: function(featurePropertiesId, restriction) {

    //console.log('Ab.leaflet.EsriMapExtensions -> createFeatureData...');
    var _featureData = new Ext.util.MixedCollection();
    var fields;
    var featureRecords;

    var featureProperties = this._getFeaturePropertiesById(featurePropertiesId);
    var dataSourceType = featureProperties.dataSourceType;

    switch (dataSourceType) {
        case 'WC_DATASOURCE':
            fields = [featureProperties.keyField, featureProperties.featureOptions.thematicField];
            featureRecords = this._getDataSourceRecords(featureProperties.dataSource,
                restriction,
                featureProperties.dataSourceParameters
            );
            break;

        case 'WC_DATARECORDS':
            fields = [featureProperties.keyField, featureProperties.thematicField];
            featureRecords = featureProperties.dataSource;
            break;

        case 'WC_TABLE':
            var table = featureProperties.table;
            var whereClause = restriction;
            fields = [featureProperties.keyField, featureProperties.thematicField];
            featureRecords = this._getRecordsFromWebCentral(table, fields, whereClause);
            break;

        default:
          //TODO
          //console.log('No feature data source was specified');
          break;
    }

    // create the feature layer data collection
    for (var i = 0; i < featureRecords.length; i++) {
        //console.log(featureRecords[i].values[featureProperties['keyField']] + ' | ' + featureRecords[i].values[featureProperties.featureOptions['thematicField']]);
        _featureData.add(featureRecords[i].values[featureProperties['keyField']], featureRecords[i].values);
    }

    this.featureData = _featureData;
  },

  createFeatureGeometry: function(featureLayerName, featurePropertiesId){

    // get the layer url
    var layerUrl = this.featureLayerList.get(featureLayerName).url;
    var outFields = this.featureLayerList.get(featureLayerName).outFields;

    // get the where clause from the layer option
    var featureProperties = this.featurePropertiesPairs.get(featurePropertiesId);
    var  whereClause = featureProperties.featureOptions.whereClause;

    var parameters = {
      where: whereClause,
      outFields: outFields,
      returnGeometry: true,
      outSR: 4326,
      f: 'geojson'
    };
    
    L.esri.get(layerUrl + '/query', parameters, this.createGeometryHandler, this);

  },

  createGeometryHandler: function( error, response ){
      if (error) {
        //console.log(error);
      } else {
        //console.log(response);
        this.featureLayerGeometry = response;

        this.displayFeatures();
      }
  },

  displayFeatures: function(){

    var me = this;

    this.addFeatureDataToGeometry();

    var featureLayer = L.geoJson(this.featureLayerGeometry, {
        
        getFeatureLayerName: function(){
          return 'featureLayer';
        },

        style: function(feature) {
          return feature.properties['ab_style'];
        },

        onEachFeature: function(feature, layer){

            layer.on('mouseover', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureMouseOver...');

                // get title from marker
                var feature = evt.target.feature;
                var title = feature.properties.popupTitle; //ab_title;

                // update the marker tooltip
                document.getElementById(me.divId + "_leafletFeatureTooltip").innerHTML = title; 

                // get the mouse location
                var px, py;        
                if (evt.containerPoint.x && evt.containerPoint.y) { 
                  px = evt.containerPoint.x;
                  py = evt.containerPoint.y;
                }

                // show the tooltip at the mouse location
                var tooltipEl = document.getElementById(me.divId + "_leafletFeatureTooltip");          
                tooltipEl.style.display = 'none';
                tooltipEl.style.position = '';
                tooltipEl.style.left = (px + 15) + "px";
                tooltipEl.style.top = (py) + "px";
                tooltipEl.style.display = '';  
                tooltipEl.style.position = '';

                // remove exiting highlights
                me.clearHighlightedFeatures();

                // add feature highlight
                var evtLayer = evt.target;
                
                evtLayer.setStyle({
                    color: '#000',
                    stroke: true,
                    weight: 2.0,
                    opacity: 0.8,
                    //fillColor: evtColor,
                    fillOpacity: 1
                });

                evtLayer.bringToFront();  

                // call the mouse over listener
                var featureMouseOver = me.getEventListener('featureMouseOver');
                if (featureMouseOver) {
                  var assetId = feature.properties.ab_asset_id;
                  var assetType = feature.properties.ab_asset_type;
                  featureMouseOver(assetId, assetType, feature);
                }   
            });

             layer.on('mouseout', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureMouseOut...');

                var tooltipEl = document.getElementById(me.divId + "_leafletFeatureTooltip");          
                tooltipEl.innerHTML = ""; 
                tooltipEl.style.display = "none";

                // reset the marker style
                var evtLayer = evt.target;
                featureLayer.resetStyle(evtLayer);

                // call the mouse out listener
                var featureMouseOut = me.getEventListener('featureMouseOut');
                if (featureMouseOut) {
                  featureMouseOut(evt.target);
                }  
            });

            layer.on('click', function(evt){
                //console.log('Ab.leaflet.EsriMapExtensions -> featureClick...');
                var featureClick = me.getEventListener('featureClick');
                if (featureClick) {
                  var assetId = feature.properties.ab_asset_id;
                  var assetType = feature.properties.ab_asset_type;
                  featureClick(assetId, assetType, feature);                  
                }
            });                      
        }

    });
    
    this.featureLayerGroup.addLayer(featureLayer);
    //featureLayer.setZIndex(10);

  },

  addFeatureDataToGeometry: function(){

    // get the feature properties from the properties pairs
    var featureProperties = this.featurePropertiesPairs.get(this.featurePropertiesId);
    // get the fields
    var keyField = featureProperties.keyField;
    var titleField = featureProperties.titleField;
    var assetIdField = this.featureLayerList.get(this.featureLayerName).assetIdField;
    // get the rendering options

    var renderer = featureProperties.featureOptions.renderer;
    var thematicRenderer = featureProperties.featureOptions.thematicRenderer;
    var thematicField = featureProperties.featureOptions.thematicField;
    var strokeOn = featureProperties.featureOptions.stroke;
    var strokeColor = featureProperties.featureOptions.strokeColor;
    var strokeWeight = featureProperties.featureOptions.strokeWeight;
    var strokeOpacity = featureProperties.featureOptions.strokeOpacity;
    var fillOpacity = featureProperties.featureOptions.fillOpacity;
    // get the geometry
    var featureLayerGeometry = this.featureLayerGeometry;
    var features = featureLayerGeometry.features;

    // prepare the geometry
    for (var i=0; i<features.length; i++) {
      var feature = features[i];
      var properties = feature.properties;
      
      // add the archibus attributes to the feature properties
      var assetId = feature.properties[assetIdField];
      var assetType = this.featurePropertiesId;
      var thematicValue = this.featureData.get(assetId)[thematicField];
      var title = this.featureData.get(assetId)[titleField];
      properties['ab_asset_id'] = assetId;
      properties['ab_asset_type'] = assetType;
      properties['ab_thematic'] = thematicValue;
      //properties[thematicField] = thematicValue;
      properties['ab_title'] = title;
      var popupTitle = '<span class="leaflet-popup-content-title" id="leafletPopupContentTitle">';
      popupTitle += title + '</span>';
      properties['popupTitle'] = popupTitle;


      // add the feature style
      var featureFillColor = this.getFillColorForFeature(thematicValue, renderer, thematicRenderer);
      //TODO - get these from featureOptions
      var style = {
        fillColor: featureFillColor,
        fillOpacity: fillOpacity,
        stroke: strokeOn,
        color: strokeColor,
        weight: strokeWeight,
        opacity: strokeOpacity,
        riseOnHover: true  
      };
      properties['ab_style'] = style;

      feature.properties = properties;
      features[i] = feature;
    }

    featureLayerGeometry.features = features;

    this.featureLayerGeometry = featureLayerGeometry;

  },

  getFillColorForFeature: function (featureValue, renderer, thematicRenderer, featureProperties) {
  
    var fillColor;
    switch (renderer) {
      
      case 'simple':
        fillColor = featureProperties.markerOptions.fillColor;
        break;

      case 'thematic-unique-values':
        for (var i=0; i<thematicRenderer.length; i++) {
          if (featureValue === thematicRenderer[i].uniqueValue){
            fillColor = thematicRenderer[i].color;   
          }
        }
        break;

      case 'thematic-class-breaks':
        for (var i=0; i<thematicRenderer.length; i++) {
          if (i === 0) {
            // first class break
            if (featureValue < thematicRenderer[0].maxValue) {
              fillColor = thematicRenderer[0].color;
              break;
            }
          } else if (i === thematicRenderer.length) {
            // last class break
            if (featureValue >= thematicRenderer[i].minValue) {
              fillColor = thematicRenderer[i].color;
              break;
            }          
          }
          else {
            // intermediate class break
            if (featureValue >= thematicRenderer[i].minValue && featureValue < thematicRenderer[i].maxValue) {
              fillColor = thematicRenderer[i].color;
              break;
            }             
          }
        }
        break;

      default:  
        break;  
    }
    //console.log('getFillColorForFeature-> value: ' + featureValue + ' color: ' + fillColor);
    return fillColor;

  }

});  

Ab.leaflet.FeatureProperties = Base.extend({    

  // feature data source type
  dataSourceType: null,

  //the dataSource associated with markers
  dataSource: null,
  
  //fields defined in dataSource
  keyField: null,
  titleField: null,
  contentFields: null,

  featureOptions: null,
  //default feature options
    // fillColor:
    // fillOpacity: 
    // stroke:
    // strokeColor:
    // strokeWeight:
    // strokeOpacity:
    // whereClause:

  /*
     *  constructor
     *  @param dataSourceTypeParam.
     *  @param dataSourceParam. The dataSource associated with these markers
     *  @param geometryFieldsParam. The geometryFields which define the geometry of markers.
     *  @param titleFieldParam. The data field which defines the popup title.
     *  @param contentFieldsParam.  The data fields which define the popup content.
     *  @param markerOptionsParam. Overide various marker options.
     */
     
  constructor: function (dataSourceTypeParam, dataSourceParam, keyFieldParam, titleFieldParam, contentFieldsParam, featureOptionsParam) {
      this.dataSourceType = dataSourceTypeParam;
      this.dataSource = dataSourceParam;
      this.keyField = keyFieldParam;
      this.titleField = titleFieldParam;
      this.contentFields = contentFieldsParam;

      if (!featureOptionsParam){
        featureOptionsParam = {};
      }
      this._parseFeatureOptions(featureOptionsParam);
  },

  //thematic feature options
    // renderer: 'thematic-unique-values', 'thematic-class-breaks'
    // thematicField:
    // thematicClassBreaks: 
    // thematicUniqueValues:
    // colorBrewerClass:

  _parseFeatureOptions: function(featureOptions){

    var _featureOptions = {};

    _featureOptions.renderer = featureOptions.renderer;
    _featureOptions.fillColor = featureOptions.fillColor || '#e41a1c';
    _featureOptions.fillOpacity = featureOptions.fillOpacity || 0.9;
    _featureOptions.stroke = featureOptions.stroke || true;
    _featureOptions.strokeColor = featureOptions.strokeColor || '#fff';
    _featureOptions.strokeWeight = featureOptions.strokeWeight || 1.0;
    _featureOptions.strokeOpacity = featureOptions.strokeOpacity || 0.9;
    _featureOptions.riseOnHover = featureOptions.riseOnHover || true;
    //_featureOptions.featureActionTitle = featureOptions.featureActionTitle || null;
    //_featureOptions.featureActionCallback = featureOptions.featureActionCallback || null;
    _featureOptions.whereClause = featureOptions.whereClause || '1=1';

    //thematic marker options
    _featureOptions.thematicField = featureOptions.thematicField;
    _featureOptions.thematicUniqueValues = featureOptions.thematicUniqueValues || [];
    _featureOptions.thematicClassBreaks = featureOptions.thematicClassBreaks || [];
    _featureOptions.colorBrewerClass = featureOptions.colorBrewerClass || '';

    this.featureOptions = _featureOptions;

    var rendererColors;
    var thematicRenderer = [];

    switch (this.featureOptions.renderer) {
      
      case 'thematic-unique-values':
        // get distinct fields
        if (this.featureOptions.thematicUniqueValues.length === 0){
          this.featureOptions.thematicUniqueValues = this._getUniqueValues(this.featureOptions.thematicField);
        }
        // get colorBrewer colors
        if (this.featureOptions.colorBrewerClass === '') {
          this.featureOptions.colorBrewerClass = 'Paired2';
        }
        rendererColors = this._getColorbrewerColors(this.featureOptions.colorBrewerClass, this.featureOptions.thematicUniqueValues.length);
        // create renderer
        for (var i=0; i<this.featureOptions.thematicUniqueValues.length; i++) {
          thematicRenderer.push({
            uniqueValue: this.featureOptions.thematicUniqueValues[i],
            color: rendererColors[i]
          });

        }
        this.featureOptions.thematicRenderer = thematicRenderer;
        break;

      case 'thematic-class-breaks':
        // get colorBrewer colors
        if (this.featureOptions.colorBrewerClass === '') {
          this.featureOptions.colorBrewerClass = 'Reds';
        }
        rendererColors = this._getColorbrewerColors(this.featureOptions.colorBrewerClass, this.featureOptions.thematicClassBreaks.length+1);
        
        // create renderer
        for (var i=0; i<this.featureOptions.thematicClassBreaks.length+1; i++) {
          if (i === 0) {
            // first class break
            thematicRenderer.push({
              minValue: -Infinity,
              maxValue: this.featureOptions.thematicClassBreaks[0],
              color: rendererColors[0]
            });
          } else if (i === this.featureOptions.thematicClassBreaks.length) {
            // last class break
            thematicRenderer.push({
              minValue: this.featureOptions.thematicClassBreaks[i-1],
              maxValue: +Infinity,
              color: rendererColors[i]
            });            
          }
          else {
            // intermediate class break
            thematicRenderer.push({
              minValue: this.featureOptions.thematicClassBreaks[i-1],
              maxValue: this.featureOptions.thematicClassBreaks[i],
              color: rendererColors[i]
            }); 
          }
        }
        break;

      default:
        //console.log('Marker renderer not found: ' + this.markerOptions.renderer);
        break;    
    }

    this.featureOptions.thematicRenderer = thematicRenderer;
    
  },

  _getColorbrewerColors: function(colorBrewerClass, numberOfColors){
    var colors = [];
    // make sure colorbrewer is loaded
    if (colorbrewer) {
      if (colorbrewer[colorBrewerClass][numberOfColors]) {
        colors = colorbrewer[colorBrewerClass][numberOfColors];
      } else {
        // if we are asking for too many colors,
        // add additional colors to the colorbrewer class
        var colorValues = _.values(colorbrewer[colorBrewerClass])[_.values(colorbrewer[colorBrewerClass]).length-1];
        var numberOfColorValues =  colorValues.length;
        var colorsNeeded = numberOfColors - numberOfColorValues;
        colors = colorValues;

        for (i=0; i<colorsNeeded; i++) {
          colorValues.push(colorValues[i]);
        }

      }
    } else {
      //console.log('Colorbrewer library not loaded.');
    }
    return colors;
  }

});