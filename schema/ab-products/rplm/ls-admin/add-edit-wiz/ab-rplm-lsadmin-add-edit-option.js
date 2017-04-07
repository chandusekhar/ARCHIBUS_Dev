var rplmOptionController = View.createController('rplmOption',{
	selectedId:null,
	leaseId:null,
	refreshControllers:new Array(),
	refreshPanels: new Array(),
	formOption_onSave: function(){
		if(!datesValidated(this.formOption)){
			return;
		}
		
		if(this.selectedId == null){
			if(this.formOption.getFieldValue('op.description').length == 0){
				View.showMessage(getMessage('error_no_description'));
				return;
			}
			/*
			 * 03/29/2010 IOAN KB 3026736
			 */
			if(this.formOption.canSave()){
				this.formOption.save();
				for (var i = 0; i < this.refreshControllers.length; i++) {
					View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
				}
				for (var i = 0; i < this.refreshPanels.length; i++) {
					View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(this.refreshPanels[i].restriction);
				}
				this.formOption.enableField('op.op_id', false);
				this.selectedId = this.formOption.getFieldValue('op.op_id');
			}
		}else{
			this.formOption.save();
			for(var i=0;i<this.refreshControllers.length;i++){
				View.getOpenerView().controllers.get(this.refreshControllers[i]).restoreSettings();
			}
			for (var i = 0; i < this.refreshPanels.length; i++) {
				View.getOpenerView().panels.get(this.refreshPanels[i]).refresh(this.refreshPanels[i].restriction);
			}
			View.closeThisDialog();
		}
	},
	formOption_onCancel: function(){
		View.closeThisDialog();
	},
	formOption_onDelete: function(){
		var form = this.formOption;
		var controller = this;
        View.confirm(getMessage("confirmDelete"), function(button){
            if (button == 'yes') {
                try {
                    form.deleteRecord();
        			for(var i=0;i<controller.refreshControllers.length;i++){
        				View.getOpenerView().controllers.get(controller.refreshControllers[i]).restoreSettings();
        			}
        			for(var i=0;i<controller.refreshPanels.length;i++){
        				View.getOpenerView().panels.get(controller.refreshPanels[i]).refresh(controller.refreshPanels[i].restriction);
        			}
        			View.closeThisDialog();
                } 
                catch (e) {
                	Workflow.handleError(e);
                }
            }
        });
	}
});

/**
 * check if dateStart < dateEnd 
**/

function datesValidated(form){
	// get the string value from field stard date
	var date_start = form.getFieldValue('op.date_start').split("-");
	//create Date object
	var dateStart = new Date(date_start[0],date_start[1],date_start[2]);
	
	// get the string value from field end date
	var date_end = form.getFieldValue('op.date_option').split("-");
	//create Date object
	var dateEnd = new Date(date_end[0],date_end[1],date_end[2]);

	if (dateEnd < dateStart) {
			View.showMessage(getMessage('error_date_end_before_date_start'));
			return false;
	}
	return true;	
}
