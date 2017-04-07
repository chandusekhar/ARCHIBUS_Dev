/**
 * Controller for the Work request parts.
 */
var opsConsoleWrptController = View.createController('opsConsoleWrptController', {
	
	/**
	 * Record before Edit.
	 */
	recordBeforeEdit : null,

	/**
	 * Set Read-only
	 * 
	 * @param row
	 * @param action
	 */
	setReadOnly : function() {
		this.wrptGrid.actions.get('addPt').show(false);
		this.wrptGrid.hideColumn('deletePart');
		this.wrptGrid.update();
		this.wrptGrid.removeActionListeners();
	},
	
	/**
	 * Restrict edit after grid refreshed
	 * 
	 * @param row
	 * @param action
	 */
	wrptGrid_afterRefresh : function() {
		var wrIds = [];
		
		if (this.wrptGrid.restriction.clauses[0].op == 'IN') {
			wrIds = View.getOpenerView().WRids;
		} else {
			wrIds = [ this.wrptGrid.restriction.clauses[0].value ];
		}

		//get application parameter, if = 0, then make the resource panels read-only if estimate step is completed.
		var EditEstimationAndScheduling = View.activityParameters['AbBldgOpsOnDemandWork-EditEstAndSchedAfterStepComplete'];
		var isEstimateStepCompleted = false;
		if(EditEstimationAndScheduling == '0'){
			for(var i=0;i<wrIds.length;i++){
				isEstimateStepCompleted = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-isEstimateOrSchedulingCompleted',wrIds[i],'estimation').value;
				if(isEstimateStepCompleted){
					View.panels.get('wrptGrid').actions.get('addPt').show(false);
					break;
				}
			}
		}
		this.wrptGrid.gridRows.each(function(row) {
			var wrId = row.getFieldValue('wrpt.wr_id');
			var status = row.getFieldValue('wr.status');
			var wrptStatus = row.getFieldValue('wrpt.status');
			var qtyActrual = row.getFieldValue('wrpt.qty_actual');
			if(wrptStatus!='NR'){
				jQuery('#wrptGrid_row'+row.getIndex()+'_reservePart').remove();
			}
			
			row.actions.get('reservePart').removeListeners();
			
			if(isEstimateStepCompleted){
				row.removeActionListeners();
				jQuery('#wrptGrid_row'+row.getIndex()+'_deletePart').remove();
			}
			//KB#3050988 If status of WRPT is Close, do not allow to delete Part.
			if(wrptStatus=="C" || qtyActrual>0){
				jQuery('#wrptGrid_row'+row.getIndex()+'_deletePart').remove();
			}
			
			if(status!="A" && status!="AA"){
				//KB3042844 - disable Remove action after work request issued
				disableRemoveAfterIssued(View.panels.get('wrptGrid'),'wrpt.qty_estimated','deletePart');
			}
		});
		
	},
	
	/**
	 * Clear the form restriction before add new.
	 */
	wrptForm_beforeRefresh : function() {
		if (this.wrptForm.newRecord) {
			this.wrptForm.restriction = null;
		}
	},
	
	/**
	 * Disable part code when edit the part assigmnet
	 */
	wrptForm_afterRefresh : function() {
		var wrDetailsControllers = View.controllers.get('wrDetails');
		if(wrDetailsControllers){
			wrDetailsControllers.wrptForm_afterRefresh();
		}
		
		if (!this.wrptForm.newRecord) {
			this.recordBeforeEdit = View.panels.get('wrptForm').getFieldValues(true);
		}
	},
	
	/**
	 * Check Primary key change before edit,  if primary key change, delete the old record and insert the new record.
	 */
	checkPrimaryKeyChange : function() {
		if (!this.wrptForm.newRecord) {
			var newValues = View.panels.get('wrptForm').getFieldValues(true);
			if(newValues['wrpt.part_id']!=this.recordBeforeEdit['wrpt.part_id']
			||newValues['wrpt.pt_store_loc_id']!=this.recordBeforeEdit['wrpt.pt_store_loc_id']
			   ||newValues['wrpt.date_assigned']!=this.recordBeforeEdit['wrpt.date_assigned']
			     ||newValues['wrpt.time_assigned']!=this.recordBeforeEdit['wrpt.time_assigned']){
				var records = [ this.recordBeforeEdit];
				runDeleteItemsWf('wrptGrid', 'wrpt', records);
			}
		}
	},

	/**
	 * Save part to the work request and refresh console
	 */
	wrptForm_onSaveWrpt : function() {
		var form = View.panels.get('wrptForm');
		var wrIds = [];
		
		if (form.newRecord) {
			if (this.wrptGrid.restriction.clauses[0].op == 'IN') {
				wrIds = View.getOpenerView().WRids;
			} else {
				wrIds = [ this.wrptGrid.restriction.clauses[0].value ];
			}
		} else {
			wrIds = [ form.getFieldValue('wrpt.wr_id') ];
		}

		form.setFieldValue('wrpt.wr_id', wrIds[0], false);

		// validate form input and save form
		if (form.canSave()) {
			try {
				
				this.checkPrimaryKeyChange();
				
				var newRecord = form.getFieldValues(true);
				for ( var i = 0; i < wrIds.length; i++) {
					newRecord['wrpt.wr_id'] = wrIds[i];
					Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-saveWorkRequestPartForMPSL', newRecord);
				}

				View.panels.get('wrptGrid').refresh();
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
	 * When is 'X' is clicked, delete part
	 * 
	 * @param row
	 * @param action
	 */
	wrptGrid_onDeletePart : function(row, action) {
		var records = [ row.panel.getPrimaryKeysForRow(row.record) ];
		runDeleteItemsWf('wrptGrid', 'wrpt', records);

		if (this.wrCosts) {
			this.wrCosts.refresh();
		}

		View.getOpenerView().controllers.get('opsConsoleWrListController').resetSelectedRowIcons();
	},
	
	/**
	 * When is 'Reserve' is clicked, Change the wrpt status and update pt.qty_on_reserve and pt.qty_on_hand
	 * 
	 * @param row
	 * @param action
	 */
	wrptGrid_onReservePart : function(row, action) {
		var record = row.getRecord();

		// First, update pt.qty_on_reserve and pt.qty_on_hand
		var partId = record.getValue('wrpt.part_id');
		var partLoc = record.getValue('wrpt.pt_store_loc_id');
		var qtyEstimated = parseFloat(record.getValue("wrpt.qty_estimated"));
		var restriction = new Ab.view.Restriction();
		restriction.addClause("pt.part_id", partId, '=');
		var ptRecord = this.ptDS.getRecord(restriction);
		var currentReservedQty = parseFloat(ptRecord.getValue('pt.qty_on_reserve')) + qtyEstimated;
		var currentAvailQty = parseFloat(ptRecord.getValue('pt.qty_on_hand')) - qtyEstimated;

		if (currentAvailQty >= 0) {
			ptRecord.setValue('pt.qty_on_reserve', currentReservedQty);
			ptRecord.setValue('pt.qty_on_hand', currentAvailQty);
			this.ptDS.saveRecord(ptRecord);
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause("pt_store_loc_pt.part_id", partId, '=');
			restriction.addClause("pt_store_loc_pt.pt_store_loc_id", partLoc, '=');
			
			var ptLocRecord = this.ptLocDS.getRecord(restriction);
			var currentLocReservedQty = parseFloat(ptLocRecord.getValue('pt_store_loc_pt.qty_on_reserve')) + qtyEstimated;
			var currentLocAvailQty = parseFloat(ptLocRecord.getValue('pt_store_loc_pt.qty_on_hand')) - qtyEstimated;
			ptLocRecord.setValue('pt_store_loc_pt.qty_on_reserve', currentLocReservedQty);
			ptLocRecord.setValue('pt_store_loc_pt.qty_on_hand', currentLocAvailQty);
			this.ptLocDS.saveRecord(ptLocRecord);

			// Update, update current part assignment status to Reserved
			record.setValue('wrpt.status', 'R');
			this.wrptDS.saveRecord(record);

			// check other 'In Stock, Not Reserved' work request part assignments with the same part and update the status to 'Not IN Stock' if the latest available qty < estimation qty of the assignments
			var restriction = new Ab.view.Restriction();
			restriction.addClause("wrpt.part_id", partId, '=');
			restriction.addClause("wrpt.pt_store_loc_id", partLoc, '=');
			restriction.addClause("wrpt.status", 'NR', '=');
			var NRWrptRecords = this.wrptDS.getRecords(restriction);
			for ( var i = 0; i < NRWrptRecords.length; i++) {
				var estimated = NRWrptRecords[i].getValue("wrpt.qty_estimated");
				if (parseFloat(estimated) > currentLocAvailQty) {
					NRWrptRecords[i].setValue("wrpt.status", 'NI');
					NRWrptRecords[i].isNew = false;
					this.wrptDS.saveRecord(NRWrptRecords[i]);
				}
			}

			this.wrptGrid.refresh();
		}else{
			View.showMessage(getMessage('partNotAvailable'));
		}
	},
	
	/**
	 * Template function to get selected record from dialog from
	 */
	openFindPartDialog: function(){
		var form = View.panels.get('wrptForm');
		var wrIds = [];
		
		if (form.newRecord) {
			if (this.wrptGrid.restriction.clauses[0].op == 'IN') {
				wrIds = View.getOpenerView().WRids;
			} else {
				wrIds = [ this.wrptGrid.restriction.clauses[0].value ];
			}
		} else {
			wrIds = [ form.getFieldValue('wrpt.wr_id') ];
		}

		//Define parameter panel
		View.parameterPanel=View.panels.get('wrptForm');
		//Test 'XC' building
		View.workRequestIds= wrIds;
		
		View.openDialog('ab-bldgops-find-parts.axvw',null,false,{maximize: true, title: getMessage('findPartDialogTitle'), width:1200, height:1000});
	}
});