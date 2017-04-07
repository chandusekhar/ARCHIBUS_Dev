var commEqDetailsDocCreateController = View.createController('commEqDetailsDocCreate', {
	//callback function
	onCompleteForm: null,
	eqRecord: null,
	
	afterInitialDataFetch: function() {
		this.commEqDetailsDocCreateForm1.setFieldValue('activity_log.project_id', '');
	},
	
	commEqDetailsDocCreateForm2_onSave : function() {
		if (!this.commEqDetailsDocCreateForm2.save()) return;
		var activity_log_id = this.commEqDetailsDocCreateForm2.getFieldValue('activity_log.activity_log_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.activity_log_id', activity_log_id);
		
		if (this.onCompleteForm) this.onCompleteForm(this);
		this.commEqDetailsDocCreateTabs.selectTab('commEqDetailsDocCreatePage3', restriction);
		if (this.eqRecord) {
			this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.eq_id', this.eqRecord.getValue('eq.eq_id'));
			this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.site_id', this.eqRecord.getValue('eq.site_id'));
			this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.bl_id', this.eqRecord.getValue('eq.bl_id'));
			this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.fl_id', this.eqRecord.getValue('eq.fl_id'));
			this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.rm_id', this.eqRecord.getValue('eq.rm_id'));
		}
		this.commEqDetailsDocCreateForm3.setFieldValue('activity_log.status', 'APPROVED');
		
	},
	
	commEqDetailsDocCreateForm2_onCancel : function() {
		if (this.onCompleteForm) this.onCompleteForm(this);
		View.closeThisDialog();
	},

	commEqDetailsDocCreateForm3_onSave : function() {
    	if (!this.commEqDetailsDocCreateForm3.save()) return;

		if (this.onCompleteForm) this.onCompleteForm(this);
		View.closeThisDialog();
	}
});