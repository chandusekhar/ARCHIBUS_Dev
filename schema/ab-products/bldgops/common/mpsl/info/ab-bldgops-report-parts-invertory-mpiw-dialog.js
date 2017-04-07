var partInventoryMpiwDialogControlller=View.createController('partInventoryMpiwDialogControlller',{
	storagelocId: "",
	//reset quantity and comment after tab changed.
	transQty: 0,
	comments:"",
	hasRecords: true,
	afterViewLoad: function(){
		this.SupplyReqTabs.addEventListener('afterTabChange', this.afterTabChange);
		this.SupplyReqTabs.addEventListener('beforeTabChange',this.beforeTabChange);
	},
	/**
	 * before tab change.
	 */
	beforeTabChange: function(tabPanel, currentTabName, newTabName){
		var canChange=true;
		if(currentTabName=='createSupplyReqTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('parInventoryMpiwDialogCreateSupplyReqController');
		        var fromStorageLoction=controller.SupplyRequisitionCreateForm.getFieldValue('it.pt_store_loc_from');
		        this.transQty=controller.SupplyRequisitionCreateForm.getFieldValue('it.trans_quantity');
		        this.comments=controller.SupplyRequisitionCreateForm.getFieldValue('it.comments');
		        if(!valueExistsNotEmpty(fromStorageLoction)){
		        	View.alert(getMessage('storageLocationFromNotEmptyMsg'));
		        	canChange=false;
		        }else{
		        	this.storagelocId=fromStorageLoction;
		        }
		    } 
		}
		
		if(currentTabName=='addToExistingSupplyReqTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
				var controller = currentTab.getContentFrame().View.controllers.get('dialogAddExistingSupplyController');
				this.transQty=controller.existsSupplyReqTransForm.getFieldValue('it.trans_quantity');
		        this.comments=controller.existsSupplyReqTransForm.getFieldValue('it.comments');
		        
		        if(controller.getExistingSupplyRequisitionListRowLength()==0){
		        	this.hasRecords=false;
		        }else{
		        	this.hasRecords=true;
		        }
			}
		}
		return canChange;
	},
	/**
	 * after tab change.
	 */
	afterTabChange: function(tabPanel, newTabName){
		if(newTabName=='addToExistingSupplyReqTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		        //get storage location from first tab
		    	if(valueExistsNotEmpty(this.storagelocId)){
		    		var controller=currentTab.getContentFrame().View.controllers.get('dialogAddExistingSupplyController');
			    	controller.afterTabSelect(this.storagelocId);
			    	controller.resetFieldsValueAfterTabChange(this.transQty,this.comments);
		    	}
		    	
		    }
		}
		
		if(newTabName=='createSupplyReqTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		    	var controller=currentTab.getContentFrame().View.controllers.get('parInventoryMpiwDialogCreateSupplyReqController');
		    	controller.resetFieldsValueAfterTabChange(this.transQty,this.comments,this.hasRecords);
		    	
		    }
		}
		
		
	}

});
