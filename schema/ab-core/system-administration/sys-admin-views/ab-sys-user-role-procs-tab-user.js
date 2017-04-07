var abSysUserRoleUserTabController = View.createController('abSysUserRoleUserTabController', {
	
	selectedUserName: null,
	selectedRoleName: null,
	selectedActivities: new Array(),
	
	showDetailsForUser: function(userName, roleName) {
		this.selectedUserName = userName;
		this.selectedRoleName = roleName;
		this.showAssignedProcesses();
		this.showAvailableProcesses();
		
	},
	
	showAssignedProcesses: function(){
		var title = String.format(getMessage('titleAssignedProcesses'), this.selectedUserName);
		this.abSysUserRoleProcAssignedProc_grid.addParameter("result_type", "assigned");
		this.abSysUserRoleProcAssignedProc_grid.addParameter("user_name", this.selectedUserName);
		this.abSysUserRoleProcAssignedProc_grid.addParameter("role_name", this.selectedRoleName);
		var restriction = new Ab.view.Restriction();
		if (this.selectedActivities.length > 0) {
			restriction.addClause('afm_processes.activity_id', this.selectedActivities, 'IN');
		}
		this.abSysUserRoleProcAssignedProc_grid.refresh(restriction);
		this.abSysUserRoleProcAssignedProc_grid.setTitle(title);
	},
	
	showAvailableProcesses: function(){
		var title = String.format(getMessage('titleAvailableProcesses'), this.selectedUserName);
		this.abSysUserRoleProcAvailableProc_grid.addParameter("result_type", "available");
		this.abSysUserRoleProcAvailableProc_grid.addParameter("user_name", this.selectedUserName);
		this.abSysUserRoleProcAvailableProc_grid.addParameter("role_name", this.selectedRoleName);
		var restriction = new Ab.view.Restriction();
		if (this.selectedActivities.length > 0) {
			restriction.addClause('afm_processes.activity_id', this.selectedActivities, 'IN');
		}
		this.abSysUserRoleProcAvailableProc_grid.refresh(restriction);
		this.abSysUserRoleProcAvailableProc_grid.setTitle(title);
	},
	
	abSysUserRoleProcsUser_grid_onUnassignUnlicensed: function(){
		var message = getMessage("ConfirmUnassignUnlicensed");
		var controller = this;
		View.confirm(message, function(button){
			if (button == 'yes') {
				try {
					var result = Workflow.call('AbSystemAdministration-unassignUnlicensed', {'from': 'users'});
	    			var message = String.format(getMessage('unassignUnlicensedSuccessful'));
	    			View.showMessage('message', message + '\n' + result.message);
	    			if (valueExistsNotEmpty(controller.selectedUserName)) {
		    			controller.showAssignedProcesses();
		    			controller.showAvailableProcesses();
	    			}
				} catch (e) {
	    			Workflow.handleError(e);
				} 
			}
		});
	}, 
	
    abSysUserRoleProcAssignedProc_grid_onUnassign: function(){
    	var objGrid = this.abSysUserRoleProcAssignedProc_grid;
    	var gridRows =  objGrid.getSelectedGridRows();
    	var controller = this;
    	if (gridRows.length == 0) {
    		View.showMessage(getMessage("ErrorNoProcessSelected"));
    		return false;
    	}else{
    		var confirmMessage = String.format(getMessage("ConfirmUnassign"), this.selectedUserName);
    		View.confirm(confirmMessage, function(button){
    			if (button == 'yes') {
        			controller.removeProcesses(controller.selectedUserName, gridRows);
        			controller.showAssignedProcesses();
        			controller.showAvailableProcesses();
    			}
    		});
    	}
    },
	
    /**
     * Remove all assigned processes from role.
     */
    abSysUserRoleProcAssignedProc_grid_onUnassignAll: function(){
        var controller = this;
        var message = String.format(getMessage('ConfirmDeleteAll'), this.selectedRoleName);
        var roleName = this.selectedRoleName;
        var userName =  this.selectedUserName;

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
        		try {
        			Workflow.call('AbSystemAdministration-deleteAllProcessesAssignedToUser', {'userName': userName});
        			// data is displayed - refresh
            		controller.showAssignedProcesses();
            		controller.showAvailableProcesses();
        		} catch (e) {
            		Workflow.handleError(e);
        		} 
            } 
        });
    },
    
    abSysUserRoleProcAssignedProc_grid_onApplyAsTemplate: function(){
        var controller = this;
        var message = String.format(getMessage('ConfirmTemplateToRole'), this.selectedRoleName);
        var roleName = this.selectedRoleName;
        var userName =  this.selectedUserName;

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
				try {
	    			Workflow.call('AbSystemAdministration-copyTemplateToRole', {'userName': userName, 'userRole': roleName});
	    			var message = String.format(getMessage('CopyTemplateSuccessful'), roleName);
	    			View.showMessage('message', message);
				} catch (e) {
	    			Workflow.handleError(e);
				} 
            } 
        });
    	
    },
    
    abSysUserRoleProcAvailableProc_grid_onAssign: function(){
    	var objGrid = this.abSysUserRoleProcAvailableProc_grid;
    	var gridRows =  objGrid.getSelectedGridRows();
    	var controller = this;
    	if (gridRows.length == 0) {
    		View.showMessage(getMessage("ErrorNoProcessSelected"));
    		return false;
    	}else{
    		var confirmMessage = String.format(getMessage("ConfirmAssign"), this.selectedUserName);
    		View.confirm(confirmMessage, function(button){
    			if (button == 'yes') {
        			controller.assignProcesses(controller.selectedUserName, gridRows);
        			controller.showAssignedProcesses();
        			controller.showAvailableProcesses();
    			}
    		});
    	}
    },
    
    removeProcesses: function(userName, gridRows){
    	var objDataSource = View.dataSources.get("abSysUserRoleAssignedProcess_ds");
    	for (var i = 0; i < gridRows.length; i++) {
    		var row = gridRows[i];
    		var activity_id = row.getFieldValue("afm_processes.activity_id");
    		var process_id =  row.getFieldValue("afm_processes.process_id");
    		
    		var record = new Ab.data.Record({
                'afm_userprocs.user_name': userName,
                'afm_userprocs.activity_id': activity_id,
                'afm_userprocs.process_id': process_id
    		}, false);
    		objDataSource.deleteRecord(record);
    	}
    },
    
    assignProcesses: function(userName, gridRows){
    	var objDataSource = View.dataSources.get("abSysUserRoleAssignedProcess_ds");
    	for (var i = 0; i < gridRows.length; i++) {
    		var row = gridRows[i];
    		var activity_id = row.getFieldValue("afm_processes.activity_id");
    		var process_id =  row.getFieldValue("afm_processes.process_id");
    		
    		var record = new Ab.data.Record({
                'afm_userprocs.user_name': userName,
                'afm_userprocs.activity_id': activity_id,
                'afm_userprocs.process_id': process_id
    		}, true);
    		objDataSource.saveRecord(record);
    	}
    },
    
    abSysUserRoleProcAssignedProc_grid_onFilter: function(){
    	var dialogConfig = {
    			width: 800,
    			height: 600,
    			closeButton: true
    	};
    	this.abDomainApp_list.refresh();
    	this.abDomainApp_list.showInWindow(dialogConfig);
    },
    
    abDomainApp_list_onFilter: function(){
    	var selectedRows =  this.abDomainApp_list.getSelectedGridRows();
    	this.selectedActivities = new Array();
    	for (var i = 0; i < selectedRows.length; i++) {
    		var activityId = selectedRows[i].getFieldValue("afm_actprods.activity_id");
    		this.selectedActivities.push(activityId);
    	}
    	
    	if (this.selectedActivities.length > 0 ) {
			this.showAssignedProcesses();
			this.showAvailableProcesses();
    	}
    	this.abDomainApp_list.closeWindow();
    },
    
    abDomainApp_list_onReset: function(){
    	this.selectedActivities = new Array();
		this.showAssignedProcesses();
		this.showAvailableProcesses();
    	this.abDomainApp_list.closeWindow();
    }
});

/**
 * On click user  row event handler.
 * @param ctx context
 */
function onClickUser(ctx){
	var selectedUserName = null;
	var selectedRoleName = null;
	if (valueExists(ctx.row)) {
		selectedUserName = ctx.row.getFieldValue('afm_users.user_name');
		
		selectedRoleName = ctx.row.getFieldValue('afm_users.role_name');
	}
	var controller = View.controllers.get('abSysUserRoleUserTabController');
	controller.showDetailsForUser(selectedUserName, selectedRoleName);
}

function getUserRole(userName){
	
	
	
}