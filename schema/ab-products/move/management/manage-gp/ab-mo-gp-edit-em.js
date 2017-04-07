View.createController('abMoGrEditEm_ctrl',{
	
	afterInitialDataFetch: function(){
		// hide tabs if panels are empty
		
		if (this.grid_abMoGroupEditEm.rows.length == 0){
			this.abMoGroupEditEm_tabsFrame.hideTab(1);
		}
		if (this.grid_abMoGroupEditTa.rows.length == 0){
			this.abMoGroupEditEm_tabsFrame.hideTab(2);
		}
	}
});
