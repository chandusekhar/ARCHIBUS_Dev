var abExRecurringPatternController = View.createController('abExRecurringPatternController', {
	
	xmlRecurringPattern: '<recurring type="month" value1="last" value2="day" value3="1" total=""/>',
	
	afterViewLoad: function(){
		// customize grid panel
		Ab.recurring.RecurringControl.addField({
			panel: this.abExRecurringPattern_list,
			fields: new Array("afm_metric_definitions.recurring_rule"),
			exportButtons: new Array({id: "exportToXLS", type: "XLS"})
		});
		
		// customize form panel.
		Ab.recurring.RecurringControl.addField({
			panel: this.abExRecurringPattern_form,
			fields: new Array("afm_metric_definitions.recurring_rule")
		});

		Ab.recurring.RecurringControl.addField({
			panel: this.abExRecurringPattern_columnReport,
			fields: new Array("afm_metric_definitions.recurring_rule"),
			exportButtons: new Array({id: "exportToDOCX", type: "DOCX"})
		});
		
	},
	
	abExRecurringPattern_list_onExportToDOCX: function(){
		View.openPaginatedReportDialog("ab-ex-recurring-rpt.axvw" ,null, null);
	}
});