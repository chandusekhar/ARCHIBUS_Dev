/**
 * called by ab-ex-svg-example.axvw
 */

var bl_id='';
var fl_id='';
var dwgname = '';
var plan_type = "1 - ALLOCATION";

var exampleController = View.createController('example', {
	
	svgControl: null,
	
	drawingState: 'select',
	
	connectAssets: [],
	
    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
		parameters['divId'] = "svgDiv";
		parameters['multipleSelectionEnabled'] = 'true';
		parameters['topLayers'] = 'eq;';
		parameters['addOnsConfig'] = { 'NavigationToolbar': {divId: "svgDiv"},
											'InfoWindow': {width: '400px', position: 'bottom'},
											'SelectWindow': {assetType: "rm;eq", customEvent: this.onSelectWindow}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [
    	                                            {'eventName': 'click', 'assetType' : 'rm', 'handler' : this.onClickAsset},
                                                    {'eventName': 'click', 'assetType' : 'eq', 'handler' : this.onClickEquipment, 'bbox': {width: 25, height: 32}}]); 
    },
    
    onSelectWindow: function(selectAssets, drawingController){
    	drawingController.getAddOn('InfoWindow').setText("you have selected the assets:\n " + selectAssets.join("\n"));
    },
    
    onClickAsset: function(assetIds, drawingController){
    	// toggle the room if clicked
    	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
    },
    
    onClickEquipment: function(assetIds, drawingController) {
       	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
		drawingController.getAddOn('InfoWindow').setText("<br>You clicked equipment: [" + assetIds + "]");
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
	
	// if previously selected bl and fl are the same as current selection, no need to load the drawing again
	if ((bl_id != controller.bl_id || fl_id != controller.fl_id) ) {

		// load relevant svg
		controller.loadSvg(bl_id, fl_id);		
	}
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






