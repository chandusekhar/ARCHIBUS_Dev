/**
 * Controller for viewing room reservations.
 */
var reservationSelectController = View.extendController("reservationSelectController", reservationSelectControllerBase, {
	
	/** Create Reservation View */
	createReservationView: "ab-rr-create-room-reservation.axvw",
	
	/** Edit single room in a conference call View */
    editSingleReservationInConferenceCallView: "ab-rr-edit-one-room-confcall-reservation.axvw",
    
    /** Edit a full conference call reservation View */
    editFullConferenceCallView: "ab-rr-create-confcall-reservation.axvw",
	
	/** Reservation Details View */
	reservationDetailsView: "ab-rr-room-reservation-details.axvw",
	
	/** Name of the virtual location field in the grid */
	locationProperty: "reserve_rm.room",
	
	/** Name of the WFR to cancel multiple reservations */
	cancelMultipleWfr: "AbWorkplaceReservations-roomReservationService-cancelMultipleRoomReservations",
	
	/** Name of the WFR to cancel a single reservation */
	cancelSingleWfr: "AbWorkplaceReservations-roomReservationService-cancelRoomReservation",
	
	/** Name of the WFR to cancel a single conference call reservation */
    cancelSingleConferenceCallWfr: "AbWorkplaceReservations-conferenceCallReservationService-cancelConferenceReservation",
	
	/** Name of the WFR to cancel a recurring reservation */
	cancelRecurringWfr: "AbWorkplaceReservations-roomReservationService-cancelRecurringRoomReservation",
	
	/** Name of the WFR to cancel a recurring conference call reservation */
    cancelRecurringConferenceCallWfr: "AbWorkplaceReservations-conferenceCallReservationService-cancelRecurringConferenceReservation",
	
	/** Name of the WFR to copy a reservation */
	copyWfr: "AbWorkplaceReservations-roomReservationService-copyRoomReservation",
	
	/** Building id field name for the rows in the grid */
	buildingIdFieldName: "reserve_rm.bl_id",
	
	/**
	 * Check whether the room reservation can be cancelled / edited based on
	 * restrictions in the room arrangement.
	 */
	checkRoom: function(row, startDate, now, daysDifference) {
		var editButton = row.actions.get('edit');
		var cancelButton = row.actions.get('cancel'); 
		var cancelDays = parseInt(row.getFieldValue('rm_arrange.cancel_days'));
		var announceDays = parseInt(row.getFieldValue('rm_arrange.announce_days'));
		var maxDaysAhead = parseInt(row.getFieldValue('rm_arrange.max_days_ahead'));
		
		var cancelTime = row.getFieldValue('rm_arrange.cancel_time');
		cancelTime.setFullYear(now.getFullYear());
		cancelTime.setMonth(now.getMonth());
		cancelTime.setDate(now.getDate());
		
		var announceTime = row.getFieldValue('rm_arrange.announce_time');
		announceTime.setFullYear(now.getFullYear());
		announceTime.setMonth(now.getMonth());
		announceTime.setDate(now.getDate());	
         // check for conditions for cancelling date and time
    	 if (daysDifference < cancelDays) { 
    		 cancelButton.forceDisable(true);
    	 } else if (daysDifference == cancelDays && now > cancelTime) { 	 
    		 cancelButton.forceDisable(true);
    	 } else {
    		 cancelButton.forceDisable(false);
    	 }

    	 // check for conditions for edit date and time
    	 var maxDaysAheadOK = View.user.isMemberOfGroup('RESERVATION ASSISTANT')
    	 	|| View.user.isMemberOfGroup('RESERVATION SERVICE DESK')
    	 	|| View.user.isMemberOfGroup('RESERVATION MANAGER')
    	 	|| daysDifference <= maxDaysAhead;
    	 if (daysDifference < announceDays || !maxDaysAheadOK) {
    		 editButton.forceDisable(true);
    	 } else	 if (daysDifference == announceDays && now > announceTime) {	 
    		 editButton.forceDisable(true);
    	 } else {
    		 editButton.forceDisable(false);  
    	 }
	},
	
	/**
     * Edit single reservation instance.
     * This overrides the default behavior by adding a check for conference calls.
     */
    editSingle: function(row) {
        if (this.isConferenceCall(row)) {
            this.selectedRow = row;
            this.chosenConferenceEditFunction = this.editRoomReservation;
            this.confirmEditConferencePanel.showInWindow( {x: 400, y: 200, width: 500, height: 150, title: getMessage("confirmEditReservation"), modal: true});
        } else {
        	this.editRoomReservation(row, this.createReservationView);
        }
    },
    
    /**
     * Edit recurring reservation, modified for conference call reservations.
     */
    editRecurring: function(row) {
        if (this.isConferenceCall(row)) {
            this.selectedRow = row;
            this.chosenConferenceEditFunction = this.editRecurringReservation;
            this.confirmEditConferencePanel.showInWindow( {x: 400, y: 200, width: 500, height: 150, title: getMessage("confirmEditReservation"), modal: true});
        } else {
        	this.editRecurringReservation(row, this.createReservationView);
        }
    },
    
    /**
     * Edit recurring reservation, modified for conference call reservations.
     */
    editRecurringReservation: function(row, targetView) {
        var reservationId = row.getFieldValue("reserve.res_id");
        var parentId = row.getFieldValue("reserve.res_parent");
        
        var parentView =  View.getView('parent');
        var tabPanel = parentView.panels.get('tabs');
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("reserve.res_type", "recurring");
        restriction.addClause("reserve.res_id", reservationId);
        if (this.isConferenceCall(row)) {
            restriction.addClause("reserve.res_conference", row.getFieldValue("reserve.res_conference"));
        }
        
        // edit record      
        tabPanel.createTab(targetView, restriction, false);
    },
    
    /**
     * Edit a single room reservation / single conference call reservation.
     * 
     * @param {object} row
     * @param {string} target view
     */
    editRoomReservation: function(row, targetView) {
        var parentView =  View.getView('parent');
        var tabPanel = parentView.panels.get('tabs');
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("reserve.res_id", row.getFieldValue("reserve.res_id"));
        if (this.isConferenceCall(row)) {
            restriction.addClause("reserve.res_conference", row.getFieldValue("reserve.res_conference"));
        }
        // edit record
        tabPanel.createTab(targetView, restriction, false);
    },
    
    /**
     * Check via WFR call whether the current user is allowed to edit the specified conference call.
     * Throws an exception if it's not allowed.
     */
    checkEditFullConferenceCall: function(conferenceId) {
        var result = Workflow.callMethod("AbWorkplaceReservations-conferenceCallReservationService-canEditConferenceCall", conferenceId);
        if (result.code != "executed") {
            throw result;
        }
    },
    
    /**
     * Confirm the edit conference call reservation.
     */
    confirmEditConferencePanel_onConfirm: function() {
        var editOption = document.getElementsByName("editConferenceCallOption");
        
        try {
            var targetView = null;
            if (editOption[0].checked) {
                targetView = this.editSingleReservationInConferenceCallView;
            } else if (editOption[1].checked) {
                this.checkEditFullConferenceCall(this.selectedRow.getFieldValue("reserve.res_conference"));
                targetView = this.editFullConferenceCallView;
            }
            
            if (targetView == null) {
                View.showMessage(getMessage("confirmSelectOption"));
            } else {
                this.chosenConferenceEditFunction(this.selectedRow, targetView);
                this.confirmEditConferencePanel.closeWindow();
            }
        } catch (e) {
            Workflow.handleError(e);
        }
    }
	
});

