var abEhsTrackIncidentsUserCtrl = View.createController('abEhsTrackIncidentsUserCtrl', {
	// used for notification
	newValues: null,
	
	// used for notification
	oldValues: null,
	
	// used for notification
	notificationType: "New",
	
	// used for notification
	isNotificationRequired: true,
	
	afterViewLoad: function(){
		this.setGroupLabels();
		// add instruction text
		var msgInstructions = getMessage('msgInstructions');
		msgInstructions = msgInstructions.replace('{0}', this.abEhsTrackIncidentsUser_form.fields.get("ehs_incidents.contact_id").fieldDef.title);
		msgInstructions = msgInstructions.replace('{1}', this.abEhsTrackIncidentsUser_form.fields.get("ehs_incidents.non_em_name").fieldDef.title);
		this.abEhsTrackIncidentsUser_form.setInstructions(msgInstructions);
	},
	
	// set custom labels for field groups
	setGroupLabels: function(){
		$('spanGroupInformation').innerHTML = getMessage('labelGroupInformation');
		$('spanGroupSite').innerHTML = getMessage('labelGroupSite');
		$('spanGroupNonEmployee').innerHTML = getMessage('labelGroupNonEmployee');
	},
	
	// save form record
	abEhsTrackIncidentsUser_form_onSave: function(){
		this.abEhsTrackIncidentsUser_form.clearValidationResult();
		// check mandatory fields
		var incidentId = null;

		// check incident date 
		var dateIncident = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.date_incident");
		var dateCurrent = this.abEhsTrackIncidentsUser_form.getDataSource().formatValue("ehs_incidents.date_incident", new Date(), false);
		if (valueExistsNotEmpty(dateIncident)) {
			var objDateIncident = this.abEhsTrackIncidentsUser_form.getDataSource().parseValue("ehs_incidents.date_incident", dateIncident, false);
			var objDateCurrent = this.abEhsTrackIncidentsUser_form.getDataSource().parseValue("ehs_incidents.date_incident", dateCurrent, false);
			if ( objDateIncident > objDateCurrent ) {
				View.showMessage(getMessage('errDateIncident'));
				return false;
			}
		}
		// check mandatory fields
		if (!this.checkMandatoryFields()) {
			return false;
		}

		// prepare notification field values for WFR
		prepareIncidentNotificationValues('abEhsTrackIncidentsUserCtrl', 'abEhsTrackIncidentsUser_form');
		
		
		if (this.abEhsTrackIncidentsUser_form.save()) {
			incidentId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.incident_id");
			// send notification
			this.sendNotification();
			
			this.notificationType = "Update";
		}
		
	},
	
	abEhsTrackIncidentsUser_form_afterRefresh: function(){
		if (this.abEhsTrackIncidentsUser_form.newRecord) {
			this.notificationType = "New";
			var dateCurrent = this.abEhsTrackIncidentsUser_form.getDataSource().formatValue("ehs_incidents.date_incident", new Date(), false);
			this.abEhsTrackIncidentsUser_form.setFieldValue("ehs_incidents.date_incident", dateCurrent);
		}
		
		var nonEmployee = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.non_em_name");
		this.abEhsTrackIncidentsUser_form.enableField("ehs_incidents.non_em_info", valueExistsNotEmpty(nonEmployee));
	},
	
	// check mandatory fields
	checkMandatoryFields: function(){
		var mandatoryFields = ["ehs_incidents.em_id_affected", "ehs_incidents.contact_id", "ehs_incidents.non_em_name"];
		var mandatoryValues = [];
		var errMessage = getMessage("errMandatoryFields");
		for (var i = 0; i < mandatoryFields.length ; i++) {
			var fieldId = mandatoryFields[i];
			var strPattern = '{' + i + '}';
			var title = this.abEhsTrackIncidentsUser_form.fields.get(fieldId).config.title;
			errMessage =  errMessage.replace(strPattern, title);
			var value = this.abEhsTrackIncidentsUser_form.getFieldValue(fieldId)
			if (valueExistsNotEmpty(value)) {
				mandatoryValues.push(value);
			}
		}
		if (mandatoryValues.length == 0 || mandatoryValues.length > 1) {
			View.showMessage(errMessage);
			return false;
		}
		return true;
	},
	
	// create incident redlines
	abEhsTrackIncidentsUser_form_onCreateRedlines: function(){
		var incidentId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.incident_id");
		var siteId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.site_id");
		var prId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.pr_id");
		var blId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.bl_id");
		var flId = this.abEhsTrackIncidentsUser_form.getFieldValue("ehs_incidents.fl_id");
		var formPanel = this.abEhsTrackIncidentsUser_form;
		var restriction = new Ab.view.Restriction();
		restriction.addClause("ehs_incidents.incident_id", incidentId, "=");
		
		if (valueExistsNotEmpty(incidentId)) {
			// create readline
			createIncidentRedline(incidentId, siteId, prId, blId, flId, function(newSiteId, newPrId, newBlId, newFlId, newRmId, message){
				if (valueExistsNotEmpty(newSiteId)){
					formPanel.setFieldValue("ehs_incidents.site_id", newSiteId);
				}
				if (valueExistsNotEmpty(newPrId)){
					formPanel.setFieldValue("ehs_incidents.pr_id", newPrId);
				}
				if (valueExistsNotEmpty(newBlId)){
					formPanel.setFieldValue("ehs_incidents.bl_id", newBlId);
				}
				if (valueExistsNotEmpty(newFlId)){
					formPanel.setFieldValue("ehs_incidents.fl_id", newFlId);
				}

				if (formPanel.save()){
					View.closeDialog();
				}
				
				if (valueExists(message)) {
					View.showMessage(message);
				}
			});
		}
	},
	
	// send notification if is required
	sendNotification: function() {
		var objEditForm = this.abEhsTrackIncidentsUser_form;
		if (this.isNotificationRequired) {
			var primaryKey = {
					'incident_id' : objEditForm.getFieldValue("ehs_incidents.incident_id")
			};
			
			this.newValues['incident_id'] = objEditForm.getFieldValue("ehs_incidents.incident_id");
			
			notifyEmployee(this.notificationType, 'Incident', primaryKey, this.newValues, this.oldValues);
		}
	}
});

/**
 * Enable/disable non employee infor field
 */
function enableNonEmInfoField(){
	var objForm = View.panels.get("abEhsTrackIncidentsUser_form");
	if (objForm) {
		var nonEmployee = objForm.getFieldValue("ehs_incidents.non_em_name");
		if (!valueExistsNotEmpty(nonEmployee)) {
			objForm.setFieldValue("ehs_incidents.non_em_info", "");
		}
		objForm.enableField("ehs_incidents.non_em_info", valueExistsNotEmpty(nonEmployee));
	}
}