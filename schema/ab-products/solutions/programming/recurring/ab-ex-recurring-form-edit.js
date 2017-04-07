/**
 * Controller.
 */
var abExRecurringFormEditCtrl = View.createController('abExRecurringFormEditCtrl', {
	metricName: 'editRecurringPatternTest',
	
	afterViewLoad: function(){
		// customize form panel.
		Ab.recurring.RecurringControl.addField({
			panel: this.abExRecurringForm_form,
			fields: new Array("afm_metric_definitions.recurring_rule")
		});
	},
	
	afterInitialDataFetch: function(){
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_metric_definitions.metric_name', this.metricName, '=');
		var record = this.abExRecurringForm_ds.getRecord(restriction);
		if (!valueExistsNotEmpty(record.getValue('afm_metric_definitions.metric_name'))) {
			// is test metric does not exist add new record
			var testRecord = new Ab.data.Record({
				'afm_metric_definitions.metric_name': this.metricName,
				'afm_metric_definitions.metric_title': 'Edit recurring pattern',
				'afm_metric_definitions.description': 'Used to test edit recurring pattern'
			}, true);
			this.abExRecurringForm_ds.saveRecord(testRecord);
		}
		this.abExRecurringForm_form.refresh(restriction);
	}
})