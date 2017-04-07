var leasesSchedCostController = View.createController('leasesSchedCostCtrl', {
	ls_id: null,
	afterInitialDataFetch: function(){
		this.gridScheduledCost.refresh("cost_tran_sched.cost_tran_sched_id = -1");
	},
	gridScheduledCost_onRefresh: function(){
		if(this.ls_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_sched.ls_id': this.ls_id});
			this.gridScheduledCost.refresh(restriction);
		}
	},
	gridLease_onRefresh: function(){
		this.gridLease.refresh();
	}
});

function loadCosts(row){
	leasesSchedCostController.ls_id = row['ls.ls_id'];
	leasesSchedCostController.gridScheduledCost_onRefresh();
}
