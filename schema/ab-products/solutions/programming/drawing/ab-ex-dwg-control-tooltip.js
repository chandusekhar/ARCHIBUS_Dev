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
	
	showTooltip: true,

    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
		parameters['divId'] = "svgDiv";
		parameters['showTooltip'] = (this.showTooltip ? 'true' : 'false');
		parameters['multipleSelectionEnabled'] = 'false';
		parameters['addOnsConfig'] = { 'NavigationToolbar': {divId: "svgDiv"},
											'LayersPopup': {divId: "svgDiv",
															layers:"rm-assets;rm-labels;eq-assets;eq-labels;jk-assets;jk-labels;fp-assets;fp-labels;pn-assets;pn-labels;background",
															defaultLayers:"rm-assets;rm-labels;eq-assets;jk-assets;fp-assets;pn-assets"
															},
									   'AssetTooltip': {handlers: [{assetType: 'rm', datasource: 'labelDepartmentDs', fields: 'rm.rm_id;rm.dv_id;rm.dp_id'},
									                               {assetType: 'eq'},
									                               {assetType: 'jk', handler: this.onMouseOverJack}]}
									 };
									 
		this.svgControl = new Drawing.DrawingControl("svgDiv", "svg_ctrls", parameters);	
		
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl.load("svgDiv", parameters);	
    },
    
    onMouseOverJack: function(assetId, drawingController, event){
    	if(drawingController.getAddOn("AssetTooltip").showTooltip){
    		alert("You are on Jack [" + drawingController.getController("AssetController").getOriginalAssetId(assetId) + "]");
    	}
    },
    
    onToggleTooltip: function(){
    	this.showTooltip = !this.showTooltip;
    	
    	this.loadSvg(bl_id, fl_id);
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






