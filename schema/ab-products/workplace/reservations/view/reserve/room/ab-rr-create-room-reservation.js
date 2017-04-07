
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Room Reservation controller.
* The controller extends the room reservation base controller.
* <p>
* Controller is used when creating or editing a room reservation.
* <p>
*
* @author Bart Vanderschoot
* @since 21.2
*/
var reservationTimelineController = View.extendController('reservationTimelineController', roomReservationBaseController, {
	
    confirmationView: "ab-rr-create-room-reservation-confirm.axvw"

});
