var abEnergyConfigureBillProcessing = View.createController('abEnergyConfigureBillProcessing', {
	
	afterViewLoad: function(){
		var res = new Ab.view.Restriction();
		res.addClause('afm_activity_params.param_id','CheckForMonthlyBills','=');
		this.params_form.restriction = res;
	},
	
	afterInitialDataFetch: function(){
		var value = this.params_form.getFieldValue('afm_activity_params.param_value');
		var res = new Ab.view.Restriction();
		res.addClause('afm_activity_params.param_id','CheckForMonthlyBillsExcludeTypes','=');
		this.params_form2.refresh(res);
		if (parseInt(value)==1){
			$('selectValue_yes').selected= true;
			if (this.params_form2.getFieldValue('afm_activity_params.param_value') == 'None'){
				this.params_form2.setFieldValue('afm_activity_params.param_value',"");
			}
		}else{
			this.params_form2.show(false);
		}
	},
	
	params_form_onSave: function(){
		var dataSource = this.parameter_ds;
		var res = new Ab.view.Restriction();
		res.addClause('afm_activity_params.param_id','CheckForMonthlyBills','=');
		var record = dataSource.getRecord(res);
		record.setValue('afm_activity_params.param_value',$('selectValue').value);
		dataSource.saveRecord(record);
		res = new Ab.view.Restriction();
		res.addClause('afm_activity_params.param_id','CheckForMonthlyBillsExcludeTypes','=');
		record = dataSource.getRecord(res);
		var paramValue = this.params_form2.getFieldValue('afm_activity_params.param_value').split(/, \u200c/g).join();
		paramValue = (paramValue == '') ? "None" : paramValue;
		record.setValue('afm_activity_params.param_value',paramValue);
		dataSource.saveRecord(record);
		View.showMessage(getMessage("saved"));
	}
	
});

function changeValue(){
	var controller = View.controllers.get('abEnergyConfigureBillProcessing');
	var value = $('selectValue').value;
	if (parseInt(value)==1){
		controller.params_form2.show(true);
		if (controller.params_form2.getFieldValue('afm_activity_params.param_value') == 'None'){
			controller.params_form2.setFieldValue('afm_activity_params.param_value',"");
		}
	}else{
		controller.params_form2.show(false);
	}
}