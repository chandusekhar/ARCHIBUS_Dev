var projFcpmCpsPkgActAddController = View.createController('projFcpmCpsPkgActAdd', {
	extraProgressFields : ['activity_log.hours_est_design','activity_log.duration_act','activity_log.hours_actual'],
	extraCostFields : ['activity_log.cost_actual','activity_log.cost_act_cap'],
	
	afterInitialDataFetch: function() {		
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form2, this.extraProgressFields, false);
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form3, this.extraCostFields, false);
	},
	
	showExtraFields: function(form, fields, show) {
		for (var i = 0; i < fields.length; i++) {
			form.showField(fields[i], show);
		}       
		form.actions.get('showMore').show(!show);
		form.actions.get('showLess').show(show);
	},
	
	projFcpmCpsPkgActAdd_form0_beforeSave: function() {
		if (this.projFcpmCpsPkgActAdd_form0.getFieldValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
			View.showMessage(getMessage('noChangeOrder'));
			return false;
		}
	},
	
	projFcpmCpsPkgActAdd_form3_onShowMore: function() {
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form3, this.extraCostFields, true);
	},
	
	projFcpmCpsPkgActAdd_form3_onShowLess: function() {
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form3, this.extraCostFields, false);
	},
	
	projFcpmCpsPkgActAdd_form2_onShowMore: function() {
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form2, this.extraProgressFields, true);
	},
	
	projFcpmCpsPkgActAdd_form2_onShowLess: function() {
		this.showExtraFields(this.projFcpmCpsPkgActAdd_form2, this.extraProgressFields, false);
	},
	
	projFcpmCpsPkgActAdd_form1_onSave: function() {
		var valid = true;
		if (this.projFcpmCpsPkgActAdd_form1.getFieldValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
			View.showMessage(getMessage('noChangeOrder'));
			return;
		}
		if (!this.projFcpmCpsPkgActAdd_form1.save() | !this.projFcpmCpsPkgActAdd_form2.save() | !this.projFcpmCpsPkgActAdd_form3.save()
			| !this.projFcpmCpsPkgActAdd_form4.save() | !this.projFcpmCpsPkgActAdd_form5.save()) valid = false;
		View.getOpenerView().panels.get('projFcpmCpsPkgActGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});