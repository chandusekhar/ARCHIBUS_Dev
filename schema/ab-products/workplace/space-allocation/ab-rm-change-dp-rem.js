var controller = View.createController('roomSelectorController', {
	
	user_dp_found : false,
	user_em_id : null,
	user_dv_id : null,
	user_dp_id : null,
	
	afterViewLoad: function() {	
		this.rmChangeDpRem_grid.addEventListener('onMultipleSelectionChange', function(row) {
			controller.rmChangeDpRem_cadPanel.addDrawing(row, null);
	    });
    	this.rmChangeDpRem_cadPanel.addEventListener('onclick', onClickHandler);
    	this.user_em_id = Ab.view.View.user.employee.id;
    	this.user_dv_id = Ab.view.View.user.employee.organization.divisionId;
    	this.user_dp_id = Ab.view.View.user.employee.organization.departmentId; 			
    	if (this.user_em_id != '' && this.user_dv_id != '' && this.user_dp_id != '')
	    	this.user_dp_found = true;
    }
	
});

function onClickHandler(pk, selected) {
	var report = View.panels.get('rmChangeDpRem_report');
	var r = new Ab.view.Restriction();
	r.addClause("rm.bl_id", pk[0], "=", true);
	r.addClause("rm.fl_id", pk[1], "=", true);
	r.addClause("rm.rm_id", pk[2], "=", true);
	report.refresh(r);
	var dv_id = report.getFieldValue('rm.dv_id');
	var dp_id = report.getFieldValue('rm.dp_id');
	var releaseAction = report.actions.get('rmChangeDpRem_release');
	var ctrl = View.controllers.get('roomSelectorController');
	if (ctrl.user_dp_found) {
		if (ctrl.user_dv_id == dv_id && ctrl.user_dp_id == dp_id) {
			releaseAction.enable(true);
			report.refresh();
		} else { 
			releaseAction.enable(false);
			report.refresh();
		}
	}
	else {
		View.showMessage('message',getMessage('user_info_not_found'));
		releaseAction.enable(false);
		var claimAction = report.actions.get('rmChangeDpRem_claim');
		claimAction.enable(false);
		report.refresh();
	}
}

function claimSpace() {	
	var ds = View.dataSources.get('rmChangeDpRem_ds1'); 
	var report = View.panels.get('rmChangeDpRem_report');
	var record = report.getRecord();
	var ctrl = View.controllers.get('roomSelectorController');
	record.setValue('rm.dv_id', ctrl.user_dv_id);
	record.setValue('rm.dp_id', ctrl.user_dp_id);
	ds.saveRecord(record);
	report.refresh();
	var cadPanel = View.panels.get('rmChangeDpRem_cadPanel');
	cadPanel.refresh();
}

function releaseSpace() {
	var ds = View.dataSources.get('rmChangeDpRem_ds1'); 
	var report = View.panels.get('rmChangeDpRem_report');
	var record = report.getRecord();
	record.setValue('rm.dv_id', '');
	record.setValue('rm.dp_id', '');
	ds.saveRecord(record);
	report.refresh();
	var cadPanel = View.panels.get('rmChangeDpRem_cadPanel');
	cadPanel.refresh();
}