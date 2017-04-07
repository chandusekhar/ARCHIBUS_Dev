/**
* Conference Call Reservation Confirmation controller.
* <p>
* Controller is used when creating a conference call reservation.
* <p>
*
* @author Yorik Gerlo
* @since 21.3
*/
var reservationConfirmController = View.extendController('reservationConfirmController', reservationConfirmBaseController, {
	
	/** name of the tab to return to after confirmation */
	selectTabName: "selectRoomReservation",
	
	/** The reserved rooms (copied from the time line controller) */
	reservedRooms: null,
	
	/**
	 * Get the building id.
	 */
	getBuildingId: function() {
		return this.reserveRoomPanel.getFieldValue("reserve_rm.bl_id");
	},
	
	/**
	 * Get the floor id.
	 */
	getFloorId: function() {
		return this.reserveRoomPanel.getFieldValue("reserve_rm.fl_id");
	},
	
	/**
	 * Get the room id.
	 */
	getRoomId: function() {
		return this.reserveRoomPanel.getFieldValue("reserve_rm.rm_id");
	},
	
	/**
	 * Fetch additional data depending on the workflow.
	 */
	fetchAdditionalData: function() { 
        this.timeZoneId = this.reservationBaseController.getTimeZoneId();
	},
	
	/**
	 * Fetch the location from the opener view and store it in this view.
	 */
    fetchLocation: function() {
        var selectedRooms = this.reservationBaseController.getSelectedRoomRecords();
        // Set the primary room in the hidden room panel.
        this.reserveRoomPanel.setRecord(selectedRooms[0]);
        // Convert reserved rooms to outbound records.
	    this.reservedRooms = [];
	    for (var i = 0; i < selectedRooms.length; ++i) {
	        // clear all time fields, they are taken from the reserve record
	        selectedRooms[i].setValue("reserve_rm.date_start", "");
	        selectedRooms[i].setValue("reserve_rm.time_start", "");
	        selectedRooms[i].setValue("reserve_rm.time_end", "");
	        selectedRooms[i].setValue("rm_arrange.day_start", "");
	        selectedRooms[i].setValue("rm_arrange.day_end", "");
	        selectedRooms[i].setOldValue("reserve_rm.date_start", "");
            selectedRooms[i].setOldValue("reserve_rm.time_start", "");
            selectedRooms[i].setOldValue("reserve_rm.time_end", "");
            selectedRooms[i].setOldValue("rm_arrange.day_start", "");
            selectedRooms[i].setOldValue("rm_arrange.day_end", "");
	        this.reservedRooms.push(this.reserve_rm_ds.processOutboundRecord(selectedRooms[i]));
	    }
	    
	    var roomLocation = this.getBuildingId() + "-" + this.getFloorId() + "-" + this.getRoomId();
		try {
			var reservation = this.reservePanel.getOutboundRecord();
			var roomAllocations = new Ab.data.DataSetList();
	        roomAllocations.addRecords(this.reservedRooms);
			var result = Workflow.callMethod("AbWorkplaceReservations-conferenceCallReservationService-getLocationString", 
					reservation, roomAllocations);
			
			if (result.code == 'executed') {
				roomLocation = result.message;
			} else {
				Workflow.handleError(result);
			}
		} catch (e) {
			Workflow.handleError(e);
		}
		$("roomLocation").innerHTML = roomLocation;
	},
	
	/**
	 * Fetch the reservation date line from the create view.
	 */
	fetchReservationDate: function() {
		var dateLine = this.reservationBaseController.getRecurrenceRuleDescription(true);
		var conflictsCount = this.reservationBaseController.getConflictCountForSelectedRoom();
        if (conflictsCount == 1) {
        	dateLine += " (" + getMessage("oneConflictDetected") + ")";
        } else if (conflictsCount > 1) {
        	dateLine += " (" + getMessage("conflictsDetected").replace("{0}", conflictsCount) + ")";
        }
		$("reservationDate").innerHTML = dateLine;
	},
	
	/**
     * Calculate the total cost.
     */
    calculateCost: function() {
        var reservation = this.reservePanel.getOutboundRecord();
        var roomAllocations = new Ab.data.DataSetList();
        roomAllocations.addRecords(this.reservedRooms);
        var recurrence = this.reservationBaseController.recurrencePattern;
        
        // when recurring reservation, calculate cost of all occurrences
        var numberOfOccurrences = (recurrence != null &&  recurrence.total > 0) ? recurrence.total : 1;
        
        try {
            var result = Workflow.callMethod("AbWorkplaceReservations-conferenceCallReservationService-calculateTotalCost", 
                    reservation, roomAllocations, numberOfOccurrences);
              
            if (result.code == 'executed') {        
                // return value
                this.reservePanel.setFieldValue("reserve.cost_res", result.value); 
            } else {
                Workflow.handleError(result);
            }            
        
        } catch(e){
            Workflow.handleError(e);
        }        

    },
	
	/**
	 * Validate the confirmation form before submitting.
	 * To override.
	 * @return true if valid, false otherwise
	 */
	validateForSubmit: function() {
		var validated = this.reservePanel.canSave();
		if (validated) {
			// If valid, update the date and time of the room panel (hidden).
			var dateStart = this.reservePanel.getFieldValue("reserve.date_start");
			var timeStart = this.reservePanel.getFieldValue("reserve.time_start");
			var timeEnd = this.reservePanel.getFieldValue("reserve.time_end");
			
			this.reserveRoomPanel.setFieldValue("reserve_rm.date_start", dateStart); 
			this.reserveRoomPanel.setFieldValue("reserve_rm.time_start", timeStart);
			this.reserveRoomPanel.setFieldValue("reserve_rm.time_end", timeEnd);
		}
		return validated;
	},
	
	/**
	 * Call the WFR for submitting the reservation (error handling is up to the caller).
	 * To override
	 * @return WFR result
	 */
	callSubmitWfr: function(reservation) {
	    var roomAllocations = new Ab.data.DataSetList();
        roomAllocations.addRecords(this.reservedRooms);
		return Workflow.callMethod("AbWorkplaceReservations-conferenceCallReservationService-saveReservation",
				reservation, roomAllocations, this.timeZoneId);
	},
	
	/**
	 * Check the return value of creating the reservations and proceed.
	 * 
	 * @param {Object} result the WFR result
	 */
	checkResultAndProceed: function(result) {
		var fullMessage = "";
		if (result.message != "OK") {
			fullMessage = result.message;
		}
		
		var dataSet = result.dataSet;
		var hasConflicts = false;
		if (dataSet != null && valueExists(dataSet.records) && dataSet.records.length > 0) {
			hasConflicts = true;
			if (fullMessage != "") {
				fullMessage += "<br/><br/>";
			}
			
			var records = dataSet.records;
			var localizedDates = records[0].getLocalizedValue("reserve.date_start");
			if (records.length == 1) {
				fullMessage += getMessage("oneConflictCreated").replace("{0}", localizedDates);
			} else {
				for (var i = 1; i < records.length; ++i) {
					localizedDates += ", " + records[i].getLocalizedValue("reserve.date_start");
				}
				fullMessage += getMessage("severalConflictsCreated").replace("{0}", records.length)
						.replace("{1}", localizedDates);
			}
		}

		if (fullMessage == "") {
			// switch to the select reservations tab
			this.returnToSelectTab();
		} else {
			var controller = this;
			// Inform the user about the error, then switch tabs or move to Resolve Conflicts.
			View.alert(fullMessage, function(button) {
				if (hasConflicts) {
					View.openProgressBar();
					View.loadView("ab-rr-my-reservations-conflicts.axvw");
				} else {
					controller.returnToSelectTab();
				}
			});
		}
	}

});