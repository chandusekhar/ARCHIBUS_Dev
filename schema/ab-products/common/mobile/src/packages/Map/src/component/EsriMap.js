Ext.define('Map.component.EsriMap', {
    extend: 'Map.component.Map',

    requires: [
        'Map.script.loader.Esri'
    ],

    xtype: 'esrimap',

    /**
     * @property {String} string The default Esri basemap string values.
     */
    z_MESSAGE_WORLD_IMAGERY_WITH_LABELS: 'World Imagery with Labels',
    //  z_MESSAGE_WORLD_GRAY_CANVAS_WITH_LABELS: 'World Gray Canvas with Labels',
    z_MESSAGE_NATGEO_WORLD_MAP: 'National Geographic World Map',
    z_MESSAGE_OCEAN_BASEMAP: 'Oceans Basemap',
    z_MESSAGE_WORLD_IMAGERY: 'World Imagery',
    z_MESSAGE_WORLD_STREET_MAP: 'World Street Map',
    z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY: 'World Shaded Relief Imagery',
    z_MESSAGE_WORLD_TOPOGRAPHIC_MAP: 'World Topographic Map',
    z_MESSAGE_WORLD_LIGHT_GRAY_BASE: 'World Light Gray Canvas',
    z_MESSAGE_WORLD_DARK_GRAY_BASE: 'World Dark Gray Canvas',

    config: {
        /**
         * @cfg {String} basemapLayer The basemap layer. Valid values are: 'World Imagery with Labels', ...
         */
        basemapLayer: 'World Imagery with Labels'
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

        // wire up map loaded event
        me.map.on('load', me.onMapLoaded, me);

        // set the initial map view
        me.setView(mapCenter, mapZoom);

        // add the basemap layer group
        me.basemapLayerGroup = L.layerGroup();
        me.basemapLayerGroup.addTo(me.map);

        // add marker layer group
        me.markerLayerGroup = L.layerGroup();
        me.markerLayerGroup.addTo(me.map);

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

        me.fireEvent('mapLoaded', me, {singleton: true});
    },

    // build the layerName-layerKey pairs for esri basemap layers
    _buildBasemapLayerList: function () {

        var me = this,
            basemapLayerList = new Ext.util.MixedCollection();

        var msg = me.z_MESSAGE_WORLD_IMAGERY_WITH_LABELS;
        basemapLayerList.add(msg, {layerKey: "ImageryLabels"});
        //msg = View.getLocalizedString(this.z_MESSAGE_WORLD_LIGHT_GRAY_CANVAS_WITH_LABELS);
        //this.basemapLayerList.add((msg, {layerKey: "GrayLabels"}); );
        msg = me.z_MESSAGE_WORLD_IMAGERY;
        basemapLayerList.add(msg, {layerKey: "Imagery"});
        msg = me.z_MESSAGE_WORLD_STREET_MAP;
        basemapLayerList.add(msg, {layerKey: "Streets"});
        msg = me.z_MESSAGE_WORLD_SHADED_RELIEF_IMAGERY;
        basemapLayerList.add(msg, {layerKey: "ShadedRelief"});
        msg = me.z_MESSAGE_WORLD_TOPOGRAPHIC_MAP;
        basemapLayerList.add(msg, {layerKey: "Topographic"});
        msg = me.z_MESSAGE_WORLD_LIGHT_GRAY_BASE;
        basemapLayerList.add(msg, {layerKey: "Gray"});
        msg = me.z_MESSAGE_WORLD_DARK_GRAY_BASE;
        basemapLayerList.add(msg, {layerKey: "DarkGray"});
        msg = me.z_MESSAGE_NATGEO_WORLD_MAP;
        basemapLayerList.add(msg, {layerKey: "NationalGeographic"});
        msg = me.z_MESSAGE_OCEAN_BASEMAP;
        basemapLayerList.add(msg, {layerKey: "Oceans"});

        me.basemapLayerList = basemapLayerList;
    },

    /**
     * switch the basemap layer
     * @param layerName The esri basemap layer name.
     */
    switchBasemapLayer: function (layerName) {
        var me = this,
            basemap,
            layer,
            labelsLayer;

        // clear basemap layers
        me.basemapLayerGroup.clearLayers();

        // get the layer key
        basemap = me.basemapLayerList.get(layerName).layerKey;

        // handle bad layerName
        if (!basemap) {
            Log.log('Invalid basemap layer name: ' + layerName, 'verbose');
            basemap = 'ImageryLabels';
        }

        if (basemap === 'ImageryLabels') {
            layer = L.esri.basemapLayer('Imagery', {
                id: 'basemap',
                attribution: ''
            });
            me.basemapLayerGroup.addLayer(layer);
            labelsLayer = L.esri.basemapLayer('ImageryLabels', {
                id: 'basemapLabels',
                attribution: ''
            });
            me.basemapLayerGroup.addLayer(labelsLayer);
        } else if (basemap === 'Oceans' || basemap === 'ShadedRelief') {
            layer = L.esri.basemapLayer(basemap, {
                id: 'basemap',
                attribution: ''
            });
            me.basemapLayerGroup.addLayer(layer, {
                id: 'basemapLabels',
                attribution: ''
            });
            labelsLayer = L.esri.basemapLayer(basemap + 'Labels');
            me.basemapLayerGroup.addLayer(labelsLayer);
        } else {
            layer = L.esri.basemapLayer(basemap, {
                id: 'basemap',
                attribution: ''
            });
            me.basemapLayerGroup.addLayer(layer);
        }
    }
});