/**
 * Based on d3 JS library to handle Ab.svg.PlacementControl.
 */
Ab.namespace('svg');

Ab.svg.PlacementControl = Ab.svg.DrawingControl.extend({
    legendId: '',
    assetGroupId: '',
    assetGroupClass: '',
    copiedAssets: [],
    
    // @begin_translatable
    // @end_translatable

    /**
     * Constructor.
     * @param drawingId         String. Id of <div/> that holds the svg
     * @param panelId       String. Id of the panel
     * @param legendId      String. Id of legend
     * @param assetGroupId  String. Id of layer to drop asset on (i.e. "eq-assets")
     * @param assetGroupClass   String. The class to assign the dropped asset to (i.e. "eq-asset")
     * @param config        configObject
     */
    constructor: function(drawingId, panelId, legendId, assetGroupId, assetGroupClass, config) {
        this.inherit(drawingId, panelId, config);
        this.legendId = legendId;
        this.assetGroupId = assetGroupId;
        this.assetGroupClass = assetGroupClass;
        this.control = new PlacementSvg(drawingId, config);
        this.control.legendId = legendId;
    },

    /**
     * Return PlacementSvg from ab-svg-placement-control.js.
     * @return this.control PlacementSvg
     */
    getControl: function() {
        return this.control;
    },

    /**
     * Loads the legend.
     * @param config Object. Object for additional options.
     *		Possible options are:
     *          file      (String)   The legend file. (i.e. legend.svg)
     *			afterLoad (function) Function to call after the legend loads.
     */
    loadLegend: function(config) {
        config.legend = d3.select("#" + this.legendId);
        this.getControl().loadLegend(config);
    },

    /**
     * This is a typical callback function for loadLegend. This method establishes the drag
     * and drop relationship between the placement legend and the drawing.
     */
    setup: function() {
        var controller = this;
        this.getControl().setup(controller, this.assetGroupId, this.assetGroupClass);
    },

    /**
     * Attach listener to group checkbox.  Name the group check as legendId + "_group"
     */
    attachGroupListener: function() {
        this.getControl().attachGroupListener();
    },

    /**
     * Each asset dropped onto the drawing will be tagged with a 'dropped' class.  This method
     * queries for all nodes under the specified layer with for this class.  Returns an array of nodes.
     * @returns Array of nodes dropped onto the drawing.  These nodes were tagged with 'dropped' class
     */
    copyAssets: function() {
        this.copiedAssets = this.getControl().copyAssets(this.divId, this.assetGroupId);
        return this.copiedAssets;
    },

    /**
     * Places an array of nodes/symbols onto the drawing.  Hide interactive grips.
     * @param assetsToPaste  Array. Array of SVGGElements to place onto the drawing
     */
    pasteAssets: function (assetsToPaste) {
        //this.getControl().placeSymbols(this.getDivId(), this.savedAssets, targetId, className, targetDivId, srcDivId);
        this.getControl().pasteAssets(this.getDivId(), assetsToPaste, this.assetGroupId, this.assetGroupClass, this.legendId);
    }
}, {});
