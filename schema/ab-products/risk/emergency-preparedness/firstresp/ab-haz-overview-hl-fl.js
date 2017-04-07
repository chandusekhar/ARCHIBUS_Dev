var controller = View.createController('abHazmatPlans', {

    afterViewLoad: function(){  
	    this.abEgressPlans_DrawingPanel.appendInstruction("default", "", getMessage('dPTitle_hazMatPlans'));
	
	    this.abEgressPlans_regdetailGrid.show(false); 
	        
	     // register events of the drawing panel
		this.abEgressPlans_DrawingPanel.addEventListener('onclick', onRoomClicked);
		this.abEgressPlans_DrawingPanel.addEventListener('ondwgload', onDwgLoaded);
	                                            
	    //  var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    }, 
                        
    afterInitialDataFetch: function() {
        this.abEgressPlans_select_flooring.refresh("fl.bl_id=''");                 
    }    
});

/**
* listener of the drawing onload event
*/
function onDwgLoaded() {
	// add next drawing in the drawing name array until all drawings are loaded
	abRiskMsdsRptDrawingController.addFirstDrawing();
}


var buildingId = null;
var floorId = null;
var dwgname = null;
var selectedRow = [];

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

function disPlayDrawing(){
    if(!buildingId || !floorId){
        return;
    }
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    drawingPanel.clear();

    var title = String.format(getMessage('dPTitle_hazMatPlans') + " : " + buildingId + "-" + floorId);
    // View.dataSources.get('abEgressPlans_drawing_regcomplianceHighlight').addParameter('regulationer', 'HAZMAT');
    addDrawingByType(null, 'rm', null, "abEgressPlans_grid_regdetail", "abEgressPlans_grid_regdetail", 'abEgressPlans_regdetailGrid', 'HAZMAT')
        
    View.panels.get('abEgressPlans_regdetailGrid').setTitle(getMessage("detailPanelTitle_hazMat"));
    View.panels.get('abEgressPlans_regdetailGrid').show(true);

    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
} 
 

/**
*	set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
*/
function addDrawingByType(assetTypesSuffix, tablename, backgroundSuffix, currentHighlightDS, currentLabelsDS, detailgrid, resValue){
    var drawingPanel = View.panels.get('abEgressPlans_DrawingPanel');
    
    var restriction = new Ab.view.Restriction();

    var assetType = tablename;

    restriction.addClause(tablename + '.bl_id', buildingId, '=');
    restriction.addClause(tablename + '.fl_id', floorId, '=');
    drawingPanel.clear(); 
        
    var dcl = new Ab.drawing.DwgCtrlLoc(buildingId, floorId, null, dwgname);
   
    drawingPanel.addDrawing.defer(100, drawingPanel, [dcl]);
        
    var selectedAssets=[];
    var asset = {};
    
    //regcompliance all room labels asset type
    asset = {};
    asset.assetType = 'rm';    
    asset.labelDSName =  "abEgressPlans_labelDs_allRm"; 
    selectedAssets.push(asset);
    
    //rm asset type
    asset = {};
    asset.assetType = 'rm';
    asset.highlightDSName = "abEgressPlans_dwg_hl_rm"; 
    asset.labelDSName =  "abEgressPlans_labelDs_allRm";  
    selectedAssets.push(asset);
    
    //regcompliance asset type 
    asset={};
    asset.assetType='regulation-hazmat'; 
    asset.highlightDSName='abEgressPlans_dwg_hl_regComp';
     
    //asset.labelDSName='abEgressPlans_drawing_regcomplianceLabel';
    selectedAssets.push(asset);
        
    var applyAssets = function(){
                    FABridge.abDrawing.root().applyAssets(selectedAssets);
    }
    
    applyAssets.defer(100);
        
//    opts.assetType = 'regulation-hazmat';
//    View.getControl('', 'abEgressPlans_DrawingPanel').highlightAssets(opts);
      
    View.panels.get('abEgressPlans_regdetailGrid').refresh(restriction); 
    
}

/**
* on click event handler when click drawing room
*/
function onRoomClicked(pk, selected) {
	var flRestriction = "rm.bl_id='" + buildingId + "' AND " + "rm.fl_id='" + floorId + "' ";
	  if(selectedRow.length !=0){
	        View.getControl('', 'abEgressPlans_DrawingPanel').unselectAssets(selectedRow);
	        selectedRow = [];
	    }    
    if (selected) {
        var restriction = new Ab.view.Restriction();
    	//evaluate pk to determine which kind of asset graphic was clicked and process accordingly
    	if(pk.length == 1){
    		restriction.addClause('rm.regcomp_id', pk[0]);
    	}
    	else{
    		restriction.addClause('rm.bl_id', pk[0]);
            restriction.addClause('rm.fl_id', pk[1]);
            restriction.addClause('rm.rm_id', pk[2]);	
    	}
        View.panels.get('abEgressPlans_regdetailGrid').refresh(restriction);
    } else {
        View.panels.get('abEgressPlans_regdetailGrid').refresh(flRestriction);
    }
}

/**
* on click event handler of row click event for grid
* abEgressPlans_regdetailGrid
*/
function selectRoom(row) {
    //var opts = new DwgOpts();       
    var selectedRecord = row.row.getRecord();
    var assetRow = row;
    var restriction = new Ab.view.Restriction();
    var regcomp = selectedRecord.getValue('regcompliance.regcomp_id'); 
                      
    // make the room selected in the floor plan
    if(selectedRow.length !=0){
        View.getControl('', 'abEgressPlans_DrawingPanel').unselectAssets(selectedRow);
    }
    selectedRow=[];
    if(regcomp){
    	selectedRow.push([selectedRecord.getValue('regcompliance.regcomp_id')]);
    } else {
    	selectedRow.push([selectedRecord.getValue('rm.bl_id'), selectedRecord.getValue('rm.fl_id'), selectedRecord.getValue('rm.rm_id')]);
    }    
    View.getControl('', 'abEgressPlans_DrawingPanel').selectAssets(selectedRow);
}
