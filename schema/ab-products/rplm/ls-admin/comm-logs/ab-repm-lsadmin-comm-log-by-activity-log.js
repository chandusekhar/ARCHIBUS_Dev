var abRepmLsadminCommLogByActivityLogCtrl = View.createController('abRepmLsadminCommLogByActivityLogCtrl', {
	filterRestriction: null,
	sqlFilterRestriction: '1=1',
	
	afterInitialDataFetch: function(){
		if(View.taskInfo.processId == "Reports"){
			this.view.setTitle(getMessage("viewTitleReport"));
			var restriction = "EXISTS(SELECT 1 FROM ls_comm WHERE ls_comm.ls_id is not null AND ls_comm.activity_log_id is not null AND ls_comm.activity_log_id=activity_log.activity_log_id)";
			this.abRepmLsadminCommLogByActivityLogGrid.addParameter('notNullActivities', restriction);
			this.abRepmLsadminCommLogByActivityLogGrid.refresh();
		}
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.sqlFilterRestriction = abRepmLsadminCommLogConsoleCtrl.getSqlFilterRestriction('ls_comm.activity_log_id = activity_log.activity_log_id AND ls_comm.activity_log_id is not null');
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.restriction;
		this.abRepmLsadminCommLogByActivityLogGrid.addParameter('filterRestriction', this.sqlFilterRestriction);
		this.abRepmLsadminCommLogByActivityLogGrid.refresh();
		this.abRepmLsadminCommLogByActivityLogLogGrid.show(false);
	},
	
	showCommLogGrid: function(){
		var record = this.abRepmLsadminCommLogByActivityLogGrid.rows[this.abRepmLsadminCommLogByActivityLogGrid.selectedRowIndex];
		var activity_log_id = record["activity_log.activity_log_id"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(activity_log_id)){
			restriction.addClause("ls_comm.activity_log_id", activity_log_id, "=");
		}
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction.addClauses(this.filterRestriction, false, true);
		}
		this.abRepmLsadminCommLogByActivityLogLogGrid.refresh(restriction);
	},
	
	abRepmLsadminCommLogByActivityLogGrid_onReport: function(){
		var restriction = null;
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction = {"abRepmLsadminCommLogByActivityLogPgrpDs": this.filterRestriction,
						   "abRepmLsadminCommLogByActivityLogPgrpLogDs": this.filterRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-lsadmin-comm-log-by-activty-log-pgrp.axvw", restriction, parameters);
	},
	
	abRepmLsadminCommLogByActivityLogLogGrid_onDelete: function(row){
        var dataSource = this.abRepmLsadminCommLogByActivityLogLogDs;
        var record = new Ab.data.Record({
      	   'ls_comm.auto_number': row.getFieldValue('ls_comm.auto_number')
      	});
        var reportPanel = this.abRepmLsadminCommLogByActivityLogLogGrid;
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