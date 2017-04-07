/**
 * Controller for the User Process Assignment view.
 */
var userProcessAssignmentController = View.createController('userProcessAssignments', {

    // selected user name
    userName: '',
    
    //selected user's role
    userRole: '',

    /**
     * This function is called after the view is loaded and all panels are constructed,
     * but before initial data fetch.
     */
    afterViewLoad: function() {
    	  this.userProcs_userGrid.addActionListener('unassignUnlicensed', this.userProcs_userGrid_unassignUnlicensed_onClick, this);
    	  this.userProcs_userProcessGrid.addActionListener('templateToRole', this.userProcs_userProcessGrid_templateToRole_onClick, this);
    	  this.userProcs_userProcessGrid.addActionListener('deleteAll', this.userProcs_userProcessGrid_deleteAll_onClick, this);
    	  this.userProcs_activityTree.addActionListener('assignAll', this.userProcs_activityTree_assignAll_onClick, this);
    	
        // enable dragging activity and process nodes from the activity tree
        this.userProcs_activityTree.enableDragForLevel(0, true);
        this.userProcs_activityTree.enableDragForLevel(1, true);
        
        this.userProcs_activityTree.setInstructions(getMessage('helpMessage'));
    },
    
    /**
     * This function called after the view is loaded and the initial data fetch is complete.
     * Selects the first user. 
     */
    afterInitialDataFetch: function() {
        this.userProcs_userGrid.selectRow(0);
        this.userProcs_userGrid_onUserName(this.userProcs_userGrid.gridRows.get(0));
    },
    
    // ----------------------- auto-wired event listeners -----------------------------------------

    /**
     * Handles User grid click event.
     * Displays the user name as a grid panel title.
     * Displays process assignments for the selected user in the grid.
     * Displays available processes for the selected user in the tree.
     */    
    userProcs_userGrid_onUserName: function(row, action) {
        var record = row.getRecord();
        this.userName = record.getValue('afm_users.user_name');
        this.userRole = record.getValue('afm_users.role_name');

        this.userProcs_userProcessGrid.appendTitle(this.userName);
        var restriction = new Ab.view.Restriction();
        restriction.addClause('afm_users.user_name', this.userName);
        this.userProcs_userProcessGrid.refresh(restriction);
        
        this.userProcs_activityTree.appendTitle(this.userName);
        this.userProcs_activityTree.addParameter('user_name', this.userName);
        this.userProcs_activityTree.refresh();
    },
    
    /**
     * Handlers User Process grid Remove button click event.
     */
    userProcs_userProcessGrid_remove_onClick: function(row, action) {
        var controller = this;
        var activityId = row.record['afm_userprocs.activity_id'];
        var processId = row.record['afm_userprocs.process_id'];
        var message = String.format(getMessage('ConfirmRemoveProcess'), processId, this.userName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                try {
                    controller.removeProcessAssignment(activityId, processId);
                    controller.userProcs_userProcessGrid.refresh();
                    controller.userProcs_activityTree.refresh();
                } catch (e) {
                    var message = String.format(
                        getMessage('ErrorRemoveProcess'), processId, controller.userName);
                    View.showMessage('error', message, e.message, e.data);
                }
            } 
        });
    },

    /**
     * Handles drag over event over User Process grid. 
     * @return true if the drop is allowed.
     */
    userProcs_userProcessGrid_onDragOver: function(dragSource, data) {
        return (valueExistsNotEmpty(this.userName));  
    },
    
    /**
     * Handles drag drop event over User Process grid.
     */
    userProcs_userProcessGrid_onDragDrop: function(dragSource, data) {
        if (!valueExistsNotEmpty(this.userName)) {
            return false;
        }
        
        var controller = this;
        var treeNode = data;
        var values = treeNode.getPrimaryKeyValues();
        var processId = values['afm_processes.process_id'];
        
        // check whether the user dropped activity or process
        if (valueExists(processId)) {
            // assign single process
            var activityId = values['afm_processes.activity_id'];
            
            // ask user to confirm
            var message = String.format(getMessage('ConfirmAddProcess'), processId, this.userName);
            View.confirm(message, function(button) {
                if (button == 'yes') {
                    try {
                        controller.addProcessAssignment(activityId, processId);
                        controller.userProcs_userProcessGrid.refresh();
                        controller.userProcs_activityTree.refresh();
                    } catch (e) {
                        var message = String.format(
                            getMessage('ErrorAddProcess'), processId, controller.userName);
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
	            restriction.addClause('afm_userprocs.activity_id',activityId,'=');
	            var records = this.userProcs_processDs.getRecords(restriction, {user_name:controller.userName});
	           
	           	for(var i = 0; i < records.length; i++){
	           		processIds.push(records[i].values['afm_processes.process_id']);
	           	}
           	}            
            // ask user to confirm
            var message = String.format(getMessage('ConfirmAddActivity'), activityId, this.userName);
            View.confirm(message, function(button) {
                if (button == 'yes') {
                    try {
                        controller.addActivityProcessAssignments(activityId, processIds);
                        controller.userProcs_userProcessGrid.refresh();
                        controller.userProcs_activityTree.refresh();
                    } catch (e) {
                        var message = String.format(
                            getMessage('ErrorAddProcess'), processId, controller.userName);
                        View.showMessage('error', message, e.message, e.data);
                    }
                } 
            });
        }
    },
 
      /**
     * Handles userProcs_userGrid unassignUnlicensed button click event.
     */
    userProcs_userGrid_unassignUnlicensed_onClick: function() {
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
     * Handles userProcs_activityTree assignAll button click event.
     */
    userProcs_activityTree_assignAll_onClick: function() {
        var controller = this;
        var message = String.format(getMessage('ConfirmAssignAll'), this.userName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.addAllActivityProcessAssignments();
                controller.userProcs_userProcessGrid.refresh();
                controller.userProcs_activityTree.refresh();
            } 
        });
    },
        
     /**
     * Handles userProcs_userProcessGrid deleteAll button click event.
     */
    userProcs_userProcessGrid_deleteAll_onClick: function() {
        var controller = this;
        var message = String.format(getMessage('ConfirmDeleteAll'), this.userName);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.deleteAll();
                controller.userProcs_userProcessGrid.refresh();
                controller.userProcs_activityTree.refresh();
            } 
        });
    },
    
     /**
     * Handles userProcs_userProcessGrid templateToRole button click event.
     */
    userProcs_userProcessGrid_templateToRole_onClick: function() {
        var controller = this;
        var message = String.format(getMessage('ConfirmTemplateToRole'), this.userRole);

        // ask user to confirm
        View.confirm(message, function(button) {
            if (button == 'yes') {
                controller.copyTemplateToRole();
            } 
        });
    },
    
    // ----------------------- business logic methods: no UI code beyond this point ---------------
    
    /**
     * Removes specified process assignment.
     */
    removeProcessAssignment: function(activityId, processId) {
        var record = this.createUserProcessRecord(activityId, processId);
        this.userProcs_userProcessDs.deleteRecord(record);
    },
    
    /**
     * Adds new process assignment.
     */
    addProcessAssignment: function(activityId, processId) {
        var record = this.createUserProcessRecord(activityId, processId);
        this.userProcs_userProcessDs.saveRecord(record);
    },
    
    /**
     * Adds all process assignments for specified activity, except those already assigned.
     */
    addActivityProcessAssignments: function(activityId, processIds) {
        for (var i = 0; i < processIds.length; i++) {
            var record = this.createUserProcessRecord(activityId, processIds[i]);
            this.userProcs_userProcessDs.saveRecord(record);
        }
    },
    
     /**
     * Unassign unlicensed
     */
    unassignUnlicensed: function() {
				try {
    			var result = Workflow.call('AbSystemAdministration-unassignUnlicensed', {'from': 'users'});
    			var message = String.format(getMessage('unassignUnlicensedSuccessful'));
    			View.showMessage('message', message + '\n' + result.message);
    			this.userProcs_userProcessGrid.refresh();
				} catch (e) {
    			Workflow.handleError(e);
				} 
    },
    
     /**
     * Adds all process assignments for all activities.
     */
    addAllActivityProcessAssignments: function() {
				try {
    			Workflow.call('AbSystemAdministration-assignAllActivitiesToUser', {'userName': this.userName});
				} catch (e) {
    			Workflow.handleError(e);
				} 
    },
    
     /**
     * Delete all process assignments for selected user
     */
    deleteAll: function() {
				try {
    			Workflow.call('AbSystemAdministration-deleteAllProcessesAssignedToUser', {'userName': this.userName});
				} catch (e) {
    			Workflow.handleError(e);
				} 
    },
    
     /**
     * Copy all process assignments for selected user to all users of the same role.
     */
    copyTemplateToRole: function() {
				try {
    			Workflow.call('AbSystemAdministration-copyTemplateToRole', {'userName': this.userName, 'userRole': this.userRole});
    			var message = String.format(getMessage('CopyTemplateSuccessful'), this.userRole);
          View.showMessage('message', message);
				} catch (e) {
    			Workflow.handleError(e);
				} 
    },
    
    /**
     * Helper function: returns WFR parameters with data record for specified activity and process.
     */
    createUserProcessRecord: function(activityId, processId) {
        return new Ab.data.Record({
            'afm_userprocs.user_name': this.userName,
            'afm_userprocs.activity_id': activityId,
            'afm_userprocs.process_id': processId
        }, true);
    }
});
