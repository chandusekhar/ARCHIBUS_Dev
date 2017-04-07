/**
 * Declare the namespace for the example JS classes.
 */
Ab.namespace('examples');

/**
 * Custom Java Script class that holds reservation properties. 
 */
Ab.examples.Reservation = Base.extend({
	roomId: '',
	dateStart: null,
	
	constructor: function(roomId, startDate) {
	    this.roomId = roomId;
	    this.startDate = startDate;
	},
	
	toString: function() {
	   return 'Reservation for room [' + this.roomId + '], starts on [' + this.startDate + ']';
	}
});

/**
 * The base controller class defines properties and methods that can be used by subclasses.
 */
Ab.examples.BaseControllerClass = Ab.view.Controller.extend({

	/**
     * Instance of the Ab.examples.Reservation object.
     */
    reservation: null,

    /**
     * Creates a new reservation.
     */
	createReservation: function(roomId, startDate) {
	    this.reservation = new Ab.examples.Reservation(roomId, startDate);
        View.showMessage('Reservation object has been created');
    }
});

/**
 * To create a sub-classed controller, call the View.extendController() method instead of View.createController().
 * Pass the base controller class.
 */
View.extendController('controllerExample', Ab.examples.BaseControllerClass, {

    /**
     * Creates the reservation object from form fields.
     */
    exController_reservationForm_onCreateReservation: function() {
        var roomId = this.exController_reservationForm.getFieldValue('reserve_rm.rm_id');
        var startDate = this.exController_reservationForm.getFieldValue('reserve_rm.date_start');
        
        // call the base controller method to create the new Reservation object
        this.createReservation(roomId, startDate);
    },
    
    /**
     * Displays the reservation object.
     */
    exController_reservationForm_onDisplayReservation: function() {
    	// the subclass can use the base class properties, such as this.reservation
        if (this.reservation) {
            View.showMessage(this.reservation.toString());
        } else {
            alert('Reservation object has not been created yet');
        }
    }
});