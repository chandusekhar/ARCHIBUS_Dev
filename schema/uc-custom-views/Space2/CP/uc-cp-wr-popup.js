// CHANGE LOG
// 2011/01/12 - EWONG - Send email to assigned when issued.

var cpWrPopupController = View.createController('cpWrPopup', {

	afterViewLoad: function() {

	},

    afterInitialDataLoad: function() {

    },

	wr_report_afterRefresh: function() {
		// Refresh the hidden wrcf panel and obtain the cf_id
		var wrId = this.wr_report.getFieldValue('wr.wr_id');
		this.wrcf_assigned_hidden.refresh("wr_id="+wrId);
		this.wrcf_assigned_hidden.show(false);

		this.wr_report.setFieldValue('wr.wrcf.cf_id', this.wrcf_assigned_hidden.getFieldValue('wrcf.cf_id'));

		if (this.wr_report.record.getValue("wr.status") == "I") {
			this.details_tabs.showTab('approvalDrawing', true);
		}

		var allrec = this.approvalReqCountDs.getRecords("wr_id = "+wrId);
		View.panels.get("details_tabs").setTabTitle("approvalDrawing", "Proposed Changes ("+allrec.length+")");
	},

	wr_report_beforeSave: function() {
		var continueSave = true;

		var wrId = this.wr_report.getFieldValue('wr.wr_id');

		//we will copy the new notes (if there's a value) to the
		// cf_notes field with a user and timestamp.
		var newNotes = this.wr_report.getFieldValue('wr.cf_notes.new');
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
			//var cfNotes = this.wr_report.record.getValue('wr.cf_notes');
			// query database for the newest cf_notes.
			cfNotes = UC.Data.getDataValue('wr', 'cf_notes', "wr_id="+wrId);
			// For Firefox: (replace lone \n chars with \r\n)
			newNotes = replaceLF(newNotes);
			cfNotes = cfNotes + "\r\n" + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;
			//this.wr_report.record.setValue('wr.cf_notes', cfNotes);
			this.wr_report.setFieldValue('wr.cf_notes', cfNotes);
			this.wr_report.setFieldValue('wr.cf_notes.new', "");
			// For IE: doesn't refresh the cf_notes div.
			$('Showwr_report_wr.cf_notes').innerHTML = cfNotes.replace(/\r\n/g,"<br/>");
		}

		if (!continueSave) {
			return continueSave;
		}

		//********************
		//Save to Audit Table
		//********************
		var auditDescription;

		//insert wr number.
		auditDescription = "wr.wr_id:" + this.wr_report.getFieldValue('wr.wr_id') + "\n";

		//audit all of the other fields

		auditDescription = buildAuditString(auditDescription, "wr_report", "wr.cf_notes");

		//build the audit record
		var afmAuditRecord= new Ab.data.Record();
		var username = View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);
		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);

		//********************
		//Save cf
		//********************
		var cfNewRecord = this.wrcf_assigned_hidden.record.isNew;
		var cf_id = this.wr_report.getFieldValue('wr.wrcf.cf_id');

		if (cf_id != "") {
			// update record (if necessary)
			if (cf_id != this.wrcf_assigned_hidden.getFieldValue('wrcf.cf_id')) {
				this.wrcf_assigned_hidden.setFieldValue('wrcf.wr_id', this.wr_report.getFieldValue('wr.wr_id'));
				this.wrcf_assigned_hidden.setFieldValue('wrcf.cf_id', this.wr_report.getFieldValue('wr.wrcf.cf_id'));

				var currentDate = new Date();
				var dateValue = View.dataSources.get(this.wrcf_assigned_hidden.dataSourceId).formatValue("wrcf.date_assigned", currentDate, true);
				var timeValue = currentDate.getHours() + ':' + currentDate.getMinutes()+ ':' +  currentDate.getSeconds();

				this.wrcf_assigned_hidden.setFieldValue('wrcf.date_assigned', dateValue);
				this.wrcf_assigned_hidden.setFieldValue('wrcf.time_assigned', timeValue);
				this.wrcf_assigned_hidden.newRecord = cfNewRecord;
				this.wrcf_assigned_hidden.save();
			}
		}
		else if (!cfNewRecord && cf_id == "") {
			// delete wrcf record
			this.wrcf_assigned_hidden.deleteRecord();
		}

        this.wrcf_assigned_hidden.show(false);
		return continueSave;
	},

	issueWorkRequest: function() {
		var form = View.getControl('', 'wr_report');
		var wr_id = form.getFieldValue('wr.wr_id');
        var wo_id = form.getFieldValue('wr.wo_id');
		var status = form.record.getValue('wr.status');
		var controller = this;
		form.save();


		if (form.getFieldValue('wr.wrcf.cf_id') == "") {
			View.showMessage("You must assign a Liason before Issuing the walkthrough request.");
			return;
		}


		View.confirm(getMessage('issueConfirm'), function(button) {
			if (button=='yes') {
				try {
					//Save to uc_wr_audit Table
					var parameters = {
							'user_name': View.user.name,
							'wr_id': form.getFieldValue('wr.wr_id'),
							'newValues': toJSON( {'wr.status': "I",
												'wr.tr_id': form.record.getValue('wr.tr_id')})
					};

					Workflow.call('AbCommonResources-uc_auditWrSave', parameters);

					if (status == 'AA') {
						var wrRecords = [];

						wrRecords[0] = new Object();
						wrRecords[0]['wr.wr_id'] = wr_id;
						wrRecords[0]['wr.wo_id'] = wo_id;

						var result = {};
						try {
							result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-issueWorkRequests',wrRecords);
						}
						catch (e) {
							if (e.code == 'ruleFailed'){
								View.showMessage(e.message);
							}else{
								Workflow.handleError(e);
							}
						}
					}

					form.save();

					//Save to Audit_log Table
					controller.buildWRStatusAuditLog(form.getFieldValue('wr.wr_id'), "AA", "I");

					View.getOpenerView().panels.get('wrRequestedGrid').refresh();
					View.getOpenerView().panels.get('wrAssignedGrid').refresh();


					// Send email
					// Obtain cf email
					var cfEmail = UC.Data.getDataValue('cf', 'email', "cf_id='"+form.getFieldValue('wr.wrcf.cf_id').replace(/'/,"''")+"'");
					var emailMessage = "You have been assigned a space workthrough.";

					emailMessage = emailMessage +
					"<br/><br/>You can check the status of the work request online at: <a href='http://afm.ucalgary.ca'>http://afm.ucalgary.ca/</a>."+
					"<br/><br/>Kind regards,<br/>Facilities Management & Development<br/><hr>" +
					"<span style='font-size:0.8em'>* You have received this email because you are listed as the requestor.*<br>" +
					"* Contact afm@ucalgary.ca if you have any questions or for more information.*</span>";

					uc_email(cfEmail,
					 'afm@ucalgary.ca',
					 '[Automated] Archibus - Your have been assigned a space walkthrough.'
					 , emailMessage,
					 'standard.template');

					View.getOpenerView().closeDialog();

				}
				catch (e) {
					Workflow.handleError(e);
				}
			}
		});
	},

	rejectWorkRequest: function() {
		//ADD A CONFIRMATION MESSAGE BOX FOR REJECTION OF WORK REQUESTS.
		var success = false;
		var form = View.panels.get('wr_report');
		var wr_id = this.wr_report.getFieldValue('wr.wr_id');
		var gridForm = View.getOpenerView().panels.get('wrRequestedGrid');

		View.confirm(getMessage('rejectConfirm'), function(button) {

			if (button=='yes') {
				try {
					//Save to uc_wr_audit Table
					var parameters = {
							'user_name': View.user.name,
							'wr_id': form.getFieldValue('wr.wr_id'),
							'newValues': toJSON( {'wr.status': 'Can',
												'wr.tr_id': form.record.getValue('wr.tr_id')})
					};
					Workflow.call('AbCommonResources-uc_auditWrSave', parameters);

					var result = {};
					result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-cancelWorkRequest',wr_id);

					var openerView = View.getOpenerView();
					if (openerView != null) {
						openerView.panels.get("wrRequestedGrid").refresh();
						openerView.closeDialog();
					}

					View.showMessage(getMessage('rejectDone'));

					success = true;
				}
				catch (e) {
					if (e.code == 'ruleFailed'){
						View.showMessage(e.message);
					}else{
						Workflow.handleError(e);
					}
				}
				return success;
			}
		});
	},


	buildWRStatusAuditLog: function(wr_id, oldStatus, newStatus) {
		var auditDescription;
		auditDescription = "wr.wr_id:" + wr_id + "\n";
		auditDescription = auditDescription + "wr.status:" + oldStatus + "/" + newStatus + "\n";

		var afmAuditRecord = new Ab.data.Record();
		var username=View.user.name;
		afmAuditRecord.isNew = true;
		afmAuditRecord.setValue('audit_log.modified_by_username', username);
		afmAuditRecord.setValue('audit_log.table_name', 'WR');
		afmAuditRecord.setValue('audit_log.description', auditDescription);

		View.dataSources.get('ds_audit_log').saveRecord(afmAuditRecord);
	},

	approveAudit: function() {
		var wr_id = this.wr_report.getFieldValue('wr.wr_id');

		// Verify that all related approval records have been either approved or rejected
		var wrRecords = UC.Data.getDataRecords('uc_space_approval', ['sa_id'], "wr_id="+wr_id+" and approved = 0");
		if (wrRecords != undefined && wrRecords.length > 0) {
			View.showMessage("Not all walkthrougs have been Approved or Rejected.");
			return false;
		}
		else {
			var status = 'Com';
			var recordValues = this.getWorkflowRecordValues(this.wr_report);

			try {
				result = Workflow.callMethod('AbBldgOpsOnDemandWork-WorkRequestService-updateWorkRequestStatus', recordValues, status);

				success = true;
			}
			catch (e) {
				if (e.code == 'ruleFailed'){
					View.showMessage(e.message);
				}else{
				   Workflow.handleError(e);
				}
			}

			var openerGrid = View.getOpenerView().panels.get('wrPendingGrid');
			if (openerGrid != undefined) {
				openerGrid.refresh();
			}

            View.getOpenerView().closeDialog();
		}
	},

		// ************************************************************************
	// (Helper) Function to return the form's record values for using in the
	// work request workflows.
	getWorkflowRecordValues: function(panel) {
		var recordValues = {};
		panel.getRecord();
		panel.fields.each(function(field){
			if (/^wr./.test(field.getFullName())) {
				recordValues[field.getFullName()] = panel.getFieldValue(field.getFullName());
			}
		});

		return recordValues;
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
