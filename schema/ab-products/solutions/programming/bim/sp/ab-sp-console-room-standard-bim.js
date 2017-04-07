
/**
 * The controller for room standard tab
 * @author heqiang
 */
var roomStandardController = View.createController('roomStandardController', {
	
	/**
	 * The current mode the application handles.
	 */
	mode:'',
	
    /**
     * Location and occupancy restrictions applied from the filter panel.
     * This is custom filter use only for current Rmstd tab.
     */
    rmFilter: null,
    
    /**
     * As a sign to distinguish odd click or even click. 
     */
    toggle: {},
	
	/**
     * Maps DOM events to controller methods.
     */
    events: {
        'click #roomStandardRestrictToLocation': function() {
            this.onCheckEvent();
        }
    },
	
	/**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:rmStdFilter', this.refresh);
        this.on('app:space:express:console:changeMode', this.changeMode);
        this.on('app:space:express:console:openRoomStandardTab', this.openRoomStandardTab);
    },
    
    /**
     * Insert filter checkbox in afterviewload callback.
     */
    afterViewLoad: function() {
    	var template = _.template('<td class="checkbox-container" id="roomStandardRestriction"><input type="checkbox" id="roomStandardRestrictToLocation" checked="false"/><span id="roomStandardResMessageSpan">{{restrictToLocation}}</span></td>');
        Ext.DomHelper.insertHtml('afterBegin', this.roomStandardGrid.toolbar.tr, template(View.messages));
        Ext.fly('roomStandardRestriction').setDisplayed(false);
      //  this.roomStandardGrid.setColorOpacity(this.drawingPanel.getFillOpacity());
    },
    
    /**
     * Applies the filter restriction to room standard grid.
     */
    refresh: function(filter) {
        if (filter) {
    		//use custom filter rmFilter replace common filter.
            this.rmFilter =  jQuery.extend(true, {}, filter);
    		//set custom parameter with different table name.
    		var rmExists = " AND rm.bl_id ${sql.concat} rm.fl_id ${sql.concat} rm.rm_id is not null ";
    		if (filter.parameters["typeUnassigned"].indexOf("IS NULL")!=-1 || filter.parameters["organizationUnassigned"].indexOf("IS NULL")!=-1) {
    			this.rmFilter.parameters["typeUnassigned"] = filter.parameters["typeUnassigned"]+rmExists;
    		}
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.rmFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter();
    		}
        }
    	abSpConsole_refreshDataFromFilter(this.roomStandardGrid, this.rmFilter, null);
     	abSpConsole_toggleFromFilter('roomStandardRestrictToLocation', ['roomStandardRestriction'], 'roomStandardResMessageSpan', 
     			this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
    },
    
    /**
     * grid afterRefresh
     */
    roomStandardGrid_afterRefresh: function() {
    	jQuery("#grid_roomStandardGrid_body tr").each(function() {
    		if (jQuery(this).find("td:eq(0)").text() == "") {
    	    	//set the line default empty string value to 'Unassigned'.
    			jQuery(this).find("td:eq(0)").text(getMessage("titleUnassigned"));
    			
    			//hide the assign button of unassigned row after grid refresh. 
    			jQuery(this).find("input[id*='_assignRoomStandard']").hide();
    			jQuery(this).find("input[id*='editRoomStd']").hide();
    		}
    	});
    },
    
    /**
     * Save the current mode when switch.
     */
    changeMode: function(mode) {
    	this.mode = mode;
    },
    
    /**
     * Handles the event when click the gear icon's 'showRoomStandard' button.
     */
    openRoomStandardTab: function(action) {
		if (action.checked) {
			this.trigger('app:space:express:console:changeRoomStandardStatus', '1');
			this.attributeTabs.showTab('roomStandardTab');
    		this.attributeTabs.selectTab('roomStandardTab');
		} else {
			this.trigger('app:space:express:console:changeRoomStandardStatus', '0');
			this.attributeTabs.hideTab('roomStandardTab');
			this.attributeTabs.selectTab('departmentsTab');
		}
    },
    
    /**
     * Calculate the area before save the form.
     */
    roomStandardDetailPanel_beforeSave: function() {
    	var form=this.roomStandardDetailPanel;
        if (form) {
        	var width = form.getFieldValue("rmstd.width");
        	var length = form.getFieldValue("rmstd.length");
        	var area = width * length;
        	form.setFieldValue("rmstd.std_area",area.toFixed(2));
        }
    },
    
    /**
     * Handles the checkbox check and uncheck events.
     */
    onCheckEvent: function() {
    	abSpConsole_toggleFromCheckEvent('roomStandardRestrictToLocation', ['roomStandardRestriction'], 'roomStandardResMessageSpan', 
    			this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
    	abSpConsole_refreshDataFromCheckEvent('roomStandardRestrictToLocation', this.roomStandardGrid, this.rmFilter, null);
    },
    
    /**
     * Assign room standard to rooms.
     */
    roomStandardGrid_onAssignRoomStandard: function() {
    	var row = this.roomStandardGrid.rows[this.roomStandardGrid.selectedRowIndex];
    	this.trigger('app:space:express:console:beginAssignment',{
    		type:'standard',
    		rm_std:row['rm.rm_std']
    	});
    },
    
    /**
     * Commit the assignment of room standard to rooms.
     */
    roomstdPendingAssignmentPanel_onCommitRoomStdPendingAssignments: function() {
    	this.trigger('app:space:express:console:commitAssignment');
    },
    
    /**
     * Delete the room standard assignment
     */
    roomstdPendingAssignmentPanel_onRemoveRoomStdPendingAssignment: function(row) {
    	this.trigger('app:space:express:console:removeAssignment', {
    		bl_id: row.getFieldValue('rm.bl_id'),
    		fl_id: row.getFieldValue('rm.fl_id'),
    		rm_id: row.getFieldValue('rm.rm_id'),
    		rm_std: row.getFieldValue('rm.assigned_rm_std')
    	});
    },
    
    /**
     * Cancel the room standard assignments.
     */
    roomstdPendingAssignmentPanel_onCancelRoomStdPendingAssignments: function() {
    	this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * set the fieldDefs[0] defaultValue value 'unassigned' before export.
     */
    roomStandardGrid_beforeExportReport: function(panel, fieldDefs) {
    	fieldDefs[0].defaultValue = getMessage("titleUnassigned");
    	fieldDefs[0].showDefaultValue = true;
    	return fieldDefs;
    }
});

/**
 * Open edit window for room standard.
 */
function editRoomStandard() {
	var gridPanel = View.panels.get('roomStandardGrid');
	var panel = View.panels.get('roomStandardDetailPanel');
	var rowIndex = gridPanel.rows[gridPanel.selectedRowIndex];
	var rm_std = '';
	if (rowIndex) {
		rm_std = rowIndex['rm.rm_std'];
	}
	var restriction = new Ab.view.Restriction();
    restriction.addClause('rmstd.rm_std',rm_std);
    panel.showInWindow({
		newRecord: false,
		width: 880,
		height: 300,
		restriction:restriction,
        title: getMessage("editRoomStandard"),
        closeButton: false
	});
}

/**
 * Make use of the rmstd to filter the drawing panel.
 */
function filterDrawingByRoomStd() {
	var gridPanel = View.panels.get('roomStandardGrid');
	var rowIndex = gridPanel.rows[gridPanel.selectedRowIndex];
	var rm_std  = rowIndex['rm.rm_std'];
	if (roomStandardController.toggle.clicked_rm_std && roomStandardController.toggle.clicked_rm_std == rm_std) {
		if (roomStandardController.toggle.sign == "even" ) {
			roomStandardController.rmFilter.parameters['rm_std'] = " rm.rm_std = '"+rm_std+"'";
			roomStandardController.toggle.sign = "odd";
		} else {
			roomStandardController.rmFilter.parameters['rm_std'] = " 1=1 ";
			roomStandardController.toggle.sign = "even";
		}
	} else {
		roomStandardController.toggle.sign = "odd";
		roomStandardController.toggle.clicked_rm_std = rm_std;
		roomStandardController.rmFilter.parameters['rm_std'] = " rm.rm_std = '"+rm_std+"'";
	}
	roomStandardController.trigger('app:space:express:console:refreshDrawing', roomStandardController.rmFilter);
}

/**
 * Export in XLS format.
 */
function exportRoomStandardToXLS() {
	doRoomStandardCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * Export in docx format.
 */
function exportRoomStandardToDOCX() {
	doRoomStandardCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doRoomStandardCustomExport(workflowRuleName, outputType) {
	
	var roomStandardGrid = View.panels.get("roomStandardGrid");
	var hasRes = Ext.getDom('roomStandardRestrictToLocation').checked ? true: false;
	var parameters = hasRes ? roomStandardGrid.getParametersForRefresh(): {};
	
	var restriction = roomStandardController.rmFilter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, hasRes);
	
	parameters.printRestriction = hasRes;
	parameters.printableRestriction = printableRestrictions;
	parameters.showTotals = roomStandardGrid.getParametersForRefresh().showTotals;
	parameters.showCounts = roomStandardGrid.getParametersForRefresh().showCounts;
	
	var jobId = '';
	var roomStdReport = getMessage("roomStdReport");
	if (outputType == 'xls') {
		jobId = roomStandardGrid.callXLSReportJob(roomStdReport,'',parameters);
	} else {
		jobId = roomStandardGrid.callDOCXReportJob(roomStdReport,'',parameters);
	}
	//get and open reported URL
	doExportPanel(jobId, outputType);
}
