View.createController('abMoGrEditRm_ctrl',{
	
	afterInitialDataFetch: function(){
		// hide tabs if panels are empty
		
		if (this.grid_abMoGroupEditEqRm.rows.length == 0){
			this.abMoGroupEditRm_tabsFrame.hideTab(1);
		}
		if (this.grid_abMoGroupEditTaRm.rows.length == 0){
			this.abMoGroupEditRm_tabsFrame.hideTab(2);
		}
	}
});
