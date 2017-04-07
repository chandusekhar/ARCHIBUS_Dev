var accountApprovedCostController = View.createController('accountApprovedCostCtrl', {
	ac_id: null,
	afterInitialDataFetch: function(){
		this.gridApprovedCost.refresh("cost_tran.cost_tran_id = -1");
	},
	gridApprovedCost_onRefresh: function(){
		if(this.ac_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran.ac_id': this.ac_id});
			this.gridApprovedCost.refresh(restriction);
		}
	},
	gridAccount_onRefresh: function(){
		this.gridAccount.refresh();
	}
});

function loadCosts(row){
	accountApprovedCostController.ac_id = row['ac.ac_id'];
	accountApprovedCostController.gridApprovedCost_onRefresh();
}