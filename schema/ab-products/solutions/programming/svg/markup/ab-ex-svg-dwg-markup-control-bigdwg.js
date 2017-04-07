/**
 * called by ab-ex-svg-dwg-markup-control.axvw
 */

var svgDwgMarkupController = View.createController('svgDwgMarkupControl', {
	
	drawingControlEx: null,
	
	afterViewLoad: function(){
		
		var parameters = new Ab.view.ConfigObject();
    	parameters['planTypeGroup'] = 'Standard Space Highlights';
    	
    	
    	parameters['svgActions'] = {uploadImage: 'uploadImageAction', 
    								 saveSvg: 'saveSvgAction'
    								};
    	parameters['redlineLegend'] = {panelId: 'redlineLegendPanel', divId: 'redlineLegendDiv', colorPickerId: 'redlineLegendPanel_head'};
    	
    	parameters['planTypeHighlight'] = {panelId: 'planTypeHighlightPanel', divId: 'planTypeHighlightDiv'};
    	
    	//parameters['redlineTypes'] = [ "cloud", "line", "textbox", "arrow" , "area", "swatch", "textOnly"];
    	
    	// load SVG from server and display in SVG panel's  <div id="drawingDiv">    	
    	var drawingControlEx = new Ab.svg.MarkupDrawingControl("drawingDiv", "drawingPanel", parameters); 
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':'BOSMED', 'fl_id':'01'};
    	
    	var records = View.dataSources.get('activityLogForDwgs').getRecords();
    	var activityLogId = null;
    	for(var i = 0; i < records.length; i++){
    		var record =  records[i];
    		if(record){
    			activityLogId = record.getValue("activity_log.activity_log_id");
    			if(activityLogId)
    				break;
    		}
        }

    	if(activityLogId){
    		parameters['activityLogId'] = activityLogId;
    	
	    	// load the floorplan
	    	drawingControlEx.load("drawingDiv", parameters);   	
    	} else {
    		alert("You do not have activity_log that linked with drawing HQ-17.")
    	}
    }
});







