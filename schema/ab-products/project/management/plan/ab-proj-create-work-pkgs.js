var projCreateWorkPkgsController = View.createController('projCreateWorkPkgs', {
	project_id : '',
	work_pkg_id : '',
	
	afterInitialDataFetch : function() {
		clearConsole();
	},
	
	projCreateWorkPkgsEditWorkPkgForm_beforeSave : function() {
		var form = View.panels.get('projCreateWorkPkgsEditWorkPkgForm'); 
		var curDate = new Date();
		var date_start = getDateObject(this.projCreateWorkPkgsEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));//note that getFieldValue returns date in ISO format
		var date_end = getDateObject(this.projCreateWorkPkgsEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
		if (date_end < date_start) {
			this.projCreateWorkPkgsEditWorkPkgForm.addInvalidField('work_pkgs.date_est_end', getMessage('endBeforeStart'));
			return false;
		}
		if ((curDate - date_start)/(1000*60*60*24) >= 1){
	    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
		}
		this.projCreateWorkPkgsEditWorkPkgForm.setFieldValue('work_pkgs.date_act_start', this.projCreateWorkPkgsEditWorkPkgForm.getFieldValue('work_pkgs.date_est_start'));
		this.projCreateWorkPkgsEditWorkPkgForm.setFieldValue('work_pkgs.date_act_end', this.projCreateWorkPkgsEditWorkPkgForm.getFieldValue('work_pkgs.date_est_end'));
	    return true;
	},
	
	selectWorkPkgReport_onSelectWorkPkgId : function(row) {
		this.project_id = row.record['work_pkgs.project_id.key'];
		this.work_pkg_id = row.record['work_pkgs.work_pkg_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		this.projCreateWorkPkgsActionsGrid.refresh(restriction);
		this.projCreateWorkPkgsActionsGrid.show(true);
		this.projCreateWorkPkgsActionsGrid.appendTitle(this.work_pkg_id);
		
		this.projCreateWorkPkgsWorkPkgColumnReport.refresh(restriction);
		this.projCreateWorkPkgsWorkPkgColumnReport.show(true);
	},
		
	projCreateWorkPkgsEditWorkPkgForm_onSave : function() {
		if (!this.projCreateWorkPkgsEditWorkPkgForm.save()) return;
		
		var record = this.projCreateWorkPkgsEditWorkPkgForm.getRecord();
		this.project_id = record.getValue('work_pkgs.project_id');
		this.work_pkg_id = record.getValue('work_pkgs.work_pkg_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('work_pkgs.project_id', this.project_id);
		restriction.addClause('work_pkgs.work_pkg_id', this.work_pkg_id);
		
		this.selectWorkPkgReport.refresh();
		this.projCreateWorkPkgsWorkPkgColumnReport.refresh(restriction);
		this.projCreateWorkPkgsWorkPkgColumnReport.show(true);		
		this.projCreateWorkPkgsActionsGrid.refresh(restriction);
		this.projCreateWorkPkgsActionsGrid.show(true);
		this.projCreateWorkPkgsActionsGrid.appendTitle(this.work_pkg_id);
		
		this.projCreateWorkPkgsEditWorkPkgForm.closeWindow();
	},
	
	projCreateWorkPkgsActionsGrid_onAssignActions : function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		this.projCreateWorkPkgsCopyActionsGrid.refresh(restriction);
		this.projCreateWorkPkgsCopyActionsGrid.showInWindow({
			width: 800,
			height: 400
		});
	},
	
	projCreateWorkPkgsActionsGrid_onAddNew : function() {
		this.projCreateWorkPkgsActionForm.refresh(this.projCreateWorkPkgsActionsGrid.restriction, true);
		this.projCreateWorkPkgsActionForm.showInWindow({
			newRecord: true,
			width: 800,
			height: 400,
			closeButton: true
		});
	},
	
	projCreateWorkPkgsCopyActionsGrid_onAssignSelectedRecords : function() {
		var selectedRows = this.projCreateWorkPkgsCopyActionsGrid.getPrimaryKeysForSelectedRows();
		for (var i = 0; i < selectedRows.length; i++) {
			var row = selectedRows[i];
		    var record = this.projCreateWorkPkgsDs2.getRecord(row);
		    record.setValue('activity_log.work_pkg_id', this.work_pkg_id);
		    this.projCreateWorkPkgsDs2.saveRecord(record);
		}		
		this.projCreateWorkPkgsActionsGrid.refresh();
		this.projCreateWorkPkgsActionsGrid.show(true);
	},
	
	selectWorkPkgReport_onDeleteSelected: function() {
		var records = this.selectWorkPkgReport.getPrimaryKeysForSelectedRows();
		if (records.length == 0){
			View.showMessage(getMessage('noSelection'));
			return;
		}
		var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
				var parameters = {
					'records': toJSON(records),
					'tableName': 'work_pkgs',
			        'fieldNames': toJSON(['work_pkgs.work_pkg_id'])
				};
				var result = null;
				try {
					result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters); 
					controller.selectWorkPkgReport.refresh();
					controller.projCreateWorkPkgsWorkPkgColumnReport.show(false);
					controller.projCreateWorkPkgsActionsGrid.show(false);
				}
				catch (e) {
					Workflow.handleError(result);
	            }
			}
        });
	},
	
	projCreateWorkPkgsActionsGrid_onDeleteSelected: function(){
		var records = this.projCreateWorkPkgsActionsGrid.getPrimaryKeysForSelectedRows();
		if (records.length == 0){
			View.showMessage(getMessage('noSelection'));
			return;
		}
		var controller = this;
        View.confirm(getMessage('confirmDelete'), function(button){
            if (button == 'yes') {
				var parameters = {
					'records': toJSON(records),
					'tableName': 'activity_log',
			        'fieldNames': toJSON(['activity_log.activity_log_id'])
				};
				var result = null;
				try {
					result = Workflow.runRuleAndReturnResult('AbCommonResources-deleteDataRecords', parameters); 
					controller.projCreateWorkPkgsActionsGrid.refresh();
				}
				catch (e) {
					Workflow.handleError(result);
	            }
			}
        });
	},
	
	projCreateWorkPkgsActionForm_beforeSave : function() {
		var curDate = new Date();
		var date_required = getDateObject(this.projCreateWorkPkgsActionForm.getFieldValue('activity_log.date_required'));//note that getFieldValue returns date in ISO format
		var date_scheduled = getDateObject(this.projCreateWorkPkgsActionForm.getFieldValue('activity_log.date_scheduled'));
		if ((curDate - date_required)/(1000*60*60*24) >= 1 || (curDate - date_scheduled)/(1000*60*60*24) >= 1){
	    	if (!confirm(getMessage('dateBeforeCurrent'))) return false;
		}
	    return true;
	}
});

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

/****************************************************************
 * Work Package Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("");
}

function onWorkPkgIdSelval() {
	workPkgIdSelval("work_pkgs.status='Created'");
}
												