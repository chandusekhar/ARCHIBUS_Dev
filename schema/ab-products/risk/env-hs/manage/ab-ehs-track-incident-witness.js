var abEhsTrackIncidentWitnessCtrl = View.createController('abEhsTrackIncidentWitnessCtrl', {
	
	/**
	 * On filter event handler.
	 */
	abEhsTrackIncidentsWitness_filter_onFilter: function(){
		if(!this.validateDateFromTo()){
			return false;
		}

		var restriction = this.getConsoleRestriction();
		
		this.abEhsTrackIncidents_grid.refresh(restriction);
		this.abEhsTrackIncidentsWitness_grid.show(false);
		this.abEhsTrackIncidentsWitness_edit.show(false);
	},

	validateDateFromTo: function(){
		var dateFrom = this.abEhsTrackIncidentsWitness_filter.getFieldValue("date_incident_from");
		var dateTo = this.abEhsTrackIncidentsWitness_filter.getFieldValue("date_incident_to");
		if( valueExistsNotEmpty(dateFrom) && valueExistsNotEmpty(dateTo)){
			var objDateFrom = this.abEhsTrackIncidents_ds.parseValue("ehs_incidents.date_incident", dateFrom, false);
			var objDateTo = this.abEhsTrackIncidents_ds.parseValue("ehs_incidents.date_incident", dateTo, false);
			if ( objDateFrom >= objDateTo ) {
				View.showMessage(getMessage("errDateValues"));
				return false;
			}
		}
		return true;
	},

	/**
	 * Gets filter's console restriction.
	 */
	getConsoleRestriction: function(){
		
		var restriction = new Ab.view.Restriction();
		
		var dateFrom = this.abEhsTrackIncidentsWitness_filter.getFieldValue('date_incident_from');
		if(valueExistsNotEmpty(dateFrom)){
			restriction.addClause('ehs_incidents.date_incident', dateFrom, '>=');
		}
		
		var dateTo = this.abEhsTrackIncidentsWitness_filter.getFieldValue('date_incident_to');
		if(valueExistsNotEmpty(dateTo)){
			restriction.addClause('ehs_incidents.date_incident', dateTo, '<=');
		}

		var affectedEmployee = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.em_id_affected');
		if(valueExistsNotEmpty(affectedEmployee)){
			restriction.addClause('ehs_incidents.em_id_affected', affectedEmployee, '=');
		}

		var siteId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.site_id');
		if(valueExistsNotEmpty(siteId)){
			restriction.addClause('ehs_incidents.site_id', siteId, '=');
		}

		var propertyId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.pr_id');
		if(valueExistsNotEmpty(propertyId)){
			restriction.addClause('ehs_incidents.pr_id', propertyId, '=');
		}
		
		var buildingId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.bl_id');
		if(valueExistsNotEmpty(buildingId)){
			restriction.addClause('ehs_incidents.bl_id', buildingId, '=');
		}
		
		var floorId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.fl_id');
		if(valueExistsNotEmpty(floorId)){
			restriction.addClause('ehs_incidents.fl_id', floorId, '=');
		}
		
		var equipId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.eq_id');
		if(valueExistsNotEmpty(equipId)){
			restriction.addClause('ehs_incidents.eq_id', equipId, '=');
		}
		
		var incidentType = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.incident_type');
		if(valueExistsNotEmpty(incidentType)){
			restriction.addClause('ehs_incidents.incident_type', incidentType, '=');
		}

		var incidentId = this.abEhsTrackIncidentsWitness_filter.getFieldValue('ehs_incidents.incident_id');
		if(valueExistsNotEmpty(incidentId)){
			restriction.addClause('ehs_incidents.incident_id', incidentId, '=');
		}

		var responsibleMgr = this.abEhsTrackIncidentsWitness_filter.getFieldValue("ehs_incidents.responsible_mgr");
		if (valueExistsNotEmpty(responsibleMgr)) {
			restriction.addClause("ehs_incidents.responsible_mgr", responsibleMgr, "=");
		}
		
		var safetyOfficer = this.abEhsTrackIncidentsWitness_filter.getFieldValue("ehs_incidents.safety_officer");
		if (valueExistsNotEmpty(safetyOfficer)) {
			restriction.addClause("ehs_incidents.safety_officer", safetyOfficer, "=");
		}
		
		return restriction;
	},

	abEhsTrackIncidentsWitness_edit_afterRefresh: function(){
		onChangeWitnessType();
		// initialization of the form
		if(this.abEhsTrackIncidentsWitness_edit.newRecord){
			// set date recorded to current date
			var currentDateObj = new Date();
			var currentDate = this.abEhsTrackIncidentWitnesses_ds.formatValue("ehs_incident_witness.date_recorded", currentDateObj, false);
			this.abEhsTrackIncidentsWitness_edit.setFieldValue("ehs_incident_witness.date_recorded", currentDate);
			
			// set the incident date (with any date as it won't be saved), just to avoid the validation error
			this.abEhsTrackIncidentsWitness_edit.setFieldValue("ehs_incidents.date_incident", currentDate);
		}
	}
});

function onSave(){
	if(validateRecord()){
		abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.save();
		abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_grid.refresh();
	}
}

function validateRecord(){
	if(!checkWitnessType()){
		return false;
	}
	
	// check that the recorded date is equal or greater than the incident date
	var form = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit;
	var dateRecorded = form.getFieldValue("ehs_incident_witness.date_recorded");
	if(valueExistsNotEmpty(dateRecorded) && dateRecorded < form.getFieldValue("ehs_incidents.date_incident")){
		View.showMessage(getMessage("dateRecordedSmallerThanIncidentDate"));
		return false;
	}
	
	
	return true;
}

function checkWitnessType(){
	var emId = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.getFieldValue('ehs_incident_witness.em_id'); 
	var emLabel = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.fields.get('ehs_incident_witness.em_id').config.title; 
	var contactId = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.getFieldValue('ehs_incident_witness.contact_id'); 
	var contactLabel = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.fields.get('ehs_incident_witness.contact_id').config.title; 
	var nonEmName = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.getFieldValue('ehs_incident_witness.non_em_name');
	var nonEmNameLabel = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.fields.get('ehs_incident_witness.non_em_name').config.title;
	var witnessType = abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.getFieldValue('ehs_incident_witness.witness_type');
	var returnValue = true;
	
	// check the entering of one of the names for Employee Name, Non-Employee Name and Non-Employee Contact
	if(	   !valueExistsNotEmpty(emId) 
		&& !valueExistsNotEmpty(contactId) 
		&& !valueExistsNotEmpty(nonEmName)){
		
		returnValue = false;
		
	} else{
		if(	(  valueExistsNotEmpty(emId) && valueExistsNotEmpty(nonEmName)) 
			|| (valueExistsNotEmpty(emId) && valueExistsNotEmpty(contactId))
			|| (valueExistsNotEmpty(contactId) && valueExistsNotEmpty(nonEmName))
		){
			
			returnValue = false;		
		}
	}
	
	if(!returnValue){
		View.showMessage(getMessage("insertAtLeastOneField").replace("{0}", emLabel).replace("{1}", contactLabel).replace("{2}", nonEmNameLabel));
		return returnValue;
	}
	
	// check if the selected witness type matches the type of the entered name
	if(witnessType == "Employee"){
		// if Employee Type selected, the employee name should be entered and the non employee name and contact should be empty
		if(!(valueExistsNotEmpty(emId) && !valueExistsNotEmpty(nonEmName) && !valueExistsNotEmpty(contactId))){
			returnValue = false;
		}
	} else {
		// if Non-Employee Type selected, the employee name should be empty and one of the non employee name and contact should be entered
		if(!(!valueExistsNotEmpty(emId) && (valueExistsNotEmpty(nonEmName) || valueExistsNotEmpty(contactId)))){
			returnValue = false;
		}
	}
	
	if(!returnValue){
		View.showMessage(getMessage("witnessTypeNotMatch"));
		return returnValue;
	}
	
	return returnValue;
}

function onDelete(){
	var controller = abEhsTrackIncidentWitnessCtrl;
	View.confirm(getMessage('confirmDelete'), function(button){
        if (button == 'yes') {
            controller.abEhsTrackIncidentsWitness_edit.deleteRecord();
            controller.abEhsTrackIncidentsWitness_grid.refresh();
            controller.abEhsTrackIncidentsWitness_edit.show(false);
        }
        else 
        	controller.close();
    });
}

function enableDeleteButton(enable){
	if(enable){
		abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.actions.get('delete').forceDisable(false);
	}
	abEhsTrackIncidentWitnessCtrl.abEhsTrackIncidentsWitness_edit.enableButton('delete', enable);
}

/**
 * Enable /disable fields based on witness type
 * KB: 3038633
 */
function onChangeWitnessType(){
	var form = View.panels.get("abEhsTrackIncidentsWitness_edit");
	var witnessType = form.getFieldValue("ehs_incident_witness.witness_type");
	if (witnessType == 'Employee') {
		form.enableField("ehs_incident_witness.em_id", true);
		form.enableField("ehs_incident_witness.contact_id", false);
		form.enableField("ehs_incident_witness.non_em_name", false);
		form.setFieldValue("ehs_incident_witness.contact_id", "");
		form.setFieldValue("ehs_incident_witness.non_em_name", "");
	}else{
		form.enableField("ehs_incident_witness.contact_id", true);
		form.enableField("ehs_incident_witness.non_em_name", true);
		form.enableField("ehs_incident_witness.em_id", false);
		form.setFieldValue("ehs_incident_witness.em_id", "");
	}
}