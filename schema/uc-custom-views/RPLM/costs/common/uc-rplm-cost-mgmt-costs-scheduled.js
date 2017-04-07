var mgmtScheduledCostController = View.createController('mgmtScheduledCost', {

    ls_id: null,
    pr_id: null,
    bl_id: null,
    ac_id: null,
    
    isBuilding: false,
    isProperty: false,
    isLease: false,
    isAccount: false,
    reset: function(){
        this.ls_id = null;
        this.pr_id = null;
        this.bl_id = null;
        this.ac_id = null;
        
        this.isBuilding = false;
        this.isProperty = false;
        this.isLease = false;
        this.isAccount = false;
    },
	setTitle: function(){
		var panel = this.scheduledCostGrid;
		if(this.isBuilding){
			panel.setTitle(getMessage('title_sched_cost_bldg')+' '+ this.bl_id);
		}else if(this.isProperty){
			panel.setTitle(getMessage('title_sched_cost_prop')+' '+ this.pr_id);
		}else if(this.isLease){
			panel.setTitle(getMessage('title_sched_cost_lease')+' '+ this.ls_id);
		}else if(this.isAccount){
			panel.setTitle(getMessage('title_sched_cost_acc')+' '+ this.ac_id);
		}
	},
    scheduledCostGrid_edit_onClick: function(row){
        this.add_edit_item(row, false);
    },
    scheduledCostGrid_onNew: function(row){
        this.add_edit_item(null, true);
    },
	scheduledCostGrid_afterRefresh: function(){
		var grid = this.scheduledCostGrid;
		var crtDate = new Date();
		for(var i=0;i< grid.rows.length;i++){
			var row = grid.rows[i];
			var dateDue = new Date(row['cost_tran_sched.date_due']);
			if(dateDue < crtDate){
				row.row.cells.get('cost_tran_sched.date_due').dom.bgColor = '#FF0000';
			}
		}
	},
    scheduledCostGrid_onApprove: function(row){
        var costIds = this.getCostIdsFromSelectedRows(this.scheduledCostGrid, 'cost_tran_sched.cost_tran_sched_id');
        if (costIds.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        }
        else {
            try {
                Workflow.callMethod('AbCommonResources-CostService-approveScheduledCosts', costIds);
				this.view.controllers.get('mgmtActualCost').actualCostGrid.refresh();
				this.scheduledCostGrid.refresh();
            } 
            catch (e) {
                Workflow.handleError(e);
            }
			
        }
    },
    scheduledCostGrid_onDelete: function(row){
        var selectedRecords = this.scheduledCostGrid.getPrimaryKeysForSelectedRows();
        if (selectedRecords.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        }
        else {
        
            View.confirm(getMessage('confirm_delete_scheduled'), function(button){
                if (button == 'yes') {
                    try {
                        Workflow.call('AbCommonResources-deleteDataRecords', {
                            records: toJSON(selectedRecords),
							viewName: 'uc-rplm-cost-mgmt-costs-scheduled.axvw',
        					dataSourceId: 'dsScheduledCost'
                        });
                    } 
                    catch (e) {
                        Workflow.handleError(e);
                    }
					View.controllers.get('mgmtScheduledCost').scheduledCostGrid.refresh();
                }
                else 
                    this.close();
            })
        }
    },
    add_edit_item: function(row, isNew){
    
        var isBuilding = this.isBuilding;
        var isProperty = this.isProperty;
        var isLease = this.isLease;
        var isAccount = this.isAccount;
		var ls_id = this.ls_id;
		var pr_id = this.pr_id;
		var bl_id = this.bl_id;
		var ac_id = this.ac_id;
        var openerController = this;
		var addSchedTitle = '';
		if(isBuilding){
			addSchedTitle = 'add_sched_cost_bldg';
		}else if(isProperty){
			addSchedTitle = 'add_sched_cost_prop';
		}else if(isLease){
			addSchedTitle = 'add_sched_cost_lease';
		}else if(isAccount){
			addSchedTitle = 'add_sched_cost_acc';
		}
		
        if (isNew) {
            View.openDialog('uc-rplm-cost-mgmt-add-edit-scheduled.axvw', null, true, {
                width: 800,
                height: 400,
                closeButton: false,
                afterInitialDataFetch: function(dialogView){
                    var dialogController = dialogView.controllers.get('addEditScheduledCost');
					var restriction = new Ab.view.Restriction();
					if(isBuilding){
						restriction.addClause("cost_tran_sched.bl_id", bl_id, "=");
					}else if(isProperty){
						restriction.addClause("cost_tran_sched.pr_id", pr_id, "=");
					}else if(isLease){
						restriction.addClause("cost_tran_sched.ls_id", ls_id, "=");
					}else if(isAccount){
						restriction.addClause("cost_tran_sched.ac_id", ac_id, "=");
					}
                    dialogController.addScheduledCostForm.refresh(restriction, true);
					dialogController.addScheduledCostForm.setTitle(getMessage(addSchedTitle));
                    dialogController.addScheduledCostForm.showField("cost_tran_sched.bl_id", isBuilding);
                    dialogController.addScheduledCostForm.showField("cost_tran_sched.pr_id", isProperty);
                    dialogController.addScheduledCostForm.showField("cost_tran_sched.ls_id", isLease);
                    dialogController.addScheduledCostForm.showField("cost_tran_sched.ac_id", isAccount);
					dialogController.makeCategoryType(isBuilding, isProperty, isLease, isAccount, true);
                    dialogController.openerController = openerController;
                }
            });
            
        }
        else {
            View.openDialog('uc-rplm-cost-mgmt-add-edit-scheduled.axvw', null, true, {
                width: 800,
                height: 400,
                closeButton: false,
                afterInitialDataFetch: function(dialogView){
                    var dialogController = dialogView.controllers.get('addEditScheduledCost');
                    dialogController.editScheduledCostForm.refresh({
						"cost_tran_sched.cost_tran_sched_id": row.getFieldValue("cost_tran_sched.cost_tran_sched_id")
					}, false);
                    dialogController.editScheduledCostForm.showField("cost_tran_sched.bl_id", isBuilding);
                    dialogController.editScheduledCostForm.showField("cost_tran_sched.pr_id", isProperty);
                    dialogController.editScheduledCostForm.showField("cost_tran_sched.ls_id", isLease);
                    dialogController.editScheduledCostForm.showField("cost_tran_sched.ac_id", isAccount);
					dialogController.makeCategoryType(isBuilding, isProperty, isLease, isAccount, false);
					dialogController.openerController = openerController;
                }
            });
        }
    },
    
    getCostIdsFromSelectedRows: function(grid, fieldName){
        var selectedCosts = grid.getSelectedRecords();
        
        var costIds = [];
        for (var i = 0; i < selectedCosts.length; i++) {
            var costId = selectedCosts[i].getValue(fieldName);
            costIds.push(costId);
        }
        
        return costIds;
    }
})
