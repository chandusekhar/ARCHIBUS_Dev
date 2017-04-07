/**
 * Floorplan View
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Floorplan.view.FloorPlan', {
    extend: 'Ext.Container',

    requires: [
        'Floorplan.component.Svg',
        'Floorplan.component.button.Redline'
    ],

    xtype: 'floorplanpanel',

    isFloorPlanPanel: true,

    config: {

        title: LocaleManager.getLocalizedString('Floor Plan', 'Floorplan.view.FloorPlan'),

        toolBarButtons: [
            {
                xtype: 'toolbarbutton',
                iconCls: 'redline',
                align: 'right',
                action: 'openRedline',
                displayOn: 'all'
            }
        ],

        /**
         * @cfg {Boolean} disableZoomOnKeyboardHide Prevent Android devices from zooming the the floor plan when the
         * keyboard is hidden
         */
        disableZoomOnKeyboardHide: false,  // TODO: Implement this?

        /**
         * @cfg {Boolean} hideRedlineButton
         */
        hideRedlineButton: false
    },

    initialize: function () {
        var me = this,
            toolBarButtons = me.getToolBarButtons();

        me.callParent(arguments);

        Ext.each(toolBarButtons, function (button) {
            if(button.action === 'openRedline') {
                button.hidden = me.getHideRedlineButton();
            }
        }, me);
    },

    getSvgContainer: function () {
        return this.down('svgcomponent');
    },

    setSvgData: function (svgData) {
        this.getSvgContainer().setSvgData(svgData);
    },

    setEventHandlers: function (eventHandlers) {
        this.getSvgContainer().setEventHandlers(eventHandlers);
    },

    findAssets: function (ids, opts) {
        return this.getSvgContainer().findAssets(ids, opts);
    },

    zoomExtents: function () {
        this.getSvgContainer().zoomExtents();
    },

    clearFoundAssets: function() {
        this.getSvgContainer().clearFoundAssets();
    },

    /**
     * Add eventHandlers to only highlighted assets
     * @param eventHandlers Array
     */
    addEventToHighlightedAssets: function (eventHandlers) {
        var me = this,
            svgComponent = me.getSvgContainer();

        svgComponent.addEventToHighlightedAssets(eventHandlers);
    },

    /**
     * Add eventHandlers to only labels
     * @param eventHandlers Array
     */
    addEventToHighlightedLabels: function (eventHandlers) {
        var me = this,
            svgComponent = me.getSvgContainer();

        svgComponent.addEventToHighlightedLabels(eventHandlers);
    },

    isPainted: function() {
        return this.getSvgContainer().isPainted;
    }

});