/**
 * called by ab-ex-svg-dwg-markup-control.axvw
 */

var svgDwgFloorPlanController = View.createController('svgDwgFloorPlanController', {
	
	drawingControlEx: null,
	
	bl_id: null,
	
	fl_id: null,
	
	callBack:null,

	afterViewLoad: function(){
		
		if (valueExists(View.parameters)) {
			this.buildingId = View.parameters.buildingId;
			this.floorId = View.parameters.floorId;
		}
		
		var parameters = new Ab.view.ConfigObject();
    	parameters['planTypeGroup'] = 'Standard Space Highlights';
    	
    	parameters['svgActions'] = {uploadImage: 'uploadImageAction', 
    								 saveSvg: 'saveSvgAction'
    								};
    	parameters['redlineLegend'] = {panelId: 'redlineLegendPanel', divId: 'redlineLegendDiv', colorPickerId: 'redlineLegendPanel_head'};
    	
    	parameters['planTypeHighlight'] = {panelId: 'planTypeHighlightPanel', divId: 'planTypeHighlightDiv'};
    	
    	// load SVG from server and display in SVG panel's  <div id="drawingDiv">    	
    	this.drawingControlEx = new Ab.svg.MarkupDrawingControl("drawingDiv", "drawingPanel", parameters); 
	},

	afterInitialDataFetch:function(){
		if ( this.buildingId && this.floorId )	{
			this.loadSvg( this.buildingId, this.floorId);
		}
		this.redlineLegendPanel.show(false);
		//this.drawingPanel_upload.show(false);
	},
	
    loadSvg: function(bl_id, fl_id) {
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
    	parameters['activityLogId'] = -1;
    	
    	// load the floorplan
    	this.drawingControlEx.load("drawingDiv", parameters);   	
    },

	drawingPanel_onClose:function(){
		if (this.callBack)	{
			this.callBack();
		}
	}
});



