var addEditSuiteController = View.createController('addEditSuite',{
	itemId:null,
	itemType:null,
	leaseId:null,
	leaseType:null,
	suiteId:null,
	refreshPanels:new Array(),
	
	addEditSuiteForm_onSave: function(){
		if(!validateFields(this.addEditSuiteForm)){
			return;
		}
		var record = null;
		if(this.suiteId == null){
			record = new Ab.data.Record({
				'su.su_id': this.addEditSuiteForm.getFieldValue('su.su_id'),
				'su.ls_id': (this.leaseId ==null)?null:this.addEditSuiteForm.getFieldValue('su.ls_id'),
				'su.name': this.addEditSuiteForm.getFieldValue('su.name'),
				'su.description': this.addEditSuiteForm.getFieldValue('su.description'),
				'su.fl_id': this.addEditSuiteForm.getFieldValue('su.fl_id'),
				'su.area_manual': this.addEditSuiteForm.getFieldValue('su.area_manual'),
				'su.facility_type_id': this.addEditSuiteForm.getFieldValue('su.facility_type_id'),
				'su.bl_id': this.itemId
			}, true);
		}else{
			record = this.addEditSuiteForm.getRecord();
			record.setValue('su.name', this.addEditSuiteForm.getFieldValue('su.name'));
			record.setValue('su.description', this.addEditSuiteForm.getFieldValue('su.description'));
			record.setValue('su.fl_id', this.addEditSuiteForm.getFieldValue('su.fl_id'));
			record.setValue('su.area_manual', this.addEditSuiteForm.getFieldValue('su.area_manual'));
			record.setValue('su.facility_type_id', this.addEditSuiteForm.getFieldValue('su.facility_type_id'));
		}
		try{
			this.dsAddEditSuite.saveRecord(record);
			
		}catch(e){
            var message = String.format(getMessage('error_update'));
            View.showMessage('error', message, e.message, e.data);
			return;
		}
		var openerView = View.getOpenerView();
		for(var i=0;i<this.refreshPanels.length;i++){
			var panelId = this.refreshPanels[i];
			var objPanel = openerView.panels.get(panelId);
			objPanel.refresh(objPanel.restriction);
		}
		View.closeThisDialog();
	},
	
	addEditSuiteForm_onCancel: function(){
		View.closeThisDialog();
	}
})	

function validateFields(form){
	if(form.getFieldValue('su.su_id')== null ||
		form.getFieldValue('su.su_id')==''){
		View.showMessage(getMessage('error_no_suiteid'));	
		return (false);
	}
	if(form.getFieldValue('su.fl_id')== null ||
		form.getFieldValue('su.fl_id')==''){
		View.showMessage(getMessage('error_no_floorid'));	
		return (false);
	}
	return (true);
}

function selectFloor() {
    Ab.view.View.selectValue(
        'addEditSuiteForm', 'Floor Code', ['su.fl_id'], 'fl', ['fl.fl_id'],
        ['fl.bl_id','fl.fl_id','fl.name'],
        'fl.bl_id = \''+this.addEditSuiteController.itemId+'\'', 'afterSelectFloor', true, false, '', 1000, 500);
}

function afterSelectFloor(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}
function selectLease() {
    Ab.view.View.selectValue(
        'addEditSuiteForm', 'Lease Code', ['su.ls_id'], 'ls', ['ls.ls_id'],
        ['ls.bl_id','ls.ls_id'],
        'ls.bl_id = \''+this.addEditSuiteController.itemId+'\'', 'afterSelectLease', true, false, '', 1000, 500);
}

function afterSelectLease(fieldName, selectedValue, previousValue) {
    // the selected value can be copied to the form field
    return true;
}
