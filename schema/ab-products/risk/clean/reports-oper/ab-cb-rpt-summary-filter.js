var abCbRptSummaryFilterController = View.createController('abCbRptSummaryFilterCtrl',{
	// selected projects + console restriction
	restriction: null,
	
	printableRestriction: [],
	
	/* array of {table.field, field title, field value} objects
	 * to display in the <instructions> element
	 */
	instrLabels: [],
	
	// the controller of the container view
	panelsCtrl: null,
	
	// the <tabs> element in the container view
	tabsObject: null,

	/**
	 * Shows the report grid according to the user restrictions
	 */
	abCbRptSummaryFilter_console_onFilter:function(){
    	// validateDates
    	var startDate = this.abCbRptSummaryFilter_console.getFieldValue("activity_log.date_assessed");
    	var endDate = this.abCbRptSummaryFilter_console.getFieldValue("activity_log.date_required");
    	if(!validateDates(startDate, endDate))
        	return;

    	this.setRestriction();

		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}

		for (var i = 0; i < this.panelsCtrl.panelsRestriction.length; i++) {
			var panelRestriction = this.panelsCtrl.panelsRestriction[i];

			// set the restriction to null
			panelRestriction.restriction = null;
			
			// refresh the panel with the filter restriction
			View.panels.get(panelRestriction.id).refresh(this.restriction);
		}

		this.tabsObject.selectTab(this.tabsObject.tabs[0].name);
		
		this.panelsCtrl.setInstructions(this.instrLabels);
	},
	
	/**
	 * Sets the controller's attribute 'restriction'
	 * according to the selected projects and the filter console selections
	 */
	setRestriction: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.abCbRptProjects_projectsPanel, 'project.project_id');
		if(selectedProjectIds.length == 0)
			return;

		this.instrLabels.length = 0;
		this.printableRestriction.length = 0;
		
		this.restriction = "activity_log.project_id IN ('" + selectedProjectIds.join("','") + "')";
		this.instrLabels.push({field: "activity_log.project_id", title: getMessage("project"), value: selectedProjectIds.join(", ")});
		this.printableRestriction.push({'title': getMessage("project"), 'value': selectedProjectIds.join(", ")});
		
		this.addConsoleRestriction();
	},

	/**
	 * Adds restriction to the controller restriction, according to the filter console selections
	 */
	addConsoleRestriction: function() {
		var console = this.abCbRptSummaryFilter_console;

		var regnId = console.hasFieldMultipleValues("bl.regn_id") ? console.getFieldMultipleValues("bl.regn_id") : console.getFieldValue("bl.regn_id");
		if(valueExistsNotEmpty(regnId)){
			var existsClause = "EXISTS(SELECT regn_id FROM bl WHERE bl.bl_id = activity_log.bl_id AND bl.regn_id {0})";
			var title = getTitleOfConsoleField(console, "bl.regn_id");
			if(typeof(regnId) === 'object' && regnId instanceof Array){
				this.restriction += " AND " + existsClause.replace("{0}", "IN ('" + regnId.join("','") + "')");
				this.instrLabels.push({field: "bl.regn_id", title: title, value: regnId.join(", ")});
				this.printableRestriction.push({'title': title, 'value': regnId.join(", ")});
			} else {
				this.restriction += " AND " + existsClause.replace("{0}", "= '" + regnId + "'");
				this.instrLabels.push({field: "bl.regn_id", title: title, value: regnId});
				this.printableRestriction.push({'title': title, 'value': regnId});
			}
		}
		
		this.restriction += getRestrictionForField(console, "activity_log.site_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.bl_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.fl_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.rm_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.prob_type", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_status_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_cond_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_loc_typ_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rank_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_haz_rating_id", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.repair_type", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.assessed_by", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.assigned_to", this.instrLabels, this.printableRestriction);
		this.restriction += getRestrictionForField(console, "activity_log.hcm_abate_by", this.instrLabels, this.printableRestriction);
		
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
			this.instrLabels.push({field: "hcm_is_hazard_or1", title: title, value: isHazardPrint});
			this.printableRestriction.push({'title': title, 'value': isHazardPrint});
		}
		
		var isFriable = console.getFieldValue('activity_log.hcm_friable');
        if (valueExistsNotEmpty(isFriable)) {
        	var title = getTitleOfConsoleField(console, "activity_log.hcm_friable");
        	this.restriction += " AND activity_log.hcm_friable = '" + isFriable + "'";
			this.instrLabels.push({field: "activity_log.hcm_friable", title: title, value: isFriable});
			this.printableRestriction.push({'title': title, 'value': isFriable});
		}

        var date_from = console.getFieldValue('activity_log.date_assessed');
        if (valueExistsNotEmpty(date_from)) {
        	var title = getTitleOfConsoleField(console, "activity_log.date_assessed");
        	this.restriction += " AND activity_log.date_assessed >= ${sql.date('" + date_from + "')}";
			this.instrLabels.push({field: "activity_log.date_assessed", title: title, value: date_from});
			this.printableRestriction.push({'title': title, 'value': date_from});
		}
		
        var date_to = console.getFieldValue('activity_log.date_required');
		if (valueExistsNotEmpty(date_to)) {
			var title = getTitleOfConsoleField(console, "activity_log.date_required");
			this.restriction += " AND activity_log.date_assessed <= ${sql.date('" + date_to + "')}";
			this.instrLabels.push({field: "activity_log.date_required", title: title, value: date_to});
			this.printableRestriction.push({'title': title, 'value': date_to});
		}
	}
});
