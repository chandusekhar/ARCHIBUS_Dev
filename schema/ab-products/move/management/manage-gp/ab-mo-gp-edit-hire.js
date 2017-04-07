View.createController('abMoGrEditHire_ctrl',{
	
	afterInitialDataFetch: function(){
		// hide tabs if panels are empty
		
		if (this.grid_abMoGroupEditHireEq.rows.length == 0){
			this.abMoGroupEditHire_tabsFrame.hideTab(1);
		}
		if (this.grid_abMoGroupEditHireTa.rows.length == 0){
			this.abMoGroupEditHire_tabsFrame.hideTab(2);
		}
	}
});
