var reservationAttendeeController =  View.createController("reservationAttendeeController", { 
	
	addEmailToAttendees: function(attendees, email) {
		if (email != "" && attendees.indexOf(email) < 0) {
			attendees.push(email);
		} 		
	
		return attendees;
	},
	
	employeePanel_onSelect: function() {	
		 		
		var reservationController =  View.getOpenerView().controllers.get("reservationTimelineController");
	
		var rows = this.employeePanel.getSelectedRows();
		var attendees = reservationController.selectedAttendees; 
		
		if (rows.length == 0) {
			View.showMessage(getMessage("noAttendeesAdded"));
			return;
		}
		
		for (var i=0; i<rows.length; i++) {
			var email = rows[i].row.getFieldValue("em.email");					
			attendees = this.addEmailToAttendees(attendees, email); 
		}		  
		
		reservationController.reloadAttendeeTimeline();
  
		View.closeThisDialog.defer(100, View);
	},
	 
		
	visitorPanel_onSelect: function() {
 		
		var reservationController =  View.getOpenerView().controllers.get("reservationTimelineController");
 		
		var rows = this.visitorPanel.getSelectedRows();
		var attendees = reservationController.selectedAttendees; 
		
		if (rows.length == 0) {
			View.showMessage(getMessage("noAttendeesAdded"));
			return;
		}		
		
		for (var i=0; i<rows.length; i++) {
			var email = rows[i].row.getFieldValue("visitors.email");
			
			attendees = this.addEmailToAttendees(attendees, email); 
		}		
		
		reservationController.reloadAttendeeTimeline();
		  
		View.closeThisDialog.defer(100, View);
	},
	

	employeePanel_onClose: function() {	
		View.closeThisDialog.defer(100, View);		
	},
	
	visitorPanel_onClose: function() {	
		View.closeThisDialog.defer(100, View);		
	}	 

	 

});