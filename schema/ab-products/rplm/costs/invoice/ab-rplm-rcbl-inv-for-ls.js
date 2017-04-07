var invForLsController = View.createController('invForLsCtrl', {
	groupByField: "ls_id",
	groupByTable: "ls",
	ls_id:null,
	invoice_id:null,
	
	afterViewLoad: function(){
		addParametersToInvoicePanel(this.groupByField, this.ls_id);
	},
	
	afterInitialDataFetch: function(){
		initInvoicePanel(this.groupByField);
		initCostPanel();
	},
	
	gridInvForLeasesBuilding_onRefresh: function(){
		this.gridInvForLeasesBuilding.refresh();
    },
	    
    setGroupByValue: function(groupByValue){
    	this.ls_id = groupByValue;
    }
});

function loadInvoices(row){
	loadInvoicesPanel(row, invForLsController.id);
}

function loadCosts(row){
	loadCostsPanel(row, invForLsController.id);
}