/**
 * Controller for define workflow template.
 */
View.createController('workflowTemplate', {
	/**
	 * response parameter from parent view.
	 */
	responseParameter : null,

	/**
	 * Get response parameter form parent view .
	 */
	afterInitialDataFetch : function() {
		this.responseParameter = View.getOpenerView().currentResponseParameter;
		if (!this.responseParameter.workflowName) {
			var workflowName = SLA_getAutoWorkflowName(this.responseParameter);
			this.workflowTemplateForm.setFieldValue('workflowTemplateName', workflowName, null, false);
		} else {
			this.workflowTemplateForm.setFieldValue('workflowTemplateName', this.responseParameter.workflowName, null, false);
		}
	},

	/**
	 * Save template name.
	 */
	workflowTemplateForm_onSave : function() {
		var name = this.workflowTemplateForm.getFieldValue('workflowTemplateName');
		if (!this.checkExisting(name)) {
			this.responseParameter.workflowName = name;
			this.responseParameter.workflowTemplate = '1';
			View.getOpenerView().controllers.get('onDemandWorkflowTab').showFieldValues(this.responseParameter);
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
		restriction.addClause('helpdesk_sla_response.workflow_name', name, '=')
		var records = this.workflowTemplateDS.getRecords(restriction);
		if (records.length > 0) {
			return true;
		} else {
			return false;
		}
	}

});
