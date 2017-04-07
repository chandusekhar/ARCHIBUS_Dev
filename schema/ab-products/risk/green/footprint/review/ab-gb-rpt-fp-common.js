// @begin_translatable
var z_MESSAGE_SUMMARIZE_EMISSIONS = 'Summarize Emissions'; 

/**
 * call Summarize emissions WFR when view is loaded
 * 
 * @param blIds list with selected bl id's
 * @param calcYears list with calculation years
 * @param scenarioIds list with scenario id's
 * @returns boolean true/false
 */
function summarizeEmissions(blIds, calcYears, scenarioIds, callback){
	var lstBlIds = [];
	if(typeof(blIds) == "function"){
		callback = blIds;
	}else if(typeof(blIds) === 'object' && blIds instanceof Array){
		lstBlIds = blIds;
	}else if (valueExistsNotEmpty(blIds) ){
		lstBlIds.push(blIds);
	}
	
	var lstCalcYear = [];
	if(typeof(calcYears) === 'object' && calcYears instanceof Array){
		lstCalcYear = calcYears;
	}else if (valueExistsNotEmpty(calcYears) ){
		lstCalcYear.push(calcYears);
	}
	var lstScenarioId = [];
	if(typeof(scenarioIds) === 'object' && scenarioIds instanceof Array){
		lstScenarioId = scenarioIds;
	}else if (valueExistsNotEmpty(scenarioIds) ){
		lstScenarioId.push(scenarioIds);
	}

	try {
		var jobId = Workflow.startJob('AbRiskGreenBuilding-FootprintService-summarizeEmissions', lstBlIds, lstCalcYear, lstScenarioId);
	    View.openJobProgressBar(z_MESSAGE_SUMMARIZE_EMISSIONS, jobId, '', function(status) { 
	    	if(callback != undefined){
	    		callback.call();
	    	}
	    });
	    return true;
	} catch (e) {
		Workflow.handleError(e);
		return false;
	}
}

/**
 * Call calculate emissions WFR 
 * 
 * @param blIds list with selected bl id's
 * @param calcYears list with calculation years
 * @param scenarioIds list with scenario id's
 * @returns boolean true/false
 */
function calculateEmissions(blIds, calcYears, scenarioIds){
	var lstBlIds = [];
	if(typeof(blIds) === 'object' && blIds instanceof Array){
		lstBlIds = blIds;
	}else if (valueExistsNotEmpty(blIds) ){
		lstBlIds.push(blIds);
	}
	var lstCalcYear = [];
	if(typeof(calcYears) === 'object' && calcYears instanceof Array){
		lstCalcYear = calcYears;
	}else if (valueExistsNotEmpty(calcYears) ){
		lstCalcYear.push(calcYears);
	}
	var lstScenarioId = [];
	if(typeof(scenarioIds) === 'object' && scenarioIds instanceof Array){
		lstScenarioId = scenarioIds;
	}else if (valueExistsNotEmpty(scenarioIds) ){
		lstScenarioId.push(scenarioIds);
	}
	
	try{
		var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateEmissions", lstBlIds, lstCalcYear, lstScenarioId);
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

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
			if(typeof(value) === 'object' && value instanceof Array){
				labels.push(field.fieldDef.title + ": " + value.join(", "));
			}else{
				labels.push(field.fieldDef.title + ": " + value);
			}
		}
	});
	return (labels.join("; "));	

	
}

/**
 * Set column title based on a checkbox selection from filter panel
 * @param {Object} gridPanel
 * @param {Object} fieldName
 */
function setColumnTitle(gridPanel, fieldName){

    if ($('chk_vf_totals_per_area').checked) {
        gridPanel.setFieldLabel(fieldName, getMessage('emissions_per_area'));
    }
    else {
        gridPanel.setFieldLabel(fieldName, getMessage('total_emissions'));
    }
}	

/**
 * Export grid panel to XLS file
 * 
 * @param controller
 * @param panelId
 */
function generateXLS(controller, panelId, isAtTheBottom, isOnlyPerArea, areaExtFieldName){
	try{
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));
		
		var panel = View.panels.get(panelId);
		var reportViewName = panel.viewDef.viewName + '.axvw';
		var reportTitle = convertFromXMLValue(Ab.view.View.title) +' -> '+ convertFromXMLValue(panel.title);
		var visibleFieldDefs = getVisibleFieldDefs(panel);
		var parameters = ( controller.parameters) ?  controller.parameters :  {'isGroupPerArea':'true'};
		var isGroupPerArea = null;
		
		if (isOnlyPerArea){
			isGroupPerArea = true;
			
		}else{
			isGroupPerArea = controller.isGroupPerArea;
		}
		
		var panelRestr = (controller.view.panels.get(panelId).restriction) ? controller.view.panels.get(panelId).restriction : " 1=1 ";
		
		var jobId = Workflow.startJob("AbRiskGreenBuilding-FootprintService-generateGridXLSReport",
				reportViewName, panel.dataSourceId, reportTitle, visibleFieldDefs, panelRestr, 
				parameters, isGroupPerArea, isAtTheBottom, areaExtFieldName);
		
		var jobStatus = Workflow.getJobStatus(jobId);
		//XXX: finished or failed
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
	catch(e){
		View.closeProgressBar();
		Workflow.handleError(e);
	}
}

/**
 * Provide panel fields list to DOCX and Grid XLS  report
 * @param panel
 * @returns {Array}
 */
function getVisibleFieldDefs(panel){
	var fieldDefs = panel.fieldDefs;  	
	if(fieldDefs && fieldDefs.length == 0){
		panel.getDataSource().fieldDefs.each(function (fieldDef) {
			fieldDefs.push(fieldDef);
		});
	}
	
	var visibleFieldDefs = [];
	var columns = panel.columns;
	for (var i = 0, column; column = columns[i]; i++) {
		 if(column.hidden){
			 continue;
		 }			 
	     var field = getFieldDefById(fieldDefs, column.id, i);
	     if(valueExists(field)){
	    	 
			 if(View.controllers.get('abGbRptFpSrcCatCtrl') || View.controllers.get('abGbRptFpSiteBlgCtrl')){
	    		 if(field.id == 'gb_fp_totals.vf_s1_total' || field.id == 'gb_fp_totals.vf_s3_total' || field.id == 'gb_fp_totals.vf_total'){
	    			 field.title = ($('chk_vf_totals_per_area').checked) ?  getMessage('emissions_per_area') : getMessage('total_emissions');
	    		 }
	    	 } else if(View.controllers.get('abGbRptFpSrcDetailCtrl')){
	    		 if(field.id == 'gb_fp_totals.vf_total_emiss'){
	    			 field.title = ($('chk_vf_totals_per_area').checked) ?  getMessage('emissions_per_area') : getMessage('total_emissions');
	    		 }
	    	 }
	    	
			field.title = convertFromXMLValue(field.title);
	    	 if(field.controlType == '' || field.controlType == 'link'){
	    		 visibleFieldDefs.push(field);
	    	 }
	     }
	}	
	return visibleFieldDefs;
}

/**
 * 
 * @param fieldDefs
 * @param id
 * @param index
 * @returns a fieldDefs[index] or null
 */
function getFieldDefById(fieldDefs, id, index){
	if(index < fieldDefs.length){
    	var field = fieldDefs[index];
    	if(valueExists(field) && (id == field.id)){
    		return field;
    	}
	}
	//use case: manually add columns in js
	for (var i = 0, field; field = fieldDefs[i]; i++) {
		if(id == field.id){
			return field;
		}
	}
	
	return null;
}

/**
 * Validates dates: if both are filled, end date should be >= start date
 * Message "dateError" should exist in the calling view
 * @param startDate
 * @param endDate
 * @returns {Boolean} false if the dates are filled and end date < start date; true otherwise
 */
function validateDates(panel, startDateId, endDateId){
	var dateStart = panel.getFieldValue(startDateId);
	var dateEnd = panel.getFieldValue(endDateId);
	if(valueExistsNotEmpty(dateEnd) && dateStart>dateEnd){
		View.showMessage(getMessage("dateError"));
		return false;
	}
	return true;
}

/**
 * add restriction to command 
 * 
 * @param objField
 * @param restriction
 */
function addCommandRestriction(objField, restriction){
	objField.actions.each(function(action){
		if(action.command.commands){
			for(var i = 0 ; i < action.command.commands.length; i++){
				var command = action.command.commands[i];
				if(command.type == "selectValue"){
					command.dialogRestriction = restriction;
					return;
				}
			}
		}
	});
}