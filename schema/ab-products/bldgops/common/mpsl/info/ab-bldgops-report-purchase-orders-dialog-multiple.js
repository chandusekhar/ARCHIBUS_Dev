var multiplePoTabsController=View.createController('multiplePoTabsController',{
	existingRecords: [],
	hasExistingRecors: true,
	afterViewLoad: function(){
		this.PurchaseOrderMultipleTabs.addEventListener('afterTabChange', this.afterTabChange);
		this.PurchaseOrderMultipleTabs.addEventListener('beforeTabChange',this.beforeTabChange);
	},
	/**
	 * before tab change.
	 */
	beforeTabChange: function(tabPanel, currentTabName, newTabName){
		var canChange=true;
		if(currentTabName=='createPurchaseOrderMultiTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('createMultiSupplyReqController');
		        
		        this.existingRecords=controller.getSelectPartsRecords();
		        
		    } 
		}
		
		if(currentTabName=='addToExistingPurchaseOrderMultiTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('addToExistPurchaseOrderMultipleController');
		        
		        this.existingRecords=controller.getSelectPartsRecords();
		        
		        if(controller.getExistingPurchaseOrderListRowLength()>0){
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
		if(newTabName=='addToExistingPurchaseOrderMultiTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		    	var controller=currentTab.getContentFrame().View.controllers.get('addToExistPurchaseOrderMultipleController');
		    	controller.setPreTabValueAfterTabChange(this.existingRecords);
		    	
		    }
		}
		
		if(newTabName=='createPurchaseOrderMultiTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		    	var controller=currentTab.getContentFrame().View.controllers.get('createMultiSupplyReqController');
		    	controller.setPreTabValueAfterTabChange(this.existingRecords,this.hasExistingRecors);
		    	
		    }
		}
		
	}
});