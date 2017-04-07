var propSchedCostController = View.createController('propSchedCostCtrl', {
	pr_id: null,
	afterInitialDataFetch: function(){
		this.gridScheduledCost.refresh("cost_tran_sched.cost_tran_sched_id = -1");
	},
	gridScheduledCost_onRefresh: function(){
		if(this.pr_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_sched.pr_id': this.pr_id});
			this.gridScheduledCost.refresh(restriction);
		}
	},
	gridProperty_onRefresh: function(){
		this.gridProperty.refresh();
	}
});

function loadCosts(row){
	propSchedCostController.pr_id = row['property.pr_id'];
	propSchedCostController.gridScheduledCost_onRefresh();
}