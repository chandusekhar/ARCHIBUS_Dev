var invForBlController = View.createController('invForBlCtrl', {
	groupByField: "bl_id",
	groupByTable: "bl",
	bl_id: null,
	invoice_id:null,
	
	afterViewLoad: function(){
		addParametersToInvoicePanel(this.groupByField, this.bl_id);
	},
	
	afterInitialDataFetch: function(){
		initInvoicePanel(this.groupByField);
		initCostPanel();
	},
	
	gridInvForBldgsBuilding_onRefresh: function(){
		this.gridInvForBldgsBuilding.refresh();
    },
	    
    setGroupByValue: function(groupByValue){
    	this.bl_id = groupByValue;
    }
});

function loadInvoices(row){
	loadInvoicesPanel(row, invForBlController.id);
}

function loadCosts(row){
	loadCostsPanel(row, invForBlController.id);
}