var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
 //       textColor : "#000000", defaultValue : "", raw : false };

		
var reportTabController = View.createController('reportTabController', {

	afterInitialDataFetch: function() {
		sendRequestorEmail();
	},

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

function sendRequestorEmail()
{
	//var infoForm = View.getControl('','my_info_form');
	var summaryForm = View.getControl('','wr_create_report');

	var eAc_id = summaryForm.getFieldValue('wr.ac_id');
	var eDescription = summaryForm.getFieldValue('wr.description');

	//var eFullName = infoForm.getFieldValue('em.em_id');
	var eFullName = View.user.employee.id;
	
	//var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+infoForm.getFieldValue('em.em_id').replace(/'/g, "''")+"'");
	var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+View.user.employee.id.replace(/'/g, "''")+"'");

	if (emRecord != null) {
		eFullName = emRecord['em.name_first']['l'] + " " + emRecord['em.name_last']['l'];
	}

	var emailMessage = "<b>* For building-related emergencies such as water leaks, broken glass, and power outages, contact Facilities Management at 403-220-7555, Monday to Friday, 8:00 a.m. to 4:30 p.m. *</b> <br><br>" +
					eFullName + ",<br/><br/>Thank you for contacting us. This is an automated response confirming the receipt of your work request. One of our staff will get back to you as soon as possible. For your records, the details of the ticket are listed below. When contacting us (220-7555) please make sure to refer to this request number.<br>" +
					"<br/><table>";

	emailMessage = emailMessage +
					"<tr><td><b>Ticket ID:</b></td>" +
					"<td>" + summaryForm.getFieldValue('wr.wr_id') +"</td></tr>";

	if (eDescription != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Subject:</b>" +
					"    </td>" +
					"    <td>" +
					eDescription +
					"    </td>" +
					"  </tr>";
	}
	
	if (eAc_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Account Code:</b>" +
					"    </td>" +
					"    <td>" +
					eAc_id +
					"    </td>" +
					"  </tr>";
	}


	// Status is always requested.  No need to do 2 extra queries (from wr and afm_flds enum_list).
	emailMessage = emailMessage +
				"<tr><td><b>Status:</b></td>" +
				"<td>Requested</td></tr>";

	emailMessage = emailMessage +
					"</table><br/><br/>You can check the status of your work request online at: <a href='http://afm.ucalgary.ca'>http://afm.ucalgary.ca/</a>."+
					"<br/><br/>Kind regards,<br/>Facilities Management & Development<br/><hr>" +
					"<span style='font-size:0.8em'>* You have received this email because you are listed as the requestor.*<br>" +
					"* Contact afm@ucalgary.ca if you have any questions or for more information.*</span>";

	//alert(emailMessage);

	try {
/* 		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRCREATE_REQ_BODY','UC_WRCREATE_REQ_SUBJECT','wr','wr_id',summaryForm.getFieldValue('wr.wr_id'),
			'', infoForm.getFieldValue('em.email')); */
			
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRCREATE_REQ_BODY','UC_WRCREATE_REQ_SUBJECT','wr','wr_id',summaryForm.getFieldValue('wr.wr_id'),
			'', View.user.email);

	}
	catch (ex) {

	}


    /*
	uc_email(infoForm.getFieldValue('em.email'),
			 'afm@ucalgary.ca',
			 '[Automated] Archibus - Your Work Request #[' + summaryForm.getFieldValue('wr.wr_id') + '] has been submitted to FM.'
			 , emailMessage,
			 'standard.template');
    */
}