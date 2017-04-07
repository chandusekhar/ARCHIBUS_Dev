var recCostByPrController = View.createController('recCostByPrCtrl', {
	pr_id: null,
	afterInitialDataFetch: function(){
		this.recurringCostGrid.refresh("cost_tran_recur.cost_tran_recur_id = -1");
	},
    propSelection_onRefresh: function(){
    	this.propSelection.refresh();
    },
	recurringCostGrid_onRefresh: function(){
		if(this.pr_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_recur.pr_id': this.pr_id});
			this.recurringCostGrid.refresh(restriction);
		}
    }
});

function loadCosts(row){
	var pr_id = row['property.pr_id'];
	var queryParameter = "cost_tran_recur.pr_id = '"+pr_id+"'";
	recCostByPrController.pr_id = pr_id;
	recCostByPrController.recurringCostGrid.refresh(queryParameter);
}
