
var controller = View.createController('abHazWastePlans', {

    //----------------event handle--------------------
    afterViewLoad: function(){  
        //hide several panel
        this.abEgressPlans_DrawingPanel.appendInstruction("default", "", getMessage('dPTitle_hazWastePlans')); 
        this.abEgressPlans_regdetailGrid.show(false); 
		
        //  var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
        
        this.checkLicense();
    }, 
	
	afterInitialDataFetch: function() {
		this.abEgressPlans_select_flooring.refresh("fl.bl_id=''");	
	},
	
	checkLicense: function() {
		var blPanel = View.panels.get('abEgressPlans-select-building');		
    	blPanel.show(false);
		try {
			var result = Workflow.callMethod("AbRiskCleanBuilding-CleanBuildingService-isActivityLicense", "AbRiskWasteMgmt");
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    if (result.value) {
	    	blPanel.show(true);
	    	return true;
	    } else {
	    	View.showMessage(getMessage("msg_no_license"));
	    	return false;
	    } 
    }
    
});


var buildingId = null;
var floorId = null;
var dwgname = null;

//if the first building has the floor ,display them
function blPanelAfterRefresh(){
    var blPanel = View.panels.get('abEgressPlans-select-building');
   
    var rows = blPanel.rows;
    if (rows.length > 0) {
        var blId = rows[0]['bl.bl_id'];
        var blRes = new Ab.view.Restriction();
        blRes.addClause('fl.bl_id', blId, '=');
        View.panels.get('abEgressPlans_select_flooring').refresh(blRes);
    }
}

function showDrawing(){

    var buildingDrawing = View.panels.get('abEgressPlans_select_flooring');
	var selectedIndex = buildingDrawing.selectedRowIndex;
    buildingId = buildingDrawing.rows[selectedIndex]["fl.bl_id"];
    floorId = buildingDrawing.rows[selectedIndex]["fl.fl_id"];
    dwgname = buildingDrawing.rows[selectedIndex]["fl.dwgname"];
	
    disPlayDrawing();
} 

/**button for the select layer and assettype of the zone and recompliance
 *
 * */
function disPlayDrawing(){
	if(!buildingId || !floorId){
		return;
	}

	var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    drawingPanel.clear();
	 
    var title = String.format(getMessage('dPTitle_hazWastePlans') + " : " + buildingId + "-" + floorId);
       // View.dataSources.get('abEgressPlans_drawing_wasteHighlight').addParameter('regulationer', 'HAZMAT');
        
        addDrawingByType(null, 'waste_out', null, "abEgressPlans_drawing_rmHighlight", "abEgressPlans_drawing_rmLabel", 'abEgressPlans_regdetailGrid', 'HAZMAT')
        
		View.panels.get('abEgressPlans_regdetailGrid').setTitle(getMessage("detailPanelTitle_hazWaste"));
        View.panels.get('abEgressPlans_regdetailGrid').show(true);
    
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
} 
 

/*
 set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
 */
function addDrawingByType(assetTypesSuffix, tablename, backgroundSuffix, currentHighlightDS, currentLabelsDS, detailgrid, resValue){
       
    var restriction = new Ab.view.Restriction();
 
    restriction.addClause(tablename + '.bl_id', buildingId, '=');
    restriction.addClause(tablename + '.fl_id', floorId, '=');
    View.panels.get(detailgrid).refresh(restriction);     
    
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    drawingPanel.clear();
 
    var opts = new DwgOpts();
    opts.setFillColor('0XFFFF00');
  
    drawingPanel.currentHighlightDS = currentHighlightDS;    
    drawingPanel.currentLabelsDS = currentLabelsDS;
    
    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
    drawingPanel.addDrawing.defer(200, drawingPanel, [dcl, opts]); 
    
}


