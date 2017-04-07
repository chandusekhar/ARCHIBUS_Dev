var abEqByLeaseController = View.createController('abEqByLeaseController', {
	// selected lease code
	taLeaseId: null,
	// selected grid rows
	selectedGridRows: null,
	
	showDetailsForLease: function(taLeaseId){
		this.taLeaseId = taLeaseId;
		this.reloadPanels();
	},
	
	abEqBy_assignedEq_afterRefresh: function(){
		var title = getMessage('titleAssociatedEq').replace('{0}', this.taLeaseId);
		this.abEqBy_assignedEq.setTitle(title);
	},
	
	abEqBy_assignedEq_onReassing: function(){
		this.selectedGridRows = this.abEqBy_assignedEq.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ta_lease.ta_lease_id', this.taLeaseId, '<>');
		this.abEqByLs_TaLease.refresh(restriction);
		var dialogConfig = {
				width: 800,
				height: 600,
				closeButton: true
		};
		this.abEqByLs_TaLease.showInWindow(dialogConfig);
	},
	
	abEqBy_assignedEq_onUnassign: function(){
		this.selectedGridRows = this.abEqBy_assignedEq.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}
		var confirmMessage = getMessage('msgConfirmUnassign').replace('{0}', this.taLeaseId);
		var controller = this;
		View.confirm(confirmMessage, function(button){
			if (button == 'yes') {
				controller.onUnassign(controller.selectedGridRows);
			}
		});
	},
	
	abEqBy_availableEq_onAssign: function(){
		this.selectedGridRows = this.abEqBy_availableEq.getSelectedGridRows();
		if (this.selectedGridRows.length == 0) {
			View.showMessage(getMessage('errorNoSelection'));
			return false;
		}

		var confirmMessage = getMessage('msgConfirmAssign').replace('{0}', this.taLeaseId);
		var controller = this;
		View.confirm(confirmMessage, function(button){
			if (button == 'yes') {
				controller.onAssign(controller.selectedGridRows, controller.taLeaseId);
			}
		});
	},
	
	onUnassign: function(selectedRows){
		var objDataSource = this.abEqBy_equipDs;
		for (var i = 0; i < selectedRows.length; i++) {
			var record = selectedRows[i].getRecord();
			record.setValue('eq.ta_lease_id', '');
			objDataSource.saveRecord(record);
		}
		this.reloadPanels();
	},
	
	onAssign: function(selectedRows, taLeaseId){
		var objDataSource = this.abEqBy_equipDs;
		for (var i = 0; i < selectedRows.length; i++) {
			var record = selectedRows[i].getRecord();
			record.setValue('eq.ta_lease_id', taLeaseId);
			objDataSource.saveRecord(record);
		}
		this.reloadPanels();
	},

	reloadPanels: function(){
		var assignedRestr = new Ab.view.Restriction();
		assignedRestr.addClause('eq.ta_lease_id', this.taLeaseId, '=');
		var availableRestr = new Ab.view.Restriction();
		availableRestr.addClause('eq.ta_lease_id', '', 'IS NULL');
		
		this.abEqBy_assignedEq.refresh(assignedRestr);
		this.abEqBy_availableEq.refresh(availableRestr);
	}
});

/**
 * Show associated equipments
 * @param ctx command context
 */
function showDetailsForLease(ctx) {
	var record = ctx.row.record;
	var controller = View.controllers.get('abEqByLeaseController');
	controller.showDetailsForLease(record['ta_lease.ta_lease_id']);
}

function onAssignEqToLease(ctx){
	var record = ctx.row.record;
	var taLeaseId = record['ta_lease.ta_lease_id'];
	var confirmMessage = getMessage('msgConfirmAssign').replace('{0}', taLeaseId);
	var controller = View.controllers.get('abEqByLeaseController');
	var panel = View.panels.get('abEqByLs_TaLease');
	View.confirm(confirmMessage, function(button){
		if (button == 'yes') {
			controller.onAssign(controller.selectedGridRows, taLeaseId);
			if (panel && panel.isShownInWindow()) {
				panel.closeWindow();
			}
		}
	});
}