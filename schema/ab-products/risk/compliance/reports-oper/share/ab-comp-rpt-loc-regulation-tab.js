var regulationController = View.createController('regulationController',{
	mainController:'',
	
	/**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
    	hideEmptyColumnsByPrefix(this.regulationGrid,'compliance_locations');
    },
    
    /**
     * Open detail
     */
    regulationGrid_onView: function(row){
		
		var record = row.getRecord();
		
		var regulation = record.getValue("regloc.regulation");
		
		var restriction = {
				'regulation.regulation': regulation
			};
		Ab.view.View.openDialog('ab-comp-rpt-regulation-form.axvw',  restriction, false, 0, 0, 700, 400);  
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	regulationGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.mainController.selectRes;
		View.openPaginatedReportDialog("ab-comp-oper-loc-reg-paginate-rpt.axvw" ,null, parameters);

	}
    
    
});