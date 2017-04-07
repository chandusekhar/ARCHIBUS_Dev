/**
 * Marker implementation.
 *
 * Defines the properties for a set of markers which will be used to display locations of assets on a map.
 *
 *
 */
Ext.define('Map.component.SimpleMarker', {

    xtype: 'absimplemarker',

    /**
     *
     * @property some property here
     *
     */


    config: {

        storeId: null,

        keyFields: null,

        geometryFields: null,

        titleField: null,

        contentFields: null,

        markerOptions: null
    },

    constructor: function (config) {
        var me = this;

        me.initConfig(config);
        // TODO: MarkerOptions should be passed in the config object?
        me.parseMarkerOptions(me.getMarkerOptions());

    },

    /**
     * @private
     * @param markerOptions
     */
    parseMarkerOptions: function (markerOptions) {
        var me = this,
            options = {};

        Log.log('Marker -> Parse marker options...', 'debug');

        options.renderer = 'simple';
        options.radius = markerOptions.radius || 7;
        options.fillColor = markerOptions.fillColor || '#e41a1c';
        options.fillOpacity = markerOptions.fillOpacity || 0.9;
        options.stroke = markerOptions.stroke || true; //TODO
        options.color = markerOptions.strokeColor || '#fff';
        options.weight = markerOptions.strokeWeight || 1.0;
        options.useClusters = markerOptions.useClusters || false;
        options.markerActionTitle = markerOptions.markerActionTitle || null;
        options.markerActionCallback = markerOptions.markerActionCallback || null;
        options.usePopup = true;
        if (Ext.isDefined(markerOptions.usePopup)) {
            if (markerOptions.usePopup === false || markerOptions.usePopup === 'false') {
                options.usePopup = false;
            }
        }

        me.setMarkerOptions(options);

    }

});
