
var abReportViolationController = View.createController('abReportViolationController', {


    
	abCompViolationGrid_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var id = record.getValue("regviolation.violation_num");
		if (valueExistsNotEmpty(id)) {
			restriction.addClause('regviolation.violation_num', id, '=');
		}	
		View.openDialog('ab-comp-violation-details.axvw',restriction);
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	abCompViolationGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.abCompViolationGrid.restriction?this.abCompViolationGrid.restriction:" 1=1 ";
		View.openPaginatedReportDialog("ab-comp-violation-paginate-rpt.axvw" ,null, parameters);

	}
	
	
});

