var recCostByAcController = View.createController('recCostByAcCtrl', {
	ac_id: null,
	afterInitialDataFetch: function(){
		this.recurringCostGrid.refresh("cost_tran_recur.cost_tran_recur_id = -1");
	},
    accountSelection_onRefresh: function(){
    	this.accountSelection.refresh();
    },
    recurringCostGrid_onRefresh: function(){
		if(this.ac_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_recur.ac_id': this.ac_id});
			this.recurringCostGrid.refresh(restriction);
		}
    }
});

function loadCosts(row){
	var ac_id = row['ac.ac_id'];
	queryParameter = "cost_tran_recur.ac_id = '"+ac_id+"'";
	recCostByAcController.ac_id = ac_id;
	recCostByAcController.recurringCostGrid.refresh(queryParameter);
}