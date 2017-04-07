/**
 * called by ab-ex-svg-dwg-markup-control.axvw
 */

var svgDwgMarkupController = View.createController('svgDwgMarkupControl', {

	afterViewLoad: function(){
		
		var parameters = new Ab.view.ConfigObject();
    	parameters['planTypeGroup'] = 'Standard Space Highlights';

    	parameters['svgActions'] = {uploadImage: 'uploadImageAction', 
    								 saveSvg: 'saveSvgAction'
    								};
    	parameters['redlineLegend'] = {panelId: 'redlineLegendPanel', divId: 'redlineLegendDiv', colorPickerId: 'redlineLegendPanel_head'};
    	
    	parameters['planTypeHighlight'] = {panelId: 'planTypeHighlightPanel', divId: 'planTypeHighlightDiv'};
    	
    	parameters['filterHighlight'] = {panelId: 'filterHighlightPanel', divId: 'filterHighlightDiv'};
    	
    	// load SVG from server and display in SVG panel's  <div id="drawingDiv">    	
    	var drawingControlEx = new Ab.svg.MarkupDrawingControl("drawingDiv", "drawingPanel", parameters); 
	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':'', 'fl_id':''};
    	
    	var dsObj = View.dataSources.get('activityLogForDwgs');
   		var record = dsObj.getRecord();
   		if(record)
   			parameters['activityLogId'] = record.getValue("activity_log.activity_log_id");
    	
    	// load the floorplan
    	drawingControlEx.load("drawingDiv", parameters);   	
    	
    }
});

