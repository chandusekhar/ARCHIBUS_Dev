/**
 * Controller for creating group move orders.
 */
var createGroupMoveOrderController = View.createController("createGroupMoveOrderController", {
	/**
	 * The current employee pending assignment.
	 */
	employeePendingAssignment: null,
	
	/**
	 * The callback for closing the dialog.
	 */
	onClose: null,
	
	/**
	 * Handle the click event of OK button in view.
	 */
	createGroupMoveOrderForm_onCreateGroupMoveOrder: function() {
		//Invoke the WFR insertMoProjectRecordsFromPendingAssignments
		if (this.createGroupMoveOrderForm.canSave()) {
			//Validate the dates
			var startDate = this.createGroupMoveOrderForm.getFieldValue('project.date_start');
			var endDate = this.createGroupMoveOrderForm.getFieldValue('project.date_end');
			if (startDate > endDate) {
				View.alert(getMessage('wrongDates'));
				return;
			}
			var projectCode = this.createGroupMoveOrderForm.getFieldValue("project.project_id");
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectCode, '=');
			var records = this.createGroupMoveOrderDs.getRecords(restriction);
			if (records.length > 0) {
				View.alert(getMessage('project') + " " + projectCode +" "+ getMessage('projetAlreadyExists'));
				return;
			}
			var groupMoveOrder = this.createGroupMoveOrder();
			var pendingAssignments = this.createGroupMoveOrderPendingAssignments();
			try {
				Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceTransactionProcess-insertMoProjectRecordsFromPendingAssignments", groupMoveOrder, pendingAssignments);
			}catch(e) {
				Workflow.handleError(e);
				return;
			}
			
			this.employeePendingAssignment = null;
			if(this.onClose) {
				this.onClose(this);
			}
		}
	},
	
	/**
	 * Create group order json object to be passed to WFR 'insertMoProjectRecordsFromPendingAssignments'.
	 */
	createGroupMoveOrder: function() {
		
		var groupMoveOrder = {};
		groupMoveOrder['project_id'] = this.createGroupMoveOrderForm.getFieldValue("project.project_id");
		groupMoveOrder['description'] = this.createGroupMoveOrderForm.getFieldValue("project.description");
		groupMoveOrder['bl_id'] = this.createGroupMoveOrderForm.getFieldValue("project.bl_id");
		groupMoveOrder['dept_contact'] = this.createGroupMoveOrderForm.getFieldValue("project.dept_contact");
		groupMoveOrder['requestor'] = this.createGroupMoveOrderForm.getFieldValue("project.requestor");
		groupMoveOrder['date_start'] = this.createGroupMoveOrderForm.getFieldValue("project.date_start");
		groupMoveOrder['date_end'] = this.createGroupMoveOrderForm.getFieldValue("project.date_end");
		groupMoveOrder['contact_id'] = this.createGroupMoveOrderForm.getFieldValue("project.contact_id");
		groupMoveOrder['project_type'] = this.createGroupMoveOrderForm.getFieldValue("project.project_type");
		
		return groupMoveOrder;
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