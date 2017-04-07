var mgmtActualCostController = View.createController('mgmtActualCost',{
	
	ls_id:null,
	pr_id:null,
	bl_id:null,
	ac_id:null,
	parcel_id:null,
	
	parentItemId: null,
	
	isBuilding:false,
	isProperty:false,
	isLease:false,
	isAccount:false,
	isParcel:false,
	isLandlord: false,
	
	afterViewLoad: function(){
    	// create selection menu
		var btnObject = Ext.get('setSelected');
		btnObject.on('click', this.showSetSelectedMenu, this, null);
    },
    
    showSetSelectedMenu: function(e, item){
		var menuItems =[];
		menuItems.push({text: getMessage("menu_as_cam"),
			handler: addSubmenu.createDelegate(this, [this.actualCostGrid, "cost_tran", "cost_tran_id", "CAM"]) 
		});	
		menuItems.push({text: getMessage("menu_as_non_cam"),
				handler: addSubmenu.createDelegate(this, [this.actualCostGrid, "cost_tran", "cost_tran_id", "NON-CAM"]) 
		});	
    	var menu = new Ext.menu.Menu({items: menuItems});
        menu.showAt(e.getXY());
	},
	
	enableButtons: function(enable){
		this.actualCostGrid.enableAction("exportXls",enable);
    },
    
	reset:function(){
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
	actualCostGrid_details_onClick: function(row){
		var controller = this;
		var actualCostId = row.getFieldValue("cost_tran.cost_tran_id");
		
        View.openDialog('ab-rplm-cost-mgmt-details-actual.axvw', null, false, {
            width: 900,
            height: 700,
            closeButton: true,
            openerController: controller,
            actualCostId: actualCostId,
            isLandlord: this.isLandlord,
            isAccount: this.isAccount
        });
	},
    
	setTitle: function(){
		var panel = this.actualCostGrid;
		if(this.isBuilding){
			panel.setTitle(getMessage('title_actual_cost_bldg')+' '+ this.bl_id);
		}else if(this.isProperty){
			panel.setTitle(getMessage('title_actual_cost_prop')+' '+ this.pr_id);
		}else if(this.isLease){
			panel.setTitle(getMessage('title_actual_cost_lease')+' '+ this.ls_id);
		}else if(this.isAccount){
			panel.setTitle(getMessage('title_actual_cost_acc')+' '+ this.ac_id);
		}else if(this.isParcel){
			panel.setTitle(getMessage('title_actual_cost_parcel')+' '+ this.parcel_id);
		}
	}
})