var abExMetricRunJobController = View.createController('abExMetricRunJobController', {
	
	abExMetricRunJob_form_onCollectData: function(){
		var metricName = this.abExMetricRunJob_form.getFieldValue("afm_metric_definitions.metric_name");
		var collectDate = this.abExMetricRunJob_form.getFieldValue("vf_collect_date");
		if (valueExistsNotEmpty(metricName) && valueExistsNotEmpty(collectDate)) {
			try {
				var result = Workflow.callMethod("AbCommonResources-MetricsService-collectDataForMetricAndDate", metricName, collectDate);
				if (result.code == 'executed') {
					View.showMessage(getMessage('dataCollected'));
					this.abExMetricTrendValues.refresh(new Ab.view.Restriction({'afm_metric_trend_values.metric_name': metricName}));
					
				}
			} catch (e) {
				Workflow.handleError(e);
			}
			
		}else{
			View.showMessage(getMessage('errorMissingData'));
		}
	}
	
})