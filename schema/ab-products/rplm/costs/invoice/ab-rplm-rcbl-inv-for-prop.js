var invForPropController = View.createController('invForPropCtrl', {
	groupByField: "pr_id",
	groupByTable: "property",
	pr_id: null,
	invoice_id:null,
	
	afterViewLoad: function(){
		addParametersToInvoicePanel(this.groupByField, this.pr_id);
	},
	
	afterInitialDataFetch: function(){
		this.gridInvForPropertiesProperty.addParameter('optYes', getMessage('opt_status_yes'));
		this.gridInvForPropertiesProperty.addParameter('optNo', getMessage('opt_status_no'));
		this.gridInvForPropertiesProperty.refresh();
		
		initInvoicePanel(this.groupByField);
		initCostPanel();
	},
	
	gridInvForPropertiesProperty_onRefresh: function(){
		this.gridInvForPropertiesProperty.refresh();
    },
	    
    setGroupByValue: function(groupByValue){
    	this.pr_id = groupByValue;
    }
});

function loadInvoices(row){
	loadInvoicesPanel(row, invForPropController.id);
}

function loadCosts(row){
	loadCostsPanel(row, invForPropController.id);
}
