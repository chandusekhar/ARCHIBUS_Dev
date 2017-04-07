/**
 * Controller for the Work request trades.
 */
var opsConsoleWrtrController = View.createController('opsConsoleWrtrController', {
	
	/**
	 * Record before Edit.
	 */
	recordBeforeEdit : null,
	
	/**
	 * Restrict edit after grid refreshed
	 * 
	 * @param row
	 * @param action
	 */
	wrtrGrid_afterRefresh : function() {
		var wrIds = [];
		
		if (this.wrtrGrid.restriction.clauses[0].op == 'IN') {
			wrIds = View.getOpenerView().WRids;
		} else {
			wrIds = [ this.wrtrGrid.restriction.clauses[0].value ];
		}

		//get application parameter, if = 0, then make the resource panels read-only if estimate step is completed.
		var EditEstimationAndScheduling = View.activityParameters['AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete'];
		var isEstimateStepCompleted = false;
		if(EditEstimationAndScheduling == '0'){
			for(var i=0;i<wrIds.length;i++){
				isEstimateStepCompleted = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEstimateOrSchedulingCompleted',wrIds[i],'estimation').value;
				if(isEstimateStepCompleted){
					View.panels.get('wrtrGrid').actions.get('addTr').show(false);
					break;
				}
			}
		}
		
		this.wrtrGrid.gridRows.each(function(row) {
			var wrId = row.getFieldValue('wrtr.wr_id');
			var status = row.getFieldValue('wr.status');
			if(isEstimateStepCompleted){
				row.removeActionListeners();
				jQuery('#wrtrGrid_row'+row.getIndex()+'_deleteWrtr').remove();
			}
			
			if(status!="A" && status!="AA"){
				//KB3042844 - disable Remove action after work request issued
				disableRemoveAfterIssued(View.panels.get('wrtrGrid'),'wrtr.hours_est','deleteWrtr');
			}
		});
		
	},
	
	/**
	 * Clear the form restriction before add new.
	 */
	wrtrForm_beforeRefresh : function() {
		if (this.wrtrForm.newRecord) {
			this.wrtrForm.restriction = null;
		}
	},
	
	/**
	 * Store the record before edit.
	 */
	wrtrForm_afterRefresh : function() {
		var wrDetailsControllers = View.controllers.get('wrDetails');
		if(wrDetailsControllers){
			wrDetailsControllers.wrtrForm_afterRefresh();
		}
		
		if (!this.wrtrForm.newRecord) {
			this.recordBeforeEdit = View.panels.get('wrtrForm').getFieldValues(true);
		}
	},
	
	/**
	 * Check Primary key change before edit,  if primary key change, delete the old record and insert the new record.
	 */
	checkPrimaryKeyChange : function() {
		if (!this.wrtrForm.newRecord) {
			var newValues = View.panels.get('wrtrForm').getFieldValues(true);
			if(newValues['wrtr.tr_id']!=this.recordBeforeEdit['wrtr.tr_id']
			   ||newValues['wrtr.date_assigned']!=this.recordBeforeEdit['wrtr.date_assigned']
			     ||newValues['wrtr.time_assigned']!=this.recordBeforeEdit['wrtr.time_assigned']){
				var records = [ this.recordBeforeEdit];
				runDeleteItemsWf('wrtrGrid', 'wrtr', records);
			}
		}
	},

	/**
	 * Set Read-only
	 * 
	 * @param row
	 * @param action
	 */
	setReadOnly : function() {
		this.wrtrGrid.actions.get('addTr').show(false);
		this.wrtrGrid.hideColumn('deleteWrtr');
		this.wrtrGrid.update();
		this.wrtrGrid.removeActionListeners();
	},

	/**
	 * Save Trades.
	 */
	wrtrForm_onSaveWrtr : function() {
		var form = View.panels.get('wrtrForm');
		var wrIds = [];
		
		if (form.newRecord) {
			if (this.wrtrGrid.restriction.clauses[0].op == 'IN') {
				wrIds = View.getOpenerView().WRids;
			} else {
				wrIds = [ this.wrtrGrid.restriction.clauses[0].value ];
			}
		} else {
			wrIds = [ form.getFieldValue('wrtr.wr_id') ];
		}

		form.setFieldValue('wrtr.wr_id', wrIds[0], false);

		// validate form input and save form
		if (form.canSave()) {
			try {
				
				this.checkPrimaryKeyChange();
				
				var newRecord = form.getFieldValues(true)
				for ( var i = 0; i < wrIds.length; i++) {
					newRecord['wrtr.wr_id'] = wrIds[i];
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTrade', newRecord);
				}

				View.panels.get('wrtrGrid').refresh();
				// refresh cost panel
				if(this.wrCosts){
					this.wrCosts.refresh();
				}
				form.closeWindow();
				//View.getOpenerView().panels.get('wrList').refresh();
				//keepConsoleReqeustsSelectedAfterRefresh();
				View.getOpenerView().controllers.get('opsConsoleWrListController').resetSelectedRowIcons();
			} catch (e) {
				form.validationResult.valid = false;
				form.displayValidationResult(e);
				return false;
			}
		} else {
			return false;
		}
	},

	/**
	 * When 'X' is pressed, delete Trade
	 * 
	 * @param row
	 * @param action
	 */
	wrtrGrid_onDeleteWrtr : function(row, action) {
		var records = [ row.panel.getPrimaryKeysForRow(row.record) ];
		runDeleteItemsWf('wrtrGrid', 'wrtr', records);
		// refresh cost panel
		if(this.wrCosts){
			this.wrCosts.refresh();
		}
		
		View.getOpenerView().controllers.get('opsConsoleWrListController').resetSelectedRowIcons();
	}
});

/**
 * Over write core API to open Add new dialog and close select value dialog.
 */
Ab.grid.SelectValue.prototype.onAddNew = function() {
	var parameters = Ab.view.View.selectValueParameters;
	var title = parameters.title;
	View.closeDialog();
	View.openDialog(this.addNewDialog, null, false, {
		x : 100,
		y : 100,
		width : 850,
		height : 800,
		title : this.getLocalizedString(Ab.grid.SelectValue.z_TITLE_ADD_NEW) + ' ' + title,
		useAddNewSelectVDialog : false,
		closeButton : false
	});
}