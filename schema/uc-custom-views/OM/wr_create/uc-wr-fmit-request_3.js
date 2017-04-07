// CHANGE LOG
// 2013-03-12  EWONG - Added Email and Phone requirement for the Contact Customer Care email option
// 2016-02-09 - MSHUSSAI - WR305063 - Added Code to Email FM Stores
// 2016-05-13 - MSHUSSAI - Added code to fix Issue with FMD IT not receving emails


var wr_create_details_Controller = View.createController('wr_create_details_Controller', {
	afterViewLoad: function() {
		this.inherit();

	},

	afterInitialDataFetch: function() {
		this.inherit();
	},

	wr_create_details_afterRefresh: function() {
		this.wr_create_details.setFieldValue('activity_log.requestor', View.user.name);
		this.wr_create_details.setFieldValue('activity_log.phone_requestor', View.user.employee.phone);
	},

	// ***************************************************************************
	// Fills the information on the details with information from the Info Tab.
	// ***************************************************************************
	prefillInfo: function() {
		// Pre-fill fields with em information.

		// Cannot use the "user" object because the request may be completed
		// for someone else.
		// Get the information from the "my_info_form" in the prev tab.
		var infoForm = View.getControl('','my_info_form');

		this.wr_create_details.setFieldValue('activity_log.requestor', infoForm.getFieldValue('em.em_id'));
		this.wr_create_details.setFieldValue('activity_log.dv_id', infoForm.getFieldValue('em.dv_id'));
		this.wr_create_details.setFieldValue('activity_log.dp_id', infoForm.getFieldValue('em.dp_id'));
		this.wr_create_details.setFieldValue('activity_log.phone_requestor', infoForm.getFieldValue('em.phone'));

	},

	wr_create_details_onSubmit: function() {
		// check the send type and submit a request or email
		var selectedValue = "";
		var radioButtons = document.getElementsByName("requestType");
		for( i = 0; i < radioButtons.length; i++ ) {
			if(radioButtons[i].checked) {
				selectedValue = radioButtons[i].value;
				break;
			}
		}

		switch (selectedValue) {
		case "work_request":
			this.sendAsRequest();
					
			break;
		case "email_only":
			this.sendAsEmail("ccc");			
			break;
		case "res_email":
			this.sendAsEmail("res");			
			break;
		case "stores_email":
			this.sendAsEmail("stores");			
			break;
		default:
			View.showMessage("Please select a contact method.");
			break;
		}
	},

	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	sendAsRequest: function() {

		var ds = View.dataSources.get(this.wr_create_details.dataSourceId);


		var record = this.wr_create_details.getRecord();
		var parsedDesc = replaceLF(record.values['activity_log.description']);

		if (parsedDesc == "") {
			View.showMessage("Please enter a Description before submitting.");
			return;
		}

		record.values['activity_log.description'] = parsedDesc;
		var recordValues = ds.processOutboundRecord(record).values;

		// get the activity_log_id if it's from a "created" record.
		// Mostly for error checking as it should always be new.
		var activity_log_id = 0;
		var activity_log_id_value = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value
		if ( activity_log_id_value != undefined && activity_log_id_value != '') {
			activity_log_id = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value;
		}

		// Note: Can check for Duplication/Similar requests here.

		var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details);

		// Submit Request
		try {
			var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id,submitRecord);

			this.wr_create_details.actions.get("submit").enableButton(false);  // disable the submit button so it doesn't get submitted twice.


			var requestor = recordValues["activity_log.requestor"].replace("'", "''");
			var date_requested = recordValues["activity_log.date_requested"];
			var rest = "wr_id = (SELECT max(wr_id) FROM wr WHERE requestor='"+requestor+"' and date_requested ='"+date_requested+"')";

			var actLogId = submitResult.data['activity_log_id'];
			var wrId = UC.Data.getDataValue('wr', 'wr_id', rest);

			// Workaround for Submit Request WF losing CF/LF
			// Save the description again... to both activity_log and wr
			var actLogRecord= new Ab.data.Record();
			actLogRecord.isNew = false;
			actLogRecord.setValue('activity_log.activity_log_id', actLogId);
			actLogRecord.setValue('activity_log.description', parsedDesc);
			actLogRecord.oldValues = new Object();
			actLogRecord.oldValues['activity_log.activity_log_id'] = actLogId;
			View.dataSources.get('ds_activity_log').saveRecord(actLogRecord);

			var wrRecord= new Ab.data.Record();
			wrRecord.isNew = false;
			wrRecord.setValue('wr.wr_id', wrId);
			wrRecord.setValue('wr.description', parsedDesc);
			wrRecord.oldValues = new Object();
			wrRecord.oldValues['wr.wr_id'] = wrId;
			View.dataSources.get('ds_wr_save').saveRecord(wrRecord);

			this.sendAsEmail("fmdit");	
			
			alert("Your request has been sent to the FMIT team. Thank you for your feedback.");
			// Email the Requestor
			//JC -----------------------------------------------------------------Turned off temporarily.
			//sendRequestorEmail();

		}
		catch (e) {
			if (e.code == 'ruleFailed'){
				View.showMessage(e.message);
			}else{
			    Workflow.handleError(e);
			}
		}
		View.closeThisDialog();
	},

	sendAsEmail: function(recipient) {
		var record = this.wr_create_details.getRecord();
		var parsedDesc = replaceLF(record.values['activity_log.description']);
		var requestor = record.values['activity_log.requestor'];

		if (parsedDesc == "") {
			View.showMessage("Please enter a Description before submitting.");
			return;
		}

        var reqEmail = $('requestorEmail').value;
        var reqPhone = $('requestorPhone').value;

		if (reqEmail == "" || reqPhone == "") {
			View.showMessage("Please enter an email and phone number before submitting.");
			return;
		}
		
		var sendTo = "";
		if (recipient == "ccc") {
			sendTo = UC.Data.getDataValue('afm_activity_params', 'param_value',  "activity_id='AbSystemAdministration' AND param_id='UC_CONTACT_US_EMAIL'");
		} else if (recipient == "res") {
			sendTo = UC.Data.getDataValue('afm_activity_params', 'param_value',  "activity_id='AbSystemAdministration' AND param_id='UC_CONTACT_RES_EMAIL'");
		} else if (recipient == "fmdit") {
			sendTo = UC.Data.getDataValue('afm_activity_params', 'param_value', "activity_id='AbSystemAdministration' AND param_id='UC_CONTACT_FMDIT_EMAIL'");
		} else if (recipient == "stores") {
			sendTo = UC.Data.getDataValue('afm_activity_params', 'param_value', "activity_id='AbSystemAdministration' AND param_id='UC_CONTACT_FMSTORES_EMAIL'");
		}
		try {
			var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmailCustomTags', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_FMIT_CONTACT_US_BODY','UC_FMIT_CONTACT_US_SUBJECT','','','',
			'', sendTo, {"description": parsedDesc, "requestor": requestor, "phone": reqPhone, "email": reqEmail });

			alert("Your request has been sent to our Customer Care team. Thank you for your feedback.");
		}
		catch (ex) {

		}
		
		View.closeThisDialog();
	},

	// ***************************************************************************
	// Check and Submit the request to Archibus SLA engine
	// ***************************************************************************
	checkForm: function(acct) {


		if (this.validateForm(acct)) {

			// format the description properly.  convert CR/LF.

			var ds = View.dataSources.get(this.wr_create_details.dataSourceId);


			var record = this.wr_create_details.getRecord();
			var parsedDesc = replaceLF(record.values['activity_log.description']);

			record.values['activity_log.description'] = parsedDesc;
			var recordValues = ds.processOutboundRecord(record).values;



			// get the activity_log_id if it's from a "created" record.
			// Mostly for error checking as it should always be new.
			var activity_log_id = 0;
			var activity_log_id_value = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value
			if ( activity_log_id_value != undefined && activity_log_id_value != '') {
				activity_log_id = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value;
			}

			var parameters = {
				tableName: 'activity_log',
				fieldName: 'activity_log_id',
				'activity_log.activity_log_id': activity_log_id,
				fields: toJSON(recordValues)
			};

			// Note: Can check for Duplication/Similar requests here.

			var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details);

			// Submit Request
			try {
				// 18.2 var submitResult = Workflow.call('AbBldgOpsHelpDesk-submitRequest', parameters);
				submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id,submitRecord);
				this.wr_create_details.actions.get("submit").enableButton(false);  // diable the submit button so it doesn't get submitted twice.

				// Switch to next tab after setting the restriction.
				var requestor = recordValues["activity_log.requestor"].replace("'", "''");
				var date_requested = recordValues["activity_log.date_requested"];
				var rest = "wr_id = (SELECT max(wr_id) FROM wr WHERE requestor='"+requestor+"' and date_requested ='"+date_requested+"')";

				var actLogId = submitResult.data['activity_log_id'];
				var wrId = UC.Data.getDataValue('wr', 'wr_id', rest);
				// Workaround for Submit Request WF losing CF/LF
				// Save the description again... to both activity_log and wr
				var actLogRecord= new Ab.data.Record();
				actLogRecord.isNew = false;
				actLogRecord.setValue('activity_log.activity_log_id', actLogId);
				actLogRecord.setValue('activity_log.description', parsedDesc);
				actLogRecord.oldValues = new Object();
				actLogRecord.oldValues['activity_log.activity_log_id'] = actLogId;
				View.dataSources.get('ds_activity_log').saveRecord(actLogRecord);

				var wrRecord= new Ab.data.Record();
				wrRecord.isNew = false;
				wrRecord.setValue('wr.wr_id', wrId);
				wrRecord.setValue('wr.description', parsedDesc);
				wrRecord.oldValues = new Object();
				wrRecord.oldValues['wr.wr_id'] = wrId;
				View.dataSources.get('ds_wr_save').saveRecord(wrRecord);

				var tabsPanel = View.getControl('', 'wr_create_tabs');
				tabsPanel.setTabRestriction('create_wr_report', rest);
				tabsPanel.refreshTab('create_wr_report');
				tabsPanel.selectTab('create_wr_report');

				// Email the Requestor

				//JC -----------------------------------------------------------------Turned off temporarily.
				sendRequestorEmail();

			}
			catch (e) {
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				    Workflow.handleError(e);
				}
			}
		}

	}
});


// *****************************************************************************
// Replaces lone LF (\n) with CR+LF (\r\n)
// *****************************************************************************
function replaceLF(value)
{
	String.prototype.reverse = function () {
		return this.split('').reverse().join('');
	};

	return value.reverse().replace(/\n(?!\r)/g, "\n\r").reverse();
}

function requestTypeChanged() {
    var emailElement = $('requestorEmail');
    var phoneElement = $('requestorPhone');

		var selectedValue = "";
		var radioButtons = document.getElementsByName("requestType");
		for( i = 0; i < radioButtons.length; i++ ) {
			if(radioButtons[i].checked) {
				selectedValue = radioButtons[i].value;
				break;
			}
		}

		switch (selectedValue) {
		case "work_request":
			emailElement.parentNode.parentNode.style.display = "";
            phoneElement.parentNode.parentNode.style.display = "";
			break;
		case "email_only":
			emailElement.parentNode.parentNode.style.display = "";
            phoneElement.parentNode.parentNode.style.display = "";
			break;
		case "res_email":
			emailElement.parentNode.parentNode.style.display = "";
            phoneElement.parentNode.parentNode.style.display = "";
			break;
		case "stores_email":
			emailElement.parentNode.parentNode.style.display = "";
            phoneElement.parentNode.parentNode.style.display = "";
			break;
		default:

			break;
		}

}