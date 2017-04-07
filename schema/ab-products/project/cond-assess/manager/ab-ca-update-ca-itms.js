/**
 * @author Cristina Moldovan
 * 07/20/2009
 */

/**
 * controller definition
 */
var updateCondAssessController = View.createController('updateCondAssessCtrl',{
	updateFieldNames: [],
	updateFieldTypes: [],
	updateFieldValues: [],

	afterInitialDataFetch: function(){
		if (this.view.getOpenerView().taskInfo.taskId == 'Manage Construction Checklists') {
			this.updateCondAssessPanel.showField('activity_log.activity_type', true);
		} else {
			this.updateCondAssessPanel.showField('activity_log.activity_type', false);
		}
		
		this.updateCondAssessPanel.show();
		this.setStatusSelect();
	},
	
	/**
	 * Calls the workflow rule for updating condition assessment items
	 */
	updateCondAssessPanel_onUpdateRecords: function(){
		var fieldName = "activity_log.cond_priority";
		var type = "";
		var fieldValue = null;
		this.updateFieldNames.length = 0;
		this.updateFieldTypes.length = 0;
		this.updateFieldValues.length = 0;
		
		if (this.view.taskInfo.activityId == 'AbCapitalPlanningCA' || this.view.taskInfo.activityId == 'AbProjCommissioning') {
			fieldName = "activity_log.cond_priority";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate(fieldName, fieldValue, "");
			
			fieldName = "cond_val";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate("activity_log.cond_value", fieldValue, "");
		}else if(this.view.taskInfo.activityId == 'AbRiskES'){
			fieldName = "activity_log.sust_priority";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate(fieldName, fieldValue, "");
			
			fieldName = "sust_val";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate("activity_log.cond_value", fieldValue, "");
		}

		if (this.view.getOpenerView().taskInfo.taskId == 'Manage Construction Checklists') {
			fieldName = "activity_log.activity_type";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate(fieldName, fieldValue, "text");
		}
		fieldName = "activity_log.rec_action";
		fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
		this.addValuesForUpdate(fieldName, fieldValue, "");

		if(this.view.parameters.toUpdate != "condPrCondValRecAction") {
			fieldName = "activity_log.status";
			fieldValue = this.updateCondAssessPanel.getRecord().getValue(fieldName);
			this.addValuesForUpdate(fieldName, fieldValue, "text");

			fieldName = "activity_log.date_scheduled";
			fieldValue = this.updateCondAssessPanel.getFieldValue(fieldName);
			this.addValuesForUpdate(fieldName, fieldValue, "date");
		}
		
		if(this.updateFieldNames.length == 0) {
			View.showMessage(getMessage('noSelectedValue'));
			return;
		}
		var selectedIds = this.view.parameters.selectedIds;
		
		View.openProgressBar(getMessage('updateMessage'));
		try {
			Workflow.callMethod('AbCapitalPlanningCA-ConditionAssessmentService-updateAssessmentItems',
					selectedIds,
					this.updateFieldNames,
					this.updateFieldValues,
					this.updateFieldTypes);
			View.closeProgressBar();
			
			var controller = this;
			var msg = getMessage('msg_save_ok');
			this.updateCondAssessPanel.displayTemporaryMessage(msg);
			if (View.getOpenerView().controllers.get('mngCondAssessCtrl') != null) {
				View.getOpenerView().controllers.get('mngCondAssessCtrl').mngCondAssessFilterPanel_onShow();
			}else {
				View.getOpenerView().controllers.get('caManMyCondAssess').manMyCondAssessFilterPanel_onShow();
			}
		} 
		catch (e) {
			View.closeProgressBar();
			Workflow.handleError(e);
		}

	},
	/**
	 * Adds in the arrays updateFieldNames, updateFieldValues and updateFieldTypes
	 * the given values for update
	 * @param {Object} fieldName The name of the field for update
	 * @param {Object} fieldValue The value of the field for update
	 * @param {Object} fieldType The type of the field for update
	 */
	addValuesForUpdate: function(fieldName, fieldValue, fieldType){
		if(fieldValue != "") {
			this.updateFieldNames.push(fieldName);
			this.updateFieldValues.push(fieldValue);
			this.updateFieldTypes.push(fieldType);
		}
	},

	/**
	 * Removes option elements from the Status select element
	 */
	setStatusSelect: function() {
		var formFields = this.updateCondAssessPanel.fields;
		var statusField = formFields.get(formFields.indexOfKey("activity_log.status")).dom;
		var removed = false;
		
		do {
			removed = false;
			for (var i=0; i<statusField.options.length; i++) {
				var option = statusField.options[i];
				if (option.value != ''
					&& option.value != 'N/A'
					&& option.value != 'BUDGETED'
					&& option.value != 'PLANNED'
					&& option.value != 'SCHEDULED'
					&& option.value != 'IN PROGRESS'
					&& option.value != 'COMPLETED'
					&& option.value != 'COMPLETED-V'
					) {
						statusField.removeChild(option);
						removed = true;
						break;
				}
			}
		} while(removed);
	}	
});
