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
		parameters['addOnsConfig'] = { 'NavigationToolbar': {divId: "svgDiv"},
									   'LayersPopup': {divId: "svgDiv", layers: "rm$;rm$TXT;eq-assets;eq-labels;jk-assets;jk-labels;background", defaultLayers: "rm$;rm$TXT;eq-assets;jk-assets", customEvent: onCheckBoxChanged}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters, [{'eventName': 'click', 'assetType' : 'rm', 'handler' : this.onClickRoom}]);	
   	
   	
    	// resize specified DOM element whenever the panel size changes
    	this.svg_ctrls.setContentPanel(Ext.get('svgDiv'));
    },
    
    onClickRoom: function(assetIds, drawingController) {
    	var controller = View.controllers.get('example');
   		drawingController.getController("SelectController").toggleAssetSelection(assetIds, 'orange');
    }
});

function onCheckBoxChanged(checkbox){
	if(checkbox.checked)
		alert("you checked " + checkbox.id);
	else
		alert("you unchecked " + checkbox.id);
		
}
	
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






