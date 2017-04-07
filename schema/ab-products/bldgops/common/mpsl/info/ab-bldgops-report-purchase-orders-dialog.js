var poTabsController=View.createController('poTabsController',{
	//reset quantity and comment after tab changed.
	transQty: 0,
	unitCost: 0,
	comments:"",
	hasRecords: true,
	afterViewLoad: function(){
		this.PurchaseOrderTabs.addEventListener('afterTabChange', this.afterTabChange);
		this.PurchaseOrderTabs.addEventListener('beforeTabChange',this.beforeTabChange);
	},
	
	/**
	 * before tab change.
	 */
	beforeTabChange: function(tabPanel, currentTabName, newTabName){
		var canChange=true;
		if(currentTabName=='createPurchaseOrderTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
		        var controller = currentTab.getContentFrame().View.controllers.get('createPurchaseOrderController');
		        
		        this.transQty=controller.PurchaseOrderCreateForm.getFieldValue('po_line.quantity');
		        this.unitCost=controller.PurchaseOrderCreateForm.getFieldValue('po_line.unit_cost');
		        this.comments=controller.PurchaseOrderCreateForm.getFieldValue('po.comments');
		    } 
		}
		
		if(currentTabName=='addToExistingPurchaseOrderTab'){
			var currentTab = tabPanel.findTab(currentTabName);
			if (currentTab.isContentLoaded) {
				var controller = currentTab.getContentFrame().View.controllers.get('createPurchaseOrderController');
				this.transQty=controller.PurchaseOrderCreateForm.getFieldValue('po_line.quantity');
		        this.unitCost=controller.PurchaseOrderCreateForm.getFieldValue('po_line.unit_cost');
		        this.comments=controller.PurchaseOrderCreateForm.getFieldValue('po.comments');
		        if(controller.getExistingPurchaseOrderListRowLength()==0){
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
		if(newTabName=='createPurchaseOrderTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		    	var controller=currentTab.getContentFrame().View.controllers.get('createPurchaseOrderController');
		    	controller.resetFieldsValueAfterTabChange(this.transQty,this.unitCost,this.comments,this.hasRecords);
		    	
		    }
		}
		
		if(newTabName=='addToExistingPurchaseOrderTab'){
			var currentTab = tabPanel.findTab(newTabName);
		    if (currentTab.isContentLoaded) {
		    	var controller=currentTab.getContentFrame().View.controllers.get('createPurchaseOrderController');
		    	controller.resetFieldsValueAfterTabChange(this.transQty,this.unitCost,this.comments);
		    	
		    }
		}
		
		
	}
});

