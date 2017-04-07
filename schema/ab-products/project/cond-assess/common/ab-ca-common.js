
/**
 * get field id's for selected rows 
 * @param {Object} grid 
 * @param {Object} fieldName
 */
function getKeysForSelectedRows(grid, fieldName){
	var fieldIds = [];
	var selectedRecords = grid.getSelectedRecords();
    for (var i = 0; i < selectedRecords.length; i++) {
        var fieldId = selectedRecords[i].getValue(fieldName);
        fieldIds.push(fieldId);
    }
    return fieldIds;
}
/**
 * open report with selected project details
 * @param {Object} grid
 * @param {Object} field
 */
function showProjectDetails(grid, field){
	var selectedProjectIds = [];
	selectedProjectIds = getKeysForSelectedRows(grid, field);
	if(selectedProjectIds.length == 0){
		View.showMessage(getMessage('noProjectSelectedForDetails'));
		return;
	}
	var restriction =  new Ab.view.Restriction();
	restriction.addClause('project.project_id', selectedProjectIds, 'IN');
	View.openDialog('ab-ca-prj-rep-dataview.axvw', null, false, { 
	    width: 800, 
	    height: 600, 
	    closeButton: true,
		afterInitialDataFetch: function(dialogView){
			var dialogController = dialogView.controllers.get('repProjDataViewCtrl');
			dialogController.refreshReport(restriction);
		}
	});		
}
/**
 * read restriction as sql from restriction console
 * @param {Object} filterPanel
 */
function getConsoleRestrictionAsSql(filterPanel) {
	var restriction = ""; 

    var record = filterPanel.getRecord();
	var site_id = record.getValue('activity_log.site_id');
	var bl_id = record.getValue('activity_log.bl_id');
	var fl_id = record.getValue('activity_log.fl_id');
	var csi_id = record.getValue('activity_log.csi_id')

	if (valueExistsNotEmpty(site_id)) {
		restriction += ' AND ';
		restriction += "activity_log.site_id = '" + site_id + "'";
	}
	
	if (valueExistsNotEmpty(bl_id)) {
		restriction += ' AND ';
		restriction += "activity_log.bl_id = '" + bl_id + "'";
	}
	
	if (valueExistsNotEmpty(fl_id)) {
		restriction += ' AND ';
		restriction += "activity_log.fl_id = '" + fl_id + "'";
	}
	
	if (valueExistsNotEmpty(csi_id)) {
		restriction += ' AND ';
		restriction += "activity_log.csi_id = '" + csi_id + "'";
	}
	
	return restriction;
}

/**
 * Gets restriction for the Paginated Report :
 * projectIds
 * site_id
 * bl_id
 * fl_id
 * csi_id
 * @param {Object} projectsPanel The projects' panel
 * @param {Object} filterPanel The filter panel
 * @param {Object} prjSrcField  Source field for project id
 * @param {Object} prjDestField Destination field for project id , Optional
 */

function getRestrictionForPaginatedReport(projectsPanel, filterPanel, prjSrcField, prjDestField) {
	if(prjDestField == undefined){
		prjDestField = prjSrcField;
	}
	var restriction = new Ab.view.Restriction();
	var consoleRestriction = filterPanel.getRecord().toRestriction();
	var selectedProjectIds = getKeysForSelectedRows(projectsPanel, prjSrcField);
	
	restriction.addClauses(consoleRestriction, false);
	restriction.addClauses(prjDestField, selectedProjectIds, 'IN');

	return restriction;
}

/**
 * Will remove "createWorkReq" column from grid report if user don't have 
 * assigned some processes isValidUserProcess = false
 * @param {Object} parentElement
 * @param {Object} columns
 * @param {Object} isValidUserProcess - opener controller
 */
function afterCreateDataRows_removeWorkRequest(parentElement, columns, isValidUserProcess, panel){
	if(!isValidUserProcess){
		panel.showColumn('createWorkReq', false);
		if (panel.visible) {
			panel.update();
		}
	}
}

/**
 * Override to grey-out the Create Service Request icon
 * if assessment status not in SCHEDULED, IN PROGRESS
 * @param {Object} row
 * @param {Object} column
 * @param {Object} cellElement
 */
function afterCreateCellContent_disableIcon(row, column, cellElement){
	if(column.id != "createWorkReq")
		return;
		
	var status = row.row.getFieldValue('activity_log.status');
	if (status != 'SCHEDULED' && status != 'IN PROGRESS') {
		Ext.get(cellElement).setOpacity("0.2");
		// KB 3046352  setOpacity is not working in IE10 & 11
		// set opacity using style object
		if (Ext.isIE) {
			Ext.get(cellElement).dom.style.opacity = 0.2;
		}
	}
}

/**
 * Open edit form for condition assessment item
 * @param {Object} activity_log_id - CA item id
 * @param {Object} callbackMethod  - function that is executed after save
 */
function editCAItem(activity_log_id, callbackMethod){
	var restriction = new Ab.view.Restriction({'activity_log.activity_log_id': activity_log_id});
	View.openDialog('ab-ca-edit-ca-itm.axvw', restriction, false, { 
		callback: function() {
			if(typeof callbackMethod == 'function'){
				callbackMethod();
			}
		}
	});
}

/**
 * Create work request for deficiency
 * message 'siteCodeMandatToCreateServReq' must be defined in opener view
 * row must contains thye following fields:
 * 	activity_log.site_id,activity_log.bl_id, activity_log.fl_id, activity_log.rm_id
 *  activity_log.location, activity_log.eq_id, activity_log.requestor,activity_log.phone_requestor
 *  activity_log.description, activity_log.activity_log_id, activity_log.date_scheduled
 *  
 * @param {Object} row - selected row from grid
 * @param {Object} callbackMethod
 */
function createWorkRequest(opener, row, callbackMethod){
	var status = row.getFieldValue('activity_log.status');
	var site_id = row.getFieldValue('activity_log.site_id');
	if (status != 'SCHEDULED' && status != 'IN PROGRESS') {
		return false;
	}
	if (!valueExistsNotEmpty(site_id)) {
		View.showMessage(getMessage("siteCodeMandatToCreateServReq"));
		return false;
	}
	var restriction = new Ab.view.Restriction({
		'activity_log.site_id': row.getFieldValue('activity_log.site_id'),
		'activity_log.bl_id': row.getFieldValue('activity_log.bl_id'),
		'activity_log.fl_id': row.getFieldValue('activity_log.fl_id'),
		'activity_log.rm_id': row.getFieldValue('activity_log.rm_id'),
		'activity_log.location': row.getFieldValue('activity_log.location'),
		'activity_log.eq_id': row.getFieldValue('activity_log.eq_id'),
		'activity_log.requestor': row.getFieldValue('activity_log.requestor'),
		'activity_log.phone_requestor': row.getFieldValue('activity_log.phone_requestor'),
		'activity_log.description': row.getFieldValue('activity_log.description'),
		'activity_log.assessment_id': row.getFieldValue('activity_log.activity_log_id'),
		'activity_log.date_scheduled': row.getFieldValue('activity_log.date_scheduled'),
		'activity_log.activity_type': 'SERVICE DESK - MAINTENANCE'
	});
	/*
	 * we must force the callback event on close dialog 
	 * action to refresh the main view
	 */
	opener.closeDialog = function(){
        if (this.dialog != null) {
    		this.dialog.close();
			if(this.dialogConfig.callback){
				this.dialogConfig.callback();
			}
			this.dialog = null;
        }
	}
	
	opener.openDialog('ab-ondemand-request-create.axvw', restriction, true, { 
		callback: function() {
			if(typeof callbackMethod == 'function'){
				callbackMethod();
			}
		}
	});
	
}

/**
 * Adds restriction clauses from restrictionSrc to restrictionDest
 * (the addClauses doesn't work with multiple values for project_id)
 * @param {Restriction} restrictionDest
 * @param {Restriction} restrictionSrc
 */
function addClausesToRestriction(restrictionDest, restrictionSrc){
	for(var i=0; i<restrictionSrc.clauses.length; i++){
		var rRrc = restrictionSrc.clauses[i];
		restrictionDest.addClause(rRrc.name, rRrc.value, rRrc.op, rRrc.relOp, false);
	}
}