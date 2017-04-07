
var controller = View.createController('abEgressPlans', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        //hide several panel
        this.abEgressPlans_DrawingPanel.appendInstruction("default", "", getMessage('dPTitle_equip'));
        this.abEgressPlans_eqdetailGrid.show(false);  
        // apply custom rule set for highlight
        ABEP_appendRuleSetForRecoveryStatus("eq", this.abEgressPlans_DrawingPanel, this.abEgressPlans_drawing_eqHighlight);
    }, 
	
	afterInitialDataFetch: function() {
		this.abEgressPlans_select_flooring.refresh("fl.bl_id=''");	
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
 
	title = String.format(getMessage('dPTitle_equip') + " : " + buildingId + "-" + floorId);
    addDrawingByType(null, 'eq', null, 'abEgressPlans_drawing_eqHighlight', 'abEgressPlans_drawing_eqLabel', 'abEgressPlans_eqdetailGrid')
       
    View.panels.get('abEgressPlans_eqdetailGrid').show(true);
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

 
/*
 set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
 */
function addDrawingByType(assetTypesSuffix, tablename, backgroundSuffix, currentHighlightDS, currentLabelsDS, detailgrid, resValue){
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    
    var opts = new DwgOpts();
    
    var restriction = new Ab.view.Restriction();
    
    var assetType = tablename;

    restriction.addClause(tablename + '.bl_id', buildingId, '=');
    restriction.addClause(tablename + '.fl_id', floorId, '=');
    drawingPanel.clear();
 
 
    drawingPanel.assetTypes = assetType; //tablename;

    drawingPanel.currentHighlightDS = currentHighlightDS;
    
    drawingPanel.currentLabelsDS = currentLabelsDS;
	
    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
    drawingPanel.addDrawing.defer(200, drawingPanel, [dcl, opts]); 
    View.panels.get(detailgrid).refresh(restriction);    
    
}


