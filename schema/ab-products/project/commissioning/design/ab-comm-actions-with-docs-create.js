var commActionsDocsCreateController = View.createController('commActionsDocsCreate', {
	//callback function
	onCompleteForm: null,
	
	commActionsDocsCreateForm2_onSave : function() {
		if (!this.commActionsDocsCreateForm2.save()) return;
		var activity_log_id = this.commActionsDocsCreateForm2.getFieldValue('activity_log.activity_log_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', activity_log_id);
		
		if (this.onCompleteForm) this.onCompleteForm(this);
		this.commActionsDocsCreateTabs.selectTab('commActionsDocsCreatePage3', restriction);
	},
	
	commActionsDocsCreateForm2_onCancel : function() {
		if (this.onCompleteForm) this.onCompleteForm(this);
		View.closeThisDialog();
	},

	commActionsDocsCreateForm3_onSave : function() {
    	if (!this.commActionsDocsCreateForm3.save()) return;

		if (this.onCompleteForm) this.onCompleteForm(this);
		View.closeThisDialog();
	}
});