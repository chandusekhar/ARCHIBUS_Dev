/**
 * Controller implementation.
 */
var abRepmLsadminCommLogByContactCtrl = View.createController('abRepmLsadminCommLogByContactCtrl', {
	filterRestriction: null, 
	
	showCommLogGrid: function(){
		var record = this.abRepmLsadminCommLogByContactGrid.rows[this.abRepmLsadminCommLogByContactGrid.selectedRowIndex];
		var contactId = record["contact.contact_id"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(contactId)){
			restriction.addClause("ls_comm.contact_id", contactId, "=");
		}
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction.addClauses(this.filterRestriction, false, true);
		}
		this.abRepmLsadminCommLogByContactLogGrid.refresh(restriction);
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.getFilterRestriction();
		this.abRepmLsadminCommLogByContactGrid.refresh(this.filterRestriction);
		this.abRepmLsadminCommLogByContactLogGrid.show(false);
	},
	
	abRepmLsadminCommLogByContactGrid_onReport: function(){
		var restriction = null;
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction = {"abRepmLsadminCommLogByContactPgrpDs": this.filterRestriction,
						   "abRepmLsadminCommLogByContactPgrpLogDs": this.filterRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-lsadmin-comm-log-by-contact-pgrp.axvw", restriction, parameters);
	}
});