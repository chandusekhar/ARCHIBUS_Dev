var abRepmLsadminCommLogByProjectCtrl = View.createController('abRepmLsadminCommLogByProjectCtrl', {
	filterRestriction: null,
	sqlFilterRestriction: '1=1',
	
	afterInitialDataFetch: function(){
		if(View.taskInfo.processId == "Reports"){
			this.view.setTitle(getMessage("viewTitleReport"));
			var restriction = "EXISTS(SELECT 1 FROM ls_comm, activity_log WHERE ls_comm.ls_id is not null " +
				"AND ls_comm.project_id is not null " +
				"AND ls_comm.activity_log_id is not null " +
				"AND ls_comm.project_id=project.project_id " +
				"AND ls_comm.activity_log_id=activity_log.activity_log_id)";
			this.abRepmLsadminCommLogByProjectGrid.addParameter('notNullProjAct', restriction);
			this.abRepmLsadminCommLogByProjectGrid.refresh();
			
			restriction = "EXISTS(SELECT 1 FROM ls_comm WHERE ls_comm.ls_id is not null " +
				"AND ls_comm.project_id is not null " +
				"AND ls_comm.activity_log_id is not null " +
				"AND ls_comm.activity_log_id=activity_log.activity_log_id)";
			this.abRepmLsadminCommLogByProjectActGrid.addParameter('notNullActivities', restriction);
		}
	},
	
	abRepmLsadminCommLogConsole_filter_onShow: function(){
		this.sqlFilterRestriction = abRepmLsadminCommLogConsoleCtrl.getSqlFilterRestriction('ls_comm.project_id = project.project_id AND ls_comm.project_id is not null AND ls_comm.activity_log_id is not null');
		this.filterRestriction = abRepmLsadminCommLogConsoleCtrl.restriction;
		this.abRepmLsadminCommLogByProjectGrid.addParameter('filterRestriction', this.sqlFilterRestriction);
		this.abRepmLsadminCommLogByProjectGrid.refresh();
		this.abRepmLsadminCommLogByProjectActGrid.show(false);
		this.abRepmLsadminCommLogByProjectLogGrid.show(false);
	},
	
	showActivityLogGrid: function(){
		var record = this.abRepmLsadminCommLogByProjectGrid.rows[this.abRepmLsadminCommLogByProjectGrid.selectedRowIndex];
		var project_id = record["project.project_id"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(project_id)){
			restriction.addClause("activity_log.project_id", project_id, "=");
		}
		this.sqlFilterRestriction = abRepmLsadminCommLogConsoleCtrl.getSqlFilterRestriction('ls_comm.activity_log_id = activity_log.activity_log_id AND ls_comm.activity_log_id is not null');
		this.abRepmLsadminCommLogByProjectActGrid.addParameter('filterRestriction', this.sqlFilterRestriction);
		this.abRepmLsadminCommLogByProjectActGrid.refresh(restriction);
		this.abRepmLsadminCommLogByProjectLogGrid.show(false);
	},
	
	showCommLogGrid: function(){
		var record = this.abRepmLsadminCommLogByProjectActGrid.rows[this.abRepmLsadminCommLogByProjectActGrid.selectedRowIndex];
		var activity_log_id = record["activity_log.activity_log_id"];
		var restriction = new Ab.view.Restriction();
		if(valueExistsNotEmpty(activity_log_id)){
			restriction.addClause("ls_comm.activity_log_id", activity_log_id, "=");
		}
		var project_id = record["activity_log.project_id"];
		if(valueExistsNotEmpty(project_id)){
			restriction.addClause("ls_comm.project_id", project_id, "=");
		}
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction.addClauses(this.filterRestriction, false, true);
		}
		this.abRepmLsadminCommLogByProjectLogGrid.refresh(restriction);
	},
	
	abRepmLsadminCommLogByProjectGrid_onReport: function(){
		var restriction = null;
		if(valueExistsNotEmpty(this.filterRestriction)){
			restriction = {"abRepmLsadminCommLogByProjectPgrpDs": this.filterRestriction,
							"abRepmLsadminCommLogByProjectPgrpActGrid": this.filterRestriction,
						   "abRepmLsadminCommLogByProjectPgrpLogDs": this.filterRestriction};
		}
		var parameters = {
	        'printRestriction': true
	    };
	    
	    View.openPaginatedReportDialog("ab-repm-lsadmin-comm-log-by-project-pgrp.axvw", restriction, parameters);
	},
	
	abRepmLsadminCommLogByProjectLogGrid_onDelete: function(row){
        var dataSource = this.abRepmLsadminCommLogByProjectLogDs;
        var record = new Ab.data.Record({
       	   'ls_comm.auto_number': row.getFieldValue('ls_comm.auto_number')
       	});
        var reportPanel = this.abRepmLsadminCommLogByProjectLogGrid;
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