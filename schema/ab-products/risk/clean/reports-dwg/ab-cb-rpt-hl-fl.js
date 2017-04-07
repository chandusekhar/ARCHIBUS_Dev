var abCbRptHlFlController = View.createController('abCbRptHlFlCtrl',{
	filterController: null,

	pagRepRestriction: null,
	printableRestriction: null,
	defaultPagRepRestriction: "(EXISTS(SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND rm.dwgname IS NOT NULL)"
			+ " OR activity_log.dwgname IS NOT NULL)"
			+ " AND activity_log.project_id IS NOT NULL"
			+ " AND EXISTS(SELECT 1 FROM project WHERE project.project_id = activity_log.project_id AND project.project_type='ASSESSMENT - HAZMAT' AND project.is_template = 0)",
		
	selectedFloors: new Array(),
	
	paginatedReportName: 'ab-cb-rpt-hl-bl-rm-pgrp.axvw',
	
    afterViewLoad: function(){

		this.pagRepRestriction = this.defaultPagRepRestriction;
        	
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "proj";
		
		// set message parameter for abCbRptHlFl_gridFloor panel
		this.abCbRptHlFl_gridFloor.addParameter('noDrawing',getMessage('noDrawing'));

		this.abCbRptHlFl_gridFloor.addEventListener('onMultipleSelectionChange', 'abCbRptHlFl_showRep');

		this.abCbRptHlFl_drawingPanel.setDiagonalSelectionPattern(true);
		// add onMultipel selection change event listener
		this.abCbRptHlFl_gridRep.addEventListener('onMultipleSelectionChange', abCbRptHazBlMapDrilldown_itemsDetails_onMultipleSelectionChange);
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.abCbRptHlFl_drawingPanel.addEventListener('onclick', onClickHandler);
    	this.abCbRptHlFl_drawingPanel.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);        
    },
    
    abCbRptHlFl_gridFloor_afterRefresh: function(){
		this.abCbRptHlFl_gridFloor.enableSelectAll(false);
    },

    abCbRptHlFl_gridRep_afterRefresh: function(){
		this.abCbRptHlFl_gridRep.enableSelectAll(false);
    },
    
    abCbRptHlFl_drawingPanel_onPaginatedReport: function() {

        var floorsRestriction = [];
        var floors = [];
        
        if(this.selectedFloors.length > 0){        
            for (var i = 0; i < this.selectedFloors.length; i++) {
                floors.push(this.selectedFloors[i].getValue('rm.dwgname'));
            }        
            floorsRestriction.push({'title': getMessage("floors"), 'value': floors.join(", ")});
        }
        else return;

        this.printableRestriction = this.filterController.printableRestriction;
    
    	var parameters = {
			'consoleRestriction': this.filterController.getConsoleRestriction(),
			'userAssignedRestriction': this.getFloorsRestriction(),
			'printRestriction': true, 
			'printableRestriction': this.printableRestriction.concat(floorsRestriction)
    	};

    	View.openPaginatedReportDialog(this.paginatedReportName, null, parameters);    	
    },
    
    getFloorsRestriction: function() {
    	var floorsRestriction = "";
    	for (var i = 0; i < this.selectedFloors.length; i++) {
            var blId = this.selectedFloors[i].getValue('rm.bl_id');
            var flId = this.selectedFloors[i].getValue('rm.fl_id');

            floorsRestriction += (i == 0) ? "(" : " OR ";
            floorsRestriction += " (activity_log.bl_id = '" + blId + "' AND activity_log.fl_id = '" + flId + "')";
            
            if (i == (this.selectedFloors.length - 1))
            	floorsRestriction += ")";
        }
    	
    	return floorsRestriction;
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
        	if (!showDrawing) {
        		this.abCbRptHlFl_drawingPanel.clear();
                this.abCbRptHazBlMapDrilldown_legendGrid.show(false);
                this.abCbRptHazBlMapDrilldown_borderLegendGrid.show(false);
            }
       	}
        this.abCbRptHlFl_gridRep.show(showRep);
    }
});

/**
 *  show rooms and drawing for selected floor
 * @param {Object} row Selected floor
 */
function abCbRptHlFl_showRep(row){
	var controller = View.controllers.get('abCbRptHlFlCtrl');
    var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
    var gridRep = View.panels.get('abCbRptHlFl_gridRep');
    
    controller.selectedFloors = View.panels.get('abCbRptHlFl_gridFloor').getSelectedRecords();
	
	if(controller.selectedFloors.length == 0){
	    controller.showPanels(false, false);
	    return;
	}
	
	controller.showPanels(true, true);
	
    var dwgRestr = controller.filterController.restriction ? controller.filterController.restriction : "1=1";
    controller.abCbRptHlFl_gridRep.addParameter("consoleRestriction", dwgRestr);
	var floorsRestriction = controller.getFloorsRestriction();    
    controller.abCbRptHlFl_gridRep.refresh(floorsRestriction);

    dwgRestr += " AND " + floorsRestriction;

	controller.pagRepRestriction = controller.defaultPagRepRestriction + " AND " + dwgRestr;
    
	controller.abCbRptHazBlMapDrilldown_highlightDs.addParameter('consoleRestriction', dwgRestr);
	controller.abCbRptHazBlMapDrilldown_highlightRankDs.addParameter('consoleRestriction', dwgRestr);
	controller.abCbRptHazBlMapDrilldown_highlightRatingDs.addParameter('consoleRestriction', dwgRestr);
    
	var dwgName = row.row.getFieldValue("rm.raw_dwgname");
    if (valueExistsNotEmpty(dwgName)){
        dwgPanel.addDrawing(row, null);
		dwgPanel.isLoadDrawing = true;
        
        /*
    	var recsToHighlight = gridRep.gridRows.items;   	
    	var parameters = gridRep.getParametersForRefresh();
    	parameters.recordLimit = -1;
    	var recsToHighlight = gridRep.getData(parameters).data.records;
    	setDwgHighlightMultipleDrawings.defer(200, this, [dwgPanel, recsToHighlight, null, controller.selectedFloors]);
        */
    }

}

/**
 * highlight selected items on dwg
 * @param {Object} panel - Drawing panel
 * @param {Object} items - selected items
 * @param {Object} color The color of the highlight
 */
function setDwgHighlightMultipleDrawings(dwgPanel, items, color){
	dwgPanel.setSelectColor((color ? color : 0xFFFF00));	// yellow by default

	for (var j = 0; j < abCbRptHlFlController.selectedFloors.length; j++) {
		var floor = abCbRptHlFlController.selectedFloors[j];
		var dwgName = floor.getValue("rm.raw_dwgname");
		if (valueExistsNotEmpty(dwgName)) {
			var opts = new DwgOpts();
			opts.rawDwgName = dwgName;
		    for (var i = 0; i < items.length; i++) {
		    	var vals = items[i].record ? items[i].record : items[i];
		    	
		    	if(vals['activity_log.bl_id'] == floor.getValue("rm.bl_id")
		    			&& vals['activity_log.fl_id'] == floor.getValue("rm.fl_id")){
			    	var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];
			    	opts.appendRec(id);
		    	}
		    }
			
			if(j == 0){
				showDwgToolbar(true,dwgPanel);
			}
			
		    dwgPanel.highlightAssets(opts);
		}
	}

	items = null;
}

/**
 * OnClick event handler for drawing
 * @param pkey
 * @param selected
 */
function onClickHandler(pkey, selected){
	var objDetailsGrid = View.panels.get("abCbRptHlFl_gridRep");
	
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
	var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
	var controller = View.controllers.get("abCbRptHlFlCtrl");
	
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
	} else if(!existsSelectedItemInSameRoom(controller.abCbRptHlFl_gridRep, row.row, 'rm')){
		var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
		dwgPanel.unselectAssets(roomArray);
		//dwgPanel.highlightAssets(null, row);
	}
}

function onExportDocxReport(panel, pagRepName){
	var controller = View.controllers.get("abCbRptHlFlCtrl");
	var floorsRestriction = [];
	var floors = [];
	
	if(controller.selectedFloors.length > 0){        
    	for (var i = 0; i < controller.selectedFloors.length; i++) {
            floors.push(controller.selectedFloors[i].getValue('rm.dwgname'));
        }        
		floorsRestriction.push({'title': getMessage("floors"), 'value': floors.join(", ")});
	}

	controller.printableRestriction = controller.filterController.printableRestriction;
	
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
	var dwgPanel = View.panels.get('abCbRptHlFl_drawingPanel');
	if (dwgPanel.isLoadDrawing && type == 'highlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_legendGrid').config.title = View.dataSources.get(dwgPanel.currentHighlightDS).title;
	}
	
	if (dwgPanel.isLoadDrawing && type == 'bordersHighlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_borderLegendGrid').config.title = View.dataSources.get(dwgPanel.currentBordersHighlightDS).title;
	}
}