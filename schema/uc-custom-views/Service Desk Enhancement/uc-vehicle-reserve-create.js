//  Change Log
//  2010/03/31 - JJYCHAN - Resolves Issue: 27. Checks to see if a valid activity_log.description
//					       has been entered (validateform:function)
//  2010/04/06 - JJYCHAN - Resolves Issue: 50. Reformatted email sent to requestor.
//  2010/05/10 - EWONG - Issue: 129. Clear fl/rm when changing bl, clear dp when changing dv.
//  2010/06/02 - JJYCHAN - Revamped account code checker
//  2010/06/23 - EWONG - Issue: 236. Line Feeds not saving on descriptions.
//  2010/06/30 - EWONG - Issue: 155. Updated email text and moved email composing to separate function.
//  2010/08/11 - JJYCHAN - ISSUE 241 - Changed all emails referring to workspace@ucalgary.ca to afm@ucalgary.ca
//  2011/03/22 - JJYCHAN - Included the WR_ID in the subject header of created emails sent to requestor.
var brgTest = false;

var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };

// *****************************************************************************
// View controller object for the Details tab.
// *****************************************************************************
var detailsTabController = View.createController('detailsTabController', {
	advancedHours :24,
	afterViewLoad: function() {
		this.inherit();
	},

	afterInitialDataFetch: function() {
		this.inherit();
	},

	wr_create_details_afterRefresh: function() {
		BRG.UI.addNameField('activity_driver_info', this.wr_create_details, 'activity_log.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'activity_log.driver'}, emNameLabelConfig);
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
		this.wr_create_details.setFieldValue('activity_log.driver', infoForm.getFieldValue('em.em_id'));
		this.wr_create_details.setFieldValue('activity_log.dv_id', infoForm.getFieldValue('em.dv_id'));
		this.wr_create_details.setFieldValue('activity_log.dp_id', infoForm.getFieldValue('em.dp_id'));
		this.wr_create_details.setFieldValue('activity_log.phone_requestor', infoForm.getFieldValue('em.phone'));
		this.wr_create_details.setFieldValue('activity_log.status', 'REQUESTED');
	},
	
	
	manGenCosts: function() {
		if (this.validateForm(null,true)) {
			detailsTabController.generateCosts()
		}
	},
	
	
	generateCosts: function() {
		var pnl = detailsTabController.wr_create_details
			var wrSql = " (select null wr_id, null vehicle_type, 0 free_km" 
			wrSql += ",'" + pnl.getFieldValue('activity_log.vehicle_type_req').replace(/'/g, "''") + "' vehicle_type_req"
			wrSql += ",'" + pnl.getFieldValue('wr.date_pickup') + "' date_pickup"
			wrSql += ",'1899-12-30 " + pnl.getFieldValue('wr.time_pickup') + "' time_pickup"
			wrSql += ",'" + pnl.getFieldValue('wr.date_dropoff') + "' date_dropoff"
			wrSql += ",'1899-12-30 " + pnl.getFieldValue('wr.time_dropoff') + "' time_dropoff"
			wrSql += ",'" + pnl.getFieldValue('activity_log.distance_est').replace(/'/g, "''") + "' distance_est"
			wrSql += ") wr on v.vehicle_type_id in (wr.vehicle_type_req,wr.vehicle_type)"
			this.generateEstimateWrOtherDs.addParameter('theWr',wrSql);
			var records = this.generateEstimateWrOtherDs.getRecords();
			var estcost = 0
			for (var i = 0; i < records.length; i++){
				estcost = estcost +  parseFloat(records[i].values['wr_other.cost_estimated'])
			}

			pnl.setFieldValue('activity_log.cost_estimated',estcost.toFixed(2))
		
	},
	
	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	submitRequest: function() {
		
		if (!brgTest) {
			var test = uc_psAccountCode(
				$('ac_id_part1').value,
				$('ac_id_part2').value,
				$('ac_id_part3').value,
				$('ac_id_part4').value,
				$('ac_id_part5').value,
				$('ac_id_part6').value,
				$('ac_id_part7').value,
				$('ac_id_part8').value,
				'checkForm', '1', 'SINGLE FUNDED');
		} else {
			var brgAc = $('ac_id_part1').value + '-' + $('ac_id_part2').value + '-' + $('ac_id_part3').value + '-' + $('ac_id_part4').value;
			brgAc = brgAc  + '-' + $('ac_id_part5').value + '-' + $('ac_id_part6').value + '-' + $('ac_id_part7').value + '-' + $('ac_id_part8').value;
			//Save ac record first
			if (brgAc != "") {
				var acRecord= new Ab.data.Record();
				acRecord.isNew = true;
				acRecord.setValue('ac.ac_id', brgAc);
				try {
					View.dataSources.get('ds_ac_check').saveRecord(acRecord);
				}
				catch (ex) {
					// already exists
				}
			}
			this.checkForm(brgAc); 
			
		}
	},
		
		// ***************************************************************************
	// Check and Submit the request to Archibus SLA engine
	// ***************************************************************************
	checkForm: function(acct) {	
		if (this.validateForm(acct)) {

			// format the description properly.  convert CR/LF.
			
			detailsTabController.generateCosts()
			this.wr_create_details.setFieldValue('activity_log.description',this.wr_create_details.getFieldValue('activity_log.description') + "\r\n\r\nOriginal Estimated Cost:  " + this.wr_create_details.getFieldValue('activity_log.cost_estimated'))
			
			

			var ds = View.dataSources.get(this.wr_create_details.dataSourceId);
			
			
			var record = this.wr_create_details.getRecord();

			var parsedDesc = replaceLF(record.values['activity_log.description']);
			record.values['activity_log.description'] = parsedDesc;
			
			this.wr_create_details.setFieldValue('activity_log.priority',1)
			record.values['activity_log.priority'] = 1;
			

			var recordValues = ds.processOutboundRecord(record).values;

			// get the activity_log_id if it's from a "created" record.
			// Mostly for error checking as it should always be new.
			var activity_log_id = 0;
			var activity_log_id_value = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value
			if ( activity_log_id_value != undefined && activity_log_id_value != '') {
				activity_log_id = this.wr_create_details.getFieldValue("activity_log.activity_log_id").value;
			}

			// Note: Can check for Duplication/Similar requests here.

			var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details,'activity_log');
			
			

			// Submit Request
			try {
				submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id, submitRecord);
				this.wr_create_details.actions.get("submit").enableButton(false);  // disable the submit button so it doesn't get submitted twice.

				// Switch to next tab after setting the restriction.
				var requestor = recordValues["activity_log.requestor"].replace(/'/g, "''");
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
				wrRecord.oldValues = new Object();
				wrRecord.isNew = false;
				wrRecord.setValue('wr.wr_id', wrId);
				wrRecord.oldValues['wr.wr_id'] = wrId;
				//wrRecord.setValue('wr.status', 'A');
				wrRecord.setValue('wr.description', parsedDesc);
				
				wrRecord.setValue('wr.description', parsedDesc);
				wrRecord.setValue('wr.driver', this.wr_create_details.getFieldValue('activity_log.driver'));
				wrRecord.setValue('wr.vehicle_type_req', this.wr_create_details.getFieldValue('activity_log.vehicle_type_req'));
				wrRecord.setValue('wr.destination_type', this.wr_create_details.getFieldValue('activity_log.destination_type'));
				wrRecord.setValue('wr.destination', this.wr_create_details.getFieldValue('activity_log.destination'));
				wrRecord.setValue('wr.passenger_count', this.wr_create_details.getFieldValue('activity_log.passenger_count'));
				wrRecord.setValue('wr.distance_est', this.wr_create_details.getFieldValue('activity_log.distance_est'));
				wrRecord.setValue('wr.date_pickup', this.wr_create_details.getFieldValue('wr.date_pickup'));
				wrRecord.setValue('wr.time_pickup', this.wr_create_details.getFieldValue('wr.time_pickup'));
				wrRecord.setValue('wr.date_dropoff', this.wr_create_details.getFieldValue('wr.date_dropoff'));
				wrRecord.setValue('wr.time_dropoff', this.wr_create_details.getFieldValue('wr.time_dropoff'));
				wrRecord.setValue('wr.budget_owner', this.wr_create_details.getFieldValue('activity_log.budget_owner'));
				wrRecord.setValue('wr.date_assigned', '');


				
				
				
				
				
				
				
	/*	
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
	*/		
				
				View.dataSources.get('ds_wr_save').saveRecord(wrRecord);
				
				var viewPanel = View.parentViewPanel;
				if (viewPanel == null) {
					viewPanel = View.panels.get('reportDisplayPanel');
				}
				if (viewPanel == null) { 
					viewPanel =View.getOpenerView().panels.get('reportDisplayPanel');
				}
				viewPanel.loadView("uc-vehicle-reserve-create-review.axvw", "wr_id='"+wrId+"'", false);
					//sendRequestorEmail();
				
			}
			catch (e) {
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				    Workflow.handleError(e);
				}
			}
		}

	},

	// ***************************************************************************
	// Validates the form fields before submitting the save to the server.
	//
	// Parameters:
	//   table_name - The table to retrieve the records from.
	//   field_names - The columns to retrieve from table_name.
	//   restriction - (Optional) The restriction to apply to the query.
	//
	//	 acct - The account code that was entered. If valid, it will return the
	//		    the account code, if invalid or blank it will return 0.
	// ***************************************************************************
	validateForm: function(acct,genCosts) {

		var success = true;
		

		// Check to see if the description is null
		// 2010/03/31 - JJYCHAN
		var form = View.getControl('', 'wr_create_details');
		form.clearValidationResult();

		if (form.getFieldValue('activity_log.description') == "" && !genCosts) {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.description',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		if (form.getFieldValue('activity_log.vehicle_type_req') == "") {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.vehicle_type_req',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}

		if (form.getFieldValue('activity_log.destination') == "" && !genCosts) {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.destination',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}		
		if (form.getFieldValue('activity_log.passenger_count') == "" && !genCosts) {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.passenger_count',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		if (form.getFieldValue('activity_log.passenger_count') < 1 && form.getFieldValue('activity_log.passenger_count') != "" && !genCosts) {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.passenger_count',"Must be greater than 0");
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		if (form.getFieldValue('activity_log.distance_est') < 1 && form.getFieldValue('activity_log.distance_est') != "" ) {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.distance_est',getMessage('errorRequired'));
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		
		
		
		var d = new Date()
		d.setHours(d.getHours()+this.advancedHours);
		var cd = d.getFullYear() + '-'  
		if (d.getMonth()+1 < 10) { cd+="0"}
		cd += (d.getMonth()+1) + '-' 
		if (d.getDate() < 10) { cd+="0"}
		cd += d.getDate() + ' ' 
		if (d.getHours() < 10) { cd+="0"}
		cd +=d.getHours() + ":" 
		if (d.getMinutes() < 10) { cd+="0"}
		cd += d.getMinutes()	
		
		
		if (form.getFieldValue('wr.date_pickup') == ""){
			form.addInvalidField('wr.date_pickup',getMessage('errorRequired'));	
			success = false;
		}
		if (form.getFieldValue('wr.date_dropoff') == '') {
			form.addInvalidField('wr.date_dropoff',getMessage('errorRequired'));	
			success = false;
		}
		if (form.getFieldValue('wr.time_dropoff') == '-') {
			form.addInvalidField('wr.time_dropoff',getMessage('errorRequired'));
			success = false;
		}
		if (form.getFieldValue('wr.time_pickup') == '-') {
			form.addInvalidField('wr.time_pickup',getMessage('errorRequired'));	
			success = false;		
		}
		
		
		//var addDys = parseInt(advancedHours/24)
		//advancedHours = advancedHours - (addDys*24)
		
		var pd=""
		if (form.getFieldValue('wr.date_pickup') != "" && form.getFieldValue('wr.time_pickup') != '-') {
			pd = form.getFieldValue('wr.date_pickup') + ' '
			if (form.getFieldValue('wr.time_pickup').length <5) {pd +="0"}
			pd += form.getFieldValue('wr.time_pickup')
		}
		var dd=""
		if (form.getFieldValue('wr.date_dropoff') != "" && form.getFieldValue('wr.time_dropoff') != '-') {
			var dd = form.getFieldValue('wr.date_dropoff')  + ' '
			if (form.getFieldValue('wr.time_dropoff').length <5) {dd +="0"}
			dd+= form.getFieldValue('wr.time_dropoff')
		}
		if (pd >= dd && pd != "" && dd != "") {
			form.addInvalidField('wr.date_pickup',"Dropoff must be after Pickup");
			form.addInvalidField('wr.time_pickup',"Dropoff must be after Pickup");
			form.addInvalidField('wr.date_dropoff',"Dropoff must be after Pickup");
			form.addInvalidField('wr.time_dropoff',"Dropoff must be after Pickup");
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		else {
			if (cd >= pd && pd != "") {
				//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
				var msg = "Pickup must be " + this.advancedHours + " hour"
				if (this.advancedHours > 1){msg+="s"}
				msg+=" greater then the current date/time"
				form.addInvalidField('wr.date_pickup',msg);
				form.addInvalidField('wr.time_pickup',msg );
				//View.showMessage(getMessage('descriptionRequired'));
				success = false;
			}
			/*if (cd >= dd && dd != "") {
				//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
				form.addInvalidField('wr.date_dropoff',"Dropoff must be greater then the current date/time");
				form.addInvalidField('wr.time_dropoff',"Dropoff must be greater then the current date/time");
				//View.showMessage(getMessage('descriptionRequired'));
				success = false;
			}*/
		}
		
		if (!genCosts) {	//check to see if the ac_id entered is null
			var parsed_ac_id = $('ac_id_part1').value +
						$('ac_id_part2').value +
						$('ac_id_part3').value +
						$('ac_id_part4').value +
						$('ac_id_part5').value +
						$('ac_id_part6').value +
						$('ac_id_part7').value +
						$('ac_id_part8').value;
			parsed_ac_id.replace(" ", "");

			//if parsed is null then change ac_id to null.
			if (parsed_ac_id=="" || parsed_ac_id == "UCALG") {
				var ac_id="";
			}
			else {
				var ac_id=acct.replace("\r\n\r\n", "");
			};

			var ac_rest = "ac_id = '"+ac_id+"'";



			switch(ac_id)
			{
					case "1":
						View.showMessage(getMessage('error_Account1'));
						success = false;
						break;
					case "2":
						View.showMessage(getMessage('error_Account2'));
						success = false;
						break;
					case "3":
						View.showMessage(getMessage('error_Account3'));
						success = false;
						break;
					case "4":
						View.showMessage(getMessage('error_Account4'));
						success = false;
						break;
					case "5":
						View.showMessage(getMessage('error_Account5'));
						success = false;
						break;
					case "6":
						View.showMessage(getMessage('error_Account6'));
						success = false;
						break;
					case "7":
						View.showMessage(getMessage('error_Account7'));
						success = false;
						break;
					case "8":
						View.showMessage(getMessage('error_Account8'));
						success = false;
						break;
					case "99":
						View.showMessage(getMessage('error_Account99'));
						success = false;
						break;
					case "0":
						View.showMessage(getMessage('error_invalidAccount'));
						success = false;
						break;
			};

			if (success)
			{
				if ((ac_id.substr(0,5) == "UCALG") ||
					(ac_id.substr(0,5) == "FHOBO") ||
					(ac_id.substr(0,5) == "ARCTC") ||
					(ac_id == ""))
				{
					this.wr_create_details.setFieldValue('activity_log.ac_id', ac_id);
				}
				else
				{
					View.showMessage(getMessage('error_Account99'));
					success = false;
				};
			};
		}	
		if (!success) {
			var msg = form.validationResult.message 
			if (genCosts) {
				form.validationResult.message ='Please fix the following fields prior to Generating Estimate Costs.';
			}


			form.displayValidationResult();
			form.validationResult.message  = msg
			//View.showMessage(getMessage('Please fill in the following required fields.'));
		}
		else if (!genCosts) {
			if (ac_id == ""){
				// if the ac is blank ask if they know the ac
				if (!confirm("An account code is required for this request.  If you know the account code to use, click Cancel, add the account code and click Submit.  If you do not know the account code, click OK and we will contact you to determine the account code") ){
					this.wr_create_details.actions.get("submit").enableButton(true);
					success = false;
				}
			}
		}
		
		
		
		//form.setFieldValue('activity_log.description', desc);
		return success;
	}
});


// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearDetailsFl() {
	/*
	var form = View.getControl('', 'wr_create_details');
	form.setFieldValue('activity_log.fl_id', '');
	form.setFieldValue('activity_log.rm_id', '');
	return true;
	*/
}

// ***************************************************************************
// Clears the fl/rm fields.  Used when bl_id changes.
// ***************************************************************************
function clearDetailsDp() {
	var form = View.getControl('', 'wr_create_details');
	form.setFieldValue('activity_log.dp_id', '');
	return true;
}

// Calls the submitRequest function in the controller.
function submitRequest(s)
{

	detailsTabController.submitRequest(s);
}


// *****************************************************************************
// Send email to the Requestor
// *****************************************************************************
function sendRequestorEmail()
{
	var infoForm = View.getControl('','my_info_form');
	var summaryForm = View.getControl('','wr_create_report');

	var eAc_id = summaryForm.getFieldValue('wr.ac_id');
	var eDescription = summaryForm.getFieldValue('wr.description');

	var eFullName = infoForm.getFieldValue('em.em_id');
	var emRecord = UC.Data.getDataRecord('em', ['em_id', 'name_first', 'name_last'], "em_id='"+infoForm.getFieldValue('em.em_id').replace(/'/g, "''")+"'");

	if (emRecord != null) {
		eFullName = emRecord['em.name_first'] + " " + emRecord['em.name_last'];
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
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
			'UC_WRCREATE_REQ_BODY','UC_WRCREATE_REQ_SUBJECT','wr','wr_id',summaryForm.getFieldValue('wr.wr_id'),
			'', infoForm.getFieldValue('em.email'));

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

