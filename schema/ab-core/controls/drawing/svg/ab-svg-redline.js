/**
 * Ab.svg.RedlineControl inherits from Ab.svg.DrawingControl
 * 
 * Modified 5/2015 YQ - add red/black/custom color picker support for legend.
 * 					    add new API: retrieveRedmarks(), addRedmarks(), show()
 */
Ab.namespace('svg');

Ab.svg.RedlineControl = Ab.svg.DrawingControl.extend({
    legendId: '',
    copiedAssets: [],
    
    // panel holds redline control
    panel: null,
    
    // @begin_translatable
    z_MESSAGE_ENTER_TEXT: 'Please enter the text box content:',
    z_MESSAGE_DELETE: 'Are you sure you want to delete this object?',
    z_TITLE: 'Redline',
    // @end_translatable

    /**
     * Constructor.
     * @param divId String Id of <div/> that holds the svg drawing
     * @param panelId String Id of the panel
     * @param legendId String Id of legend
     * @param config configObject
     */
    constructor: function(divId, panelId, legendId, colorPickerId, config) {
        this.inherit(divId, panelId, config);
        this.legendId = legendId;
        this.panel = View.panels.get(panelId);
        this.drawingId = divId;
        this.assetGroupId = 'redline';
        this.assetGroupClass = 'redline';
        
        this.control = new RedlineSvg(divId, panelId, legendId, colorPickerId, config);
        this.control.legendId = legendId;
        
        this.control.z_MESSAGE_ENTER_TEXT = View.getLocalizedString(this.z_MESSAGE_ENTER_TEXT);
        this.control.z_MESSAGE_DELETE = View.getLocalizedString(this.z_MESSAGE_DELETE);
        this.control.z_TITLE = View.getLocalizedString(this.z_TITLE);
    },

    /**
     * Returns the redline control.
     * @returns RedlineSvg
     */
    getControl: function() {
        return this.control;
    },

    /**
     * Loads the legend.
     * @param config Object. Object for additional options.
     *		Possible options are:
     *			Currently serves as a placeholder.
     */
    loadLegend: function(config) {
        //config.legend = d3.select("#" + this.legendId);
        this.getControl().loadLegend(config);
        //this.getControl().loadLegend(legendId, url, callback);

        this.getControl().loadColorPicker(this.control);

    },

    /**
     * Establish the drag and drop relationship between the redline legend and the drawing.
     */
    setup: function() {
        this.getControl().setup();
    },

    /**
     * Each asset dropped onto the drawing will be tagged with a 'dropped' class.
     * This method queries for all nodes under the 'redlines' layer with for this class.
     * Returns an array of nodes.
     * @returns Array of nodes
     */
    copyAssets: function() {
        this.copiedAssets = this.getControl().copyAssets(this.drawingId);
        return this.copiedAssets;
    },

    /**
     * Places an array of nodes/symbols onto the drawing.  Hide interactive grips.
     * @param redlinesToPaste    Array. Array of SVGGElements to place onto the drawing
     */
    pasteAssets: function (redlinesToPaste) {
        this.getControl().pasteAssets(this.drawingId, redlinesToPaste, this.assetGroupId, this.assetGroupClass, this.legendId);
    },
    
    /**
     * retrieve redmarks in svg
     * @return a string contains redmarks SVG elements.
     */
    retrieveRedmarks: function(){
    	return this.getControl().retrieveRedmarks();
    },
    
    /**
     * show redlien legend panel
     */
    show: function(show){
    	if(this.panel){
    		this.panel.show(show);
    	}
    },
    
    /**
     * add redlines to the svg.
     * @param redmarks String. A string that contains all redlines nodes from svg drawing. 
     */
    addRedmarks: function(redmarks){
    	
		var redlineTarget = this.control.createGroupIfNotExists(this.getSvg().selectAll("#viewer"), "redlines", "redlines").node(); 
		
		// 3048470 - innerHTML does not work in IE for SVG element
		//redlineTarget.innerHTML = redmarks;
		var doc = new DOMParser().parseFromString(redmarks, 'application/xml');
		for (var i = 0; i < doc.documentElement.childNodes.length; i++) {
			var childNode = doc.documentElement.childNodes[i];
			redlineTarget.appendChild(redlineTarget.ownerDocument.importNode(childNode, true));
		}
				
		this.control.attachRedlineEvents();
    }
}, {});








