var mgmtRecurringCostController = View.createController('mgmtRecurringCost', {
	
    ls_id: null,
    pr_id: null,
    bl_id: null,
    ac_id: null,
    parcel_id: null,
    
    parentItemId: null,
    
    isBuilding: false,
    isProperty: false,
    isLease: false,
    isAccount: false,
    isParcel: false,
    isLandlord: false,
    
    afterViewLoad: function(){
    	// create selection menu
		var btnObject = Ext.get('setSelectedRecur');
		btnObject.on('click', this.showSetSelectedMenu, this, null);
    },
    
    showSetSelectedMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("menu_as_cam"),
			handler: addSubmenu.createDelegate(this, [this.recurringCostGrid, "cost_tran_recur", "cost_tran_recur_id", "CAM"]) 
		});	
		menuItems.push({text: getMessage("menu_as_non_cam"),
				handler: addSubmenu.createDelegate(this, [this.recurringCostGrid, "cost_tran_recur", "cost_tran_recur_id", "NON-CAM"]) 
		});	
    	var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
	},
    
    enableButtons: function(enable){
		this.recurringCostGrid.enableAction("new",enable);
		this.recurringCostGrid.enableAction("schedule",enable);
		this.recurringCostGrid.enableAction("delete",enable);
		this.recurringCostGrid.enableAction("exportXls",enable);
    },
    
    reset: function(){
        this.ls_id = null;
        this.pr_id = null;
        this.bl_id = null;
        this.ac_id = null;
        this.parcel_id = null;
        this.parentItemId = null;
        
        this.isBuilding = false;
        this.isProperty = false;
        this.isLease = false;
        this.isAccount = false;
        this.isParcel = false;
        this.isLandlord = false;
    },
    
	setTitle: function(){
		var panel = this.recurringCostGrid;
		if(this.isBuilding){
			panel.setTitle(getMessage('title_recur_cost_bldg')+' '+ this.bl_id);
		}else if(this.isProperty){
			panel.setTitle(getMessage('title_recur_cost_prop')+' '+ this.pr_id);
		}else if(this.isLease){
			panel.setTitle(getMessage('title_recur_cost_lease')+' '+ this.ls_id);
		}else if(this.isAccount){
			panel.setTitle(getMessage('title_recur_cost_acc')+' '+ this.ac_id);
		}else if(this.isParcel){
			panel.setTitle(getMessage('title_recur_cost_parcel')+' '+ this.parcel_id);
		}
	},
	
    recurringCostGrid_edit_onClick: function(row){
        this.add_edit_item(row, false);
    },
    
    recurringCostGrid_onNew: function(){
        this.add_edit_item(null, true);
    },
    
    recurringCostGrid_onSchedule: function(){
        var costIds = getFieldValuesFromSelectedRows(this.recurringCostGrid, 'cost_tran_recur.cost_tran_recur_id');
		var isNotActive = this.checkSelRowsFieldForValue(this.recurringCostGrid, 'cost_tran_recur.status_active', '0');
        var openerController = this;
        if (costIds.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
			return;
        }
		if(isNotActive){
            View.showMessage(getMessage('msg_inactive_cost'));
			return;
		}
        View.openDialog('ab-rplm-cost-mgmt-costs-recurring-date-end.axvw', null, true, {
            width: 600,
            height: 350,
            closeButton: true,
            afterInitialDataFetch: function(dialogView){
                var dialogController = dialogView.controllers.get('mgmtRecurringCostDateEnd');
                dialogController.costIds = costIds;
                dialogController.openerController = openerController;
            }
        });
    },
    
    recurringCostGrid_onDelete: function(){
		var selectedRecords = this.recurringCostGrid.getPrimaryKeysForSelectedRows();
        if (selectedRecords.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        }
        else {
        
            View.confirm(getMessage('confirm_delete_recurring'), function(button){
                if (button == 'yes') {
                    try {
                        Workflow.call('AbCommonResources-deleteDataRecords', {
                            records: toJSON(selectedRecords),
							viewName: 'ab-rplm-cost-mgmt-costs-recurring.axvw',
        					dataSourceId: 'dsRecurringCost'
                        });
                    } 
                    catch (e) {
                        Workflow.handleError(e);
                    }
					View.controllers.get('mgmtRecurringCost').recurringCostGrid.refresh();
                }
                else 
                    this.close();
            })
        }
        
    },
    
    add_edit_item: function(row, isNew){

    	var costTranRecurId = null;
        if(valueExists(row)){
        	costTranRecurId = row.getFieldValue("cost_tran_recur.cost_tran_recur_id");
        }

        var runtimeParameters = {
        		isNewRecord: isNew,
        		isBuilding: this.isBuilding,
        		isProperty: this.isProperty,
        		isLease: this.isLease,
        		isParcel: this.isParcel,
        		isAccount: this.isAccount,
        		isLandlord: this.isLandlord,
        		ls_id: this.ls_id,
				pr_id: this.pr_id,
				bl_id: this.bl_id,
				parcel_id: this.parcel_id,
				ac_id: this.ac_id,
				cost_tran_recur_id: costTranRecurId,
				openerController: this,
				gridPanel: this.recurringCostGrid
        };
        
        View.openDialog('ab-rplm-cost-mgmt-add-edit-recurring.axvw', null, false, {
            width: 900,
            height: 700,
            closeButton: true,
            runtimeParameters: runtimeParameters
        });
    },
	/*
	 * check selected rows for a specific field value 
	 * return true / false is field have/don't have specified value
	 */
	checkSelRowsFieldForValue: function(grid, field, value){
		var result = false;
		var selectedCosts = grid.getSelectedRecords();
        for (var i = 0; i < selectedCosts.length; i++) {
			if(selectedCosts[i].getValue(field) == value){
				result = true;
				break;
			}
        }
		return result;
	}
})



