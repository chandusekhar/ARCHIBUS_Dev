/**
 * called by ab-ex-svg-example.axvw
 */

var bl_id='';
var fl_id='';
var dwgname = '';
var plan_type = "1 - ALLOCATION";

var exampleController = View.createController('example', {
	
	svgControl: null,
	
	zoom: true, 

    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['highlightParameters'] = [{'view_file':"ab-ex-dwg-control-datasources.axvw", 'hs_ds': "highlightNoneDs", 'label_ds':'labelNoneDs'}];
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
		parameters['bordersHighlightSelector'] = false; 
		parameters['highlightFilterSelector'] = false;
		parameters['divId'] = "svgDiv";
		
		parameters['addOnsConfig'] = { 'NavigationToolbar': {divId: "svgDiv"},
									   'LayersPopup': {divId: "svgDiv"},
									   'AssetLocator': {divId: "svgDiv"}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters);	
   	
   	
    	// resize specified DOM element whenever the panel size changes
    	this.svg_ctrls.setContentPanel(Ext.get('svgDiv'));
    },
    
    /**
     * Pops up a detailed room report when clicking any highlighted room
     * roomIDs: a string like HQ;18;155. (TODO: move to SVG control)
     * position: mouse click position to identify selected room's position like {x:200, y:200}
     */   
    showReport: function(roomIDs, position) {
    	var arrayRoomIDs = roomIDs.split(";");
    	var reportView = View.panels.get("room_detail_report");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('rm.bl_id', arrayRoomIDs[0]);
    	restriction.addClause('rm.fl_id', arrayRoomIDs[1]);
    	restriction.addClause('rm.rm_id', arrayRoomIDs[2]);
    	reportView.refresh(restriction);

    	reportView.showInWindow({title:'Selected Room Detail', modal: true,collapsible: false, maximizable: false, width: 350, height: 250, autoScroll:false});
    }
});

/**
 * click event for tree items
 */
function onClickTreeNode(){
	var controller = View.controllers.get('example');
	var curTreeNode = View.panels.get("floor_tree").lastNodeClicked;
	
	// get selected data from tree
	bl_id = curTreeNode.data["rm.bl_id"];
	fl_id = curTreeNode.data["rm.fl_id"];
	dwgname = curTreeNode.data["rm.dwgname"];

	var rm_id = curTreeNode.data["rm.rm_id"];
	
	// if previously selected bl and fl are the same as current selection, no need to load the drawing again
	if ((bl_id != controller.bl_id || fl_id != controller.fl_id) || !rm_id ) {

		// load relevant svg
		controller.loadSvg(bl_id, fl_id);		
	}
	
	if (rm_id) {
		
		// you can choose how to highlight the asset  	  
    	var opts = { cssClass: 'zoomed-asset-red-bordered',		// use the cssClass property to specify a css class
    				 removeStyle: true							// use the removeStyle property to specify whether or not the fill should be removed (for example  cssClass: 'zoomed-asset-bordered'  and removeStyle: false
			   	   };
    	
    	// don't zoom into a room if the zoomFactor is 0
    	//alert(controller.zoomed)
    	if (controller.zoom === false) {
    		opts.zoomFactor = 0;
    	}

		controller.svgControl.getAddOn('AssetLocator').findAssets([bl_id+';'+fl_id+';'+rm_id], opts);
	} 
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






