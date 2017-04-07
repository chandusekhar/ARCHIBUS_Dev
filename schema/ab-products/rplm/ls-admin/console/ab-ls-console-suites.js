var abRepmLeaseDetails_tabSuitesController = View.createController('abRepmLeaseDetails_tabSuitesController', {
	
	lsId: null,
	
	blId: null,
	
	refreshView: function(lsId){
		this.lsId = lsId;
		this.blId = this.getBuildingCode(this.lsId);
		var restrAvailable = new Ab.view.Restriction();
		restrAvailable.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAvailable.addClause('su.ls_id', null, 'IS NULL', false, 'AND');
		
		var restrAssigned = new Ab.view.Restriction();
		restrAssigned.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAssigned.addClause('su.ls_id', this.lsId, '=', false, 'AND');
		
		var restrAssignedOther = new Ab.view.Restriction();
		restrAssignedOther.addClause('su.bl_id', this.blId, '=', false, 'AND');
		restrAssignedOther.addClause('su.ls_id', null, 'IS NOT NULL', false, 'AND');
		restrAssignedOther.addClause('su.ls_id', this.lsId, '<>', false, 'AND');
		
		this.abLsConsoleSuiteAvailable_list.refresh(restrAvailable);
		this.abLsConsoleSuiteAssigned_list.refresh(restrAssigned);
		this.abLsConsoleSuiteAssignedToOther_list.refresh(restrAssignedOther);
		
	},
	
	getBuildingCode: function(lsId){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ls.ls_id', lsId, '=');
		var dataSource = View.dataSources.get('dslease');
		var record = dataSource.getRecord(restriction);
		var blId = record.getValue('ls.bl_id');
		return blId;
	},
	
	abLsConsoleSuiteAvailable_list_onNew: function(){
		var restriction = new Ab.view.Restriction({'su.ls_id': this.lsId, 'su.bl_id': this.blId });
		this.add_edit(null, new Array('abLsConsoleSuiteAvailable_list','abLsConsoleSuiteAssigned_list','abLsConsoleSuiteAssignedToOther_list'), restriction, true,getMessage('add_new'));
	},
	
	abLsConsoleSuiteAvailable_list_split_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.abLsConsoleSuite_ds, this.abLsConsoleSuiteAvailable_list);
		}
	},

	abLsConsoleSuiteAssigned_list_split_onClick: function(row){
		if (row.getFieldValue('su.area_rentable') > 0 || row.getFieldValue('su.area_comn') > 0 || row.getFieldValue('su.area_usable') > 0) {
			View.showMessage(getMessage('error_split'));
		}
		else {
			this.split(row, this.abLsConsoleSuite_ds, this.abLsConsoleSuiteAssigned_list);
		}
	},

	split: function(row, dataSource, panel){
		try {
			var suId = row.getFieldValue('su.su_id');
			var flId = row.getFieldValue('su.fl_id');
			var blId = row.getFieldValue('su.bl_id');
			var result = Workflow.callMethod("AbRPLMLeaseAdministration-LeaseAdministrationService-splitSuite", suId, flId, blId);
			if (result.code == "executed") {
				panel.refresh(panel.restriction);
			}
			
		} catch (e){
			Workflow.handleError(e);
		}
	},
	
	abLsConsoleSuiteAvailable_list_delete_onClick: function(row){
		var dsSuite = View.dataSources.get('abLsConsoleSuite_ds');
		var records = dsSuite.getRecords(new Ab.view.Restriction({'su.bl_id': this.blId}));
		if(records.length == 1){
			View.showMessage(getMessage('error_delete_one_bl_suite'));
			return;
		}
		
		var record = row.getRecord();
		var reportPanel = this.abLsConsoleSuiteAvailable_list;
		View.confirm(getMessage('message_suite_confirmdelete'), function(button){
			if(button == 'yes'){
                try {
                	dsSuite.deleteRecord(record);
					reportPanel.refresh(reportPanel.restriction);
                } catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
			}
		})
	},
	
	abLsConsoleSuiteAvailable_list_assign_onClick: function(row){
		var record = row.getRecord();
		record.setValue('su.ls_id', this.lsId);
		this.abLsConsoleSuite_ds.saveRecord(record);
		this.abLsConsoleSuiteAvailable_list.refresh(this.abLsConsoleSuiteAvailable_list.restriction);
		this.abLsConsoleSuiteAssigned_list.refresh(this.abLsConsoleSuiteAssigned_list.restriction);
	},

	abLsConsoleSuiteAssigned_list_unassign_onClick: function(row){
		var controller = this;
        View.confirm(getMessage('message_confirm_unassign'), function(button){
            if (button == 'yes') {
                try {
                   var record = row.getRecord();
					record.setValue('su.ls_id', '');
					controller.abLsConsoleSuite_ds.saveRecord(record);
					controller.abLsConsoleSuiteAvailable_list.refresh(controller.abLsConsoleSuiteAvailable_list.restriction);
					controller.abLsConsoleSuiteAssigned_list.refresh(controller.abLsConsoleSuiteAssigned_list.restriction);
		
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
	},
	
	abLsConsoleSuiteAvailable_list_edit_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('su.su_id', row.getFieldValue('su.su_id'), '=');
		restriction.addClause('su.bl_id', row.getFieldValue('su.bl_id'), '=');
		restriction.addClause('su.fl_id', row.getFieldValue('su.fl_id'), '=');
		this.add_edit(row, new Array('abLsConsoleSuiteAvailable_list','abLsConsoleSuiteAssigned_list','abLsConsoleSuiteAssignedToOther_list'), restriction, false,getMessage('edit'));
	},
	
	abLsConsoleSuiteAssigned_list_edit_onClick: function(row){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('su.su_id', row.getFieldValue('su.su_id'), '=');
		restriction.addClause('su.bl_id', row.getFieldValue('su.bl_id'), '=');
		restriction.addClause('su.fl_id', row.getFieldValue('su.fl_id'), '=');
		this.add_edit(row, new Array('abLsConsoleSuiteAvailable_list','abLsConsoleSuiteAssigned_list','abLsConsoleSuiteAssignedToOther_list'), restriction, true,getMessage('edit'));
	},

	add_edit: function(row, panels, restriction, withLease,title){
		var itemId = this.blId;
		var leaseId = this.lsId;
		
		View.openDialog('ab-rplm-add-edit-suite.axvw',null, true, {
			width:800,
			height:700, 
			closeButton:true,
			afterInitialDataFetch:function(dialogView){
				var dialogController = dialogView.controllers.get('addEditSuite');
				dialogController.itemId = itemId;
				dialogController.itemType = null;
				dialogController.leaseId = leaseId;
				dialogController.leaseType = null;
				dialogController.addEditSuiteForm.setTitle(title);
				if(row != null){
					dialogController.suiteId = row.getFieldValue('su.su_id');
					dialogController.addEditSuiteForm.refresh(restriction, false);
					dialogController.addEditSuiteForm.newRecord = false;
					
					/* KB 3027906 Allow modification of the Suite Code
					 * dialogController.addEditSuiteForm.enableField('su.su_id', false);
					 */
					if(withLease){
						dialogController.addEditSuiteForm.enableField('su.ls_id', false);
						dialogController.addEditSuiteForm.enableField('su.bl_id', false);
					}else{
						dialogController.addEditSuiteForm.enableField('su.ls_id', true);
					}
				}else{
					dialogController.addEditSuiteForm.refresh(null, true);
					dialogController.addEditSuiteForm.newRecord = true;
					
					if(withLease && valueExistsNotEmpty(leaseId)){
						dialogController.addEditSuiteForm.setFieldValue('su.ls_id', leaseId);
						dialogController.addEditSuiteForm.enableField('su.ls_id', false);
					}else{
						dialogController.addEditSuiteForm.enableField('su.ls_id', true);
					}
					if (valueExistsNotEmpty(itemId)) {
						dialogController.addEditSuiteForm.setFieldValue('su.bl_id', itemId);
						dialogController.addEditSuiteForm.enableField('su.bl_id', false);
					}
				}
				dialogController.refreshPanels = panels;
			}
		});
	}
});