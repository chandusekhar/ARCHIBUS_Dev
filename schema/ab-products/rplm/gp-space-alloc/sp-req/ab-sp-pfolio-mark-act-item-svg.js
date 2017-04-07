/**
 * called by ab-ex-svg-dwg-markup-control.axvw
 */

var svgDwgMarkupController = View.createController('svgDwgMarkupControl', {
	
	drawingControlEx: null,
	
	bl_id: null,
	
	fl_id: null,
	
	callBack:null,

	afterViewLoad: function(){
		
		if (valueExists(View.parameters) && valueExists(View.parameters.callback)) {
			this.callBack = View.parameters.callback;
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
		var openerCtrl = View.getOpenerView().controllers.get('abSpPfolioMarkItemCtrl');
		if ( openerCtrl && openerCtrl.actionId )	{
			this.loadSvg( openerCtrl.blId, openerCtrl.flId, openerCtrl.actionId);
			this.abSpPfolioActionItem.refresh("activity_log_id="+openerCtrl.actionId);
		}

	},
	
    loadSvg: function(bl_id, fl_id, activity_log_id) {
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
    	parameters['activityLogId'] = activity_log_id;
    	
    	// load the floorplan
    	this.drawingControlEx.load("drawingDiv", parameters);   	
    	this.bl_id = bl_id;
    	this.fl_id = fl_id;
    },

	drawingPanel_onClose:function(){
		if (this.callBack)	{
			this.callBack();
		}
	}
});



