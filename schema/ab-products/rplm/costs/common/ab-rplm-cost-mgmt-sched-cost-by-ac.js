var accountSchedCostController = View.createController('accountSchedCostCtrl', {
	ac_id: null,
	afterInitialDataFetch: function(){
		this.gridScheduledCost.refresh("cost_tran_sched.cost_tran_sched_id = -1");
	},
	gridScheduledCost_onRefresh: function(){
		if(this.ac_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_sched.ac_id': this.ac_id});
			this.gridScheduledCost.refresh(restriction);
		}
	},
	gridAccount_onRefresh: function(){
		this.gridAccount.refresh();
	}
});

function loadCosts(row){
	accountSchedCostController.ac_id = row['ac.ac_id'];
	accountSchedCostController.gridScheduledCost_onRefresh();
}
