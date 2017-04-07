/**
 * Controller for viewing conflicted room reservations.
 */
var reservationConflictsController = View.extendController("reservationConflictsController", reservationSelectControllerBase, {
	
	/** Create Reservation View */
	createReservationView: "ab-rr-create-room-reservation.axvw",
	
	/** Edit single room in a conference call View */
	// KB 3045630 allow changing building and time, so use regular view
    editSingleReservationInConferenceCallView: "ab-rr-create-room-reservation.axvw",
	
	/** Reservation Details View */
	reservationDetailsView: "ab-rr-room-reservation-details-conflicted.axvw",
	
	/** Name of the WFR to cancel multiple reservations */
	cancelMultipleWfr: "AbWorkplaceReservations-roomReservationService-cancelMultipleRoomReservations",
	
	/** Name of the WFR to cancel a single reservation */
	cancelSingleWfr: "AbWorkplaceReservations-roomReservationService-cancelRoomReservation",
	
	/** Name of the WFR to cancel a single conference call reservation */
    cancelSingleConferenceCallWfr: "AbWorkplaceReservations-conferenceCallReservationService-cancelConferenceReservation",
	
	modifyStatusFilter: function() {
		// Remove not applicable reserve.status values from the dropdown.
		var field = this.consolePanel.fields.get('reserve.status');
		var optionsToRemove = {
				'Awaiting App.' : '',
				'Rejected' : '',
				'Confirmed' : '',
				'Closed': ''
		};
		field.removeOptions(optionsToRemove);
	},
	
	/**
	 * After refresh check configuration parameters to enable the edit and cancel buttons.
	 */
	selectPanel_afterRefresh: function() {
		var controller = this;
		
		this.selectPanel.gridRows.each( function(row) {
			var now = new Date();
			var startDate = row.getFieldValue('reserve.date_start');
			var startTime = row.getFieldValue('reserve.time_start'); 
			 
			// add the hours and minutes
			startDate.setHours(startTime.getHours());
			startDate.setMinutes(startTime.getMinutes());
			
			var status = row.getFieldValue('reserve.status');
				
			var editButton = row.actions.get('edit');
			var cancelButton = row.actions.get('cancel'); 
			
			// compare with today, not with current time
			var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			var daysDifference = parseInt((startDate - today)/(24*60*60*1000));
			
			if (status == 'Room Conflict') {
				// these roles don't have a restriction	
				if ( View.user.isMemberOfGroup('RESERVATION MANAGER') || View.user.isMemberOfGroup('RESERVATION SERVICE DESK') ) {
					// no restriction on days ahead, announce days or cancel days
					cancelButton.forceDisable(false);
			        // disable edit button for past reservations
					editButton.forceDisable(daysDifference < 0);
			    } else {
			    	// if date is in the past, disable	
					if (startDate < now) { 
				        editButton.forceDisable(true); 
				        cancelButton.forceDisable(true);		         
					} else {
						editButton.forceDisable(false); 
						cancelButton.forceDisable(false);
					}  							 
			    }
			} else {
				editButton.forceDisable(true); 
		        cancelButton.forceDisable(true);
			}
		});
	},
	
	/**
	 * Conflicts are always edited one by one.
	 */
	selectPanel_onEdit: function(row) { 	 		
		this.editSingle(row);
	},
	
	/**
     * Edit single reservation instance.
     */
    editSingle: function(row, panelToClose) {       
        var parentView =  View.getView('parent');
        var tabPanel = parentView.panels.get('tabs');   
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("reserve.res_id", row.getFieldValue("reserve.res_id") );
        
        var targetView = this.createReservationView;
        if (this.isConferenceCall(row)) {
            targetView = this.editSingleReservationInConferenceCallView;
        }
        
        // edit record
        tabPanel.createTab(targetView, restriction, false);
    },
    
    /**
	 * Don't offer to cancel multiple occurrences. Open the dialog to confirm canceling only this reservation.
	 */
	selectPanel_onCancel: function(row) { 	 	
		this.selectedRow = row; 
		this.confirmCancelPanel.showInWindow( {x: 400, y: 200, width: 500, height: 210, title: getMessage("confirmCancelReservation"), modal: true});
	},
	
});

