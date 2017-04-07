/**
 * Controller for the Work request tools.
 */
var opsConsoleWrtlController = View.createController('opsConsoleWrtlController', {
	/**
	 * Record before Edit.
	 */
	recordBeforeEdit : null,
	
	/**
	 * Clear the form restriction before add new.
	 */
	wrtlForm_beforeRefresh : function() {
		if (this.wrtlForm.newRecord) {
			this.wrtlForm.restriction = null;
		}
	},
	
	 /**
     * Disable delete after issued.
     */	
	wrtlGrid_afterRefresh: function(){
		var wrIds = [];
		
		if (this.wrtlGrid.restriction.clauses[0].op == 'IN') {
			wrIds = View.getOpenerView().WRids;
		} else {
			wrIds = [ this.wrtlGrid.restriction.clauses[0].value ];
		}

		//get application parameter, if = 0, then make the resource panels read-only if estimate step is completed.
		var EditEstimationAndScheduling = View.activityParameters['AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete'];
		var isSchedulingCompleted = false;
		if(EditEstimationAndScheduling == '0'){
			for(var i=0;i<wrIds.length;i++){
				isSchedulingCompleted = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEstimateOrSchedulingCompleted',wrIds[i],'scheduling').value;
				if(isSchedulingCompleted){
					View.panels.get('wrtlGrid').actions.get('addTl').show(false);
					break;
				}
			}
		}
		
		this.wrtlGrid.gridRows.each(function(row) {
			var wrId = row.getFieldValue('wrtl.wr_id');
			var status = row.getFieldValue('wr.status');
			var actualHours = row.getFieldValue('wrtl.hours_straight');
			if(isSchedulingCompleted){
				row.removeActionListeners();
				jQuery('#wrtlGrid_row'+row.getIndex()+'_deleteWrtl').remove();
			}
			
			if(actualHours>0){
				jQuery('#wrtlGrid_row'+row.getIndex()+'_deleteWrtl').remove();
			}
			
			if(status!="A" && status!="AA"){
				//KB3042844 - disable Remove action after work request issued
				disableRemoveAfterIssued(View.panels.get('wrtlGrid'),'wrtl.hours_est','deleteWrtl');
			}
		});
	},
	
	/**
	 * Store the record before edit.
	 */
	wrtlForm_afterRefresh : function() {
		var wrDetailsControllers = View.controllers.get('wrDetails');
		if(wrDetailsControllers){
			wrDetailsControllers.wrtlForm_afterRefresh();
		}
		
		if (!this.wrtlForm.newRecord) {
			this.recordBeforeEdit = View.panels.get('wrtlForm').getFieldValues(true);
		}
	},
	
	/**
	 * Check Primary key change before edit,  if primary key change, delete the old record and insert the new record.
	 */
	checkPrimaryKeyChange : function() {
		if (!this.wrtlForm.newRecord) {
			var newValues = View.panels.get('wrtlForm').getFieldValues(true);
			if(newValues['wrtl.tool_id']!=this.recordBeforeEdit['wrtl.tool_id']
			   ||newValues['wrtl.date_assigned']!=this.recordBeforeEdit['wrtl.date_assigned']
			     ||newValues['wrtl.time_assigned']!=this.recordBeforeEdit['wrtl.time_assigned']){
				var records = [ this.recordBeforeEdit];
				runDeleteItemsWf('wrtlGrid', 'wrtl', records);
			}
		}
	},

	/**
	 * Save a single tool.
	 */
	wrtlForm_onSaveWrtl : function() {
		var form = View.panels.get('wrtlForm');

		var wrIds = [];
		if (form.newRecord) {
			if (this.wrtlGrid.restriction.clauses[0].op == 'IN') {
				wrIds = View.getOpenerView().WRids;
			} else {
				wrIds = [ this.wrtlGrid.restriction.clauses[0].value ];
			}

			form.setFieldValue('wrtl.wr_id', wrIds[0], false);
		} else {
			wrIds = [ form.getFieldValue('wrtl.wr_id') ];
		}

		// validate form input and save form
		if (form.canSave()) {
			try {
				
				this.checkPrimaryKeyChange();
				
				var newRecord = form.getFieldValues(true);
				for ( var i = 0; i < wrIds.length; i++) {
					newRecord['wrtl.wr_id'] = wrIds[i];
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestTool', newRecord);
				}

				View.panels.get('wrtlGrid').refresh();
				// refresh cost panel
				if(this.wrCosts){
					this.wrCosts.refresh();
				}
				form.closeWindow();
				//View.getOpenerView().panels.get('wrList').refresh();
				//keepConsoleReqeustsSelectedAfterRefresh();
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
	 * Delete tool assignments.
	 */
	wrtlGrid_onDeleteWrtl : function(row, action) {
		var records = [ row.panel.getPrimaryKeysForRow(row.record) ];
		runDeleteItemsWf('wrtlGrid', 'wrtl', records);
		// refresh cost panel
		if(this.wrCosts){
			this.wrCosts.refresh();
		}
		View.getOpenerView().panels.get('wrList').refresh();
		keepConsoleReqeustsSelectedAfterRefresh();
	},

	/**
	 * Hide fields.
	 */
	hideFields : function(fields) {
		// hide fields from 'Fields to Hide' list
		for ( var i = 0; i < fields.length; i++) {
			this.wrtlGrid.showColumn(fields[i], false);
			this.wrtlForm.showField(fields[i], false);
		}

		// update grid
		this.wrtlGrid.update();
	},

	/**
	 * Open dialog with reservations for selected tool
	 */
	showReservations : function() {
		var tool_id = View.panels.get("wrtlForm").getFieldValue("wrtl.tool_id");
		if (tool_id == "") {
			alert(getMessage("noTool"));
			return;
		}

		var rest = new Ab.view.Restriction();
		rest.addClause("tl.tool_id", tool_id, "=");
		View.openDialog("ab-helpdesk-workrequest-tool-reservations.axvw", rest, false, {
			closeButton : false,
			isDialog : false
		});

	}
});
