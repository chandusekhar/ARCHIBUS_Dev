var projMngActsAddController = View.createController('projMngActsAdd', {
	
	projMngActsAdd_form0_beforeSave: function() {
		if (this.projMngActsAdd_form0.getFieldValue('activity_log.activity_type') == 'PROJECT - CHANGE ORDER') {
			View.showMessage(getMessage('noChangeOrder'));
			return false;
		}
	}
});

function refreshOpener() {
	if(View.parameters.callback){
		View.parameters.callback();
	}
}