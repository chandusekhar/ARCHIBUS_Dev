var bl_id='';
var fl_id='';

var exampleController = View.createController('example', {
	
	svgControl: null,
	
    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
		parameters['divId'] = "svgDiv";
		parameters['multipleSelectionEnabled'] = 'false';
		parameters['addOnsConfig'] = { 'LayersPopup': {divId: "svgDiv"}};
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		// load SVG from server so that we can get all layers
		this.svgControl.load("svgDiv", parameters);
		 
		var self = this;
		var handlers = [];
		var nodes = d3.selectAll('#assets')[0][0].childNodes;
		for(var i =0; i < nodes.length; i++){
			var node = nodes[i];
			if(node.nodeName == 'g'){
				var id = node.getAttribute("id").replace("-assets", "");
	       		handlers.push({'eventName': 'click', 'assetType' : id, 'handler' : self.onClickAsset});
			}
		}
		
		// load SVG again with all the handlers
		this.svgControl.load("svgDiv", parameters, handlers);
		 
    },
    
    onClickAsset: function(assetIds, drawingController){
    	// toggle the room if clicked
    	drawingController.getController("SelectController").toggleAssetSelection(assetIds);
    },
    
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
	if (bl_id != controller.bl_id || fl_id != controller.fl_id) {
		// load relevant svg
		controller.loadSvg(bl_id, fl_id);		
	}
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
}






