var viewAttendeeDetailsController =  View.createController("viewAttendeeDetailsController", {  
	
	afterInitialDataFetch: function() {   
		this.employeePanel.refresh("em.email = '" + View.parameters.email + "'"); 	 
	},
	
	employeePanel_afterRefresh: function() {
		if (this.employeePanel.getFieldValue("em.em_id") != "") {
			this.employeePanel.show(true);
			this.visitorPanel.show(false);
		} else {
			this.employeePanel.show(false);
			this.visitorPanel.refresh("visitors.email = '" + View.parameters.email + "'"); 	
		}
	},
	
	visitorPanel_afterRefresh: function() {
		if (this.employeePanel.getFieldValue("em.em_id") != "") { 
			return;
		}
		
		if (this.visitorPanel.getFieldValue("visitors.visitor_id") != "") {
			this.employeePanel.show(false);
			this.visitorPanel.show(true);
		} else {
			this.employeePanel.show(false);
			this.visitorPanel.show(false);
			View.showMessage(getMessage("attendeeUnknown") + View.parameters.email); 
		}
	}
	
});