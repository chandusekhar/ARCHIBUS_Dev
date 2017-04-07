View.createController('abMoGrEditLeaving_ctrl',{
	
	afterInitialDataFetch: function(){
		// hide tabs if panels are empty
		
		if (this.grid_abMoGroupEditLeavingEq.rows.length == 0){
			this.abMoGroupEditLeaving_tabsFrame.hideTab(1);
		}
		if (this.grid_abMoGroupEditLeavingTa.rows.length == 0){
			this.abMoGroupEditLeaving_tabsFrame.hideTab(2);
		}
	}
});
