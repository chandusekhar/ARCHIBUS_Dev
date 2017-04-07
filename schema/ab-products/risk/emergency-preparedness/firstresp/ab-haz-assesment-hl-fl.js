var abHazmatAssessmentController = View.createController('abHazmatAssessmentCtrl',{
	blId: null,
	filterController: null,	
	selectedFloors: new Array(),
	showBy: 'rank',
	
    afterViewLoad: function(){    	 
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "proj"; 
    	// not applicable 
    	this.abCbRptCommonFilter_console.actions.get("abCbRptCommonFilter_paginatedReport").show(false);	 
    	
    	if (this.checkLicense()) {
    		this.setConsoleFields()
    		// set message parameter for abCbRptHlFl_gridFloor panel
			this.abCbRptHlFl_gridFloor.addParameter('noDrawing',getMessage('noDrawing'));

			this.abCbRptHlFl_gridFloor.addEventListener('onMultipleSelectionChange', 'abCbRptHlFl_showRep');  
			// highlight in the displayed drawing, a room selected from a grid
			var controller = this;
			this.abCbRptHlFl_gridRep.addEventListener('onMultipleSelectionChange', function(row) {
				var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
				var items = [row.row];
				// yellow if the row is selected or if there is another selected item for this item's room
				var color = row.row.isSelected() ? 0xFFFF00 : null;
				
				setDwgHighlightMultipleDrawings(dwgPanel, items, color, controller.showBy);				
				// || existsSelectedItemInSameRoom(controller.abCbRptHlFl_gridRep, row.row)
		    });		
    	}
    }, 
    
    abCbRptCommonFilter_console_onClear: function() {
    	this.setConsoleFields();
    },
    
    checkLicense: function() {
    	var filterButton = this.abCbRptCommonFilter_console.actions.get("filter");		
    	filterButton.show(false);
		try {
			var result = Workflow.callMethod("AbRiskCleanBuilding-CleanBuildingService-isActivityLicense", "AbRiskCleanBuilding");
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    if (result.value) {
	    	filterButton.show(true);
	    	return true;
	    } else {
	    	View.showMessage(getMessage("msg_no_license"));
	    	return false;
	    } 
    },
    
    afterInitialDataFetch: function(){
    	this.setConsoleFields();
		// refresh filter settings
    	this.filterController.abCbRptCommonFilter_console_onFilter();
    }, 
    
    abCbRptHlFl_gridFloor_afterRefresh: function(){
		this.abCbRptHlFl_gridFloor.enableSelectAll(false);
    },     
    
    setConsoleFields: function() {
    	// set default
    	this.abCbRptCommonFilter_console.setFieldValue("hcm_is_hazard_or1", "Yes");
    	this.abCbRptCommonFilter_console.setFieldValue("hcm_is_hazard_or2", "Presumed");
    	// make read only
    	this.abCbRptCommonFilter_console.enableField("hcm_is_hazard_or1", false);
    	this.abCbRptCommonFilter_console.enableField("hcm_is_hazard_or2", false);  
    },
    
    abCbRptHlFl_drawingPanel_onShowByRank: function() {
    	this.showBy = 'rank';  
    	this.refreshHighlights();
    	
    },
    
    abCbRptHlFl_drawingPanel_onShowByRating: function() {
    	this.showBy = 'rating';   	
    	this.refreshHighlights();
    },
    
    refreshHighlights: function() {
    	// var recsToHighlight = this.abCbRptHlFl_gridRep.gridRows.items;    	
    	var parameters = this.abCbRptHlFl_gridRep.getParametersForRefresh();
    	parameters.recordLimit = -1; 
    	
    	var recsToHighlight = this.abCbRptHlFl_gridRep.getData(parameters).data.records;        	
    	var selectedRows = this.abCbRptHlFl_gridRep.getSelectedRows();
    	
    	setDwgHighlightMultipleDrawings(this.abCbRptHlFl_drawingPanel, recsToHighlight, null, this.showBy, selectedRows); 
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHlFl_gridFloor.addParameter('consoleRestriction', restriction);
        this.abCbRptHlFl_gridFloor.refresh();
        this.showPanels(false, false);
	},	 

	/**
	 * show/ hide panels
	 * @param {boolean} showDrawing
	 * @param {boolean} showRep
	 */
    showPanels: function(showDrawing, showRep){
		if (valueExists(FABridge.abDrawing)) {
        	showDwgToolbar(showDrawing, this.abCbRptHlFl_drawingPanel);
        	if (!showDrawing)
        		this.abCbRptHlFl_drawingPanel.clear();
       	}
        this.abCbRptHlFl_gridRep.show(showRep);         
    },
    
    abCbRptHlFl_gridRep_afterRefresh: function() {
    	this.abCbRptHlFl_gridRep.gridRows.each(function(row) {
			var rank = row.getFieldValue("cb_hazard_rank.hpattern_acad");		
			var color = gAcadColorMgr.getRGBFromPatternForGrid(rank, true);
			if (color != "-1") { 
				var cell = row.cells.get("activity_log.hcm_haz_rank_id");
				Ext.get(cell.dom).setStyle('background-color', '#'+color);
				if (isDark(color)) {
					Ext.get(cell.dom).setStyle('color', '#FFFFFF');
				}
			}
			 
			var rating = row.getFieldValue("cb_hazard_rating.hpattern_acad");	
			color = gAcadColorMgr.getRGBFromPatternForGrid(rating, true);
			if (color != "-1") { 
				var cell = row.cells.get("activity_log.hcm_haz_rating_id");
				Ext.get(cell.dom).setStyle('background-color', '#'+color);
				if (isDark(color)) {
					Ext.get(cell.dom).setStyle('color', '#FFFFFF');
				}				
			}
			  
		}); 
    }
    
	
});

/**
 *  show rooms and drawing for selected floor
 * @param {Object} row Selected floor
 */
function abCbRptHlFl_showRep(row){
	var controller = View.controllers.get('abHazmatAssessmentCtrl');
    var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
    var gridRep = View.panels.get('abCbRptHlFl_gridRep');
    
    controller.selectedFloors = View.panels.get('abCbRptHlFl_gridFloor').getSelectedRecords();
	
	if(controller.selectedFloors.length == 0){
	    controller.showPanels(false, false);
	    return;
	}
	
	var floorsRestriction = "";
    for (var i = 0; i < controller.selectedFloors.length; i++) {
        var blId = controller.selectedFloors[i].getValue('rm.bl_id');
        var flId = controller.selectedFloors[i].getValue('rm.fl_id');

        floorsRestriction += (i == 0) ? "(" : " OR ";
        floorsRestriction += " (activity_log.bl_id = '" + blId + "' AND activity_log.fl_id = '" + flId + "')";
        
        if(i == (controller.selectedFloors.length - 1))
        	floorsRestriction += ")";
    } 
    
	controller.showPanels(true, true);
	
    controller.abCbRptHlFl_gridRep.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlFl_gridRep.refresh(floorsRestriction);

	var dwgName = row.row.getFieldValue("rm.raw_dwgname");
	
    if (valueExistsNotEmpty(dwgName)){ 
    	       
        dwgPanel.addDrawing(row, null);
    	var recsToHighlight = gridRep.gridRows.items;
    	
    	var parameters = gridRep.getParametersForRefresh();
    	parameters.recordLimit = -1; 
    	
    	var recsToHighlight = gridRep.getData(parameters).data.records;    	
    	    	
    	setDwgHighlightMultipleDrawings.defer(200, this, [dwgPanel, recsToHighlight, null, controller.showBy]);    
    }

} 
 

/**
 * Highlight selected items on dwg
 * @param {Object} panel - Drawing panel
 * @param {Object} items - selected items
 * @param {Object} color The color of the highlight
 */
function setDwgHighlightMultipleDrawings(dwgPanel, items, defaultColor, showBy, selectedItems){
	// dwgPanel.setSelectColor((color ? color : 0xFFFF00));	// yellow by default 
	
	var gridRep = View.panels.get('abCbRptHlFl_gridRep');
 
	for (var j = 0; j < abHazmatAssessmentController.selectedFloors.length; j++) {
		var floor = abHazmatAssessmentController.selectedFloors[j];
		var dwgName = floor.getValue("rm.raw_dwgname");
		
		var floorId = floor.getValue("rm.fl_id");
		var buildingId = floor.getValue("rm.bl_id");
				
		if (valueExistsNotEmpty(dwgName)) {
			var opts = new DwgOpts();
			opts.rawDwgName = dwgName;
			
			var valueLevels = {};
			
		    for (var i = 0; i < items.length; i++) {
		    	var vals = items[i].record ? items[i].record : items[i]; 
		    	
		    	if(vals['activity_log.bl_id'] == floor.getValue("rm.bl_id")
		    			&& vals['activity_log.fl_id'] == floor.getValue("rm.fl_id")){
			    	var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];  
			    	
			    	if (defaultColor != null) {
			    		// highlight room by checkbox
			    		var color = defaultColor;
			    	} else if (gridRep == null) {
			    	
			    	} else if (showBy == 'rank') {
			    		var rankPattern = vals['cb_hazard_rank.hpattern_acad'];	 
			    		var color = rankPattern == '' ? 0x999999 : getColorFromPattern(rankPattern); 
			    	} else if (showBy == 'rating') {
			    		var ratingPattern = vals['cb_hazard_rating.hpattern_acad'];	
			    		var color = ratingPattern == '' ? 0x999999 : getColorFromPattern(ratingPattern);  
			    	} else {
			    		// default color
			    		var color = 0xFFFF00;
			    	}  
			    	 
			    	var level = null;
			    	
			    	if (showBy == 'rank' && vals['activity_log.hcm_haz_rank_id'] != '') {
			    		level = vals['cb_hazard_rank.level_number'];  
			    	} else if (showBy == 'rating' && vals['activity_log.hcm_haz_rating_id'] != '') {
			    		level = vals['cb_hazard_rating.level_number'];
			    	}
			    	
			    	if (level != null ) {
			    		if (valueLevels[id] == undefined || level > valueLevels[id]) {
			    			valueLevels[id] = level;				    	 
				    	} else {
				    		// skip this record
				    		continue;
				    	}
			    	} 
			    	 
			    	if (color != undefined) {
			    		opts.appendRec(id, {fc : color});
			    	} else {
			    		opts.appendRec(id, {fc : 0x999999});
			    	}
			    	
		    	}
		    }  
		    
		    if (selectedItems != undefined) {
	    	   for (var i = 0; i < selectedItems.length; i++) {
			    	var vals = selectedItems[i];
			    	var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];  
			    	opts.appendRec(id, {fc : 0xFFFF00});
			   }
		    }		 
			 
			if (j == 0){
				showDwgToolbar(true, dwgPanel);
			}
     
			opts.mode = 'none';   //Required: 'none' instructs the Drawing Control to not force one of the logical colors.   
		    dwgPanel.highlightAssets(opts);
		}
	}

	items = null;
}

function getColorFromPattern(pattern) {
	// return as hex
	var color = gAcadColorMgr.getRGBFromPatternForGrid(pattern, true);
	if (color == "-1") { 
		color = gAcadColorMgr.getUnassignedColor(true); 
	}		 
	return parseInt('0x' + color);
}

function isDark(color) {
	 var rgb = parseInt(color, 16);   // convert rrggbb to decimal
	 var r = (rgb >> 16) & 0xff;  // extract red
	 var g = (rgb >>  8) & 0xff;  // extract green
	 var b = (rgb >>  0) & 0xff;  // extract blue

	 var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
	 
	 return (luma < 160);
}    
