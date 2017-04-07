/**
 * called by ab-ex-svg-example.axvw
 */

var exampleController = View.createController('example', {
	
	svgControl: null,
	
	bl_id: null,
	
	fl_id: null,
    
	zoom: true, 
	
    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['plan_type'] = "1 - ALLOCATION";
    	//parameters.highlightParameters = [{'view_file':"ab-ex-rmxdp-dwg-rpt.axvw", 'hs_ds': "ds_abExRmxdpDwgRpt_highlightData", 'label_ds':'ds_abExRmxdpDwgRpt_labelNames'}];
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};

    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl = new Ab.svg.DrawingControl("svgDiv", "svg_ctrls", parameters);
    	this.svgControl.load("svgDiv", parameters);	
   	
    	// bind event to highlighted rooms. this.showReport is callback
    	this.svgControl.addEventHandlers(this.svgControl, [{'assetType' : 'rm', 'handler' : this.showReport}]);
    	
    	// show layers menu
    	this.svgControl.showLayers();
    	
    	// resize specified DOM element whenever the panel size changes
    	this.svg_ctrls.setContentPanel(Ext.get('svgDiv'));
    },
    
    svg_ctrls_onToggleZooming: function() {
    	this.zoom = !this.zoom;
    	   	
    	if (this.zoom) {
    		alert(getMessage('msgZoomingEnabled'));
    	} else {
    		alert(getMessage('msgZoomingDisabled'));
    	}
    	
    	if (View.panels.get("floor_tree").lastNodeClicked) {
    		onClickTreeNode();
    	}
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
	var bl_id = curTreeNode.data["rm.bl_id"];
	var fl_id = curTreeNode.data["rm.fl_id"];
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

		controller.svgControl.findAssets([bl_id+';'+fl_id+';'+rm_id], opts);
	} 
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






