var abCbRptAssessAllController = View.createController('abCbRptAssessAllCtrl',{
	// selected projects + console restriction
	restriction: null,
	
	printableRestriction: [],

	/**
	 * Shows the report grid according to the user restrictions
	 */
	abCbRptAssessAll_console_onFilter:function(){
    	// validateDates
    	var startDate = this.abCbRptAssessAll_console.getFieldValue("activity_log.date_assessed");
    	var endDate = this.abCbRptAssessAll_console.getFieldValue("activity_log.date_required");
    	if(!validateDates(startDate, endDate))
        	return;

    	this.setRestriction();

		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}
		
		this.abCbRptAssessAll_panelAssessments.refresh(this.restriction);
		this.abCbRptAssessAll_panelSamples.refresh(this.restriction);
		this.abCbRptAssessAll_panelLabResults.addParameter("consoleRestriction", this.restriction);
		this.abCbRptAssessAll_panelLabResults.refresh();
		this.abCbRptAssessAll_panelResultsSum.addParameter("consoleRestriction", this.restriction);
		this.abCbRptAssessAll_panelResultsSum.refresh();

		this.abCbRptAssessAll_tabs.selectTab("abCbRptAssessAll_tabAssessments");
	},
	
	/**
	 * Sets the controller's attribute 'restriction'
	 * according to the selected projects and the filter console selections
	 */
	setRestriction: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.abCbRptProjects_projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0)
			return;
		
		this.printableRestriction.length = 0;
		
		this.restriction = "activity_log.project_id IN ('" + selectedProjectIds.join("','") + "')";
		this.printableRestriction.push({'title': getMessage("project"), 'value': selectedProjectIds.join(", ")});
		
		this.addConsoleRestriction();
	},

	/**
	 * Adds restriction to the controller restriction, according to the filter console selections
	 */
	addConsoleRestriction: function() {
		var console = this.abCbRptAssessAll_console;

		this.restriction += getRestrictionForField(console, "activity_log.site_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.bl_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.fl_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.rm_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.prob_type", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_status_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_cond_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_loc_typ_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rank_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rating_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_pending_act", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.repair_type", this.printableRestriction);
		
		var isHazard1 = console.getFieldValue('hcm_is_hazard_or1');
		var isHazard2 = console.getFieldValue('hcm_is_hazard_or2');
		var consoleDs = console.getDataSource();
		var isHazardPrint ="";
		if(valueExistsNotEmpty(isHazard1) && valueExistsNotEmpty(isHazard2)){
			this.restriction += " AND (activity_log.hcm_is_hazard = '" + isHazard1 + "' OR activity_log.hcm_is_hazard = '" + isHazard2 +"')";
			isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard1, true) + " " + getTitleOfConsoleField(console, "hcm_is_hazard_or2") + " " + consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard2, true);
		}else if(valueExistsNotEmpty(isHazard1)){
        	this.restriction += " AND activity_log.hcm_is_hazard = '" + isHazard1 + "'";
        	isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard1, true);
		}else if (valueExistsNotEmpty(isHazard2)) {
			isHazardPrint = consoleDs.formatValue("activity_log.hcm_is_hazard", isHazard2, true);
        	this.restriction += " AND activity_log.hcm_is_hazard = '" + isHazard2 + "'";
		}
				
		if(valueExistsNotEmpty(isHazard1) || valueExistsNotEmpty(isHazard2)){
			var title = getTitleOfConsoleField(console, "hcm_is_hazard_or1");
			this.printableRestriction.push({'title': title, 'value': isHazardPrint});
		}

		var isFriable = console.getFieldValue('activity_log.hcm_friable');
        if (valueExistsNotEmpty(isFriable)) {
        	this.restriction += " AND activity_log.hcm_friable = '" + isFriable + "'";
        	this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.hcm_friable"), 'value': isFriable});
		}

        var date_from = console.getFieldValue('activity_log.date_assessed');
        if (valueExistsNotEmpty(date_from)) {
        	this.restriction += " AND activity_log.date_assessed >= ${sql.date('" + date_from + "')}";
        	this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.date_assessed"), 'value': date_from});
		}
		
        var date_to = console.getFieldValue('activity_log.date_required');
		if (valueExistsNotEmpty(date_to)) {
			this.restriction += " AND activity_log.date_assessed <= ${sql.date('" + date_to + "')}";
			this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.date_required"), 'value': date_to});
		}
	},
	
	onPaginatedReport: function(){
		if(!abCbRptAssessAllController.restriction){
			abCbRptAssessAllController.setRestriction();
		}
		
		if(!abCbRptAssessAllController.restriction){
			View.showMessage(getMessage('noProjectSelectedDOC'));
       		return;
		}
		
		var parameters = {
	        'consoleRestriction': abCbRptAssessAllController.restriction,
	        'printRestriction': true, 
	        'printableRestriction': abCbRptAssessAllController.printableRestriction
	    };
		
		View.openPaginatedReportDialog('ab-cb-rpt-assess-pgrp.axvw', null, parameters);
	}
});


/**
 * onClick event handler for viewSamples button
 * 
 * @param {Object} row
 */
function onClickViewSamples(row){
	var controller = abCbRptAssessAllController;
	var restriction = controller.restriction
					+ " AND activity_log.activity_log_id = '" + row["activity_log.activity_log_id"] + "'";
	
	controller.abCbRptAssessAll_panelSamples.refresh(restriction);
	controller.abCbRptAssessAll_tabs.selectTab("abCbRptAssessAll_tabSamples");
}

/**
 * onClick event handler for viewLabResults button in Assessments panel
 * 
 * @param {Object} row
 */
function onClickAssessLabResults(row){
	var controller = abCbRptAssessAllController;
	var restriction = abCbRptAssessAllController.restriction
					+ " AND activity_log.activity_log_id = '" + row["activity_log.activity_log_id"] + "'";
	
	controller.abCbRptAssessAll_panelLabResults.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessAll_panelLabResults.refresh();
	controller.abCbRptAssessAll_panelResultsSum.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessAll_panelResultsSum.refresh();
	controller.abCbRptAssessAll_tabs.selectTab("abCbRptAssessAll_tabLabResults");
}

/**
 * onClick event handler for viewLabResults button in Samples panel
 * 
 * @param {Object} row
 */
function onClickSampleLabResults(row){
	var controller = abCbRptAssessAllController;
	var restriction = abCbRptAssessAllController.restriction
					+ " AND cb_samples.sample_id = '" + row["cb_samples.sample_id"] + "'";
	
	controller.abCbRptAssessAll_panelLabResults.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessAll_panelLabResults.refresh();
	controller.abCbRptAssessAll_panelResultsSum.addParameter("consoleRestriction", restriction);
	controller.abCbRptAssessAll_panelResultsSum.refresh();
	controller.abCbRptAssessAll_tabs.selectTab("abCbRptAssessAll_tabLabResults");
}
