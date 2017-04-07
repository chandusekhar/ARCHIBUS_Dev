/**
 * called by ab-ex-svg-example.axvw
 */

var bl_id='';
var fl_id='';

var highlightRoom = false;
var highlightEqs = false;
var highlightJks = false;

var exampleController = View.createController('exampleController', {
	
	svgControl: null,
	
	loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['highlightParameters'] = [{'view_file':"ab-ex-dwg-control-datasources.axvw", 'hs_ds': "highlightNoneDs", 'label_ds':'labelNoneDs'}];
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id': fl_id};
    	
		parameters['addOnsConfig'] = { 'DatasourceSelector': {panelId: "svg_ctrls"},
									   'LayersPopup': {divId: "svgDiv",
										   			   layers: "rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;fp-assets;fp-labels;pn-assets;pn-labels;gros-assets;gros-labels;background",
										   			   defaultLayers: "rm-assets;rm-labels;eq-assets;jk-assets;fp-assets;pn-assets;gros-assets"
										   			  },
							   			'InfoWindow': {width: '400px', position: 'bottom'}
									 };
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [{'eventName': 'click', 'assetType' : 'rm', 'handler' : this.showReport, 'highlightOnly' : false}]);	
    	
    },
    
    //Highlight/Clear Single Room
    onHighlightRoom: function(){
    	if(highlightRoom){
    		this.svgControl.control.getDrawingController().getController("HighlightController").clearAsset('SRL;03;365B', {persistFill: false, overwriteFill: true});
    		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText("Room SRL;03;365B is cleared.<br>");
    	}
    	else {
    		this.svgControl.control.getDrawingController().getController("HighlightController").highlightAsset('SRL;03;365B', {color: 'blue', persistFill: true, overwriteFill: true});
    		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText("Room SRL;03;365B is highlighted.<br>");

    	}
    	highlightRoom = !highlightRoom;
    },

    //Highlight Multiple Equipments
    onHighlightEquipments: function(){
    	if(highlightEqs){
        	this.svgControl.control.getDrawingController().getController("HighlightController").clearAssets(['745361110481', '745361110482','745361110483','745361110448','745361110449',
        	                                                                                                     '745361110450', '745361110451','745361110452','745361110453'], {persistFill: false, overwriteFill: true});
    		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText("Highlighted equipment(s) are cleared.<br>");
    	
    	} else{
    		var numHighlighted = this.svgControl.control.getDrawingController().getController("HighlightController").highlightAssets({'745361110481': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110482': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110483': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110448': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110449': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110450': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110451': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110452': {color: 'green', persistFill: true, overwriteFill: true},
			   '745361110453': {color: 'green', persistFill: true, overwriteFill: true}
    		});
    		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText(numHighlighted + " equipment(s) are highlighted.<br>");
    	}
    	highlightEqs = !highlightEqs;
    	
    },

    //Highlight All Jacks
    onHighlightAllJacks: function(){
    	
    	if(highlightJks){
    		this.svgControl.control.getDrawingController().getController("HighlightController").clearAssetsByType('jk', {persistFill: false, overwriteFill: true});
			this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText("Highlighted jack(s) are cleared.<br>");
    	} else {
    		var numHighlighted = this.svgControl.control.getDrawingController().getController("HighlightController").highlightAssetsByType('jk', {color: 'red', persistFill: true, overwriteFill: true});

	    	var missingAssets = this.svgControl.control.getDrawingController().getController("HighlightController").getMissingAssets("highlight");
			var missingAssetsMsg = 'Unable to find the following assets:';
			var hasError = false;
			if(missingAssets.assets.length > 0){
				missingAssetsMsg += '[' + missingAssets.assets.toString() + ']';
				hasError = true;
			}
			if(hasError){
				this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText(missingAssetsMsg);
				this.svgControl.control.getDrawingController().getController("HighlightController").resetMissingAssets('highlight');
			} else {
				this.svgControl.control.getDrawingController().getAddOn('InfoWindow').appendText(numHighlighted + " jack(s) are highlighted.<br>");
			}
    	}
    	highlightJks = !highlightJks;
    },
    
    // clear all highlights
    onReset: function(){
    	this.svgControl.control.getDrawingController().getController("HighlightController").resetAll();
		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("All Highlights are cleared.<br>");
		highlightRoom = false;
		highlightEqs = false;
		highlightJks = false;
    },
    
    /**
     * Pops up a detailed room report when clicking any highlighted room
     * roomIDs: a string like HQ;18;155. (TODO: move to SVG control)
     * position: mouse click position to identify selected room's position like {x:200, y:200}
     */   
    showReport: function(roomIds, control) {
    	var arrayRoomIDs = roomIds.split(";");
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
	var controller = View.controllers.get('exampleController');
	var curTreeNode = View.panels.get("floor_tree").lastNodeClicked;
	
	// get selected data from tree
	bl_id = curTreeNode.data["rm.bl_id"];
	fl_id = curTreeNode.data["rm.fl_id"];
	
	// if previously selected bl and fl are the same as current selection, no need to load the drawing again
	if ((bl_id != controller.bl_id || fl_id != controller.fl_id)) {

		// load relevant svg
		controller.loadSvg(bl_id, fl_id);		
	}
		
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






