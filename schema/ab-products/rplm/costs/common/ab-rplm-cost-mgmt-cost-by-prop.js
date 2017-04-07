var propApprovedCostController = View.createController('propApprovedCostCtrl', {
	pr_id: null,
	afterInitialDataFetch: function(){
		this.gridApprovedCost.refresh("cost_tran.cost_tran_id = -1");
	},
	gridApprovedCost_onRefresh: function(){
		if(this.pr_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran.pr_id': this.pr_id});
			this.gridApprovedCost.refresh(restriction);
		}
	},
	gridProperty_onRefresh: function(){
		this.gridProperty.refresh();
	}
});

function loadCosts(row){
	propApprovedCostController.pr_id = row['property.pr_id'];
	propApprovedCostController.gridApprovedCost_onRefresh();
}