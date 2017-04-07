var activitytypeEditController = View.createController('activitytypeEdit', {

	activitytypeEditForm_afterRefresh : function() {
		if (View.taskInfo.activityId == 'AbMoveManagement') this.activitytypeEditForm.setInstructions(getMessage('moveInstr'));
		if (this.activitytypeEditForm.newRecord) {
			this.activitytypeEditForm.setFieldValue('activitytype.activity_type', 'TAX - ');
		}
	},
	
	activitytypeEditForm_onSave : function() {
		var actionType = this.activitytypeEditForm.getFieldValue('activitytype.activity_type');
		if (actionType.indexOf('TAX -') != 0) {
			View.showMessage(getMessage('invalidPrefix'));
			onChangeActivity();
			return false;
		}
		else {
			this.activitytypeEditForm.save();
			this.activitytypeEditGrid.refresh();
		}
	}
});