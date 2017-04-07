var programController = View.createController('programController',{
	mainController:'',
	
	/**
     * This function is called when the page is loaded into the browser.
     */
    afterInitialDataFetch: function(){
    	this.mainController=View.getOpenerView().controllers.get(0);
    },
    
    /**
     * Open detail
     */
    programGrid_onView: function(row){
    	var record = row.getRecord();
    	
		var regulation = record.getValue("regloc.regulation");
		var reg_program = record.getValue("regloc.reg_program");
		
		var restriction = {
			'regprogram.regulation': regulation,
			'regprogram.reg_program': reg_program
		};
		Ab.view.View.openDialog('ab-comp-rpt-program-form.axvw', restriction, false, 0, 0, 800, 400);  
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	programGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.mainController.selectRes;
		View.openPaginatedReportDialog("ab-comp-oper-loc-program-paginate-rpt.axvw" ,null, parameters);

	}
    
});