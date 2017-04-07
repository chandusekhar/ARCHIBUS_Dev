var leasesApprovedCostController = View.createController('leasesApprovedCostCtrl', {
	ls_id: null,
	afterInitialDataFetch: function(){
		this.gridApprovedCost.refresh("cost_tran.cost_tran_id = -1");
	},
	gridApprovedCost_onRefresh: function(){
		if(this.ls_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran.ls_id': this.ls_id});
			this.gridApprovedCost.refresh(restriction);
		}
	},
	gridLease_onRefresh: function(){
		this.gridLease.refresh();
	}
});

function loadCosts(row){
	leasesApprovedCostController.ls_id = row['ls.ls_id'];
	leasesApprovedCostController.gridApprovedCost_onRefresh();
}
