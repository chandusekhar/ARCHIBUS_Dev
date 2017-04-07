/**
 * A preliminary Map implementation
 *
 * Displays a Google map or ESRI map using Leaflet
 *
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Map.component.Map', {
    extend: 'Ext.Component',

    xtype: 'abmap',

    /**
     * @property {Object} map The Leaflet map
     */
    map: null,

    /**
     * @property {Object[L.layergroup]} basemapLayerGroup The basemap layer group.
     */
    basemapLayerGroup: null,

    /**
     * @property {Array[Object]} basemapLayerGroup An array of basemap name-value pairs.
     */
    basemapLayerList: null,

    // holds a reference to the leaflet reference layer group
    markerLayerGroup: null,

    // Ext.util.MixedCollection
    // holds a list of datasource-MarkerProperty pairs
    // key is the dataSource, value is the corresponding LeafletMarkerProperty
    dataSourceMarkerPairs: null,

    // the marker action callback function
    markerActionCallback: null,

    config: {

        /**
         * @cfg {Number[]} center The center of the map
         */
        mapCenter: [37.30028, -98.26172],

        /**
         * @cfg {Number} zoom The map zoom level
         */
        mapZoom: 3

    },

    template: [
        {
            tag: 'div',
            reference: 'mapEl',
            cls: 'ab-map'
        }
    ],

    /**
     *
     * Map display methods.
     */
    setLatLonAndZoom: function (lat, lon, zoom) {
        var me = this;

        me.setView([lat, lon], zoom);
    },

    setCenterAndZoom: function (center, zoom) {
        var me = this;

        me.setView(center, zoom);
    },

    setView: function (center, zoom) {
        var me = this;

        if (me.map) {
            me.map.setView(center, zoom);
        }
    },

    initialize: function () {
        var me = this;

        // initialize marker pairs
        this.dataSourceMarkerPairs = new Ext.util.MixedCollection();

        me.on('painted', me.onPainted, me, {single: true});

        me.on('mapLoaded', me.onMapLoaded, me, {single:true});

        me.on('markerClick', me.onMarkerClck, me);
    },

    /**
     * The onPainted function is implemented in the Esri or Google map classes
     */
    onPainted: Ext.emptyFn,

    /**
     * The onMapLoaded function is implemented in the Esri or Google map classes
     */
    onMapLoaded: Ext.emptyFn,

    /**
     * Get the layer names for all available basemap layers
     */
    getBasemapLayerList: function () {
        var me = this;

        return me.basemapLayerList.keys;
    },

    /*
     * Clear the marker layers.
     */
    clearMarkers: function () {
        this.markerLayerGroup.clearLayers();
    },

    /*
     *  create marker definition for the specified datasource with the specified marker properties
     */
    createMarkers: function (storeId, keyFields, geometryFields, titleField, contentFields, markerOptions) {
        var me = this,
            markerProperties,
            renderer = markerOptions.renderer || 'simple',
            markerConfig = {
                storeId: storeId,
                keyFields: keyFields,
                geometryFields: geometryFields,
                titleField: titleField,
                contentFields: contentFields,
                markerOptions: markerOptions
            },
            markerRenderers = {
                'simple': 'Simple',
                'thematic-class-breaks': 'Thematic',
                'thematic-unique-values': 'Thematic',
                'graduated-class-breaks': 'Thematic',
                'thematic-graduated-class-breaks': 'Thematic',
                'thematic-graduated-unique-values': 'Thematic',
                'proportional': 'Thematic',
                'thematic-proportional-unique-values': 'Thematic',
                'thematic-proportional-class-breaks': 'Thematic'
            },
            markerClass;

        Log.log('Map -> Create Markers...', 'debug');

        if (markerRenderers.hasOwnProperty(renderer)) {
            markerClass = 'Map.component.' + markerRenderers[renderer] + 'Marker';
        } else {
            Log.log('Error - Unsupported marker renderer : ' + renderer, 'error');
        }

        markerProperties = Ext.create(markerClass, markerConfig);

        me.updateMarkerPropertiesByStoreId(storeId, markerProperties);

    },

    /**
     *
     * Show current location methods
     */
    addLocationMarker: function (lat, lon) {
        var me = this,
            markerOptions = {
                radius: 10,
                fillColor: '#377eb8',
                fillOpacity: 1.0,
                stroke: true,
                color: '#fff',
                weight: 3,
                layerId: 'currentLocationLayer'
                //riseOnHover: _markerOptions.riseOnHover,
                //title: feature.id,
                //content: feature.properties
            },
            popupContent = '<div class="ab-map-popup-content-fields" id="abMapPopupContentFields">' +
                'Current location: <br>' + lat + ', ' + lon +
                '</div>';

        me.createMarkerGroupLayer(lat, lon, markerOptions, popupContent);
    },

    clearLocationMarker: function () {
        var me = this;

        me.clearMarkerGroupLayer('currentLocationLayer');
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
            layers = me.markerLayerGroup._layers,
            layerId;

        for (layerId in layers) {
            layer = layers[layerId];
            if (layer.hasOwnProperty('options')) {
                if (layer.options.layerId === layerName) {
                    me.markerLayerGroup.removeLayer(layer._leaflet_id);
                }
            }
        }
    },

    /**
     *
     * Locate asset methods.
     */
    startLocateAsset: function (lat, lon) {
        var me = this,
            mapCenter;

        // add the locate asset marker
        if (Ext.isEmpty(lat) || Ext.isEmpty(lon)) {
            mapCenter = me.map.getCenter();
            lat = mapCenter.lat;
            lon = mapCenter.lng;
        }
        me.addLocateAssetMaker(lat, lon);
        me.setView([lat, lon], 16);

        me.map.on('click', me.onAssetLocateMapClick, this);
    },

    onAssetLocateMapClick: function (evt) {
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
                'Asset location: <br>' + lat.toFixed(7) + ', ' + lon.toFixed(7) + '<br><br>' +
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
            lat,lon,
            layers = me.markerLayerGroup._layers,
            layerId,
            layer;

        // get final lat-lon
        for (layerId in layers) {
            layer = layers[layerId];
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
        return [lat, lon];
    },

    /*
     *  show markers for the specified store and filter
     */
    showMarkers: function (storeId, filter) {
        var me = this,
            markerProperties = me.getMarkerPropertiesByStoreId(storeId),
            _markerOptions;

        Log.log('Map -> Show Markers...', 'debug');

        if (markerProperties) {
            _markerOptions = markerProperties.getMarkerOptions();
            if (_markerOptions.markerActionTitle) {
                //TODO
                me.markerActionCallback = markerProperties.getMarkerOptions().markerActionCallback;
            }

            // we have to get the datasource/records first, then resume creating markers
            me.getMarkerRecordsFromStore(storeId, filter);

        } else {
            // return, display and log error
            Log.log('Marker definition does not exist for storeId : ' + storeId, 'error');
        }

    },

    /**
     * @private
     * @param storeId
     * @param filters
     */
    getMarkerRecordsFromStore: function (storeId, filters) {
        var me = this,
            store = Ext.getStore(storeId);

        Log.log('Map -> Get Marker Records From Store...', 'debug');

        if (filters.length > 0) {
            store.setDisablePaging(false);
            store.setFilters(filters);
        } else {
            store.setDisablePaging(true);
            store.clearFilter();
        }


        store.load(function (records) {
            me.onGetMarkerRecordsFromStore(storeId, records);
        });
    },

    /**
     * @private
     * @param storeId
     * @param records
     */
    onGetMarkerRecordsFromStore: function (storeId, records) {
        var me = this;

        // create marker data from records
        var markerData = me.createMarkerData(storeId, records);

        Log.log('Map -> On Get Marker Records From Store...', 'debug');

        // display the markers
        if (markerData.features.length > 0) {
            me.displayMarkers(storeId, markerData);
        }
    },


    /*
     *  return the markerProperties for given ds
     *  @private
     *  @param dataSource. The dataSource name
     */
    getMarkerPropertiesByStoreId: function (storeId) {
        var me = this;
        Log.log('Map -> Get Marker Properties By StoreId...', 'debug');

        return me.dataSourceMarkerPairs.get(storeId);
    },

    /**
     * @private
     * @param storeId
     * @param markerProperties
     */
    updateMarkerPropertiesByStoreId: function (storeId, markerProperties) {
        var me = this;

        if (me.getMarkerPropertiesByStoreId(storeId) === null) {
            me.dataSourceMarkerPairs.add(storeId, markerProperties);
        }
        else {
            this.dataSourceMarkerPairs.replace(storeId, markerProperties);
        }
    },

    /*
     *  Helper / Convenience Methods
     */

    /**
     *  get map data
     *  @private
     *  @param dataSource. The dataSource name.
     *  @param restriction. The Restriction.
     *  @return. The map data (geoJson).
     */
    createMarkerData: function (storeId, records) {
        // convert record data to geoJson

        var markerData = this.recordsToGeoJson(storeId, records);
        Log.log('Map -> Create Marker Data...', 'debug');

        return markerData;
    },

    //TODO refactor 
    recordsToGeoJson: function (storeId, records) {
        var markerData = {},
            features = [],
            markerProperties = this.getMarkerPropertiesByStoreId(storeId),
            lonField = markerProperties.getGeometryFields()[0],
            latField = markerProperties.getGeometryFields()[1],
            keyFields = markerProperties.getKeyFields(),
            contentFields = markerProperties.getContentFields(),
            record,
            lat,
            lon,
            r, j, k,
            feature,
            geometry,
            coordinates,
            properties,
            fieldTitle,
            fieldValue,
            titleFieldValue,
            popupTitle,
            popupAction,
            popupContent,
            keyValues,
            keyValue;

        // create feature GeoJson for each record
        var recordsLength = records.length;

        Log.log('Map -> Records To GeoJson...', 'debug');
        for (r = 0; r < recordsLength; r++) {
            record = records[r];

            lon = record.get(lonField);
            lat = record.get(latField);

            if (Ext.isEmpty(lon) || Ext.isEmpty(lat)) {
                //TODO
                // assetKey = '';
                // for (l = 0; l < keyFields.length; l++) {
                //     keyValue = record.get(keyFields[l]);
                //     if (l === 0) {
                //         assetKey = keyValue;
                //     } else {
                //         assetKey += '-' + keyValue;
                //     }
                // }
                // What can we do here...
                // Log.log('Asset has no location data. Asset key: ' + assetKey,'debug');
            } else {

                feature = {};

                // type
                feature.type = 'Feature';

                // geometry
                geometry = {};
                geometry.type = 'Point';

                coordinates = [
                    record.get(lonField),
                    record.get(latField)
                ];
                geometry.coordinates = coordinates;

                feature.geometry = geometry;

                // properties
                properties = {};
                popupContent = '<div class="ab-map-popup-content-fields" id="abMapPopupContentFields">';

                for (j = 0; j < contentFields.length; j++) {
                    fieldTitle = this.getFieldTitle(storeId, contentFields[j]);
                    fieldValue = record.get(contentFields[j]) || '';
                    popupContent += '<b>' + fieldTitle + '</b>: ' + fieldValue + '</br>';
                    properties[contentFields[j]] = fieldValue;
                }
                popupContent += "</div>";
                feature.properties = properties;

                // format the title based on the title field and/or its lookup field
                titleFieldValue = record.get(markerProperties.get('titleField'));

                popupTitle = '<span class="ab-map-popup-content-title" id="abMapPopupContentTitle">';
                popupTitle += titleFieldValue;
                popupTitle += '</span>';
                feature.properties.popupTitle = popupTitle;

                //TODO
                //add marker action to popup
                if (markerProperties.getMarkerOptions().markerActionTitle && markerProperties.getMarkerOptions().markerActionCallback) {
                    //<a class="action" id="actionLink" href="javascript: void(0);">Show Details</a>
                    popupAction = '<span class="ab-map-popup-action" id="abMapPopupAction"><a href="javascript: void(0);">';
                    popupAction += markerProperties.getMarkerOptions().markerActionTitle;
                    popupAction += '</a></span>';

                    popupContent += popupAction;
                }
                feature.properties.popupContent = popupContent;

                keyValues = '';
                for (k = 0; k < keyFields.length; k++) {
                    keyValue = record.get(keyFields[k]);
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

    /**
     * @private
     * @param storeId
     * @param markerData
     */
    displayMarkers: function (storeId, markerData) {
        var me = this,
            markerProperties,
            _markerOptions,
            geoJsonLayer,
            markerClusters;

        // clear the marker layer
        // clear markers for this datasource only
        me.removeLayerFromLayerGroup(me.markerLayerGroup, storeId);

        // get the marker properties
        markerProperties = me.getMarkerPropertiesByStoreId(storeId);
        _markerOptions = markerProperties.getMarkerOptions();
        usePopup = _markerOptions.usePopup;           
        geoJsonLayer = L.geoJson(markerData, {
            getStoreId: function () {
                return storeId;
            },
            pointToLayer: function (feature, latlng) {
                var markerOptions = {
                    radius: getMarkerRadius(feature, markerProperties),
                    fillColor: getMarkerFillColor(feature, markerProperties),
                    fillOpacity: _markerOptions.fillOpacity,
                    stroke: _markerOptions.stroke,
                    color: _markerOptions.color,
                    weight: _markerOptions.weight,
                    riseOnHover: _markerOptions.riseOnHover,
                    //title: feature.id,
                    content: feature.properties
                };

                var marker;
                switch (_markerOptions.renderer) {
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

            onEachFeature: function (feature, layer) {

                if (usePopup === true) {
                    layer.bindPopup(
                        feature.properties.popupTitle +
                        feature.properties.popupContent
                    );
                }

                layer.on('click', function (evt) {
                    feature = evt.target.feature;
                    assetId = feature.properties.keyValues;             
                    me.fireEvent('markerClick', assetId, feature);
                });
            }
        });

        //TODO ?
        if (_markerOptions.useClusters === true) {
            markerClusters = L.markerClusterGroup({

                polygonOptions: {
                    fillColor: '#000',
                    color: '#000',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.25
                },

                iconCreateFunction: function (cluster) {
                    var count = cluster.getChildCount();
                    return L.divIcon({
                        html: '<div style="ab-map-div-cluster-marker-label">' + (count) + '</div>',
                        className: 'ab-map-div-cluster-marker',
                        iconSize: [25, 25]
                    });
                }
            });
            markerClusters.addLayer(geoJsonLayer);
            me.map.addLayer(markerClusters);
            markerClusters.bringToFront();
            me.map.fitBounds(markerClusters.getBounds());
        } else {
            me.markerLayerGroup.addLayer(geoJsonLayer);
            geoJsonLayer.bringToFront();
            me.map.fitBounds(geoJsonLayer.getBounds());
        }

        function getMarkerFillColor(feature, markerProperties) {
            var fillColor,
                featureValue,
                i;

            _markerOptions = markerProperties.getMarkerOptions();

            switch (_markerOptions.renderer) {

                case 'simple':
                case 'graduated-class-breaks':
                case 'proportional':
                    fillColor = _markerOptions.fillColor;
                    break;

                case 'thematic-unique-values':
                case 'thematic-graduated-unique-values':
                case 'thematic-proportional-unique-values':
                    featureValue = feature.properties[_markerOptions.thematicField];
                    for (i = 0; i < _markerOptions.thematicRenderer.length; i++) {
                        if (featureValue === _markerOptions.thematicRenderer[i].uniqueValue) {
                            fillColor = _markerOptions.thematicRenderer[i].color;
                        }
                    }
                    break;

                case 'thematic-class-breaks':
                case 'thematic-graduated-class-breaks':
                case 'thematic-proportional-class-breaks':
                    featureValue = feature.properties[_markerOptions.thematicField];
                    for (i = 0; i < _markerOptions.thematicRenderer.length; i++) {
                        if (i === 0) {
                            // first class break
                            if (featureValue < _markerOptions.thematicRenderer[0].maxValue) {
                                fillColor = _markerOptions.thematicRenderer[0].color;
                                break;
                            }
                        } else if (i === _markerOptions.thematicRenderer.length) {
                            // last class break
                            if (featureValue >= _markerOptions.thematicRenderer[i].minValue) {
                                fillColor = _markerOptions.thematicRenderer[i].color;
                                break;
                            }
                        }
                        else {
                            // intermediate class break
                            if (featureValue >= _markerOptions.thematicRenderer[i].minValue && featureValue < _markerOptions.thematicRenderer[i].maxValue) {
                                fillColor = _markerOptions.thematicRenderer[i].color;
                                break;
                            }
                        }
                    }
                    break;

                default:
                    break;
            }
            Log.log('getMarkerFillColor-> value: ' + featureValue + ' color: ' + fillColor, 'debug');
            return fillColor;

        }

        function getMarkerRadius(feature, markerProperties) {
            var markerRadius,
                _markerOptions = markerProperties.getMarkerOptions(),
                radius,
                graduatedRenderer,
                graduatedField,
                featureValue,
                proportionalField,
                i;

            switch (_markerOptions.renderer) {

                case 'graduated-class-breaks':
                case 'thematic-graduated-unique-values':
                case 'thematic-graduated-class-breaks':
                    radius = _markerOptions.radius;
                    graduatedRenderer = _markerOptions.graduatedRenderer;
                    graduatedField = _markerOptions.graduatedField;
                    featureValue = feature.properties[graduatedField];

                    for (i = 0; i < graduatedRenderer.length; i++) {
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
                    proportionalField = _markerOptions.proportionalField;
                    featureValue = feature.properties[proportionalField];
                    markerRadius = parseFloat(featureValue);
                    break;

                default:
                    markerRadius = _markerOptions.radius;
                    break;
            }
            Log.log('getMarkerRadius -> value: ' + featureValue + ' radius: ' + markerRadius, 'debug');
            return markerRadius;
        }

        //TODO
        // update the legend
        //this._updateLegendContent(markerProperties);
    },

    /**
     *  Gets the field title from the dataSource
     *  @private
     *  @param {String} dataSource The data source name.
     *  @param {String} field The field name; e.g. 'bl.bl_id'
     */
    getFieldTitle: function (storeName, fieldName) {
        var fieldTitle = '',
            store = Ext.getStore(storeName),
            tableName = store.serverTableName,
            fieldCollection = TableDef.getTableDefFieldCollection(tableName),
            fieldTitles = fieldCollection.get(fieldName).multiLineHeadings,
            i;

        Log.log('Map -> Get Field Title...', 'debug');

        for (i = 0; i < fieldTitles.length; i++) {
            if (i === 0) {
                fieldTitle = fieldTitles[0];
            } else {
                fieldTitle += ' ' + fieldTitles[i];
            }
        }

        return fieldTitle;
    },

    /**
     * @private
     * @param layerGroup
     * @param storeId
     */
    removeLayerFromLayerGroup: function (layerGroup, storeId) {
        var layers,
            layerId,
            layer;

        if(layerGroup) {
            layers = layerGroup._layers;
            for (layerId in layers) {
                layer = layers[layerId];
                if (layer.hasOwnProperty('options')) {
                    if (layer.options.getStoreId() === storeId) {
                        layerGroup.removeLayer(layer._leaflet_id);
                    }
                }
            }
        }
    },

    /* 
     * Sample functions added by JM.
     */
    addMarker: function (lat, lon) {
        var me = this;

        if (me.map) {
            L.marker([lat, lon]).addTo(me.map);
        }
    },

    panToLocation: function (lat, lon) {
        var me = this;

        if (me.map) {
            me.map.panTo(new L.LatLng(lat, lon));
        }
    }

});

