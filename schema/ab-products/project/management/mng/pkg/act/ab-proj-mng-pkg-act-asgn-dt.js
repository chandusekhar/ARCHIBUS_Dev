var projMngPkgActAsgnDtController = View.createController('projMngPkgActAsgnDt', {
	extraProgressFields : ['activity_log.hours_est_design','activity_log.duration_act','activity_log.hours_actual'],
	extraCostFields : ['activity_log.cost_estimated','activity_log.cost_est_cap','activity_log.cost_actual','activity_log.cost_act_cap'],
	
	afterInitialDataFetch: function() {
		this.projMngPkgActAsgnDt_form2.refresh(this.projMngPkgActAsgnDt_form1.restriction);
		this.projMngPkgActAsgnDt_form3.refresh(this.projMngPkgActAsgnDt_form1.restriction);
		this.projMngPkgActAsgnDt_form4.refresh(this.projMngPkgActAsgnDt_form1.restriction);
		this.projMngPkgActAsgnDt_form5.refresh(this.projMngPkgActAsgnDt_form1.restriction);
		
		this.showExtraFields(this.projMngPkgActAsgnDt_form2, this.extraProgressFields, false);
		this.showExtraFields(this.projMngPkgActAsgnDt_form3, this.extraCostFields, false);
	},
	
	showExtraFields: function(form, fields, show) {
		for (var i = 0; i < fields.length; i++) {
			form.showField(fields[i], show);
		}       
		form.actions.get('showMore').show(!show);
		form.actions.get('showLess').show(show);
	},
	
	projMngPkgActAsgnDt_form3_onShowMore: function() {
		this.showExtraFields(this.projMngPkgActAsgnDt_form3, this.extraCostFields, true);
	},
	
	projMngPkgActAsgnDt_form3_onShowLess: function() {
		this.showExtraFields(this.projMngPkgActAsgnDt_form3, this.extraCostFields, false);
	},
	
	projMngPkgActAsgnDt_form2_onShowMore: function() {
		this.showExtraFields(this.projMngPkgActAsgnDt_form2, this.extraProgressFields, true);
	},
	
	projMngPkgActAsgnDt_form2_onShowLess: function() {
		this.showExtraFields(this.projMngPkgActAsgnDt_form2, this.extraProgressFields, false);
	}
});