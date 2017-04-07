var abRepmLsadminCommLogByLeaseCtrl = View.createController('abRepmLsadminCommLogByLeaseCtrl', {
	filterRestriction: null,
	sqlFilterRestriction: '1=1',
	
	afterInitialDataFetch: function(){
		if(View.taskInfo.processId == "Reports"){
			this.view.setTitle(getMessage("viewTitleReport"));
			var restriction = "EXISTS(SELECT 1 FROM ls_comm WHERE ls_comm.ls_id is not null AND ls_comm.ls_id=ls.ls_id)";
			this.abRepmLsadminCommLogByLeaseGrid.addParameter('notNullLeases', restriction);
			this.abRepmLsadminCommLogByLeaseGrid.refresh();
		}
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.sqlFilterRestriction = abRepmLsadminCommLogConsoleCtrl.getSqlFilterRestriction('ls_comm.ls_id = ls.ls_id');
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.restriction;
		this.abRepmLsadminCommLogByLeaseGrid.addParameter('filterRestriction', this.sqlFilterRestriction);
		this.abRepmLsadminCommLogByLeaseGrid.refresh();
		this.abRepmLsadminCommLogByLeaseLogGrid.show(false);
	},
	
	showCommLogGrid: function(){
		var record = this.abRepmLsadminCommLogByLeaseGrid.rows[this.abRepmLsadminCommLogByLeaseGrid.selectedRowIndex];
		var ls_id = record["ls.ls_id"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(ls_id)){
			restriction.addClause("ls_comm.ls_id", ls_id, "=");
		}
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction.addClauses(this.filterRestriction, false, true);
		}
		this.abRepmLsadminCommLogByLeaseLogGrid.refresh(restriction);
	},
	
	abRepmLsadminCommLogByLeaseGrid_onReport: function(){
		var restriction = null;
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction = {"abRepmLsadminCommLogByLeasePgrpDs": this.filterRestriction,
						   "abRepmLsadminCommLogByLeasePgrpLogDs": this.filterRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-lsadmin-comm-log-by-lease-pgrp.axvw", restriction, parameters);
	},
	 
	abRepmLsadminCommLogByLeaseLogGrid_onDelete: function(row){
        var dataSource = this.abRepmLsadminCommLogByLeaseLogDs;
        var record = new Ab.data.Record({
        	   'ls_comm.auto_number': row.getFieldValue('ls_comm.auto_number')
        	});
        var reportPanel = this.abRepmLsadminCommLogByLeaseLogGrid;
        var confirmMessage = getMessage('message_confirmdelete').replace("{0}",row.getFieldValue('ls_comm.comm_id'));
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                    reportPanel.refresh(reportPanel.restriction);
                } 
                catch (e) {
                    var message = String.format(getMessage('error_delete'));
                    View.showMessage('error', message, e.message, e.data);
                }
                
            }
        });
    }
});