var dvApprovedCostController = View.createController('dvApprovedCostCtrl', {
	dv_id: null,
	afterViewLoad: function(){
		this.formApprovedCostByDvArea.refresh(new Ab.view.Restriction({'dv.dv_id':'-1'}));
	},
	
	gridApprovedCostByDv_onRefresh: function(){
		if(this.dv_id != null){
			this.gridApprovedCostByDv.addParameter('dvId', this.dv_id);
			this.gridApprovedCostByDv.refresh();
			this.formApprovedCostByDvArea.refresh(new Ab.view.Restriction({'dv.dv_id':this.dv_id}));
		}
	},
	gridLease_onRefresh: function(){
		this.gridDv.refresh();
	}
});

function loadCosts(row){
	dvApprovedCostController.dv_id = row['dv.dv_id'];
	dvApprovedCostController.gridApprovedCostByDv_onRefresh();
}
