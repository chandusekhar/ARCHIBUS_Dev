// CHANGE LOG
// 2010/09/30 - EWONG - Issue: 336. Changed "Requestor" (which is blank) to "Report To"
//                      (based on the logged in user) and added location information to email.
// 2010/12/15 - EWONG - Changed Room/Space Error to submit a Service Request and added autofill information.
// 2011/01/12 - EWONG - Added a check to determine if it is being called from the Audit Manager, if so, select and limit error type to "ROOM"
// 2011/01/19 - EWONG - Added a check to determine if the dialog is called from the rm_form panel and autofill
// 2011/01/19 - EWONG - Fixed an issue where email wasn't being sent for ROOM errors (dialog closing before email).

var errorReportController = View.createController('errorReportController', {
	probType: null,

	afterViewLoad: function() {
		if (View.getOpenerView().panels.get('wr_create_details')) {
			this.probType = View.getOpenerView().panels.get('wr_create_details').getFieldValue("activity_log.prob_type");
		} else {
			this.probType = 'SPACE CORRECTION';
			this.errorReportPanel.actions.get('errorCancel').show(false);
			//this.errorReportPanel.setFieldValue('uc_eq_error_report.description', '');
		}

		this.errorReportPanel.refresh(null, true);
	},

	errorReportPanel_afterRefresh: function()
	{
		// Autofill information
		var bl_id = "";
		var fl_id = "";
		var rm_id = "";
		var wr_id = 0;

		var openerView = View.getOpenerView();
		var openerPanel = null;
		var tableName = "";
		var viewTypeGrid = false;

		if (openerView != null) {
			// try all possible panels

			//requestor information panel
			if (openerPanel == null) {
				openerPanel = openerView.panels.get("my_info_form");
				if (openerPanel != null) {
					tableName = "em";
					viewTypeGrid = false;
				}
			}

			if (openerPanel == null) {
				openerPanel = openerView.panels.get("wr_create_details");
				if (openerPanel != null) {
					tableName = "activity_log";
					viewTypeGrid = false;
				}
			}



			if (openerPanel == null) {
				openerPanel = openerView.panels.get("nav_details_info");
				if (openerPanel != null) {
					tableName = "wr";
					viewTypeGrid = false;
				}
			}

			if (openerPanel == null) {
				openerPanel = openerView.panels.get("rm_form");
				if (openerPanel != null) {
					tableName = "rm";
					viewTypeGrid = false;
				}
			}

			//Real Estate Error
			if (openerPanel == null) {
				openerPanel = openerView.panels.get("abRepmAddEditLeaseInABuildingSelectRm_grid");
				if (openerPanel != null) {
					tableName = "rm";
					viewTypeGrid = true;
				}
			}


			var opOpenerView = openerView.getOpenerView();
			if (opOpenerView != null) {
				var topView = opOpenerView.getOpenerView();
				if (topView != null) {
					// check if it's the Audit Request Manager page, if so, default to Room errors.
					if (topView.viewName.match(/uc-sl-wr\.axvw/) == "uc-sl-wr.axvw") {
						this.errorReportPanel.setFieldValue("uc_eq_error_report.error_type", "ROOM");
						this.errorReportPanel.enableField("uc_eq_error_report.error_type", false);
					}
				}
			}

		}

		// Found openerPanel, auto fill information.
		if (openerPanel != null) {
			if (tableName == "em" || tableName == "activity_log" || tableName == "rm") {
				this.errorReportPanel.setFieldValue('uc_eq_error_report.error_type', "ROOM");
				this.errorReportPanel.enableField('uc_eq_error_report.error_type', false);	// make readonly so that cannot be changed further.
			}

			if (!viewTypeGrid) {
				bl_id = openerPanel.getFieldValue(tableName+".bl_id");
				fl_id = openerPanel.getFieldValue(tableName+".fl_id");
				rm_id = openerPanel.getFieldValue(tableName+".rm_id");

				wr_id = openerPanel.getFieldValue(tableName+".wr_id");
				if (wr_id == "") { wr_id = 0; }
			}
		}

		this.errorReportPanel.setFieldValue('request_bl_id', bl_id);
		this.errorReportPanel.setFieldValue('request_fl_id', fl_id);
		this.errorReportPanel.setFieldValue('request_rm_id', rm_id);
		this.errorReportPanel.setFieldValue('uc_eq_error_report.wr_id', wr_id);
		this.errorReportPanel.setFieldValue('uc_eq_error_report.user_name', View.user.employee.id);
	},

	errorReportPanel_beforeSave: function()
	{
		//return;

		var continueSave = true;
		var wrCreated = false;

		var errorForm = View.getControl('', 'errorReportPanel');

		var description = errorForm.getFieldValue("uc_eq_error_report.description");
		var sendTo = "";
		var subject = "";

		//if description is blank, stop
		if (description == '') {
			continueSave = false;
			View.showMessage("Description must be entered.");
			return continueSave;
		}

		//get the value of the error type
		var errorType = errorForm.getFieldValue("uc_eq_error_report.error_type");


		var location = "";
		var reqPanel = View.getOpenerView().panels.get('my_info_form');
		if (reqPanel) {
 			location = reqPanel.getFieldValue('em.bl_id') + "/" + reqPanel.getFieldValue('em.fl_id') + "/" + reqPanel.getFieldValue('em.rm_id');
		}
		else {
			reqPanel = View.getOpenerView().panels.get('wr_create_details');
			if (reqPanel) {
				location = reqPanel.getFieldValue('activity_log.bl_id') + "/" + reqPanel.getFieldValue('activity_log.fl_id') + "/" +reqPanel.getFieldValue('activity_log.rm_id');
			}
		}

		var emailMessage = 	  "<table>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Reference Work Request:</b>" +
							  "    </td>" +
							  "    <td>" +
							  errorForm.getFieldValue('uc_eq_error_report.wr_id') +
							  "    </td>" +
							  "  </tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Reported by:</b>" +
							  "    </td>" +
							  "    <td>" +
							  View.user.employee.id +
							  "    </td>" +
							  "  </tr>" +
							  "<tr><td><b>Location:</b></td>" +
							  "<td>"+location+"</td>"+
						//	  "<td>" + this.nav_details_info.getFieldValue('wr.bl_id') + "/" + this.nav_details_info.getFieldValue('wr.fl_id') + "/" + this.nav_details_info.getFieldValue('wr.rm_id') +"</td></tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Equipment Code:</b>" +
							  "    </td>" +
							  "    <td>" +
						//	  this.nav_details_info.getFieldValue('wr.eq_id') +
							  "    </td>" +
							  "  </tr>" +
							  "  <tr>" +
							  "    <td>" +
							  "<b>Description:</b>" +
							  "    </td>" +
							  "    <td>" +
							  description +
							  "    </td>" +
							  "  </tr>" +
							  "</table><br><br><hr>";

		//set the email address to send to
		if (errorType == "WR") {
			sendTo = "FMDCustomerCare@ucalgary.ca";
			subject = "A Work Request Error has been reported";
			//email header
			emailBody = "<b>Archibus Work Request Error</b><br><br>" +
						"The following information is a summary of a submitted Work Request error<br><br>" + emailMessage;
		}
		else if (errorType == "EQUIP") {
			sendTo = "afmmaint@ucalgary.ca";
			subject = "An Equipment Error has been reported";
			//email header
			emailBody = "<b>Archibus Equipment/Bar Code Error</b><br><br>" +
						"The following information is a summary of a submitted equipment error<br><br>" + emailMessage;
			//email footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afmmaint@ucalgary.ca.*<br>" +
									"*Contact afm@ucalgary.ca if you have any questions or for more information.*";
		}
		else if (errorType == "CONDITION") {
			sendTo = "afmmaint@ucalgary.ca";
			subject = "An Equipment Condition Error has been reported";
			//email header
			emailBody = "<b>Archibus Equipment/Bar Code Condition Change</b><br><br>" +
						"The following information is a summary of a submitted equipment condition change.<br><br>" + emailMessage;
			//email Footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afmmaint@ucalgary.ca.*<br>" +
									"*Contact afm@ucalgary.ca if you have any questions or for more information.*";
		}
		else	{
			sendTo = "afm.records@ucalgary.ca";
			//sendTo = "jjychan@ucalgary.ca";
			subject = "A Room Error has been reported";
			//email header
			emailBody = "<b>A Room Error has been reported by a craftsperson</b><br><br>The following information is a summary of a submitted room error<br><br>" + emailMessage;
			//email Footer
			emailBody = emailBody + "* You have received this email because you are listed as a forward for the email afm.records@ucalgary.ca.*<br>" +
									"*Contact afm@ucalgary.ca if you have any questions or for more information.*";

			continueSave = false;
			wrCreated = this.createWorkRequest();
			if (!wrCreated) {
				// return to dialog if error occured during createWorkRequest.
				return false;
			}
		}


		// Email
		uc_email(sendTo, 'afm@ucalgary.ca', subject, emailBody, 'standard.template');
		alert("Your error report has been sent. An email has been sent to " + sendTo + " regarding this issue.");

		// For the Room/Space Error type and if a request have been created, close the dialog
		// (no saving to uc_eq_error_report therefore the closeDialog have to be called in js).
		if (errorType == "ROOM" && wrCreated) {
			View.getOpenerView().closeDialog();
		}

		return continueSave;
	},

    createWorkRequest: function() {
		// check if the required bl_id field is filled in.
		if (this.errorReportPanel.getFieldValue("request_bl_id") == "") {
			View.showMessage("Building must be entered.");
			return false;
		}

		var submitRecord = {};

        submitRecord["activity_log.activity_log_id"] = "0";
		submitRecord["activity_log.activity_type"] = "SERVICE DESK - MAINTENANCE";
		submitRecord["activity_log.tr_id"] = "RECORDS";
		submitRecord["activity_log.prob_type"] = "REC-SPACE CORR";
		submitRecord["activity_log.ac_id"] = "UCALG-10-62100-10005-00672-000000000-00000000-00000";
		submitRecord["activity_log.requestor"] = View.user.employee.id;
		submitRecord["activity_log.work_team_id"] = "RECORDS";

		submitRecord["activity_log.bl_id"] = this.errorReportPanel.getFieldValue("request_bl_id");
		submitRecord["activity_log.fl_id"] = this.errorReportPanel.getFieldValue("request_fl_id");
		submitRecord["activity_log.rm_id"] = this.errorReportPanel.getFieldValue("request_rm_id");

		var parsedDesc = replaceLF(this.errorReportPanel.getFieldValue("uc_eq_error_report.description"));
		parsedDesc += "\r\n\r\nGenerated from WR "+this.errorReportPanel.getFieldValue("uc_eq_error_report.wr_id");
		submitRecord["activity_log.description"] = parsedDesc;

		// Submit Request
		try {
            var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', 0,submitRecord);

			//alert("Your error report has been sent.");

			var actLogId = submitResult.data['activity_log_id'];

			var rest = "wr_id = (SELECT max(wr_id) FROM wr WHERE activity_log_id = '"+actLogId+"')";

			var wrId = UC.Data.getDataValue('wr', 'wr_id', rest);
			// Workaround for Submit Request WF losing CF/LF
			// Save the description again... to both activity_log and wr
			var actLogRecord= new Ab.data.Record();
			actLogRecord.isNew = false;
			actLogRecord.setValue('activity_log.activity_log_id', actLogId);
			actLogRecord.setValue('activity_log.description', parsedDesc);
			actLogRecord.oldValues = new Object();
			actLogRecord.oldValues['activity_log.activity_log_id'] = actLogId;
			View.dataSources.get('activityLogDs').saveRecord(actLogRecord);

			var wrRecord= new Ab.data.Record();
			wrRecord.isNew = false;
			wrRecord.setValue('wr.wr_id', wrId);
			wrRecord.setValue('wr.description', parsedDesc);
			wrRecord.setValue('wr.work_team_id', "RECORDS");
			wrRecord.oldValues = new Object();
			wrRecord.oldValues['wr.wr_id'] = wrId;
			View.dataSources.get('ds_wr_save').saveRecord(wrRecord);

			return true;

		}
		catch (e) {
			Workflow.handleError(e);
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