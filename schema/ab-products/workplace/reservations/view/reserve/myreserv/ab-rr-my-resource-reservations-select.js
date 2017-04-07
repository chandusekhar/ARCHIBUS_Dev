/**
 * Controller for viewing resource reservations.
 */
var resourceReservationSelectController = View.extendController("resourceReservationSelectController", reservationSelectControllerBase, {
	
	/** Create Reservation View */
	createReservationView: "ab-rr-create-resource-reservation.axvw",
	
	/** Reservation Details View */
	reservationDetailsView: "ab-rr-resource-reservation-details.axvw",
	
	/** Name of the virtual location field in the grid */
	locationProperty: "reserve_rs.room",
	
	/** Name of the WFR to cancel multiple reservations */
	cancelMultipleWfr: "AbWorkplaceReservations-resourceReservationService-cancelMultipleResourceReservations",
	
	/** Name of the WFR to cancel a single reservation */
	cancelSingleWfr: "AbWorkplaceReservations-resourceReservationService-cancelResourceReservation",
	
	/** Name of the WFR to cancel a recurring reservation */
	cancelRecurringWfr: "AbWorkplaceReservations-resourceReservationService-cancelRecurringResourceReservation",
	
	/** Name of the WFR to copy a reservation */
	copyWfr: "AbWorkplaceReservations-resourceReservationService-copyResourceReservation",
	
	/** Building id field name for the rows in the grid */
	buildingIdFieldName: "reserve_rs.bl_id"

});

