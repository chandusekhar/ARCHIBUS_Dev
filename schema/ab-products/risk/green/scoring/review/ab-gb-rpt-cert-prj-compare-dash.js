var abGbRptCertProjCompDashController =View.createController('abGbRptCertProjCompDashController', {       
    // ----------------------- event handlers -------------------------	
	afterInitialDataFetch: function(){
		this.abGbRptCertProjCompScoreChartPanel.setDataAxisTitle(getMessage('scoreDataAxisTitle'));
	}
});
