var abGbRptCertProjCompController =View.createController('abGbRptCertProjCompController', {
       
    // ----------------------- event handlers -------------------------
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['bl.site_id',,'bl.site_id'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'], ['gb_cert_proj.project_name',,'gb_cert_proj.project_name'], ['gb_cert_proj.bl_id',,'gb_cert_proj.bl_id'] , ['gb_cert_proj.project_name',,'gb_cert_proj.project_name'], ['gb_cert_proj.cert_std',,'gb_cert_proj.cert_std'], ['gb_cert_proj.certified_level',,'gb_cert_proj.certified_level'], ['gb_cert_proj.cert_status',,'gb_cert_proj.cert_status']),
	/**
	 * Object: consoleRes is a string format sql restriction that generated from top consoles field values
	 */
	consoleRes:'1=1',

       
    /**
	 * This event handler is called when user click Show button in title bar of Top console
	 * Construct a string format sql restriction from consoles fields, store it to property consoleRes;
	 * Select first tab, Set consoleRes to sql parameter 'consoleRes' of panel Left Bottom Certification Standard grid and show this grid.
	 * Hide grid panels in second tab and third tab.
	 */
    abGbRptCertProjCompConsole_onFilter: function() {
		this.consoleRes=this.getConsoleRestriction();
		this.abGbRptCertProjCompPeriodChartPanel.addParameter('consoleRes', this.consoleRes);
		this.abGbRptCertProjCompPeriodChartPanel.refresh();
		this.abGbRptCertProjCompScoreChartPanel.addParameter('consoleRes', this.consoleRes);
		this.abGbRptCertProjCompScoreChartPanel.refresh();
		this.abGbRptCertProjCompLevelChartPanel.addParameter('consoleRes', this.consoleRes);
		this.abGbRptCertProjCompLevelChartPanel.refresh();
		
	},
	
	/**
	 * Get restriction from console
	 */
	getConsoleRestriction: function() {
		var console = View.panels.get('abGbRptCertProjCompConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		return restriction;
	}
});
