/*************************************************************
 1. Class Model: provides access to the Timeline object model
	(1) loadTimeline(timelineDTO)
		load complete timeline object model from the server
		through Data Transfer Object;
    (2) getColumnNumber()
        Returns the number of timemark columns in the timeline.
    (3) getColumnDateTime(column)
        Returns the date and time for specified timemark column.
        If the column index is after the timeline end, returns the timeline end date and time.
	(4) getTimemark(column)
		return the Timemark instance object specified by
		passing column;
	(5) getTimeslot(row, column)
		return Timeslot instance specified by passing row and
		column;
	(6) getTimeslots(row, columnStart, columnEnd)
		return a JS array of Timeslot instances specified by
		passing row and column range;
	(7) getRowEvents(row)
		return a JS array of Timeline Event instances specified
		by passing row;
	(8) getEventForTimeslot(timeslot)
		return Timeline Event instance identified by passing
		Timeslot instance;
	(9) isExistingEvent(event)
		return a boolean to check if passing event is exsiting
		in the events of Model instance; 
	(10)addEvent(event)
		add passing timeline event instance into model's events
		list if it's not existing in the model;
	(11)removeEvent(event)
		remove passing event from model's events list if it's
		existing in the model;
	(12)getPendingEvents()
		return a JS array of unsaved events in model's events
		list;
 2. Class Timemark: describes a timemark
	(1) getDateTime()
		return a string value of date and time to be used in
		generating a request to the server;
	(2) getTimeLabel()
		return a describing string value of date and time
		to be used in UI;
 3. Class Timeslot: describes a timeslot
	(1) getRow()
		return zero-indexed row number;
	(2) getColumn()
		return zero-indexed column number;
	(3) equals(timeslot)
		return a boolean to indicate if the timeslot is the
		same as passing timeslot instance;
 4. Class Resource: describes a resource
	(1) getResourceId()
		return resource ID as a string value;
	(2) getPreBlockTimeslots()
		return pre block number determined by server; 
	(3) getPostBlockTimeslots()
		return post block number determined by server; 
 5. Class Event: decsribes a timeline event
	(1) getRow()
		return zero-indexed row number;
	(2) getStartTimeslot()
		return timeline event's start timeslot instance;
	(3) getEndTimeslot()
		return timeline event's end timeslot instance;
	(6) setStart(column)
		change event's start column;
	(7) getStart()
		return event's start column;
	(8) setEnd(column)
		change event's end column;
	(9) getEnd()
		return event's end column;
	(12) getDescribingStatus()
		return event's status description;
 *************************************************************/

/**
 * @fileoverview This file contains classes that implement the timeline control data model.
 *
 * Copyright (c) 1984-2007 ARCHIBUS, Inc.
 */

/**
 * All timeline classes are contained in the Ab.timeline namespace.
 */
Ab.namespace('timeline');

/**
 * Facade class that provides access to the Timeline data model.
 */
Ab.timeline.Model = Base.extend({
    // unique timeline ID
    id: '',
	// Array<Timemark>, one per timeline column.
	timemarks: null,	
	// Array<Timeslot>, one per unique combination of each resource and each timemark.
	timeslots: null,	
	// Array<Resources>, one per timeline row.
	resources: null,	
	// Array<Events> for available resources.
	events: null,	
	// number of minor timemarks per major timemark
	minorToMajorRatio: 1,
    // time right after the timeline end
    dateTimeEnd: null,
    
    /**
     * Constructor.
     */
    constructor: function(id) {
        this.id = id;
    },

    /**
     * Returns true if the model has been loaded.
     */
    isLoaded: function() {
        return valueExists(this.timemarks);
    },

	/**
	 * Loads complete timeline object model from the Data Transfer Object sent from the server.
	 * The current object model state, including unsaved changes, is discarded.
	 */
	loadTimeline: function(timelineDTO) {
		this.minorToMajorRatio = timelineDTO.minorToMajorRatio;
        this.dateTimeEnd = timelineDTO.dateTimeEnd;
        this.dateTimeEndLabel = timelineDTO.dateTimeEndLabel;
        
		// load timemarks
		this.timemarks = [];
		var timemarksDTO = timelineDTO.timemarks;
		for (var i = 0; i < timemarksDTO.length; i++) {
			var timemarkDTO = timemarksDTO[i];
			this.timemarks[i] = new Ab.timeline.Timemark(
			    timemarkDTO.column, 
			    timemarkDTO.dateTimeStart, 
			    timemarkDTO.dateTimeLabel,
			    timemarkDTO.type);
		}

		// load resources
        this.timeslots = [];
		this.resources = [];
		var resourcesDTO = timelineDTO.resources;
        if (resourcesDTO) {
		for (var i = 0; i < resourcesDTO.length; i++) {
			var resourceDTO = resourcesDTO[i];
			var resource = new Ab.timeline.Resource(
			    resourceDTO.resourceId,
			    resourceDTO.preBlockTimeslots,
			    resourceDTO.postBlockTimeslots,
                resourceDTO.columnAvailableFrom,
                resourceDTO.columnAvailableTo);
			for (var property in resourceDTO) {
				resource[property] = resourceDTO[property];
			}
			this.addResource(resource);
		}
        }
		
		// load events
		this.events = [];
		var eventsDTO = timelineDTO.events;
        if (eventsDTO) {
		for (var i = 0; i < eventsDTO.length; i++) {
			var eventDTO = eventsDTO[i];
			this.addEvent(new Ab.timeline.Event(
			    eventDTO.eventId, 
			    eventDTO.resourceRow, 
			    eventDTO.columnStart, 
			    eventDTO.columnEnd, 
			    false, 
			    this,
			    eventDTO.canEdit,
			    eventDTO.canDelete,
			    eventDTO.preBlockTimeslots,
			    eventDTO.postBlockTimeslots));
		}
        }
	},
	
    /**
     * Returns ID for the timeslot.
     */
    generateTimeslotId: function(row, column) {
        return this.id + "timeslot-" + row + "-" + column;
    },

    /**
	 * Returns the number of timemark columns in the timeline.
     */
	getColumnNumber: function() {
		return this.timemarks.length;
	},
    
    /**
     * Returns the date and time for specified timemark column.
     * If the column index is after the timeline end, returns the timeline end date and time.
     * @param {column}  0-based timemark column index.
     */
    getColumnDateTime: function(column) {
        var columnDateTime = null;
        if (column < this.getColumnNumber()) {
            columnDateTime = this.getTimemark(column).getDateTime();
        } else {
            columnDateTime = this.dateTimeEnd;
        }
        return columnDateTime;
    },

	/**
	* Returns the timemark object for specified column.
	* @param {col} 0-based timemark column index.
	* @return {Timemark}
	*/	
	getTimemark: function(col) {
		return this.timemarks[col];
	},

	/**
	* Returns the timeslot object for specified row and column.
	* @param {row} 0-based resource row index.
	* @param {col} 0-based timemark column index.
	* @return {Timeslot}
	*/
	getTimeslot: function (row, col) {
	    if (row < 0 || col < 0) {
	        //alert('Invalid timeslot [' + row + ',' + col + ']');
	        return null;
	    }
		return this.timeslots[row][col];
	},

	/**
	* Returns an array of timeslot objects for specified row and column range.
	* @param {row} 0-based resource row index.
	* @param {columnStart} 0-based first timemark column index (inclusive).
	* @param {columnEnd} 0-based last timemark column index (inclusive).
	* @return Array<Timeslot>
	*/
	getTimeslots: function(row, columnStart, columnEnd) {
		var timeslots = [];
		// make sure column indices are within the timeline range
		if (columnStart < 0 || typeof columnStart == 'undefined') 
			columnStart = 0;
	
		if (columnEnd >= this.getColumnNumber() || typeof columnEnd == 'undefined') 
			columnEnd = this.getColumnNumber() - 1;
		
		// copy timeslots within range into array
		for (var col = columnStart; col <= columnEnd; col++) {
		    var timeslot = this.getTimeslot(row, col);
		    if (timeslot != null) {
			    timeslots.push(timeslot);
		    }
		}
		return timeslots;
	},

	/**
  	* Returns an array of event timeslots for specified event.
	* @param {event} Event object.
	*/
	getTimeslotsForEvent: function(event) {
		return this.getTimeslots(event.getRow(), event.getStart(), event.getEnd());
	},
	
	getTimeslotsForEventPreBlocks: function(event) {
		return this.getTimeslots(event.getRow(), event.getPreStart(), event.getStart() - 1);
	},

	getTimeslotsForEventPostBlocks: function(event) {
		return this.getTimeslots(event.getRow(), event.getEnd() + 1, event.getPostEnd());
	},

	/**
	* Sets the status for all timeslots in specified array.
	* @param {timeslots} Array>Timeslot>.
	* @param {status} Status code.
	*/
	setTimeslotsStatus: function(timeslots, status) {
		for (var i = 0; i < timeslots.length; i++) {
			var timeslot = timeslots[i];
			if(timeslot.status!=status){
				timeslot.status = status;
			}
		}
	},
	
	/**
	* Checks whether the timeslot specified by row (resource index) and column (timemark index) is available.
	* @param {row} 0-based resource row index.
	* @param {col} 0-based timemark column index.
	* @return {boolean} True if the timeslot status is available. 
	*/
	isTimeslotAvailable: function(row, col) {
		var timeslot = this.getTimeslot(row, col);
		if (timeslot == null) {
		    return false;
		}
		return (timeslot.isAvailable());
	},
	
	/**
	* Checks whether all timeslot objects for specified row and column range are available.
	* @param {row} 0-based resource row index.
	* @param {columnStart} 0-based first timemark column index (inclusive).
	* @param {columnEnd} 0-based last timemark column index (inclusive).
	* @param {ignoreExistingEvents} optional, if specified as true, 
	*         timeslots that belong to existing events are considered available.
	* @return {boolean}
	*/
	allTimeslotsAvailable: function(row, columnStart, columnEnd, ignoreExistingEvents) {
	    var allAvailable = true;
	    var timeslots = this.getTimeslots(row, columnStart, columnEnd);
	    for (var i = 0; i < timeslots.length; i++) {
	    
	        if (typeof(ignoreExistingEvents) != 'undefined' && ignoreExistingEvents) {
		        if (timeslots[i].isUnavailable()) {
		            allAvailable = false;
		            break;
		        }
	        } else {
		        if (!timeslots[i].isAvailable()) {
		            allAvailable = false;
		            break;
		        }
	        }
	    }
	    return allAvailable;
	},
	
    /**
	 * Returns the number of resource rows in the timeline.
     */ 
	getRowNumber: function() {
	    return this.resources.length;
	},	
    
	/**
	* Returns the resource object for specified row.
	* @param {row} 0-based resource row index.
	* @return {Resource}
	*/
	getResource: function(row) {
		return this.resources[row];
	},
    
    /**
     * Adds specified resource object to the end of the resource list. 
     * Sets the resource.row property.
     * @param {resource} timeline.Resource instance. 
     */
    addResource: function(resource) {
        var row = this.resources.length;
        resource.row = row;
        this.resources[row] = resource;

        // create row timeslots and set their status (available or unavailable)
        this.timeslots[row] = [];
        var colNum = this.getColumnNumber();
        for (var column = 0; column < colNum; column++) {
            var timeslotStatus = Ab.timeline.Timeslot.STATUS_AVAILABLE;
            if (column < resource.columnAvailableFrom || column >= resource.columnAvailableTo) {
                timeslotStatus = Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE;
            }
            this.timeslots[row][column] = new Ab.timeline.Timeslot(
                this.generateTimeslotId(row, column),
                this.timemarks[column],
                this.resources[row],
                timeslotStatus);
        }
    },
    
    /**
     * Removes the resource object specified by the row index from the resource list.
     * @param {row} 0-based row index.
     */
    removeResource: function(row) {
        // remove all events for specified row
        var events = this.getRowEvents(row);
        for (var i = 0; i < events.length; i++) {
            this.removeEvent(events[i]);
        }
        // remove the resource for specified row
        this.resources.splice(row, 1);
    },
    
	/**
	* Returns event that contains timeslot specified by row and column.
	* @param {row} 0-based resource row index.
	* @param {col} 0-based timemark column index.
	* @return {Event}
	*/	
	getEvent: function(row, col) {
		var timeslot = this.getTimeslot(row, col);
		return this.getEventForTimeslot(timeslot);
	},
    
    /**
     * Returns array of events that belong to the specified row.
     * @param {row} 0-based resource row index.
     */
	getRowEvents: function(row){
        var result = [];
		for (var i = 0; i < this.events.length; i++){
			var event = this.events[i];
			if (!event.isDeleted() && event.getRow() == row){
				result.push(event);
			}
		}
		return result;
	},

	/**
	* Returns event that contains specified timeslot.
	* @param {Timeslot}
	* @return {Event}
	*/	
	getEventForTimeslot: function(timeslot) {
		var event = null;
		// do not bother with available or block timeslots
		if (timeslot.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION ||
		    timeslot.status == Ab.timeline.Timeslot.STATUS_NEW_RESERVATION) {			
			// walk through all events
			for (var i = 0; i < this.events.length; i++) {
				var e = this.events[i];				
				if (e.containsTimeslot(timeslot)) {
					event = e;
					break;
				}
			}
		}
		return event;
	},
	
	/**
	 * Returns a list of all events containing specified timeslot.
     * @param {Timeslot}
     * @return {Array<Event>}
	 */
	getAllEventsForTimeslot: function(timeslot) {
		var events = [];
		// do not bother with available or block timeslots
		if (timeslot.status == Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION ||
		    timeslot.status == Ab.timeline.Timeslot.STATUS_NEW_RESERVATION) {			
			// walk through all events
			for (var i = 0; i < this.events.length; i++) {
				var e = this.events[i];				
				if (e.containsTimeslot(timeslot)) {
					events.push(e);
				}
			}
		}
		return events;
	},
	
	//check if passing event is already existing in model's events
	isExistingEvent: function(event) {
		var found = false;
		for (var i = 0; i < this.events.length; i++) {
			if (this.events[i] == event){
			    found = true;
			    break;
			}
		}
		return found;
	},
	
	/**
	* Adds event to the list of events. 
	* If the same event object already exists, does nothing.
	* @param {Event}
	*/
	addEvent: function(event) {
		if (!this.isExistingEvent(event)) {
		    this.events.push(event);
            event.updateTimeslots();
		}
	},
    
	/**
	* Removes event object from the list of events.
	* @param {Event} object reference to an event that might be in the list.
	* @return true if event was found and removed, null otherwise. 
	*/
	removeEvent: function(event) {
		var removed = false;
		for (var i = 0; i < this.events.length; i++) {
			if (this.events[i] == event){
				// remove the event from the list
				this.events.splice(i, 1);
                // set all event timeslots as available
                event.clearTimeslots();
				removed = true;
				break;
			}
		}
		return removed;
	}, 
    
    /**
     * Modifies event start and/or end columns.
     * @param {event}           Existing event object.
     * @param {newStartColumn}  New start column index.
     * @param {newEndColumn}    New end column index.
     */
    modifyEvent: function(event, newStartColumn, newEndColumn) {
        // set all event timeslots as available
        event.clearTimeslots();

        // set event columns (and times)
        event.setStart(newStartColumn);
        event.setEnd(newEndColumn);
        
        // set event timeslot status
        event.updateTimeslots();
    },
    
    /**
     * Checks whether specified event can be modified.
     * @param {event}           Existing event object.
     * @param {newStartColumn}  Proposed start column index.
     * @param {newEndColumn}    Proposed end column index.
     * @param {ignoreEvents}    Optional. If specified as true, the function ignores all
     *                          events and only checks for unavailable resource timeslots.
     */
    canModifyEvent: function(event, newStartColumn, newEndColumn, ignoreEvents) {
        // if ignoreEvents is not specified, use false
        if (!valueExists(ignoreEvents)) {
            ignoreEvents = false;
        }
        
        var canModify = true;
    
        var preBlocks = event.resource.getPreBlockTimeslots();              
        var postBlocks = event.resource.getPostBlockTimeslots();
        
        for (var i = newStartColumn - preBlocks; i < newEndColumn + postBlocks + 1; i++) {
            if ( (i < event.getStart() - preBlocks) || (i > event.getEnd() + postBlocks) ) {
                var timeslot = this.getTimeslot(event.getRow(), i);
                if (valueExists(timeslot)) {
                    if (ignoreEvents) {
                        canModify = (!timeslot.isUnavailable());
                    } else {
                        canModify = (timeslot.isAvailable());
                    }
                } else {
                    canModify = false;
                }
            }
            if (!canModify) {
                break;
            }
        }
        
        return canModify;
    },

	/**
	* Returns a list of all events that are new, modified or deleted (but existed before).
	* @return {Array<Event>}
	*/	
	getPendingEvents: function(){
		var result = [];
		for (var i = 0; i < this.events.length; i++) {
			var event = this.events[i];
			if (event.isNew() || (event.eventId != null && event.isDeleted())){
				result.push(event);
			}
		}
		return result;
	}
});

/**
 * Describes a timemark - a minimal time unit that can be reserved.
 */
Ab.timeline.Timemark = Base.extend({
	// 0-based index of the timemark within the timeline
	column: 0,
	// date and time value in the neutral format (not for display)
	dateTimeStart: null,
	// localized date and/or time value, i.e. "8:00 am"
	dateTimeLabel: null,
	// type: major|minor
	type: 'major',

	/**
	* Constructor.
	*/
	constructor: function(column, dateTimeStart, dateTimeLabel, type) {
		this.column = column;
		this.dateTimeStart = dateTimeStart;
		this.dateTimeLabel = dateTimeLabel;
		this.type = type;
	},
	//return datetime for forming sql statement
	getDateTime:function(){
	        return this.dateTimeStart;
	},
	//return time label for UI
	getTimeLabel:function(){
		return this.dateTimeLabel;
	}
});

/**
 * Describes a timeslot - a minimal time unit that can be reserved for a specific resource.
 */
Ab.timeline.Timeslot = Base.extend({
	// reference to the Timemark object
	timemark:  null,	
	// reference to the Resource object
	resource: null,	
	// status code
	status: 0,
	// unique timeslot ID
	id: '',
	
	/**
	 * Constructor.
	 */
	constructor: function(id, timemark, resource, status) {
	    this.id = id;
	    this.timemark = timemark;
	    this.resource = resource;
	    if (valueExists(status)) {
	        this.status = status;
	    } else {
	        this.status = Ab.timeline.Timeslot.STATUS_AVAILABLE;
	    }
	},
	
	/**
	 * Returns 0-based row index.
	 */
	getRow: function() {
		return this.resource.row;
	},
	
	/**
	 * Returns 0-based column index.
	 */
	getColumn: function() {
		return this.timemark.column;
	},
	
	/**
	 * Returns true if this timeslot is available.
	 */
	isAvailable: function() {
		return (this.status == Ab.timeline.Timeslot.STATUS_AVAILABLE);
	},
	
    /**
     * Returns true if this timeslot is unavailable.
     */
    isUnavailable: function() {
        return (this.status == Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE);
    }
}, {
    // ----------------------- static members ------------------------------------------------------
    
	// possible values of the status code	
	STATUS_AVAILABLE: 0,
	STATUS_NOT_AVAILABLE: 1,
	STATUS_EXISTING_RESERVATION: 2,
    STATUS_BLOCK: 3,
	STATUS_FUTURE_BLOCK: 4,
	STATUS_NEW_RESERVATION: 5
});


/**
 * Describes a resource that can be booked/allocated.
 */
Ab.timeline.Resource = Base.extend({
	// 0-based resource row index
	row: 0,	
	// unique resource ID from the database
	resourceId: null,	
	// number of timeslots that cannot be reserved before the event
	preBlockTimeslots: 0,	
	// number of timeslots that cannot be reserved after the event
	postBlockTimeslots: 0,
    // 0-based index of the first available column
    columnAvailableFrom: 0,
    // 0-based index of the last available column
    columnAvailableTo: 1,
	
	/**
	* Constructor.
	*/
	constructor: function(resourceId, preBlockTimeslots, postBlockTimeslots, columnAvailableFrom, columnAvailableTo) {
		this.resourceId = resourceId;
		this.preBlockTimeslots = preBlockTimeslots;
		this.postBlockTimeslots = postBlockTimeslots;
        this.columnAvailableFrom = columnAvailableFrom;
        this.columnAvailableTo = columnAvailableTo;
	},
	//return resource ID
	getResourceId:function(){
		return this.resourceId;
	},
	//return pre blocks as integer
	getPreBlockTimeslots: function(){
		return this.preBlockTimeslots;
	},
	//return post blocks as integer
	getPostBlockTimeslots: function(){
		return this.postBlockTimeslots;
	}
});


/**
 * Describes an event instance.
 */
Ab.timeline.Event = Base.extend({

    // reference to the parent timeline
	timeline: null,    
	// unique event ID from the database
	eventId: null,	
	// reference to the Resource object
	resource: null,	
	// date/time of the first event timeslot
	dateTimeStart: null,	
	// date/time of the first timeslot after the event
	dateTimeEnd: null,	
	// column index of the first event timeslot
	columnStart: 0,	
	// column index of the last event timeslot
	columnEnd: 0,	
	// resource row index
	row: 0,
	// status code (existing by default)
	status: 0,
	// can the user change this event?
	canEdit: true,
	// can the user delete this event?
	canDelete: true,
    // number of timeslots that cannot be reserved before the event (by default, use the Resource)
    preBlockTimeslots: null,   
    // number of timeslots that cannot be reserved after the event (by default, use the Resource)
    postBlockTimeslots: null,

	/**
	 * Constructor.
	 * @param {timeline} Parent Timeline object.
	 */
	constructor: function(eventId, resourceRow, columnStart, columnEnd, isNew, timeline, canEdit, canDelete, preBlockTimeslots, postBlockTimeslots) {
		this.timeline = timeline;
		this.eventId = eventId;
		this.resource = timeline.getResource(resourceRow);
		this.columnStart = columnStart;
		this.columnEnd = columnEnd;
		this.row = resourceRow;
		this.status = isNew ? Ab.timeline.Event.STATUS_NEW : Ab.timeline.Event.STATUS_EXISTING;
		if (valueExists(canEdit)) {
		    this.canEdit = canEdit;
		} else {
		    this.canEdit = isNew;
		}
		if (valueExists(canDelete)) {
		    this.canDelete = canDelete;
		} else {
		    this.canDelete = canDelete;
		}
		if (valueExists(preBlockTimeslots)) {
            this.preBlockTimeslots = preBlockTimeslots;
		}
        if (valueExists(postBlockTimeslots)) {
            this.postBlockTimeslots = postBlockTimeslots;
        }
		this.updateTimeslots();
	},

    /**
     * Updates timeslots for this event.
     */
    updateTimeslots: function() {
        var timeslotStatus = this.isNew() ? Ab.timeline.Timeslot.STATUS_NEW_RESERVATION : Ab.timeline.Timeslot.STATUS_EXISTING_RESERVATION;
        var timeslots = this.timeline.getTimeslotsForEvent(this);
        this.timeline.setTimeslotsStatus(timeslots, timeslotStatus);
        
        var preTimeslots = this.timeline.getTimeslotsForEventPreBlocks(this);
        this.timeline.setTimeslotsStatus(preTimeslots, Ab.timeline.Timeslot.STATUS_BLOCK);
        
        var postTimeslots = this.timeline.getTimeslotsForEventPostBlocks(this);
        this.timeline.setTimeslotsStatus(postTimeslots, Ab.timeline.Timeslot.STATUS_BLOCK);
    },

    /**
     * Clears the status of timeslots for this event.
     */
    clearTimeslots: function() {
        var allTimeslots = this.timeline.getTimeslots(this.getRow(), this.getStart() - this.resource.preBlockTimeslots, this.getEnd() + this.resource.postBlockTimeslots);
        this.timeline.setTimeslotsStatus(allTimeslots, Ab.timeline.Timeslot.STATUS_AVAILABLE);
    },

    /**
     * Checks whether this event or its pre/post blocks overlap specified column range.
     */
    intersectsWith: function(start, end) {
        var preStart = this.getPreStart();
        var postEnd = this.getPostEnd();
        return !(postEnd < start || preStart > end);
    },

    /**
	* Checks whether specified timeslot is reserved by this event.
	* @param {timeslot}
	* @return {boolean}
	*/
	containsTimeslot: function(timeslot) {
		return (timeslot.getRow() == this.getRow() && 
		timeslot.getColumn() >= this.getStart() &&
		timeslot.getColumn() <= this.getEnd());
	},

    // checks whether the event contains the timeslot defined by row and column
	contains: function(row, column) {
		return (row == this.getRow() 
		        && column >= this.getStart() 
		        && column <= this.getEnd());
	},
    
    //Returns resource row for this event.
	getRow: function() {
		return this.resource.row;
	},

    //return event's start timeslot
	getStartTimeslot: function() {
		return this.timeline.getTimeslot(this.getRow(), this.getStart());
	},

    //return event's end timeslot
	getEndTimeslot: function() {
		return this.timeline.getTimeslot(this.getRow(), this.getEnd());
	},

    //passing event's new start column
	setStart:function(column){
		if(this.columnStart!=column){
			this.columnStart = column;
			this.status = Ab.timeline.Event.STATUS_MODIFIED;
            this.dateTimeStart = this.getStartTimeslot().timemark.getDateTime();
		}
	},

    //return event's start column
	getStart: function() {
		return this.columnStart;
	},

    /**
     * Returns index of the first pre-block column.
     */
    getPreStart: function() {
        var preBlockTimeslots = valueExists(this.preBlockTimeslots) ? this.preBlockTimeslots : this.resource.preBlockTimeslots;
        return this.columnStart - preBlockTimeslots;
    },

    /**
     * Returns index of the last post-block column.
     */
    getPostEnd: function() {
        var postBlockTimeslots = valueExists(this.postBlockTimeslots) ? this.postBlockTimeslots : this.resource.postBlockTimeslots;
        return this.columnEnd + postBlockTimeslots;
    },

    //passing event's new end column
	setEnd: function(column) {
		if(this.columnEnd!=column){
			this.columnEnd = column;
			this.status = Ab.timeline.Event.STATUS_MODIFIED;
            this.dateTimeEnd = this.timeline.getColumnDateTime(this.getEnd() + 1);
		}
	},

    //return event's end column number
	getEnd: function() {
		return this.columnEnd;
	},

    //return status description
	getDescribingStatus: function(){
		var result = Ab.view.View.getLocalizedString(Ab.timeline.Event.z_MESSAGE_STATUS_EXISTING);
		if (this.status == Ab.timeline.Event.STATUS_NEW)
			result = Ab.view.View.getLocalizedString(Ab.timeline.Event.z_MESSAGE_STATUS_NEW);
		else if(this.status == Ab.timeline.Event.STATUS_DELETED)
			result = Ab.view.View.getLocalizedString(Ab.timeline.Event.z_MESSAGE_STATUS_DELETED);
		else if(this.status == Ab.timeline.Event.STATUS_MODIFIED)
			result = Ab.view.View.getLocalizedString(Ab.timeline.Event.z_MESSAGE_STATUS_MODIFIED);
		return result;
	},

    isExisting: function() {
	    return this.status == Ab.timeline.Event.STATUS_EXISTING;
	},

    isDeleted: function() {
	    return this.status == Ab.timeline.Event.STATUS_DELETED;
	},

    isNew: function() {
        return (this.status == Ab.timeline.Event.STATUS_NEW || this.status == Ab.timeline.Event.STATUS_MODIFIED);
    }
},
{
    // ----------------------- static constants ----------------------------------------------------
    
    STATUS_EXISTING: 0, // existing event loaded from the database
    STATUS_NEW:      1, // created by the user and not saved yet
    STATUS_DELETED:  2, // marked as deleted by the user
    STATUS_MODIFIED: 3, // changed by the user

	// @begin_translatable
    z_MESSAGE_STATUS_EXISTING:  'EXISTING',
    z_MESSAGE_STATUS_NEW:      'NEW',
    z_MESSAGE_STATUS_DELETED:  'DELETED',
    z_MESSAGE_STATUS_MODIFIED: 'MODIFIED'
	// @end_translatable

});
