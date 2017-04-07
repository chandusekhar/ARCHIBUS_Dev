
// make sure not to have conflicts with $ operator
jQuery.noConflict(); 

/**
* Room Reservation controller for editing a single room in a conference call.
* The controller extends the room reservation base controller.
* <p>
* Controller is used when editing a single room in a conference call reservation.
* <p>
*
* @author Yorik Gerlo
* @since 21.3
*/
var reservationTimelineController = View.extendController('reservationTimelineController', roomReservationBaseController, {
	
    confirmationView: "ab-rr-create-room-reservation-confirm.axvw",
    
    /**
     * Create a custom input field in the panel header and make it auto-complete with email matching.
     */
    insertAttendeeInputField: function() { 
        // no attendees panel is showed, so no input field
    },
    
    /**
     * Called after the console defaults are loaded. This disables
     * changing time and building.
     */
    modifyConsoleAfterLoading: function() {
        // Don't use enableField, that would disable all fields in the fluid layout.
        // Disable changing the time.
        this.consolePanel.getFieldElement("rm_arrange.day_start").readOnly = true;
        this.consolePanel.getFieldElement("rm_arrange.day_end").readOnly = true;
        // Also disable changing the building, because we could end up in a different time zone.
        this.consolePanel.getFieldElement("rm_arrange.bl_id").readOnly = true;
        
        // set date picker read only
        jQuery("#datepicker").datepicker('disable');
        jQuery("#datepicker").datepicker('setDate', this.startDate);
    },
    
    /**
     * Get the first and last date in the recurrence pattern.
     */
    getFirstAndLastDate: function(startDate, endDate, recurringRule, parentId) {
        // pass a 0 conference id, we want to consider only one location
        var conferenceId = 0;
        return Workflow.callMethod('AbWorkplaceReservations-reservationRecurrenceService-getFirstAndLastDate', 
                startDate, endDate, recurringRule, parentId, conferenceId);
    },
    
    /**
     * Edit the room reservation from the time line.
     */
    editRoomReservation: function(event) {
        ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_start", event.dateTimeStart);
        ABRV_setFormattedTimeValue(this.reserveRoomPanel, "reserve_rm.time_end", event.dateTimeEnd);
        
        this.reserveRoomPanel.enableField("reserve_rm.time_start", false);
        this.reserveRoomPanel.enableField("reserve_rm.time_end", false);
        
        this.reserveRoomPanel.showInWindow({
            width: 450, 
            height: 380, 
            title: getMessage("editRoomReservation"),
            closeButton: false
        });
    },
    
    /**
     * Create the attendee timeline control instance.
     */
    createAttendeeTimeline: function() {
        // do nothing, we don't show an attendee time line
    },
    
    /**
     * Update the attendee timeline panel.
     */
    updateAttendeeTimelinePanel: function(event) {
        // do nothing as no attendee panel is displayed
    },
    
    /**
     * Indicates whether the room time line should be editable.
     * 
     * @return {boolean} true if editable, false if read-only
     */
    isRoomTimelineEditable: function() {
        return false;
    },
    
    /**
     * Load the attendee timeline with free/busy events from attendees.
     */
    loadAttendeeTimeline: function() {
        // do nothing as there is no attendee time line displayed
        this.updateProgressBar();
    }

});
