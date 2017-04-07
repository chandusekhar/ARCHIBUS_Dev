
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Room Reservation base controller.
* The controller extends the reservation base controller.
* <p>
* Controller is used as an extension point for controllers used to create or edit a room reservation.
* <p>
*
* @author Yorik Gerlo
* @since 21.3
*/
var roomReservationBaseController = reservationBaseController.extend({
	
	findEquipmentAndServicesWfr: "AbWorkplaceReservations-resourceFinderService-findAvailableReservableResourcesForRoom",
	findCateringWfr: "AbWorkplaceReservations-resourceFinderService-findAvailableCateringResourcesForRoom",
	
	consoleStartTimeField: "rm_arrange.day_start",
	consoleEndTimeField: "rm_arrange.day_end", 
	 	
	roomTimelineId: "roomTimeline",	
	attendeeTimelineId: "attendeeTimeline",
	
	roomTimelineController: null,
	attendeeTimelineController: null,
	
	roomTimelineData: null,
    
    // array of selected attendees
    selectedAttendees: [],
    
    resourceStandardsIdPrefix: "resource_std_",
    fixedResourceStandards: [],
    selectedFixedResourceStandards: [],
    
    allowExternalGuests: false, 
    
    // folder for icons
    folder : "/archibus/schema/ab-products/workplace/reservations/view/reserve/room/",
    
    reservationDetailsView: "ab-rr-reserve-rm-details.axvw",
    
    // time frame used for loading time line
    filteredTimeStart: "",
    filteredTimeEnd: "",
 	
 	/**
 	 * The reservation panel is refreshed and triggers the reservation room panel.
 	 */
 	reservePanel_afterRefresh: function() {
 		this.reservePanel.show(false);
 		if (View.restriction != null) { 
		   	this.reserveRoomPanel.refresh(View.restriction);
	   	} else {    
		   	this.reserveRoomPanel.refresh("reserve.res_id=0");
	   	}	 		
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
   		this.selectedResources = [];
   		this.reservedResources = {};
	   	
	   	// check if this is new reservation
	   	if (reservationId != "") { 
	   		this.loadSelectedAttendees(); 
	   		this.loadReservedResources(reservationId);
	   	}
		this.loadSelectedCaterings(reservationId);
		this.loadRecurrenceDetails(reservationId);
 	},
 	
 	/**
 	 * load selected attendees when editing.
 	 */
 	loadSelectedAttendees: function() {
 		var savedAttendees = this.reservePanel.getFieldValue("reserve.attendees");
   		if (savedAttendees != null && savedAttendees != "") {
   			this.selectedAttendees = savedAttendees.split(";");
   		}
 	},
 	
	/**
	 * Initialize the filter console with user specific default values.
	 * Add custom fields to the panels.
	 */
	initConsole: function() {
	 	// make sure the checkbox is unchecked
		$('externalGuests').checked = false;
		Ext.get('externalGuests').on("click", this.onSelectExternalGuests, this, true);
		
		// dynamically insert  a text field for attendee add and make it auto-complete
		this.insertAttendeeInputField();
	},
	 
	/**
	 * Update the console defaults based on existing reservation info or user info.
	 */
	updateConsoleDefaults: function() {
		this.createResourcesStandardsCheckboxes("selectRoomAttributes", "selectMoreRoomAttributes",
				this.resourceStandardsIdPrefix);
 		
		var buildingId = this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id"); 
		var floorId = this.reserveRoomPanel.getFieldValue("reserve_rm.fl_id"); 
		// when editing set the building 
		if (buildingId != "") {
			this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
			this.consolePanel.setFieldValue("rm_arrange.fl_id", floorId);
		} else {
			// take the user location for a new reservation
			buildingId = View.user.employee.space.buildingId
			this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
			this.reserveRoomPanel.setFieldValue("reserve_rm.bl_id", buildingId);
			this.consolePanel.setFieldValue("rm_arrange.fl_id", View.user.employee.space.floorId); 
		}
 		
		// set the room arrange type when editing
		var arrangeTypeId = this.reserveRoomPanel.getFieldValue("reserve_rm.rm_arrange_type_id");
		this.consolePanel.setFieldValue("rm_arrange.rm_arrange_type_id", arrangeTypeId);
		
		// set the capacity requirement to the number of attendees
		var attendeesInRoom = this.reserveRoomPanel.getFieldValue("reserve_rm.attendees_in_room");
		if (attendeesInRoom != "") {
			this.consolePanel.setFieldValue("rm_arrange.max_capacity", attendeesInRoom);
		}
		
		// set start and end time
		var startTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_start");
		var endTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_end");		
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_start", startTime);
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_end", endTime);
		
		this.modifyConsoleAfterLoading();
	},
	
	/**
	 * Called after loading the console defaults. To override.
	 */
	modifyConsoleAfterLoading: function() {
	    // no special action required
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
		// create and load the resource timeline 
		this.createResourceTimeline();   
	},  
	
	/**
	 * Create a custom input field in the panel header and make it auto-complete with email matching.
	 */
	insertAttendeeInputField: function() { 
		
		if ( $("addAttendee") != null) {
			
			var addButtonElementContainer = $("addAttendee").parentNode; 		
			var container = addButtonElementContainer.parentNode; 		
			var attendeeFieldContainer = document.createElement('td');
			
			container.insertBefore(attendeeFieldContainer, addButtonElementContainer); 
			
			var inputField = document.createElement("input"); 
			inputField.type = "text";
			inputField.size = "30";
			inputField.id = "attendeeField";
			// inputField.setAttribute("style", "width: 150px; float: left"); 			
			
			attendeeFieldContainer.appendChild(inputField);  
			
			// employee data source reference
			var ds = this.employeeDs; 
			
			jQuery( "#attendeeField" ).autocomplete({
				 source: function(request, response) {
					 // restriction on email address  
					 var restriction = new Ab.view.Restriction();
					 restriction.addClause("em.email",  "%"+request.term + "%", "LIKE");
					 // search for employees that match the email 
					 var records = ds.getRecords(restriction);
					 // get e-mail addresses 
					 var results = [];					 
					 for (var i=0; i< records.length; i++) {
						 results.push(records[i].getValue("em.email"));
					 } 
					 // add to result list
					 response(results);
				 },
				 
				 minLength: 2
			 });
			 
		}
	
	},  
	
	/**
     * Creates a number of checkbox controls for filtering on room attributes.
     * @param mainParentElement the parent element on the main console panel
     * @param moreParentElement the parent element on the More... popup
     * @param checkboxIdPrefix ID attribute prefix for checkbox HTML elements.
     */
    createResourcesStandardsCheckboxes: function(mainParentElement, moreParentElement, checkboxIdPrefix) {
        if (this.hasCreateResStdsCheckboxes) {
            return;
        }
        
        // get the resource standards that are fixed resources
        this.fixedResourceStandards = this.fixedResourceStandardDs.getRecords(); 
              
        var checkboxParent = $(mainParentElement);
        var DISPLAY_COUNT = 3;
        
        var i = 0;
        for (; i < this.fixedResourceStandards.length && i < DISPLAY_COUNT; ++i) {    
        	this.createResourceStandardCheckbox(this.fixedResourceStandards[i], checkboxParent, checkboxIdPrefix, "");
        }
        
       if (i < this.fixedResourceStandards.length) {
    	   var checkboxParent = $(moreParentElement);
    	   for (; i < this.fixedResourceStandards.length; ++i) {    
    		   this.createResourceStandardCheckbox(this.fixedResourceStandards[i], checkboxParent, checkboxIdPrefix, " ");
    		   checkboxParent.appendChild(document.createElement("br"));
           }
       } else {
    	   Ext.get("showMoreAttributes").hide();
       }
        
        // set the flag true
        this.hasCreateResStdsCheckboxes = true;
    },
    
    /**
     * Create a single checkbox control for the given resource standard in the given
     * parent element.
     * @param record the resource standard record
     * @param checkboxParent the parent element
     * @param checkboxIdPrefix ID attribute prefix for checkbox HTML elements.
     * @param textPrefix attribute name prefix for display
     */
    createResourceStandardCheckbox: function(record, checkboxParent, checkboxIdPrefix, textPrefix) {
    	// create the check box
        var checkbox = document.createElement("input");            
        checkbox.type = "checkbox";            
        checkbox.id = checkboxIdPrefix + record.getValue("resource_std.resource_std");
        checkbox.value = record.getValue("resource_std.resource_std");
        checkboxParent.appendChild(checkbox);
        // add some space 
        Ext.get(checkbox).setStyle("margin-left", "10px");
        
        // event handler on click
        Ext.get(checkbox).on('click', this.onCheckFixedResourceStandard, this, true);    
        // add to container
        checkboxParent.appendChild(document.createTextNode(textPrefix + record.getValue("resource_std.resource_name")));
    },
     
    /**
     * When clicking a fixed resource in the console.
     */
    onCheckFixedResourceStandard: function(e) {
	  	var resourceStandard = e.target.value;
	  	
	  	if (e.target.checked) {
	  		// add resource standard to list
	  		this.selectedFixedResourceStandards.push(resourceStandard);
	  	} else {
	  		// search the array
	  		var index = this.selectedFixedResourceStandards.indexOf(resourceStandard);
	  		// remove resource standard to list
	  		if (index >= 0) {
	  			this.selectedFixedResourceStandards.splice(index, 1);
	  		}  		
	  	}
	},
	
	/**
	 * When clicking the external guests in the console.
	 */
	onSelectExternalGuests: function(e) {
		this.allowExternalGuests = e.target.checked;	
	},

	/**
	 * When clicking the apply filter.
	 */
	consolePanel_onApplyFilter: function() {
		// save the previous building id for later
		var buildingId = this.consolePanel.getFieldValue("rm_arrange.bl_id");
		if (buildingId != "" && this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id") != buildingId) {
			this.reserveRoomPanel.setFieldValue("reserve_rm.bl_id", buildingId);
			this.reserveRoomPanel.setFieldValue("reserve_rm.fl_id", "");
			this.reserveRoomPanel.setFieldValue("reserve_rm.rm_id", "");
		}
		
		this.reloadTimelines();
	},
	
	/**
	 * When clicking the clear filter.
	 */
	consolePanel_onClearFilter: function() {
		this.consolePanel.setFieldValue("rm_arrange.rm_arrange_type_id", "");
		this.consolePanel.setFieldValue("rm_arrange.max_capacity", 5);
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_start", "");
		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_end", "");
		this.consolePanel.setFieldValue("rm_arrange.fl_id", "");
		this.consolePanel.setFieldValue("rm_arrange.rm_id", "");
		
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
	
	consolePanel_onShowMoreAttributes: function() {
		// show in popup
		this.moreAttributesPanel.show(true);  
		this.moreAttributesPanel.showInWindow({
			width: 250,
			height: 300,
			closeButton: true,
			anchor: "showMoreAttributes",
			title: getMessage("selectAttributes")});
	},
	
	/**
	 * Prepare for opening the confirmation dialog.
	 */
	prepareConfirm: function() {		
		this.reservePanel.setFieldValue("reserve.attendees", this.selectedAttendees.join(";"));
		
		// Verify that a room is selected.
		var validated = true;
		if (this.roomTimelineController.getPendingEvents().length == 0) {
			validated = false;
			View.showMessage(getMessage("selectRoomAndTimeError"));
		} else {
			var roomEvent = this.roomTimelineController.getPendingEvents()[0];

			/* Verify all equipment & services and catering setup and cleanup times remain
			 * within the room setup and cleanup times.
			 */
			
			// determine full room occupied time via column indexes
			var roomPreStart = roomEvent.getPreStart();
			var roomPostEnd = roomEvent.getPostEnd();
			
			var resourceEvents = this.resourceTimelineController.getPendingEvents();
			for (var i = 0; validated && i < resourceEvents.length; ++i) {
				var resourceEvent = resourceEvents[i];
				if (resourceEvent.getPreStart() < roomPreStart || roomPostEnd < resourceEvent.getPostEnd()) {
					validated = false;
					View.showMessage(getMessage("resourceBlocksOutsideRoom").replace("{0}", resourceEvent.resource.name));
				}
			}
			
			// determine full room occupied time as time values
			var reservationRecord = this.reservePanel.getRecord();
			var roomStart = reservationRecord.getValue("reserve.time_start");
			roomStart = new Date(roomStart.getTime() - parseInt(roomEvent.resource.preBlock) * 60000);
			var roomEnd = reservationRecord.getValue("reserve.time_end");
			roomEnd = new Date(roomEnd.getTime() + parseInt(roomEvent.resource.postBlock) * 60000);
			
			for (var i = 0; validated && i < this.reserveCateringPanel.rows.length; ++i) {
				// determine full resource occupied time as time values
				var resourceRow = this.reserveCateringPanel.gridRows.get(i);
				var startTime = resourceRow.getFieldValue("reserve_rs.time_start");
				var preBlock = resourceRow.getFieldValue("resources.pre_block");
				startTime = new Date(startTime.getTime() - parseInt(preBlock) * 60000);
				var endTime = resourceRow.getFieldValue("reserve_rs.time_end");
				var postBlock = resourceRow.getFieldValue("resources.post_block");
				endTime = new Date(endTime.getTime() + parseInt(postBlock) * 60000);
				
				if (startTime < roomStart || endTime > roomEnd) {
					validated = false;
					View.showMessage(getMessage("resourceBlocksOutsideRoom").replace("{0}", resourceRow.getFieldValue("resources.resource_name")));
				}
			}
		}
		
		return validated;
	},
	
	validateEmail: function(email) {
		var containsAt = (email != "" && email.indexOf("@") > 0 && email.indexOf("@") != email.length - 1);
		var pattern = /^[A-Za-z0-9!#$%&'*+-/=?^_`{|}~ "(),:;<>@\[\\\]]+$/;
		return containsAt && pattern.test(email);
	},
	
    /**
     * Add attendee to timeline.
     */
    attendeeTimelinePanel_onAddAttendee: function() {
    	var email = $("attendeeField").value;
		$("attendeeField").value = "";
		
    	if (this.validateEmail(email)) {
    		if (this.selectedAttendees.indexOf(email) < 0) {
	    		this.selectedAttendees.push(email);
	    		
	    		this.reloadAttendeeTimeline();
    		}
		} else {
			View.showMessage(getMessage("enterValidEmail").replace("{0}", email));
		}
    },
    
    /**
     * Open dialog to invite attendees
     */
    attendeeTimelinePanel_onSelectAttendees: function() {
    	View.openDialog("ab-rr-add-attendees.axvw", null, false, {title: getMessage("inviteAttendees"), width: 800, height: 600});
    },
    
    /**
     * Removes an attendee from the timeline. 
     */
    attendeeTimelinePanel_onRemove: function(resource, e) {
    	var email = resource.email;    	 		
    	var index = this.selectedAttendees.indexOf(email);
	  	// remove attendee
	  	if (index >= 0) {    	
    		this.selectedAttendees.splice(index, 1); 
	  	}
	  	
	  	// reload timeline    		    		    	
    	this.reloadAttendeeTimeline();	    	
    },
    
    /**
     * called by the timeline to display custom tooltip for the timeslot
     *
     * @param {Object} timeslot
     */
    roomTimeline_onShowTimeslotTooltip: function(timeslot) {
        if (timeslot && timeslot.resource) {
            var labeltz = '';
            //If already have a row in the timeline showing the selected timezone time, add to the tooltip the time in this timezone
//            if (this.existTimelineTimezone == true) {
//                labeltz = '<tr><td class="value">' + this.timezonePanel.getFieldValue('afm_timezones.timezone_id') + ': ' + this.timeMarksTimezone[timeslot.getColumn()].dateTimeLabel + '</td></tr>';
//            }
            return {
                text: '<tr><td>' + timeslot.resource.name + ': '+ timeslot.resource.arrangeTypeId + '</td></tr>' + labeltz,
                override: false, // true to override default tooltip text, false to append
                cancel: false // true to cancel the tooltip display for this timeslot 
            }
        } else {
            return "";
        }
    },
     
    /**
     * Called by the timeline to display custom tooltip for the event.
     * Event parameter can be null or undefined if the tooltip is displayed for in-progress drag.
     *
     * @param {Object} event
     * @param {Object} eventStatus
     * @param {Object} timeslotStart
     * @param {Object} timeslotEnd
     */
    roomTimeline_onShowEventTooltip: function(event, eventStatus, timeslotStart, timeslotEnd) {
        return {
            text: '<tr><td class="label">' + getMessage("roomHTML") + ':</td><td class="value">' + timeslotStart.resource.name + '</td></tr>' +
            '<tr><td class="label">' + getMessage("roomArrangementHTML") + ':</td><td class="value">' +
            timeslotStart.resource.arrangeTypeId +
            '</td></tr>',
            override: false, // true to override default tooltip text, false to append
            cancel: false // true to cancel the tooltip display for this event
        }
    },
    
    /**
     * This method is executed when the user clicks in some timeslot of timeline
     *
     * @param {Object} e
     * @param {Object} event
     */
    roomTimeline_onClickEvent: function(e, event) {
        //Get first timeslot of the event the user clicked on
        var timeslot = event.getStartTimeslot();
        //Get a list of all events that reserve this timeslot
        var allEvents = event.timeline.getAllEventsForTimeslot(timeslot);
        
        // Select the first (earliest) event in the list
        event = allEvents[0];
        
        if (event.isNew() && event.eventId == null) {
            this.editRoomReservation(event);
        } else {
            // Create a restriction and open the room reservation details dialog
        	var restriction = new Ab.view.Restriction();
    		restriction.addClause("reserve_rm.rmres_id", "" + event.eventId);
            View.openDialog("ab-rr-reserve-rm-details.axvw", restriction, false, {title: getMessage("roomReservation")});
        }
    },
    
    /**
     * This method is executed when the user paints a new event by Drag&Drop
     *
     * @param {Object} event
     */
    roomTimeline_onTimelineDragNew: function(event) {
    	this.deleteLastUnactiveEvents();
        
        // Disable the enabled radiobuttons
        for (i = 0; i < event.timeline.resources.length; i++) {
           this.getRoomTimelineCellContent(i, 0).checked = false;
        }
        
        //Select the radioButton of the selected room on screen and in the model.
        this.getRoomTimelineCellContent(event.row, 0).checked = true;
        event.resource["selectRoom"] = "true";
        
        event.dateTimeStart = event.timeline.getColumnDateTime(event.getStart());
        event.dateTimeEnd = event.timeline.getColumnDateTime(event.getEnd() + 1);
        
        // update the other panels
        this.updatePanels(event);
        this.handleRadioButtons();
 
        return true;
    },
    
    /**
     * This method is executed when the user modify an event by Drag&Drop
     *
     * @param {Object} event
     * @param {Object} startColumn
     * @param {Object} endColumn
     */
    roomTimeline_onChangeEvent: function(event, startColumn, endColumn) {
        event.dateTimeStart = event.timeline.getColumnDateTime(startColumn);
        event.dateTimeEnd = event.timeline.getColumnDateTime(endColumn + 1); 
        // update the other panels
        this.updatePanels(event);
        
        return true;
    },
    
    editRoomReservation: function(event) {
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
     * enable/disable radio buttons in the timeline.
     */
    handleRadioButtons: function() {
		if (!valueExists(this.roomTimelineData)) {
			return;
		}
		
		// Enable the radio buttons for the rooms
		var disableRadioButtons = true;
		
		var timeStart = this.getTimeStart();
		var timeEnd = this.getTimeEnd();
		
		if (timeStart != '' && timeEnd != '') {
			disableRadioButtons = false;
		}
		
		// Disable the radio buttons for the rooms
		for (var i = 0; i < this.roomTimelineData.resources.length; i++) {
			var radioButton = this.getRoomTimelineCellContent(i, 0);
			radioButton.disabled = disableRadioButtons;
		}
	},
	
	/**
	 * Get the number of conflicts in the given timeline resource.
	 * Return 0 if no conflicts are defined.
	 */
	getNumberOfConflictsInResource: function(resource) {
		var count = 0;
		if (valueExists(resource.numberOfConflicts)) {
			count = parseInt(resource.numberOfConflicts);
		}
		return count;
	},
	
	/**
	 * Check whether conflicts are detected in the current time line data.
	 * @return true if conflicts are detected, false if not
	 */
	checkConflictsDetected: function() {
		return this.checkConflictsInData(this.roomTimelineData);
	},
	
	/**
	 * Check whether conflicts are detected in the given time line data.
     * @param data the room time line data
	 * @return true if conflicts are detected, false if not
	 */
	checkConflictsInData: function(data) {
		var conflictsDetected = false;
		if (valueExists(data) && data.resources.length > 0) {
			// check all resources for conflicts, it's not necessarily the first one
		    for (var i = 0; i < data.resources.length; ++i) {
    			if (this.getNumberOfConflictsInResource(data.resources[i]) > 0) {
    				conflictsDetected = true;
    				break;
    			}
		    }
		}
		return conflictsDetected;
	},
	
    /**
	 * Show or hide the instructions shown on the rooms time line panel to indicate conflicts.
	 * Check the current timeline content to determine whether conflicts are detected.
	 */
	toggleRoomConflictsNotification: function() {
		var conflictsDetected = this.checkConflictsDetected();
		this.roomTimelinePanel.actions.get('roomConflictsDetected').show(conflictsDetected);
		
		// KB 3052928 update position because panel toolbar height depends on action button
		this.roomTimelineController.updateTimelinePosition();
	},
	
	/**
	 * Get the number of conflicts detected for the currently selected room.
	 * @return {int} number of conflicts
	 */
	getConflictCountForSelectedRoom: function() {
		var numberOfConflicts = 0;
		var events = this.roomTimelineController.getPendingEvents();
		if (events != null && events.length > 0) {
	        numberOfConflicts = this.getNumberOfConflictsInResource(events[0].resource);
		}
		return numberOfConflicts;
	},
	
	/**
     * Returns child element of specified timeline cell.
     *
     * @param {Object} row -- 0-based data row index (header rows are not included).
     * @param {Object} column -- 0-based column index.
     */
    getRoomTimelineCellContent: function(row, column) {
        // 2D array of cell DOM elements, 1st index is row, 2nd index is column
        var dataCells = this.roomTimelineController.grid.cells;
        var td = dataCells[row][column];
        
        return td.firstChild;
    },
    
    /**
     * Delete previous event if it was created
     */
    deleteLastUnactiveEvents: function(timelineController) {
    	if (timelineController == undefined) {
    		// if not specified, clean all timelines
    		this.deleteLastUnactiveEvents(this.roomTimelineController);
    		if (this.attendeeTimelineController != undefined) {
                this.deleteLastUnactiveEvents(this.attendeeTimelineController);
            }
    		this.deleteLastUnactiveEvents(this.resourceTimelineController);
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
    		
    		if (timelineController == this.resourceTimelineController) {
        		// make sure none of the resources are selected
				var resources = timelineController.getResources();
			    for (var i = 0; i < resources.length; ++i) {
					 resources[i].selectResource = "false";
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
	    	this.updateAttendeeTimelinePanel(event);    	
	    	
	    	// check if reservable resources are available
	        this.updateResourceTimelinePanel(event);
	    	
	        // check if catering resources are available
        	this.updateCateringPanel();
        } catch (e) {
			Workflow.handleError(e);
        }
    },
    
    /**
     * Update the console panel.
     */
    updateConsolePanel: function(event) {
    	if (this.consolePanel != undefined && event != null) {
    		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_start", event.dateTimeStart);
    		ABRV_setFormattedTimeValue(this.consolePanel, "rm_arrange.day_end", event.dateTimeEnd);
    	}
    },
    
    /**
     * Update the (hidden) reservation panel after selecting a room on the timeline.
     */
    updateReservePanel: function(event) {          
         if (this.reservePanel != undefined && event != null) {
        	 this.reservePanel.setFieldValue("reserve.time_start",  event.dateTimeStart);
        	 this.reservePanel.setFieldValue("reserve.time_end",  event.dateTimeEnd);    
             
             this.reserveRoomPanel.setFieldValue("reserve_rm.bl_id", event.resource.buildingId);
             this.reserveRoomPanel.setFieldValue("reserve_rm.fl_id", event.resource.floorId);
             this.reserveRoomPanel.setFieldValue("reserve_rm.rm_id", event.resource.roomId);
             this.reserveRoomPanel.setFieldValue("reserve_rm.config_id", event.resource.configId);
             this.reserveRoomPanel.setFieldValue("reserve_rm.rm_arrange_type_id", event.resource.arrangeTypeId);
             
             ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_start", event.dateTimeStart);
             ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_end", event.dateTimeEnd);
         }	 
    }, 
    
    /**
     * Update the attendee timeline panel.
     */
    updateAttendeeTimelinePanel: function(event) {
    	if (this.attendeeTimelinePanel != undefined && event != null) { 
    		this.deleteLastUnactiveEvents(this.attendeeTimelineController);
    		this.createAttendeeTimelineEvents(event.dateTimeStart, event.dateTimeEnd);
    	}
    }, 
    
    /**
     * Update the resource timeline panel to the times specified in the event.
     */
    updateResourceTimelinePanel: function(event) {
    	if (this.resourceTimelinePanel != undefined && event != null) { 
    		this.deleteLastUnactiveEvents(this.resourceTimelineController);
    		
    		// move all resources to new time period    		
    		for (var resourceId in this.reservedResources) {
    			this.reservedResources[resourceId].startTime = event.dateTimeStart;
    			this.reservedResources[resourceId].endTime = event.dateTimeEnd;
    		}
    		
    		this.createResourceTimelineEvents();
    	}
    },
    
    /**
     * Reload all timelines after navigating to a new date.
     */
	reloadTimelines: function() {
		this.openProgressBar(4, getMessage("loadingTimelines"));
		this.continueReloadTimelines.defer(this.DEFER_TIME, this);
	},
	
	continueReloadTimelines: function() {
		try {
			// 1 step
	    	this.loadRoomTimeline();
	    	// 1 step
	        this.loadAttendeeTimeline();
	        // 2 steps
	        this.loadResourceTimeline(true);
	        // 0 steps
			this.updateCateringPanel();
	        
		} catch (e) {
			Workflow.handleError(e);
		} finally {
			this.closeProgressBar();
		}
	},
	
	/**
	 * Reload the attendee timeline with displaying a progress bar.
	 */
	reloadAttendeeTimeline: function() {
		this.openProgressBar(1, getMessage("loadingAttendeeTimeline"));
		this.continueReloadAttendeeTimeline.defer(this.DEFER_TIME, this);
	},
	
	continueReloadAttendeeTimeline: function() {
		// reload the attendee timeline with progress bar
		try {
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
 		this.roomTimelineController.addColumn('selectRoom', '', 'radiobutton', this.onSelectRoom.createDelegate(this), null, null, '2%');		
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
            if (viewController.resourceTimelineController && !viewController.resourceTimelinePanel.collapsed) {
            	viewController.resourceTimelineController.updateTimelinePosition();
            }
        });
    },
	
    /**
     * Create the attendee timeline control instance.
     */
    createAttendeeTimeline: function() {
		// create attendee timeline
		this.attendeeTimelineController = new Ab.timeline.TimelineController(this.attendeeTimelineId, true);
		this.attendeeTimelineController.addColumn('remove', '', 'image', this.attendeeTimelinePanel_onRemove.createDelegate(this), getMessage('remove'), this.folder + 'images/ab-rr-remove.gif', '2%');
		this.attendeeTimelineController.addColumn('email', getMessage("attendee"), 'link', this.viewAttendeeDetails.createDelegate(this), getMessage('info'));
		this.attendeeTimelineController.addColumn('placeholder', '', 'text');

        var viewController = this;
        this.attendeeTimelinePanel.addEventListener('afterSetCollapsed', function(panel) {
            if (!panel.collapsed) {
            	viewController.attendeeTimelineController.updateTimelinePosition();
                viewController.attendeeTimelineController.refreshTimelineUI();
            }
            if (viewController.resourceTimelineController && !viewController.resourceTimelinePanel.collapsed) {
            	viewController.resourceTimelineController.updateTimelinePosition();
            }
        });
    },
    
    /**
     * Called when the user clicks on the Select radio button of the timeline.
     *
     * @param {Object} e
     */
	onSelectRoom: function(e) {
        // Delete previous event if it was created
        this.deleteLastUnactiveEvents();
        
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
        
        // Create new event
        this.newEvent = new Ab.timeline.Event(null, e.row, columnStart, columnEnd, true, timeline);
        timeline.addEvent(this.newEvent);
        e.selectRoom = "true";
        
        this.newEvent.canEdit = true;
        this.newEvent.canDelete = true;
        this.newEvent.dateTimeStart = timeStart;
        this.newEvent.dateTimeEnd = timeEnd;
        
        this.roomTimelineController.refreshTimelineRow(this.newEvent.getRow());
        
        // update the room reservation panel, when selecting a different room         
        this.updatePanels(this.newEvent);
	},
	 
	/**
     * Show room details popup.
     * 
     * @param {Object} selectedRoom
     */
	viewRoomDetails: function(selectedRoom) {
		var restriction = new Ab.view.Restriction();
        restriction.addClause('rm_arrange.bl_id', selectedRoom.buildingId);
        restriction.addClause('rm_arrange.fl_id', selectedRoom.floorId);
        restriction.addClause('rm_arrange.rm_id', selectedRoom.roomId);
        restriction.addClause('rm_arrange.config_id', selectedRoom.configId);
        restriction.addClause('rm_arrange.rm_arrange_type_id', selectedRoom.arrangeTypeId);        
        
        View.openDialog("ab-rr-rm-arrange-details.axvw", restriction, false, {title: getMessage("roomInformation")});
	},
	
	/**
	 * Show attendee details popup.
	 * 
	 * @param {Object} selectedResource
	 */
	viewAttendeeDetails: function(selectedResource) {
		var resourceId = selectedResource.resourceId;  
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause("em.email", resourceId);
		
		View.openDialog("ab-rr-attendee-details.axvw", null, false, {email: resourceId, title: getMessage("attendeeDetails")});
	},
	
	/**
	 * Get the time line resource id for the room currently stored in the reserveRoomPanel.
	 * @return {string} resource id
	 */
	compileRoomIdentifier: function() {
        var buildingId = this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id");
        var floorId = this.reserveRoomPanel.getFieldValue("reserve_rm.fl_id");
        var roomId = this.reserveRoomPanel.getFieldValue("reserve_rm.rm_id");
        
        var configId = this.reserveRoomPanel.getFieldValue("reserve_rm.config_id");
        var arrangeTypeId = this.reserveRoomPanel.getFieldValue("reserve_rm.rm_arrange_type_id");
        
	    // full resource id based on room arrangement primary key
        var resourceId = "<record bl_id='" + buildingId 
                + "' fl_id='" + floorId 
                + "' rm_id='" + roomId 
                + "' config_id='" + configId 
                + "' rm_arrange_type_id='" + arrangeTypeId + "'/>";
        return resourceId;
	},
	
	/**
     * Indicates whether the room time line should be editable.
     * 
     * @param {Object} the WFR result that will be used to load the time line
     * @return {boolean} true if editable, false if read-only
     */
    isRoomTimelineEditable: function(result) {
        return (result.data.resources.length == 0) || !this.checkConflictsInData(result.data);
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
          
        // full resource id, when a room arrangement is selected
        var resourceId = this.compileRoomIdentifier();
         
        // advanced search
        var ctryId = this.consolePanel.getFieldValue("bl.ctry_id");
        var regnId = this.consolePanel.getFieldValue("bl.regn_id");
        var stateId =  this.consolePanel.getFieldValue("bl.state_id");
        var cityId =  this.consolePanel.getFieldValue("bl.city_id");
        var siteId = this.consolePanel.getFieldValue("bl.site_id");
        
        // get the search parameter from the console filter
        var buildingId = this.getSelectedBuilding();
        var floorId = this.consolePanel.getFieldValue("rm_arrange.fl_id");
        var roomId = this.consolePanel.getFieldValue("rm_arrange.rm_id");
        
        var arrangeTypeId = this.consolePanel.getFieldValue("rm_arrange.rm_arrange_type_id");   
        
        // check number of attendees and capacity        
        var numberOfAttendees = this.consolePanel.getFieldValue("rm_arrange.max_capacity");
        if (numberOfAttendees == "") {
        	// KB 3040094: make sure the numberOfAttendees is a string value
        	numberOfAttendees = "" + this.selectedAttendees.length;
        	this.consolePanel.setFieldValue("rm_arrange.max_capacity", numberOfAttendees); 
        }
        this.reserveRoomPanel.setFieldValue("reserve_rm.attendees_in_room", numberOfAttendees);
        
        var externalAllowed = this.allowExternalGuests ? "1" : "0"; 
        
        // get recurrence pattern
        var recurrenceRule = this.reservePanel.getFieldValue("reserve.recurring_rule");  
        // if editing a single instance of a serie
        if (reservationId != "" && !this.editRecurring) {
        	recurrenceRule = "";
        }
        // if no recurrence look at just one day
        if (recurrenceRule == "") {
        	endDate = startDate;     
        }
        
        var searchFilter = {
        		site_id : siteId,
        		bl_id : buildingId, fl_id : floorId, rm_id : roomId, 
        		rm_arrange_type_id : arrangeTypeId,
        		number_attendees : numberOfAttendees, 
        		external_allowed : externalAllowed,
        		recurrence_rule : recurrenceRule
        };
        
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
		
		if (resourceId != "<record bl_id='' fl_id='' rm_id='' config_id='' rm_arrange_type_id=''/>" 
				&& startTime != "" && endTime != "") {
			// create the event for active reservation
			this.createRoomTimelineEvent(resourceId, startTime, endTime);
		}
		
		this.roomTimelineData = this.roomTimelineController.getTimeline();
		
		// enable/disable radio buttons
        this.handleRadioButtons();
        this.toggleRoomConflictsNotification();
        //this.roomTimelineController.updateTimelinePosition();
        
		this.updateProgressBar();
	},
		
	/**
     * Load the attendee timeline with free/busy events from attendees.
     */
	loadAttendeeTimeline: function() {
		var uniqueId = this.reservePanel.getFieldValue("reserve.outlook_unique_id");
		// first fall back to conference id, then to reservation id
		if (uniqueId == '') {
            uniqueId = this.reservePanel.getFieldValue("reserve.res_conference");
        }
		if (uniqueId == '') {
			uniqueId = this.reservePanel.getFieldValue("reserve.res_id");
		}
		
		var reservationId = this.reservePanel.getFieldValue("reserve.res_id");
		
		var startDate = this.reservePanel.getFieldValue("reserve.date_start");
		
        var startTime = this.reservePanel.getFieldValue("reserve.time_start");
        var endTime = this.reservePanel.getFieldValue("reserve.time_end");
		
		if (this.selectedAttendees.length == 0) {
            // Even if there are no attendees, still create the timeline.
            // Otherwise if the user scrolls the whole view and then adds attendees,
            // event time blocks will have invalid Y coordinates.
            //
			// this.attendeeTimelineController.clear();
			// return;
		}
        
        if (startDate == "") {
        	View.showMessage(getMessage("selectDateStart"));
        	return;
        }
        
        var endDate = this.reservePanel.getFieldValue("reserve.date_end");		
		if (endDate == "") endDate = startDate;
		
	    var recurrencePattern = this.reservePanel.getFieldValue("reserve.recurring_rule");
	    // if editing a single instance of a series
        if (reservationId != "" && !this.editRecurring) {
        	recurrencePattern = "";
        }
        // if no recurrence look at just one day
        if (recurrencePattern == "") {
        	endDate = startDate;     
        }
	     
	    // add other parameters in necessary
	    // add the building to determine the timezone
	    var locationFilter = this.getLocationFilter();
	    
		var result = Workflow.callMethod('AbWorkplaceReservations-reservationTimelineService-loadAttendeeTimeline', 
				startDate, endDate, recurrencePattern, locationFilter, this.selectedAttendees, uniqueId, parseInt(reservationId) );
	 	
		if (result.code != 'executed') {
            View.showMessage(result.message);
            return;
        }
		
		if (result.data.message != undefined && result.data.message != "") {
			this.toggleCalendarUnavailable(true, result.data.message);
        } else {
        	this.toggleCalendarUnavailable(false);
        }

        this.attendeeTimelineController.updateTimelinePosition();
		this.attendeeTimelineController.clearRowBlocks();
		this.attendeeTimelineController.isEditable = false;
        
        // Load the JSON data into the timeline
        this.attendeeTimelineController.loadTimelineModel(result.data); 
        
		if (valueExists(this.attendeeTimelineController.timelineLayerDiv)) {
			this.attendeeTimelineController.timelineLayerDiv.scrollLeft = 0;
		}
		
		this.attendeeTimelineController.show();
		this.attendeeTimelineController.refreshRowBlocks();
		
		// KB#:	3040624: check end time for empty string
		if (startTime != "" && endTime != "") {
			this.createAttendeeTimelineEvents(startTime, endTime); 
		} else {
			this.toggleAttendeesNotification(false);
		}
		this.updateProgressBar();
    },
    
    /**
     * Create the related events to timeline according to an existing room reservation.
     *
     * @param {Object} resourceId
     * @param {Object} timeStart
     * @param {Object} timeEnd
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
            
            //timeslot column index for reservation start and end times
            var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeStart, maxTimemarksColumn, false);
            var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, timeEnd, maxTimemarksColumn, true) - 1; 
         
            if (this.withinDayLimits(resource, columnStart, columnEnd)) {
                if (timeline.allTimeslotsAvailable(resource.row, columnStart - resource.getPreBlockTimeslots(), 
                		columnEnd + resource.getPostBlockTimeslots())) {
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
    
    /**
     * Create resource timeline events only when room time is specified.
     */
    createResourceTimelineEventsForTime: function(startTime, endTime) {
		 if (startTime != "" && endTime != "") {
			 this.createResourceTimelineEvents(); 
		 } 
    },
    
    /**
     * Create the related attendee events according to an existing room reservation.
     * 
     * @param {Object} timeStart
     * @param {Object} timeEnd
     */
    createAttendeeTimelineEvents: function (startTime, endTime) { 
    	
    	var timeline = this.attendeeTimelineController.getTimeline();  
    	// check for empty timeline
    	if (timeline.resources == null) return;
    	
    	var minorSegments = timeline.minorToMajorRatio;
    	var timelineStartTime = timeline.getTimemark(0).getDateTime();
    	var maxTimemarksColumn = timeline.getColumnNumber();

    	//timeslot column index for reservation start and end times
    	var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);
    	var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true) - 1; 

		var attendeeBusy = false;
		// try to create an event for all attendees
		for (var i = 0; i < timeline.resources.length; i++) {			
			var resource = timeline.resources[i]; 
			
			if (columnStart >= resource.columnAvailableFrom && columnEnd < resource.columnAvailableTo) {
				// check if the timeslot is available
    			var timeslotAvailable = timeline.allTimeslotsAvailable(resource.row, columnStart, columnEnd);

    			if (timeslotAvailable) {
    				// Create new event
    		 		var newEvent = new Ab.timeline.Event(null, resource.row, columnStart, columnEnd, true, timeline, 
    		 				false, false, 0, 0);
    		 		
    				newEvent.dateTimeStart = startTime;
    				newEvent.dateTimeEnd = endTime;
    		 		
    				timeline.addEvent(newEvent);
    				
    				this.attendeeTimelineController.refreshTimelineRow(i);
    			} else {
    				attendeeBusy = true;
    			} // end if timeslotAvailable
			} else {
				attendeeBusy = true;
			} // end if within day limits
		} // end for 
		this.toggleAttendeesNotification(attendeeBusy);
    },
    
    /**
	 * Show or hide the notification shown on the attendees panel to indicate
	 * some attendees are busy.
	 * 
	 * @param show true to show the notification, false to hide it
	 */
	toggleAttendeesNotification: function(show) {
		this.attendeeTimelinePanel.actions.get('busyAttendees').show(show);
	},
	
	/**
	 * Show or hide the notification shown on the attendees panel to indicate
	 * the calendar service is not available.
	 * 
	 * @param show true to show the notification, false to hide it
	 * @param failedAttendees the list of emails for which no info is available
	 */
	toggleCalendarUnavailable: function(show, failedAttendees) {
		var action = this.attendeeTimelinePanel.actions.get('calendarUnavailable');
		if (show) {
			message = getMessage("tooltipNoInfoForAttendees").replace("{0}", "<br/>" + failedAttendees.join("<br/>"));
			action.setTooltip(message);
		}
		action.show(show);
	},
     
    /**
     * check if the resource is within the (room) reservation boundaries.
     */
    checkResourceBoundaries: function(event, startColumn, endColumn) {
    	// check if the resource is in room boundary
    	var startTime = this.reservePanel.getFieldValue("reserve.time_start");
    	var endTime = this.reservePanel.getFieldValue("reserve.time_end");

    	if (startTime != null && endTime != null && startTime != "" && endTime != "") {
    		var timeline = this.roomTimelineController.getTimeline();

    		var minorSegments = timeline.minorToMajorRatio;
    		var timelineStartTime = timeline.getTimemark(0).getDateTime();
    		var maxTimemarksColumn = timeline.getColumnNumber();

    		// check if the resource selection is within the room limits
    		var roomColumnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, startTime, maxTimemarksColumn, false);
    		var roomColumnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, endTime, maxTimemarksColumn, true);
    		
    		if (startColumn == undefined || endColumn == undefined) {
        		startColumn = event.getStart();
        		endColumn = event.getEnd() + 1;
    		}

    		if (startColumn < roomColumnStart || endColumn > roomColumnEnd) {	
    			// clear the time slots for a new event
    			event.clearTimeslots();
    			// check if this is new event or editing
    			if (event.dateTimeStart == undefined) {
    				event.clearTimeslots();
    			} else {
    				// return to the previous state 	        	
    	            var columnStart = ABRV_getTimeColumn(timelineStartTime, minorSegments, event.dateTimeStart, maxTimemarksColumn, false);
    	            var columnEnd = ABRV_getTimeColumn(timelineStartTime, minorSegments, event.dateTimeEnd, maxTimemarksColumn, true);
    	        	        	
    	        	event.timeline.modifyEvent(event, columnStart, columnEnd - 1);  
    	        	this.resourceTimelineController.refreshTimelineRow( event.getRow() ); 
    			}  
    			
    			View.showMessage(getMessage("errorOutOfRoomTimeScope"));
    			return false;
    		}
    	} else { 
    		// clear the time slots
    		event.clearTimeslots();
    		View.showMessage(getMessage("selectRoomAndTimeError"));
    		return false;
    	} 
    	
    	return true;
    },
    
	getSelectedBuilding: function() {
		var buildingId = this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id");
		
		if (buildingId == "") {			
			buildingId =  this.consolePanel.getFieldValue("rm_arrange.bl_id");
		} else {
			this.consolePanel.setFieldValue("rm_arrange.bl_id", buildingId);
		}
		
		return buildingId;
	},
	
	getSelectedFloor: function() {
		return this.reserveRoomPanel.getFieldValue("reserve_rm.fl_id");
	},
	
	getSelectedRoom: function() {
		return this.reserveRoomPanel.getFieldValue("reserve_rm.rm_id");
	},
	
	/**
	 * Retrieve available unique and limited resources from the server.
	 * @param workflowRule name of the wfr to call
	 * @param replaceTimeFrame whether to replace the currently selected time period
	 * @param timeStart use this as the start time if replaceTimeFrame is true
	 * @param timeEnd use this as the end time if replaceTimeFrame is true
	 * @return dataSet containing the available resources, or null if failed
	 */
	retrieveAvailableResources: function(workflowRule, replaceTimeFrame, timeStart, timeEnd) {
		var dataSet = null;
		// get the records to be send
		var locationFilter = this.getLocationFilter(); 
		var reservation = this.reservePanel.getOutboundRecord(); 
		var roomAllocation = this.reserveRoomPanel.getOutboundRecord();
		
		/* If no room is selected, get the room restriction from the console. This will be used to
		 * ensure resources are only showed if at least one room allows that type of resource.
		 */
		if (this.roomTimelineController.getPendingEvents().length == 0) {
			roomAllocation.setValue("reserve_rm.bl_id", this.consolePanel.getFieldValue("rm_arrange.bl_id"));
			roomAllocation.setValue("reserve_rm.fl_id", this.consolePanel.getFieldValue("rm_arrange.fl_id"));
			roomAllocation.setValue("reserve_rm.rm_id", this.consolePanel.getFieldValue("rm_arrange.rm_id"));
			roomAllocation.setValue("reserve_rm.rm_arrange_type_id", 
					this.consolePanel.getFieldValue("rm_arrange.rm_arrange_type_id"));
		}
		
		if (replaceTimeFrame) {
			// replace the time values
			reservation.setValue("reserve.time_start", timeStart);
			reservation.setValue("reserve.time_end", timeEnd);
			roomAllocation.setValue("reserve_rm.time_start", timeStart);
			roomAllocation.setValue("reserve_rm.time_end", timeEnd);
		}
		
		// get the list of limited and unique resources available. 
		var results = Workflow.callMethod(workflowRule, locationFilter, reservation, roomAllocation);
		if (results.code == 'executed') {
			dataSet = results.dataSet;
		}
		return dataSet;
	},
	
	/**
	 * Update the catering resources when the reservation times change.
	 */
	updateCateringPanelTimes: function(rowIndex, dateStartTime, dateEndTime) {		
		var gridRow = this.reserveCateringPanel.gridRows.get(rowIndex);
		var record = gridRow.getRecord();
		var row = this.reserveCateringPanel.rows[rowIndex]; 
	 			
		// Check dayStart and dayEnd of the catering resource. Adjust the new
		// reservation times to remain within [dayStart,dayEnd].
		dateStartTime = this.cropTimeStart(record, dateStartTime);
		dateEndTime = this.cropTimeEnd(record, dateEndTime);
		var currentStartTime = record.getValue("reserve_rs.time_start");
		var currentEndTime = record.getValue("reserve_rs.time_end");
		
		var modified = false;
		// Check if the time for catering is within the new reservation time.
		// The new reservation time is already corrected for the catering [dayStart+preBlock,dayEnd-postBlock].
		// Use date objects for the comparison.
		if (currentStartTime < dateStartTime || currentEndTime > dateEndTime) {
			row['reserve_rs.time_start'] = this.reserve_rs_ds.formatValue("reserve_rs.time_start", dateStartTime, true);
			gridRow.setFieldValue('reserve_rs.time_start', dateStartTime);
			row['reserve_rs.time_end'] = this.reserve_rs_ds.formatValue("reserve_rs.time_end", dateEndTime, true);
			gridRow.setFieldValue('reserve_rs.time_end', dateEndTime);
			modified = true;
		}
		return modified;
	},
	 
	/**
	 * Check if the resources are in the timeslot limits of the room reservation.
	 */
	checkIntervalReservationTimeslots: function(startTime, endTime) {
		if (!this.checkValidTimePeriod(startTime, endTime)) {
			return false;
		}
		
		// get the pending event of the room reservation
	    var newEvents = this.roomTimelineController.getPendingEvents();
	    
	    if (newEvents != null && newEvents.length > 0) {
	        var event = newEvents[0]; 
		    var roomStartTime = event.dateTimeStart;
		    var roomEndTime = event.dateTimeEnd;
		    
		    startTime = startTime.replace(".", ":");
			endTime = endTime.replace(".", ":");
	 
		    if ( ABRV_isMinnor(startTime, roomStartTime) || ABRV_isMinnor(roomEndTime, endTime) ) {
		    	View.showMessage(getMessage("errorOutOfRoomTimeScope"));
		    	return false;
		    } 
	    }
	    
	    return true;
	},	 
	
	/**
	 * update the room block on the timeline.
	 */
	reserveRoomPanel_onSave: function() {
		var roomRecord = this.reserveRoomPanel.getOutboundRecord();
		this.consolePanel.setFieldValue("rm_arrange.max_capacity", 
				this.reserveRoomPanel.getFieldValue("reserve_rm.attendees_in_room"));
		
		var startTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_start");
		var endTime = this.reserveRoomPanel.getFieldValue("reserve_rm.time_end");
		
		// check required fields
		if (startTime == "" || endTime == "") {
			View.showMessage(getMessage("selectTimeError"));
	    	return;
		}
		
		// get the pending event  
	    var newEvents = this.roomTimelineController.getPendingEvents();
	    var event = newEvents[0];
	    
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
	    if (timeline.canModifyEvent(event, columnStart, columnEnd, false) ) {	    	
	    	 // modify event and refresh timeline row
			timeline.modifyEvent(event, columnStart, columnEnd);
			// update the event start and end time 
			event.dateTimeStart = startTime;
			event.dateTimeEnd = endTime; 	
			this.roomTimelineController.refreshTimelineRow(event.getRow(), true);  
			
			// update all other panels
			this.updatePanels(event);
			
			// close the popup window
			this.reserveRoomPanel.closeWindow();
			
	    } else {
	    	View.showMessage(getMessage("timeSelectedNotAvailable"));
	    	return;
	    } // end if 
	},
	
	/**
     * Get the building id to limit the results for the select floor and room popups.
     */
    getBuildingIdForSelectRestriction: function() {
    	return this.consolePanel.getFieldValue("rm_arrange.bl_id");
    },
    
    /**
     * Get the floor id to limit the results for the select room popups.
     */
    getFloorIdForSelectRestriction: function() {
    	return this.consolePanel.getFieldValue("rm_arrange.fl_id");
    },
    
    /**
     * Get "1" or "0" depending on whether the select popups should show only reservable locations.
     */
    getSelectReservableOnly: function() {
    	return "1";
    }
    
});
