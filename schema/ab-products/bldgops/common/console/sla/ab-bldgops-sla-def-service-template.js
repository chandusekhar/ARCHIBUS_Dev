/**
 * Controller for define service template.
 */
View.createController('defServiceTemplate', {
	/**
	 * response parameter from parent view.
	 */
	responseParameter : null,

	/**
	 * Get response parameter form parent view .
	 */
	afterInitialDataFetch : function() {
		this.responseParameter = View.getOpenerView().currentResponseParameter;
		if (!this.responseParameter.serviceName) {
			var serviceName = SLA_getAutoServiceName(this.responseParameter);

			this.serviceTemplateForm.setFieldValue('serviceTemplateName', serviceName, null, false);
		} else {
			this.serviceTemplateForm.setFieldValue('serviceTemplateName', this.responseParameter.serviceName, null, false);
		}
	},

	/**
	 * Save template name.
	 */
	serviceTemplateForm_onSave : function() {
		var name = this.serviceTemplateForm.getFieldValue('serviceTemplateName');
		if (!this.checkExisting(name)) {
			this.responseParameter.serviceName = name;
			this.responseParameter.serviceTemplate = '1';
			View.getOpenerView().controllers.get('serviceParametersTab').showFieldValues(this.responseParameter);
			View.closeThisDialog();
		} else {
			View.alert(getMessage('templateConflict'));
		}
	},

	/**
	 * Check template name to make sure it is unique.
	 */
	checkExisting : function(name) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('helpdesk_sla_response.service_name', name, '=')
		var records = this.serviceTemplateDS.getRecords(restriction);
		if (records.length > 0) {
			return true;
		} else {
			return false;
		}
	}

});
