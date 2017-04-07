var emNameLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reportTabController = View.createController('reportTabController', {

	wr_create_report_afterRefresh: function() {
		//BRG.UI.addNameField('report_driver_info', this.wr_create_report, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_requestor_info', this.wr_create_report, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		BRG.UI.addNameField('wr_driver_info', this.wr_create_report, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
//		BRG.UI.addNameField('report_vehicle_info', this.wr_create_report, 'wr.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'wr.eq_id'}, vehicleIdLabelConfig);
	}
	// ***************************************************************************
	// Fills the information on the details with information from the Info Tab.
	// ***************************************************************************
/*	prefillReportInfo: function() {
		// Pre-fill fields with em information.

		// Cannot use the "user" object because the request may be completed
		// for someone else.
		// Get the information from the "wr_create_details" in the prev tab.
		var wr_create_details = View.getControl('','wr_create_details');
		this.wr_create_report.setFieldValue('wr.requestor', wr_create_details.getFieldValue('activity_log.requestor'));
		BRG.UI.addNameField('wr_requestor_info', this.wr_create_report, 'wr.requestor', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.requestor'}, emNameLabelConfig);
		this.wr_create_report.setFieldValue('wr.dv_id', wr_create_details.getFieldValue('activity_log.dv_id'));
		this.wr_create_report.setFieldValue('wr.dp_id', wr_create_details.getFieldValue('activity_log.dp_id'));
		this.wr_create_report.setFieldValue('wr.driver', wr_create_details.getFieldValue('activity_log.driver'));
		BRG.UI.addNameField('wr_driver_info', this.wr_create_report, 'wr.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'wr.driver'}, emNameLabelConfig);
		this.wr_create_report.setFieldValue('wr.prob_type', wr_create_details.getFieldValue('activity_log.prob_type'));
		this.wr_create_report.setFieldValue('wr.vehicle_type_req', wr_create_details.getFieldValue('activity_log.vehicle_type_req'));
		this.wr_create_report.setFieldValue('wr.destination_type', wr_create_details.getFieldValue('activity_log.destination_type'));
		this.wr_create_report.setFieldValue('wr.destination', wr_create_details.getFieldValue('activity_log.destination'));
		this.wr_create_report.setFieldValue('wr.duration_est_baseline', wr_create_details.getFieldValue('activity_log.duration_est_baseline'));
		this.wr_create_report.setFieldValue('wr.passenger_count', wr_create_details.getFieldValue('activity_log.passenger_count'));
		this.wr_create_report.setFieldValue('wr.distance_est', wr_create_details.getFieldValue('activity_log.distance_est'));
		this.wr_create_report.setFieldValue('wr.date_pickup', wr_create_details.getFieldValue('wr.date_pickup'));
		this.wr_create_report.setFieldValue('wr.time_pickup', wr_create_details.getFieldValue('wr.time_pickup'));
		//this.wr_create_report.setFieldValue('wr.time_pickup', formatTime(wr_create_details.getFieldValue('activity_log.time_required')));
		this.wr_create_report.setFieldValue('wr.date_dropoff', wr_create_details.getFieldValue('wr.date_dropoff'));
		this.wr_create_report.setFieldValue('wr.time_dropoff', wr_create_details.getFieldValue('wr.time_dropoff'));
		this.wr_create_report.setFieldValue('wr.budget_owner', wr_create_details.getFieldValue('activity_log.budget_owner'));
		this.wr_create_report.setFieldValue('wr.description', wr_create_details.getFieldValue('activity_log.description'));

		this.wr_create_report.save();
	}
*/
})
	
function createNewRequest(){
// clear/reload the create tabs and change to the "My Information" tab
			
	View.getControl('', 'my_info_form').refresh();
	View.getControl('', 'wr_create_details').refresh();
	View.panels.get('wr_create_tabs').selectTab('create_wr_info');
}

/*function formatTime(time) {
	var myTime = "";
	var tempArray1;
	tempArray = time.split(".");
	myTime = tempArray[0];
	
	var tempArray2 = myTime.split(":");
	var myHour = tempArray2[0];
	var myAMPM = "AM";
	
	switch(myHour) {
		case '13':
			myHour = '1';
			myAMPM = 'PM';
			break;
		case '14':
			myHour = '2';
			myAMPM = 'PM';
			break;
		case '15':
			myHour = '3';
			myAMPM = 'PM';
			break;
		case '16':
			myHour = '4';
			myAMPM = 'PM';
			break;
		case '17':
			myHour = '5';
			myAMPM = 'PM';
			break;
		case '18':
			myHour = '6';
			myAMPM = 'PM';
			break;
		case '19':
			myHour = '7';
			myAMPM = 'PM';
			break;
		case '20':
			myHour = '8';
			myAMPM = 'PM';
			break;
		case '21':
			myHour = '9';
			myAMPM = 'PM';
			break;
		case '22':
			myHour = '10';
			myAMPM = 'PM';
			break;
		case '23':
			myHour = '11';
			myAMPM = 'PM';
			break;
		default:
			break;
	}

	myTime = myHour + ":" + tempArray2[1] + " " + myAMPM;
	
	return myTime;
}*/
