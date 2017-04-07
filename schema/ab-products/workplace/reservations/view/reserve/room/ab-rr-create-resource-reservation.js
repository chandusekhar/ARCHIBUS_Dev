
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Resource Reservation controller. 
* The controller extends the reservation base controller.
* <p>
* Controller is used when creating or editing a resource (only) reservation.
* <p>
*
* @author Bart Vanderschoot
* @since 21.2
*/
var reservationTimelineController = View.extendController('reservationTimelineController', reservationBaseController, {
	
	findEquipmentAndServicesWfr: "AbWorkplaceReservations-resourceFinderService-findAvailableReservableResources",
	findCateringWfr: "AbWorkplaceReservations-resourceFinderService-findAvailableCateringResources",
	
    consoleStartTimeField: "reserve_rs.time_start",
	consoleEndTimeField: "reserve_rs.time_end",
	
	// specific views for resource reservations
    reservationDetailsView: "ab-rr-reserve-resource-details.axvw",
    confirmationView: "ab-rr-create-resource-reservation-confirm.axvw",
	  
 	/**
 	 * The reservation panel is refreshed and triggers the reservation room panel.
 	 */
 	reservePanel_afterRefresh: function() {  	 
 		this.reservePanel.show(false);
 		this.loadReservationDetails();
 	},
 		
 	/**
 	 * load the reservation details.
 	 */	
 	loadReservationDetails: function() {		
 		// update the date picker
		this.updateDatePicker();
		
		// update the console defaults
		this.updateConsoleDefaults();		
		
   		this.selectedResources = [];
   		this.reservedResources = {};
		
		// update the panels when editing a reservation
		var reservationId = this.reservePanel.getFieldValue("reserve.res_id");
		if (reservationId != "") {
			// load all reserved resources into the temporary objects
			this.loadReservedResources(reservationId);
		}
	   	
		this.loadSelectedCaterings(reservationId);
		this.loadRecurrenceDetails(reservationId);
 	}, 

	/**
	 * Update the console defaults based on existing reservation info or user info.
	 */
	updateConsoleDefaults: function() {
		var reservationId = this.reservePanel.getFieldValue("reserve.res_id");
		if (reservationId != "") {
			// fill in the console panel based on any existing active resource reservation
			var restriction = new Ab.view.Restriction();		 
			restriction.addClause("reserve_rs.status", "Confirmed", "=", "OR");
			restriction.addClause("reserve_rs.status", "Awaiting App.", "=", "OR");
			restriction.addClause("reserve_rs.res_id", reservationId, "=", ") AND (");
			
			// KB# 3040090 keep the customized console panel title
			var consolePanelTitle = this.consolePanel.getTitle();
			this.consolePanel.refresh(restriction);
			this.consolePanel.setTitle(consolePanelTitle);
		}
		
		var buildingId = this.consolePanel.getFieldValue("reserve_rs.bl_id"); 
		// if no building was found using the refresh, set the user's location as the default 
		if (buildingId == "") {
			// take the user location for a new reservation
			this.consolePanel.setFieldValue("reserve_rs.bl_id", View.user.employee.space.buildingId); 			
			this.consolePanel.setFieldValue("reserve_rs.fl_id", View.user.employee.space.floorId);
			this.consolePanel.setFieldValue("reserve_rs.rm_id", View.user.employee.space.roomId);
		} 
		
		// set start and end time to the full reservation time
		var startTime = this.reservePanel.getFieldValue("reserve.time_start");
		var endTime = this.reservePanel.getFieldValue("reserve.time_end");		
		ABRV_setFormattedTimeValue(this.consolePanel, this.consoleStartTimeField, startTime);
		ABRV_setFormattedTimeValue(this.consolePanel, this.consoleEndTimeField, endTime);
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
		// create and load the resource timeline 
		this.createResourceTimeline();   
	},
	
	/**
	 * When clicking the apply filter.
	 */
	consolePanel_onApplyFilter: function() {
		this.updateReservePanel();
		this.reloadTimelines();
	},
	
	/**
	 * When clicking the clear filter.
	 */
	consolePanel_onClearFilter: function() {
		ABRV_setFormattedTimeValue(this.consolePanel, this.consoleStartTimeField, "");
		ABRV_setFormattedTimeValue(this.consolePanel, this.consoleEndTimeField, "");
		this.consolePanel_onApplyFilter();
	},
	
	/**
	 * Prepare for opening the confirmation dialog.
	 */
	prepareConfirm: function() {
		var validated = true;
		
		// Verify that at least one resource is selected and a building code is entered.
		var events = this.resourceTimelineController.getPendingEvents(); 
		if (events.length == 0 && this.reserveCateringPanel.rows.length == 0) {
			validated = false;
			View.showMessage(getMessage("selectAtLeastOneResource"));
		} else if (this.getSelectedBuilding() == "") {
			validated = false;
			View.showMessage(getMessage("selectBuilding"));
		}
		return validated;
	}, 
	
    /**
     * Delete previous event if it was created
     */
    deleteLastUnactiveEvents: function() {  
		// check for empty timeline
		if (this.resourceTimelineController.getResources() == null) return;
		// remove all pending events
		var newEvents = this.resourceTimelineController.getPendingEvents();
		if (newEvents.length > 0) {
			this.resourceTimelineController.removeEvents(newEvents);
		} 
		// make sure none of the resources are selected
		var resources = this.resourceTimelineController.getResources();
	    for (var i = 0; i < resources.length; ++i) {
			 resources[i].selectResource = "false";
		}  
    },
    
    /**
     * Update other panels after a new drag on the resource timeline.
     */
    updatePanelsFromResourceTimeline: function(event) {
    	this.updateConsolePanel(event);
    },
    
    /**
     * Update the console panel.
     */
    updateConsolePanel: function(event) {
    	// fill in the console time period if it wasn't filled in yet
    	if (event != null && (this.getTimeStart() == "" || this.getTimeEnd() == "")) {
			ABRV_setFormattedTimeValue(this.consolePanel, this.consoleStartTimeField, event.dateTimeStart);
			ABRV_setFormattedTimeValue(this.consolePanel, this.consoleEndTimeField, event.dateTimeEnd);
    	}
    },
    
    /**
     * Update the (hidden) reservation panel after changing the time in the console panel.
     */
    updateReservePanel: function() {          
         if (this.reservePanel != undefined) {
        	 var timeStart = this.consolePanel.getFieldValue(this.consoleStartTimeField);
        	 var timeEnd = this.consolePanel.getFieldValue(this.consoleEndTimeField);
        	 
        	 // if either one isn't specified, clear the reservePanel time period
        	 if (timeStart == "") {
        		 timeEnd = "";
        	 } else if (timeEnd == "") {
        		 timeStart = "";
        	 }
        	 
        	 this.reservePanel.setFieldValue("reserve.time_start", timeStart);
        	 this.reservePanel.setFieldValue("reserve.time_end", timeEnd);
         }	  
    },
     
    /**
     * Reload all timelines after navigating to a new date.
     */
    reloadTimelines: function() {
    	this.openProgressBar(2, getMessage("loadingEquipmentAndServicesTimeline"));
    	this.continueReloadTimelines.defer(this.DEFER_TIME, this);
    },
    
    /**
     * Continue reloading the resource time line and catering panel.
     */
    continueReloadTimelines: function() {
    	try {
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
	 * Update the start date in the panels based on the cached value.
	 */
	updatePanelStartDate: function() {
		this.reservePanel.setFieldValue("reserve.date_start", this.startDate);
    	this.consolePanel.setFieldValue("reserve_rs.date_start", this.startDate);
	},
    
	/**
	 * check resource boundaries.
	 */
	checkResourceBoundaries: function(event) {
		return true; 
	},
    
    /**
     * Get the selected building.
     */
	getSelectedBuilding: function() {
		return this.consolePanel.getFieldValue("reserve_rs.bl_id"); 
	},
	
	/**
	 * Get the selected floor.
	 */
	getSelectedFloor: function() {
		return this.consolePanel.getFieldValue("reserve_rs.fl_id");
	},
	
	/**
	 * Get the selected room.
	 */
	getSelectedRoom: function() {
		return this.consolePanel.getFieldValue("reserve_rs.rm_id");
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
		
		// copy time period properties from the console panel to the reserve panel
		this.updateReservePanel();
		
		// get the records to be send
		var locationFilter = this.getLocationFilter();
		var reservation = this.reservePanel.getOutboundRecord();
		
		if (replaceTimeFrame) {
			// replace the time values
			reservation.setValue("reserve.time_start", timeStart);
			reservation.setValue("reserve.time_end", timeEnd);
		}
		
		// get the list of limited and unique resources available. 
		var results = Workflow.callMethod(workflowRule, locationFilter, reservation);
		if (results.code == 'executed') {
			dataSet = results.dataSet;
		}
		return dataSet;
	},
	
	/**
     * Get the building id to limit the results for the select floor and room popups.
     */
    getBuildingIdForSelectRestriction: function() {
    	return this.consolePanel.getFieldValue("reserve_rs.bl_id");
    },
    
    /**
     * Get the floor id to limit the results for the select room popups.
     */
    getFloorIdForSelectRestriction: function() {
    	return this.consolePanel.getFieldValue("reserve_rs.fl_id");
    },
    
    /**
     * Get "1" or null depending on whether the select popups should show only reservable locations.
     * Resource reservations don't require reservable rooms.
     */
    getSelectReservableOnly: function() {
    	return null;
    }
	
});
