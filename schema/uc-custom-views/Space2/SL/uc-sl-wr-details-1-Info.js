// CHANGE LOG:


// *****************************************************************************
// View controller object for the Info tab.
// *****************************************************************************
var infoTabController = View.createController('infoTabController', {
	afterSaveWorkflowFunc: null,
	returnedAcctString: null,

	// ************************************************************************
	afterViewLoad: function() {
		this.inherit();


		// Set this controller as the InfoTabController in the opener controller.
		var openerView = View.getOpenerView();
		if (openerView != undefined) {
			var openerCtrl = openerView.controllers.get("managerDetailsController");
			openerCtrl.infoTabController = this;
		}

	},


	// ************************************************************************
	// After refresh event handler.
	nav_details_info_afterRefresh: function() {

		// apply security
		UC.FieldSecurity.applyFieldSecurityCustom = applyFieldSecurityCustom;
		UC.FieldSecurity.applyFieldSecurity(this.nav_details_info, 'wr', View.user.role);

		// change the style of the readOnly cf_note to make it more readable.
		// Note: It's changed here instead of using the 'style' tag within the field
		// due to it causing other formatting issues.
		this.nav_details_info.fields.get('wr.cf_notes').dom.style.color = "#000000";

	},


	// ************************************************************************
	// Before save event handler.  Called automatically when "saveForm" command is
	// issued.  Do extra validation or processing here.
	nav_details_info_beforeSave: function() {
		var continueSave = true;

		var wrId = this.nav_details_info.getFieldValue('wr.wr_id');

			//we will copy the new notes (if there's a value) to the
			// cf_notes field with a user and timestamp.
			var newNotes = this.nav_details_info.getFieldValue('wr.cf_notes.new');
			if (newNotes != "") {
				var currentUser = View.user.name;		// use View.user.employee.name for the em name instead.
				var currentDate = new Date();
				var dateString = currentDate.getFullYear() + "/" + (currentDate.getMonth() + 1)
					+ "/" + currentDate.getDate();


				//Parse the hours to get the correct time.
				var curr_hour = currentDate.getHours();
				var am_pm = "";
				if (curr_hour < 12) {
					am_pm = "AM";
				}
				else {
					am_pm = "PM";
				}
				if (curr_hour == 0) {
					curr_hour = 12;
				}
				if (curr_hour > 12) {
					curr_hour = curr_hour - 12;
				}

				// add leading 0 to minutes if needed.
				var curr_min = currentDate.getMinutes();
				curr_min = curr_min + "";
				if (curr_min.length == 1) {
					curr_min = "0" + curr_min;
				}



				var timeString = curr_hour + ":" + curr_min + " " + am_pm;

				//var cfNotes = this.nav_details_info.record.getValue('wr.cf_notes');
				// query database for the newest cf_notes.
				cfNotes = UC.Data.getDataValue('wr', 'cf_notes', "wr_id="+wrId);

				// For Firefox: (replace lone \n chars with \r\n)
				newNotes = replaceLF(newNotes);

				cfNotes = cfNotes + "\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

				//this.nav_details_info.record.setValue('wr.cf_notes', cfNotes);
				this.nav_details_info.setFieldValue('wr.cf_notes', cfNotes);
				this.nav_details_info.setFieldValue('wr.cf_notes.new', "");

				// For IE: doesn't refresh the cf_notes div.
				$('Shownav_details_info_wr.cf_notes').innerHTML = cfNotes.replace(/\r\n/g,"<br/>");
			}



			if (!continueSave) {
				return continueSave;
			}

			// after validations, save the audit values
			if (this.saveWrAuditValues()) {
				// Audit successful, continue with save.

				// check the old and new status.  If it's changed, we will need to run the
				// appropriate workflows before the record is saved.
				//
				// Note: status change workflows also updates the record with the field values,
				//       so the audit workflow must be called first.



			}
			else {
				continueSave = false;
			}






		//********************
		//Save to Audit Table
		//********************
		var auditDescription;

		//insert wr number.
		auditDescription = "wr.wr_id:" + this.nav_details_info.getFieldValue('wr.wr_id') + "\n";

		//audit all of the other fields

		auditDescription = buildAuditString(auditDescription, "nav_details_info", "wr.cf_notes");

		//build the audit record
		var afmAuditRecord= new Ab.data.Record();
		var username = View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);

		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);


		return continueSave;
	},





	// ************************************************************************
	// (Helper) Function to Save the audit function.
	//
	// Calls the uc_auditWrSave workflow to save the audit values into the
	// audit table.
	saveWrAuditValues: function() {
			var parameters = {
					'user_name': View.user.employee.id,
					'wr_id': this.nav_details_info.getFieldValue('wr.wr_id'),
					'newValues': toJSON( {'wr.status':this.nav_details_info.getFieldValue('wr.status.display'),
										  'wr.tr_id': this.nav_details_info.getFieldValue('wr.tr_id')})
			};

			var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
			if (result.code != 'executed') {
					Workflow.handleError(result);
					return false;
			}

			return true;
	},


	// ************************************************************************
	// (Helper) Function to return the form's record values for using in the
	// work request workflows.
	getWorkflowRecordValues: function() {
		var ds = View.dataSources.get(this.nav_details_info.dataSourceId);
		var record = this.nav_details_info.getRecord();
		var recordValues = ds.processOutboundRecord(record).values;

		// remove record values that aren't part of the actual records.
		delete recordValues['wr.cf_notes.new'];


		return recordValues;
	},



	// ************************************************************************
	// Checks the Form in the infoTab for changes.
	//
	// Returns true if there are changes that need saving, false otherwise.
	// ************************************************************************
	checkFormChanged: function()
	{
		// move the focus to another element so any onChange event is fired
		//this.nav_details_info.fields.get('wr.bl_id').dom.focus();

		//var formChanged = afm_form_values_changed;

		//return formChanged;
	},


	// ************************************************************************
	// Refreshes the searchGrid after a status update.
	// ************************************************************************
	refreshSearchGrid: function()
	{
		try {
			var mainPanelView = View.getOpenerView().getOpenerView();
			mainPanelView.panels.get('nav_tabs').refreshTab('page2');
		}
		catch (ex) {
		}

	},


	// ************************************************************************
	// Retrieves the email address of emId from the database.
	// ************************************************************************
	getEmailForEm: function(emId) {
		var rest = "em_id = '"+emId.replace(/\'/g, "''")+"'";
		var email = UC.Data.getDataValue("em", "email", rest);
		return email;
	},


	// ************************************************************************
	// Function: sendForApproval
	//
	// ************************************************************************


	sendForApproval: function() {
		//View.showMessage(getMessage('confirmSendApproval'));
		View.confirm(getMessage('confirmSendApproval'), function(button) {
			if (button=='yes') {


				var form = View.getControl('', 'nav_details_info');
				var wr_id = form.getFieldValue('wr.wr_id');

				//******************************************************************************
				//Save to uc_wr_audit Table
				//******************************************************************************

				var parameters = {
						'user_name': View.user.name,
						'wr_id': form.getFieldValue('wr.wr_id'),
						'newValues': toJSON( {'wr.status': "CPA",
											'wr.tr_id': form.record.getValue('wr.tr_id')})
				};

				var result = Workflow.runRuleAndReturnResult('AbCommonResources-uc_auditWrSave', parameters);
				if (result.code != 'executed') {
						Workflow.handleError(result);
				}


				//******************************************************************************
				// Set the status to Parts Complete
				//******************************************************************************

				form.setFieldValue('wr.status', 'Campus Planning Approval', 'CPA');
				form.save();



				//******************************************************************************
				//Save to Audit_log Table
				//******************************************************************************
				var auditDescription;

				//insert wr number.
				auditDescription = "wr.wr_id:" + form.getFieldValue('wr.wr_id') + "\n";

				var oldStatus = "I";
				var newStatus = "CPA";

				auditDescription = auditDescription + "wr.status:" + oldStatus + "/" + newStatus + "\n";

				//alert("Work Request has been sent");

				//build the audit record
				var afmAuditRecord= new Ab.data.Record();
				var username = View.user.name;
				afmAuditRecord.isNew = true;
				afmAuditRecord.setValue('audit_log.modified_by_username', username);
				afmAuditRecord.setValue('audit_log.table_name', 'WR');
				afmAuditRecord.setValue('audit_log.description', auditDescription);

				View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);

				View.showMessage(getMessage('approvalConfirmed'));
			}

		});
	}
});




function buildAuditString(auditString, formName, fieldName) {

	var form = View.getControl('', formName);
	var newVal = form.getFieldValue(fieldName);
	var oldVal = form.getOldFieldValues()[fieldName];
	var newstring = auditString;


	if (oldVal != newVal) {
			newstring = newstring + fieldName + "\nOld\n[" + oldVal + "]\nNew\n[" + newVal + "]\n\n";
	}

	return newstring;
}



// *****************************************************************************
// Custom Security Handler
// *****************************************************************************
function applyFieldSecurityCustom(form, field_name, allow)
{
	switch(field_name)
	{
	case "wr.status":
		form.enableField("wr.status.display", allow);
		break;
	case "wr.ac_id":
		if (!allow) {
			$('ac_id_part1').readOnly = true;
			$('ac_id_part2').readOnly = true;
			$('ac_id_part3').readOnly = true;
			$('ac_id_part4').readOnly = true;
			$('ac_id_part5').readOnly = true;
			$('ac_id_part6').readOnly = true;
			$('ac_id_part7').readOnly = true;
			$('ac_id_part8').readOnly = true;
		}
		break;
	default:
		// do nothing.
	}
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