/**
 * Controller for the Role Process Assignment view.
 */
var roleProcessAssignmentController = View.createController('roleProcessAssignments', {
    
    //selected role
    roleName: '',

    afterViewLoad: function() {

        // enable dragging activity and process nodes from the activity tree
        this.roleProcs_activityTree.enableDragForLevel(0, true);
        this.roleProcs_activityTree.enableDragForLevel(1, true);
        
        this.roleProcs_activityTree.setInstructions(getMessage('helpMessage'));
    },

    afterInitialDataFetch: function() {
        this.roleProcs_roleGrid.selectRow(0);
        this.roleProcs_roleGrid_onRoleName(this.roleProcs_roleGrid.gridRows.get(0));
    },
    
    // ----------------------- auto-wired event listeners -----------------------------------------

    /**
     * Handles role grid click event.
     * Displays the role name as a grid panel title.
     * Displays process assignments for the selected role in the grid.
     * Displays available processes for the selected role in the tree.
     */    
    roleProcs_roleGrid_onRoleName: function(row, action) {
        var record = row.getRecord();
        this.roleName = record.getValue('afm_roles.role_name');

        this.roleProcs_roleProcessGrid.appendTitle(this.roleName);
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_roles.role_name', this.roleName);
        this.roleProcs_roleProcessGrid.recordLimit = 1000;
        this.roleProcs_roleProcessGrid.refresh(restriction);

        this.roleProcs_activityTree.appendTitle(this.roleName);
        this.roleProcs_activityTree.addParameter('role_name', this.roleName);
        this.roleProcs_activityTree.refresh();
    },
    
    /**
     * Handlers role Process grid Remove button click event.
     */
    roleProcs_roleProcessGrid_onRemove: function(row, action) {
        var controller = this;
        var activityId = row.record['afm_roleprocs.activity_id'];
        var processId = row.record['afm_roleprocs.process_id'];
        var message = String.format(getMessage('ConfirmRemoveProcess'), processId, this.roleName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    controller.removeProcessAssignment(activityId, processId);
                    controller.roleProcs_roleProcessGrid.refresh();
                    controller.roleProcs_activityTree.refresh();
                } catch (e) {
                    var message = String.format(
                        getMessage('ErrorRemoveProcess'), processId, controller.roleName);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },

    /**
     * Handles drag over event over Role Process grid. 
     * @return true if the drop is allowed.
     */
    roleProcs_roleProcessGrid_onDragOver: function(dragSource, data) {
        return (valueExistsNotEmpty(this.roleName));  
    },
    
    /**
     * Handles drag drop event over Role Process grid.
     */
    roleProcs_roleProcessGrid_onDragDrop: function(dragSource, data) {
        if (!valueExistsNotEmpty(this.roleName)) {
            return false;
        }
        
        var controller = this;
        var treeNode = data;
        var values = treeNode.getPrimaryKeyValues();
        var processId = values['afm_processes.process_id'];
        
        // check whether the role dropped activity or process
        if (valueExists(processId)) {
            // assign single process
            var activityId = values['afm_processes.activity_id'];
            
            // ask user to confirm
            var message = String.format(getMessage('ConfirmAddProcess'), processId, this.roleName);
            View.confirm(message, function(button) {
                if (button == 'yes') {
                    try {
                        controller.addProcessAssignment(activityId, processId);
                        controller.roleProcs_roleProcessGrid.refresh();
                        controller.roleProcs_activityTree.refresh();
                    } catch (e) {
                        var message = String.format(
                            getMessage('ErrorAddProcess'), processId, controller.roleName);
                        View.showMessage('error', message, e.message, e.data);
                    }
                } 
            });
        } else {
            // assign all unassigned processes for selected activity
            var activityId = values['afm_activities.activity_id'];
 			var processTreeNodes = treeNode.children;
            var processIds = [];
            
            if(processTreeNodes.length != 0){
            	//XXX: tree expanded - use tree nodes
	            for (var i = 0; i < processTreeNodes.length; i++) {
	                processIds.push(processTreeNodes[i].data['afm_processes.process_id']);
	            }
            }else{
            	//XXX: tree not expanded - query records
	            var restriction = new Ab.view.Restriction();
	            restriction.addClause('afm_roleprocs.activity_id',activityId,'=');
	            var records = this.roleProcs_processDs.getRecords(restriction, {role_name:controller.roleName});
	           
	           	for(var i = 0; i < records.length; i++){
	           		processIds.push(records[i].values['afm_processes.process_id']);
	           	}
           	}            
            // ask user to confirm
            var message = String.format(getMessage('ConfirmAddActivity'), activityId, this.roleName);
            View.confirm(message, function(button) {
                if (button == 'yes') {
                    try {
                        controller.addActivityProcessAssignments(activityId, processIds);
                        controller.roleProcs_roleProcessGrid.refresh();
                        controller.roleProcs_activityTree.refresh();
                    } catch (e) {
                        var message = String.format(
                            getMessage('ErrorAddActivity'), activityId, controller.roleName);
                        View.showMessage('error', message, e.message, e.data);
                    }
                } 
            });
        }
    },
 
      /**
     * Handles roleProcs_roleGrid unassignUnlicensed button click event.
     */
    roleProcs_roleGrid_onUnassignUnlicensed: function() {
        var controller = this;
 
        var message = String.format(getMessage('ConfirmUnassignUnlicensed'));

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
            		controller.unassignUnlicensed();
            } 
        });
    },
       
     /**
     * Handles roleProcs_activityTree assignAll button click event.
     */
    roleProcs_activityTree_onAssignAll: function() {
        var controller = this;
        var message = String.format(getMessage('ConfirmAssignAll'), this.roleName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.addAllActivityProcessAssignments();
                controller.roleProcs_roleProcessGrid.refresh();
                controller.roleProcs_activityTree.refresh();
            } 
        });
    },
        
     /**
     * Handles roleProcs_roleProcessGrid deleteAll button click event.
     */
    roleProcs_roleProcessGrid_onDeleteAll: function() {
        var controller = this;
        var message = String.format(getMessage('ConfirmDeleteAll'), this.roleName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.deleteAll();
                controller.roleProcs_roleProcessGrid.refresh();
                controller.roleProcs_activityTree.refresh();
            } 
        });
    },
    
    // ----------------------- business logic methods: no UI code beyond this point ---------------
    
    /**
     * Removes specified process assignment.
     */
    removeProcessAssignment: function(activityId, processId) {
        var record = this.createRoleProcessRecord(activityId, processId);
        this.roleProcs_roleProcessDs.deleteRecord(record);
    },
    
    /**
     * Adds new process assignment.
     */
    addProcessAssignment: function(activityId, processId) {
        var record = this.createRoleProcessRecord(activityId, processId);
        this.roleProcs_roleProcessDs.saveRecord(record);
    },
    
    /**
     * Adds all process assignments for specified activity, except those already assigned.
     */
    addActivityProcessAssignments: function(activityId, processIds) {
        for (var i = 0; i < processIds.length; i++) {
            var record = this.createRoleProcessRecord(activityId, processIds[i]);
            this.roleProcs_roleProcessDs.saveRecord(record);
        }
    },
    
     /**
     * Unassign unlicensed
     */
    unassignUnlicensed: function() {
		try {
    		var result = Workflow.call('AbSystemAdministration-unassignUnlicensed', {'from': 'roles'});
    		var message = String.format(getMessage('unassignUnlicensedSuccessful'));
    		View.showMessage('message', message + '\n' + result.message);
    		this.roleProcs_roleProcessGrid.refresh();
		} catch (e) {
    		Workflow.handleError(e);
		} 
    },
    
     /**
     * Adds all process assignments for all activities.
     */
    addAllActivityProcessAssignments: function() {
		try {
    		Workflow.call('AbSystemAdministration-assignAllActivitiesToRole', {'roleName': this.roleName});
		} catch (e) {
    		Workflow.handleError(e);
		} 
    },
    
     /**
     * Delete all process assignments for selected role
     */
    deleteAll: function() {
		try {
    		Workflow.call('AbSystemAdministration-deleteAllProcessesAssignedToRole', {'roleName': this.roleName});
		} catch (e) {
    		Workflow.handleError(e);
		} 
    },
    
    /**
     * Helper function: returns WFR parameters with data record for specified activity and process.
     */
    createRoleProcessRecord: function(activityId, processId) {
        return new Ab.data.Record({
            'afm_roleprocs.role_name': this.roleName,
            'afm_roleprocs.activity_id': activityId,
            'afm_roleprocs.process_id': processId
        }, true);
    }
});
