var invForAcController = View.createController('invForAcCtrl', {
	groupByField: "ac_id",
	groupByTable: "ac",
	ac_id: null,
	invoice_id:null,
	
	afterViewLoad: function(){
		addParametersToInvoicePanel(this.groupByField, this.ac_id);
	},
	
	afterInitialDataFetch: function(){
		initInvoicePanel(this.groupByField);
		initCostPanel();
	},
	
	gridInvForAccountsAccount_onRefresh: function(){
		this.gridInvForAccountsAccount.refresh();
    },
	
    setGroupByValue: function(groupByValue){
    	this.ac_id = groupByValue;
    }
});

function loadInvoices(row){
	loadInvoicesPanel(row, invForAcController.id);
}

function loadCosts(row){
	loadCostsPanel(row, invForAcController.id);
}