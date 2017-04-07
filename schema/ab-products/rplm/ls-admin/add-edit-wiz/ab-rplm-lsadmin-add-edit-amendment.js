var rplmAmendmentController = View.createController('rplmAmendment',{
	selectedId:null,
	leaseId:null,
	refreshControllers:new Array(),
	refreshPanels:new Array(),
	callbackFunction: null,
	afterViewLoad: function(){
		if (valueExists(View.parameters.callback)) {
			this.callbackFunction = View.parameters.callback;
		}
	},
	
	formAmendment_onSave: function(){
		if(this.selectedId == null){
			if(this.formAmendment.getFieldValue('ls_amendment.description').length == 0){
				View.showMessage(getMessage('error_no_description'));
				return;
			}
			var record = this.formAmendment.getRecord();
			record.setValue('ls_amendment.ls_id', this.leaseId);
			this.formAmendment.setRecord(record);
			this.formAmendment.save();
			for (var i = 0; i < this.refreshControllers.length; i++) {
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();			}
			for (var i = 0; i < this.refreshPanels.length; i++) {
				View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
			}
			if (valueExists(this.callbackFunction)) {
				this.callbackFunction()
			}
			this.formAmendment.enableField('ls_amendment.ls_amend_id', false);
			this.selectedId = this.formAmendment.getFieldValue('ls_amendment.ls_amend_id');
		}else{
			this.formAmendment.save();
			for(var i=0;i<this.refreshControllers.length;i++){
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();			}
			for (var i = 0; i < this.refreshPanels.length; i++) {
				View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(View.getOpenerView().panels.get(this.refreshPanels[i]).restriction);
			}
			if (valueExists(this.callbackFunction)) {
				this.callbackFunction()
			}
			View.closeThisDialog();
		}
	},
	formAmendment_onCancel: function(){
		View.closeThisDialog();
	},
	
	formAmendment_onDelete: function(){
		var form = this.formAmendment;
		var controller = this;
        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
                try {
                    form.deleteRecord();
        			for(var i=0;i<controller.refreshControllers.length;i++){
        				View.getOpenerView().controllers.get(controller.refreshControllers[i]).restoreSettings();
        			}
        			for(var i=0;i<controller.refreshPanels.length;i++){
        				View.getOpenerView().panels.get(controller.refreshPanels[i]).refresh(View.getOpenerView().panels.get(controller.refreshPanels[i]).restriction);
        			}
        			if (valueExists(controller.callbackFunction)) {
        				controller.callbackFunction()
        			}
        			View.closeThisDialog();
                } 
                catch (e) {
                	Workflow.handleError(e);
                }
            }
        });
	}
})