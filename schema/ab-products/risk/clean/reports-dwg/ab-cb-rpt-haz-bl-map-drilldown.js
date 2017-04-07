var abCbRptHazBlMapDrilldownController = View.createController('abCbRptHazBlMapDrilldown', {
	blId: null,
	dwgnames: [],
	floors: [],
	pagRepRestriction: null,
	printableRestriction: null,
	defaultPagRepRestriction: "(EXISTS(SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND rm.dwgname IS NOT NULL)"
			+ " OR activity_log.dwgname IS NOT NULL)"
			+ " AND activity_log.project_id IS NOT NULL"
			+ " AND EXISTS(SELECT 1 FROM project WHERE project.project_id = activity_log.project_id AND project.project_type='ASSESSMENT - HAZMAT' AND project.is_template = 0)",
	
	openerController: View.getOpenerView().controllers.get('abCbRptHazBlMapCtrl'),
	
	afterViewLoad: function() {
		if (View.parameters && valueExistsNotEmpty(View.parameters.bl_id)) {
			this.blId = View.parameters.bl_id;
		}
		this.abCbRptHazBlMapDrilldown_cadPanel.setDiagonalSelectionPattern(true);
		// add onMultipel selection change event listener
		this.abCbRptHazBlMapDrilldown_itemsDetails.addEventListener('onMultipleSelectionChange', abCbRptHazBlMapDrilldown_itemsDetails_onMultipleSelectionChange);
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.abCbRptHazBlMapDrilldown_cadPanel.addEventListener('onclick', onClickHandler);
    	this.abCbRptHazBlMapDrilldown_cadPanel.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);
    	
	},
	
	afterInitialDataFetch: function() {
		var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";
		this.printableRestriction = null;
		
		var buildingPrintableRestriction=[];
		this.blId = this.openerController.blId;
		if (this.blId){
			restriction += " AND activity_log.bl_id = '" + this.blId + "'";
			buildingPrintableRestriction.push({'title': getMessage("buildings"), 'value': this.blId});
			this.printableRestriction = this.openerController.filterController.printableRestriction.concat(buildingPrintableRestriction);
		}else{
			this.printableRestriction = this.openerController.filterController.printableRestriction;
		}
		
		
		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;
		
		this.abCbRptHazBlMapDrilldown_floorsGrid.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
		
	},
	
	abCbRptHazBlMapDrilldown_floorsGrid_onShowFloors: function(row, action) {
		var record = row.getRecord();
		var bl_id = record.getValue('activity_log.bl_id');
		var fl_id = record.getValue('activity_log.fl_id');
		var dwgname = record.getValue('rm.dwgname');
		
		this.dwgnames.push(dwgname);
    	this.floors.push(fl_id);
		
		var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";
		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;
		var dwgRestr = " AND (CASE WHEN rm.dwgname IS NULL THEN activity_log.dwgname ELSE rm.dwgname END) IN ('" + this.dwgnames.join("','") + "')";
		restriction += dwgRestr;
		this.pagRepRestriction += dwgRestr.replace(/rm\.dwgname/g,
									"(SELECT rm.dwgname FROM rm"
									+ " WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id"
									+ ")");
		
		this.abCbRptHazBlMapDrilldown_highlightProjDs.addParameter('consoleRestriction', restriction);
		this.abCbRptHazBlMapDrilldown_highlightRankDs.addParameter('consoleRestriction', restriction);
		this.abCbRptHazBlMapDrilldown_highlightRatingDs.addParameter('consoleRestriction', restriction);
		var drawing = new Ab.drawing.DwgCtrlLoc(bl_id, fl_id, null, dwgname);
		this.abCbRptHazBlMapDrilldown_cadPanel.addDrawing(drawing, null);
		this.abCbRptHazBlMapDrilldown_cadPanel.isLoadDrawing = true;
		// change default select color
		this.abCbRptHazBlMapDrilldown_cadPanel.setSelectColor(0x990000);
		
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
 
	},
	
	abCbRptHazBlMapDrilldown_floorsGrid_onClearDrawings: function() {		
		var restriction = this.openerController.filterController.restriction ? this.openerController.filterController.restriction : "1=1";

		this.blId = this.openerController.blId;
		if (this.blId)
			restriction += " AND activity_log.bl_id = '" + this.blId + "'";

		this.pagRepRestriction = this.defaultPagRepRestriction + " AND " + restriction;

		
		this.abCbRptHazBlMapDrilldown_floorsGrid.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.refresh(restriction);
		this.abCbRptHazBlMapDrilldown_itemsDetails.setAllRowsSelected(false);
				
		this.dwgnames.length = 0;
		this.floors.length = 0;
		
		this.abCbRptHazBlMapDrilldown_cadPanel.clear();
		this.abCbRptHazBlMapDrilldown_legendGrid.clear();
	},
	
	abCbRptHazBlMapDrilldown_itemsDetails_afterRefresh: function(){
		this.abCbRptHazBlMapDrilldown_itemsDetails.enableSelectAll(false);
	}
	
});

/**
 * OnClick event handler for drawing
 * @param pkey
 * @param selected
 */
function onClickHandler(pkey, selected){
	var objDetailsGrid = View.panels.get("abCbRptHazBlMapDrilldown_itemsDetails");
	
	objDetailsGrid.gridRows.each(function(gridRow){
		if (gridRow.getFieldValue('rm.bl_id') == pkey[0] && gridRow.getFieldValue('rm.fl_id') == pkey[1] && gridRow.getFieldValue('rm.rm_id') == pkey[2]) {
			if (selected) {
				gridRow.select();
			} else {
				gridRow.unselect();
			}
			var suffix = selected ? " selected" : "";
			var cn = gridRow.dom.className;
			var j = 0;
			if ((j = cn.indexOf(" selected")) > 0)
				cn = cn.substr(0, j);
			gridRow.dom.className=cn + suffix;
		}
	});
}

/**
 * On Multiple selection change for item details grid panel.
 * @param row current row
 */
function abCbRptHazBlMapDrilldown_itemsDetails_onMultipleSelectionChange(row){
	var dwgPanel = View.panels.get('abCbRptHazBlMapDrilldown_cadPanel');
	var controller = View.controllers.get("abCbRptHazBlMapDrilldown");
	
	// setSelectColor() generates error if the drawing is not loaded
	if(!dwgPanel.dwgLoaded && row.row.isSelected()){
		dwgPanel.addDrawing(row, null);
		dwgPanel.isLoadDrawing = true;
	}
	
	// red if the row is selected or if there is another selected item for this item's room
	if(row.row.isSelected()) {
		
		var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
		//dwgPanel.setSelectColor(0xFF0000);	// red
		dwgPanel.selectAssets(roomArray);
		//dwgPanel.highlightAssets(null, row);
	} else if(!existsSelectedItemInSameRoom(controller.abCbRptHazBlMapDrilldown_itemsDetails, row.row, 'rm')){
		var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
		dwgPanel.unselectAssets(roomArray);
		//dwgPanel.highlightAssets(null, row);
	}
}


function onExportDocxReport(panel, pagRepName){
	var controller = View.controllers.get("abCbRptHazBlMapDrilldown");
	var floorsRestriction = [];
	
	if(controller.floors.length > 0){
		floorsRestriction.push({'title': getMessage("floors"), 'value': controller.floors.join(", ")});
	}
	
	var parameters = {
	        'consoleRestriction': controller.pagRepRestriction,
	        'printRestriction': true, 
	        'printableRestriction': controller.printableRestriction.concat(floorsRestriction)
	};
	
	View.openPaginatedReportDialog('ab-cb-assess-list-pgrpt.axvw', null, parameters);
}

/**
 * onchange event handler when select the highlight datasource
 * 
 * @param {string}  type
 */
function onChangeHighlightDS(type){
	var dwgPanel = View.panels.get('abCbRptHazBlMapDrilldown_cadPanel');
	if (dwgPanel.isLoadDrawing && type == 'highlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_legendGrid').config.title = View.dataSources.get(dwgPanel.currentHighlightDS).title;
	}
	
	if (dwgPanel.isLoadDrawing && type == 'bordersHighlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_borderLegendGrid').config.title = View.dataSources.get(dwgPanel.currentBordersHighlightDS).title;
	}
}