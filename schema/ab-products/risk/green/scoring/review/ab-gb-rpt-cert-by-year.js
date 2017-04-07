var abGbRptCertBlSumByStdController = View.createController('abGbRptCertBlSumByStdController',{
	/**
	 * on_click event handler for 'Show' action
	 */
	 		 
	/**
	 * Object: consoleRes is a string format sql restriction that generated from top consoles field values
	 */
	/**
	 * This event handler is called when user click doc button in title bar of Top console
	 * Construct a restriction from consoles fields
	 * Open the paginated report view "ab-gb-rpt-cert-bl-sum-by-std -paginate.axvw" by passing restriction to datasource of paginated panel. 
	 */
	 
	 
	abGbRptCertByYearConsole_onDoc: function() {	
    var restriction = this.abGbRptCertByYearConsole.getFieldRestriction();
    var passedRestrictions = {'ds_abGbCertCreditRpt': restriction, 'ds_abGbCertCreditRpt2': restriction};
    var parameters = {'printRestriction': true };
		//passing parameters and restrictions
		View.openPaginatedReportDialog('ab-gb-rpt-cert-by-year-paginate.axvw', passedRestrictions, parameters);
	}
		
})
