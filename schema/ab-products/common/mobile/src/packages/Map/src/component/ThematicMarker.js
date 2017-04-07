/**
 * Marker implementation.
 *
 * Defines the properties for a set of markers which will be used to display locations of assets on a map.
 *
 *
 */
Ext.define('Map.component.ThematicMarker', {
    requires: [
        'Map.util.Map'
    ],
    xtype: 'abthematicmarker',

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
        me.parseMarkerOptions(me.getMarkerOptions());

    },

    /**
     * @private
     * @param markerOptions
     */
    parseMarkerOptions: function (markerOptions) {
        var me = this,
            options = {},
            thematicRenderer = [],
            rendererColors,
            graduatedRenderer = [],
            i;

        Log.log('Marker -> Parse marker options...','debug');

        options.renderer = markerOptions.renderer;
        options.radius = markerOptions.radius || 7;
        options.fillColor = markerOptions.fillColor || '#e41a1c';
        options.fillOpacity = markerOptions.fillOpacity || 0.9;
        options.stroke = markerOptions.stroke || true; //TODO
        options.color = markerOptions.strokeColor || '#fff';
        options.weight = markerOptions.strokeWeight || 1.0;
        options.riseOnHover = markerOptions.riseOnHover || true; //TODO
        options.useClusters = markerOptions.useClusters || false;
        options.markerActionTitle = markerOptions.markerActionTitle || null;
        options.markerActionCallback = markerOptions.markerActionCallback || null;
        options.usePopup = true;
        if (Ext.isDefined(markerOptions.usePopup)) {
            if (markerOptions.usePopup === false || markerOptions.usePopup === 'false') {
                options.usePopup = false;
            }
        }

        //thematic marker options
        options.thematicField = markerOptions.thematicField || null;
        options.uniqueValues = markerOptions.uniqueValues || [];
        options.thematicClassBreaks = markerOptions.thematicClassBreaks || [];
        options.colorBrewerClass = markerOptions.colorBrewerClass || '';

        // graduated marker options
        options.graduatedField = markerOptions.graduatedField || null;
        options.graduatedClassBreaks = markerOptions.graduatedClassBreaks || [];
        options.radiusIncrement = markerOptions.radiusIncrement || 5;

        // proportional marker options
        options.proportionalField = markerOptions.proportionalField || null;

        me.setMarkerOptions(options);

        switch (options.renderer) {

        case 'thematic-unique-values':
        case 'thematic-proportional-unique-values':
            // get distinct fields
            if (options.uniqueValues.length === 0) {
                options.uniqueValues = MapUtil.getUniqueFieldValues(me.getStoreId(), options.thematicField, null);
            }
            // get colorBrewer colors
            if (options.colorBrewerClass === '') {
                options.colorBrewerClass = 'Paired2';
            }
            rendererColors = Map.util.Map.getColorbrewerColors(options.colorBrewerClass, options.uniqueValues.length);
            // create renderer
            for (i = 0; i < options.uniqueValues.length; i++) {
                thematicRenderer.push({
                    uniqueValue: options.uniqueValues[i],
                    color: rendererColors[i]
                });

            }

            options = me.getMarkerOptions();
            options.thematicRenderer = thematicRenderer;
            me.setMarkerOptions(options);

            break;

        case 'thematic-class-breaks':
        case 'thematic-proportional-class-breaks':
            // get colorBrewer colors
            if (options.colorBrewerClass === '') {
                options.colorBrewerClass = 'Reds';
            }
            rendererColors = Map.util.Map.getColorbrewerColors(options.colorBrewerClass, options.thematicClassBreaks.length + 1);

            // create renderer
            for (i = 0; i < options.thematicClassBreaks.length + 1; i++) {
                if (i === 0) {
                    // first class break
                    thematicRenderer.push({
                        minValue: -Infinity,
                        maxValue: options.thematicClassBreaks[0],
                        color: rendererColors[0]
                    });
                } else if (i === options.thematicClassBreaks.length) {
                    // last class break
                    thematicRenderer.push({
                        minValue: options.thematicClassBreaks[i - 1],
                        maxValue: +Infinity,
                        color: rendererColors[i]
                    });
                }
                else {
                    // intermediate class break
                    thematicRenderer.push({
                        minValue: options.thematicClassBreaks[i - 1],
                        maxValue: options.thematicClassBreaks[i],
                        color: rendererColors[i]
                    });
                }
            }

            options.thematicRenderer = thematicRenderer;
            me.setMarkerOptions(options);

            break;

        case 'graduated-class-breaks':
            // create renderer
            for (i = 0; i < options.graduatedClassBreaks.length + 1; i++) {
                if (i === 0) {
                    // first class break
                    graduatedRenderer.push({
                        minValue: -Infinity,
                        maxValue: options.graduatedClassBreaks[0],
                        radius: options.radius
                    });
                } else if (i === options.graduatedClassBreaks.length) {
                    // last class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: +Infinity,
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
                else {
                    // intermediate class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: options.graduatedClassBreaks[i],
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
            }

            options.graduatedRenderer = graduatedRenderer;
            me.setMarkerOptions(options);

            break;

        case 'thematic-graduated-unique-values':

            // get distinct fields
            if (options.uniqueValues.length === 0) {
                options.uniqueValues = MapUtil.getUniqueFieldValues(me.getStoreId(), options.thematicField, []);
            }
            // get colorBrewer colors
            if (options.colorBrewerClass === '') {
                options.colorBrewerClass = 'Paired2';
            }
            rendererColors = MapUtil.getColorbrewerColors(options.colorBrewerClass, options.uniqueValues.length);
            // create thematic renderer
            thematicRenderer = []; //new Ext.util.MixedCollection();
            for (i = 0; i < options.uniqueValues.length; i++) {

                thematicRenderer.push({
                    uniqueValue: options.uniqueValues[i],
                    color: rendererColors[i]
                });
            }

            // create graduated renderer
            for (i = 0; i < options.graduatedClassBreaks.length + 1; i++) {
                if (i === 0) {
                    // first class break
                    graduatedRenderer.push({
                        minValue: -Infinity,
                        maxValue: options.graduatedClassBreaks[0],
                        radius: options.radius
                    });
                } else if (i === options.graduatedClassBreaks.length) {
                    // last class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: +Infinity,
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
                else {
                    // intermediate class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: options.graduatedClassBreaks[i],
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
            }

            options.thematicRenderer = thematicRenderer;
            options.graduatedRenderer = graduatedRenderer;
            me.setMarkerOptions(options);

            break;

        case 'thematic-graduated-class-breaks':
            // create thematic renderer
            // get colorBrewer colors
            if (options.colorBrewerClass === '') {
                options.colorBrewerClass = 'Reds';
            }
            rendererColors = MapUtil.getColorbrewerColors(options.colorBrewerClass, options.thematicClassBreaks.length + 1);
            for (i = 0; i < options.thematicClassBreaks.length + 1; i++) {
                if (i === 0) {
                    // first class break
                    thematicRenderer.push({
                        minValue: -Infinity,
                        maxValue: options.thematicClassBreaks[0],
                        color: rendererColors[0]
                    });
                } else if (i === options.thematicClassBreaks.length) {
                    // last class break
                    thematicRenderer.push({
                        minValue: options.thematicClassBreaks[i - 1],
                        maxValue: +Infinity,
                        color: rendererColors[i]
                    });
                }
                else {
                    // intermediate class break
                    thematicRenderer.push({
                        minValue: options.thematicClassBreaks[i - 1],
                        maxValue: options.thematicClassBreaks[i],
                        color: rendererColors[i]
                    });
                }
            }

            options.thematicRenderer = thematicRenderer;

            // create graduated renderer
            for (i = 0; i < options.graduatedClassBreaks.length + 1; i++) {
                if (i === 0) {
                    // first class break
                    graduatedRenderer.push({
                        minValue: -Infinity,
                        maxValue: options.graduatedClassBreaks[0],
                        radius: options.radius
                    });
                } else if (i === options.graduatedClassBreaks.length) {
                    // last class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: +Infinity,
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
                else {
                    // intermediate class break
                    graduatedRenderer.push({
                        minValue: options.graduatedClassBreaks[i - 1],
                        maxValue: options.graduatedClassBreaks[i],
                        radius: options.radius + (i * options.radiusIncrement)
                    });
                }
            }

            options.graduatedRenderer = graduatedRenderer;
            me.setMarkerOptions(options);

            break;

        default:
            Log.log('Marker renderer not found: ' + me.markerOptions.renderer, 'info');
            break;
        }

    }

});
