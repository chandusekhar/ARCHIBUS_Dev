var abEhsRptIncidentsServiceRequestsCtrl = View.createController('abEhsRptIncidentsServiceRequestsCtrl',{	
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsRptIncidentsServiceRequests_console_onFilter: function(){
		var filterRestriction = this.getFilterRestriction(this.abEhsRptIncidentsServiceRequests_console);
		this.abEhsRptIncidentsServiceRequests_grid.refresh(filterRestriction);
	},
	
	getFilterRestriction: function(console){
		var restriction = new Ab.view.Restriction(); 
        
		var fieldId = 'ehs_incidents.incident_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.incident_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.safety_officer';
		restriction = addClauseToRestriction(console, restriction, fieldId);
				
		fieldId = 'ehs_incidents.site_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.pr_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.bl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.fl_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.em_id_affected';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.cause_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'ehs_incidents.injury_category_id';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'activity_log.prob_type';
		restriction = addClauseToRestriction(console, restriction, fieldId);
		
		fieldId = 'activity_log.status';
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