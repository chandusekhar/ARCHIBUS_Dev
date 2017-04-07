var defPrbDescCodesController = View.createController('defPrbDescCodesCtrl',{
	// export list_DefPrbDesc panel to CSV
	treePanel_onExport_pd_dsc_cd: function(){
		var progressReportParameters = {};
        progressReportParameters.dataSourceId = "ds_DefPrbDesc";
        progressReportParameters.panelId = "list_DefPrbDesc";
        progressReportParameters.panelRestriction = "null";
        progressReportParameters.panelTitle = this.list_DefPrbDesc.title;
        progressReportParameters.transferAction = "OUT";
        progressReportParameters.transferFormat = "CSV";
        progressReportParameters.viewName = "ab-def-prob-desc-code.axvw";
        
        //kb# 3028213
        //make the dialog width big enough to workaround 'double text' issue in IE8
        View.openDialog('ab-ca-mng-pda-transfer.axvw', null, true, {
            width: 1200,
            height: 600,
            closeButton: true,
            progressReportParameters: progressReportParameters
        });
	}
});