var activitytypeEditController = View.createController('activitytypeEdit', {

	activitytypeEditForm_afterRefresh : function() {
		if (this.activitytypeEditForm.newRecord) {
			Ext.get('projectOrMove').dom.parentNode.parentNode.style.display = '';
			this.activitytypeEditForm.setFieldValue('activitytype.activity_type', 'PROJECT - ');
		}
		else {
			Ext.get('projectOrMove').dom.parentNode.parentNode.style.display = 'none';
		}
	},
	
	activitytypeEditForm_onSave : function() {
		var actionType = this.activitytypeEditForm.getFieldValue('activitytype.activity_type');
		if (actionType.indexOf('PROJECT -') != 0 && actionType.indexOf('MOVE -') != 0) {
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


function onChangeActivity()
{
	var activity = Ext.get('projectOrMove').dom.value;
	var form = View.panels.get('activitytypeEditForm');
	form.setFieldValue('activitytype.activity_type', activity + ' - ');
}