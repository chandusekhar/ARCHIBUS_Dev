var prbDescCodesController = View.createController('prbDescCodesCtrl',{
	/**
	 * show paginated report
	 */
	repProblDescCodes_onPaginatedReport: function(){
		View.openPaginatedReportDialog('ab-ca-prb-des-cd-prnt.axvw');
	},
	
	repProblDescCodes_onExport_pd_dsc_cd: function(){
		var progressReportParameters = {};
        progressReportParameters.dataSourceId = "ds_PrbDesc";
        progressReportParameters.panelId = "list_PrbDesc";
        progressReportParameters.panelRestriction = "null";
        progressReportParameters.panelTitle = this.list_PrbDesc.title;
        progressReportParameters.transferAction = "OUT";
        progressReportParameters.transferFormat = "CSV";
        progressReportParameters.viewName = "ab-ca-prb-des-cd-rep.axvw";
        View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
            width: 800,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
	}
});
