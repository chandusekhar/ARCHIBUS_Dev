var recCostByBlController = View.createController('recCostByBlCtrl', {
	bl_id: null,
	afterInitialDataFetch: function(){
		this.recurringCostGrid.refresh("cost_tran_recur.cost_tran_recur_id = -1");
	},
    bldgSelection_onRefresh: function(){
    	this.bldgSelection.refresh();
    },
	recurringCostGrid_onRefresh: function(){
		if(this.bl_id != null){
			var restriction = new Ab.view.Restriction({'cost_tran_recur.bl_id': this.bl_id});
			this.recurringCostGrid.refresh(restriction);
		}
    }
});

function loadCosts(row){
	var bl_id = row['bl.bl_id'];
	var queryParameter = "cost_tran_recur.bl_id = '"+bl_id+"'";
	recCostByBlController.bl_id = bl_id;
	recCostByBlController.recurringCostGrid.refresh(queryParameter);
}
