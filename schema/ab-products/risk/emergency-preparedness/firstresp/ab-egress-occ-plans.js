var buildingId = null;
var floorId = null;
var dwgname = null;

function showDrawing(){
    
    var buildingDrawing = View.panels.get('abEgressPlans_select_flooring');
	var selectedIndex = buildingDrawing.selectedRowIndex;
    buildingId = buildingDrawing.rows[selectedIndex]["fl.bl_id"];
    floorId = buildingDrawing.rows[selectedIndex]["fl.fl_id"];
	dwgname = buildingDrawing.rows[selectedIndex]["fl.dwgname"];
    
    displayDrawing();
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("em.bl_id", buildingId);
    restriction.addClause("em.fl_id", floorId);
    View.panels.get('abEgressPlans_occupancyGrid').refresh(restriction);
    
} 

function displayDrawing(){
	if(!buildingId || !floorId){
		return;
	}
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    drawingPanel.clear();	
    
    dwgCtrlLoc = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
	var opts = new DwgOpts();	
	opts.mode = 'none';
	
	drawingPanel.addDrawing(dwgCtrlLoc, opts);	 
	drawingPanel.setSelectColor('0xFFFF00');
 
	var title = String.format(getMessage('dPTitle_egressPlans') + " : " + buildingId + "-" + floorId);
    View.dataSources.get('abEgressPlans_drawing_regcomplianceHighlight').addParameter('regulationer', 'Egress');
          
    addDrawingByType.defer(500, this, ['-egress', 'regcompliance', 'Egress']); 
      
    View.panels.get('abEgressPlans_occupancyGrid').show(true);  
         
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
} 
  
/*
 set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
 */
function addDrawingByType(assetTypesSuffix, tablename, detailgrid, resValue){
     
	//reset auto-assigned colors
	gAcadColorMgr.valueColorMap={};
    
    var selectedAssets = [];
    
    var assetRoom = {};
    assetRoom.assetType = 'rm';
    assetRoom.highlightDSName = "abEgressPlans_drawing_rmHighlight";
    assetRoom.labelDSName = "abEgressPlans_drawing_rmLabel";
 
 	selectedAssets.push(assetRoom);  
        
    var asset = {};
    asset.assetType = 'regulation-egress'; 
    asset.highlightDSName = "abEgressPlans_drawing_regcomplianceHighlight"; 
    asset.labelDSName = "abEgressPlans_drawing_regcomplianceLabel";

    selectedAssets.push(asset);   
 
    //highlight and label selected assets
	FABridge.abDrawing.root().applyAssets(selectedAssets); 
     
}
