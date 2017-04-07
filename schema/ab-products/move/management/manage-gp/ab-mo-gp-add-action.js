var controllerAbMoGroupAddAction = View.createController('abMoGroupAddAction_Controller', {

    afterInitialDataFetch: function(){
		
		var project_id = this.view.getOpenerView().getOpenerView().panels.items[0].getFieldValue('project.project_id');
		this.action.setFieldValue('activity_log.project_id',project_id);
		
	}
});

/**
 * 	save a form from callFunction command
 * @param {Object} cmdData
 */
function onSaveForm(cmdContext){
	var cmd = cmdContext.command;
	var form = cmd.getParentPanel();
	var wfrId = form.saveWorkflowRuleId;
	if(form.canSave()){
		var record = new Ab.data.Record();
		form.fields.eachKey(function(key){
			var value = form.getFieldValue(key);
			if(!valueExistsNotEmpty(value)){
				value = '';
			}
			record.setValue(key, value);
		});
		try{
			var result = Workflow.callMethod(wfrId, record);
		}catch(e){
			Workflow.handleError(e);
			return false;
		}
	}else{
		return false;
	}
}
