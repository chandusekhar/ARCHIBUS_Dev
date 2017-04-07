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

var emNameLabelConfig = {lengthLimit : 150, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0} {1}<br/>{2}<br/>{3}",
        textColor : "#000000", defaultValue : "", raw : false };
//var vehicleIdLabelConfig = {lengthLimit : 50, textTemplate : "<span style='color:#FF0000;'>{0}</span>", nameFieldTemplate : "{0}",
//        textColor : "#000000", defaultValue : "", raw : false };

// *****************************************************************************
// View controller object for the Details tab.
// *****************************************************************************
var detailsTabController = View.createController('detailsTabController', {
	afterViewLoad: function() {
		this.inherit();
	},

	afterInitialDataFetch: function() {
		this.inherit();
	},

	wr_create_details_afterRefresh: function() {
		BRG.UI.addNameField('activity_driver_info', this.wr_create_details, 'activity_log.driver', 'em', ['name_first','name_last','phone','email'], {'em.em_id' : 'activity_log.driver'}, emNameLabelConfig);
		//BRG.UI.addNameField('activity_vehicle_info', this.wr_create_details, 'activity_log.eq_id', 'vehicle', ['vehicle_id'], {'vehicle.eq_id' : 'activity_log.eq_id'}, vehicleIdLabelConfig);
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
		//this.wr_create_details.setFieldValue('activity_log.driver', infoForm.getFieldValue('em.em_id'));
		//this.wr_create_details.setFieldValue('activity_log.bl_id', infoForm.getFieldValue('em.bl_id'));
		//this.wr_create_details.setFieldValue('activity_log.fl_id', infoForm.getFieldValue('em.fl_id'));
		//this.wr_create_details.setFieldValue('activity_log.rm_id', infoForm.getFieldValue('em.rm_id'));
	},
	
	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	submitRequest: function(sTab) {
/*	
		if (this.wr_create_details.getFieldValue('activity_log.eq_id')==""){
	
		//var eqId = this.wr_create_details.getFieldValue('activity_log.eq_id');
		
		//var wr_vehicle = View.panels.get("wr_vehicle");
		//var restriction = {"vehicle.eq_id":eqId};
		//wr_vehicle.refresh(restriction);
		//if(wr_vehicle.getFieldValue("vehicle.vehicle_id")==""){
			//wr_vehicle.show(false);
			
			var form = View.panels.get("wr_create_details");
			form.clearValidationResult();
			//form.addInvalidField('activity_log.eq_id',getMessage('vehicleInvalid'));
			form.addInvalidField('vehicle_id',getMessage('vehicleInvalid'));
			form.displayValidationResult();
			
			return false;
		} else //{
		//	wr_vehicle.show(false);
		//}
*/		
		if (this.validateForm()) {

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

			// Note: Can check for Duplication/Similar requests here.

			var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details,'activity_log');

			// Submit Request
			try {
				submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id, submitRecord);
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
				tabsPanel.setTabRestriction('create_wr_documents', rest);
				tabsPanel.refreshTab('create_wr_documents');
				
				var docsController = View.controllers.get('docsTabController');
				if (docsController != undefined) {
					docsController.prefillDocsInfo();
				}
				
				
				
				tabsPanel.setTabRestriction('create_wr_report',rest);
				tabsPanel.refreshTab('create_wr_report');
				docCntrl.docPkey= this.wr_form.getFieldValue('wr.wr_id')
				var rest = "uc_docs_extension.table_name='wr' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "'"
				this.doc_gridReport.restriction = rest
				if(sTab=='docs'){
					tabsPanel.selectTab('create_wr_documents');
					
					docCntrl.docAdd = true;
					docCntrl.docEdit=true;
					var rest = "uc_docs_extension.table_name='wr' and uc_docs_extension.pkey='" + docCntrl.docPkey+ "'"
					this.doc_grid.refresh(rest)
					this.doc_grid.actions.get("add").button.events.click.fire();
					//var wr_form = View.panels.get('wr_form');
					//var ds_docs = View.dataSources.get('ds_docs');
						
					/*var record = new Ab.data.Record({
						'uc_docs_extension.pkey': wr_form.getFieldValue('wr.wr_id'),
						'uc_docs_extension.table_name': 'wr',
						'uc_docs_extension.created_by': View.user.name,
						'uc_docs_extension.modified_by': View.user.name},
						true); // true means new record
					var ds_object = ds_docs.saveRecord(record);
					
					var restriction = {'uc_docs_extension.uc_docs_extension_id':ds_object.getValue('uc_docs_extension.uc_docs_extension_id')};
					View.openDialog('uc-wr-new-documents-dialog.axvw', restriction, false, {
						width: 600, 
						height: 400, 
						closeButton: false,
						maximize: false 
					});
					*/
					
				}
				else if(sTab=='report'){
					tabsPanel.selectTab('create_wr_report');
					//JC -----------------------------------------------------------------Turned off temporarily.
					sendRequestorEmail();
				}
				
				

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
	validateForm: function() {

		var success = true;


		// Check to see if the description is null
		// 2010/03/31 - JJYCHAN
		var form = View.getControl('', 'wr_create_details');
		form.clearValidationResult();
		if (form.getFieldValue('vehicle_id')==""){
			form.addInvalidField('vehicle_id',getMessage('errorRequired'));
			success = false;
		} 
		else if (form.getFieldValue('activity_log.eq_id')==""){
			form.addInvalidField('vehicle_id',getMessage('vehicleInvalid'));
			success = false;
		} 
		
		if (form.getFieldValue('activity_log.cause_type') == "") {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.cause_type',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}

		if (form.getFieldValue('activity_log.description') == "") {
			//form.fields.get('activity_log.description').setInvalid(getMessage('descriptionRequired'));
			form.addInvalidField('activity_log.description',getMessage('errorRequired'));
			
			//View.showMessage(getMessage('descriptionRequired'));
			success = false;
		}
		if (!success) {
			form.displayValidationResult();
			//View.showMessage(getMessage('Please fill in the following required fields.'));
		}
		//form.setFieldValue('activity_log.description', desc);
		return success;
	}
});
/*
function updateVehicle() {
	var form = View.getControl('', 'wr_create_details');
	var eqId = form.getFieldValue('activity_log.eq_id');
	form.clearValidationResult();
	
	var wr_vehicle = View.panels.get("wr_vehicle");
	var restriction = {"vehicle.eq_id":eqId};
	wr_vehicle.refresh(restriction);
	if(wr_vehicle.getFieldValue("vehicle.vehicle_id")==""){
		wr_vehicle.show(false);
		form.fields.get('activity_log.eq_id').setInvalid(getMessage('vehicleInvalid'));
		View.showMessage(getMessage('vehicleInvalid'));
	} else { 
		wr_vehicle.show(false); 
	}
}*/
function updateVehicle() {
	var form = View.getControl('', 'wr_create_details');
	var vId = form.getFieldValue('vehicle_id');
	

	var vRecord =  UC.Data.getDataRecord('vehicle', ['eq_id', 'dv_id', 'dp_id','budget_owner','em_id'], "vehicle_id='"+vId.replace(/'/g, "''")+"'");
	if (vRecord != null) {
		form.setFieldValue('activity_log.eq_id',vRecord['vehicle.eq_id'].l);
		form.setFieldValue('activity_log.dv_id',vRecord['vehicle.dv_id'].l);
		form.setFieldValue('activity_log.dp_id',vRecord['vehicle.dp_id'].l);
		form.setFieldValue('activity_log.budget_owner',vRecord['vehicle.budget_owner'].l);
		if (form.getFieldValue('activity_log.driver') =="") {form.setFieldValue('activity_log.driver',vRecord['vehicle.em_id'].l)}
	}
	else {
		form.setFieldValue('activity_log.eq_id',"");
		form.setFieldValue('activity_log.dv_id',"");
		form.setFieldValue('activity_log.dp_id',"");
		form.setFieldValue('activity_log.budget_owner',"");
	}
}

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


function selectFloor() {
	var form = View.getControl('', 'wr_create_details');
	var bl_id = form.getFieldValue('activity_log.bl_id');

	var restriction = "";

	if (bl_id != '') {
		restriction = "fl.bl_id='" + bl_id + "'";
	}

	Ab.view.View.selectValue(
        'wr_create_details',
		'Select Floors',
		['activity_log.bl_id', 'activity_log.fl_id'],
		'fl',
		['fl.bl_id', 'fl.fl_id'],
		['fl.bl_id', 'fl.fl_id', 'fl.name'],
		restriction,
		'',
		false,
		false,
		'',
		1000,
		500);
}


// Select form for Room Code
function selectRooms() {
	var form = View.getControl('', 'wr_create_details');



	var bl_id = form.getFieldValue('activity_log.bl_id');
	var fl_id = form.getFieldValue('activity_log.fl_id');

	var restriction = "";


	if (bl_id != '') {
		restriction = "rm.bl_id='" + bl_id + "'" + "AND rm.fl_id LIKE '%" + fl_id + "%'";
	}


	Ab.view.View.selectValue(
        'wr_create_details', 												//form name
		'Room', 															//name of select box
		['activity_log.bl_id', 'activity_log.fl_id', 'activity_log.rm_id'], //fields to fill on form
		'rm',																//table to gather fields
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id'], 								//fields used to fill form
		['rm.bl_id', 'rm.fl_id', 'rm.rm_id','rmtype.description'], 			//fields to display
		restriction,														//restriction
		'', 																//actionListener
		false, 																//applyFilter
		false, 																//showIndex
		'', 																//workflowRuleId
		1000, 																//width
		500,																//height
		null,																//selectvaluetype
		null,																//recordlimit
		 toJSON([{fieldName : "rm.bl_id"},{fieldName : "rm.fl_id"},{fieldName : "rm.rm_id"}]));											//sortfields
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

	var eLocation = ""; //summaryForm.getFieldValue('wr.bl_id') + "/" + summaryForm.getFieldValue('wr.fl_id') + "/" + summaryForm.getFieldValue('wr.rm_id');
	var eEq_id = summaryForm.getFieldValue('wr.eq_id');
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
	if (eLocation != '') {
		emailMessage = emailMessage +
					"<tr><td><b>Location:</b></td>" +
					"<td>" + eLocation +"</td></tr>";
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
	/*
	if (eEq_id != '') {
		emailMessage = emailMessage +
					"  <tr>" +
					"    <td>" +
					"<b>Equipment Code:</b>" +
					"    </td>" +
					"    <td>" +
					eEq_id +
					"    </td>" +
					"  </tr>";
	}
	*/

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

