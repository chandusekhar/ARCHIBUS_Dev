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
		parameters['showTooltip'] = 'true';
		parameters['topLayers'] = 'eq;jk;pn;';
		parameters['addOnsConfig'] = { 'LayersPopup': {divId: "svgDiv",
											layers:"rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;pn-assets;pn-labels",
											defaultLayers:"rm-assets;eq-assets;jk-assets;;pn-assets"},
										'AssetTooltip': {handlers: [{assetType: 'rm'},
										                            {assetType: 'eq'},
										                            {assetType: 'jk'},
										                            {assetType: 'pn'}]
															},
										'InfoWindow': {width: '400px', position: 'top', customEvent: this.onCloseInfoWindow}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [
                                                    {'eventName': 'click', 'assetType' : 'eq', 'handler' : this.onClickEquipmentOrJack, 'bbox': {width: 25, height: 32}},
                                                    {'eventName': 'click', 'assetType' : 'jk', 'handler' : this.onClickEquipmentOrJack}
                                                    ]);	
    },
    
    onTrace: function(){
		/*
		 * test the <use> with no tranform info 
		 */
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110481', '745361110448', 'red');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110481', '745361110449', 'red');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110482', '745361110450', 'blue');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110482', '745361110451', 'blue');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110483', '745361110452', 'yellow');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('745361110483', '745361110453', 'yellow');
		
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('45200', 'SRL03-334-1-D', 'purple');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('SRL03-334-1-D', 'SRL03-PN05', 'purple');
		this.svgControl.control.getDrawingController().getController("HighlightController").traceAssets('SRL03-PN05', 'SRL03-PN01', 'purple');
		
		var missingAssets = this.svgControl.control.getDrawingController().getController("HighlightController").getMissingAssets("trace");
		var missingAssetsMsg = 'Unable to find the following assets:';
		var hasError = false;
		if(missingAssets.assetFrom.length > 0){
			missingAssetsMsg += '\nassetFrom: [' + missingAssets.assetFrom.toString() + ']';
			hasError = true;
		}
		if(missingAssets.assetTo.length > 0){
			missingAssetsMsg += '\nassetTo: [' + missingAssets.assetTo.toString() + ']';
			hasError = true;
		}
		if(hasError){
			this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText(missingAssetsMsg);
			this.svgControl.control.getDrawingController().getController("HighlightController").resetMissingAssets('trace');
		} 
		this.drawingState = 'select';
    },
    
    onReset: function(){
    	this.svgControl.control.getDrawingController().getController("HighlightController").resetAll();
		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("All Highlights are cleared.");
    	this.drawingState = 'select';
    },
    
    onConnect: function(){
    	this.drawingState = 'connect';
    	this.connectAssets = [];
		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("Please click on your 1st equipment or Jack.");
    },
    
    onCloseInfoWindow: function(drawingController){
    	this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("");
    },
    
    onClickEquipmentOrJack: function(assetIds, drawingController) {

    	var controller = View.controllers.get('example');
    	
    	if(controller.drawingState == 'connect'){
    		controller.connectAssets.push(assetIds);
    		
    		if(controller.connectAssets.length == 1){
    			drawingController.getAddOn('InfoWindow').appendText("<br>1st equipment/jack: [" + assetIds + "]");
    			drawingController.getAddOn('InfoWindow').appendText("<br>Please pick your 2nd asset!");
    		} else if(controller.connectAssets.length == 2){
    			drawingController.getAddOn('InfoWindow').appendText("<br>2st equipment/jack: [" + assetIds + "]");
    			drawingController.getController("HighlightController").traceAssets(controller.connectAssets[0], controller.connectAssets[1], 'purple');
    			controller.connectAssets = [];
    		}	
    	} else {
        	// toggle the room if clicked
        	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
    	}
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






