var abGbFpDataCopyController = View.createController('abGbFpDataCopyCtrl', {
	
	afterInitialDataFetch: function(){
		var form = this.abGbFpDataCopy_form;
		var bl_id = form.getFieldValue("gb_fp_setup.bl_id");
		var calc_year = form.getFieldValue("gb_fp_setup.calc_year");
		var scenario_id = form.getFieldValue("gb_fp_setup.scenario_id");
		
		$('label_confirm_copy').innerHTML = getMessage("confirmCopy").replace("{1}", bl_id).replace("{2}", calc_year).replace("{3}", scenario_id);
	},

	abGbFpDataCopy_form_onCopy: function(){
		var form = this.abGbFpDataCopy_form;
		var srcBl_id = form.getFieldValue("gb_fp_setup.bl_id");
		var srcCalc_year = parseInt(form.getFieldValue("gb_fp_setup.calc_year"));
		var srcScenario_id = form.getFieldValue("gb_fp_setup.scenario_id");
		var setEmissionsZero = document.getElementById('ckbox_set_zeros').checked;

		try{
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-copyFootprintSources",
					srcBl_id, srcCalc_year, srcScenario_id,
					View.parameters.destBl_id, View.parameters.destCalc_year, View.parameters.destScenario_id,
					setEmissionsZero);
			
			// refresh the opener view
			if(View.parameters.callbackAfterCopy)
				View.parameters.callbackAfterCopy();
			
			View.closeThisDialog();
		}catch(e){
			Workflow.handleError(e);
		}
	}
});
