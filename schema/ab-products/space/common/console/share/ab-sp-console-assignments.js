
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
        this.on('app:space:express:console:clearPendingAssignments', this.clearPendingAssignments);
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
    	this.drawingPanel.getSidecar().load();
        // if the sidecar contains previously saved assignment target, re-establish the same assignment mode
        var assignmentTarget = this.drawingPanel.getSidecar().get('assignmentTarget');
        var pendingAssignmentsValue = this.drawingPanel.getSidecar().get('pendingAssignments');
        
        var restoredAssignments = null;
        if (pendingAssignmentsValue) {
        	restoredAssignments = new Ab.space.express.console.Assignments(pendingAssignmentsValue);
        }
        
        this.assignmentTarget = null;
		this.setPendingAssignments(null);
        if (assignmentTarget) {
        	if (restoredAssignments && restoredAssignments.length > 0) {
        		 this.assignmentTarget = assignmentTarget;
        		 this.setPendingAssignments(restoredAssignments);
        		 this.beginAssignment(assignmentTarget);
        	} 
        }
        
        this.updateStatus();
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
        this.drawingPanel.getSidecar().set('assignmentTarget', this.assignmentTarget);
        this.drawingPanel.getSidecar().set('pendingAssignments', this.pendingAssignments);
        this.drawingPanel.getSidecar().save();
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
    	            innerThis.trigger('app:space:express:console:afterBeginAssignment', assignmentTarget, innerThis.pendingAssignments);
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
		var isTeamAssignMode = ('team'===this.assignmentTarget.type); 
        this.clearAssignment();
        this.roomCountArray = [];
        this.refreshGrid();
        
        //set empty value to 'pendingAssignments'.
        this.drawingPanel.getSidecar().set('pendingAssignments', this.pendingAssignments);
        this.drawingPanel.getSidecar().save();
        
        this.updateStatus();
        this.trigger('app:space:express:console:afterClearAssignment', isTeamAssignMode);
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
        } else if (tabName=='teamsTab') {
        	this.teamGrid.refresh();
        } else { 
    	    var unselectedNode = null;
    	    if (tabName=='departmentsTab') {
    	       unselectedNode = this.departmentTree.lastNodeClicked;
			   this.departmentTree.refresh();
    	    } else if (tabName=='categoriesTab') {
    	       unselectedNode = this.categoriesTree.lastNodeClicked;
			   this.categoriesTree.refresh();
    	    }
    	    if (unselectedNode) {
				//kb#3052233: work around, since after refreh tree, the tree control's lastNodeClicked turns to be null.
    	    	unselectedNode.treeControl.lastNodeClicked = unselectedNode;
    	    	unselectedNode.highlightNode(false);
    	    }
    	}
    },
    
    /**
     * When change assignment target, clear assignment target and pending assignments when user switch among the tabs.
     */
    changeAssignTarget: function() {
    	this.assignmentTarget = null;
    	this.pendingAssignments = new Ab.space.express.console.Assignments();
    	this.drawingPanel.getSidecar().set('pendingAssignments', this.pendingAssignments);
        this.drawingPanel.getSidecar().save();
    	this.trigger('app:space:express:console:refreshDrawing');
    	this.updateStatus();
    },

    /**
     * Commits the current assignment operation and clears all pending assignments.
     */
    commitAssignment: function() {
		var assignments = this.getAssignmentsForWFR();
		try {
			if ( 'spaceMode' == this.mode ) {
				Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-commitSpaceAssignments", assignments);
				this.afterCommitAssignment();

			} else  if (  'team'===this.assignmentTarget.type ) {
				
				this.commitTeamAssignments(assignments);

			} else{
				this.commitEmployeePendingAssignments(assignments);
			}

		} catch (e) {
			Workflow.handleError(e); 
		}
	   	
    },

    afterCommitAssignment: function() {
		var isTeamAssignMode = ('team'===this.assignmentTarget.type); 
		this.clearAssignment();
		this.roomCountArray = [];

		this.drawingPanel.getSidecar().set('pendingAssignments', this.pendingAssignments);
		this.drawingPanel.getSidecar().save();

		this.updateStatus();
		//refresh grid to show updated records.
		this.refreshGrid();
		this.trigger('app:space:express:console:afterClearAssignment', isTeamAssignMode);
	},
    
    /**
     * method invoke when commit employee button click.
     */
    commitEmployeePendingAssignments: function(assignments) {
    	var innerThis = this;
		var nonOccupiableRooms = abSpConsole_getNonoccupiableRooms(this.pendingAssignments);
		if (nonOccupiableRooms.length > 0) {
			var errMessage = abSpConsole_getNonOccupiableWarningMessage(nonOccupiableRooms);
			( nonOccupiableRooms.length==1 ? getMessage('roomNonoccupiableMessageEnd') : getMessage('roomsNonoccupiableMessageEnd') );
			View.message('error', errMessage);
		} else {
			innerThis.commitEmployeePendingAssignments1(assignments);
		}
    },

	commitEmployeePendingAssignments1: function(assignments){
    	var me = this;
		if (isWaitingListExisting()) {
			var message = getMessage('confirmEmployeeAssignmentCommit');
			View.confirm(message, function(button){
				if (button == 'yes') {
					me.commitEmployeePendingAssignments2(assignments);
				}
			});   
		}
		else {
			me.commitEmployeePendingAssignments2(assignments);
    	}
	},

	commitEmployeePendingAssignments2: function(assignments){
		var me = this;
    	var overCapacityRooms = abSpConsole_getOverAssignmentRooms(this.pendingAssignments);
    	if (overCapacityRooms.length > 0) {
			View.confirm(abSpConsole_getOverCapacityWarningMessage(overCapacityRooms), function(button) {
				if(button == 'yes') {
					Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-commitEmployeeAssignments", assignments);
					me.afterCommitAssignment();
					me.trigger('app:space:express:console:afterCommitPendingAssignment');
					View.closeThisDialog();
				}
			});
    	} 
		else {
			Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-commitEmployeeAssignments", assignments);
			me.afterCommitAssignment();
			me.trigger('app:space:express:console:afterCommitPendingAssignment');
			View.closeThisDialog();
		}
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
            record['team_id'] = assignment.attributes.team_id ? assignment.attributes.team_id : "";
            record['date_start'] = assignment.attributes.date_start ? assignment.attributes.date_start : "";
            record['date_end'] = assignment.attributes.date_end ? assignment.attributes.date_end : "";
            //set attribute 'spaceAssignmentType' to division/department/category or type.
            record['spaceAssignmentType'] = this.assignmentTarget.type;

            assignments.push(record);
    	}
    	return assignments;
    },
    
    /**
     * Commit team assignments.
     */
    commitTeamAssignments: function(assignments) {
		View.openProgressBar(getMessage('commitTeamAssignments'),config = {
				interval: 100
		});
		this.startCommitTeamAssignments.defer(500, this, [assignments]);
	},

    /**
     * Progress of Commit team assignments.
     */
    startCommitTeamAssignments: function(assignments) {
    	for ( var i=0; i < assignments.length; i++ ) {
    		var assignment = assignments[i];
			var record = new Ab.data.Record({
				'rm_team.bl_id': assignment['bl_id'],
				'rm_team.fl_id': assignment['fl_id'],
				'rm_team.rm_id': assignment['rm_id'],
				'rm_team.team_id': assignment['team_id'],
				'rm_team.date_start': assignment['date_start'],
				'rm_team.date_end': assignment['date_end']});

			View.dataSources.get('teamPendingAssignmentDs').saveRecord(record);
		}
		this.afterCommitAssignment();
		View.closeProgressBar();
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
    		if(this.mode == 'employeeMode' && this.inAssignmentMode() && this.assignmentTarget.type!='team') {
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
     * Clear  all pending assignments.
     */
    clearPendingAssignments: function() {
    	this.pendingAssignments = new Ab.space.express.console.Assignments();
		this.trigger('app:space:express:console:afterBeginAssignment', this.assignmentTarget, this.pendingAssignments);
        this.updateStatus();
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
	        this.drawingPanel.refresh();
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
    	var status = this.getAssignmentStatus();
        this.drawingPanel.actionbar.setTitle(status);
        var showAssignActions = (status != '');
        var action = this.drawingPanel.actionbar.actions.get('cancelPendingAssignments');
        action.show(this.inAssignmentMode() && showAssignActions);
        action.enableButton(true);

        action = this.drawingPanel.actionbar.actions.get('viewPendingAssignments');
        action.setTitle(getMessage('viewPendingAssignments') + '&nbsp;(' + this.pendingAssignments.length + ')');
        action.show(this.inAssignmentMode() && showAssignActions);
        action.enableButton(true);

        action = this.drawingPanel.actionbar.actions.get('commitPendingAssignments');
        action.show(this.inAssignmentMode() && showAssignActions);
    	// console is a 'read-only' version, for those users who do not have authority to make any edits or assignments
    	action.enableButton(View.user.isMemberOfGroup('SPACE-CONSOLE-ALL-ACCESS'));

        action = this.drawingPanel.actionbar.actions.get('viewDetails');
        action.show(!this.inAssignmentMode() && this.selectedRooms.length > 0);
        action.enableButton(true);
        
        action = this.drawingPanel.actionbar.actions.get('cancelSelectedRooms');
        action.show(!this.inAssignmentMode() && this.selectedRooms.length > 0);
        action.enableButton(true);
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
            case 'team':
            	status = getMessage('teamAssignmentMode') + '&nbsp;' + this.assignmentTarget.team_name;
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
            case 'team':
            	handleAssignment(this.getAssignmentForTeam(room));
            	this.updateStatus();
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
     * Get assignment for team.
     */
    getAssignmentForTeam: function(room) {
    	return {
    		bl_id: room.bl_id,
    		fl_id: room.fl_id,
    		rm_id: room.rm_id,
    		team_id: this.assignmentTarget.team_id,
    		team_name: this.assignmentTarget.team_name,
			date_start: room.selectDateStart,
			date_end: room.selectDateEnd,
			room_capacity: room.roomCpapcity
    	}
    },
    
    /**
     * Open the pop-up window of selected rooms.
     */
    viewSelectedRooms: function(anchor, asOfDate) {
    	var restriction = this.selectedRooms.createRestriction();
		var hasTeamSchema = View.controllers.get('spaceExpressConsole').hasTeamSchema;
		var showTeams = View.controllers.get('spaceExpressConsole').showTeams;
		var popView = 'ab-sp-console-selected-rooms-employees-tab.axvw';
		var popTitle =  getMessage("selectedRoomsTitle");
		if ( hasTeamSchema && showTeams===1 ){
			popView = 'ab-sp-console-selected-rooms-employees-teams-tab.axvw';
			popTitle = getMessage("selectedRoomTeamsTitle");
		}
    	Ab.view.View.openDialog(popView, restriction, false, {
    		title : popTitle, 
    		collapsible: false, 
    		width:900, 
    		height:620,
			asOfDate: asOfDate
    	});
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
                case 'team':
                	this.viewTeamPendingAssignments(anchor);
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
        
        var result = Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-isMoveManagementLicensed");
        if(result.code == "executed") {
        	if(result.jsonExpression == "no") {
        		this.employeePendingAssignments.actions.get('moveOrderActionMenu').show(false);
        	}
        }

        // make sure grid columns sized to fill the overlay width
        this.employeePendingAssignments.resizeColumnWidths();
    },
    
    /**
     * Open up a window to display team assignments.
     */
    viewTeamPendingAssignments: function(anchor) {
    	var restriction = this.getNullDefaultRestriction();
    	this.teamPendingAssignmentPanel.showInWindow({
    		anchor: anchor,
    		width: 1000,
    		title: getMessage('pendingTeamAssignmentsTitle'),
    		restriction: restriction
    	});
    	
		var teamRows = [];
		var statisticHeaderRow = new Object();
		statisticHeaderRow['rm_team.bl_id'] = getMessage('statisTitle')+": ";
        statisticHeaderRow['isStatisticRow'] = true;
		teamRows.push(statisticHeaderRow);
		var teamHeaderRow = new Object();
		teamHeaderRow['rm_team.bl_id'] = getMessage('teamIdTitle');
		teamHeaderRow['rm_team.fl_id'] = getMessage('teamNameTitle');
		teamHeaderRow['rm_team.rm_id'] = getMessage('currentCap');
		teamHeaderRow['rm.cap_em'] = getMessage('targetRatio');
		teamHeaderRow['team_properties.team_name'] = getMessage('addtionalCap');
		teamHeaderRow['rm_team.date_start'] = getMessage('pendingRatio');
        teamHeaderRow['isStatisticRow'] = true;

		teamRows.push(teamHeaderRow);

    	for ( var i=0; i < this.pendingAssignments.models.length; i++ ) {
			var assignment = this.pendingAssignments.models[i];
			var record = new Ab.data.Record(
				{	'rm_team.bl_id' : assignment.attributes.bl_id, 
					'rm_team.fl_id' : assignment.attributes.fl_id,
					'rm_team.rm_id' : assignment.attributes.rm_id,
					'rm.cap_em' : assignment.attributes.room_capacity ? assignment.attributes.room_capacity : 0, 
					'rm_team.team_id' : assignment.attributes.team_id ? assignment.attributes.team_id : "", 
					'team_properties.team_name' : assignment.attributes.team_name ? assignment.attributes.team_name : "", 
					'rm_team.date_start' : assignment.attributes.date_start ? this.teamPendingAssignmentDs.parseValue("rm_team.date_start", assignment.attributes.date_start, false) : '',
					'rm_team.date_end' : assignment.attributes.date_end ? this.teamPendingAssignmentDs.parseValue("rm_team.date_end", assignment.attributes.date_end, false) : ''
				}, true);
			var row = this.teamPendingAssignmentPanel.recordToRow(record)
			this.teamPendingAssignmentPanel.addRow(row);
			this.addToTeamStatisticRow(teamRows, record, assignment.attributes.date_start);
		}
		
		if ( this.pendingAssignments && this.pendingAssignments.length>0 ){
			for (var j=0; j<teamRows.length; j++){
				this.teamPendingAssignmentPanel.addRow(teamRows[j]);
			}
		}

		this.teamPendingAssignmentPanel.hasNoRecords = false;	 	 
		this.teamPendingAssignmentPanel.build();
		this.teamPendingAssignmentPanel.resizeColumnWidths();

        var rows = this.teamPendingAssignmentPanel.rows;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i]['isStatisticRow']) {
                Ext.get(rows[i].row.dom).setStyle('color', '#4040f0');
                Ext.get(rows[i].row.dom).setStyle('font-weight', 'bold');
                Ext.get(rows[i].row.cells.get('removeTeamPendingAssignment').dom).setStyle('display', 'none');
            }
        }
    },

    /**
     * Add current pending room team assignment to the Team statistic rows.
     */
	addToTeamStatisticRow: function(teamRows, roomRecord, startDate) {
		var existingRowForRoom = false;
		for (var i=0; i<teamRows.length; i++) {
			if ( teamRows[i]['rm_team.bl_id']===roomRecord.getValue('rm_team.team_id') ) {
				existingRowForRoom = true;
				var addtionalCap = parseInt(teamRows[i]['team_properties.team_name']) + roomRecord.getValue('rm.cap_em');
				teamRows[i]['team_properties.team_name'] = ""+addtionalCap;
				var pendingRatio = !(teamRows[i]['currentCap']) ? 0: (teamRows[i]['currentOcp']/(teamRows[i]['currentCap']+addtionalCap)).toFixed(2);
				teamRows[i]['rm_team.date_start'] = ""+pendingRatio;
				return;
			}
		}

		if ( !existingRowForRoom ){
			var newTeamRow = new Object();
			var teamRecord = this.getTeamStasticsRecord(roomRecord.getValue('rm_team.team_id'), startDate);
			if ( teamRecord ){
				newTeamRow['rm_team.bl_id'] = roomRecord.getValue('rm_team.team_id');
				newTeamRow['rm_team.fl_id'] = teamRecord.getValue('team_properties.team_name');
				newTeamRow['rm_team.rm_id'] = teamRecord.getValue('team_properties.vf_cap_em');
				newTeamRow['rm.cap_em'] = teamRecord.getValue('team_properties.em_seat_ratio_tgt');
				newTeamRow['team_properties.team_name'] = ""+roomRecord.getValue('rm.cap_em');

				var currentCap = parseInt( teamRecord.getValue('team_properties.vf_cap_em') ? teamRecord.getValue('team_properties.vf_cap_em') : 0 );
				var currentOcp = parseInt( teamRecord.getValue('team_properties.vf_em_count') ? teamRecord.getValue('team_properties.vf_em_count'):0 );
				var addtionalCap = roomRecord.getValue('rm.cap_em');
				var pendingRatio = currentOcp/(currentCap+addtionalCap);
				newTeamRow['rm_team.date_start'] = ""+pendingRatio.toFixed(2);
				newTeamRow['isStatisticRow'] = true;
				newTeamRow['currentCap'] = currentCap;
				newTeamRow['currentOcp'] = currentOcp;
				teamRows.push(newTeamRow);	
			}
		}
	},

    /**
     * Get the team statistics record by given team_id and start date.
     */
	getTeamStasticsRecord: function(teamId, startDate) {
		this.teamStatisticRowDS.addParameter('teamId', teamId);
		this.teamStatisticRowDS.addParameter('asOfDate', startDate);
		var records = this.teamStatisticRowDS.getRecords();
		return records && records.length>0 ? records[0] : null;
	}
});
