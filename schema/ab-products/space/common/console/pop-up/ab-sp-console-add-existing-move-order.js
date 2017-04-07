var addExistingMoveOrderController = View.createController('addExistingMoveOrderController', {
	/**
	 * The current employee pending assignment.
	 */
	employeePendingAssignment: null,
	
	/**
	 * The callback for closing the dialog.
	 */
	onClose: null,
	
	addEmployeeAssignmentsToExistingMp: function() {
		var selectedMp = this.getCurrentSelectedMoveProject();
		var assignments = this.createGroupMoveOrderPendingAssignments();
		var duplicatedEmployees = [];
		for (var i = 0; i < assignments.length; i++) {
			var assignment = assignments[i];
			var em_id = assignment['em_id'];
			
			var restriction = new Ab.view.Restriction();
			restriction.addClause('mo.project_id', selectedMp['project_id'], '=');
			restriction.addClause('mo.em_id', em_id, '=');
			var records = this.checkDuplicateMoveOrderDs.getRecords(restriction);
			if (records.length > 0) {
				duplicatedEmployees.push(em_id);
			}
		}
		
		if (duplicatedEmployees.length > 0) {
			var thisController = this;
			var employees = duplicatedEmployees[0];
			for (var j = 1; j < duplicatedEmployees; j++) {
				employees = employees + ',' + duplicatedEmployees[j];
			}
			View.confirm(getMessage('theEmployee') + ' ' + employees + ' ' + getMessage('employeeAlreadyInMoveOrder'), function(button) {
				if(button == 'yes') {
					thisController.commitPendingAssignmentToMoveProject(selectedMp, assignments);
				}
			});
		} else {
			this.commitPendingAssignmentToMoveProject(selectedMp, assignments);
		}
	},
	
	/**
	 * Commit the move project to WFR to generate move orders. 
	 */
	commitPendingAssignmentToMoveProject: function(moveProject, pendingAssignments) {
		try {
			Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-insertMoProjectRecordsFromPendingAssignments", moveProject, pendingAssignments);
		}catch(e) {
			Workflow.handleError(e);
		}
		this.employeePendingAssignment = null;
		if(this.onClose) {
			this.onClose(this);
		}
	},
	
	/**
	 * The move order the user selects.
	 */
	getCurrentSelectedMoveProject: function() {
		var mpGrid = this.existingMoveProjectGrid;
	    var row = mpGrid.rows[mpGrid.selectedRowIndex];
	    var moveProject = {};
	    moveProject['project_id'] = row['project.project_id'];
	    moveProject['description'] = row['project.description'];
	    moveProject['bl_id'] = row['project.bl_id'];
	    moveProject['dept_contact'] = row['project.dept_contact'];
	    moveProject['requestor'] = View.user.employee.id;
	    moveProject['date_start'] = getIsoFormatDate(new Date(row['project.date_start']));
	    moveProject['date_end'] = getIsoFormatDate(new Date(row['project.date_end']));
	    moveProject['contact_id'] = row['project.contact_id'];
	    moveProject['project_type'] = row['project.project_type'];
	    return moveProject;
	},
	
	/**
	 * Create pending assignments for group move orders.
	 */
	createGroupMoveOrderPendingAssignments: function() {
		var assignments = [];

		if ( this.employeePendingAssignment.models )	{
			for ( var i=0; i < this.employeePendingAssignment.models.length; i++ ) {
				var assignment = this.employeePendingAssignment.models[i];
				//construct pending assignment object
				var record = {};
				
				record['from_bl_id'] = assignment.attributes.bl_id;
				record['from_fl_id'] = assignment.attributes.fl_id;
				record['from_rm_id'] = assignment.attributes.rm_id;
				record['to_bl_id'] = assignment.attributes.to_bl_id;
				record['to_fl_id'] = assignment.attributes.to_fl_id;
				record['to_rm_id'] = assignment.attributes.to_rm_id;
				record['em_id'] = assignment.attributes.em_id;
				
				assignments.push(record);
			}
		}
		else {
			for ( var i=0; i < this.employeePendingAssignment.length; i++ ) {
				var assignment = this.employeePendingAssignment[i];
				var record = {};				
				record['from_bl_id'] = assignment['bl_id'];
				record['from_fl_id'] = assignment['fl_id'];
				record['from_rm_id'] = assignment['rm_id'];
				record['to_bl_id'] = assignment['to_bl_id'];
				record['to_fl_id'] = assignment['to_fl_id'];
				record['to_rm_id'] = assignment['to_rm_id'];
				record['em_id'] = assignment['em_id'];
				
				assignments.push(record);
			}
		}
    	return assignments;
	}
});