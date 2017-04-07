var abSysUserRoleRoleTabController = View.createController('abSysUserRoleRoleTabController', {
	
	// selected role name
	selectedRoleName: null,
	
	selectedActivities: new Array(),

	/**
	 * show details for selected role
	 */
	showDetailsForRole: function(roleName){
		if (valueExists(roleName)) {
			this.selectedRoleName = roleName;
			this.showAssignedProcesses();
			this.showAvailableProcesses();
		}
	},
	/**
	 * show assigned processes
	 */
	showAssignedProcesses: function(){
		var title = String.format(getMessage('titleAssignedProcesses'), this.selectedRoleName);
		this.abSysUserRoleProcAssignedProc_grid.addParameter("result_type", "assigned");
		this.abSysUserRoleProcAssignedProc_grid.addParameter("role_name", this.selectedRoleName);
		var restriction = new Ab.view.Restriction();
		if (this.selectedActivities.length > 0) {
			restriction.addClause('afm_processes.activity_id', this.selectedActivities, 'IN');
		}
		
		this.abSysUserRoleProcAssignedProc_grid.refresh(restriction);
		this.abSysUserRoleProcAssignedProc_grid.setTitle(title);
	},
	
	/**
	 * show available processes
	 */
	showAvailableProcesses: function(){
		var title = String.format(getMessage('titleAvailableProcesses'), this.selectedRoleName);
		this.abSysUserRoleProcAvailableProc_grid.addParameter("result_type", "available");
		this.abSysUserRoleProcAvailableProc_grid.addParameter("role_name", this.selectedRoleName);
		var restriction = new Ab.view.Restriction();
		if (this.selectedActivities.length > 0) {
			restriction.addClause('afm_processes.activity_id', this.selectedActivities, 'IN');
		}
		this.abSysUserRoleProcAvailableProc_grid.refresh(restriction);
		this.abSysUserRoleProcAvailableProc_grid.setTitle(title);
	},
	
	/**
	 * unassign unlicensed processes
	 */
	abSysUserRoleProcRoles_grid_onUnassignUnlicensed: function(){
		var controller = this;
		var confirmMessage = getMessage("ConfirmUnassignUnlicensed");
        View.confirm(confirmMessage, function(button) {
            if (button == 'yes') {
        		try {
            		var result = Workflow.call('AbSystemAdministration-unassignUnlicensed', {'from': 'roles'});
            		var message = String.format(getMessage('unassignUnlicensedSuccessful'));
            		View.showMessage('message', message + '\n' + result.message);
            		if (valueExistsNotEmpty(controller.selectedRoleName)) {
            			// data is displayed - refresh
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
    		var confirmMessage = String.format(getMessage("ConfirmUnassign"), this.selectedRoleName);
    		View.confirm(confirmMessage, function(button){
    			if(button == 'yes'){
        			controller.removeProcesses(controller.selectedRoleName, gridRows);
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

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
        		try {
            		Workflow.call('AbSystemAdministration-deleteAllProcessesAssignedToRole', {'roleName': roleName});
        			// data is displayed - refresh
            		controller.showAssignedProcesses();
            		controller.showAvailableProcesses();
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
    		var confirmMessage = String.format(getMessage("ConfirmAssign"), this.selectedRoleName);
    		View.confirm(confirmMessage, function(button){
    			if (button == 'yes') {
        			controller.assignProcesses(controller.selectedRoleName, gridRows);
        			controller.showAssignedProcesses();
        			controller.showAvailableProcesses();
    			}
    		});
    	}
    },
    
    removeProcesses: function(roleName, gridRows){
    	var objDataSource = View.dataSources.get("abSysUserRoleAssignedProcess_ds");
    	for (var i = 0; i < gridRows.length; i++) {
    		var row = gridRows[i];
    		var activity_id = row.getFieldValue("afm_processes.activity_id");
    		var process_id =  row.getFieldValue("afm_processes.process_id");
    		
    		var record = new Ab.data.Record({
                'afm_roleprocs.role_name': roleName,
                'afm_roleprocs.activity_id': activity_id,
                'afm_roleprocs.process_id': process_id
    		}, false);
    		objDataSource.deleteRecord(record);
    	}
    },
    
    assignProcesses: function(roleName, gridRows){
    	var objDataSource = View.dataSources.get("abSysUserRoleAssignedProcess_ds");
    	for (var i = 0; i < gridRows.length; i++) {
    		var row = gridRows[i];
    		var activity_id = row.getFieldValue("afm_processes.activity_id");
    		var process_id =  row.getFieldValue("afm_processes.process_id");
    		
    		var record = new Ab.data.Record({
                'afm_roleprocs.role_name': roleName,
                'afm_roleprocs.activity_id': activity_id,
                'afm_roleprocs.process_id': process_id
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
    },
    
    abSysUserRoleProcRoles_grid_onAddMobileApp: function(){
    	if (!valueExistsNotEmpty(this.selectedRoleName)) {
    		View.showMessage(getMessage("ErrorNoRoleSelected"));
    		return false;
    	}
    	var selectedRoleName = this.selectedRoleName;
    	// open dialog 'ab-sys-role-add-mobile-app.axvw'
    	View.openDialog("ab-sys-role-add-mobile-app.axvw", null, false, {
    		width: 1024,
    		height: 600,
    		closeButton:true,
    		roleName: selectedRoleName
    	});
    	
    }
});


/**
 * On click role row event handler.
 * @param ctx context
 */
function onClickRole(ctx){
	var selectedRole = null;
	if (valueExists(ctx.restriction)) {
		selectedRole = ctx.restriction['afm_roles.role_name'];
	}
	var controller = View.controllers.get('abSysUserRoleRoleTabController');
	controller.showDetailsForRole(selectedRole);
}