var projFcpmCpsPkgActEditController = View.createController('projFcpmCpsPkgActEdit', {
	extraProgressFields : ['activity_log.date_started','activity_log.date_completed','activity_log.duration','activity_log.hours_est_design','activity_log.duration_act','activity_log.hours_actual'],
	extraCostFields : ['activity_log.cost_estimated','activity_log.cost_est_cap','activity_log.cost_actual','activity_log.cost_act_cap'],
	
	afterInitialDataFetch: function() {	
		this.projFcpmCpsPkgActEdit_form2.refresh(this.projFcpmCpsPkgActEdit_form1.restriction);
		this.projFcpmCpsPkgActEdit_form3.refresh(this.projFcpmCpsPkgActEdit_form1.restriction);
		this.projFcpmCpsPkgActEdit_form5.refresh(this.projFcpmCpsPkgActEdit_form1.restriction);
		
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form2, this.extraProgressFields, false);
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form3, this.extraCostFields, false);
		
		for (var i = 0; i < 6; i++) {
			this.projFcpmCpsPkgActEdit_form2.getFieldElement('activity_log.status').options[i].setAttribute("disabled", "true");
		}
		var activity_type = this.projFcpmCpsPkgActEdit_form1.getFieldValue('activity_log.activity_type');
		var status = this.projFcpmCpsPkgActEdit_form2.getFieldValue('activity_log.status');
		if (activity_type == 'PROJECT - CHANGE ORDER' && status == 'REQUESTED') this.projFcpmCpsPkgActEdit_form2.enableField('activity_log.status', false);
	},
	
	showExtraFields: function(form, fields, show) {
		for (var i = 0; i < fields.length; i++) {
			form.showField(fields[i], show);
		}       
		form.actions.get('showMore').show(!show);
		form.actions.get('showLess').show(show);
	},
	
	projFcpmCpsPkgActEdit_form3_onShowMore: function() {
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form3, this.extraCostFields, true);
	},
	
	projFcpmCpsPkgActEdit_form3_onShowLess: function() {
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form3, this.extraCostFields, false);
	},
	
	projFcpmCpsPkgActEdit_form2_onShowMore: function() {
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form2, this.extraProgressFields, true);
	},
	
	projFcpmCpsPkgActEdit_form2_onShowLess: function() {
		this.showExtraFields(this.projFcpmCpsPkgActEdit_form2, this.extraProgressFields, false);
	},
	
	projFcpmCpsPkgActEdit_form1_onStopAction : function() {
		this.projFcpmCpsPkgActEdit_form2.setFieldValue('activity_log.status', 'STOPPED');
		this.saveForms();
	},
	
	projFcpmCpsPkgActEdit_form1_onCancelAction : function() {
		var controller = this;
		View.confirm(getMessage('cancelledNotVisible'), function(button){
            if (button == 'yes') {
            	controller.projFcpmCpsPkgActEdit_form2.setFieldValue('activity_log.status', 'CANCELLED');
        		controller.saveForms();
            }
            else {
                
            }
        });		
	},
	
	projFcpmCpsPkgActEdit_form1_onSave: function() {
		var status = this.projFcpmCpsPkgActEdit_form2.getFieldValue('activity_log.status');
		if (status == 'CANCELLED' || status == 'REJECTED') {
			var message = '';
			if (status == 'CANCELLED') {
				message = getMessage('cancelledNotVisible');
			} else if (status == 'REJECTED') {
				message = getMessage('rejectedNotVisible');
			}
			var controller = this;
			View.confirm(message, function(button){
	            if (button == 'yes') {
	        		controller.saveForms();
	            }
	            else {
	                return;
	            }
	        });
		}
		else this.saveForms();
	},
	
	saveForms: function() {
		var valid = true;
		if (!this.projFcpmCpsPkgActEdit_form1.save() | !this.projFcpmCpsPkgActEdit_form2.save() | !this.projFcpmCpsPkgActEdit_form3.save()
			| !this.projFcpmCpsPkgActEdit_form5.save()) valid = false;
		View.getOpenerView().panels.get('projFcpmCpsPkgActGrid').refresh();
		
		if (valid) View.closeThisDialog();		
		else View.showMessage(getMessage('invalidFields'));
	}
});