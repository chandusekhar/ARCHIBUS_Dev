var abEhsIncidentDetailsDlgCtrl =  View.createController('abEhsIncidentDetailsDlgCtrl', {
	
	afterInitialDataFetch: function(){
		if (valueExistsNotEmpty(window.location.parameters['incident_id'])) {
			var incidentId = window.location.parameters['incident_id'];
			var restr =  new Ab.view.Restriction();
			restr.addClause('ehs_incidents.incident_id', incidentId, '=');
			this.abEhsIncidentDetailsDialog_incident.refresh(restr);
			
			var restr =  new Ab.view.Restriction();
			restr.addClause('ehs_incident_witness.incident_id', incidentId, '=');
			this.abEhsIncidentDetailsDialog_witness.refresh(restr);

			var restr =  new Ab.view.Restriction();
			restr.addClause('ehs_restrictions.incident_id', incidentId, '=');
			this.abEhsIncidentDetailsDialog_workRestr.refresh(restr);

			var restr =  new Ab.view.Restriction();
			restr.addClause('ehs_training_results.incident_id', incidentId, '=');
			this.abEhsIncidentDetailsDialog_training.refresh(restr);
		}
	}
	
});


function exportIncidentDetails(){
	var incidentId = View.panels.get("abEhsIncidentDetailsDialog_incident").getFieldValue("ehs_incidents.incident_id");
	
	var incidentRestriction = new Ab.view.Restriction();
	incidentRestriction.addClause("ehs_incidents.incident_id", incidentId, "=");
	var restriction = {"abEhsIncidentDetailsDialogPgrp_incidentDs": incidentRestriction};
	
	var parameters = {
        'printRestriction': true,
        'orientation': 'landscape'
    };
    
    View.openPaginatedReportDialog("ab-ehs-incident-details-dialog-pgrp.axvw", restriction, parameters);
}