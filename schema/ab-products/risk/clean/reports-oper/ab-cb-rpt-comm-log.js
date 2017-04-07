/**
 * Controller implementation.
 */
var abCbRptCommlogCtrl = View.createController('abCbRptCommlogCtrl', {
	
	// problem type of selected project
	projProbType: null,
	
	// selected project ids
	selectedProjectIds: [],
	
	//printable restriction
	printableRestriction: [],
	
	afterViewLoad: function(){
		// register onMultipleSelectionChange for custom panels
		var objHazardPanel = View.panels.get('abCbHazardId_list'); 
		if (objHazardPanel) {
			objHazardPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objHazardPanel]));
		}
		var objActionPanel = View.panels.get('abCbActionId_list'); 
		if (objActionPanel) {
			objActionPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objActionPanel]));
		}
		
		this.abCbRptCommlogList.addParameter("param_project", getMessage("msg_project"));
		this.abCbRptCommlogList.addParameter("param_hazard", getMessage("msg_hazard"));
	},
	
	afterInitialDataFetch: function(){
		// show list header only
		this.abCbRptCommlogList.show(true, true);
		this.abCbRptCommlogList.clear();
		this.abCbRptCommlogList.actions.get('doc').show(false);
		this.abCbRptCommlogList.actions.get('xls').show(false);
	},
	
	/*
	 * On filter event handler.
	 */
	abCbRptCommlogFilter_onFilter: function(){
		if(!this.validateFilter()){
			return false;
		}
    	this.setRestriction();

		if(this.restriction == null) {
			View.showMessage(getMessage('noProjectSelected'));
       		return;
		}
		
		this.abCbRptCommlogList.refresh(this.restriction);
		this.abCbRptCommlogList.actions.get('doc').show(true);
		
	},
	
	/**
	 * validate filter settings.
	 */
	validateFilter: function(){
		var console = this.abCbRptCommlogFilter;
		console.clearValidationResult();
		var ds = console.getDataSource();
		//check date assessed values
		if(!compareDates(console, 'date_of_comm_from', 'date_of_comm_to', 'msg_field_smaller_than', "<=")){
			return false;
		}
		return true;
		
	},
	
	/**
	 * Sets the controller's attribute 'restriction'
	 * according to the selected projects and the filter console selections
	 */
	setRestriction: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.abCbRptProjects_projectsPanel, 'project.project_id');
		if(this.selectedProjectIds.length == 0)
			return;
		
		this.printableRestriction.length = 0;
		
		this.restriction = "ls_comm.project_id IN ('" + this.selectedProjectIds.join("','") + "')";
		this.printableRestriction.push({'title': getMessage("project"), 'value': this.selectedProjectIds.join(", ")});
		
		this.addConsoleRestriction();
	},

	
	/**
	 * Get filter restriction to project restriction and populate restriction and printableRestriction controller variables.
	 */
	addConsoleRestriction: function(){
		var console = this.abCbRptCommlogFilter;
		var restriction = "";
		var pRestriction = [];
		// communication type
		var commType;
		
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.comm_type"))){
			if(console.hasFieldMultipleValues("ls_comm.comm_type")){
				commType = console.getFieldMultipleValues("ls_comm.comm_type");
				restriction += " AND ls_comm.comm_type IN ('" + commType.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.comm_type").fieldDef.title, 'value': commType.join("','")});
			}else{
				commType = console.getFieldValue("ls_comm.comm_type");
				restriction += " AND ls_comm.comm_type = '" + commType + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.comm_type").fieldDef.title, 'value': commType});
			}
		}
		// dates
		if(valueExistsNotEmpty(console.getFieldValue("date_of_comm_from"))){
			var dateFrom = console.getFieldValue("date_of_comm_from");
			restriction += " AND ls_comm.date_of_comm >= ${sql.date('" + dateFrom + "')}";
			pRestriction.push({'title': console.fields.get("date_of_comm_from").fieldDef.title, 'value': dateFrom});
		}
		
		if(valueExistsNotEmpty(console.getFieldValue("date_of_comm_to"))){
			var dateTo = console.getFieldValue("date_of_comm_to");
			restriction += " AND ls_comm.date_of_comm <= ${sql.date('" + dateTo + "')}";
			pRestriction.push({'title': console.fields.get("date_of_comm_to").fieldDef.title, 'value': dateTo});
		}
		// priority
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.priority"))){
			var priority = console.getFieldValue("ls_comm.priority");
			restriction += " AND ls_comm.priority = '" + priority + "'";
			pRestriction.push({'title': console.fields.get("ls_comm.priority").fieldDef.title, 'value': priority});
		}
		// recorded by
		var recordedBy;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.recorded_by"))){
			if(console.hasFieldMultipleValues("ls_comm.comm_type")){
				recordedBy = console.getFieldMultipleValues("ls_comm.recorded_by");
				restriction += " AND ls_comm.recorded_by IN ('" + recordedBy.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.recorded_by").fieldDef.title, 'value': recordedBy.join("','")});
			}else{
				recordedBy = console.getFieldValue("ls_comm.recorded_by");
				restriction += " AND ls_comm.recorded_by = '" + recordedBy + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.recorded_by").fieldDef.title, 'value': recordedBy});
			}
		}
		// contact code
		var contactId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.contact_id"))){
			if(console.hasFieldMultipleValues("ls_comm.contact_id")){
				contactId = console.getFieldMultipleValues("ls_comm.contact_id");
				restriction += " AND ls_comm.contact_id IN ('" + contactId.join("','") + "')";
				pRestriction.push({'title': console.fields.get("ls_comm.contact_id").fieldDef.title, 'value': contactId.join("','")});
			}else{
				contactId = console.getFieldValue("ls_comm.contact_id");
				restriction += " AND ls_comm.contact_id = '" + contactId + "'";
				pRestriction.push({'title': console.fields.get("ls_comm.contact_id").fieldDef.title, 'value': contactId});
			}
		}
		// hazard id
		var hazardId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.vf_hazard_id"))){
			if(console.hasFieldMultipleValues("ls_comm.vf_hazard_id")){
				hazardId = console.getFieldMultipleValues("ls_comm.vf_hazard_id");
				restriction += " AND ls_comm.activity_log_id IN (" + hazardId.join(",") + ")";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_hazard_id").fieldDef.title, 'value': hazardId.join(",")});
			}else{
				hazardId = console.getFieldValue("ls_comm.vf_hazard_id");
				restriction += " AND ls_comm.activity_log_id = " + hazardId + "";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_hazard_id").fieldDef.title, 'value': hazardId});
			}
		}
		// action id
		var actionId;
		if(valueExistsNotEmpty(console.getFieldValue("ls_comm.vf_action_item_id"))){
			if(console.hasFieldMultipleValues("ls_comm.vf_action_item_id")){
				actionId = console.getFieldMultipleValues("ls_comm.vf_action_item_id");
				restriction += " AND ls_comm.activity_log_id IN (" + actionId.join(",") + ")";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_action_item_id").fieldDef.title, 'value': actionId.join(",")});
			}else{
				actionId = console.getFieldValue("ls_comm.vf_action_item_id");
				restriction += " AND ls_comm.activity_log_id = " + actionId + "";
				pRestriction.push({'title': console.fields.get("ls_comm.vf_action_item_id").fieldDef.title, 'value': actionId});
			}
		}
		// category
		var objCategory = document.getElementById('select_category');
		var category;
		for ( var i = 0; i< objCategory.options.length; i++) {
			if(objCategory.options[i].selected){
				category = objCategory.options[i].value;
				pRestriction.push({'title': console.fields.get("category").fieldDef.title, 'value': objCategory.options[i].text});
				break;
			}
		}

		if(valueExistsNotEmpty(category)){
			if (category == "project"){
				restriction += " AND (ls_comm.project_id IN ('" + this.selectedProjectIds.join("','") + "')";
				restriction += " AND ( ls_comm.activity_log_id IS NULL OR ";
				restriction += " EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id AND activity_log.activity_type <> 'ASSESSMENT - HAZMAT' ";
				restriction += " AND activity_log.project_id IN ('" + this.selectedProjectIds.join("','") + "') )))"; 
			}else if(category == "item"){
				restriction += " AND EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id AND activity_log.activity_type = 'ASSESSMENT - HAZMAT' ";
				restriction += " AND activity_log.project_id IN ('" + this.selectedProjectIds.join("','") + "') )";
			}else {
				restriction += " AND ((ls_comm.project_id IN ('" + this.selectedProjectIds.join("','") + "')";
				restriction += " AND ( ls_comm.activity_log_id IS NULL OR EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id ";
				restriction += " AND activity_log.project_id IN ('" + this.selectedProjectIds.join("','") + "') ";
				restriction += " AND activity_log.activity_type <> 'ASSESSMENT - HAZMAT')))";
				restriction += " OR EXISTS(SELECT 1 FROM activity_log WHERE activity_log.activity_log_id = ls_comm.activity_log_id ";
				restriction += " AND activity_log.project_id IN ('" + this.selectedProjectIds.join("','") + "') ";
				restriction += " AND activity_log.activity_type = 'ASSESSMENT - HAZMAT'))";
			}
		}
		
		if(restriction.indexOf("AND") < 2){
			restriction = restriction.slice(restriction.indexOf("AND")+3, restriction.length);
		}
		
		this.printableRestriction = pRestriction;
		
		this.restriction += " AND " + restriction;
	},
	
	abCbRptCommlogList_onDoc: function(){
		//exportDocWithPrintableRestriction(this.abCbRptCommlogList, this.printableRestriction, "landscape");
		var parameters = {
				'param_project': getMessage("msg_project"),
				'param_hazard': getMessage("msg_hazard"),
				'consoleRestriction': this.restriction,
				'printRestriction':true,
		        'printableRestriction': this.printableRestriction
		};
			
		View.openPaginatedReportDialog("ab-cb-rpt-comm-log-pgrp.axvw", null, parameters);
		
	}
	
});

