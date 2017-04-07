var multiplePartInventoryMpiwDialogControlller=View.createController('multiplePartInventoryMpiwDialogControlller',{
	storagelocId: "",
	existingRecords: [],
	hasExistingRecors: true,
	afterViewLoad: function(){
		this.multipleSupplyReqTabs.addEventListener('afterTabChange', this.afterTabChange);
		this.multipleSupplyReqTabs.addEventListener('beforeTabChange',this.beforeTabChange);
	},
	/**
	 * before tab change.
	 */
	beforeTabChange: function(tabPanel, currentTabName, newTabName){
		var canChange=true;
		if(currentTabName=='createMultipleSupplyReqTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('createMultiSupplyReqController');
		        var fromStorageLoction=controller.inventoryTrasactionLocationPanel.getFieldValue('it.pt_store_loc_from');
		        
		        if(!valueExistsNotEmpty(fromStorageLoction)){
		        	View.alert(getMessage('storageLocationFromNotEmptyMsg'));
		        	canChange=false;
		        }else{
		        	this.storagelocId=fromStorageLoction;
		        }
		        
		        this.existingRecords=controller.getSelectPartsRecords();
		        
		    } 
		}
		
		if(currentTabName=='addToExistingMultipleSupplyReqTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('multipleAddToExsitingSupplyReqController');
		        
		        this.existingRecords=controller.getSelectPartsRecords();
		        
		        if(controller.getExistingSupplyRequisitionListRowLength()>0){
		        	hasExistingRecors=true;
		        }else{
		        	hasExistingRecors=false;
		        }
		    } 
		}
		return canChange;
	},
	/**
	 * after tab change.
	 */
	afterTabChange: function(tabPanel, newTabName){
		if(newTabName=='addToExistingMultipleSupplyReqTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		        //get storage location from first tab
		    	if(valueExistsNotEmpty(this.storagelocId)){
		    		var controller=currentTab.getContentFrame().View.controllers.get('multipleAddToExsitingSupplyReqController');
			    	controller.afterTabSelect(this.storagelocId);
			    	controller.setPreTabValueAfterTabChange(this.existingRecords);
		    	}
		    	
		    }
		}
		
		if(newTabName=='createMultipleSupplyReqTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		        //get storage location from first tab
		    	if(valueExistsNotEmpty(this.storagelocId)){
		    		var controller=currentTab.getContentFrame().View.controllers.get('createMultiSupplyReqController');
			    	controller.setPreTabValueAfterTabChange(this.existingRecords,this.hasExistingRecors);
		    	}
		    	
		    }
		}
		
	}

});
