var abEhsRptRecentIncitentsCtrl = View.createController('abEhsRptRecentIncitentsCtrl',{
	afterViewLoad: function(){
		var message =getMessage('instructionsLabel').replace('{0}', View.activityParameters['AbRiskEHS-IncidentsDaysDeadline']); 
		message += "<br />" + getMessage('incidentInstructionsLabel');
		this.abEhsRptRecentIncitents_grid.setInstructions(message);
		this.abEhsRptRecentIncitents_grid.addParameter('IncidentsDaysDeadline',View.activityParameters['AbRiskEHS-IncidentsDaysDeadline']);
	},
	
	afterInitialDataFetch: function(){
		var currentDate = new Date();
		var uiCurrentDate = currentDate.format(View.dateFormat);
		this.abEhsRptRecentIncitents_console.setFieldValue('date_incident_to', uiCurrentDate);
		
		var oldDate = new Date();
		oldDate.setDate(oldDate.getDate()-View.activityParameters['AbRiskEHS-IncidentsDaysDeadline']);
		var uiOldDate = oldDate.format(View.dateFormat);
		this.abEhsRptRecentIncitents_console.setFieldValue('date_incident_from', uiOldDate);
	},
	
	/**
	 * Shows the report according to the user restriction
	 */
	abEhsRptRecentIncitents_console_onFilter: function(){
		var filterRestriction = getFilterRestriction(this.abEhsRptRecentIncitents_console);
		this.abEhsRptRecentIncitents_grid.refresh(filterRestriction);
	}
});

function getFilterRestriction(console){
	var restriction = console.getFieldRestriction(); 
	
	restriction.removeClause("ehs_incidents.date_incident");
	
	return restriction;
}