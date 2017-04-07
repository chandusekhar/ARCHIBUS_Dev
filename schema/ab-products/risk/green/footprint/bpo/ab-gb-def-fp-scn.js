/**
 * controller implementation
 */
var abGbDefFpScnCtrl = View.createController('abGbDefFpScnCtrl', {
	abGbDefFpScn_edit_onSave: function(){
		var record = this.abGbDefFpScn_edit.getRecord();
		
		if(this.abGbDefFpScn_edit.canSave()){
			try{
				Workflow.callMethod("AbRiskGreenBuilding-FootprintService-saveScenario", "ab-gb-def-fp-scn.axvw", "abGbDefFpScn_ds", record);
				this.abGbDefFpScn_pkey.refresh();
			}catch(e){
				Workflow.handleError(e);
			}
		}
	},
	
	abGbDefFpScn_edit_onDelete: function() {
		var record = this.abGbDefFpScn_edit.getRecord();
		var scenarioId = this.abGbDefFpScn_edit.getFieldValue("scenario.proj_scenario_id");
		var message = getMessage("confirm_delete").replace('{0}', "[" + scenarioId + "]");
		var controller = this;
		View.confirm(message, function(button){
			if (button == 'yes') {
				try {
					Workflow.callMethod("AbRiskGreenBuilding-FootprintService-deleteScenario", "ab-gb-def-fp-scn.axvw", "abGbDefFpScn_ds", record);
					controller.abGbDefFpScn_pkey.refresh();
					controller.abGbDefFpScn_edit.show(false, true);
				} catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	}
});