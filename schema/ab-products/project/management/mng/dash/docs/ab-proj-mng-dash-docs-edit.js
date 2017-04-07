var projMngDashDocsEditController = View.createController('projMngDashDocsEdit', {
	extraProgressFields : ['activity_log.hours_est_design','activity_log.duration_act','activity_log.hours_actual'],
	extraCostFields : ['activity_log.cost_estimated','activity_log.cost_est_cap','activity_log.cost_actual','activity_log.cost_act_cap'],
	
	afterInitialDataFetch: function() {
		this.refreshFormPanels(this.projMngDashDocsEdit_form1.restriction);
	},
	
	showExtraFields: function(form, fields, show) {
		for (var i = 0; i < fields.length; i++) {
			form.showField(fields[i], show);
		}       
		form.actions.get('showMore').show(!show);
		form.actions.get('showLess').show(show);
	},
	
	projMngDashDocsEdit_form3_onShowMore: function() {
		this.showExtraFields(this.projMngDashDocsEdit_form3, this.extraCostFields, true);
	},
	
	projMngDashDocsEdit_form3_onShowLess: function() {
		this.showExtraFields(this.projMngDashDocsEdit_form3, this.extraCostFields, false);
	},
	
	projMngDashDocsEdit_form2_onShowMore: function() {
		this.showExtraFields(this.projMngDashDocsEdit_form2, this.extraProgressFields, true);
	},
	
	projMngDashDocsEdit_form2_onShowLess: function() {
		this.showExtraFields(this.projMngDashDocsEdit_form2, this.extraProgressFields, false);
	},

	refreshFormPanels: function(restriction) {
		this.projMngDashDocsEdit_form2.refresh(restriction);
		this.projMngDashDocsEdit_form3.refresh(restriction);
		this.projMngDashDocsEdit_form4.refresh(restriction);
		this.projMngDashDocsEdit_form5.refresh(restriction);
		
		this.showExtraFields(this.projMngDashDocsEdit_form2, this.extraProgressFields, false);
		this.showExtraFields(this.projMngDashDocsEdit_form3, this.extraCostFields, false);
	},
	
	projMngDashDocsEdit_form1_onSave: function() {
		var valid = true;
		if (!this.projMngDashDocsEdit_form1.save() | !this.projMngDashDocsEdit_form2.save() | !this.projMngDashDocsEdit_form3.save()
			| !this.projMngDashDocsEdit_form4.save() | !this.projMngDashDocsEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projMngDashDocsGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});