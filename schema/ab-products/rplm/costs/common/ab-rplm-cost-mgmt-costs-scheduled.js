var mgmtScheduledCostController = View.createController('mgmtScheduledCost', {

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
		var btnObject = Ext.get('setSelectedSched');
		btnObject.on('click', this.showSetSelectedMenu, this, null);
    },
    
    showSetSelectedMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("menu_as_cam"),
			handler: addSubmenu.createDelegate(this, [this.scheduledCostGrid, "cost_tran_sched", "cost_tran_sched_id", "CAM"]) 
		});	
		menuItems.push({text: getMessage("menu_as_non_cam"),
				handler: addSubmenu.createDelegate(this, [this.scheduledCostGrid, "cost_tran_sched", "cost_tran_sched_id", "NON-CAM"]) 
		});	
    	var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
	},
    
    enableButtons: function(enable){
		this.scheduledCostGrid.enableAction("convertCosts",enable);
		this.scheduledCostGrid.enableAction("new",enable);
		this.scheduledCostGrid.enableAction("approve",enable);
		this.scheduledCostGrid.enableAction("delete",enable);
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
		var panel = this.scheduledCostGrid;
		if(this.isBuilding){
			panel.setTitle(getMessage('title_sched_cost_bldg')+' '+ this.bl_id);
		}else if(this.isProperty){
			panel.setTitle(getMessage('title_sched_cost_prop')+' '+ this.pr_id);
		}else if(this.isLease){
			panel.setTitle(getMessage('title_sched_cost_lease')+' '+ this.ls_id);
		}else if(this.isAccount){
			panel.setTitle(getMessage('title_sched_cost_acc')+' '+ this.ac_id);
		}else if(this.isParcel){
			panel.setTitle(getMessage('title_sched_cost_parcel')+' '+ this.parcel_id);
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
			var row = grid.rows[i].row;
			var dateDue = row.getRecord().getValue('cost_tran_sched.date_due');
			if(dateDue < crtDate){
				row.cells.get('cost_tran_sched.date_due').dom.style.backgroundColor = '#FF0000';
			}
		}
	},
    scheduledCostGrid_onApprove: function(row){
        var costIds = getFieldValuesFromSelectedRows(this.scheduledCostGrid, 'cost_tran_sched.cost_tran_sched_id');
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
        var costIds = getFieldValuesFromSelectedRows(this.scheduledCostGrid, 'cost_tran_sched.cost_tran_sched_id');
        if (costIds.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        }
        else {
        
            View.confirm(getMessage('confirm_delete_scheduled'), function(button){
                if (button == 'yes') {
                    try {
                    	Workflow.callMethod('AbCommonResources-CostService-deleteScheduledCosts', costIds);
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

    	var costTranSchedId = null;
        if(valueExists(row)){
        	costTranSchedId = row.getFieldValue("cost_tran_sched.cost_tran_sched_id");
        }

        var runtimeParameters = {
        		isNewRecord: isNew,
        		isBuilding: this.isBuilding,
        		isProperty: this.isProperty,
        		isLease: this.isLease,
        		isAccount: this.isAccount,
        		isLandlord: this.isLandlord,
        		ls_id: this.ls_id,
				pr_id: this.pr_id,
				bl_id: this.bl_id,
				ac_id: this.ac_id,
				cost_tran_sched_id: costTranSchedId,
				openerController: this,
				gridPanel: this.scheduledCostGrid
        };
    	
        View.openDialog('ab-rplm-cost-mgmt-add-edit-scheduled.axvw', null, false, {
            width: 900,
            height: 700,
            closeButton: true,
            runtimeParameters: runtimeParameters
        });
    },
    
    /**
     * Update conversion rates for selected costs.
     */
    scheduledCostGrid_onConvertCosts: function(){
        var costIds = getFieldValuesFromSelectedRows(this.scheduledCostGrid, 'cost_tran_sched.cost_tran_sched_id');
        if (costIds.length == 0) {
            View.showMessage(getMessage('noItemSelected'));
        }
        else {
        	// create cost types array
        	var costTypes = [];
        	for(var i = 0; i < costIds.length; i++){
        		costIds[i] = parseInt(costIds[i]);
        		costTypes.push("cost_tran_sched");
        	}
        	
    		var message = getMessage("msg_job_run");
    		var objGrid = this.scheduledCostGrid;
    		try{
        		var jobId  = Workflow.startJob('AbCommonResources-CostService-convertCostForVATAndMC', costIds, costTypes);
    		    View.openJobProgressBar(message, jobId, '', function(status) {
    		    	if(valueExists(status.jobProperties.noExchangeRate)){
    		    		View.showMessage(status.jobProperties.noExchangeRate);
    		    	}
    		    	objGrid.refresh();
    		    });
    		}catch(e){
        		Workflow.handleError(e);
        		return false;
    		}
        }
    }
})
