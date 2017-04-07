var addFldsCtrl = View.createController('addFldsCtrl', {

	abViewdefEditformDrilldown_detailsPanel_afterRefresh: function() {
		if (this.abViewdefEditformDrilldown_detailsPanel.newRecord === true) {
			this.abViewdefEditformDrilldown_detailsPanel.setFieldValue("uc_metric_additional_fields.metric_name", "");
		}
	},

	onChangeType: function() {
		var form = this.abViewdefEditformDrilldown_detailsPanel;
		var num = form.getFieldValue("uc_metric_additional_fields.uc_metric_numerator");
		var den = form.getFieldValue("uc_metric_additional_fields.uc_metric_denominator");
		if (valueExistsNotEmpty(num) && valueExistsNotEmpty(den)) {
			var result = parseFloat((parseInt(num) / parseInt(den)).toFixed(2));
			form.setFieldValue("uc_metric_additional_fields.uc_metric_ratios", result);
		}
	}

});