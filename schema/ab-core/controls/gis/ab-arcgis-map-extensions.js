Ab.namespace('arcgis');

/*
 *   This control defines the ArcGIS Enhanced Map Control
 *   This control is used with the Extensions for ArcGIS
 */

Ab.arcgis.MapExtensions = Ab.arcgis.ArcGISMap.extend({

    /**
     *
     *	Map Extensions Properties
     *
     */

    // @begin_translatable
    z_MESSAGE_INVALID_LICENSE: 'A license for the ARCHIBUS Geospatial Extensions for Esri was not found. Please see your system administrator.',
    // @end_translatable

    hasExtensionsForEsriLicense: false,

    /**
     *
     *	Feature Layer Properties
     *
     */

    // Ab.arcgis.FeatureLayer control
    featureLayerControl: null,

    // Ext.util.MixedCollection
    // A list of feature layer names and layer configuration options 
    featureLayerList: null,

    // featureLayer tooltip
    featureLayerTooltip: null,

    // featureLayer tooltip
    featureLayerInfoWindow: null,

    // featureLayer legend
    featureLayerLegend: null,

    // graphics layer for mouseover event
    featureLayerHighlightGraphics: null,

    // feature layer graphics
    featureLayerDefaultHighlightSymbol: null, //TODO not used
    featureLayerHighlightSymbol: null,
    featureLayerSelectionSymbol: null,
    featureLayerNoSelectionSymbol: null,

    // the feature layer name (active feature)
    featureLayerName: null,

    // the feature layer url
    featureLayerUrl: null,

    // feature layer options
    featureLayerOptions: null,

    // feature layer renderer options
    featureLayerRendererOptions: null,

    // feature layer data options
    featureLayerDataOptions: null,

    // a list of wc feature data
    // Ext.util.MixedCollection
    featureLayerData: null,

    constructor: function(panelIdParam, divIdParam, configObject) {
        //console.log('Ab.arcgis.MapExtensions -> constructor...');

        // check for Extensions for ESRI license
        var result = Ab.workflow.Workflow.call('AbCommonResources-ArcgisExtensionsService-hasExtensionsForEsriLicense');
        if (result.code != 'executed') {
            Ab.workflow.Workflow.handleError(result);
        } else {
            this.hasExtensionsForEsriLicense = result.value;
        }

        // f license exists, proceed with control initialization
        if (this.hasExtensionsForEsriLicense === true) {
            this.inherit(panelIdParam, divIdParam, configObject);

            this._buildFeatureLayerList();
        } else {
            var msg = View.getLocalizedString(this.z_MESSAGE_INVALID_LICENSE);
            View.showMessage(msg);
        }
    },

    /**
     *
     *	Map Control Methods
     *
     */

    // initilize the map
    _initMap: function() {
        //console.log('Ab.arcgis.MapExtensions -> initMap...');

        this.inherit();

        this._createFeatureLayerTooltipDomElements();

        this._createFeatureLayerInfoWindowDomElements();

        this._createFeatureLayerLegendDomElements();

        this._createFeatureLayerDefaultSymbol();
    },

    _loadDojoLibrary: function() {

        // standard maps
        dojo.require("esri.map");
        dojo.require("esri.InfoTemplate");
        dojo.require("esri.tasks.locator");
        dojo.require("esri.dijit.InfoWindow");
        dojo.require("esri.dijit.Legend");

        dojo.require("dojo.dnd.Moveable");
        dojo.require("dojo.dom-construct");
        dojo.require("dojo.io.script");
        dojo.require("dojo.query");
        dojo.require("dojo.on");
        dojo.require("dojo.ready");

        // enhanced maps  
        dojo.require("esri.Color");
        dojo.require("esri.graphic");
        dojo.require("esri.geometry.Polygon");
        dojo.require("esri.layers.FeatureLayer");
        dojo.require("esri.tasks.query");
        dojo.require("esri.symbols.SimpleFillSymbol");
        dojo.require("esri.symbols.SimpleLineSymbol");
        dojo.require("esri.dijit.Print");
        dojo.require("esri.tasks.PrintTemplate");
        dojo.require("esri.tasks.PrintTask");
        dojo.require("esri.tasks.PrintParameters");
        dojo.require("dojo._base.array");

        // when dojo is ready proceed with map initialization 
        var _mapControl = this;
        dojo.ready(function() {
            //console.log('Ab.arcgis.MapExtensions -> dojo.ready...');
            _mapControl._initMap();
        });
    },

    // callback for map.load event 
    _onMapLoad: function() {

        this.inherit();  
        
        //console.log('Ab.arcgis.MapExtensions -> onMapLoad...');

        // init the feature layer control
        this._initFeatureLayer();

        // call mapConfigObject mapLoadedCallback if it exists 
        if (this.mapConfigObject.hasOwnProperty('mapLoadedCallback')) {
            if (typeof this.mapConfigObject.mapLoadedCallback === 'function') {
                var callback = this.mapConfigObject.mapLoadedCallback;
                this.mapConfigObject.mapLoadedCallback = null;
                callback();
            }
        }

    },

    _createGraphicsLayers: function() {
        this.inherit();

        this.featureLayerHighlightGraphics = new esri.layers.GraphicsLayer({
            id: "featureLayerHighlightGraphics",
        });
        this.map.addLayer(this.featureLayerHighlightGraphics);

        this.featureLayerDefaultSelectionSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2.0),
            new dojo.Color([0, 0, 0, 0.5])
        );
    },


    _completeMapLoad: function() {
        //console.log('Ab.arcgis.MapExtensions -> completeMapLoad...');

        // set initialized to true
        this.mapInited = true;

        // call mapConfigObject mapLoadedCallback if it exists 
        if (this.mapConfigObject.hasOwnProperty('mapLoadedCallback')) {
            if (typeof this.mapConfigObject.mapLoadedCallback === 'function') {
                var callback = this.mapConfigObject.mapLoadedCallback;
                this.mapConfigObject.mapLoadedCallback = null;
                callback();
            }
        }

    },

    /*
     *  switch the REFERENCE layer
     *  @param layerName 	 		Required 	The new layer name
     *  @param visibleLayersParam  	Optional   	The visible layer array
     *  @param callback      		Optional   	The callback method          
     */

    switchReferenceLayer: function(layerName, visibleLayersParam, callbackParam) {
        //console.log("MapExtensionsControl -> switchReferenceLayer...");

        // remove existing reference layer
        this.removeReferenceLayer();

        // get the layer url
        var layerURL = this.referenceLayerList.get(layerName).url;

        if (valueExistsNotEmpty(layerURL)) {
            var layerOpacity = 0.75;
            if (valueExistsNotEmpty(this.referenceLayerList.get(layerName).opacity)) {
                layerOpacity = this.referenceLayerList.get(layerName).opacity;
            }
            var useToken = false;
            if (valueExistsNotEmpty(this.referenceLayerList.get(layerName).useToken)) {
                useToken = this.referenceLayerList.get(layerName).useToken;
            }

            // get/set layer options /* AIPS */
            var layerOptions = {
                id: 'referenceLayer',
                index: 10,
                opacity: layerOpacity
            };

            // parse the url for the hostname 
            // var parser = document.createElement('a');
            // parser.href = layerURL;
            // var hostname = parser.hostname;
            // get token if we are using arcgisonline.com or arcgis.com resources 
            //if (hostname.indexOf('arcgis.com') !== -1 || hostname.indexOf('arcgisonline.com') !== -1) {
            //	if (this.accessToken === null) {
            //		this.requestAccessToken();
            //	}
            //	layerURL = layerURL + '?token=' + this.accessToken;
            //}
            if (useToken) {
                if (this.accessToken === null) {
                    this.requestAccessToken();
                }
                layerURL = layerURL + '?token=' + this.accessToken;
            }

            var visibleLayers = [0];
            if (visibleLayersParam) {
                visibleLayers = visibleLayersParam;
            }

            // check layerURL for layer type 
            // use layerURL + '?f=json' to retrieve info about map service as a JSON object
            // use '?f=pjson' for pretty JSON -- debugging only!
            // use &callback=methodName to reference a callback function in the URL
            var _mapControl = this;
            dojo.io.script.get({
                url: layerURL,
                callbackParamName: "callback",
                content: {
                    f: 'json'
                },
                load: function(results) {
                    var isTiledMapCache = results.singleFusedMapCache;
                    _mapControl._loadReferenceLayer(layerName, layerURL, layerOptions, visibleLayers, isTiledMapCache, callbackParam);
                },
                error: function(error) {
                    View.alert("Error loading reference layer: " + layerName);
                    //console.log("Error loading reference layer: " + error.message);
                }
            });
        }
    },

    // load the reference layer  
    _loadReferenceLayer: function(layerName, layerURL, layerOptions, visibleLayers, isTiledMapCache, callbackParam) {
        //console.log('Ab.arcgis.MapExtensions --> loadReferenceLayer...');

        var refLayer = '';

        // create the layer for the map
        if (layerURL != '' && isTiledMapCache == true) {
            refLayer = new esri.layers.ArcGISTiledMapServiceLayer(layerURL, layerOptions);
        } else if (layerURL != '' && isTiledMapCache == false) {
            refLayer = new esri.layers.ArcGISDynamicMapServiceLayer(layerURL, layerOptions);
            refLayer.setVisibleLayers(visibleLayers);
        }

        // add the layer to the map and update the legend
        if (refLayer != '') {
            this.legendLayers = [];
            this.legendLayers.push({
                layer: refLayer,
                title: layerName
            });
            this.map.addLayers([refLayer]);
            this.map.reorderLayer(refLayer, layerOptions.index);
        } else {
            this.legendLayers = [];
            this.removeReferenceLayer();
        }

        // wire up the layer onload callback
        var _mapControl = this;
        dojo.connect(refLayer, 'onLoad', function(layer) {
            _mapControl._afterLayerLoad(layer);
        });

        if (callbackParam) {
            var _callbackParam = callbackParam;
            dojo.connect(refLayer, 'onLoad', function() {
                var callback = _callbackParam;
                callback();
            });
        }
    },

    /**
     *
     *	Feature Layer Methods
     *
     */

    // create the feature layer control
    _initFeatureLayer: function() {
        //console.log('Ab.arcgis.MapExtensions -> _initFeatureLayer...');

        var mapControl = this;
        this.featureLayerControl = new Ab.arcgis.FeatureLayer(mapControl);

        var _mapControl = this;
        dojo.connect(_mapControl.map, 'onClick', function(event) {
            // if the user hasnt clicked on a graphic
            // clear selected features
            if (!event.graphic) {
                _mapControl.clearSelectedFeatures();
                _mapControl.hideFeatureLayerInfoWindow();
            }
        });

    },

    // build the feature layer list
    _buildFeatureLayerList: function() {
        //console.log('Ab.arcgis.MapExtensions -> buildFeatureLayerList...');

        this.featureLayerList = new Ext.util.MixedCollection();

        if (this.mapConfigObject.hasOwnProperty('featureLayerList')) {
            var _featureLayerList = this.mapConfigObject.featureLayerList;

            for (var i = 0; i < _featureLayerList.length; i++) {
                this.featureLayerList.add(_featureLayerList[i].name, {
                    url: _featureLayerList[i].url,
                    opacity: _featureLayerList[i].opacity || 1.0,
                    whereClause: _featureLayerList[i].whereClause || '1=1',
                    outFields: _featureLayerList[i].outFields || '[*]',
                    zoomToResults: _featureLayerList[i].zoomToResults || true,
                    toolTipField: _featureLayerList[i].toolTipField || '',
                    assetIdField: _featureLayerList[i].assetIdField,
                    assetTypeField: _featureLayerList[i].assetTypeField,
                    objectIdField: _featureLayerList[i].objectIdField
                });
            }

        } else {
            // TODO message user
            //console.log('Ab.arcgis.MapExtensions -> mapConfigObject.featureLayerList does not exist.');
        }
    },

    // create feature layer tooltop dom elements
    _createFeatureLayerTooltipDomElements: function() {
        //console.log('Ab.arcgis.MapExtensions -> createFeatureLayerTooltip...');

        this.featureLayerTooltip = dojo.create('div', {
            'id': this.divId + '_featureLayerTooltip',
            'class': 'featureLayerTooltip',
            'innerHTML': ""
        }, this.map.container);
        dojo.style(this.featureLayerTooltip, 'position', 'fixed');
        dojo.style(this.featureLayerTooltip, 'display', 'none');

    },

    _hideFeatureLayerTooltip: function() {
        dojo.style(this.featureLayerTooltip, "display", "none");
    },

    // create feature layer info dom elements
    _createFeatureLayerInfoWindowDomElements: function() {
        //console.log('Ab.arcgis.MapExtensions -> createFeatureLayerInfoWindow...');

        // add info window display elements
        this.featureLayerInfoWindow = dojo.create('div', {
            'id': this.divId + '_featureLayerInfoWindow',
            'class': 'featureLayerInfoWindow',
            'innerHTML': ""
        }, this.map.container);
        //dojo.create('div', {'id':'featureLayerInfoWindowCloseButton', 'class':'featureLayerInfoWindowCloseButton'}, this.featureLayerInfoWindow);
        dojo.create('div', {
            'id': this.divId + '_featureLayerInfoWindowContent',
            'class': 'featureLayerInfoWindowContent',
            'innerHTML': ''
        }, this.featureLayerInfoWindow);

        dojo.style(this.featureLayerInfoWindow, 'position', 'fixed');
        dojo.style(this.featureLayerInfoWindow, 'display', 'none');

        // make the info window moveable
        //var esriMoveable = dojo.dnd.Moveable(dojo.byId('featureLayerInfoWindow'));

        // wire up close event to close button
        // var _mapControl = this;
        // dojo.connect(dojo.byId('featureLayerInfoWindow'), 'click', function() {
        // 	_mapControl.hideFeatureLayerInfoWindow();
        // });

    },

    _hideFeatureLayerInfoWindow: function() {
        dojo.style(this.featureLayerInfoWindow, "display", "none");
    },

    // create feature layer legend dom elements
    _createFeatureLayerLegendDomElements: function() {
        //console.log('Ab.arcgis.MapExtensions -> createFeatureLayerLegend...');

        var _mapControl = this;

        this.featureLayerLegend = dojo.create('div', {
            'id': this.divId + '_featureLayerLegend',
            'class': 'featureLayerLegend',
            'innerHTML': "",
            'display': 'none'
        }, this.map.container); //this.panelId?
        dojo.create('div', {
            'id': this.divId + '_featureLayerLegendCloseButton',
            'class': 'featureLayerLegendCloseButton',
            'click': function(){_mapControl.hideFeatureLayerLegend()}
        }, this.featureLayerLegend);
        dojo.create('div', {
            'id': this.divId + '_featureLayerLegendContent',
            'class': 'featureLayerLegendContent',
            'innerHTML': ''
        }, this.featureLayerLegend);

        this.hideFeatureLayerLegend();
        this._clearFeatureLayerLegendContent();
 
    },

    showFeatureLayerLegend: function() {
        //console.log('Ab.arcgis.MapExtensions -> showFeatureLayerLegend...');
        document.getElementById(this.divId + '_featureLayerLegend').style.display = 'block';
    },

    hideFeatureLayerLegend: function() {
        //console.log('Ab.arcgis.MapExtensions -> hideFeatureLayerLegend...');
        document.getElementById(this.divId + '_featureLayerLegend').style.display = 'none';
    },

    // update the feature layer legend content
    _updateFeatureLegendContent: function(){
        //console.log('Ab.arcgis.MapExtensions -> updateLegendContent...');  

        var htmlContent;
        var renderer = this.featureLayerRendererOptions.type;

        switch (renderer) {

          // case 'simple':
          //   // TODO 
          //   // var title = this._getFieldTitle(markerProperties.dataSource,  markerProperties.titleField);
          //   // var backgroundColor = markerProperties.markerOptions.fillColor;
          //   // htmlContent = '<table>';
          //   // htmlContent += '<tr><td style=background-color:' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td>Locations</td></tr>';
          //   // htmlContent += '</table>';
          //   htmlContent = "";
          //   break;

          case 'thematic-unique-values':
            var title = this.getFieldTitle(this.featureLayerDataOptions.dataSource,  this.featureLayerDataOptions.thematicField) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            var thematicColors = this.featureLayerRendererOptions.thematicColors;
            var thematicUniqueValues = this.featureLayerRendererOptions.thematicUniqueValues;
            var dataPrefix = this.featureLayerRendererOptions.legendDataPrefix;
            var dataSuffix = this.featureLayerRendererOptions.legendDataSuffix;

            htmlContent = "<table>";
            htmlContent += "<tr><td colspan='2' class='featureLayerLegendTitle'>" + title + "</td></tr>";
            for (i=0; i<thematicUniqueValues.length; i++) {
              var backgroundColor = this.RGBtoHex(thematicColors[i][0],thematicColors[i][1],thematicColors[i][2]);
              var label = thematicUniqueValues[i];
              htmlContent += '<tr><td class="featureLayerLegendSwatch" style=background-color:#' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="featureLayerLegendLabel">' + label + '</td></tr>';          
            }
            htmlContent += '</table>';
            break;

          case 'thematic-class-breaks':
            var title = this.getFieldTitle(this.featureLayerDataOptions.dataSource,  this.featureLayerDataOptions.thematicField) + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
            var thematicColors = this.featureLayerRendererOptions.thematicColors;
            var thematicClassBreaks = this.featureLayerRendererOptions.thematicClassBreaks;
            var dataPrefix = this.featureLayerRendererOptions.legendDataPrefix;
            var dataSuffix = this.featureLayerRendererOptions.legendDataSuffix;

            htmlContent = "<table>";
            htmlContent += "<tr><td colspan='2' class='featureLayerLegendTitle'>" + title + "</td></tr>";
            for (i=0; i<thematicClassBreaks.length + 1; i++) {
              var backgroundColor = this.RGBtoHex(thematicColors[i][0],thematicColors[i][1],thematicColors[i][2]);
              var label;
              if (i==0) {
                label = '< ' + dataPrefix + thematicClassBreaks[0] + dataSuffix;
              } else if (i==thematicClassBreaks.length) {
                label = '> ' + dataPrefix + thematicClassBreaks[i-1] + dataSuffix;
              } else (
                label = dataPrefix + thematicClassBreaks[i-1] + dataSuffix + ' - ' + dataPrefix + thematicClassBreaks[i] + dataSuffix
              )
              htmlContent += '<tr><td class="featureLayerLegendSwatch" style=background-color:#' + backgroundColor + '>&nbsp;&nbsp;&nbsp;</td><td class="featureLayerLegendLabel">' + label + '</td></tr>';          
            }
            htmlContent += '</table>';
            break;

           default:
            break;

        }

        document.getElementById(this.divId + '_featureLayerLegendContent').innerHTML = htmlContent;

    },

    _clearFeatureLayerLegendContent: function() {

        var htmlContent;

        var title = 'Legend';
        var content = 'No Content';

        htmlContent = "<table>";
        htmlContent += "<tr><td class='featureLayerLegendTitle'>" + title + "</td></tr>";
        htmlContent += '<tr><td class="featureLayerLegendLabel">' + content + '</td></tr>';          
        htmlContent += '</table>';
    
        document.getElementById(this.divId + '_featureLayerLegendContent').innerHTML = htmlContent;
    },

    /*
     * Switch the active feature layer
     * @param layerNameParam
     * @param whereClause
     * @param callbackParam 
     *
     */
    switchFeatureLayer: function(layerNameParam, layerOptionsParam, callbackParam) {
        //console.log('Ab.arcgis.MapExtensions -> switchFeatureLayer...');

        // hide tooltip and info window
        this._hideFeatureLayerTooltip();
        this._hideFeatureLayerInfoWindow();

        // remove existing feature layer
        if (this.featureLayerControl) {
            this.featureLayerControl.remove();
        }

        // prepare layer options for layer constructor
        if (layerNameParam) {
            var layerUrl = this.featureLayerList.get(layerNameParam).url;
            this.featureLayerUrl = layerUrl;

            var layerOptions = {
                id: 'featureLayer',
                mode: esri.layers.FeatureLayer.MODE_SNAPSHOT
            };
            if (this.featureLayerList.get(layerNameParam).outFields) {
                layerOptions.outFields = this.featureLayerList.get(layerNameParam).outFields;
            }
            if (this.featureLayerList.get(layerNameParam).opacity) {
                layerOptions.opacity = this.featureLayerList.get(layerNameParam).opacity;
            }
            if (this.featureLayerList.get(layerNameParam).index) {
                layerOptions.index = this.featureLayerList.get(layerNameParam).index;
            }

        }

        // set the active feature layer name
        this.featureLayerName = layerNameParam;

        // set layer options
        this.featureLayerOptions = layerOptions;

        // get the geometry type from the layer
        // then create symbols based on geometry type //TODO
        this._fetchFeatureLayerGeometryType(layerUrl);

        // create the feature layer 
        var featureLayer;
        var thematicDataSource = layerOptionsParam.thematicDataSource || 'ARCGIS';
        switch (thematicDataSource) {
            case 'WEB_CENTRAL':
                this.featureLayerDataOptions = {
                    source: 'WC_TABLE',
                    table: layerOptionsParam.table,
                    keyField: layerOptionsParam.keyField,
                    thematicField: layerOptionsParam.thematicField,
                    whereClause: layerOptionsParam.whereClause
                };
                featureLayer = this._createFeatureLayerFromWebCentralData();
                break;
            case 'WC_DATARECORDS':
                this.featureLayerDataOptions = {
                    source: 'WC_DATARECORDS',
                    dataRecords: layerOptionsParam.dataRecords,
                    keyField: layerOptionsParam.keyField,
                    thematicField: layerOptionsParam.thematicField,
                    whereClause: layerOptionsParam.whereClause
                };
                featureLayer = this._createFeatureLayerFromWebCentralData();                
                break;

            case 'WC_DATASOURCE':
                this.featureLayerDataOptions = {
                    source: 'WC_DATASOURCE',
                    dataSource: layerOptionsParam.dataSource,
                    dataSourceParameters: layerOptionsParam.dataSourceParameters,
                    dataSourceRestriction: layerOptionsParam.dataSourceRestriction,
                    keyField: layerOptionsParam.keyField,
                    thematicField: layerOptionsParam.thematicField,
                    whereClause: layerOptionsParam.whereClause
                };
                featureLayer = this._createFeatureLayerFromWebCentralData();                
                break;         
            case 'JSON':
                //TODO
                featureLayer = this._createFeatureLayerFromJsonData();
                break;
            default:
                this.featureLayerDataOptions = {
                    source: 'ARCGIS'
                };
                featureLayer = this._createArcgisFeatureLayer();
        }

        // set definition expression (where clause)
        var whereClause = this.featureLayerDataOptions.whereClause || '1=1';
        featureLayer.setDefinitionExpression(whereClause);

        // create the feature layer renderer
        if (layerOptionsParam.hasOwnProperty('renderer')) {
            switch (layerOptionsParam.renderer){
                case 'simple':
                    this.featureLayerRendererOptions = {
                        type: 'simple',
                        fillColor: layerOptionsParam.fillColor
                    };
                    break;
                case 'thematic-unique-values': 
                    this.featureLayerRendererOptions = {
                        type: 'thematic-unique-values',
                        thematicField: layerOptionsParam.thematicField, 
                        thematicUniqueValues: layerOptionsParam.thematicUniqueValues,                   
                        thematicColors: layerOptionsParam.thematicColors
                    };
                    if (this.featureLayerDataOptions.source == 'WC_DATARECORDS' || this.featureLayerDataOptions.source == 'WC_DATASOURCE') {
                        this.featureLayerRendererOptions.thematicField = 'ab_render_string';
                    }
                    break;
                case 'thematic-class-breaks':
                    this.featureLayerRendererOptions = {
                        type: 'thematic-class-breaks',
                        thematicField: layerOptionsParam.thematicField,
                        thematicClassBreaks: layerOptionsParam.thematicClassBreaks,
                        thematicColors: layerOptionsParam.thematicColors
                    };
                    if (this.featureLayerDataOptions.source == 'WC_DATARECORDS' || this.featureLayerDataOptions.source == 'WC_DATASOURCE') {
                        this.featureLayerRendererOptions.thematicField = 'ab_render_number';
                    }
                    break;
            };

            if (layerOptionsParam.hasOwnProperty('legendDataSuffix')){
                this.featureLayerRendererOptions.legendDataSuffix = layerOptionsParam.legendDataSuffix;
            } else {
                this.featureLayerRendererOptions.legendDataSuffix = '';
            }

            if (layerOptionsParam.hasOwnProperty('legendDataPrefix')){
                this.featureLayerRendererOptions.legendDataPrefix = layerOptionsParam.legendDataPrefix;
            } else {
                this.featureLayerRendererOptions.legendDataPrefix = '';
            }

            var renderer = this._createFeatureLayerRenderer();
            featureLayer.setRenderer(renderer);
        }

        // set default selection symbol (assumes polygon) //TODO
        if (featureLayer.getSelectionSymbol() === undefined) {
            featureLayer.setSelectionSymbol(this.featureLayerDefaultSelectionSymbol);
        }

        // create feature layer event handlers
        var _mapControl = this;
        this._createFeatureLayerEventHandlers(featureLayer, layerNameParam, _mapControl);

        // create feature layer on load callback
        if (callbackParam && typeof callbackParam === 'function') {
            var featureLayerLoadedCallback = callbackParam;
            featureLayer.on('load', function() {
                featureLayerLoadedCallback();
            });
        };

        // add the layer
        this.map.addLayer(featureLayer);
        //this.map.addLayers([featureLayer]);
        this.map.reorderLayer(featureLayer, 50);

        // make sure mouse events are enabled
        this.map.graphics.enableMouseEvents();

    },

    getFeatureLayerObjectIdsByValue: function(dataFieldName, objectIdFieldName, fieldValues){
        var objectIds = [];
        
        var featureLayer = this.map.getLayer('featureLayer');
        var graphics = featureLayer.graphics;

        for (i=0; i<fieldValues.length; i++){
          for (ii=0; ii<graphics.length; ii++){
            var graphic = graphics[ii];
            if (fieldValues[i] == graphic.attributes[dataFieldName]){
              objectIds.push(graphic.attributes[objectIdFieldName]);
            }
          }
        }

        return objectIds;
    },

    _createArcgisFeatureLayer: function() {
        var featureLayer = new esri.layers.FeatureLayer(this.featureLayerUrl, this.featureLayerOptions);
        return featureLayer;
    },

    _createFeatureLayerFromJsonData: function() {

    },

    _createFeatureLayerFromWebCentralData: function() {

        // create the wc feature data
        this._createFeatureData();

        // create the arcgis features
        this._createFeatureSet();
    
        //create a feature collection for polygons
        var featureCollection = {
          "layerDefinition": null,
          "featureSet": {
            "features": [],
            "geometryType": "esriGeometryPolygon"
          }
        };

        //TODO  
        // use feature layer list for field names
        //var featureLayerAssetIdField = this.featureLayerList.get(this.activeFeatureLayerName).assetIdField;

        // create the feature layer definition
        featureCollection.layerDefinition = {
          "geometryType": "esriGeometryPolygon",
          "objectIdField": "objectid",
          "drawingInfo": {
            "renderer": {
             "type": "simple",
             "symbol": {
              "type": "esriSFS",
              "style": "esriSFSSolid",
              "color": [
               31,
               121,
               180,
               255
              ],
              "outline": {
               "type": "esriSLS",
               "style": "esriSLSSolid",
               "color": [
                110,
                110,
                110,
                255
               ],
               "width": 0.4
              }
             }
            }
          },
          "fields": [
              {
               "name": "objectid",
               "alias": "objectid",
               "type": "esriFieldTypeOID"
              },
              //TODO  need to configure this key
              {
               "name": "ab_id",
               "type": "esriFieldTypeString",
               "alias": "ab_id",
               "domain": null,
               "editable": true,
               "nullable": true,
               "length": 12
              },
              {
               "name": "ab_name",
               "type": "esriFieldTypeString",
               "alias": "ab_name",
               "domain": null,
               "editable": true,
               "nullable": true,
               "length": 25
              },
              {
               "name": "ab_render_string",
               "type": "esriFieldTypeString",
               "alias": "ab_render_string",
               "domain": null,
               "editable": true,
               "nullable": true,
               "length": 50
              },
              {
               "name": "ab_render_number",
               "type": "esriFieldTypeDouble",
               "alias": "ab_render_number",
               "domain": null,
               "editable": true,
               "nullable": true
              }              
             ]
        };  


        var featureLayer = new esri.layers.FeatureLayer(featureCollection, 
            this.featureLayerOptions
        );

        return featureLayer;

    },

    _createFeatureData: function(){
        //console.log('Ab.arcgis.MapExtensions -> createFeatureData...');
        this.featureLayerData = new Ext.util.MixedCollection();
        var featureRecords;

        // get the data from WC
        switch (this.featureLayerDataOptions.source) {
            case 'WC_DATASOURCE':
                var fields = [this.featureLayerDataOptions.keyField, this.featureLayerDataOptions.thematicField];
                var featureRecords = this.getDataSourceRecords(this.featureLayerDataOptions.dataSource,
                    this.featureLayerDataOptions.dataSourceRestriction,
                    this.featureLayerDataOptions.dataSourceParameters
                );
                break;

            case 'WC_DATARECORDS':
                var fields = [this.featureLayerDataOptions.keyField, this.featureLayerDataOptions.thematicField];
                featureRecords = this.featureLayerDataOptions.dataRecords;
                break;

            case 'WC_TABLE':
                var table = this.featureLayerDataOptions.table;
                var fields = [this.featureLayerDataOptions.keyField, this.featureLayerDataOptions.thematicField];
                var whereClause = this.featureLayerDataOptions.whereClause;
                var featureRecords = this._getRecordsFromWebCentral(table, fields, whereClause);
                break;

        }

        // create the feature layer data collection
        var _featureLayerData = new Ext.util.MixedCollection();
        for (var i = 0; i < featureRecords.length; i++) {
            //console.log(featureRecords[i].values[this.featureLayerDataOptions['keyField']] + ' | ' + featureRecords[i].values[this.featureLayerDataOptions['thematicField']]);
            _featureLayerData.add(featureRecords[i].values[this.featureLayerDataOptions['keyField']], featureRecords[i].values);
        }

        this.featureLayerData = _featureLayerData;
    },

    _createFeatureSet: function(){
        // initialize query task
        var queryTask = new esri.tasks.QueryTask(this.featureLayerUrl);

        // initialize query
        var query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.outFields = this.featureLayerOptions.outFields; 
        //console.log('Feature layer query where clause : ' + this.featureLayerDataOptions.whereClause);
        query.where = this.featureLayerDataOptions.whereClause; //TODO definition expression handles this?

        // execute query
        //queryTask.execute(query, this._onFeatureQueryComplete);
        queryTask.execute(query).then(dojo.hitch(this, '_onFeatureQueryResults'), dojo.hitch(this, '_onFeatureQueryError'));
          
    },

    _onFeatureQueryResults: function(results){
        
        var _mapControl = this;

        var features = dojo.map(results.features, function(object){ 
            var attributes = object.attributes;
            var geometry = object.geometry;
     
            // add archibus attributes to features
            var keyField = _mapControl.featureLayerList.get(_mapControl.featureLayerName)['assetIdField'];
            var keyValue = attributes[keyField];
            var thematicField = _mapControl.featureLayerDataOptions.thematicField;
            // example: _mapControl.featureLayerData.get('B-US-MA-1001')['bl.use1']
            
            if (_mapControl.featureLayerData.get(keyValue) !== undefined) {
                var renderValue = _mapControl.featureLayerData.get(keyValue)[thematicField];          
                //TODO 
                attributes.ab_render_string = renderValue;
                attributes.ab_render_number = Number(renderValue); //parseInt(renderValue);                 
            } else {
                attributes.ab_render_string = null;
                attributes.ab_render_number = null;
            }

            return new esri.Graphic(geometry, null, attributes, null);
            
        });
        
        // add features to feature layer
        var featureLayer = this.map.getLayer('featureLayer');
        featureLayer.applyEdits(features, null, null);        

        // update the feature layer legend
        this._updateFeatureLegendContent();

    },

    _onFeatureQueryError: function(error){

        //console.log('Ab.arcgis.MapExtensions -> _onFeatureQueryError...');

    },

    _createFeatureLayerRenderer: function() {
        // set renderer
        var renderer;

        switch (this.featureLayerRendererOptions.type) {

            case 'simple':
                // create simple fill symbol
                var lineColor = new dojo.Color([0, 0, 0, 0.0]);
                var lineSymbol = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                var lineWidth = 1.0;
                var outline = new esri.symbol.SimpleLineSymbol(lineSymbol, lineColor, lineWidth);

                var fillSymbol = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
                var color = this.featureLayerRendererOptions.fillColor || [255, 0, 0];
                var fillColor = new esri.Color(color);

                var symbol = new esri.symbol.SimpleFillSymbol(fillSymbol, outline, fillColor);

                // define simple renderer
                var renderer = new esri.renderer.SimpleRenderer(symbol);
                break;

            case 'thematic-unique-values':
                var thematicDataSource = this.featureLayerDataOptions.source || 'ARCGIS';
                var thematicColors = this.featureLayerRendererOptions.thematicColors; //TODO
                var thematicField = this.featureLayerRendererOptions.thematicField;
                var thematicUniqueValues = this.featureLayerRendererOptions.thematicUniqueValues || [];
                var whereClause = this.featureLayerRendererOptions.whereClause || '1=1';
                
                // this is only relevant to WebC data source
                if (thematicDataSource === 'WEB_CENTRAL' && thematicUniqueValues.length === 0) {
                    thematicUniqueValues = this._getDistinctFieldValues(thematicField, whereClause);
                }

                // define default symbol
                var fillSymbol = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
                var fillColor = new dojo.Color([0, 0, 0, 0.35]);

                var lineColor = new dojo.Color([82, 82, 82, 0.90]);
                var lineSymbol = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                var lineWidth = 1.0;
                var outline = new esri.symbol.SimpleLineSymbol(lineSymbol, lineColor, lineWidth);

                var defaultSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, outline, fillColor);

                // define unique value renderer
                renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, thematicField);
                for (i = 0; i < thematicUniqueValues.length; i++) {
                    var thematicSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, outline, thematicColors[i]);
                    renderer.addValue(thematicUniqueValues[i], thematicSymbol);
                }
                break;

            case 'thematic-class-breaks':
                var thematicColors = this.featureLayerRendererOptions.thematicColors; //TODO
                var thematicField = this.featureLayerRendererOptions.thematicField;
                var thematicClassBreaks = this.featureLayerRendererOptions.thematicClassBreaks;

                // define default symbol
                var fillSymbol = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
                var fillColor = new dojo.Color([0, 0, 0, 0.35]);

                var lineColor = new dojo.Color([0, 0, 0, 0.0]);
                var lineSymbol = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                var lineWidth = 1.0;
                var outline = new esri.symbol.SimpleLineSymbol(lineSymbol, lineColor, lineWidth);

                var defaultSymbol = null; //new esri.symbol.SimpleFillSymbol(fillSymbol, outline, fillColor);

                // define class breaks renderer
                renderer = new esri.renderer.ClassBreaksRenderer(defaultSymbol, thematicField);
                for (i = 0; i < thematicClassBreaks.length + 1; i++) {
                    var thematicColor = new dojo.Color(thematicColors[i]);
                    var thematicSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, outline, thematicColor);
                    if (i == 0) {
                        // first class break
                        renderer.addBreak({
                            minValue: -Infinity,
                            maxValue: thematicClassBreaks[0],
                            symbol: thematicSymbol
                        });
                    } else if (i == this.featureLayerRendererOptions.thematicClassBreaks.length) {
                        // last class break
                        renderer.addBreak({
                            minValue: thematicClassBreaks[i - 1],
                            maxValue: +Infinity,
                            symbol: thematicSymbol
                        });
                    } else {
                        // intermediate class break
                        renderer.addBreak({
                            minValue: thematicClassBreaks[i - 1],
                            maxValue: thematicClassBreaks[i],
                            symbol: thematicSymbol
                        });
                    }
                }
                break;

            default:
                break;
        }
        return renderer;
    },

    _createFeatureLayerEventHandlers: function(featureLayer, featureLayerName, mapControl) {
        var me = this;
        var featureLayerControl = mapControl.featureLayerControl;
        // wire up mouse events for tooltip
        // TODO update to use featureLayer.on('mouse-over', 'mouse-move', 'mouse-out')		
        dojo.connect(featureLayer, 'onMouseOver', function(event) {
            //console.log('Ab.arcgis.MapExtensions -> onMouseOver...');
            var toolTipField = mapControl.featureLayerList.get(featureLayerName).toolTipField;
            var toolTipValue = event.graphic.attributes[toolTipField];
            if (toolTipValue == ' ') {
                toolTipValue = 'NO DATA';
            }
            var highlightGraphic = new esri.Graphic(event.graphic.geometry, mapControl.featureLayerHighlightSymbol);
            highlightGraphic.attributes = event.graphic.attributes;
            highlightGraphic.id = 'highlightGraphic';

            mapControl.featureLayerHighlightGraphics.clear();
            mapControl.featureLayerHighlightGraphics.add(highlightGraphic);

            dojo.style(mapControl.featureLayerTooltip, "display", "");
            var node = dojo.byId(me.divId + '_featureLayerTooltip');
            node.innerHTML = toolTipValue;

        });

        dojo.connect(featureLayer, "onMouseMove", function(evt) {
            //console.log('Ab.arcgis.MapExtensions -> onMouseMove...');
            var px, py;
            if (evt.clientX || evt.pageY) {
                px = evt.clientX;
                py = evt.clientY;
            } else {
                px = evt.clientX + dojo.body().scrollLeft - dojo.body().clientLeft;
                py = evt.clientY + dojo.body().scrollTop - dojo.body().clientTop;
            }
            dojo.style(mapControl.featureLayerTooltip, "display", "none");
            dojo.style(mapControl.featureLayerTooltip, {
                left: (px + 15) + "px",
                top: (py) + "px"
            });
            dojo.style(mapControl.featureLayerTooltip, "display", "");
        });

        dojo.connect(featureLayer, "onMouseOut", function(evt) {
            //console.log('Ab.arcgis.MapExtensions -> onMouseOut...');
            mapControl.featureLayerTooltip.style.display = 'none';
            mapControl.featureLayerHighlightGraphics.clear();
        });

        // wire up layer on click event
        if (this.mapConfigObject.featureLayerClickCallback &&
            typeof this.mapConfigObject.featureLayerClickCallback === 'function') {

            var featureLayerClickCallback = this.mapConfigObject.featureLayerClickCallback;
            var assetIdField = this.featureLayerList.get(featureLayerName).assetIdField;
            var assetTypeField = this.featureLayerList.get(featureLayerName).assetTypeField;

            dojo.connect(featureLayer, 'onClick', function(event) {
                //console.log('Ab.arcgis.MapExtensions -> featureLayerMouseOver...');
                var assetIdValue = event.graphic.attributes[assetIdField];
                var assetTypeValue = event.graphic.attributes[assetTypeField];
                var assetGraphic = esri.Graphic(event.graphic.geometry, null, event.graphic.attributes, null);
                featureLayerClickCallback(assetIdValue, assetTypeValue, assetGraphic);
            });
        }

        // wire up layer mouse over event
        if (this.mapConfigObject.featureLayerMouseOverCallback &&
            typeof this.mapConfigObject.featureLayerMouseOverCallback === 'function') {

            var featureLayerMouseOverCallback = this.mapConfigObject.featureLayerMouseOverCallback;
            var assetIdField = this.featureLayerList.get(featureLayerName).assetIdField;
            var assetTypeField = this.featureLayerList.get(featureLayerName).assetTypeField;

            dojo.connect(featureLayer, 'onMouseOver', function(event) {
                //console.log('Ab.arcgis.MapExtensions -> featureLayerMouseOverClick...');
                var assetIdValue = event.graphic.attributes[assetIdField];
                var assetTypeValue = event.graphic.attributes[assetTypeField];
                var assetGraphic = esri.Graphic(event.graphic.geometry, null, event.graphic.attributes, null);
                featureLayerMouseOverCallback(assetIdValue, assetTypeValue, assetGraphic);
            });
        }

        // wire up layer mouse out event
        if (this.mapConfigObject.featureLayerMouseOutCallback &&
            typeof this.mapConfigObject.featureLayerMouseOutCallback === 'function') {

            var featureLayerMouseOutCallback = this.mapConfigObject.featureLayerMouseOutCallback;

            dojo.connect(featureLayer, 'onMouseOut', function(event) {
                //console.log('Ab.arcgis.MapExtensions -> featureLayerMouseOut...');
                featureLayerMouseOutCallback();
            });
        }
    },

    /*
     * Selects/highlights assets in the active feature layer
     * @param featureLayerName
     * @param whereClause
     * @param highlightFeatures 
     *
     */
    selectFeatures: function(featureLayerName, whereClause, highlightFeatures) {
        //console.log('Ab.arcgis.MapExtensions -> selectFeatures...');

        // hide tooltip
        this._hideFeatureLayerTooltip();

        // switch current feature layer
        // if (this.featureLayerName !== featureLayerName) {
        //     this.switchFeatureLayer(featureLayerName);
        // }

        // remove selection graphics
        this.clearSelectedFeatures();

        // prepare the feature layer query
        var query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.where = whereClause;

        // get the feature layer from the map
        var featureLayer = this.map.getLayer('featureLayer');

        // set the selection symbol
        if (highlightFeatures === false) {
            featureLayer.setSelectionSymbol(this.featureLayerNoSelectionSymbol);
        } else {
            featureLayer.setSelectionSymbol(this.featureLayerSelectionSymbol);
        }

        // query features from feature layer
        if (featureLayer) {
            var mapControl = this;

            var dojoHandle = featureLayer.on('selection-complete', function(result) {
                mapControl.selectFeaturesComplete(result);
                dojoHandle.remove();
            });

            //selectFeatures(query, selectionMethod?, callback?, errback?)
            featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW);
        }
    },

    selectFeaturesByObjectIds: function(objectIds, highlightFeatures){
        //console.log('Ab.arcgis.MapExtensions -> selectFeaturesByObjectIds...');

        // hide tooltip
        this._hideFeatureLayerTooltip();

        // remove selection graphics
        this.clearSelectedFeatures();

        // prepare the feature layer query
        var query = new esri.tasks.Query();
        query.objectIds = objectIds;

        // get the feature layer from the map
        var featureLayer = this.map.getLayer('featureLayer');

        // set the selection symbol
        if (highlightFeatures === false) {
            featureLayer.setSelectionSymbol(this.featureLayerNoSelectionSymbol);
        } else {
            featureLayer.setSelectionSymbol(this.featureLayerSelectionSymbol);
        }

        if (featureLayer) {
            var mapControl = this;

            var dojoHandle = featureLayer.on('selection-complete', function(result) {
                mapControl.selectFeaturesComplete(result);
                dojoHandle.remove();
            });

            //selectFeatures(query, selectionMethod?, callback?, errback?)
            featureLayer.selectFeatures(query, esri.layers.FeatureLayer.SELECTION_NEW);
        }        

    },

    selectFeaturesComplete: function(result) {
        //console.log('Ab.arcgis.MapExtensions -> selectFeaturesComplete...');

        // zoom to the exent of the features
        if (result.features.length > 0) {
            //var extent = esri.graphicsExtent(result.features);
            //this.map.setExtent(extent, true)
        } else {
            View.alert('Map feature not found.');
        }

    },

    showFeatureLayer: function() {
        if (this.featureLayerControl) {
            this.featureLayerControl.show();
        }
    },

    hideFeatureLayer: function() {
        if (this.featureLayerControl) {
            this.featureLayerControl.hide();
        }
    },

    removeFeatureLayer: function() {
        if (this.featureLayerControl) {
            this.featureLayerControl.remove();
        }
    },

    _fetchFeatureLayerGeometryType: function(layerUrl) {
        var _mapControl = this;
        dojo.io.script.get({
            url: layerUrl,
            callbackParamName: "callback",
            content: {
                f: 'json'
            },
            load: function(results) {
                var geometryType = results.geometryType;
                _mapControl._createFeatureLayerSymbols(geometryType);
            },
            error: function(error) {
                View.alert("Error loading feature layer: " + layerUrl);
                //console.log("Error loading feature layer: " + error.message);
            }
        });
    },

    _createFeatureLayerDefaultSymbol: function() {
        // assumes polygon
        var _selectionSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 2.0), new dojo.Color([0, 0, 0, 0.5]));
        var _noSelectionSymbol = new esri.symbol.SimpleFillSymbol(
            esri.symbol.SimpleFillSymbol.STYLE_SOLID,
            new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0]), 0.0), new dojo.Color([0, 0, 0, 0.0]));

        this.featureLayerSelectionSymbol = _selectionSymbol;
        this.featureLayerNoSelectionSymbol = _noSelectionSymbol;
    },

    _createFeatureLayerSymbols: function(geometryType) {

        var featureLayerControl = this.featureLayerControl;

        switch (geometryType) {

            case 'esriGeometryPoint':
                var markerStyle = esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE;
                var markerSize = 15;
                var lineSymbol = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                var lineWidth = 1.0;
                var lineWidthBold = 2.0;

                var selectionFillColor = new dojo.Color([0, 0, 0, 0.5]);
                var selectionLineColor = new dojo.Color([0, 0, 0]);
                var selectionOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, selectionLineColor, lineWidthBold);
                this.featureLayerSelectionSymbol = new esri.symbol.SimpleMarkerSymbol(markerStyle, markerSize, selectionOutline, selectionFillColor);

                var noSelectionFillColor = new dojo.Color([0, 0, 0, 0.0]);
                var noSelectionLineColor = new dojo.Color([0, 0, 0]);
                var noSelectionOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, noSelectionLineColor, lineWidthBold);
                this.featureLayerNoSelectionSymbol = new esri.symbol.SimpleMarkerSymbol(markerStyle, markerSize, noSelectionOutline, noSelectionFillColor);

                var highlightFillColor = new dojo.Color([0, 0, 0, 0.35]);
                var highlightLineColor = new dojo.Color([0, 0, 0, 0.0]);
                var highlightOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, highlightLineColor, lineWidthBold);
                this.featureLayerHighlightSymbol = new esri.symbol.SimpleMarkerSymbol(markerStyle, markerSize, highlightOutline, highlightFillColor);
                break;

            case 'esriGeometryLine':
                // TODO
                break;

            case 'esriGeometryPolygon':
                var fillSymbol = esri.symbol.SimpleFillSymbol.STYLE_SOLID;
                var lineSymbol = esri.symbol.SimpleLineSymbol.STYLE_SOLID;
                var lineWidth = 1.0;
                var lineWidthBold = 2.0;

                var selectionFillColor = new dojo.Color([0, 0, 0, 0.75]);
                var selectionLineColor = new dojo.Color([0, 0, 0]);
                var selectionOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, selectionLineColor, lineWidthBold);
                this.featureLayerSelectionSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, selectionOutline, selectionFillColor);

                var noSelectionFillColor = new dojo.Color([0, 0, 0, 0.0]);
                var noSelectionLineColor = new dojo.Color([0, 0, 0, 0.0]);
                var noSelectionOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, noSelectionLineColor, lineWidthBold);
                this.featureLayerNoSelectionSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, noSelectionOutline, noSelectionFillColor);

                var highlightFillColor = new dojo.Color([0, 0, 0, 0.75]);
                var highlightLineColor = new dojo.Color([0, 0, 0, 0.0]);
                var highlightOutline = new esri.symbol.SimpleLineSymbol(lineSymbol, highlightLineColor, lineWidth);
                this.featureLayerHighlightSymbol = new esri.symbol.SimpleFillSymbol(fillSymbol, highlightOutline, highlightFillColor);
                break;
        }

    },

    // clear selected features from the feature layer
    clearSelectedFeatures: function() {
        if (this.featureLayerControl) {
            this.featureLayerControl.clearSelection();
        }
    },

    // clear all feature graphics from the feature layer
    clearFeatures: function() {
        if (this.featureLayerControl) {
            this.featureLayerControl.clear();
            // clear the legend content
            this._clearFeatureLayerLegendContent();
            // clear the info window content
            this._clearFeatureLayerInfoWindowContent();
            this.hideFeatureLayerInfoWindow();
        }
    },

    showFeatureLayerInfoWindow: function(htmlContent) {
        dojo.style(this.divId + '_featureLayerInfoWindow', {
            'display': 'block'
        });
        this._updateFeatureLayerInfoWindowContent(htmlContent);
    },

    hideFeatureLayerInfoWindow: function() {
        dojo.style(this.divId + '_featureLayerInfoWindow', {
            'display': 'none'
        });
    },

    _updateFeatureLayerInfoWindowContent: function(htmlContent) {
        document.getElementById(this.divId + '_featureLayerInfoWindowContent').innerHTML = htmlContent;
    },

    _clearFeatureLayerInfoWindowContent: function() {
        document.getElementById(this.divId + '_featureLayerInfoWindowContent').innerHTML = '';
    },

    _getDistinctFieldValues: function(field, whereClause){
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

    _getRecordsFromWebCentral: function(table, fields, whereClause) {
        var featureRecords;

        if (!whereClause) {var whereClause = '1=1';}
        
        try {
            var parameters = {
                tableName: table,
                fieldNames: toJSON(fields),
                restriction: toJSON(whereClause)
            };
            var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
            featureRecords = result.data.records;

        } catch (e) {
            Workflow.handleError(e);
        }

        return featureRecords;
    }

});

/*
 *   This control defines the ArcGIS Feature Layer 
 *   This control is used with the Extensions for ArcGIS
 *   It displays features from an ArcGIS map service
 */


Ab.arcgis.FeatureLayer = Base.extend({

    // @begin_translatable
    //z_MESSAGE_QUERY_xxx: '',
    //z_MESSAGE_QUERY_yyy: '',
    // @end_translatable

    //the Ab.arcgis.ArcGISMap associated with the tool
    mapControl: null,

    /*
     *  The constructor.
     *	@param mapParam. The associated Ab.arcgis.MapExtensions control.
     *
     */
    constructor: function(mapParam) {
        //console.log('Ab.arcgis.FeatureLayer -> constructor...');

        this.mapControl = mapParam;
    },



    /*
     * Clear the current feature layer and
     * remove any associated graphics from the map.
     */
    clear: function() {
        // clear all features from feature layer
        var featureLayer = this.mapControl.map.getLayer('featureLayer');
        if (featureLayer) {
            featureLayer.clear();
            //this.mapControl.featureLayerName = null;
        }

        // clear graphics layers
        this.mapControl.featureLayerHighlightGraphics.clear();

    },

    clearSelection: function() {
        // clear selected features from feature layer
        var featureLayer = this.mapControl.map.getLayer('featureLayer');
        if (featureLayer) {
            featureLayer.clearSelection();
            //this.mapControl.activeFeatureLayerName = null;
        }

        // clear graphics layers
        this.mapControl.featureLayerHighlightGraphics.clear();
    },

    hide: function() {
        var featureLayer = this.mapControl.map.getLayer('featureLayer');
        if (featureLayer) {
            featureLayer.hide();
        }
    },

    remove: function() {
        var featureLayer = this.mapControl.map.getLayer('featureLayer');
        if (featureLayer) {
            this.mapControl.map.removeLayer(featureLayer);
            this.mapControl.featureLayerName = null;
            this.mapControl.featureLayerUrl = null;
            this.mapControl.featureLayerOptions = null;
            this.mapControl.featureLayerData = null;
            this.mapControl.featureLayerRendererOptions = null;
            this.mapControl.featureLayerDataOptions = null;
        }
    },

    show: function() {
        var featureLayer = this.mapControl.map.getLayer('featureLayer');
        if (featureLayer) {
            featureLayer.show();
        }
    }

});