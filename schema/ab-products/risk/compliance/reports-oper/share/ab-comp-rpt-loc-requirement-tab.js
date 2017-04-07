var requireController = View.createController('requireController',{
	mainController:'',
	
	//for open pop-up
	isReport: true,
	
	/**
     * This function is called when the page is loaded into the browser.
     */
	 afterInitialDataFetch: function(){
	    	this.mainController=View.getOpenerView().controllers.get(0);
	 },
	    
	/**
	 * Open detail
	 */
	 requireGrid_onView: function(row){
		
		var record = row.getRecord();
		
		var regulation = record.getValue("regloc.regulation");
		
		var reg_program = record.getValue("regloc.reg_program");
		var reg_requirement = record.getValue("regloc.reg_requirement");
		
		var restriction = {
				'regrequirement.regulation': regulation,
				'regrequirement.reg_program': reg_program,
				'regrequirement.reg_requirement': reg_requirement
			};
		Ab.view.View.openDialog('ab-comp-rpt-requirement-form.axvw',  restriction, false, 0, 0, 700, 400);  
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	requireGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.mainController.selectRes;
		View.openPaginatedReportDialog("ab-comp-oper-loc-requirement-paginate-rpt.axvw" ,null, parameters);

	}
    
});