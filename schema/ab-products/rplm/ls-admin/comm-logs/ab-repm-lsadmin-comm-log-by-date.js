/**
 * Controller implementation.
 */
var abRepmLsadminCommLogByDateCtrl = View.createController('abRepmLsadminCommLogByDateCtrl', {
	filterRestriction: null, 
	
	showCommLogGrid: function(){
		var record = this.abRepmLsadminCommLogByDateGrid.rows[this.abRepmLsadminCommLogByDateGrid.selectedRowIndex];
		var date = record["ls_comm.date_of_comm"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(date)){
			restriction.addClause("ls_comm.date_of_comm", date, "=");
		}
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction.addClauses(this.filterRestriction, false, true);
		}
		this.abRepmLsadminCommLogByDateLogGrid.refresh(restriction);
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.getFilterRestriction();
		this.abRepmLsadminCommLogByDateGrid.refresh(this.filterRestriction);
		this.abRepmLsadminCommLogByDateLogGrid.show(false);
	},
	
	abRepmLsadminCommLogByDateGrid_onReport: function(){
		var restriction = null;
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction = {"abRepmLsadminCommLogByDatePgrpDs": this.filterRestriction,
						   "abRepmLsadminCommLogByDatePgrpLogDs": this.filterRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-lsadmin-comm-log-by-date-pgrp.axvw", restriction, parameters);
	}
});