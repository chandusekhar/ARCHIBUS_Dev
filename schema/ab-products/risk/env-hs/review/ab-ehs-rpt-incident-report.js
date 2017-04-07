var abEhsRptIncidentReportCtrl = View.createController('abEhsRptIncidentReportCtrl',{
	userRestricted: false,
	
	afterViewLoad: function(){
		/*
		 * restrict data to the user's employee ?
		 * Yes if from "EHS - Employee Review" process and "Employee Incidents" task
		 */
		if(View.taskInfo.processId == "EHS - Employee Review" && View.taskInfo.taskId == 'Employee Incidents'){
			// employee
			this.userRestricted = true;
		} else if(View.taskInfo.processId == "EHS - Review" && View.taskInfo.taskId == 'Incident Report'){
			// manager
			this.userRestricted = false;
		} else {
			// default
			this.userRestricted = false;
		}
	},
	
	afterInitialDataFetch: function(){
		// For Employee Review, the data is restricted to current user's employee, so display his data
		if(this.userRestricted){
			this.abEhsRptIncidentReport_consoleEm.show(true);
			this.initConsole(this.abEhsRptIncidentReport_consoleEm);
			this.abEhsRptIncidentReport_consoleEm.enableField('ehs_incidents.em_id_affected', false);
			this.view.setTitle(getMessage("employeeReportTitle"));
		}else{
			this.abEhsRptIncidentReport_console.show(true);
			this.initConsole(this.abEhsRptIncidentReport_console);
		}
	},
	
	clearForm: function(commandContext){
		var console = View.panels.get(commandContext.parentPanelId);
		console.clear();
		this.initConsole(console);
	},
	
	initConsole: function(console){
		// For Employee Review, restrict the data to current user's employee
		if(this.userRestricted){
			console.setFieldValue('ehs_incidents.em_id_affected', View.user.employee.id);
		}
	},
	
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsRptIncidentReport_console_onFilter: function(){
		this.filter(this.abEhsRptIncidentReport_console);
	},
	
	abEhsRptIncidentReport_consoleEm_onFilter: function(){
		this.filter(this.abEhsRptIncidentReport_consoleEm);
	},
	
	filter: function(console){
		//incident_type is mandatory only for manager
	    var fieldValue = console.getFieldValue('ehs_incidents.incident_type');
		if(!valueExistsNotEmpty(fieldValue) && !this.userRestricted){
			View.showMessage(getMessage('noIncidentTypeSelected'));
	   		return;
		}
		
		var filterRestriction = this.getFilterRestriction(console);
		this.abEhsRptIncidentReport_grid.refresh(filterRestriction);
	},
	
	getFilterRestriction: function(console){
		var restriction = new Ab.view.Restriction(); 
	    
		var fieldId = 'ehs_incidents.incident_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.incident_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.site_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.pr_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.bl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.fl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.rm_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.em_id_affected';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.eq_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.responsible_mgr';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.cause_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.injury_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.injury_area_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		if(console.getFieldValue('date_incident_from')){
			restriction.addClause('ehs_incidents.date_incident', console.getFieldValue('date_incident_from'), '>=');
		}
		if(console.getFieldValue('date_incident_to')){
			restriction.addClause('ehs_incidents.date_incident', console.getFieldValue('date_incident_to'), '<=');
		}
		
		return restriction;
	}
});
