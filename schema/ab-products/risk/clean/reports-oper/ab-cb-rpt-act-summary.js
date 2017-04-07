var abCbRptActSummaryController = View.createController('abCbRptActSummaryCtrl',{
	// selected projects + console restriction
	restriction: null,
	
	printableRestriction: [],
	
	itemClickedRestriction: "1=1",

	printableItemClickRestriction: [],
	
	projectClicked: null,

	/**
	 * Shows the report grid according to the user restrictions
	 */
	abCbRptActSummary_panelFilter_onFilter: function(){
    	// validateDates
    	var startDate = this.abCbRptActSummary_panelFilter.getFieldValue("activity_log.date_requested");
    	var endDate = this.abCbRptActSummary_panelFilter.getFieldValue("activity_log.date_required");
    	if(!validateDates(startDate, endDate))
        	return;

    	this.setRestriction();

		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}
		
		this.abCbRptActSummary_panelSummary.refresh(this.restriction);
		this.abCbRptActSummary_panelAssessments.refresh(this.restriction);

		this.abCbRptActSummary_tabs.selectTab("abCbRptActSummary_tabSummary");
	},
	
	abCbRptActSummary_panelFilter_onClear: function(){
		this.abCbRptActSummary_panelFilter.clear();
		this.clearSelect("selectPriority");
		this.clearSelect("selectCategory");
		this.clearSelect("selectActivityType");
	},
	
	/**
	 * select the default value for SELECT field
	 */
	clearSelect: function(fieldId){
		var selectOptions = document.getElementById(fieldId).options;
	    for(var i=0; i<selectOptions.length; i++) {
			if(selectOptions[i].defaultSelected) {
				selectOptions[i].selected = true;
				break;
	    	}
		}
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
		
		this.restriction += " AND (activity_log.activity_type LIKE 'HAZMAT - %' OR activity_log.activity_type = 'SERVICE DESK - MAINTENANCE')";
		
		this.addConsoleRestriction();
	},

	/**
	 * Adds restriction to the controller restriction, according to the filter console selections
	 */
	addConsoleRestriction: function() {
		var console = this.abCbRptActSummary_panelFilter;

		this.restriction += getRestrictionForField(console, "activity_log.site_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.bl_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.fl_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.rm_id", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.activity_type", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.assessed_by", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.status", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.assigned_to", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.prob_type", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_abate_by", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.supervisor", this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.work_team_id", this.printableRestriction);
		var hazardIds = console.hasFieldMultipleValues('activity_log.vf_hazard_id') ? console.getFieldMultipleValues('activity_log.vf_hazard_id') : console.getFieldValue('activity_log.vf_hazard_id');
		if(hazardIds.length>0){
			if(typeof(hazardIds) === 'object' && hazardIds instanceof Array){
				this.restriction += " AND activity_log.assessment_id IN ('" + hazardIds.join("','") + "')";
				this.printableRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.vf_hazard_id'), 'value': hazardIds.join(", ")});
			}else{
				this.restriction += " AND activity_log.assessment_id = ('" + hazardIds + "')";
				this.printableRestriction.push({'title': getTitleOfConsoleField(console, 'activity_log.vf_hazard_id'), 'value': hazardIds});
			}
		}
		
		// Priority
		var selectPriorityField = console.fields.get("selectPriorityField").fieldDef;
		var selectPriority = document.getElementById("selectPriority");
		var priority = selectPriority.options[selectPriority.selectedIndex].value;
		var priorityTitle = selectPriority.options[selectPriority.selectedIndex].text;
		if(priority != "") {
			this.restriction += " AND activity_log.priority = " + priority;
			this.printableRestriction.push({'title': selectPriorityField.title, 'value': priorityTitle});
		}

		// Category
		var selectCategoryField = console.fields.get("selectCategoryField").fieldDef;
		var selectCategory = document.getElementById("selectCategory");
		var category = selectCategory.options[selectCategory.selectedIndex].value;
		var categoryTitle = selectCategory.options[selectCategory.selectedIndex].text;
		switch (category) {
		case "ProjectOnly":
			this.restriction += " AND activity_log.assessment_id IS NULL";
			this.printableRestriction.push({'title': selectCategoryField.title, 'value': categoryTitle});
			break;

		case "HazardItemOnly":
			this.restriction += " AND activity_log.assessment_id IS NOT NULL";
			this.printableRestriction.push({'title': selectCategoryField.title, 'value': categoryTitle});
			break;

		case "All":
		default:
			break;
		}
		
		// Activity Type
		var selectActivityTypeField = console.fields.get("selectActivityTypeField").fieldDef;
		var selectActivityType = document.getElementById("selectActivityType");
		var activityType = selectActivityType.options[selectActivityType.selectedIndex].value;
		var activityTypeTitle = selectActivityType.options[selectActivityType.selectedIndex].text;
		switch (activityType) {
		case "ActionItems":
			this.restriction += " AND activity_log.activity_type like 'HAZMAT - %'";
			this.printableRestriction.push({'title': selectActivityTypeField.title, 'value': activityTypeTitle});
			break;

		case "ServiceRequests":
			this.restriction += " AND activity_log.activity_type = 'SERVICE DESK - MAINTENANCE'";
			this.printableRestriction.push({'title': selectActivityTypeField.title, 'value': activityTypeTitle});
			break;

		case "All":
		default:
			break;
		}
		
		// Date Requested From
        var date_from = console.getFieldValue('activity_log.date_requested');
        if (valueExistsNotEmpty(date_from)) {
        	this.restriction += " AND activity_log.date_requested >= ${sql.date('" + date_from + "')}";
        	this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.date_requested"), 'value': date_from});
		}

		// Date Requested To
        var date_to = console.getFieldValue('activity_log.date_required');
		if (valueExistsNotEmpty(date_to)) {
			this.restriction += " AND activity_log.date_requested <= ${sql.date('" + date_to + "')}";
			this.printableRestriction.push({'title': getTitleOfConsoleField(console, "activity_log.date_required"), 'value': date_to});
		}
	},

	/**
	 * On click event
	 * @param {Object} commandObject The clicked line command
	 * @param {Object} tabIndex
	 */
	onClickItem: function(commandObject) {
		var restriction = "";
		
		// start with filter restriction
		restriction += this.restriction;
		this.itemClickedRestriction = "1=1 ";
		this.printableItemClickRestriction = [];
		
		// add restriction according to user's click in a row
		for ( var i = 0; i < commandObject.restriction.clauses.length; i++) {
			var clause = commandObject.restriction.clauses[i];
			restriction += " AND " + clause.name + " = " + "'" + clause.value + "'";
			this.itemClickedRestriction += " AND " + clause.name + " = " + "'" + clause.value + "'";
			if(clause.name == 'activity_log.project_id'){
				this.projectClicked = clause.value;
			}else{
				this.printableItemClickRestriction.push({'title': getTitleOfConsoleField(this.abCbRptActSummary_panelFilter, clause.name), 'value': clause.value});
			}
			
		}

		this.abCbRptActSummary_panelAssessments.refresh(restriction);
		
		this.abCbRptActSummary_tabs.selectTab("abCbRptActSummary_tabAssessments");
	},
	
	abCbRptActSummary_panelAssessments_onPaginatedReport: function(){
		var finalPrintableRestriction = null;
		if(this.printableRestriction){
			finalPrintableRestriction = this.printableRestriction;
		}
		
		if(this.projectClicked){
			finalPrintableRestriction = this.replacePrintableRestrictionValues(getMessage('project'),finalPrintableRestriction, this.projectClicked);
		}
		
	    var parameters = {
	        'consoleRestriction': this.restriction + " AND " + this.itemClickedRestriction,
	        'printRestriction': true, 
	        'printableRestriction': finalPrintableRestriction.concat(this.printableItemClickRestriction)
	    };
	    
	    View.openPaginatedReportDialog("ab-cb-rpt-act-summary-pgrp.axvw", null, parameters);
	},
	
	abCbRptActSummary_panelAssessments_afterRefresh: function(){
		setPriorityValue(this.abCbRptActSummary_panelAssessments, "activity_log.priority");
	},
	
	/**
	 * Replace a value in a printable restriction.
	 */
	replacePrintableRestrictionValues: function(title, finalPrintableRestriction, value){
		var filterValue = getMapValue(finalPrintableRestriction, title);
		if(filterValue && value){
			finalPrintableRestriction = setMapValue(finalPrintableRestriction, title, value);
		}else if(value){
			finalPrintableRestriction.push({'title': title, 'value': value});
		}
		return finalPrintableRestriction;
	}
});

/**
 * Obtain a map({title,value}) value by title.
 * @param map
 * @param title
 * @returns map value for the specified title.
 */
function getMapValue(map, title){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			return map[i].value;
		}
	}
}

/**
 * Replace a map({title,value}) value.
 * @param map
 * @param title
 * @param newVal
 * @returns map after replacement
 */
function setMapValue(map, title, newVal){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			map[i].value = newVal;
			return map;
		}
	}
	return map;
}
