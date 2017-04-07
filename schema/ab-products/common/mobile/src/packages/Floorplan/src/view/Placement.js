/**
 * Placement View
 * @since 22.1
 * @author Jeff Martin
 */
Ext.define('Floorplan.view.Placement', {
    extend: 'Ext.Container',

    xtype: 'placementpanel',

    requires: [
        'Floorplan.component.Placement',
        'Floorplan.control.Placement'
    ],

    config: {
        layout: 'hbox',

        items: [
            {
                xtype: 'placement'
            },
            {
                xtype: 'svgcomponent',
                width: '95%',
                margin: '6px'
            }
        ],

        assetGroupId: null,

        assetGroupClass: null,

        legendSvg: null,


        /**
         * @cfg {String} documentField The name of the document field when the view is populated with an image
         *
         */
        documentField: null
    },

    initialize: function() {
        var me = this;

        me.callParent(arguments);
        me.on('painted', me.onPainted, me, {delay: 150, single: true});
    },

    applyAssetGroupId: function(config) {
        var me = this,
            placementComponent = me.getPlacementComponent();

        placementComponent.setAssetGroupId(config);
        return config;
    },

    applyAssetGroupClass: function(config) {
        var me = this,
            placementComponent = me.getPlacementComponent();

        placementComponent.setAssetGroupClass(config);
        return config;
    },

    applyLegendSvg: function(config) {
        var me = this,
            placementComponent = me.getPlacementComponent();

        placementComponent.setLegendSvg(config);
        return config;
    },

    findAssets: function (roomCode) {
        var me = this,
            svgContainer = me.getSvgComponent();

        svgContainer.findAssets([roomCode], {});
    },

    getPlacementComponent: function() {
        return this.down('placementcomponent');
    },

    getSvgComponent: function() {
        return this.down('svgcomponent');
    },

    onPainted: function() {
        var me = this,
            legendComponent = me.getPlacementComponent(),
            svgContainer = me.getSvgComponent(),
            svgDivId = svgContainer.getId();

        legendComponent.setDrawingDivId(svgDivId);
        legendComponent.loadLegend(svgDivId);
    },

    loadImage: function(imageData) {
        var me = this,
            svgContainer = me.getSvgComponent(),
            dataUri = 'data:image/png;base64,' + imageData;

        svgContainer.setImageData(dataUri);
    },

    setSvgData: function(svgData) {
        var me = this,
            svgContainer = me.getSvgComponent();

        svgContainer.setSvgData(svgData);
    },

    copyAssets: function() {
        this.getPlacementComponent().copyAssets();
    },

    pasteAssets: function() {
        this.getPlacementComponent().pasteAssets();
    }

});

