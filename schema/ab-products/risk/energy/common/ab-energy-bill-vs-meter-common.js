var energyBillVsMeterCommonController = View.createController('energyBillVsMeterCommon', {
	report_limit_low_crit: -15,
	report_limit_low_warn: -5,
	report_limit_high_warn: 5,
	report_limit_high_crit: 15,
	
	afterViewLoad:function() {
		var records = this.energyBillVsMeterCommon_dsMetricDef.getRecords();
		if (records.length > 0) {
			var record = records[0];
			this.report_limit_low_crit = 100*record.getValue('afm_metric_definitions.report_limit_low_crit');
			this.report_limit_low_warn = 100*record.getValue('afm_metric_definitions.report_limit_low_warn');
			this.report_limit_high_warn = 100*record.getValue('afm_metric_definitions.report_limit_high_warn');
			this.report_limit_high_crit = 100*record.getValue('afm_metric_definitions.report_limit_high_crit');
		}
	}
});