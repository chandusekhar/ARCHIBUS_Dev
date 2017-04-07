
var controller = View.createController('abEgressPlans', {

    //----------------event handle--------------------
    afterViewLoad: function(){
        //hide several panel
        this.abEgressPlans_DrawingPanel.appendInstruction("default", "", getMessage('dPTitle_egressPlans'));
        this.abEgressPlans_eqdetailGrid.show(false);
        this.abEgressPlans_zonedetailGrid.show(false);
        this.abEgressPlans_regdetailGrid.show(false);
        this.abEgressPlans_rmdetailGrid.show(false);
	
        //  var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
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
    if (document.getElementById("radio").value == 'REG-EGRESS') {
        document.getElementById("radio").checked = true;
        
    }
    else {
        document.getElementById("radio").checked = false;
    }
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

//get the radio button    
function getSelectedRadioButton(name){
    var radioButtons = document.getElementsByName(name);
    
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked == 1) {
            return radioButtons[i].value;
        }
    }
    return null;
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
	
    var radioButton = getSelectedRadioButton('radio');
    var title = "";
    if (radioButton == 'RM') {
		title = String.format(getMessage('dPTitle_rms') + " : " + buildingId + "-" + floorId);
        addDrawingByType(null, 'rm', null, 'abEgressPlans_drawing_rmHighlight', 'abEgressPlans_drawing_rmLabel', 'abEgressPlans_rmdetailGrid')
        showPanelDetail(false, false, true, false);
    }
    if (radioButton == 'EQ') {
    	title = String.format(getMessage('dPTitle_equip') + " : " + buildingId + "-" + floorId);
        addDrawingByType(null, 'eq', null, 'abEgressPlans_drawing_eqHighlight', 'abEgressPlans_drawing_eqLabel', 'abEgressPlans_eqdetailGrid')
        
        showPanelDetail(false, false, false, true);
        
    }
    if (radioButton == 'REG-HAZMAT') {
    	title = String.format(getMessage('dPTitle_hazMatPlans') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_regcomplianceHighlight').addParameter('regulationer', 'HAZMAT');
        addDrawingByType('-hazmat', 'regcompliance', null, "abEgressPlans_drawing_regcomplianceHighlight", "abEgressPlans_drawing_regcomplianceLabel", 'abEgressPlans_regdetailGrid', 'HAZMAT')
        
		View.panels.get('abEgressPlans_regdetailGrid').setTitle(getMessage("detailPanelTitle_hazMat"));
        showPanelDetail(true, false, false, false);
    }
    if (radioButton == 'REG-EGRESS') {
		title = String.format(getMessage('dPTitle_egressPlans') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_regcomplianceHighlight').addParameter('regulationer', 'Egress');
        
        addDrawingByType('-egress', 'regcompliance', null, "abEgressPlans_drawing_regcomplianceHighlight", "abEgressPlans_drawing_regcomplianceLabel", 'abEgressPlans_regdetailGrid', 'Egress');
        
        View.panels.get('abEgressPlans_regdetailGrid').setTitle(getMessage("detailPanelTitle_egress"));
        showPanelDetail(true, false, false, false);
    }
    
    if (radioButton == 'ZONE-FIRE') {
    	title = String.format(getMessage('dPTitle_smokeZones') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_zoneHighlight').addParameter('drawingLayer', 'ZONE-FIRE');
        addDrawingByType('-fire', 'zone', null, "abEgressPlans_drawing_zoneHighlight", "abEgressPlans_drawing_zoneLabel", 'abEgressPlans_zonedetailGrid', 'ZONE-FIRE');
        
        showPanelDetail(false, true, false, false);
    }
    
    if (radioButton == 'ZONE-SPRINKLER') {
    	title = String.format(getMessage('dPTitle_alarmZones') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_zoneHighlight').addParameter('drawingLayer', 'ZONE-SPRINKLER');
        
        addDrawingByType('-sprinkler', 'zone', null, "abEgressPlans_drawing_zoneHighlight", "abEgressPlans_drawing_zoneLabel", 'abEgressPlans_zonedetailGrid', 'ZONE-SPRINKLER');
        
        showPanelDetail(false, true, false, false);
    }
    if (radioButton == 'ZONE-SECURITY') {
		title = String.format(getMessage('dPTitle_securityZones') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_zoneHighlight').addParameter('drawingLayer', 'ZONE-SECURITY');
        
        addDrawingByType('-security', 'zone', null, "abEgressPlans_drawing_zoneHighlight", "abEgressPlans_drawing_zoneLabel", 'abEgressPlans_zonedetailGrid', 'ZONE-SECURITY');
        
        showPanelDetail(false, true, false, false);
    }
    
    if (radioButton == 'ZONE-HVAC') {
		title = String.format(getMessage('dPTitle_hvacZones') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_zoneHighlight').addParameter('drawingLayer', 'ZONE-HVAC');
        
        addDrawingByType('-hvac', 'zone', null, "abEgressPlans_drawing_zoneHighlight", "abEgressPlans_drawing_zoneLabel", 'abEgressPlans_zonedetailGrid', 'ZONE-HVAC');
        
        showPanelDetail(false, true, false, false);
    }
    
    if (radioButton == 'ZONE-EMERGENCY') {
		title = String.format(getMessage('dPTitle_emerLightZones') + " : " + buildingId + "-" + floorId);
        View.dataSources.get('abEgressPlans_drawing_zoneHighlight').addParameter('drawingLayer', 'ZONE-EMERGENCY');
        addDrawingByType('-emergency', 'zone', null, "abEgressPlans_drawing_zoneHighlight", "abEgressPlans_drawing_zoneLabel", 'abEgressPlans_zonedetailGrid', 'ZONE-EMERGENCY');
        
        showPanelDetail(false, true, false, false);
    }
    
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
}

function showPanelDetail(p1, p2, p3, p4){
    View.panels.get('abEgressPlans_regdetailGrid').show(p1);
    View.panels.get('abEgressPlans_zonedetailGrid').show(p2);
    View.panels.get('abEgressPlans_rmdetailGrid').show(p3);
    View.panels.get('abEgressPlans_eqdetailGrid').show(p4);
    
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
    if (backgroundSuffix) {
        opts.backgroundSuffix = backgroundSuffix;
        //opts.assetSuffix = assetTypesSuffix;
        //next //code has the same result with  ' drawingPanel.assetTypes = assetTypesSuffix' 
    
    }
    if (assetTypesSuffix) {
    
        opts.assetSuffix = assetTypesSuffix;
    }
    else {
        opts.assetSuffix = ''
        
    }

    if (tablename == "regcompliance") {
            assetType = "regulation";
    }

    drawingPanel.assetTypes = assetType; //tablename;

    drawingPanel.currentHighlightDS = currentHighlightDS;
    
    drawingPanel.currentLabelsDS = currentLabelsDS;
	
    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
    drawingPanel.addDrawing.defer(200, drawingPanel, [dcl, opts]);
    if (tablename == "zone") {
        restriction.addClause('zone.layer_name', resValue, '=');
    }
    
    if (tablename == "regcompliance") {
        restriction.addClause('regcompliance.regulation', resValue, '=');
    }
    
    View.panels.get(detailgrid).refresh(restriction);
    
    
}


