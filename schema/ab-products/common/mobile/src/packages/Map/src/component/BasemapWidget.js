/**
 * A component that switches the basemap layer
 * @since 23.1
 * @author Greg Knight
 */
Ext.define('Map.component.BasemapWidget', {
    extend: 'Ext.Component',
    requires: [],

    xtype: 'basemapcomponent',

    config: {
        /**
         * @cfg {abMap} abMap A reference to the associated mobile map component.
         */
        abMap: null
    },

    template: [
        {
            tag: 'div',
            reference: 'basemapWidgetContainer',
            cls: 'ab-map-basemapwidget-container',
            children: [
                {
                    tag: 'div',
                    reference: 'basemapWidgetButton',
                    cls: 'ab-map-basemapwidget-button'
                }
            ]
        }
    ],

    initialize: function () {
        var me = this;

        me.basemapWidgetContainer.on({
            scope: this,
            tap: 'onSwitchBasemap'
        });

    },

    onSwitchBasemap: function () {
        var me = this,
            abMap = me.getAbMap(),
            basemapLayerList = abMap.basemapLayerList,
            basemapData = [],
            basemapPicker,
            i;

        // prepare basemap data for picker
        for (i = 0; i < basemapLayerList.length; i++) {
            basemapData.push({
                text: basemapLayerList.keys[i],
                value: basemapLayerList.keys[i]

            });
        }

        // show the basemap values in a picker
        basemapPicker = new Ext.Picker({
            //cancelButton: false, //TODO
            slots: [
                {
                    name: 'basemap',
                    title: 'Select Basemap',
                    data: basemapData
                }
            ],
            listeners: {
                //TODO  this fires when 'cancel' is selected as well as 'done'
                cancel: function () {
                    //do nothing
                },
                change: function (picker) {
                    var layerName = picker.getValue().basemap;
                    abMap.switchBasemapLayer(layerName);
                }
            }
        });
        basemapPicker.show();
    }
});