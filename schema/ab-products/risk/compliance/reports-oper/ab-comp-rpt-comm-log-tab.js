
var abReportLogController = View.createController('abReportLogController', {
    
	commGrid_onView: function(row){
		
		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		var id = record.getValue("ls_comm.auto_number");
		if (valueExistsNotEmpty(id)) {
			restriction.addClause('ls_comm.auto_number', id, '=');
		}	
		var panel=this.commForm;
		panel.refresh(restriction);
		panel.show(true);
		this.commForm.showInWindow({
			width: 430,
			height: 450
		});
	},
	
	/**
	* Event Handler of action "Doc"
	*/
	commGrid_onDoc: function(){

		var	parameters = {};
		parameters.consoleRes = this.commGrid.restriction?this.commGrid.restriction:"1=1";
		View.openPaginatedReportDialog("ab-comp-commlog-paginate-rpt.axvw" ,null, parameters);

	}
	
	
});

