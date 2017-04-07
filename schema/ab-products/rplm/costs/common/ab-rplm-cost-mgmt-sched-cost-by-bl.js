var bldgSchedCostController = View.createController('bldgSchedCostCtrl', {
	bl_id: null,
	afterInitialDataFetch: function(){
		this.gridScheduledCost.refresh("cost_tran_sched.cost_tran_sched_id = -1");
	},
	gridScheduledCost_onRefresh: function(){
		if(this.bl_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_sched.bl_id': this.bl_id});
			this.gridScheduledCost.refresh(restriction);
		}
	},
	gridBuilding_onRefresh: function(){
		this.gridBuilding.refresh();
	}
});

function loadCosts(row){
	bldgSchedCostController.bl_id = row['bl.bl_id'];
	bldgSchedCostController.gridScheduledCost_onRefresh();
}
