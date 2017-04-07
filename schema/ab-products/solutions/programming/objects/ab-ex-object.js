/**
 * Declare the namespace for the example JS classes.
 */
Ab.namespace('examples');

/**
 * Custom Java Script class that holds reservation properties.
 */
Ab.examples.Reservation = Base.extend({

    /**
     * Variable: room ID to reserve.
     */    
	roomId: '',
	
	/**
	 * Variable: reservation date.
	 */
	dateStart: null,
	
	/**
	 * Constructor: creates new reservation object.
	 */
	constructor: function(roomId, startDate) {
	    this.roomId = roomId;
	    this.startDate = startDate;
	},
	
	/**
	 * Returns reservation content as a string for display.
	 */
	toString: function() {
	   return 'Reservation for room [' + this.roomId + '], start on [' + this.startDate + ']';
	}
	// do not add comma after the last function in the class! 
});


var objectExampleController = View.createController('objectExample', {

    /**
     * Instance of the Ab.examples.Reservation object.
     */
    reservation: null,

    /**
     * Creates the reservation object from form fields.
     */
    exObject_reservationForm_onCreateReservation: function() {
        var roomId = this.exObject_reservationForm.getFieldValue('reserve_rm.rm_id');
        var startDate = this.exObject_reservationForm.getFieldValue('reserve_rm.date_start');
        
        // create new Reservation object
        this.reservation = new Ab.examples.Reservation(roomId, startDate);
        View.showMessage('Reservation object has been created');
    },
    
    /**
     * Displays the reservation object.
     */
    exObject_reservationForm_onDisplayReservation: function() {
        if (this.reservation) {
            View.showMessage(this.reservation.toString());
        } else {
            alert('Reservation object has not been created yet');
        }
    }

});