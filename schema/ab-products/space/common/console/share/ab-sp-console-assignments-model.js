
Ab.namespace('space.express.console');

/**
 * Defines a pending assignment.
 *
 * type:
 * 
 * employee
 * division
 * department
 * category
 * type
 *
 * Department assignment:   Room type assignment:   Employee assignment:
 * bl_id                    bl_id                   em_id
 * fl_id                    fl_id                   bl_id
 * rm_id                    rm_id                   fl_id
 * dp_id                    rm_cat                  rm_id
 * dv_id                    rm_type                 to_bl_id
 * to_dp_id                 to_rm_cat               to_fl_id
 * to_dv_id                 to_rm_type              to_rm_id
 */
Ab.space.express.console.Assignment = Backbone.Model.extend({
    /**
     * Initializes default values.
     */
    defaults: {
        type: 'department'
    },

    /**
     * Returns the assignment type.
     */
    getType: function() {
        return this.get('type');
    },

    /**
     * Returns true if this assignment and specified assignment point to the same room or employee.
     * @param assignment
     * @return {Boolean}
     */
    equals: function(assignment) {
        var result = false;

        switch (this.getType()) {
	        case 'division':
	        case 'department':
	        case 'category':
	        case 'type':
	        case 'standard':
	        case 'team':
	            result = (this.get('bl_id') === assignment.get('bl_id') &&
	                      this.get('fl_id') === assignment.get('fl_id') &&
	                      this.get('rm_id') === assignment.get('rm_id'));
	            break;
	        case 'employee':
	            result = (this.get('em_id') === assignment.get('em_id'));
	            break;
        }
        return result;
    },

    /**
     * Returns true if this assignment and specified assignment point to the same department or room type.
     * @param assignmentTarget
     * @return {Boolean}
     */
    equalsTarget: function(assignmentTarget) {
        var result = false;

        switch (this.getType()) {
            case 'division':
                result = (this.get('to_dv_id') === assignmentTarget.dv_id);
                break;
            case 'department':
            	result = (this.get('to_dv_id') === assignmentTarget.dv_id &&
            			this.get('to_dp_id') === assignmentTarget.dp_id);
            	break;
            case 'category':
                result = (this.get('to_rm_cat') === assignmentTarget.rm_cat);
                break;
            case 'type':
            	result = (this.get('to_rm_cat') === assignmentTarget.rm_cat &&
            			this.get('to_rm_type') === assignmentTarget.rm_type);
            	break;
            case 'standard':
            	result = (this.get('rm_std') === assignmentTarget.rm_std);
            	break;
            case 'team':
            	result = (this.get('team_id') === assignmentTarget.team_id);
            	break;
        }
        return result;
    }
});

/**
 * Collection of pending assignments. All assignments in the collection are of the same type.
 */
Ab.space.express.console.Assignments = Backbone.Collection.extend({
    /**
     * The collection's data model.
     */
    model: Ab.space.express.console.Assignment,

    /**
     * Returns the collection type.
     */
    getType: function() {
        return this.isEmpty() ? '' : this.at(0).getType();
    },

    /**
     * Returns the assignment that matches the room or the employee of the specified assignment.
     * @param assignment An Assignment instance, or a simple object with properties.
     * @return The Assignment instance, or null if not found.
     */
    findAssignment: function(assignment) {
        assignment = this._prepareModel(assignment);
        return this.find(function(thisAssignment) {
            return thisAssignment.equals(assignment);
        });
    },

    /**
     * Add specified assignment to the collection. If an assignment for the same room or employee
     * already exists in the collection, replaces it.
     * @param assignment An Assignment instance.
     */
    addAssignment: function(assignment) {
        this.removeAssignment(assignment);
        this.add(assignment);
    },

    /**
     * Removes specified assignment from the collection if it exists.
     * @param assignment An Assignment instance.
     */
    removeAssignment: function(assignment) {
        this.remove(this.findAssignment(assignment));
    },
    
    /**
     * Get the assigned employee assignment to obtain the original location.
     * Add by heqiang
     * @param assignment
     */
    getAssignmentByEmployee: function(assignment) {
    	assignment = this._prepareModel(assignment);
    	return this.find(function(thisAssignment) {
    		if (thisAssignment.equals(assignment)) {
    			return thisAssignment;
    		}
    	});
    },

    /**
     * Creates a restriction that includes all employees or rooms in the pending assignments list.
     */
    createRestriction: function() {
        var restriction = new Ab.view.Restriction();
        switch (this.getType()) {
	        case 'division':
	        case 'department':
	        case 'category':
            case 'type':
            case 'standard':
            case 'team':
                this.each(function(assignment, index) {
                    var relOp = 'AND';
                    if (index > 0) {
                        relOp = ')OR(';
                    }
                    restriction.addClause('rm.bl_id', assignment.get('bl_id'), '=', relOp);
                    restriction.addClause('rm.fl_id', assignment.get('fl_id'), '=');
                    restriction.addClause('rm.rm_id', assignment.get('rm_id'), '=');
                });
                break;
            case 'employee':
                var em_ids = this.pluck('em_id');
                if (em_ids.length > 0) {
                    restriction.addClause('em.em_id', em_ids, 'IN');
                } else {
                    restriction.addClause('em.em_id', '', '=');
                }
                break;
        }

        return restriction;
    }
});

/**
 * Defines a room.
 *
 * bl_id
 * fl_id
 * rm_id
 */
Ab.space.express.console.Room = Backbone.Model.extend({
    /**
     * Returns true if this room and specified room are the same.
     */
    equals: function(room) {
        return (this.get('bl_id') === room.get('bl_id') &&
                this.get('fl_id') === room.get('fl_id') &&
                this.get('rm_id') === room.get('rm_id'));
    }
});

/**
 * Collection of rooms.
 */
Ab.space.express.console.Rooms = Backbone.Collection.extend({
    /**
     * The collection's data model.
     */
    model: Ab.space.express.console.Room,

    /**
     * Returns the room that matches specified room keys.
     */
    findRoom: function(room) {
        room = this._prepareModel(room);
        return this.find(function(thisRoom) {
            return thisRoom.equals(room);
        });
    },
    
    /**
     * Find all the rooms of selected building and floor.
     */
    targetToArray: function(targetBlId, targetFlId) {
    	var rooms = [];
    	this.each(function(room, index) {
    		if (targetBlId === room.get('bl_id') && targetFlId === room.get('fl_id')) {
    			var roomArray = [];
        		roomArray[0] = room.get('bl_id');
        		roomArray[1] = room.get('fl_id');
        		roomArray[2] = room.get('rm_id');
        		rooms.push(roomArray);
    		}
    	});
    	return rooms;
    },

    /**
     * Adds a room to the collection.
     * @param room
     */
    addRoom: function(room) {
        this.add(room);
    },

    /**
     * Removes a room from the collection.
     * @param room
     */
    removeRoom: function(room) {
        this.remove(this.findRoom(room));
    },

    /**
     * Creates a restriction that includes all employees or rooms in the pending assignments list.
     */
    createRestriction: function() {
        var restriction = new Ab.view.Restriction();

        this.each(function(room, index) {
            var relOp = 'AND';
            if (index > 0) {
                relOp = ')OR(';
            }
            restriction.addClause('rm.bl_id', room.get('bl_id'), '=', relOp);
            restriction.addClause('rm.fl_id', room.get('fl_id'), '=');
            restriction.addClause('rm.rm_id', room.get('rm_id'), '=');
        });

        return restriction;
    }
});

