Ext.define('Map.component.GoogleMap', {
    extend: 'Map.component.Map',
    requires: [
        'Map.script.loader.Google'
    ],

    xtype: 'googlemap',

    /**
     * @property {String} string The default Google basemap string values.
     */
    z_MESSAGE_ROADMAP: 'Road Map',
    z_MESSAGE_SATELLITE: 'Satellite',
    z_MESSAGE_HYBRID: 'Satellite with Labels',
    z_MESSAGE_TERRAIN: 'Terrain',

    config: {
        /**
         * @cfg {String} basemapLayer The basemap layer. Valid values are SATELLITE, ROADMAP, HYBRID, and TERRAIN.
         */
        basemapLayer: 'Satellite with Labels'
    },

    onPainted: function () {
        var me = this,
            mapCenter = me.getMapCenter(),
            mapZoom = me.getMapZoom(),
            basemapLayer = me.getBasemapLayer(),
            marker,
            popupAction,
            keyValues;

        // build the basemap layer list
        me._buildBasemapLayerList();

        // create the leaflet map
        me.map = L.map(me.mapEl.getId());
        me.map.setView(mapCenter, mapZoom);

        // wire up map loaded event
        me.map.on('load', me.onMapLoaded, me);

        // add the basemap layer group        
        me.basemapLayerGroup = L.layerGroup();
        me.basemapLayerGroup.addTo(me.map);

        // load the default basemap layer
        me.switchBasemapLayer(basemapLayer);
        
        //add popup listeners 
        me.map.on('popupopen', function(e) {
          marker = e.popup._source;
          popupAction = document.getElementById('abMapPopupAction');
          if (popupAction) {
            popupAction.addEventListener('click', function() {
              keyValues = marker.feature.properties.keyValues;
              me.markerActionCallback(keyValues);
            });
          }
        });
    },

    onMapLoaded: function () {
        var me = this;

        me.fireEvent('mapready');
    },

    // build the layerName-layerKey pairs for google basemap layers
    _buildBasemapLayerList: function () {

        var me = this,
            basemapLayerList = new Ext.util.MixedCollection();

        var msg = me.z_MESSAGE_ROADMAP;
        basemapLayerList.add(msg, {layerKey: "ROADMAP"});
        msg = me.z_MESSAGE_SATELLITE;
        basemapLayerList.add(msg, {layerKey: "SATELLITE"});
        msg = me.z_MESSAGE_HYBRID;
        basemapLayerList.add(msg, {layerKey: "HYBRID"});
        msg = me.z_MESSAGE_TERRAIN;
        basemapLayerList.add(msg, {layerKey: "TERRAIN"});

        me.basemapLayerList = basemapLayerList;
    },

    /**
     * switch the basemap layer
     * @param layerName The google basemap layer name.
     */
    switchBasemapLayer: function (layerName) {
        var me = this,
            google,
            basemap;

        // clear basemap layers
        me.basemapLayerGroup.clearLayers();

        // get the layer key
        basemap = me.basemapLayerList.get(layerName).layerKey;

        // handle bad layerName
        if (!basemap) {
            Log.log('Invalid basemap layer name: ' + layerName, 'verbose');
            basemap = 'HYBRID';
        }

        google = new L.Google(basemap);
        me.basemapLayerGroup.addLayer(google);

    }


});