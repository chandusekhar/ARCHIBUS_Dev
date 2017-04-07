var projectRequestEditPage2Controller = View.createController('projectRequestEditPage2', {
	
	afterInitialDataFetch : function() {
		var requestor = this.projectRequestEditPage2Form.getFieldValue('project.requestor');
		if (requestor == '') {
			this.projectRequestEditPage2Form.show(false, true);
			View.showMessage(getMessage('missingUserInfo'));
		}
	}
});
