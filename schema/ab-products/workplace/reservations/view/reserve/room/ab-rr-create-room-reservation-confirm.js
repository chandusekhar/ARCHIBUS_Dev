/**
* Room Reservation Confirmation controller.
* <p>
* Controller is used when creating a room reservation.
* <p>
*
* @author Bart Vanderschoot
* @since 21.2
*/
var reservationConfirmController = View.extendController('reservationConfirmController', reservationConfirmBaseController, {
	
	/** name of the tab to return to after confirmation */
	selectTabName: "selectRoomReservation",
	
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
	 * Check whether this is a reservation part of an exiting conference call.
	 */
	isConferenceCallReservation: function() {
	    return this.reservePanel.getFieldValue("reserve.res_conference") != "";
	},
	
	/**
	 * Fetch the location from the opener view and store it in this view.
	 */
	fetchLocation: function() {
		var reserveRoomPanel = View.getOpenerView().panels.get("reserveRoomPanel");
		reserveRoomPanel.fields.each(function(field) {
            var value = field.getUIValue();
            if (value != null) {
                this.reserveRoomPanel.setFieldValue(field.getFullName(), value); 
            }
	    }, this);
		
		var roomLocation = this.getBuildingId() + "-" + this.getFloorId() + "-" + this.getRoomId();
		try {
			var reservation = this.reservePanel.getOutboundRecord();
			var roomAllocation = this.reserveRoomPanel.getOutboundRecord();
			
			// call a different wfr if editing a single room in a conference call
			var wfr = "AbWorkplaceReservations-roomReservationService-getLocationString";
			if (this.isConferenceCallReservation()) {
			    wfr = "AbWorkplaceReservations-conferenceCallReservationService-getLocationStringForSingleEdit";
			}
			
			var result = Workflow.callMethod(wfr, reservation, roomAllocation);
			
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
	 * Retrieve the actual cost from the server.
	 * Calls the WFR without error handling.
	 * @return WFR result
	 */
	callCostWfr: function(reservation, caterings, resources, numberOfOccurrences) {
		var roomAllocation = this.reserveRoomPanel.getOutboundRecord();
		return Workflow.callMethod("AbWorkplaceReservations-roomReservationService-calculateTotalCost", 
					reservation, roomAllocation, caterings, resources, numberOfOccurrences);
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
	callSubmitWfr: function(reservation, caterings, resources) {
		var roomAllocation = this.reserveRoomPanel.getOutboundRecord();
		
		// call a different wfr if editing a single room in a conference call
        var wfr = "AbWorkplaceReservations-roomReservationService-saveRoomReservation";
        if (this.isConferenceCallReservation()) {
            wfr = "AbWorkplaceReservations-conferenceCallReservationService-editSingleRoomReservation";
        }
		
		return Workflow.callMethod(wfr, reservation, roomAllocation, resources, caterings);
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