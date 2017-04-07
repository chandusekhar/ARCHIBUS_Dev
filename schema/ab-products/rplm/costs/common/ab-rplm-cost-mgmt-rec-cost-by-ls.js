var recCostByLsController = View.createController('recCostByLsCtrl', {
	ls_id: null,
	afterInitialDataFetch: function(){
		this.recurringCostGrid.refresh("cost_tran_recur.cost_tran_recur_id = -1");
	},
	leaseSelection_onRefresh: function(){
    	View.controllers.get('recCostByLsCtrl').leaseSelection.refresh();
    },
	recurringCostGrid_onRefresh: function(){
		if(this.ls_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_recur.ls_id': this.ls_id});
			this.recurringCostGrid.refresh(restriction);
		}
    }
});

function loadCosts(row){
	var ls_id = row['ls.ls_id'];
	var queryParameter = "cost_tran_recur.ls_id = '"+ls_id+"'";
	recCostByLsController.ls_id = ls_id;
	recCostByLsController.recurringCostGrid.refresh(queryParameter);
}
