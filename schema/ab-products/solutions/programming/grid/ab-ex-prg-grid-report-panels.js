
View.createController('reportPanels', {

	afterInitialDataFetch: function() {
		var record = this.prgGridReportPanels_wrForm.getRecord();
		var wrId = record.getValue('wr.wr_id');

		var cfRest = new Ab.view.Restriction();
		cfRest.addClause("wrcf.wr_id", wrId, '=');
		this.prgGridReportPanels_cfReport.refresh(cfRest);
		
		var tlRest = new Ab.view.Restriction();
		tlRest.addClause("wrtl.wr_id", wrId, '=');
		this.prgGridReportPanels_toolReport.refresh(tlRest);
		
		var ptRest = new Ab.view.Restriction();
		ptRest.addClause("wrpt.wr_id", wrId, '=');
		this.prgGridReportPanels_ptReport.refresh(ptRest);
		
		var otherRest = new Ab.view.Restriction();
		otherRest.addClause("wr_other.wr_id", wrId, '=');
		this.prgGridReportPanels_otherReport.refresh(otherRest);
		
		this.prgGridReportPanels_otherReport.addAction({
	         id: 'test',
	         text: getMessage('actionTitle'),
	         listener: this.prgGridReportPanels_otherReport_onTest.createDelegate(this)
	     }); 
	},

	prgGridReportPanels_otherReport_onTest: function() {
	    View.showMessage('You clicked on the button');
	}
});
