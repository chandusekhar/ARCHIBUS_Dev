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
		parameters['topLayers'] = 'eq;pn;jk;fp';
		parameters['addOnsConfig'] = { 'NavigationToolbar': {divId: "svgDiv"},
											'LayersPopup': {divId: "svgDiv",
															layers:"rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;fp-assets;fp-labels;pn-assets;pn-labels;background",
															defaultLayers:"rm-assets;rm-labels;eq-assets;jk-assets;fp-assets;pn-assets"
															},
											'AssetTooltip': {handlers: [{assetType: 'rm', datasource: 'labelDepartmentDs', fields: 'rm.rm_id;rm.dv_id;rm.dp_id'},
										                               {assetType: 'eq'},
										                               {assetType: 'jk', handler: this.onMouseOverJack}]
															},
											'InfoWindow': {width: '400px', position: 'bottom', customEvent: this.onCloseInfoWindow},
											'SelectWindow': {assetType: "rm;eq", customEvent: this.onSelectWindow}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [
    	                                            {'eventName': 'click', 'assetType' : 'rm', 'handler' : this.onClickAsset},
                                                    {'eventName': 'click', 'assetType' : 'eq', 'handler' : this.onClickEquipment, 'bbox': {width: 25, height: 32}},
                                                    {'eventName': 'click', 'assetType' : 'pn', 'handler' : this.onClickAsset},
                                                    {'eventName': 'click', 'assetType' : 'jk', 'handler' : this.onClickAsset},
                                                    {'eventName': 'click', 'assetType' : 'fp', 'handler' : this.onClickAsset},
                                                    {'eventName': 'contextmenu', 'assetType' : 'rm', 'handler' : this.onContextMenuRoom}
                                                    ]);	
    },
    
    onHighlight: function(){
    	var numHighlighted = this.svgControl.control.getDrawingController().getController("HighlightController").highlightAssetsByType('eq', {color: 'yellow', persistFill: true, overwriteFill: true});
    	var missingAssets = this.svgControl.control.getDrawingController().getController("HighlightController").getMissingAssets("highlight");
		var missingAssetsMsg = 'Unable to find the following assets:';
		var hasError = false;
		if(missingAssets.assets.length > 0){
			missingAssetsMsg += '[' + missingAssets.assets.toString() + ']';
			hasError = true;
		}
		if(hasError){
			this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText(missingAssetsMsg);
			this.svgControl.control.getDrawingController().getController("HighlightController").resetMissingAssets('highlight');
		} else {
			this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText(numHighlighted + " equipment(s) are highlighted.");
		}
    	this.drawingState = 'select';
    },

    onTrace: function(){
    	

    	
    	//KB# 3052520.  Trace assets line sometimes goes off the edge of the drawing.
    	//test all <use> elements asset types.
    	var asset1 = null;
    	var asset2 = null;
    	var svgControl = this.svgControl;
    	var assetTypes = ['eq','jk','fp','pn'];
    	for(var i = 0; i < assetTypes.length; i++){
			var assetGroup = assetTypes[i] + "-assets";
	    	d3.selectAll("#" + assetGroup).selectAll('*').filter( function() { return this.parentNode.id === assetGroup; } )
	        	.each(function () {
		        	if(asset1 == null){
		        		asset1 = this.id;
		        	} else {
		        		asset2 = this.id;
		            	svgControl.control.getDrawingController().getController("HighlightController")
		            		.traceAssets(asset1, asset2, 'red');
		      			 asset1 = asset2 = null;
		        	}
		        }
	       ); 
    	}
		
		
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
    
    onSelectWindow: function(selectAssets, drawingController){
    	drawingController.getAddOn('InfoWindow').setText("you have selected the assets:\n " + selectAssets.join("\n"));
    },
    
    onReset: function(){
    	this.svgControl.control.getDrawingController().getController("HighlightController").resetAll();
		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("All Highlights are cleared.");
    	this.drawingState = 'select';
    },
    
    onConnect: function(){
    	this.drawingState = 'connect';
    	this.connectAssets = [];
		this.svgControl.control.getDrawingController().getAddOn('InfoWindow').setText("Please pick your 1st equipment!");
    },
    
    onClickAsset: function(assetIds, drawingController){
    	// toggle the room if clicked
    	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
    },
    
    onCloseInfoWindow: function(drawingController){
    	alert("close info bar");
    },
    
    onClickEquipment: function(assetIds, drawingController) {

    	var controller = View.controllers.get('example');
    	
    	if(controller.drawingState == 'connect'){
    		controller.connectAssets.push(assetIds);
    		
    		if(controller.connectAssets.length == 1){
    			drawingController.getAddOn('InfoWindow').appendText("<br>1st equipment: [" + assetIds + "]");
    			drawingController.getAddOn('InfoWindow').appendText("<br>Please pick your 2nd asset!");
    		} else if(controller.connectAssets.length == 2){
    			drawingController.getAddOn('InfoWindow').appendText("<br>2st equipment: [" + assetIds + "]");
    			drawingController.getController("HighlightController").traceAssets(controller.connectAssets[0], controller.connectAssets[1], 'purple');
    			controller.connectAssets = [];
    		}	
    	} else {
        	// toggle the room if clicked
        	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
    	}
    },
    
    onContextMenuRoom: function(assetIds, drawingController){
    	alert("Add your menu here - " + assetIds);
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
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






