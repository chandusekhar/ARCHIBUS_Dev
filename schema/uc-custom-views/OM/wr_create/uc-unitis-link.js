
View.createController('ucUnitisLink', {

	afterInitialDataFetch: function() {
		var userName = View.user.employee.id;
		var userEmail = View.user.email;
		var body = "";
		var url="";
		
		body = "** Note to Requester: ** %0d Ensure your Contact Info on the right is correct.%0d%0d";
		body = body + "Please enter your information:%0d";
		body = body + "===================================== %0d";
		body = body + "My Name is: %0d";
		body = body + "My Department is: %0d%0d";
		body = body + "Please enter any corrections to your contact information:%0d";
		body = body + "===================================== %0d";
		body = body + "My Correct Email is: %0dMy Correct Phone Number is:%0dMy Correct Room Number is:%0dMy University EID is: "+userName;
		body = body + "%0d%0dThis change request must be manually verified and processed. Please allow up to two weeks for the changes to take effect.%0d%0d";
		
		body = body + "%0dThis request was generated from Archibus Facilities Management http%3a%2f%2fafm.ucalgary.ca%0d";

		url="http://contacts.ucalgary.ca/contact-us/feedback?title=Directory%20of%20People&url=contacts&thickbox=1&TB_iframe=true&type=Correction"
		this.unitisPanel.loadView(url + 
								  "&feedback=" + body + 
								  "&summary=%5bArchibus%20Generated%5d%20eID%20profile%20correction%20request" + 
								  "&name="+userName+"&email="+userEmail);
	}
});
