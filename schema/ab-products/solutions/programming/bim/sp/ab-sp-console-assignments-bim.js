
/**
 * Controller that handles all assignments.
 *
 * Saves pending assignments into the drawing panel sidecar so that the user can finish the assignments during the next session.
 *
 * Events:
 * app:space:express:console:afterBeginAssignment
 * app:space:express:console:afterClearAssignment
 * app:space:express:console:afterChangeAssignmentTarget
 */
var spaceExpressConsoleAssignment = View.createController('spaceExpressConsoleAssignment', {
	
    /**
     * A copy of the parent view mode.
     */
    mode: '',
    /**
     * The object that describes what rooms are assigned to: a department, a room type, or employees.
     */
    assignmentTarget: null,

    /**
     * The Ab.space.express.console.Assignments collection of pending assignments.
     */
    pendingAssignments: null,

    /**
     * The Ab.space.express.console.Rooms collection of selected rooms.
     */
    selectedRooms: null,

    /**
     * A array[room, countEm] for save a set of assets and related count employee. 
     * object : assignedEmCount: {room: '', count: 0},
     */
    roomCountArray: [],

    /**
     * Constructor.
     */
    afterCreate: function() {
        this.clearAssignment();
        this.on('app:space:express:console:selectLocation', this.updateStatus);
        this.on('app:space:express:console:beginAssignment', this.beginAssignment);
        this.on('app:space:express:console:commitAssignment', this.commitAssignment);
        this.on('app:space:express:console:cancelAssignment', this.cancelAssignment);
        this.on('app:space:express:console:removeAssignment', this.removeAssignment);
        this.on('app:space:express:console:viewAssignment', this.viewAssignment);
        this.on('app:space:express:console:selectRoom', this.selectRoom);
        this.on('app:space:express:console:moveEmployee', this.moveEmployee);
        this.on('app:space:express:console:addEmployeeWaiting', this.addEmployeeWaiting);
        this.on('app:space:express:console:removeEmployeeWaiting', this.removeEmployeeWaiting);
        this.on('app:space:express:console:unassignEmployees', this.unassignEmployees);
        this.on('app:space:express:console:viewSelectedRooms', this.viewSelectedRooms);
        this.on('app:space:express:console:changeMode', this.afterChangeMode);
        this.on('app:space:express:console:cancelSelectedRooms', this.cancelSelectedRooms);
        this.on('app:space:express:console:changeAttributeTab', this.changeAssignTarget);
        this.on('app:space:express:console:updateEmployeeAssignment', this.updateEmployeeAssignment);
    },

    /**
     * Loads pending assignments from the previous user session, if any.
     * re-establish the same assignment mode if the sidecar contains previously saved assignment target
     */
    afterInitialDataFetch: function() {
        this.restorePendingAssignmentsIfExist();
    },

    /**
     * Reset mode aftet the change mode event.
     */
    afterChangeMode: function(mode) {
        if (valueExists(mode)) {
            this.mode = mode;
        }
    },
    
    /**
     * Restore any pending assignment if exists.
     */
    restorePendingAssignmentsIfExist: function() {
    	
    },
    
    /**
     * Sets pending assignments and set a listener that would save pending assignments to the sidecar on any change.
     */
    setPendingAssignments: function(pendingAssignments) {
        if (pendingAssignments) {
            this.pendingAssignments = pendingAssignments;
        } else {
            this.pendingAssignments = new Ab.space.express.console.Assignments();
        }
        // set a listener that would save pending assignments to the sidecar on any change
        this.pendingAssignments.on('add', this.onPendingAssignmentsChanged, this);
    },

    /**
     * Called after items are added or removed from the pending assignments collection.
     */
    onPendingAssignmentsChanged: function() {
      
    },

    /**
     * Clears all pending assignments.
     */
    clearAssignment: function() {
    	this.assignmentTarget = null;
    	this.pendingAssignments = new Ab.space.express.console.Assignments();
        this.selectedRooms = new Ab.space.express.console.Rooms();
        this.setPendingAssignments();
        View.closePanelWindows();
    },

    /**
     * Begins new assignment operation.
     * Keep pending assignments if the assignment operation has the same type, e.g. the user
     * has already assigned some rooms to a department, and has selected another department.
     * @param assignmentTarget
     */
    beginAssignment: function(assignmentTarget) {
        if (!this.assignmentTarget || this.assignmentTarget.type != assignmentTarget.type) {
        	this.beginNewAssignment(assignmentTarget);
        } else {
        	this.beginSameAssignment(assignmentTarget);
        }
    },
    
    /**
     * To begin a new attribute assignment.
     */
    beginNewAssignment : function(assignmentTarget) {
    	//warn the user if he or she changes assign target
    	if (this.pendingAssignments.length > 0) {
    		var warnMessage = getMessage('changeAssignTarget');
    		var innerThis = this;
    		View.confirm(warnMessage, function(button) {
    			if (button == 'yes') {
    				innerThis.clearAssignment();
    	            innerThis.trigger('app:space:express:console:refreshDrawing');
    	            innerThis.trigger('app:space:express:console:afterBeginAssignment', assignmentTarget, this.pendingAssignments);
    	            innerThis.assignmentTarget = assignmentTarget;
    	            innerThis.updateStatus();
    			}
    		});
    	} else {
    		this.trigger('app:space:express:console:afterBeginAssignment', assignmentTarget, this.pendingAssignments);
    		this.assignmentTarget = assignmentTarget;
	        this.updateStatus();
    	}
    },
    
    /**
     * The assigned attribute is the same as the existed.
     */
    beginSameAssignment : function(assignmentTarget) {
    	var tmpAssignment = assignmentTarget;
    	if (assignmentTarget != null) {
    		if(assignmentTarget.type == 'employee') {
    			//fix the load error.
    			var employees = assignmentTarget.employees;
    			if(employees && employees.length == 0 && this.pendingAssignments.length == 0) {
    				tmpAssignment = null;
    			}
    		}
    	}
    	
    	this.assignmentTarget = tmpAssignment;
    	
    	if (this.assignmentTarget == null) {
    		this.trigger('app:space:express:console:afterClearAssignment');
    	} else {
    		this.trigger('app:space:express:console:afterBeginAssignment', this.assignmentTarget, this.pendingAssignments);
    	}
    	this.updateStatus();
    },
    
    /**
     * Cancels the current assignment operation and clears all pending assignments.
     */
    cancelAssignment: function() {
    	//set the 'this.pendingAssignments' to empty.
        this.clearAssignment();
        this.roomCountArray = [];
        this.refreshGrid();
        
     
        
        this.updateStatus();
        this.trigger('app:space:express:console:afterClearAssignment');
    },
    
    /**
     * cancel the selected rooms.
     */
    cancelSelectedRooms: function() {
    	this.selectedRooms = new Ab.space.express.console.Rooms();
    	this.updateStatus();
    },
    
    /**
     * Refresh grid when cancel assignments or submit assignments.
     * Modified by heqiang to unhighlight the selected node but not refresh it.
     */
    refreshGrid: function() {
    	var tabName =  this.attributeTabs.getSelectedTabName();
    	if (tabName=='employeesTab') {
    		this.employeeGrid.refresh();
        } else { 
    	    var unselectedNode = null;
    	    if (tabName=='departmentsTab') {
    	       unselectedNode = this.departmentTree.lastNodeClicked;
    	    } else if (tabName=='categoriesTab') {
    	       unselectedNode = this.categoriesTree.lastNodeClicked;
    	    }
    	    if (unselectedNode) {
    	    	unselectedNode.highlightNode(false);
    	    }
    	}
    },
    
    /**
     * When change assignment target, clear assignment target and pending assignments when user switch among the tabs.
     */
    changeAssignTarget: function() {
    	
    },

    /**
     * Commits the current assignment operation and clears all pending assignments.
     */
    commitAssignment: function() {
    
    },
    
    /**
     * Get assignments Array as a WFR parameter.
     */
    getAssignmentsForWFR: function() {
    	var assignments = [];
    	for ( var i=0; i < this.pendingAssignments.models.length; i++ ) {
    		var assignment = this.pendingAssignments.models[i];
			//construct record object from assignment
    		var record = {};
			record['bl_id'] = assignment.attributes.bl_id;
            record['fl_id'] = assignment.attributes.fl_id;
            record['rm_id'] = assignment.attributes.rm_id;
			record['em_id'] = assignment.attributes.em_id==undefined ? "" : assignment.attributes.em_id;
            record['to_bl_id'] = assignment.attributes.to_bl_id==undefined ? "" : assignment.attributes.to_bl_id;
            record['to_fl_id'] = assignment.attributes.to_fl_id==undefined ? "":assignment.attributes.to_fl_id;
            record['to_rm_id'] = assignment.attributes.to_rm_id==undefined ? "" : assignment.attributes.to_rm_id;
            record['dv_id'] = assignment.attributes.to_dv_id==undefined ? "" : assignment.attributes.to_dv_id;
            record['dp_id'] = assignment.attributes.to_dp_id==undefined ? "" : assignment.attributes.to_dp_id;
            record['rm_cat'] = assignment.attributes.to_rm_cat==undefined ? "" : assignment.attributes.to_rm_cat;
            record['rm_type']= assignment.attributes.to_rm_type==undefined ? "" : assignment.attributes.to_rm_type;
            record['rm_std'] = assignment.attributes.rm_std == undefined ? "" : assignment.attributes.rm_std;
            //set attribute 'spaceAssignmentType' to division/department/category or type.
            record['spaceAssignmentType'] = this.assignmentTarget.type;

            assignments.push(record);
    	}
    	return assignments;
    },
    
    /**
     * Removes specified pending assignment.
     * @param assignment
     */
    removeAssignment: function(assignment) {
        this.pendingAssignments.removeAssignment(assignment);
        if (this.pendingAssignments.length == 0) {
            // the last pending assignment has been removed - cancel the assignment operation
            this.cancelAssignment();
        } else {
            // there are some pending assignments left - re-display them
    		if(this.mode == 'employeeMode' && this.inAssignmentMode()) {
        		this.decreaseRoomCount(assignment);
        	}
            this.viewAssignment();
        }

        this.updateStatus();
    },
    
    /**
     * When remove employee assignment, decrease the assignment count.
     */
    decreaseRoomCount: function(assignment) {
    	var currentLocation = assignment.location;
    	var pattern = new RegExp('-','g');
    	currentLocation = currentLocation.replace(pattern, '');
    	for (var i = 0; i < this.roomCountArray.length; i++) {
    		var location = this.roomCountArray[i].room;
    		if (currentLocation == location) {
    			this.roomCountArray[i].count--;
    			break;
    		}
    	}
    },
    
    /**
     * Called when the user drags an employee from one room to another,
     * from a room to the asset panel, or from the asset panel to a room.
     * @param assignment
     */
    moveEmployee: function(assignment) {
        this.assignmentTarget = assignment;
        
        //find the same assignment, keep the original assignment's location of the same employee
        var sameAssignment = this.pendingAssignments.getAssignmentByEmployee(assignment);
        if (sameAssignment) {
        	assignment.bl_id = sameAssignment.get('bl_id');
        	assignment.fl_id = sameAssignment.get('fl_id');
        	assignment.rm_id = sameAssignment.get('rm_id');
        }
        
        this.pendingAssignments.addAssignment(assignment);
        this.updateStatus();
    },

    /**
     * Adds specified employees to waiting room. If there are pending assignments for some employees, replaces them.
     * @param assignments
     */
    addEmployeeWaiting: function(assignments) {
        for ( var i = 0; i < assignments.length; i++ ) {
            this.pendingAssignments.addAssignment(assignments[i]);
        }
        this.updateStatus();
    },

    /**
     * Removes specified employee from the waiting room, and removes the pending assignment.
     * @param assignment
     */
    removeEmployeeWaiting: function(assignment) {
        this.pendingAssignments.removeAssignment(assignment);
        this.updateStatus();
    },

    /**
     * Immediately unassigns specified employees. If there are pending assignments for some employees, removes them.
     * @param assignments
     */
    unassignEmployees: function(assignments) {
    	//call WFR 'commitEmployeeAssignments' with to location empty in assignments.
		try {
			this.decreaseRmAssignedCountByAssignment(assignments);
		    Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-commitEmployeeAssignments", assignments);
		    for ( var i = 0; i < assignments.length; i++ ) {
	            this.pendingAssignments.removeAssignment(assignments[i]);
	        }
	        this.updateStatus();
			this.employeeGrid.refresh();
	        //this.drawingPanel.refresh();
	   	 } catch(e) {
		   	 Workflow.handleError(e); 
	   	 }
    },
    
    /**
     * When unassign employees, decrease the assigned number of a special room.
     */
    decreaseRmAssignedCountByAssignment: function(assignments) {
    	for (var i = 0; i < assignments.length; i++) {
    		var room = assignments[i].bl_id + assignments[i].fl_id + assignments[i].rm_id;
    		for(var j = 0; j < this.roomCountArray.length; j++) {
    			var keyRoom = this.roomCountArray[j].room;
    			if (room == keyRoom) {
    				this.roomCountArray[j].count = this.roomCountArray[j].count - 1;
    			}
    		}
    	}
    },
    
    

    /**
     * Updates the action bar.
     */
    updateStatus: function() {
    
    },

    /**
     * Returns true if the assignment operation is underway.
     * @return {Boolean}
     */
    inAssignmentMode: function() {
        return this.assignmentTarget !== null;
    },

    /**
     * Returns a user-friendly message that describes the current assignment operation.
     * @return {String}
     */
    getAssignmentStatus: function() {
        var status = '';
        if (this.inAssignmentMode()) {
        	status = this.getMessageInAssignmentMode();
        } else {
        	if (this.selectedRooms.length > 0) {
        		status = this.selectedRooms.length + '&nbsp;' + getMessage('selectedRoomCount');
        		var selectedRoomData = this.getSelectedRoomsTotals();
                status += ',&nbsp;' + selectedRoomData.area + '&nbsp;' + View.user.areaUnits.title;
        	}
        }
        return status;
    },
    
    /**
     * In AssignmentMode, returns a user-friendly message that describes the current assignment operation.
     * @return {String}
     */
    getMessageInAssignmentMode: function() {
        var status = '';
        switch (this.assignmentTarget.type) {
            case 'division':
                status = getMessage('divisionAssignmentMode') + '&nbsp;' + this.assignmentTarget.dv_id;
                break;
            case 'department':
            	status = getMessage('departmentAssignmentMode') + '&nbsp;' + this.assignmentTarget.dp_id;
            	break;
            case 'category':
                status = getMessage('categoryAssignmentMode') + '&nbsp;' + this.assignmentTarget.rm_cat;
                break;
            case 'type':
            	status = getMessage('categoryTypeAssignmentMode') + '&nbsp;' + this.assignmentTarget.rm_type;
            	break;
            case 'standard':
            	status = getMessage('roomStdAssignmentMode') + '&nbsp;' + this.assignmentTarget.rm_std;
            	break;
            case 'employee':
            	if (valueExists(this.assignmentTarget.employees) && this.assignmentTarget.employees.length > 0) {
            		status = getMessage('employeeAssignmentMode') + '&nbsp;';
                    if (this.assignmentTarget.employees.length == 1) {
                        status += this.assignmentTarget.employees[0].em_id;
                    } else {
                		status += this.assignmentTarget.employees.length;
                        status += '&nbsp;' + getMessage('employees');
                    }
               } else {
            	   if (this.pendingAssignments.length > 0) {
            		   status = getMessage('employeeAssingmentTip');
            	   }
               }
               break;
        }
        return status;
    },

    /**
     * Called when the user clicks on a room in the drawing control.
     * @param room
     * @param selected
     */
    selectRoom: function(room, selected) {
		 if (this.inAssignmentMode()) {
			 this.selectRoomInAssignmentMode(room, selected);
		 } else {
		     if (selected) {
		     	if (!this.selectedRooms.findRoom(room)) {
		     		this.selectedRooms.addRoom(room);
		     	}
		     } else {
		         this.selectedRooms.removeRoom(room);
		     }
		 }
		
		 this.updateStatus();
    },
    
    /**
     * In AssignmentMode, call when the user clicks on a room in the drawing control.
     * @param room
     * @param selected
     */
    selectRoomInAssignmentMode: function(room, selected) {
    	var innerThis = this;
		var handleAssignment = function(assignment) {
    		if (selected) {
    			innerThis.pendingAssignments.addAssignment(assignment);
    		} else {
    			innerThis.pendingAssignments.removeAssignment(assignment);
    		}
    	};
    	
        switch (this.assignmentTarget.type) {
            case 'division':
                handleAssignment(this.getAssignmentForDp(room));
                break;
            case 'department':
            	handleAssignment(this.getAssignmentForDp(room));
                break;
            case 'category':
            	handleAssignment(this.getAssignmentForRoomCat(room));
                break;
            case 'type':
            	handleAssignment(this.getAssignmentForRoomCat(room));
                break;
            case 'employee':
                this.updateEmployeeAssignment(room, selected);
                break;
            case 'standard':
            	handleAssignment(this.getAssignmentForRoomStandard(room));
           	 	break;
        }
    },
    
    /**
     * Update assignments according to the user choice when assign employees.
     */
    updateEmployeeAssignment: function(room, selected) {
    	for ( var i = 0; i < this.assignmentTarget.employees.length; i++ ) {
            var assignment = _.clone(this.assignmentTarget.employees[i]);
            assignment.to_bl_id = room.bl_id;
            assignment.to_fl_id = room.fl_id;
            assignment.to_rm_id = room.rm_id;
            if (selected) {
            	this.pendingAssignments.addAssignment(assignment);
            	this.updateStatus();
            } else {
                this.pendingAssignments.removeAssignment(assignment);
                this.updateStatus();
            }
        }
    	this.employeeGrid.unselectAll();
    },
    
    /**
     * Get an assignment for division or department.
     */
    getAssignmentForDp: function(room) {
        return {
            bl_id: room.bl_id,
            fl_id: room.fl_id,
            rm_id: room.rm_id,
            to_dv_id: this.assignmentTarget.dv_id,
            to_dv_name: this.assignmentTarget.dv_name,
            to_dp_id: this.assignmentTarget.dp_id,
            to_dp_name: this.assignmentTarget.dp_name
        }
    },
    
    /**
     * get assignment for room category.
     */
    getAssignmentForRoomCat: function(room) {
    	return {
    		bl_id: room.bl_id,
    		fl_id: room.fl_id,
    		rm_id: room.rm_id,
            to_rm_cat: this.assignmentTarget.rm_cat,
            to_rm_type: this.assignmentTarget.rm_type
    	}
    },
    
    /**
     * get assignment for room standard
     */
    getAssignmentForRoomStandard: function(room) {
    	return {
    		bl_id: room.bl_id,
    		fl_id: room.fl_id,
    		rm_id: room.rm_id,
    		rm_std: this.assignmentTarget.rm_std
    	}
    },
    
    /**
     * Open the pop-up window of selected rooms.
     */
    viewSelectedRooms: function(anchor) {
    	var restriction = this.selectedRooms.createRestriction();
    	Ab.view.View.openDialog('ab-sp-console-selected-rooms-employees-tab.axvw', restriction, false, {title : getMessage("selectedRoomsTitle"), width:900, height:620});
    },
    
    /**
     * Get the total number of selected rooms
     */
    getSelectedRoomsTotals: function() {
        var selectedRoomData = {
            count: 0,
            area: 0.0,
            headcount: 0
        };

        try {
            var restriction = this.selectedRooms.createRestriction();
            var record = this.selectedRoomsDS.getRecord(restriction);
            selectedRoomData.count = this.selectedRoomsDS.formatValue('rm.total_rooms', record.getValue('rm.total_rooms'), true);
            selectedRoomData.area = this.selectedRoomsDS.formatValue('rm.total_area', record.getValue('rm.total_area'), true);
            selectedRoomData.headcount = this.selectedRoomsDS.formatValue('rm.total_headcount', record.getValue('rm.total_headcount'), true);
        } catch (e) {
            Workflow.handleError(e);
        }

        return selectedRoomData;
    },
    
    /**
     * View the assignments according to the specified type.
     */
    viewAssignment: function(anchor) {
        if (this.inAssignmentMode()) {
            switch (this.assignmentTarget.type) {
                case 'division':
                    this.viewDepartmentPendingAssignments(anchor,'division');
                    break;
                case 'department':
                	this.viewDepartmentPendingAssignments(anchor);
                	break;
                case 'category':
                	this.viewTypePendingAssignments(anchor,'category');
                	break;
                case 'type':
                    this.viewTypePendingAssignments(anchor);
                    break;
                case 'standard':
                	this.viewRoomStdPendingAssignments(anchor);
                	break;
                case 'employee':
                    this.viewEmployeePendingAssignments(anchor);
                    break;
            }
        }
    },
    
    getNullDefaultRestriction: function() {
    	var restriction = new Ab.view.Restriction();
    	if(this.assignmentTarget.type == 'em') {
    		restriction.addClause('em.em_id', 'None', '=');
    	} else {
    		restriction.addClause('rm.bl_id', 'None', '=');
        	restriction.addClause('rm.fl_id', 'None', '=');
        	restriction.addClause('rm.rm_id', 'None', '=');
    	}
    	if(this.pendingAssignments.length > 0) {
    		restriction = this.pendingAssignments.createRestriction();
    	}
    	return restriction;
    },

    /**
     * Displays room type pending assignments.
     */
    viewDepartmentPendingAssignments: function(anchor,type) {
        // show the list of pending assignments in an overlay
    	var restriction1 = this.getNullDefaultRestriction();
        this.departmentPendingAssignments.showInWindow({
            anchor: anchor,
            width: 800,
            title: getMessage('pendingDepartmentAssignmentsTitle'),
            restriction: restriction1
        });

        // format custom grid columns
        var fromTemplate = _.template("{{dv_id}}-{{dp_id}}");
        var toTemplate = _.template("{{to_dv_id}}-{{to_dp_id}}");

        var controller = this;
        
        this.departmentPendingAssignments.gridRows.each(function(row) {
            var assignment = controller.pendingAssignments.findAssignment({
                bl_id: row.getFieldValue('rm.bl_id'),
                fl_id: row.getFieldValue('rm.fl_id'),
                rm_id: row.getFieldValue('rm.rm_id')
            });
            var from = fromTemplate({
                dv_id: row.getFieldValue('dv.dv_id'),
                dp_id: row.getFieldValue('dp.dp_id')
            });
            var to = assignment.get('to_dp_id') ? toTemplate(assignment.toJSON()) : '';
            if (type=="division") {
            	from = row.getFieldValue('dv.dv_id');
            	to = assignment.get('to_dv_id');
            }
            row.setFieldValue('rm.from', from);
            row.setFieldValue('rm.to', to);
        });

        // make sure grid columns sized to fill the overlay width
        this.departmentPendingAssignments.resizeColumnWidths();
    },

    /**
     * Displays room type pending assignments.
     */
    viewTypePendingAssignments: function(anchor,type) {
        // show the list of pending assignments in an overlay
    	var restriction = this.getNullDefaultRestriction();
        this.categoryPendingAssignments.showInWindow({
            anchor: anchor,
            width: 800,
            title: getMessage('pendingTypeAssignmentsTitle'),
            restriction: restriction
        });

        // format custom grid columns
        var fromTemplate = _.template("{{rm_cat}}-{{rm_type}}");
        var toTemplate = _.template("{{to_rm_cat}}-{{to_rm_type}}");

        var controller = this;
        
        this.categoryPendingAssignments.gridRows.each(function(row) {
            var assignment = controller.pendingAssignments.findAssignment({
                bl_id: row.getFieldValue('rm.bl_id'),
                fl_id: row.getFieldValue('rm.fl_id'),
                rm_id: row.getFieldValue('rm.rm_id')
            });
            var from = fromTemplate({
                rm_cat: row.getFieldValue('rm.rm_cat'),
                rm_type: row.getFieldValue('rm.rm_type')
            });
            var to = assignment.get('to_rm_type') ? toTemplate(assignment.toJSON()) : '';
            if (type=="category") {
            	from = row.getFieldValue('rm.rm_cat');
            	to = assignment.get('to_rm_cat');
            }
            row.setFieldValue('rm.from', from);
            row.setFieldValue('rm.to', to);
        });

        // make sure grid columns sized to fill the overlay width
        this.categoryPendingAssignments.resizeColumnWidths();
    },
    
    viewRoomStdPendingAssignments: function(anchor) {
    	var restriction = this.getNullDefaultRestriction();
    	this.roomstdPendingAssignmentPanel.showInWindow({
    		anchor: anchor,
    		width: 800,
    		title: getMessage('pendingRoomStdAssignmentsTitle'),
    		restriction: restriction
    	});
    	
    	var controller = this;
    	
    	this.roomstdPendingAssignmentPanel.gridRows.each(function(row) {
    		var assignment = controller.pendingAssignments.findAssignment({
                bl_id: row.getFieldValue('rm.bl_id'),
                fl_id: row.getFieldValue('rm.fl_id'),
                rm_id: row.getFieldValue('rm.rm_id')
            });
    		row.setFieldValue('rm.assigned_rm_std', assignment.get('rm_std'));
    	});
    	this.roomstdPendingAssignmentPanel.resizeColumnWidths();
    },

    /**
     * Displays employee pending assignments.
     */
    viewEmployeePendingAssignments: function(anchor) {
        // show the list of pending assignments in an overlay
    	var restriction = this.getNullDefaultRestriction();
        this.employeePendingAssignments.showInWindow({
            anchor: anchor,
            width: 800,
            title: getMessage('pendingEmployeeAssignmentsTitle'),
            restriction: restriction
        });

        // format custom grid columns
        var fromTemplate = _.template("{{bl_id}}-{{fl_id}}-{{rm_id}}");
        var toTemplate = _.template("{{to_bl_id}}-{{to_fl_id}}-{{to_rm_id}}");

        var controller = this;
        
        this.employeePendingAssignments.gridRows.each(function(row) {
            var assignment = controller.pendingAssignments.findAssignment({
                em_id: row.getFieldValue('em.em_id')
            });
            var from = assignment.get('bl_id') ? fromTemplate(assignment.toJSON()) : '';
            var to = assignment.get('to_bl_id') ? toTemplate(assignment.toJSON()) : '';
            row.setFieldValue('em.from', from);
            row.setFieldValue('em.to', to);
        });

        // make sure grid columns sized to fill the overlay width
        this.employeePendingAssignments.resizeColumnWidths();
    }
});
