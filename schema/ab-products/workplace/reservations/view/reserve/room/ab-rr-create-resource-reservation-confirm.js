/**
* Resource Reservation Confirmation controller.
* <p>
* Controller is used when creating a resource reservation.
* <p>
*
* @author Bart Vanderschoot
* @since 21.2
*/
var reservationConfirmController = View.extendController('reservationConfirmController', reservationConfirmBaseController, {
	
	/** name of the tab to return to after confirmation */
	selectTabName: "selectResourceReservation",
	
	reservationTimeStart: null,
	reservationTimeEnd: null,
	
	/**
	 * Get the building id.
	 */
	getBuildingId: function() {
		return this.roomPanel.getFieldValue("reserve_rs.bl_id");
	},
	
	/**
	 * Get the floor id.
	 */
	getFloorId: function() {
		return this.roomPanel.getFieldValue("reserve_rs.fl_id");
	},
	
	/**
	 * Get the room id.
	 */
	getRoomId: function() {
		return this.roomPanel.getFieldValue("reserve_rs.rm_id");
	},
	
	/**
	 * Fetch the location from the opener view and store it in this view.
	 */
	fetchLocation: function() {
		var consolePanel = View.getOpenerView().panels.get("consolePanel");
		var blId = consolePanel.getFieldValue("reserve_rs.bl_id"); 
		var flId = consolePanel.getFieldValue("reserve_rs.fl_id");
		var rmId = consolePanel.getFieldValue("reserve_rs.rm_id");
		
		this.roomPanel.setFieldValue("reserve_rs.bl_id", blId);
		this.roomPanel.setFieldValue("reserve_rs.fl_id", flId);
		this.roomPanel.setFieldValue("reserve_rs.rm_id", rmId);
	},
	
	/**
	 * Update the time frame of the main reservation after all data has
	 * been added in the confirmation view. 
	 */
	updateReservationTime: function() {
		// get the the minimum start and maximum end time
		this.reserveResourcePanel.gridRows.each(function(row) {
			this.extendReservationTimesForRow(row);
		}, this);
		this.reserveCateringPanel.gridRows.each(function(row) {
			this.extendReservationTimesForRow(row);
		}, this);
		
		this.reservePanel.setFieldValue("reserve.time_start", this.reservationTimeStart);
		this.reservePanel.setFieldValue("reserve.time_end", this.reservationTimeEnd);
		
		// also update the panel in the opener view (used for building the date string)
		var reservePanel = View.getOpenerView().panels.get("reservePanel");
		reservePanel.setFieldValue("reserve.time_start", this.reservationTimeStart);
		reservePanel.setFieldValue("reserve.time_end", this.reservationTimeEnd);
	},
	
	/**
	 * Extend the main reservation time to include the times specified in the
	 * given resource allocation.
	 * 
	 * @param row resource allocation grid row
	 */
	extendReservationTimesForRow: function(row) {
		var record = row.getRecord();
		var dateStartTime = record.getValue("reserve_rs.time_start");
		var dateEndTime = record.getValue("reserve_rs.time_end");
		if (this.reservationTimeStart == null || dateStartTime < this.reservationTimeStart) { 
	 		this.reservationTimeStart = dateStartTime;
	 	}
	 	if (this.reservationTimeEnd == null || dateEndTime > this.reservationTimeEnd) {
	 		this.reservationTimeEnd = dateEndTime;
	 	}
	},

	/**
	 * Calls the WFR for calculating the actual cost of the reservation
	 * (error handling is up to the caller).
	 * @return WFR result
	 */
	callCostWfr: function(reservation, caterings, resources, numberOfOccurrences) {
		return Workflow.callMethod("AbWorkplaceReservations-resourceReservationService-calculateTotalCost", 
					reservation, caterings, resources, numberOfOccurrences);
	},

	/**
	 * Validate the confirmation form before submitting.
	 * @return true if valid, false otherwise
	 */
	validateForSubmit: function() {
		return this.reservePanel.canSave() && this.roomPanel.canSave();
	},
	
	/**
	 * Call the WFR for submitting the reservation (error handling is up to the caller).
	 * @return WFR result
	 */
	callSubmitWfr: function(reservation, caterings, resources) {
		return Workflow.callMethod("AbWorkplaceReservations-resourceReservationService-saveResourceReservation", 
				reservation, resources, caterings);
	}

});

/**
 * Open the Select Floor dialog for the resource reservation confirmation panel.
 * This includes restricting the dialog to show only floors in the currently selected building.
 */
function openSelectFloorDialog() {
	var buildingId = View.panels.get("roomPanel").getFieldValue("reserve_rs.bl_id");
	View.openDialog("ab-rr-select-floor.axvw", null, false, {
		title: getMessage("selectFloor"),
		buildingId: buildingId
	});
}

/**
 * Open the Select Room dialog for the resource reservation confirmation panel.
 * This includes restricting the dialog to show only rooms in currently selected building.
 */
function openSelectRoomDialog() {
	var roomPanel = View.panels.get("roomPanel");
	var buildingId = roomPanel.getFieldValue("reserve_rs.bl_id");
	var floorId = roomPanel.getFieldValue("reserve_rs.fl_id");
	
	View.openDialog("ab-rr-select-room.axvw", null, false, {
		title: getMessage("selectRoom"),
		buildingId: buildingId,
		floorId: floorId
	});
}
