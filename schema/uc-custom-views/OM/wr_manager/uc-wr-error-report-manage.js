var errorReportManageController = View.createController('errorReportManageController', {

	afterViewLoad: function() {
		this.inherit();
		//turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
	},
	
	searchConsole_onSearch: function() {
		var restriction = this.searchConsole.getFieldRestriction();
		this.error_report.refresh(restriction);

	},
	
	searchConsole_onClear: function() {
		this.searchConsole.clear();
	},
	
	error_report_onCompleteBtn: function(row) {
		// Create and save the record.
		var errorId = row.record["uc_eq_error_report.error_id"];
		var errorDs = View.dataSources.get('errorDs');
		var rec = new Ab.data.Record();
		rec.isNew = false;
		rec.setValue("uc_eq_error_report.error_id", errorId);
		rec.setValue("uc_eq_error_report.status", "Com");
		
		rec.oldValues = new Object();
		rec.oldValues["uc_eq_error_report.error_id"] = errorId;
		
		errorDs.saveRecord(rec);
		
		// refresh grid
		this.error_report.refresh();
	}
	
});
