var abEhsRptMedMonReportCtrl = View.createController('abEhsRptMedMonReportCtrl',{
	printableRestr: null,
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsRptMedMonReport_console_onFilter: function(){
		var filterRestriction = getFilterRestriction(this.abEhsRptMedMonReport_console);
		this.abEhsRptMedMonReport_grid.refresh(filterRestriction);
	},
	/**
	 * Exports DOCX with custom printable restriction
	 */
	abEhsRptMedMonReport_grid_onExportDOCX: function(){
		var  panel  =  this.abEhsRptMedMonReport_grid;
		var  parameters  = {};
		parameters.printRestriction  =  true;
		if(this.printableRestr){
			parameters.printableRestriction  =  this.printableRestr;
		}
		var  jobId  =  panel.callDOCXReportJob(panel.title,  panel.restriction,  parameters);
		
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
});

function getFilterRestriction(console){
	
	//KB3035450 - replace hard-coded multiple value separator string with lookup of core value
	var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
	 //test to see if the multiple_values_separator is one of these special characters, if so, prepend with escape character
	 var specialChars = /[\^\'\"\\]/;
	 if(specialChars.test(MULTIPLE_VALUE_SEPARATOR)) {
	  MULTIPLE_VALUE_SEPARATOR = "\\" + MULTIPLE_VALUE_SEPARATOR;
	 }
	 var separatorRegExp = new RegExp(MULTIPLE_VALUE_SEPARATOR, "g");
	
	var restriction = '1=1'; 
	var printableRestriction = [];
    
	var fieldId = 'ehs_medical_mon_results.medical_monitoring_id';
	if(console.getFieldValue(fieldId)){
		restriction += " AND " + fieldId + " IN ('" + console.getFieldValue(fieldId).replace(separatorRegExp, "','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': console.getFieldValue(fieldId).replace(separatorRegExp, ", ")});
	}
	
	fieldId = 'ehs_medical_mon_results.monitoring_type';
	if(console.getFieldValue(fieldId)){
		restriction += " AND " + fieldId + " IN ('" + console.getFieldValue(fieldId).replace(separatorRegExp, "','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': console.getFieldValue(fieldId).replace(separatorRegExp, ", ")});
	}
	
	fieldId = 'ehs_medical_mon_results.em_id';
	if(console.getFieldValue(fieldId)){
		restriction += " AND " + fieldId + " IN ('" + console.getFieldValue(fieldId).replace(separatorRegExp, "','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': console.getFieldValue(fieldId).replace(separatorRegExp, ", ")});
	}
	
	fieldId = 'ehs_medical_mon_results.incident_id';
	if(console.getFieldValue(fieldId)){
		restriction += " AND " + fieldId + " IN ('" + console.getFieldValue(fieldId).replace(separatorRegExp, "','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': console.getFieldValue(fieldId).replace(separatorRegExp, ", ")});
	}
	
	fieldId = 'ehs_medical_mon_results.tracking_number';
	if(console.getFieldValue(fieldId)){
		restriction += " AND " + fieldId + " IN ('" + console.getFieldValue(fieldId).replace(separatorRegExp, "','") +"') ";
		printableRestriction.push({'title': getTitleOfConsoleField(console, fieldId), 'value': console.getFieldValue(fieldId).replace(separatorRegExp, ", ")});
	}
	
	if(console.getFieldValue('ehs_medical_mon_results.vf_pr_id')){
		restriction += " AND ehs_medical_mon_results.em_id IN (SELECT em.em_id FROM em,bl WHERE bl.bl_id = em.bl_id AND bl.pr_id = '" + console.getFieldValue('ehs_medical_mon_results.vf_pr_id') + "')";
		printableRestriction.push({'title': getTitleOfConsoleField(console, 'ehs_medical_mon_results.vf_pr_id'), 'value': console.getFieldValue('ehs_medical_mon_results.vf_pr_id').replace(separatorRegExp, ", ")});
	}
		
	if(console.getFieldValue('date_occured_from')){
		restriction += " AND ehs_medical_mon_results.date_actual >= ${sql.date('" + console.getFieldValue('date_occured_from') + "')}";
		printableRestriction.push({'title': getTitleOfConsoleField(console, 'date_occured_from'), 'value': console.getFieldValue('date_occured_from').replace(separatorRegExp, ", ")});
	}
	if(console.getFieldValue('date_occured_to')){
		restriction += " AND ehs_medical_mon_results.date_actual <= ${sql.date('" + console.getFieldValue('date_occured_to') + "')}";
		printableRestriction.push({'title': getTitleOfConsoleField(console, 'date_occured_to'), 'value': console.getFieldValue('date_occured_to').replace(separatorRegExp, ", ")});
	}
	
	abEhsRptMedMonReportCtrl.printableRestr = printableRestriction;
	
	return restriction;
}

function selectValue_PrId(){
	View.selectValue(
	    'abEhsRptMedMonReport_console',
	    '',
	    ['ehs_medical_mon_results.vf_pr_id'],
	    'bl',
	    ['bl.pr_id'],
	    ['bl.pr_id'],
	    "bl_id IN (SELECT bl.bl_id from bl,em,ehs_medical_mon_results WHERE bl.bl_id=em.bl_id AND em.em_id=ehs_medical_mon_results.em_id)"
	);
}