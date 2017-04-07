/**
 * Returns the current filter selection in label format to display this on top.
 * 
 * @param filter
 */
function getFilterSelectionAsLabel(console){

	var labels = [];
	console.fields.each(function(field){
		var value = null; 
		if(console.hasFieldMultipleValues(field.fieldDef.id)){
			value = console.getFieldMultipleValues(field.fieldDef.id);
		}else{
			value = console.getFieldValue(field.fieldDef.id);
		}
		if(valueExistsNotEmpty(value)){
			if(field.fieldDef.id == 'hcm_is_hazard_or1'){
				if(console.getFieldValue('hcm_is_hazard_or2')){
					labels.push(field.fieldDef.title + ": " + value + " " + getTitleOfConsoleField(console, 'hcm_is_hazard_or2') + " " + console.getFieldValue('hcm_is_hazard_or2'));
				}else{
					labels.push(field.fieldDef.title + ": " + value);
				}
			}else if(field.fieldDef.id == 'hcm_is_hazard_or2'){
				//if hcm_is_hazard_or1 has value the hcm_is_hazard_or2 value was already added
				if (!console.getFieldValue('hcm_is_hazard_or1')){
					labels.push(getTitleOfConsoleField(console, 'hcm_is_hazard_or1') + ": " + value);
				}
			}else if(typeof(value) === 'object' && value instanceof Array){
				labels.push(field.fieldDef.title + ": " + value.join(", "));
			}else{
				labels.push(field.fieldDef.title + ": " + value);
			}
		}
	});
	return (labels.join("; "));	

	
}
/**
 * Create a restriction based on fields values from filter panel
 * 
 * @param consolePanel
 * @param selectedProjects
 * @param projectFieldLabel For the printable restriction
 * @returns restriction
 */
function getFilterRestriction(consolePanel, selectedProjects, projectFieldLabel){
	var printableRestriction = [];

	var restriction = " 1=1 "; 
	if(selectedProjects){
		restriction = "activity_log.project_id in ('" + selectedProjects.toString().replace(/,/g, "','") + "')";
		if(valueExistsNotEmpty(projectFieldLabel)) {
			printableRestriction.push({'title': projectFieldLabel, 'value': selectedProjects.toString().replace(/,/g, ", ")});
		}
	}
	
	var innerRestriction = "1=1";
	
	if(consolePanel.getFieldValue('bl.ctry_id')){
		var ctryIds = consolePanel.getFieldMultipleValues('bl.ctry_id');
		innerRestriction += " and bl.ctry_id in ('" + ctryIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'bl.ctry_id'), 'value': ctryIds.join(", ")});
	}
	if(consolePanel.getFieldValue('bl.regn_id')){
		var regnIds = consolePanel.getFieldMultipleValues('bl.regn_id');
		innerRestriction += " and bl.regn_id in ('" + regnIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'bl.regn_id'), 'value': regnIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.prob_type')){
		var probTypes = consolePanel.getFieldMultipleValues('activity_log.prob_type');
		restriction += " and activity_log.prob_type in ('" + probTypes.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.prob_type'), 'value': probTypes.join(", ")});
	}
	if(consolePanel.getFieldValue('hcm_is_hazard_or1') && consolePanel.getFieldValue('hcm_is_hazard_or2')){
		restriction += " and (activity_log.hcm_is_hazard = '" + consolePanel.getFieldValue('hcm_is_hazard_or1') + "' or activity_log.hcm_is_hazard = '" + consolePanel.getFieldValue('hcm_is_hazard_or2') + "')";
		var isHazardValue = consolePanel.getFieldValue('hcm_is_hazard_or1') + " " +getTitleOfConsoleField(consolePanel, 'hcm_is_hazard_or2')+ " " + consolePanel.getFieldValue('hcm_is_hazard_or2');
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'hcm_is_hazard_or1'), 'value': isHazardValue});
	}else if(consolePanel.getFieldValue('hcm_is_hazard_or1')){
		restriction += " and activity_log.hcm_is_hazard = '" + consolePanel.getFieldValue('hcm_is_hazard_or1') + "'";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'hcm_is_hazard_or1'), 'value': consolePanel.getFieldValue('hcm_is_hazard_or1')});
	}else if(consolePanel.getFieldValue('hcm_is_hazard_or2')){
		restriction += " and activity_log.hcm_is_hazard = '" + consolePanel.getFieldValue('hcm_is_hazard_or2') + "'";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'hcm_is_hazard_or1'), 'value': consolePanel.getFieldValue('hcm_is_hazard_or2')});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_haz_rank_id')){
		var rankIds = consolePanel.getFieldMultipleValues('activity_log.hcm_haz_rank_id');
		restriction += " and activity_log.hcm_haz_rank_id in ('" + rankIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_haz_rank_id'), 'value': rankIds.join(", ")});
	}
	if(consolePanel.getFieldValue('bl.state_id')){
		var stateIds = consolePanel.getFieldMultipleValues('bl.state_id');
		innerRestriction += " and bl.state_id in ('" + stateIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'bl.state_id'), 'value': stateIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_haz_status_id')){
		var statusIds = consolePanel.getFieldMultipleValues('activity_log.hcm_haz_status_id');
		restriction += " and activity_log.hcm_haz_status_id in ('" + statusIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_haz_status_id'), 'value': statusIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_cond_id')){
		var condIds = consolePanel.getFieldMultipleValues('activity_log.hcm_cond_id');
		restriction += " and activity_log.hcm_cond_id in ('" + condIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_cond_id'), 'value': condIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_haz_rating_id')){
		var ratingIds = consolePanel.getFieldMultipleValues('activity_log.hcm_haz_rating_id');
		restriction += " and activity_log.hcm_haz_rating_id in ('" + ratingIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_haz_rating_id'), 'value': ratingIds.join(", ")});
	}
	if(consolePanel.getFieldValue('bl.city_id')){
		var cityIds = consolePanel.getFieldMultipleValues('bl.city_id');
		innerRestriction += " and bl.city_id in ('" + cityIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'bl.city_id'), 'value': cityIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_friable')){
		var friables = consolePanel.getFieldMultipleValues('activity_log.hcm_friable');
		restriction += " and activity_log.hcm_friable = '" + friables.join("','") + "'";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_friable'), 'value': friables.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_loc_typ_id')){
		var locTyps = consolePanel.getFieldMultipleValues('activity_log.hcm_loc_typ_id');
		restriction += " and activity_log.hcm_loc_typ_id in ('" + locTyps.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_loc_typ_id'), 'value': locTyps.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.repair_type')){
		var repairTypes = consolePanel.getFieldMultipleValues('activity_log.repair_type');
		restriction += " and activity_log.repair_type in ('" + repairTypes.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.repair_type'), 'value': repairTypes.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_id')){
		var hcmIds = consolePanel.getFieldMultipleValues('activity_log.hcm_id');
		restriction += " and activity_log.hcm_id in ('" + hcmIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_id'), 'value': hcmIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.hcm_pending_act')){
		var pendingActs = consolePanel.getFieldMultipleValues('activity_log.hcm_pending_act');
		restriction += " and activity_log.hcm_pending_act in ('" + pendingActs.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.hcm_pending_act'), 'value': pendingActs.join(", ")});
	}
	if(consolePanel.getFieldValue('bl.site_id')){
		var siteIds = consolePanel.getFieldMultipleValues('bl.site_id');
		restriction += " and activity_log.site_id in ('" + siteIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'bl.site_id'), 'value': siteIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.site_id')){
		var siteIds = consolePanel.getFieldMultipleValues('activity_log.site_id');
		restriction += " and activity_log.site_id in ('" + siteIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.site_id'), 'value': siteIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.bl_id')){
		var blIds = consolePanel.getFieldMultipleValues('activity_log.bl_id');
		restriction += " and activity_log.bl_id in ('" + blIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.bl_id'), 'value': blIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.fl_id')){
		var flIds = consolePanel.getFieldMultipleValues('activity_log.fl_id');
		restriction += " and activity_log.fl_id in ('" + flIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.fl_id'), 'value': flIds.join(", ")});
	}
	if(consolePanel.getFieldValue('activity_log.rm_id')){
		var rmIds = consolePanel.getFieldMultipleValues('activity_log.rm_id');
		restriction += " and activity_log.rm_id in ('" + rmIds.join("','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'activity_log.rm_id'), 'value': rmIds.join(", ")});
	}
	if(consolePanel.getFieldValue('dateFrom')){
		restriction += " and activity_log.date_assessed >= ${sql.date('" + consolePanel.getFieldValue('dateFrom') + "')}";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'dateFrom'), 'value': consolePanel.getFieldValue('dateFrom')});
	}
	if(consolePanel.getFieldValue('dateTo')){
		restriction += " and activity_log.date_assessed <= ${sql.date('" + consolePanel.getFieldValue('dateTo') + "')}";
		printableRestriction.push({'title': getTitleOfConsoleField(consolePanel, 'dateTo'), 'value': consolePanel.getFieldValue('dateTo')});
	}
	
	if(innerRestriction != "1=1"){
		restriction += " and activity_log.bl_id in (select bl_id from bl where "+ innerRestriction + ")";
	}
	
	var restrictions = {
			'restriction': restriction,
			'printableRestriction': printableRestriction
		};
	
	return restrictions;
}




/**
 * get field ids for selected rows
 * @param grid
 * @param fieldName
 * @returns {Array}
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
 * Creates and returns restriction from the given field
 * Adds to instructions the field restriction, if instrLabels is given
 * @param {Object} console
 * @param {Object} fieldId
 * @param {Object} instrLabels instructions object (to add labels into)
 * @param {Object} printableRestriction restriction to display in paginated report
 */
function getRestrictionForField(console, fieldId, instrLabels, printableRestriction) {
	var restriction = "";
	
	var fieldValue = console.hasFieldMultipleValues(fieldId) ? console.getFieldMultipleValues(fieldId) : console.getFieldValue(fieldId);
	if(valueExistsNotEmpty(fieldValue)){
		if(typeof(fieldValue) === 'object' && fieldValue instanceof Array){
			restriction = " AND " + fieldId + " IN ('" + fieldValue.join("','") + "')";
			if(instrLabels){
				instrLabels.push({field: fieldId, title: getTitleOfConsoleField(console, fieldId), value: fieldValue.join(", ")});
			}
			if(printableRestriction){
				printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': fieldValue.join(", ")});
			}
		} else {
			restriction = " AND " + fieldId + " = '" + fieldValue + "'";
			if(instrLabels){
				instrLabels.push({field: fieldId, title: getTitleOfConsoleField(console, fieldId), value: fieldValue});
			}
			if(printableRestriction){
				printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': fieldValue});
			}
		}
	}
	
	return restriction;
}

/**
 * Returns the title of the given field of the console
 * @param console
 * @param fieldName
 * @returns {String}
 */
function getTitleOfConsoleField(console, fieldName){
	var title = "";
	
	console.fields.each(function(field){
		if(field.fieldDef.id == fieldName)
			title = field.fieldDef.title;
	});
	
	return title;
}

/**
 * show drawing toolbar
 * @param {boolean} show
 */
function showDwgToolbar(show, drawingPanel){
	drawingPanel.setToolbar('show', show);   
	if (show)
		drawingPanel.setToolbar('show', false, 'resetAssets,clearAssets');
}

/**
 * highlight selected items on dwg
 * @param {Object} panel - Drawing panel
 * @param {Object} items - selected items
 * @param {Object} color The color of the highlight
 */
function setDwgHighlight(dwgPanel, items, color, dwgName){
	
	if (valueExistsNotEmpty(dwgName)) {
		var opts = new DwgOpts();

		opts.rawDwgName = dwgName;
		dwgPanel.setSelectColor((color ? color : 0xFFFF00));	// yellow by default
		
	    for (var i = 0; i < items.length; i++) {
			var vals = items[i].record ? items[i].record : items[i];
	    	var id = vals['activity_log.bl_id'] + ";" + vals['activity_log.fl_id'] + ";" + vals['activity_log.rm_id'];
	    	opts.appendRec(id);
	    }
		items = null;
	    showDwgToolbar(true,dwgPanel);
	    dwgPanel.highlightAssets(opts);
	}
}

/**
 * Event handler for clicking on button 'View'
 * 
 * @param row
 */
function showDetails(row){
	
	//use the activity_log_id to create a restriction
	var activityId = row['activity_log.activity_log_id'];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_log_id',activityId);
	
	//open 'ab-cb-rpt-assessment-details.axvw'
	View.openDialog('ab-cb-rpt-assessment-details.axvw', null, false, {
        closeButton: false,
        restriction: restriction
    });
	
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
		View.showMessage(getMessage('errNoProjectSelected'));
		return;
	}
	var restriction =  new Ab.view.Restriction();
	restriction.addClause('project.project_id', selectedProjectIds, 'IN');
	View.openDialog('ab-cb-project-dataview.axvw', null, false, { 
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
 * Sets the Select-all checkbox and all rows containing a checkbox as first column
 * to enabled true or false
 * 
 * @param grid
 * @param enable true/false
 */
function setAllRowsSelectable(grid, enable) {
	grid.enableSelectAll(enable);
	
    var dataRows = grid.getDataRows();
    for (var r = 0; r < dataRows.length; r++) {
        var dataRow = dataRows[r];
        
        var selectionCheckbox = dataRow.firstChild.firstChild;
        if (typeof selectionCheckbox.checked != 'undefined') {
			selectionCheckbox.disabled = !enable;			
        }
    }
}

/**
 * Validates dates: if both are filled, end date should be >= start date
 * Message "selectValidDates" should exist in the calling view
 * @param {String} startDate "yyyy-mm-dd"
 * @param {String} endDate "yyyy-mm-dd"
 * @returns {Boolean} false if the dates are filled and end date < start date; true otherwise
 */
function validateDates(startDate, endDate){
	if(valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate)
			&& (startDate != endDate)){
		var startD = startDate.split("-");
		var endD = endDate.split("-");
		if(DateMath.before(new Date(endD[0], endD[1], endD[2]), new Date(startD[0], startD[1], startD[2]))){
			View.showMessage(getMessage("selectValidDates"));
			return false;
		}
	}
	
	return true;
}

/**
 * Search for another selected item in the grid with the same room
 * @param grid
 * @param rmRow
 * @param tableName location table name (from where come bl_id, fl_id, rm_id) 
 * @returns {Boolean} true is another item with same room found; false otherwise
 */
function existsSelectedItemInSameRoom(grid, rmRow, tableName){
	if(!valueExists(tableName)){
		tableName = 'activity_log';
	}
	var selectedRows = grid.getSelectedRows();
	
	for (var i = 0; i < selectedRows.length; i++) {
		var selRow = selectedRows[i].row;
		if(selRow.getFieldValue(tableName + '.bl_id') == rmRow.getFieldValue(tableName + '.bl_id')
				&& selRow.getFieldValue(tableName + '.fl_id') == rmRow.getFieldValue(tableName + '.fl_id')
				&& selRow.getFieldValue(tableName + '.rm_id') == rmRow.getFieldValue(tableName + '.rm_id'))
			return true;
	}
	
	return false;
}

/**
 * Exports DOCX with print of the passed restriction
 * @param panel panel Object
 * @param printableRestriction Array of {'title': fieldTitle, 'value': fieldValue}
 * @param orientation Orientation "portrait" (default) or "landscape"
 */
function exportDocWithPrintableRestriction(panel, printableRestriction, orientation){
	var parameters = {
			'printRestriction': true,
			'printableRestriction': printableRestriction
		};
	
	if(valueExistsNotEmpty(orientation)){
		parameters.orientation = orientation;
	}

	View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  

	var jobId = panel.callDOCXReportJob(panel.title, panel.restriction, parameters);

	var jobStatus = Workflow.getJobStatus(jobId);
	while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
		jobStatus = Workflow.getJobStatus(jobId);
	}
	
	if (jobStatus.jobFinished) {
		var url  = jobStatus.jobFile.url;
		if (valueExistsNotEmpty(url)) {
			window.location = url;
		}
	}
	
	View.closeProgressBar();
}