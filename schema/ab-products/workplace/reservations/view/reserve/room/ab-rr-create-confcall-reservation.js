
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Conference Call Reservation controller.
* The controller extends the room reservation controller.
* <p>
* Controller is used when creating or editing a room reservation.
* <p>
*
* @author Bart Vanderschoot
* @since 21.2
*/
var reservationTimelineController = View.extendController('reservationTimelineController', roomReservationBaseController, {
	
    confirmationView: "ab-rr-create-confcall-reservation-confirm.axvw",
    
    // rooms on the time line that have been marked for reserving
    // map with key = resourceId, values are reserve_rm records
    reservedRooms: {},
    
    /*
     * Rooms on the time line that were previously marked for reserving,
     * but have since been removed. These can be reinstated when selected again.
     * map with key = resourceId, values are reserve_rm records
     */
    removedRooms: {},
    
    /*
     * Indicates which room was selected first on the time line. If this room is still
     * selected when confirming the reservation, it will become the primary room in the
     * conference call. If it's no longer selected, then the topmost selected room on the
     * time line will become the primary room.
     */
    primaryRoomIdentifier: null,
    
    // the time zone id last used for loading the time lines
    timeZoneId: null,
    
 	/**
 	 * The reservation panel is refreshed and triggers the reservation room panel.
 	 */
 	reservePanel_afterRefresh: function() {
 		// We need only one reserve record (could be any of the active records in the conference call).
 		this.reservePanel.show(false);
 		
 		// Show additional instructions when editing a recurring conference call.
 		// Note this.editRecurring is set in afterInitialDataFetch.
 		if (this.editRecurring) {
			this.roomTimelinePanel.setInstructions(getMessage("onlySelectedRoomsRetained"));
		}
 		
 		if (View.restriction != null) {
 	        // Load all active reserve_rm records with matching res_conference id.
 		    // and determine which is the (still active) primary room
 		    
 		    // Find out which active reserve records are in the conference call.
            var restriction = new Ab.view.Restriction();
            var conferenceId = View.restriction.findClause("reserve.res_conference").value;
 	        restriction.addClause("reserve.res_conference", conferenceId);
 		    var conferenceReservations = this.reserve_ds.getRecords(restriction);
 		    var primaryReservation = conferenceReservations[0];
 		    
 		    // Get the active room allocations via a reserve_rm restriction.
 		    restriction = new Ab.view.Restriction();
 		    for (var i = 0; i < conferenceReservations.length; ++i) {
 		        restriction.addClause("reserve_rm.res_id", conferenceReservations[i].getValue("reserve.res_id"), "=", "OR");
 		    }
 		    var roomAllocations = this.reserve_rm_ds.getRecords(restriction);
 		    // Store the active room allocations in memory for showing on the time line.
 		    for (var i = 0; i < roomAllocations.length; ++i) {
 		        var roomAllocation = roomAllocations[i];
 		        this.reservedRooms[this.compileRoomIdentifierForRecord(roomAllocation)] = roomAllocation;
 		    }
 		    
 		    // Refresh the reserveRoomPanel with the primary room's information.
 		    restriction = new Ab.view.Restriction();
 		    restriction.addClause("reserve.res_id", primaryReservation.getValue("reserve.res_id"));
		   	this.reserveRoomPanel.refresh(restriction);
	   	} else {    
		   	this.reserveRoomPanel.refresh("reserve.res_id=0");
	   	}
 	},
 	
    /**
     * Get the time line resource id for the given record.
     * @param {object} record
     * @return {string} resource id
     */
    compileRoomIdentifierForRecord: function(record) {
        var buildingId = record.getValue("reserve_rm.bl_id");
        var floorId = record.getValue("reserve_rm.fl_id");
        var roomId = record.getValue("reserve_rm.rm_id");
        
        var configId = record.getValue("reserve_rm.config_id");
        var arrangeTypeId = record.getValue("reserve_rm.rm_arrange_type_id");
        
        // full resource id based on room arrangement primary key
        var resourceId = "<record bl_id='" + buildingId 
                + "' fl_id='" + floorId 
                + "' rm_id='" + roomId 
                + "' config_id='" + configId 
                + "' rm_arrange_type_id='" + arrangeTypeId + "'/>";
        return resourceId;
    },
 	
 	/**
 	 * The reservation panel and room allocation panel are loaded.
 	 */
 	reserveRoomPanel_afterRefresh: function() {
 		this.reserveRoomPanel.show(false);
 		this.loadReservationDetails();
 	},
 	
	/**
 	 * load reservation details after refresh.
 	 */
 	loadReservationDetails: function() {
 		// update the date picker
		this.updateDatePicker();
		
		// update the console defaults
		this.updateConsoleDefaults();
		
		// update the panels when editing a reservation
		var reservationId = this.reservePanel.getFieldValue("reserve.res_id");
		
		this.selectedAttendees = [];
	   	
	   	// check if this is new reservation
	   	if (reservationId != "") {
	   		this.loadSelectedAttendees();
	   	}
		this.loadRecurrenceDetails(reservationId);
 	},
	 
	/**
	 * Update the console defaults based on existing reservation info or user info.
	 */
	updateConsoleDefaults: function() {
		this.createResourcesStandardsCheckboxes("selectRoomAttributes", "selectMoreRoomAttributes",
				this.resourceStandardsIdPrefix);
 		
		var buildingId = this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id");
		if (buildingId != "") {
		    // fill in the primary building first
			this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
			
			// Fill in the other building ids: 2,3 and 4 directly, 5 using multiple value API if required.
			// To avoid duplicates, track which building ids were processed.
			var buildingIds = {};
			buildingIds[buildingId] = 1;
			var multipleValues = [];
			var i = 2;
			for (var key in this.reservedRooms) {
			    var roomAllocation = this.reservedRooms[key];
			    var blId = roomAllocation.getValue("reserve_rm.bl_id");
			    if (buildingIds[blId] == undefined) {
			        if (i >= 5) {
			            multipleValues.push(blId);
			        } else {
			            this.consolePanel.setFieldValue("bl_id" + i, blId);
			        }
			        buildingIds[blId] = i;
			        ++i;
			    }
			}
			
			if (multipleValues.length == 1) {
			    this.consolePanel.setFieldValue("bl_id5", multipleValues[0]);
			} else if (multipleValues.length > 1) {
			    this.consolePanel.setFieldMultipleValues("bl_id5", multipleValues);
			}
			
			// KB 3045664 set capacity and arrangement type only if they are the same for each room.
			this.setDefaultCapacity();
			this.setDefaultArrangeType();
		} else {
			// take the user location for a new reservation
			buildingId = View.user.employee.space.buildingId
			this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
			this.reserveRoomPanel.setFieldValue("reserve_rm.bl_id", buildingId);
		}
		this.setTimeZoneByBuilding(buildingId);
		
		// set start and end time
		var startTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_start");
		var endTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_end");		
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_start", startTime);
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_end", endTime);
	},
	
	/**
	 * Set the default capacity in the console, if the number of attendees is the same
	 * for all rooms. If it's different for some rooms then remove the value from the console.
	 */
	setDefaultCapacity: function() {
		var capacity = "";
		for (var key in this.reservedRooms) {
			var roomAllocation = this.reservedRooms[key];
			var attendeesInRoom = roomAllocation.getValue("reserve_rm.attendees_in_room");
			if (capacity == "") {
				capacity = attendeesInRoom;
			} else if (attendeesInRoom != capacity) {
				capacity = "";
				break;
			}
		}
		this.consolePanel.setFieldValue("rm_arrange.max_capacity", capacity);
	},
	
	/**
	 * Set the default arrange type in the console, if the arrange type is the same for all rooms.
	 */
	setDefaultArrangeType: function() {
		var arrangeType = "";
		for (var key in this.reservedRooms) {
			var roomAllocation = this.reservedRooms[key];
			var roomArrangeType = roomAllocation.getValue("reserve_rm.rm_arrange_type_id");
			if (arrangeType == "") {
				arrangeType = roomArrangeType;
			} else if (arrangeType != roomArrangeType) {
				arrangeType = "";
				break;
			}
		}
		if (arrangeType != "") {
			this.consolePanel.setFieldValue("rm_arrange.rm_arrange_type_id", arrangeType);
		}
	},
	
	/**
	 * Set the time zone in the console based on a building id.
	 * @param {string} buildingId
	 */
	setTimeZoneByBuilding: function(buildingId) {
		try {
			var result = Workflow.callMethod('AbWorkplaceReservations-conferenceCallReservationService-getLocationTimeZone', 
				buildingId);
			if (result.code == 'executed' && result.data.records.length > 0) {
				var record = result.dataSet;
				var fieldName = "afm_timezones.timezone_id";
				this.consolePanel.setFieldValue(fieldName, record.getLocalizedValue(fieldName), record.getValue(fieldName));
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	},
	
	/**
	 * Get the currently selected time zone from the console panel.
	 * @return {string} time zone id
	 */
	getTimeZoneId: function() {
	    return this.timeZoneId;
	},
	
	/**
	 * Initialize all timelines.
	 * <p>
	 * 		all timelines are created and loaded with default reservation date.
	 * 		when editing this is the reservation date, for new the default date is today.
	 * 		when editing a recurring reservation, all reservation dates are checked.
	 * <p>
	 */
	initTimelines: function() {
		// create and load the available rooms timeline
		this.createRoomTimeline();  	 
		// create and load the attendee timeline
		this.createAttendeeTimeline();
	},  
	
	/**
	 * When clicking the apply filter button.
	 */
	consolePanel_onApplyFilter: function() {
		// save the previous building id for later
		var buildingId = this.consolePanel.getFieldValue("rm_arrange.bl_id");
		if (buildingId != "" && this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id") != buildingId) {
			this.reserveRoomPanel.setFieldValue("reserve_rm.bl_id", buildingId);
			this.reserveRoomPanel.setFieldValue("reserve_rm.fl_id", "");
			this.reserveRoomPanel.setFieldValue("reserve_rm.rm_id", "");
		}
        var numberOfAttendees = this.consolePanel.getFieldValue("rm_arrange.max_capacity");
        if (numberOfAttendees != "") {
            // update the number of attendees in all rooms
            for (var resourceId in this.reservedRooms) {
                this.reservedRooms[resourceId].setValue("reserve_rm.attendees_in_room", numberOfAttendees);
            }
        }
		
		this.reloadTimelines();
	},
	
	/**
	 * When clicking the clear filter button.
	 */
	consolePanel_onClearFilter: function() {
		this.consolePanel.setFieldValue("rm_arrange.rm_arrange_type_id", "");
		this.consolePanel.setFieldValue("rm_arrange.capacity", null);
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_start", "");
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_end", "");
		
		// uncheck the external guests checkbox
		$('externalGuests').checked = false;
		this.allowExternalGuests = false;
		
		// uncheck all fixed resources checkboxes
		for (var i = 0; i < this.selectedFixedResourceStandards.length; ++i) {
			$(this.resourceStandardsIdPrefix + this.selectedFixedResourceStandards[i]).checked = false;
		}
		this.selectedFixedResourceStandards = [];
		
		this.consolePanel_onApplyFilter();
	},
	
	/**
	 * Prepare for opening the confirmation dialog.
	 */
	prepareConfirm: function() {		
		this.reservePanel.setFieldValue("reserve.attendees", this.selectedAttendees.join(";"));
		
		// Verify that at least one room is selected.
		var validated = true;
		if (this.roomTimelineController.getPendingEvents().length == 0) {
			validated = false;
			View.showMessage(getMessage("selectRoomAndTimeError"));
		}
		return validated;
	},
	
	/**
     * Called from the confirmation dialog to determine the id of the primary room.
     * 
     * @return resource id for the primary room
     */
    determinePrimaryRoomId: function() {
        var primaryRoomId = this.primaryRoomIdentifier;
        if (primaryRoomId == null || this.reservedRooms[primaryRoomId] == null) {
            /* The previous primary room is no longer selected. Return the first selected
             * room on the time line instead.
             */
            var timeline = this.roomTimelineController.getTimeline();
            for (var i = 0; i < timeline.resources.length; ++i) {
                var resourceId = timeline.resources[i].resourceId;
                if (this.reservedRooms[resourceId] != null) {
                    primaryRoomId = resourceId;
                    break;
                }
            }
        }
        return primaryRoomId;
    },
	
	/**
     * Called from the confirmation dialog to determine the selected rooms.
     * 
     * @return array of room allocation data records
     */
    getSelectedRoomRecords: function() {
        var primaryRoomId = this.determinePrimaryRoomId();
        var selectedRooms = [];
        
        // The primary room is always the first.
        selectedRooms.push(this.reservedRooms[primaryRoomId]);
        
        // Add the other rooms.
        var timeline = this.roomTimelineController.getTimeline();
        for (var i = 0; i < timeline.resources.length; ++i) {
            var resourceId = timeline.resources[i].resourceId;
            var reservedRoom = this.reservedRooms[resourceId];
            if (reservedRoom != null && resourceId != primaryRoomId) {
                selectedRooms.push(reservedRoom);
            }
        }
        return selectedRooms;
    },
    
    /**
     * This method is executed when the user paints a new event by Drag&Drop
     *
     * @param {Object} event
     */
    roomTimeline_onTimelineDragNew: function(event) {
    	this.deleteLastUnactiveEvents();
    	var newResource = event.resource;
        // Tick the checkBox of the selected room on screen and in the model.
        this.getRoomTimelineCellContent(event.row, 0).checked = true;
        newResource.selectRoom = "true";
        this.createNewRoomRecord(newResource);

        event.dateTimeStart = event.timeline.getColumnDateTime(event.getStart());
        event.dateTimeEnd = event.timeline.getColumnDateTime(event.getEnd() + 1);
        event.isNewEvent = true;
        
        // update the other panels
        this.updatePanels(event);
        this.handleRadioButtons();
        return true;
    },
    
    /**
     * Create a new room record for a time line resource, if no such record exists.
     * @param {Object} time line resource object 
     */
    createNewRoomRecord: function(resource) {
        // Add the room to the reserved rooms
        if (this.reservedRooms[resource.resourceId] == null) {
            var record = this.removedRooms[resource.resourceId]; 
            if (record == null) {
                record = new Ab.data.Record({
                    'reserve_rm.res_id' : "",
                    'reserve_rm.rmres_id' : "",
                    'reserve_rm.bl_id' : resource.buildingId,
                    'reserve_rm.fl_id' : resource.floorId,
                    'reserve_rm.rm_id' : resource.roomId,
                    'reserve_rm.config_id' : resource.configId,
                    'reserve_rm.rm_arrange_type_id' : resource.arrangeTypeId,
                    'reserve_rm.attendees_in_room' : this.consolePanel.getFieldValue("rm_arrange.max_capacity"),
                    'reserve_rm.comments' : ""
                    }, true);
            } else {
                // remove the record from the removedRooms
                delete this.removedRooms[resource.resourceId];
                // update the attendees_in_room value
                record.setValue("reserve_rm.attendees_in_room", 
                        this.consolePanel.getFieldValue("rm_arrange.max_capacity"));
            }
            this.reservedRooms[resource.resourceId] = record;
        }
        
        // if this is the first new room record, remember it
        if (this.primaryRoomIdentifier == null) {
            this.primaryRoomIdentifier = resource.resourceId;
        }
    },
	
	/**
	 * Update the selection of rooms on the rooms timeline.
	 * This adds all events except the one specified by the event parameter.
	 * @param {Object} event that triggered the update
	 * @param {boolean} indicates whether the time line is being completely reloaded
	 */
    updateRoomsTimeline: function(event, isReload) {
        var newResourceId = "";
        if (event.isNewEvent) {
            newResourceId = event.resource.resourceId;
        }
        var startTime = this.getTimeStart();
        var endTime = this.getTimeEnd();
        
        var timeline = this.roomTimelineController.getTimeline();
        var minorSegments = timeline.minorToMajorRatio;
        var timelineStartTime = timeline.getTimemark(0).getDateTime();
        var maxTimemarksColumn = timeline.getColumnNumber();
        
        // Create new events on the time line for the new time period and all selected rooms.
        for (var i = 0; i < timeline.resources.length; i++) {
            var resource = timeline.resources[i];	
            var resourceId = resource.resourceId;
            if (resourceId != newResourceId && this.reservedRooms[resourceId] != null) {
                // timeslot column index for resource start and end times
                var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);
                var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true) - 1;
                var resourceCheckBox = this.getRoomTimelineCellContent(i, 0);
                
                // if the resource reservation is within the limits of the resource
                // compare the start with the end of the resource
                if (this.withinDayLimits(resource, columnStart, columnEnd) 
                        && (newResourceId == "" || this.isDifferentRoom(resource, event.resource))) {
                    
                    // check if the timeslot is available
                    var timeslotAvailable = timeline.allTimeslotsAvailable(resource.row, 
                            columnStart - resource.getPreBlockTimeslots(), 
                            columnEnd + resource.getPostBlockTimeslots(),
                            this.checkConflictsDetected());
                    
                    if (timeslotAvailable) { 
                        // Create new event for the resource and make it editable 
                        var newEvent = new Ab.timeline.Event(null, resource.row, columnStart, columnEnd, true, timeline);
                        
                        newEvent.canEdit = true;
                        newEvent.canDelete = true;
                        newEvent.dateTimeStart = startTime;
                        newEvent.dateTimeEnd = endTime;
                        
                        resource.timeStart = startTime;
                        resource.timeEnd = endTime;
                        
                        timeline.addEvent(newEvent);
                        
                        // checked is true
                        resourceCheckBox.checked = true;
                        resource.selectRoom = "true";
                        
                        // only explicitly refresh the row if the time line is not being reloaded
                        if (!isReload) {
                            this.roomTimelineController.refreshTimelineRow(i);
                        }
                        
                    } else {
                        // remove from reserved rooms
                        this.removedRooms[resourceId] = this.reservedRooms[resourceId];
                        delete this.reservedRooms[resourceId];
                        resourceCheckBox.checked = false;
                    } // end if allTimeSlotsAvailable
                } else {
                    // remove from reserved rooms
                    this.removedRooms[resourceId] = this.reservedRooms[resourceId];
                    delete this.reservedRooms[resourceId];
                    resourceCheckBox.checked = false;
                }// end if within day limits
            } // end if checked
        }
        this.toggleRoomsNotification();
    },
    
    /**
     * Verify whether two time line resources represent different rooms.
     * This comparison ignores the arrangement type, so the user cannot select
     * the same room configuration twice using different arrangement types.
     */
    isDifferentRoom: function(resource1, resource2) {
        return resource1.buildingId != resource2.buildingId 
                || resource1.floorId != resource2.floorId
                || resource1.roomId != resource2.roomId 
                || (resource1.configId != resource2.configId 
                        && resource1.excludedConfigs.indexOf("'" + resource2.configId + "'") == -1);
    },
    
    /**
     * This method is executed when the user modifies an event by Drag&Drop
     *
     * @param {Object} event
     * @param {int} startColumn
     * @param {int} endColumn
     */
    roomTimeline_onChangeEvent: function(event, startColumn, endColumn) {
        this.deleteLastUnactiveEvents();
        event.dateTimeStart = event.timeline.getColumnDateTime(startColumn);
        event.dateTimeEnd = event.timeline.getColumnDateTime(endColumn + 1);
        event.isNewEvent = false;
        // update the other panels
        this.updatePanels(event);
        
        return true;
    },
    
    /**
     * Open a popup to edit the room reservation linked to the provided event.
     * @param {Object} rooms time line event
     */
    editRoomReservation: function(event) {
        var roomRecord = this.reservedRooms[event.resource.resourceId];
        this.reserveRoomPanel.setRecord(roomRecord);
        
    	ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_start", event.dateTimeStart);
        ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_end", event.dateTimeEnd);
        var conflictsDetected = this.checkConflictsDetected();
        this.reserveRoomPanel.enableField("reserve_rm.time_start", !conflictsDetected);
        this.reserveRoomPanel.enableField("reserve_rm.time_end", !conflictsDetected);
        
    	this.reserveRoomPanel.showInWindow({
    		width: 450, 
    		height: 380, 
    		title: getMessage("editRoomReservation"),
    		closeButton: false
    	});
    },
	
	/**
	 * Get the number of conflicts detected for the currently selected rooms.
	 * @return {int} number of conflicts
	 */
	getConflictCountForSelectedRoom: function() {
	    var numberOfConflicts = 0;
	    var events = this.roomTimelineController.getPendingEvents();
		if (events != null) {
		    for (var i = 0; i < events.length; ++i) {
		        numberOfConflicts += this.getNumberOfConflictsInResource(events[i].resource);
		    }
		}
		return numberOfConflicts;
	},
    
    /**
     * Delete previous event if it was created
     */
    deleteLastUnactiveEvents: function(timelineController) {
    	if (timelineController == undefined) {
    		// if not specified, clean all timelines
    		this.deleteLastUnactiveEvents(this.roomTimelineController);
    		this.deleteLastUnactiveEvents(this.attendeeTimelineController);
    	} else {
    		// check for empty timeline
    		if (timelineController.getResources() == null) return;
    		// remove all pending events
    		var newEvents = timelineController.getPendingEvents();
    		if (newEvents.length > 0) {
    			timelineController.removeEvents(newEvents);
    		}
    		
    		if (timelineController == this.roomTimelineController) {
        		// make sure none of the rooms are selected
				var resources = timelineController.getResources();
			    for (var i = 0; i < resources.length; ++i) {
					resources[i].selectRoom = "false";
				}
    		}
    	}
    },
    
    /**
     * Update the panels.
     */
    updatePanels: function(event) {
    	try {
	    	this.updateReservePanel(event); 
	    	this.updateConsolePanel(event);
	    	this.updateRoomsTimeline(event);
	    	this.updateAttendeeTimelinePanel(event);
        } catch (e) {
			Workflow.handleError(e);
        }
    },
    
    /**
     * Update the (hidden) reservation panel after selecting a room on the timeline.
     */
    updateReservePanel: function(event) {          
         if (this.reservePanel != undefined && event != null) {
        	 this.reservePanel.setFieldValue("reserve.time_start",  event.dateTimeStart);
        	 this.reservePanel.setFieldValue("reserve.time_end",  event.dateTimeEnd);    
             
        	 /*
        	  * Do not update the room in the reserveRoomPanel. The room currently displayed there
        	  * could be an other room in the conference call.
        	  */
        	 
             ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_start", event.dateTimeStart);
             ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_end", event.dateTimeEnd);
         }	 
    },
    
    /**
     * Reload all timelines after navigating to a new date.
     */
	reloadTimelines: function() {
		this.openProgressBar(2, getMessage("loadingTimelines"));
		this.continueReloadTimelines.defer(this.DEFER_TIME, this);
	},
	
	continueReloadTimelines: function() {
		try {
			// 1 step
	    	this.loadRoomTimeline();
	    	// 1 step
	        this.loadAttendeeTimeline();
		} catch (e) {
			Workflow.handleError(e);
		} finally {
			this.closeProgressBar();
		}
	},
	
	/**
	 * Update the start date in the panels based on the cached value.
	 */
	updatePanelStartDate: function() {
		this.reservePanel.setFieldValue("reserve.date_start", this.startDate);
		this.reserveRoomPanel.setFieldValue("reserve_rm.date_start", this.startDate);
	},
	
    /**
     * Create the room timeline control instance.
     */
	createRoomTimeline: function() {
    	// create the timeline object
	    this.roomTimelineController = new Ab.timeline.TimelineController(this.roomTimelineId, true);
	    
	    // register event handlers
	    var clickEventFunction = this.roomTimeline_onClickEvent.createDelegate(this);
	    var timeLineCreateFunction = this.roomTimeline_onTimelineDragNew.createDelegate(this);
	    var timeLineChangeFunction =  this.roomTimeline_onChangeEvent.createDelegate(this);
	    
		this.roomTimelineController.addOnClickEvent( clickEventFunction );
		this.roomTimelineController.addOnCreateEvent( timeLineCreateFunction );
		this.roomTimelineController.addOnChangeEvent( timeLineChangeFunction );
	
		// Add custom tooltip handler, to include room id,etc.
		this.roomTimelineController.addOnShowTimeslotTooltip(this.roomTimeline_onShowTimeslotTooltip.createDelegate(this));
		this.roomTimelineController.addOnShowEventTooltip(this.roomTimeline_onShowEventTooltip.createDelegate(this));	

		// configure the columns
 		this.roomTimelineController.addColumn('selectRoom', '', 'checkbox', this.onSelectRoom.createDelegate(this), null, null, '2%');		
		this.roomTimelineController.addColumn('name', getMessage("room"), 'link', this.viewRoomDetails.createDelegate(this), getMessage('info')); 
		this.roomTimelineController.addColumn('configId', getMessage("config"), 'text');
		this.roomTimelineController.addColumn('numberOfConflicts', getMessage("conflicts"), 'text');

        var viewController = this;
        this.roomTimelinePanel.addEventListener('afterSetCollapsed', function(panel) {
            if (!panel.collapsed) {
                viewController.roomTimelineController.refreshTimelineUI();
            }
            if (viewController.attendeeTimelineController && !viewController.attendeeTimelinePanel.collapsed) {
            	viewController.attendeeTimelineController.updateTimelinePosition();
            }
        });
        
        this.roomTimelineController.addBeforeAddRowEvents(function(row) {
            viewController.createBlockoutPeriodsForRow(row);
        });
    },
    
    /**
     * Get the location filter.
     */
    getLocationFilter: function() {
        var buildingIds = [];
        for (var i = 2; i < 5; ++i) {
            var buildingId = this.consolePanel.getFieldValue("bl_id" + i);
            if (buildingId != "") {
                buildingIds.push(buildingId);
            }
        }
        var valuesArray = this.consolePanel.getFieldMultipleValues("bl_id5");
        for (var i = 0; i < valuesArray.length; ++i) {
            buildingId = valuesArray[i];
            if (buildingId != "") {
                buildingIds.push(buildingId);
            }
        }
        
        // remember the time zone id used for loading the time lines
        this.timeZoneId = this.consolePanel.getFieldValue("afm_timezones.timezone_id");
        
        return {
            bl_id : this.getSelectedBuilding(),
            conference_bl_ids : buildingIds,
            timezone_id : this.timeZoneId
        };
    },
    
    /**
     * Called when the user clicks on a check box button of the timeline.
     *
     * @param {Object} e the time line resource
     * @param {Object} button the radio button
     */
	onSelectRoom: function(e) {
	    var radioButton = this.getRoomTimelineCellContent(e.row, 0);
	    if (radioButton.checked) {
	        this.onCheckRoomCheckbox(e);
	    } else {
	        this.onUnCheckRoomCheckbox(e);
	    }
	},
	
	/**
	 * Handle a room checkbox unchecked by the user.
	 */
	onUnCheckRoomCheckbox: function(e) {
        // Delete previous events on the room timeline
        this.deleteLastUnactiveEvents(this.roomTimelineController);
        delete this.reservedRooms[e.resourceId];
        
        var empty = true;
        for (var reservedRoom in this.reservedRooms) {
            empty = false;
            break;
        }
        
	    if (empty) {
	        // Delete previous events on attendee time line.
	        this.deleteLastUnactiveEvents(this.attendeeTimelineController);
	    } else {
    	    this.updateRoomsTimeline(e);
	    }
	},
	
	/**
	 * Handle a room checkbox checked by the user.
	 * @param {Object} e the resource that was checked
	 */
	onCheckRoomCheckbox: function(e) {
		// always take the reservation date
		var timeStart = this.getTimeStart();
        var timeEnd = this.getTimeEnd();
        
        if ((timeStart == "") || (timeEnd == "")) {
            View.showMessage(getMessage("selectRoomAndTimeError"));
            var radioButton = this.getRoomTimelineCellContent(e.row, 0);
			radioButton.checked = false;
            return;
        }
        
        var timeline = this.roomTimelineController.getTimeline();
        
        var minorSegments = timeline.minorToMajorRatio;
        var timelineStartTime = timeline.getTimemark(0).getDateTime();
        var maxTimemarksColumn = timeline.getColumnNumber();
        
        // Timeslot column index for reservation start and end time, the time is second number
        var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, maxTimemarksColumn, false);
        var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, maxTimemarksColumn, true) - 1;
        
        // if the column start or column end is not available, pop up warning.
        if (!this.withinDayLimits(e, columnStart, columnEnd)) {
            View.showMessage(getMessage("timeSelectedNotAvailable"));
            var radioButton = this.getRoomTimelineCellContent(e.row, 0);
			radioButton.checked = false;
            return;
        }
        
        // Check whether the requested time period is available for the room arrangement.
        var eventTimeslotsAvailable = timeline.allTimeslotsAvailable(e.row, columnStart - e.getPreBlockTimeslots(), 
        		columnEnd + e.getPostBlockTimeslots(), this.checkConflictsDetected());
        if (!eventTimeslotsAvailable) {
            View.showMessage(getMessage("timeSelectedNotAvailable"));
            var radioButton = this.getRoomTimelineCellContent(e.row, 0);
			radioButton.checked = false;
            return;
        }
        
        // Delete previous events
        this.deleteLastUnactiveEvents();
        
        // Create new event
        this.newEvent = new Ab.timeline.Event(null, e.row, columnStart, columnEnd, true, timeline);
        timeline.addEvent(this.newEvent);
        e.selectRoom = "true";
        this.createNewRoomRecord(e);
        
        this.newEvent.canEdit = true;
        this.newEvent.canDelete = true;
        this.newEvent.dateTimeStart = timeStart;
        this.newEvent.dateTimeEnd = timeEnd;
        this.newEvent.isNewEvent = true;
        
        this.roomTimelineController.refreshTimelineRow(this.newEvent.getRow());
        
        // update the room reservation panel, when selecting a different room         
        this.updatePanels(this.newEvent);
	},
	
	/**
     * Load the room timeline with current available room arrangements.
     */
    loadRoomTimeline: function() {     
        if (valueExists(this.roomTimelineData)) {
            this.roomTimelineController.clearRowBlocks();
        } 
            
        var reservationId = this.reservePanel.getFieldValue("reserve.res_id"); 
        
        if (reservationId == "") {
        	// make sure to clean up the cache for a new reservation
        	this.roomTimelineController.clear();        	 
        }
		
		var startDate = this.reservePanel.getFieldValue("reserve.date_start");
		var endDate = this.reservePanel.getFieldValue("reserve.date_end");	       
		
		if (startDate == "") {
        	// View.showMessage(getMessage("selectDateStart"));
        	return;         	
        }	        
		
		var startTime = this.consolePanel.getFieldValue("rm_arrange.day_start");
		var endTime = this.consolePanel.getFieldValue("rm_arrange.day_end");
		
		// when console filter times are selected, also update the reservation panels
		if (startTime != "") {
			this.reservePanel.setFieldValue("reserve.time_start", startTime);
			ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_start", startTime);
		}
		
        if (endTime != "") {
			this.reservePanel.setFieldValue("reserve.time_end", endTime);	
			ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_end", endTime);
        }
        
        // remember what time values were used for loading the time line
        this.filteredTimeStart = startTime;
        this.filteredTimeEnd = endTime;
          
        // get the search parameter from the console filter
        var searchFilter = this.getLocationFilter();
        searchFilter.rm_arrange_type_id = this.consolePanel.getFieldValue("rm_arrange.rm_arrange_type_id");   
        
        // check number of attendees and capacity
        searchFilter.number_attendees = this.consolePanel.getFieldValue("rm_arrange.max_capacity");
        searchFilter.external_allowed = this.allowExternalGuests ? "1" : "0"; 
        
        // get recurrence pattern
        var recurrenceRule = this.reservePanel.getFieldValue("reserve.recurring_rule");
        // if editing a single instance of a series
        if (reservationId != "" && !this.editRecurring) {
        	recurrenceRule = "";
        }
        
        // if no recurrence look at just one day
        if (recurrenceRule == "") {
        	endDate = startDate;
        }
        searchFilter.recurrence_rule = recurrenceRule;
        
        var result = Workflow.callMethod('AbWorkplaceReservations-reservationTimelineService-loadRoomArrangementTimeLine', 
			startDate, endDate, startTime, endTime, searchFilter, 
			this.selectedFixedResourceStandards, parseInt(reservationId));
    	
		if (result.code != 'executed') {
            View.showMessage(result.message);
            return;
        }
	
		this.roomTimelineController.clearRowBlocks();
		
		// The time line is editable if there are no resources or if the resources do not have conflicts.
		this.roomTimelineController.isEditable = this.isRoomTimelineEditable(result);
        
        // Load the JSON data into the timeline
        this.roomTimelineController.loadTimelineModel(result.data);
        
		if (valueExists(this.roomTimelineController.timelineLayerDiv)) {
			this.roomTimelineController.timelineLayerDiv.scrollLeft = 0;
		}
		
		this.roomTimelineController.show();
        
		this.checkReservedRoomsAvailable();
		this.updateRoomsTimeline({isNewEvent: false}, true);
		this.roomTimelineData = this.roomTimelineController.getTimeline();
		
		// enable/disable radio buttons
        this.handleRadioButtons();
        this.toggleRoomConflictsNotification();
        
		this.updateProgressBar();
	},
	
    /**
     * Check the rooms availability after reloading the time line,
     * moving all rooms no longer available to the map of removedRooms.
     */
    checkReservedRoomsAvailable: function() {
        var timeline = this.roomTimelineController.getTimeline();
        
        // create a map of the available room ids
        var resourceIds = {};
        for (var i = 0; i < timeline.resources.length; ++i) {
            resourceIds[timeline.resources[i].resourceId] = 1;
        }
        
        // for each room in the map of reserved rooms, check if it's still being showed
        for (var reservedRoomId in this.reservedRooms) {
            if (resourceIds[reservedRoomId] == null) {
                this.removedRooms[reservedRoomId] = this.reservedRooms[reservedRoomId];
                delete this.reservedRooms[reservedRoomId];
            }
        }
    },
	
	/**
	 * Create a row's blockout period if required.
	 * 
	 * @param {int} row index
	 */
	createBlockoutPeriodsForRow: function(rowIndex) {
	    var timeline = this.roomTimelineController.getTimeline();
	    var resource = timeline.resources[rowIndex];
	    if (resource.columnBlockoutFrom != undefined && resource.columnBlockoutTo != undefined) {
            this.roomTimelineController.addRowBlock(resource.row, Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE, 
                    resource.columnBlockoutFrom, resource.columnBlockoutTo - 1, true);
            var timeslots = timeline.getTimeslots(resource.row, resource.columnBlockoutFrom, resource.columnBlockoutTo - 1);
            timeline.setTimeslotsStatus(timeslots, Ab.timeline.Timeslot.STATUS_NOT_AVAILABLE);
            
            var preBlockEnd = resource.columnBlockoutTo + resource.preBlockTimeslots - 1;
            // don't let this preblock overlap with the end of availability
            if (preBlockEnd >= resource.columnAvailableTo) {
                preBlockEnd = resource.columnAvailableTo - 1;
            }
            this.roomTimelineController.addRowBlock(resource.row, Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK, 
                    resource.columnBlockoutTo, preBlockEnd, true);
            
            var postBlockStart = resource.columnBlockoutFrom - resource.postBlockTimeslots;
            // don't let this postblock overlap with the start of availability
            if (postBlockStart <= resource.columnAvailableFrom) {
                postBlockStart = resource.columnAvailableFrom;
            }
            this.roomTimelineController.addRowBlock(resource.row, Ab.timeline.Timeslot.STATUS_FUTURE_BLOCK, 
                    postBlockStart, resource.columnBlockoutFrom - 1, false);
        }  
	},
    
    /**
     * Create the related events to timeline according to an existing room reservation.
     *
     * @param {Object} resourceId
     * @param {Object} timeStart
     * @param {Object} timeEnd
     * 
     */
    createRoomTimelineEvent: function(resourceId, timeStart, timeEnd) {
            
        var timeline = this.roomTimelineController.getTimeline();
        
        var indexResource = -1;
        var resource;
        
        //Search the row of the resource to generate the event
        for (var i = 0; i < timeline.resources.length; i++) {
            resource = timeline.getResource(i);
            
            if (resource.getResourceId() == resourceId) {
                indexResource = i;
                break;
            }
        }
        
        if ((timeStart != '') && (timeEnd != '') && (indexResource != -1)) {
        	var radioButton = resource.grid.cells[indexResource][0].firstChild;
            radioButton.checked = false;
        
            var minorSegments = timeline.minorToMajorRatio;
            var timelineStartTime = timeline.getTimemark(0).getDateTime();
            var maxTimemarksColumn = timeline.getColumnNumber();
            
            //timeslot column index for first and last slot in reservation time frame
            var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, maxTimemarksColumn, false);
            var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, maxTimemarksColumn, true) - 1;
         
            if (this.withinDayLimits(resource, columnStart, columnEnd)) {
                var timeslotAvailable = timeline.allTimeslotsAvailable(resource.row, 
                        columnStart - resource.getPreBlockTimeslots(),
                        columnEnd + resource.getPostBlockTimeslots());
                
                if (timeslotAvailable) {
                    // Delete previous event if it was created
                    this.deleteLastUnactiveEvents();
                    
                    // Create new event
                    this.newEvent = new Ab.timeline.Event(null, resource.row, columnStart, columnEnd, true, timeline); 
                    
                    this.newEvent.canEdit = true;
                    this.newEvent.canDelete = true;
                    this.newEvent.dateTimeStart = timeStart;
                    this.newEvent.dateTimeEnd = timeEnd;
                    
                    timeline.addEvent(this.newEvent);  
                    
                    // set the radio button checked
                    radioButton.checked = true;
                    resource.selectRoom = "true";
                }
            }
        }
    },
    
	getSelectedBuilding: function() {
		var buildingId = this.consolePanel.getFieldValue("rm_arrange.bl_id");
		
		if (buildingId == "") {
		    /*
		     * If the user cleared the first building id field, enter the id
		     * currently stored in the reserveRoomPanel. This could also be empty.
		     */
		    buildingId =  this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id");
		    this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
		}
		
		return buildingId;
	},
	
   /**
     * Show or hide the instructions shown on the rooms panel to indicate the
     * selection has been changed.
     */
    toggleRoomsNotification: function() {
        var action = this.roomTimelinePanel.actions.get('roomSelectionChanged');
        var idsConcatenated = "";
        for (var removedRoomId in this.removedRooms) {
            var removedRoom = this.removedRooms[removedRoomId];
            idsConcatenated += "<br/>" + removedRoom.getValue("reserve_rm.bl_id") 
                + "-" + removedRoom.getValue("reserve_rm.fl_id")
                + "-" + removedRoom.getValue("reserve_rm.rm_id")
                + "-" + removedRoom.getValue("reserve_rm.config_id")
                + "-" + removedRoom.getValue("reserve_rm.rm_arrange_type_id");
        }
        
        // Ignore show parameter, always show if this.removedRooms is not empty.
        if (idsConcatenated == "") {
            action.show(false);
        } else {
            action.setTooltip(getMessage("tooltipRoomSelectionChanged").replace("{0}", 
                    idsConcatenated));
            action.show(true);
        }
    },
	
	/**
	 * update the room block on the timeline.
	 */
	reserveRoomPanel_onSave: function() {
		var roomRecord = this.reserveRoomPanel.getOutboundRecord();
		
		// get the correct pending event
        var resourceId = this.compileRoomIdentifier();
        var newEvents = this.roomTimelineController.getPendingEvents();
        var event = null;
        for (var i = 0; i < newEvents.length; ++i) {
            if (newEvents[i].resource.resourceId == resourceId) {
                event = newEvents[i];
                break;
            }
        }
        if (event == null) {
            View.showMessage(getMessage("roomNotSelected"));
            this.reserveRoomPanel.closeWindow();
            return;
        }
        // Save modified comments and number of attendees. Times in the record will be ignored.
        this.reservedRooms[resourceId] = roomRecord;
		
		var startTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_start");
		var endTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_end");
		
		// check required fields
		if (startTime == "" || endTime == "") {
			View.showMessage(getMessage("selectTimeError"));
	    	return;
		}
	    
	    // Stop processing if the times where not modified.
	    if (event.dateTimeStart == this.formatTime(startTime) && event.dateTimeEnd == this.formatTime(endTime)) {
			// close the popup window
			this.reserveRoomPanel.closeWindow();
	    	return;
	    }
	    
	    var timeline = this.roomTimelineController.getTimeline(); // event.timeline
        
        var minorSegments = timeline.minorToMajorRatio;
        var timelineStartTime = timeline.getTimemark(0).getDateTime();
        var maxTimemarksColumn = timeline.getColumnNumber();        
	    
	    var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);    
	    var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true) - 1;  
	    // check if the end date is after start date
	    if (columnEnd <= columnStart) {
	    	View.showMessage(getMessage("selectTimeError"));
	    	return;
	    }
	    
	    var columnAvailableFrom = event.resource.columnAvailableFrom + event.resource.getPreBlockTimeslots();
	    var columnAvailableTo = event.resource.columnAvailableTo - event.resource.getPostBlockTimeslots();
   
	    // check if the dates are in limits of the day start and end of the room arrangement
	    if (columnStart < columnAvailableFrom || columnEnd > columnAvailableTo) {
	    	View.showMessage(getMessage("timeSelectedNotAvailable"));
	    	return;
	    }
		
	    // check if the room is available for the new time period
	    if (timeline.canModifyEvent(event, columnStart, columnEnd, false)) {
	        // Delete previous events
	        this.deleteLastUnactiveEvents();
	        
	    	// update the event start and end time 
			event.dateTimeStart = startTime;
			event.dateTimeEnd = endTime;
			event.isNewEvent = false;
			
			// update all other panels
			this.updatePanels(event);
			
			// close the popup window
			this.reserveRoomPanel.closeWindow();
			
	    } else {
	    	View.showMessage(getMessage("timeSelectedNotAvailable"));
	    	return;
	    } // end if 
	}
	
});
