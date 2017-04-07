function checkFormFieldsForStep(formName,tableName){
	var form = View.panels.get(formName);
	var stepType = form.getFieldValue(tableName+"_step_waiting.step_type");
	if(stepType == 'approval' || stepType == 'review'){ //hide unnecessary approval fields
		var step = form.getFieldValue(tableName+"_step_waiting.step");
		var status = form.getFieldValue(tableName+".status");

		try {
			var result = Workflow.callMethod('AbBldgOpsHelpDesk-StepService-checkFormFieldsForStep', step,status);	
			if (result.code == 'executed') {
				var data = result.data;
				if(valueExists(data.toHide)){
					for(var i=0;i<data.toHide.length;i++){
						form.showField(tableName+"."+data.toHide[i],false);
					}
				}	
	   		} else {
	       	 	Workflow.handleError(result);
	    	}
      	}  catch (e) {
    		Workflow.handleError(e);
		}	
		
	}
}