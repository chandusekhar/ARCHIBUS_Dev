/**
 * A view that displays a Redline legend and floor plan. This view should be used along with the
 * {@link Floorplan.controller.Redline} class.
 * @author Jeff Martin
 * @since 22.1
 */
Ext.define('Floorplan.view.Redline', {
    extend: 'Ext.Container',

    xtype: 'redline2panel',

    requires: [
        'Floorplan.component.Svg',
        'Floorplan.control.Legend',
        'Common.control.TitlePanel'
    ],

    config: {
        layout: 'hbox',

        items: [
            {
                xtype: 'titlepanel',
                title: LocaleManager.getLocalizedString('Redline', 'Floorplan.view.Redline'),
                docked: 'top'
            },
            {
                xtype: 'legend'
            },
            {
                xtype: 'svgcomponent',
                width: '95%',
                margin: '6px'
            }
        ],

        /**
         * @cfg {String} documentField The name of the document field used to store the redline image when it is saved.
         * This field should be set by the code that opens the Redline view.
         *
         */
        documentField: null
    },

    initialize: function() {
        var me = this;

        me.callParent(arguments);
        me.on('painted', me.onPainted, me, {delay: 150, single: true});
    },

    findAssets: function (roomCode) {
        var me = this,
            svgContainer = me.getSvgComponent();

        svgContainer.findAssets([roomCode], {});
    },

    getLegendComponent: function() {
        return this.down('legendcomponent');
    },

    getSvgComponent: function() {
        return this.down('svgcomponent');
    },

    onPainted: function() {
        var me = this,
            legendComponent = me.getLegendComponent(),
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

    /**
     * Applies the SVG data to the SVG component
     * @param svgData
     */
    setSvgData: function(svgData) {
        this.getSvgComponent().setSvgData(svgData);
    },

    setImageData: function(imageData) {
        this.getSvgComponent().setImageData(imageData);
    },

    copyAssets: function() {
        this.getLegendComponent().copyAssets();
    },

    pasteAssets: function() {
        this.getLegendComponent().pasteAssets();
    },

    /**
     * Returns the contentMode property of the SVG component.
     * @returns {String} The value of the SVG contentMode property. The values are svg or image
     */
    getContentMode: function() {
        return this.getSvgComponent().getContentMode();
    }

});
