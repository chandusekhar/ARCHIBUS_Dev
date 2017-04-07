var buApprovedCostController = View.createController('buApprovedCostCtrl',{
	bu_id: null,
	gridApprovedCostByBu_onRefresh: function(){
		if(this.bu_id != null){
			this.gridApprovedCostByBu.addParameter('buId', this.bu_id);
			this.gridApprovedCostByBu.refresh();
		}
	},
	gridBU_onRefresh: function(){
		this.gridBU.refresh();
	}
})

function loadCosts(row){
	buApprovedCostController.bu_id = row['bu.bu_id'];
	buApprovedCostController.gridApprovedCostByBu_onRefresh();
}
