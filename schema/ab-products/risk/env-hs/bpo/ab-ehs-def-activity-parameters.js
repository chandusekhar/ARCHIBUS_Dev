var abEhsDefActivityParametersCtrl = View.createController('abEhsDefActivityParametersCtrl',{
		paramForm_beforeSave: function(){
			var booleanParameters = ["NotifyMedicalMonitoring","NotifyPpe","NotifyTraining"];
			var grid = this.paramGrid;
			var selectedRow = grid.rows[grid.selectedRowIndex];
			var paramId = selectedRow["afm_activity_params.param_id"];
			var selectParamValue = document.getElementById("cboParamValue");
			if(booleanParameters.indexOf(paramId)!=-1){
				var paramValue = selectParamValue.options[selectParamValue.selectedIndex].value;
				this.paramForm.setFieldValue("afm_activity_params.param_value",paramValue);
			}
		},
		
		paramGrid_onReloadParameters: function() {
			try {
				Workflow.callMethod('AbSystemAdministration-ConfigHandlers-reloadActivityParameters');
				View.showMessage(getMessage('activityParametersReloaded'));
			} catch (e) {
				Workflow.handleError(e);
			}
		}

});

/**
 * Refresh form paramsForm by restriction of afm_activity_params.param_id
 */

function callActivtyParam(){
	var grid = View.panels.get('paramGrid');
	var form = View.panels.get('paramForm');
    var selectedRow = grid.rows[grid.selectedRowIndex];
    var paramId = selectedRow["afm_activity_params.param_id"];
    
    var restriction = new Ab.view.Restriction();
    restriction.addClause("afm_activity_params.param_id", paramId, "=", true);

    var booleanParameters = ["NotifyMedicalMonitoring","NotifyPpe","NotifyTraining"];
    var selectObj = document.getElementById("cboParamValue");
    if(booleanParameters.indexOf(paramId)!=-1){
    	form.showField("afm_activity_params.param_value",false);
        if(selectObj.parentNode.parentNode){
        	//display line
        	selectObj.parentNode.parentNode.style.display= ''; 
        	
        	//get title from param_value field and set it to the select field(need to be set before form refresh)
        	var title = form.fields.get("afm_activity_params.param_value").fieldDef.title;
        	form.fields.item("vf_param_value").config.title = title;
        }
    }else{
        if(selectObj.parentNode.parentNode){
        	selectObj.parentNode.parentNode.style.display= 'none'; 
        }
    	form.showField("afm_activity_params.param_value",true);
    }
	
    form.refresh(restriction);
    
    //select Yes or No depending on param_value
    document.getElementById("cboParamValue").value = form.getFieldValue("afm_activity_params.param_value");
}
