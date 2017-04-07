/**
 * Keven.xi
 * 02/08/2010
 */
var controller = View.createController('abEpHighltSystemAndZonesController', {
	
	lastShowDetailPanel:1, //1 zone 2 equipment 3 room 4 HAZMAT 5 egress
	
	
	afterViewLoad: function() {
        //hide several panel
        this.abSystemAndZone_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
        this.abSystemZone_eqdetailGrid.show(false);
        this.abSystemZone_zonedetailGrid.show(false);
        this.abSystemZone_regdetailGrid.show(false);
        this.abSystemZone_rmdetailGrid.show(false);
    }, 
	
	/**
	 * called when view onload,initial the employee list panel
	 */
	afterInitialDataFetch:function(){
		// this.abSystemAndZone_DrawingPanel.appendInstruction("default", "", getMessage('drawingPanelTitle1'));
		// $("btnLoadDrawing").value = getMessage('btnLoadDrawingTitle');
		// this.onRefreshFloor();
		this.abEpHighltSystemAndZones_grid_fl.refresh("fl.bl_id=''");
		
		var objSetRecoveryStatus = Ext.get('setRecStatus');
		objSetRecoveryStatus.on('click', this.showRoomDetailStatusMenu, this, null);
		
		var objSetRecoveryStatus = Ext.get('setEqRecStatus');
		objSetRecoveryStatus.on('click', this.showEquipmentDetailStatusMenu, this, null);
		
	},
	
	/**
	 * refresh floor grid panel by the first row data in building panel
	 */
    onRefreshFloor: function(){
        var restriction = new Ab.view.Restriction();
        if (this.abEpHighltSystemAndZones_grid_bl.rows.length > 0) {
            var firstBlRow = this.abEpHighltSystemAndZones_grid_bl.rows[0];
            restriction.addClause("bl.bl_id", firstBlRow["bl.bl_id"], "=");
            this.abEpHighltSystemAndZones_grid_fl.refresh(restriction);
        }
        else {
        	restriction.addClause("fl.bl_id", "", "=");
            this.abEpHighltSystemAndZones_grid_fl.refresh(restriction);
        }
    },
	/**
	 * called when user click the Refresh button
	 */
	abEpHighltSystemAndZones_grid_bl_onRefresh:function(){
		var restriction = new Ab.view.Restriction();
		this.abEpHighltSystemAndZones_grid_bl.refresh(restriction);
		this.onRefreshFloor();
	},
	
	/**
	 * 1 load drawing by the first row in the floor grid and checkbox values
	 * 2 refresh the details grid panel
	 */
	abEpHighltSystemAndZones_grid_fl_afterRefresh:function(){
		if (this.abEpHighltSystemAndZones_grid_fl.rows.length>0){
			this.abEpHighltSystemAndZones_grid_fl.selectedRowIndex = 0;
			showDrawing();
			
			var firstFlRow = this.abEpHighltSystemAndZones_grid_fl.rows[0];
			this.refreshDetailsPanel(firstFlRow["fl.bl_id"],firstFlRow["fl.fl_id"],false);
		}else{
			this.refreshDetailsPanel("","",false);
		}
	},
	/**
	 * Refresh details panel
	 * @param {string} building --building code
	 * @param {string} floor -- floor code
	 * @param {boolean} isRecall -- true: it means this calling by recursion; 
	 *                              false: it means this method is called by other methods
	 */
	refreshDetailsPanel:function(building,floor,isRecall){
		var whiPanel = isRecall ? this.lastShowDetailPanel : this.getShowWhichDetailPanel();
		
		var restriction = new Ab.view.Restriction();
		switch (whiPanel){
			case 1:
			    restriction.addClause("zone.bl_id",building , "=");
				restriction.addClause("zone.fl_id",floor , "=");
				this.abSystemZone_zonedetailGrid.refresh(restriction); 
				this.showPanelDetail(false,true,false,false);
				break;
			case 2:
				restriction.addClause("eq.bl_id",building , "=");
				restriction.addClause("eq.fl_id",floor , "=");
				this.abSystemZone_eqdetailGrid.refresh(restriction);
				this.showPanelDetail(false,false,false,true);
				break;
			case 3:
				restriction.addClause("rm.bl_id",building , "=");
				restriction.addClause("rm.fl_id",floor , "=");
				this.abSystemZone_rmdetailGrid.refresh(restriction);
				this.showPanelDetail(false,false,true,false);
				break;
			case 4:
				restriction.addClause("regcompliance.bl_id",building , "=");
				restriction.addClause("regcompliance.fl_id",floor , "=");
				restriction.addClause("regcompliance.regulation",'HAZMAT' , "=");
				this.abSystemZone_regdetailGrid.refresh(restriction);
				this.showPanelDetail(true,false,false,false);
				this.abSystemZone_regdetailGrid.setTitle(getMessage('regDetailsPanelTitle2'));
				break;
			case 5:
				restriction.addClause("regcompliance.bl_id",building , "=");
				restriction.addClause("regcompliance.fl_id",floor , "=");
				restriction.addClause("regcompliance.regulation",'Egress' , "=");
				this.abSystemZone_regdetailGrid.refresh(restriction);
				this.showPanelDetail(true,false,false,false);
				this.abSystemZone_regdetailGrid.setTitle(getMessage('regDetailsPanelTitle1'));
				break;	
			default:
				this.refreshDetailsPanel(building,floor,true);
		}
		
		if (whiPanel != -1 && whiPanel != this.lastShowDetailPanel) {
			this.lastShowDetailPanel = whiPanel;
		}
	},
	
	/**
	 * by the checkboxs, the priroty is (1>2>3>4>5) 
	 * 1 zone 2 equipment 3 room 4 HAZMAT 5 egress
	 * @return  1--5 , 
	 *          specific value (  -1 : means any checkboxs are not checked ) 
	 */
	getShowWhichDetailPanel:function(){
		var zoneValues = ["ZONE-FIRE", "ZONE-SPRINKLER", "ZONE-SECURITY", "ZONE-HVAC", "ZONE-EMERGENCY"];
		var radioValue = getSelectedRadioButton("radio");
		
		for (var i = 0; i < zoneValues.length; i++) {
			if (radioValue == zoneValues[i]) {
				return 1;
			}
		}
		
    	if (radioValue == "EQ") {
			return 2;
		}
		
		if (radioValue == "RM") {
			return 3;
		}
		
		if (radioValue == "REG-HAZMAT") {
			return 4;
		}
		
		if (radioValue == "REG-EGRESS") {
			return 5;
		}
		
		return -1; //no checkbox is checked.
	},
	/**
	 * show the details panel by user selection
	 * @param {boolean} p1 -- show reg details grid 
	 * @param {boolean} p2 -- show zone details grid 
	 * @param {boolean} p3 -- show room details grid 
	 * @param {boolean} p4 -- show equipment details grid 
	 */
	showPanelDetail: function(p1, p2, p3, p4){
		this.abSystemZone_regdetailGrid.show(p1);
		this.abSystemZone_zonedetailGrid.show(p2);
		this.abSystemZone_rmdetailGrid.show(p3);
		this.abSystemZone_eqdetailGrid.show(p4);
	}, 
	
	showRoomDetailStatusMenu: function(e, item) {
		var index = this.ds_ab_systems_and_zones_highlt_grid_rm.fieldDefs.indexOfKey('rm.recovery_status');
		var enumValues = this.ds_ab_systems_and_zones_highlt_grid_rm.fieldDefs.items[index].enumValues;

		var menuItems = [];
		for (var name in enumValues) {
			menuItems.push({
				text: enumValues[name],
				handler: this.onChangeRoomStatus.createDelegate(this, [name])
			});
		}
		
		var menu = new Ext.menu.Menu({
            items: menuItems
        });
		
        menu.showAt(e.getXY());
   },
    
   onChangeRoomStatus: function(menuItemId) {
	   var selectedRecords = this.abSystemZone_rmdetailGrid.getSelectedRecords();
	   
	   if (selectedRecords.length < 1) {
			View.showMessage(getMessage('noRecordsSelected'));
   		return;
	   }
	   
	   for (var i = 0; i < selectedRecords.length; i++) {
		   selectedRecords[i].setValue("rm.recovery_status", menuItemId);
	   }
	   
	   try {
		   Workflow.callMethod("AbRiskEmergencyPreparedness-EPCommonService-updateRoomRecoveryStatus", selectedRecords, menuItemId);
		   this.abSystemZone_rmdetailGrid.refresh();
	   } catch (e) {
		   Workflow.handleError(e);
	   }
   },
   
   showEquipmentDetailStatusMenu: function(e, item) {
	   var index = this.ds_ab_systems_and_zones_highlt_grid_eq.fieldDefs.indexOfKey('eq.recovery_status');
	   var enumValues = this.ds_ab_systems_and_zones_highlt_grid_eq.fieldDefs.items[index].enumValues;

	   var menuItems = [];
	   for (var name in enumValues) {
		   menuItems.push({
			   text: enumValues[name],
			   handler: this.onChangeEquipmentStatus.createDelegate(this, [name])
		   });
	   }

	   var menu = new Ext.menu.Menu({
		   items: menuItems
	   });

	   menu.showAt(e.getXY());
   },
   
   onChangeEquipmentStatus: function(menuItemId) {
	   var selectedRecords = this.abSystemZone_eqdetailGrid.getSelectedRecords();
	   
	   if (selectedRecords.length < 1) {
			View.showMessage(getMessage('noRecordsSelected'));
    		return;
	   }
	   
	   for (var i = 0; i < selectedRecords.length; i++) {
		   selectedRecords[i].setValue("eq.recovery_status", menuItemId);
	   }
	   
	   try {
		   Workflow.callMethod("AbRiskEmergencyPreparedness-EPCommonService-updateEquipmentRecoveryStatus", selectedRecords, menuItemId);
		   this.abSystemZone_eqdetailGrid.refresh();
	   } catch (e) {
		   Workflow.handleError(e);
	   }
   }
});

var opts = '';
var buildingId = 'HQ';
var floorId = '15';
var roomId = '';
var radioButton = 'REG-EGRESS'
var title = '';


function showDrawing(){

    var drawingPanel = View.panels.get('abSystemAndZone_DrawingPanel');
    var flGrid = View.panels.get('abEpHighltSystemAndZones_grid_fl');
    buildingId = flGrid.rows[flGrid.selectedRowIndex]["fl.bl_id"];
    floorId = flGrid.rows[flGrid.selectedRowIndex]["fl.fl_id"];
    
    title = String.format(getMessage('drawingPanelTitle1') + "  " + buildingId + "-" + floorId);
    
    //add the suffix
    opts = new DwgOpts();
    opts.backgroundSuffix = '-alternate';
    opts.backgroundSuffix = '-fire';
    
	var whiPanel = controller.getShowWhichDetailPanel();
	
	if (drawingPanel.initialized) {
		drawingPanel.clear();
	}
	var radioValue = getSelectedRadioButton('radio');
	
    View.dataSources.get('abSystemZones_drawing_zoneHighlight').addParameter('drawingLayer', radioValue);
  
	//zone
    if (whiPanel == 1){
		switch (radioValue){
			case 'ZONE-FIRE':
				title = String.format(getMessage('drawingPanelTitle11') + "  " + buildingId + "-" + floorId);
			 	addDrawingByType('-fire', 'zone', null, "abSystemZones_drawing_zoneHighlight", "abSystemZones_drawing_zoneLabel");
				break;
			case 'ZONE-SPRINKLER':
				title = String.format(getMessage('drawingPanelTitle12') + "  " + buildingId + "-" + floorId);
				addDrawingByType('-sprinkler', 'zone', null, "abSystemZones_drawing_zoneHighlight", "abSystemZones_drawing_zoneLabel");
			    break;
			case 'ZONE-SECURITY':
				title = String.format(getMessage('drawingPanelTitle13') + "  " + buildingId + "-" + floorId);
				addDrawingByType('-security', 'zone', null, "abSystemZones_drawing_zoneHighlight", "abSystemZones_drawing_zoneLabel");
				break;
			case 'ZONE-HVAC':
				title = String.format(getMessage('drawingPanelTitle14') + "  " + buildingId + "-" + floorId);
				addDrawingByType('-hvac', 'zone', null, "abSystemZones_drawing_zoneHighlight", "abSystemZones_drawing_zoneLabel");
				break;
			case 'ZONE-EMERGENCY':
				title = String.format(getMessage('drawingPanelTitle15') + "  " + buildingId + "-" + floorId);
				addDrawingByType('-emergency', 'zone', null, "abSystemZones_drawing_zoneHighlight", "abSystemZones_drawing_zoneLabel");
		}
	}
	//equipment
	if (whiPanel == 2){
		title = String.format(getMessage('drawingPanelTitle2') + "  " + buildingId + "-" + floorId);
		addDrawingByType(null, 'eq', null, 'abSystemZones_drawing_eqHighlight', 'abSystemZones_drawing_eqLabel');
	}
    //room
	if (whiPanel == 3){
		title = String.format(getMessage('drawingPanelTitle3') + "  " + buildingId + "-" + floorId);
		addDrawingByType(null, 'rm', null, 'abSystemZones_drawing_rmHighlight', 'abSystemZones_drawing_rmLabel');
	}
	
	//hazard
	if (whiPanel == 4) {
		title = String.format(getMessage('drawingPanelTitle4') + "  " + buildingId + "-" + floorId);
		View.dataSources.get('abSystemZones_drawing_regcomplianceHighlight').addParameter('regulationer', 'HAZMAT');
		addDrawingByType('-hazmat', 'regcompliance', null, "abSystemZones_drawing_regcomplianceHighlight", "abSystemZones_drawing_regcomplianceLabel")
	}
	
	// reg-egress
	if (whiPanel == 5) {
		title = String.format(getMessage('drawingPanelTitle5') + "  " + buildingId + "-" + floorId);
		View.dataSources.get('abSystemZones_drawing_regcomplianceHighlight').addParameter('regulationer', 'Egress');
		addDrawingByType('-egress', 'regcompliance', null, "abSystemZones_drawing_regcomplianceHighlight", "abSystemZones_drawing_regcomplianceLabel")
	}
    
    drawingPanel.appendInstruction("default", "", title);
    drawingPanel.processInstruction("default", "");
	
	controller.refreshDetailsPanel(buildingId,floorId,false);
}

/**
 * button for the select layer and assettype of the zone and recompliance
 */
function disPlayDrawing(){
	showDrawing();
}


/**
 * set the asset ,currentHighlightDS ,currentLabelsDS  and locate it to the json and swf file
 */
function addDrawingByType(assetTypesSuffix, tablename, backgroundSuffix, currentHighlightDS, currentLabelsDS){
    var drawingPanel = View.panels.get('abSystemAndZone_DrawingPanel');
    
    var opts = new DwgOpts();
    var restriction = new Ab.view.Restriction();
    var assetType = tablename;

    restriction.addClause(tablename + '.bl_id', buildingId, '=');
    restriction.addClause(tablename + '.fl_id', floorId, '=');
	
	if (drawingPanel.initialized) {
		drawingPanel.clear();
	}
	
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
    drawingPanel.addDrawing.defer(200, drawingPanel, [restriction, opts]);
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

