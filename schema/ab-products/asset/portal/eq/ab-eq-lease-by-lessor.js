var abEqLsByLessorController = View.createController('abEqLsByLessorController', {
	// selected lessor id
	lessorId: null,
	// selected grid rows
	selectedGridRows: null,
	
	showDetailsForLessor: function(lessorId){
		this.lessorId = lessorId;
		this.reloadPanels();
	},
	
	abEqLeaseBy_assignedTaLease_afterRefresh: function(){
		var title = getMessage('titleAssociatedLs').replace('{0}', this.lessorId);
		this.abEqLeaseBy_assignedTaLease.setTitle(title);
	},
	
	abEqLeaseBy_assignedTaLease_onReassing: function(){
		this.selectedGridRows = this.abEqLeaseBy_assignedTaLease.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('lessor.lessor_id', this.lessorId, '<>');
		this.abEqLeaseBy_availableLessor.refresh(restriction);
		var dialogConfig = {
				width: 800,
				height: 600,
				closeButton: true
		};
		this.abEqLeaseBy_availableLessor.showInWindow(dialogConfig);
	},
	
	abEqLeaseBy_assignedTaLease_onUnassign: function(){
		this.selectedGridRows = this.abEqLeaseBy_assignedTaLease.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}
		var confirmMessage = getMessage('msgConfirmUnassign').replace('{0}', this.lessorId);
		var controller = this;
		View.confirm(confirmMessage, function(button){
			if (button == 'yes') {
				controller.onUnassign(controller.selectedGridRows);
			}
		});
	},
	
	abEqLeaseBy_availableTaLease_onAssign: function(){
		this.selectedGridRows = this.abEqLeaseBy_availableTaLease.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}

		var confirmMessage = getMessage('msgConfirmAssign').replace('{0}', this.lessorId);
		var controller = this;
		View.confirm(confirmMessage, function(button){
			if (button == 'yes') {
				controller.onAssign(controller.selectedGridRows, controller.lessorId);
			}
		});
	},
	
	onUnassign: function(selectedRows){
		var objDataSource = this.abEqLeaseBy_taLeaseDs;
		for (var i = 0; i < selectedRows.length; i++) {
			var record = selectedRows[i].getRecord();
			record.setValue('ta_lease.lessor_id', '');
			objDataSource.saveRecord(record);
		}
		this.reloadPanels();
	},
	
	onAssign: function(selectedRows, lessorId){
		var objDataSource = this.abEqLeaseBy_taLeaseDs;
		for (var i = 0; i < selectedRows.length; i++) {
			var record = selectedRows[i].getRecord();
			record.setValue('ta_lease.lessor_id', lessorId);
			objDataSource.saveRecord(record);
		}
		this.reloadPanels();
	},

	reloadPanels: function(){
		var assignedRestr = new Ab.view.Restriction();
		assignedRestr.addClause('ta_lease.lessor_id', this.lessorId, '=');
		var availableRestr = new Ab.view.Restriction();
		availableRestr.addClause('ta_lease.lessor_id', '', 'IS NULL');
		
		this.abEqLeaseBy_assignedTaLease.refresh(assignedRestr);
		this.abEqLeaseBy_availableTaLease.refresh(availableRestr);
	}
});

/**
 * Show details for lessor.
 * @param ctx command context
 */
function showDetailsForLessor(ctx){
	var record = ctx.row.record;
	var controller = View.controllers.get('abEqLsByLessorController');
	controller.showDetailsForLessor(record['lessor.lessor_id']);
}

/**
 * On assign lease to lessor
 * @param ctx command context
 */
function onAssignLsToLessor(ctx){
	var record = ctx.row.record;
	var lessorId = record['lessor.lessor_id'];
	var confirmMessage = getMessage('msgConfirmAssign').replace('{0}', lessorId);
	var controller = View.controllers.get('abEqLsByLessorController');
	var panel = View.panels.get('abEqLeaseBy_availableLessor');
	View.confirm(confirmMessage, function(button){
		if (button == 'yes') {
			controller.onAssign(controller.selectedGridRows, lessorId);
			if (panel && panel.isShownInWindow()) {
				panel.closeWindow();
			}
		}
	});
}