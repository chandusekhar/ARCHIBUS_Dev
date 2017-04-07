var bldgApprovedCostController = View.createController('bldgApprovedCostCtrl', {
	bl_id: null,
	afterInitialDataFetch: function(){
		this.gridApprovedCost.refresh("cost_tran.cost_tran_id = -1");
	},
	gridApprovedCost_onRefresh: function(){
		if(this.bl_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran.bl_id': this.bl_id});
			this.gridApprovedCost.refresh(restriction);
		}
	},
	gridBuilding_onRefresh: function(){
		this.gridBuilding.refresh();
	}
});

function loadCosts(row){
	bldgApprovedCostController.bl_id = row['bl.bl_id'];
	bldgApprovedCostController.gridApprovedCost_onRefresh();
}