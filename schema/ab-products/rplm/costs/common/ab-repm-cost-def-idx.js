var abRepmCostDefIdxCtrl = View.createController('abRepmCostDefIdxCtrl', {

	afterInitialDataFetch: function(){
		this.abRepmCostIndexValues.showColumn("cost_index_values.cost_index_id", false);
	},
	
	// Refresh form to initial state (current restriction, new record or not)
	abRepmCostIndexForm_onCancel: function(){
		this.abRepmCostIndexForm.refresh(this.abRepmCostIndexForm.restriction, this.abRepmCostIndexForm.newRecord);
	},
	
	
	// Open index value form in pop-up applying selected cost index restriction
	abRepmCostIndexValues_onNew: function(){
		this.abRepmCostIndexValuesForm.refresh(this.abRepmCostIndexValues.restriction, true);
		this.abRepmCostIndexValuesForm.showInWindow({
			width: 600,
			height: 300
		});
	},
	
	//Refresh index values grid - must be used after data transfer in
	abRepmCostIndexValues_onRefresh: function(){
		this.abRepmCostIndexValues.refresh(this.abRepmCostIndexValues.restriction);
	},
})