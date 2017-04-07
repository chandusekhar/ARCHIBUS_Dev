/**
 * Component to display an SVG drawing.
 *
 * @since 21.3
 * @author Jeff Martin
 * @author Emily Li
 */
Ext.define('Floorplan.component.Svg', {
    extend: 'Ext.Component',
    mixins: ['Ext.mixin.Observable'],

    requires: [
        'Common.scripts.loader.Drawing',
        'Floorplan.controller.AddOns'
    ],

    xtype: 'svgcomponent',

    isPainted: false,

    locator: {
        lastFoundElements: [],
        lastFoundClasses: [],
        lastFoundStyles: []
    },

    config: {
        baseCls: 'ab-svgcontainer',

        headerText: '',

        control: null,

        svgData: null,

        eventHandlers: null,

        imageData: null,

        contentMode: 'svg',

        enableFindAssets: false,

        layersPopup: null,

        emptyDrawingText: LocaleManager.getLocalizedString('Floor Plan is not available', 'Floorplan.component.Svg')
    },

    template: [
        {
            tag: 'div',
            reference: 'emptysvgtext',
            cls: 'empty-svg-txt'
        },
        {
            tag: 'div',
            reference: 'headertext',
            cls: 'svg-header-txt'
        },
        {
            tag: 'div',
            reference: 'svgdiv',
            cls: 'svg',
            style: 'height:100%; width:100%'
        },
        {
            tab: 'div',
            reference: 'home',
            cls: 'home-button',
            children: [
                {
                    tag: 'span',
                    reference: 'iconElement',
                    cls: 'ab-button-icon'
                }
            ]
        }
    ],

    initialize: function () {
        var me = this,
            drawingControl;

        me.callParent(arguments);


        drawingControl = new DrawingSvg(me.getId(), me.config);
        me.setControl(drawingControl);

        me.on('painted', me.onPainted, me, {single: true});

        me.iconElement.on({
            scope: me,
            tap: 'zoomExtents'
        });

        me.emptysvgtext.dom.innerText = me.getEmptyDrawingText();
        me.headertext.dom.innerText = me.getHeaderText();
    },

    applyEmptyDrawingText: function(text) {
        var me = this;
        if(text) {
            me.emptysvgtext.dom.innerText = text;
        }
        return text;
    },

    /**
     * retrieve the add-on by id
     */
    getAddOn: function (addOnId) {
        return this.getControl().getAddOn(addOnId);
    },

    applyHeaderText: function (config) {
        if (Ext.isEmpty(config)) {
            this.headertext.addCls('svg-header-txt-hide');
        } else {
            this.headertext.removeCls('svg-header-txt-hide');
        }
        return config;
    },

    updateHeaderText: function (newHeaderText) {
        if (newHeaderText) {
            this.headertext.dom.innerText = newHeaderText;
        }
    },

    getSvgContainerDivId: function () {
        return this.svgdiv.getId();
    },

    applySvgData: function (svgData) {
        var me = this;
        // If the view is painted then process the SVG data
        if (me.isPainted) {
            me.processSvg(svgData);
        }

        return svgData;
    },

    applyImageData: function (imageData) {
        var me = this;

        if (imageData && imageData.length > 0) {
            me.setContentMode('image');
            if (me.isPainted) {
                me.processImage(imageData);
            }
        }
        return imageData;
    },

    onPainted: function () {
        var me = this,
            svgData = me.getSvgData(),
            imageData = me.getImageData(),
            contentMode = me.getContentMode();

        me.isPainted = true;

        me.fireEvent('svgpainted', me);

        if (contentMode === 'image') {
            me.processImage(imageData);
        } else {
            me.processSvg(svgData);
        }

    },

    processSvg: function (svgData) {
        var me = this,
            eventHandlers = me.getEventHandlers();

        if (Ext.isEmpty(svgData)) {
            me.emptysvgtext.removeCls('empty-svg-text-hide');
            me.headertext.addCls('svg-header-txt-hide');
            return;
        }

        me.emptysvgtext.addCls('empty-svg-text-hide');
        me.headertext.removeCls('svg-header-txt-hide');

        me.fireEvent('beforesvgload', me);

        // Create the Layers Popup
        me.setLayersPopup(new LayersPopup());

        // Setting the height here is required to size the drawing properly
        me.getDiv().style("height", "100%");
        me.getDiv().style('width', '100%');

        me.svgdiv.dom.innerHTML = svgData;
        me.getDiv().select("svg").attr("id", this.getId() + "-svg");
        me.getControl().setDefaultViewIfNotExists(me);

        me.getSvg()
            .attr("height", "100%")
            .attr("width", "100%")
            .attr("focusable", "false");

        me.getSvg().call(viewBoxZoom());

        me.initAddOn();

        me.fireEvent('aftersvgload', me);

        if (eventHandlers) {
            me.addEventHandlers(eventHandlers);
        }
    },

    initAddOn: function () {
        var me = this;

        // framework-specific
        me.getControl().addOnsController = new Floorplan.controller.AddOns(this.getControl().config, this.getControl());

        me.getControl().initAddOn();
    },

    processImage: function (imageData) {
        var me = this,
            divElement = me.getDiv().select(".svg");

        me.emptysvgtext.addCls('empty-svg-text-hide');
        me.headertext.removeCls('svg-header-txt-hide');

        // Setting the height here is required to size the drawing properly
        me.getDiv().style("height", "100%");
        me.getDiv().style('width', '100%');
        me.getControl().loadImage(divElement, imageData);
    },


    /**
     * Return svg tag selection
     * @return object SVGSVGElement
     */
    getSvg: function () {
        return this.getControl().getSvg(this.getId());
    },

    getDiv: function () {
        return this.getControl().getDiv(this.getId());
    },

    addEventHandlers: function (eventHandlers) {
        var me = this,
            control = me.getControl();

        control.addEventHandlers(control, eventHandlers);
    },

    applyEventHandlers: function (eventHandlers) {
        var me = this,
            control = me.getControl();

        if (eventHandlers) {
            control.addEventHandlers(control, eventHandlers);
        }
        return eventHandlers;
    },

    zoomExtents: function () {
        this.getControl().zoomExtents(this.getId());
    },

    /**
     * "Clear" highlights for previously found assets
     */
    clearFoundAssets: function () {
        //this.showInfoBar(false);
        this.getControl().clearFoundAssets(this.locator);
    },

    /**
     * Locate one or more assets
     * @param ids  Array of ids to search in svg (ie. ['0001', '0018', '0109', '0056', '0007', '0066'])
     * @param opts Object of additional properties.  Available properties are:
     *          - cssClass - allows you to specify a custom css class to control how assets are highlighted.
     *                      The default value is ‘zoomed-asset-default’.  However, you can choose to specify only a
     *                      border (and allow highlights to show through), a custom color, or both a border and custom
     *                      color, control transitions, add animations, etc.  Any valid css style should work.
     *          - removeStyle - often used in conjunction with the cssClass property to temporarily remove the
     *                      original highlight color/fill.  This allows you to specify a custom color for the located
     *                      asset.  The original highlight will reappear if you locate a different asset, preserving
     *                      the highlighted information.
     *          - zoomFactorForLocate  - allows you to control the depth in which to zoom in to a found asset
     */
    findAssets: function (ids, opts) {
        var me = this,
            results;

        me.clearFoundAssets();
        me.locator.divId = me.getId();

        results = me.getControl().findAssets(ids, opts, me.locator);

        return results;
    },

    /**
     * Add eventHandlers to only highlighted assets
     * @param self    Control
     * @param eventHandlers Array
     */
    addEventToHighlightedAssets: function (eventHandlers) {
        var me = this;
        me.getControl().addEvent2HighlightedAssets(me.getControl(), eventHandlers);
    },

    /**
     * Add eventHandlers to only labels
     * @param self    Control
     * @param eventHandlers Array
     */
    addEventToHighlightedLabels: function (eventHandlers) {
        var me = this;
        me.getControl().addEvent2HighlightedLabels(me.getControl(), eventHandlers);
    },

    disableLabelSelection: function () {
        this.getControl().disableLabelSelection(this.getSvg());
    },

    /**
     * Displays the Layer Popup on the drawing. Allows layers to be turned on or off.
     */
    showLayers: function () {
        var me = this,
            layersPopup = me.getLayersPopup(),
            svgContainer = d3.select('#' + me.svgdiv.getId());

        if (layersPopup) {
            layersPopup.createLayerPopup(svgContainer, me.getDiv(), me.getId() + '_layerList', {});
        }
    }

});