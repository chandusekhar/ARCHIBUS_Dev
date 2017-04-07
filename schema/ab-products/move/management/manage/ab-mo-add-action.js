// ab-mo-add-action.js - Called when adding actions to a move.

var abMoAddActionCtrl = View.createController('abMoAddActionCtrl',{
	afterInitialDataFetch: function(){
		var listActionView = View.getOpenerView().getOpenerView();
		var listActionForm = listActionView.dialogOpenerPanel;
	
		if (listActionForm != null) {
			// find the mo_id from the restriction that is in place.
			var mo_id = listActionForm.restriction['mo.mo_id'];
	
			var restriction = new Ab.view.Restriction({"activity_log.mo_id": mo_id});
			this.panel_abMoAddAction.refresh(restriction);
		}
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
