/**
 * Controller for the Rooms panel.
 */
var spaceExpressConsoleRooms = View.createController('spaceExpressConsoleRooms', {

    /**
     * location and occupancy restrictions applied from the filter panel.
     * this is custom filter use only for current Rm tab.
     */
    rmFilter: null,
    /**
     * Maps DOM events to controller methods.
     */
    events: {
        'click #roomsRestrictToLocation': function() {
            this.onCheckEvent();
        }
    },
    
    /**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:rmFilter', this.refresh);
    },

    /**
     * Sets the initial UI state.
     */
    afterViewLoad: function() {
    	this.on('app:bim:rooms:example:openSelectRoomPanel', this.openSelectRoomPanel);
        var template = _.template('<td class="checkbox-container" id="roomsRestriction"><input type="checkbox" id="roomsRestrictToLocation" checked="false"/><span id="roomsResMessageSpan">{{restrictToLocation}}</span></td>');
        Ext.DomHelper.insertHtml('afterBegin', this.roomsGrid.toolbar.tr, template(View.messages));
        Ext.fly('roomsRestriction').setDisplayed(false);
      //  this.roomsGrid.setColorOpacity(this.drawingPanel.getFillOpacity());
    },
    openSelectRoomPanel: function(restriction){
    	this.roomsGrid.refresh(restriction);
	},
	
    /**
     * Hide the grid panel title.
     */
    afterInitialDataFetch: function() {
		jQuery("#roomsGrid_title").hide();
    },
    
    /**
     * Applies the filter restriction to the locations list.
     */
    refresh: function(filter) {
        if (filter) {
    		//use custom filter rmFilter replace common filter.
            this.rmFilter =  jQuery.extend(true, {}, filter);
    		//set custom parameter with different table name.
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.rmFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter();
    		}
        
        }
        abSpConsole_refreshDataFromFilter(this.roomsGrid, this.rmFilter, null);
    	abSpConsole_toggleFromFilter('roomsRestrictToLocation', ['roomsRestriction'], 'roomsResMessageSpan', 
    			this.rmFilter.searchValuesString +  this.rmFilter.otherSearchValuesString);
    },

    /**
     * Refresh the restriction according to the checkbox status.
     */
    onCheckEvent: function() {
    	abSpConsole_toggleFromCheckEvent('roomsRestrictToLocation', ['roomsRestriction'], 'roomsResMessageSpan',
    			this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
    	abSpConsole_refreshDataFromCheckEvent('roomsRestrictToLocation', this.roomsGrid, this.rmFilter, null);
    },
    
    editSingleRoomDetailPanel_onSave: function() {
    	if (this.editSingleRoomDetailPanel.save()) {
    		this.roomsGrid.refresh();
    	}
    },

    /**
     * grid afterRefresh
     */
    roomsGrid_afterRefresh: function() {
		jQuery("#roomsGrid_indexRow").remove();
	}
});

/**
 * Highlights selected room on the drawing. Only highlights room that are located on visible floors.
 */
function locateRoom() {
	
	var thisController = View.controllers.get('spaceExpressConsoleRooms');
    var roomsGrid = View.panels.get('roomsGrid');
    var row = roomsGrid.rows[roomsGrid.selectedRowIndex];

    thisController.trigger('app:bim:example:selectRoom', row);
}

/**
 * Export in XLS format.
 */
function exportRoomToXLS() {
	doRoomCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT, 'xls');
}

/**
 * Export in docx format.
 */
function exportRoomToDOCX() {
	doRoomCustomExport(Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT, 'docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doRoomCustomExport(workflowRuleName, outputType) {
	
	var roomsGrid = View.panels.get("roomsGrid");
	var hasRes = Ext.getDom('roomsRestrictToLocation').checked ? true: false;
	var parameters = hasRes ? roomsGrid.getParametersForRefresh(): {};
	
	var restriction = spaceExpressConsoleRooms.rmFilter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, hasRes);
	parameters.printRestriction = hasRes;
	parameters.printableRestriction = printableRestrictions;
	parameters.categoryFields = getCategoryFieldsArray(roomsGrid, 'roomsDS');
	
	parameters.showTotals = roomsGrid.getParametersForRefresh().showTotals;
	parameters.showCounts = roomsGrid.getParametersForRefresh().showCounts;
	
	var jobId = '';
	var reprotName = getMessage("roomReport");
	if (outputType == 'xls') {
		jobId = roomsGrid.callXLSReportJob(reprotName,'',parameters);
	} else {
		jobId = roomsGrid.callDOCXReportJob(reprotName,'',parameters);
	}
	//get and open reported URL
	doExportPanel(jobId, outputType);
}

