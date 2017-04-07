// 2010/08/20  EWONG - ISSUE 276: Added auto copying of CF Notes to Project Scope.

var projectRequestEditPage1Controller = View.createController('projectRequestEditPage1', {
	createButtonWR: null,
	createButtonAC: null,

	afterViewLoad: function() {

	},

	wrprojectRequestEditPage1Grid_onViewRequestButton: function(row)
	{
		//View.openDialog("brg-project-request-view.axvw", "wr_id = "+row.getFieldValue("wr.wr_id"), false);
	},

	wrprojectRequestEditPage1Grid_afterRefresh: function()
	{
	},

	projectCreateForm_afterRefresh: function()
	{
		// pre-fill information from wr
		//getDataValues: function(tableName, fieldNames, restriction)
		var wrRecord = BRG.Common.getDataValues("wr", ["wr_id", "requestor", "bl_id", "ac_id", "description", "cf_notes"], "wr_id="+this.createButtonWR);
		if (wrRecord != null) {
			this.projectCreateForm.setFieldValue('project.bl_id', wrRecord["wr.bl_id"]);
			this.projectCreateForm.setFieldValue('project.requestor', wrRecord["wr.requestor"]);
			this.projectCreateForm.setFieldValue('project.ac_id', wrRecord["wr.ac_id"]);
			this.projectCreateForm.setFieldValue('project.description', wrRecord["wr.description"]);
			this.projectCreateForm.setFieldValue('project.scope', wrRecord["wr.cf_notes"].substring(0,1999));
		}

		// fill the ac_id from the wr.
		//this.projectCreateForm.setFieldValue('project.ac_id', this.createButtonAC);

		// change the default project_type
		this.projectCreateForm.setFieldValue('project.project_type', "CAMPUS USER");
	},

	projectRequestEditPage1CreatedGrid_onAcceptProjectButton: function(row)
	{
		var status = row.getFieldValue("project.status");
		if (status != "Created") {
			View.showMessage("Only Projects with a status of Created can be Accepted.");
			return false;
		}

    	var projectId = row.getFieldValue("project.project_id");
		var parameters = {};
		parameters.fieldValues = toJSON({'project.project_id': projectId, 'project.status': 'CREATED'});
		var result = Workflow.runRuleAndReturnResult('AbCapitalBudgeting-requestProject', parameters);
  		if (result.code == 'executed') {
			View.showMessage("The Project ("+projectId+") has been sent to Approval Process.");
			this.projectRequestEditPage1CreatedGrid.refresh();
			this.projectRequestEditPage1Grid.refresh();
  		}
  		else
  		{
    		alert(result.code + " :: " + result.message);
  		}
	},

	projectRequestEditPage1CreatedGrid_onWithdrawProjectButton: function(row)
	{
		var status = row.getFieldValue("project.status");
		if (status != "Created") {
			View.showMessage("Only Projects with a status of Created can be Withdrawn.");
			return false;
		}

		var projectId = row.getFieldValue("project.project_id");


		// Change Project Status to "Requested-Rejected"
		var projectRecord = new Ab.data.Record();
		projectRecord.isNew = false;
		projectRecord.values["project.project_id"] = projectId;
		projectRecord.values["project.status"] = "Requested-Rejected";
		projectRecord.oldValues = new Object();
		projectRecord.oldValues["project.project_id"] = projectId;
		this.projectRequestEditPage1Ds.saveRecord(projectRecord);

		// get the associated wr_id and cf_notes
		var wrDataValues = BRG.Common.getDataValues('wr', ['wr_id', 'cf_notes'], "project_id = "+BRG.Common.literalOrNull(projectId, true));


		if (wrDataValues == undefined) {
			// Not associated to a wr request.
			View.showMessage("The Project ("+projectId+") has been Rejected");
		}
		else {
			var wr_id = wrDataValues["wr.wr_id"];
			var old_cf_notes = wrDataValues["wr.cf_notes"];
			var new_cf_notes = this.appendComments(old_cf_notes, getMessage("withdrawComments"));

			// Save new cf_notes to WR.
			var wrRecord = new Ab.data.Record();
			wrRecord.isNew = false;
			wrRecord.values["wr.wr_id"] = wr_id;
			wrRecord.values["wr.cf_notes"] = new_cf_notes;
			wrRecord.values["wr.status"] = "AA";
			wrRecord.oldValues = new Object();
			wrRecord.oldValues["wr.wr_id"] = wr_id;
			this.wrSaveDS.saveRecord(wrRecord);

			// Run the cancel WR workflow
			var parameters = {'wr_id': wr_id};

			try {
				Workflow.call('AbBldgOpsOnDemandWork-cancelWorkRequest', parameters);
				View.showMessage("The Project ("+projectId+") has been Rejected");
			}
			catch (e) {
				Workflow.handleError(e);
			}
		}

		this.projectRequestEditPage1CreatedGrid.refresh();
		this.projectRequestEditPage1Grid.refresh();
	},


	createProjectFromRequest: function()
	{
		var success = false;

		if (this.createButtonWR != null) {
			var user_name = View.user.employee.id;
			var date = new Date();

			if ($("projectCreateForm_summary_input") != undefined && $("projectCreateForm_summary_input").value != "") {
				var project_summary_text = "UserName: {0}, Date: {1}, Comments: {2}.";
				project_summary_text = project_summary_text.replace('{0}', user_name);
				project_summary_text = project_summary_text.replace('{1}', date.toDateString().substring(4));
				project_summary_text = project_summary_text.replace('{2}', $("projectCreateForm_summary_input").value);
				this.projectCreateForm.setFieldValue("project.summary", project_summary_text);
			}

			var projectId = this.projectCreateForm.getFieldValue("project.project_id");

			// save the project.
			if (this.projectCreateForm.save()) {
				// successfully saved, now also update the wr.
				var wr_id = this.createButtonWR;

				var comments = "Project Created";

				var cf_notes_text = "UserName: {0}, Date: {1}, Comments: {2}.";
				cf_notes_text = cf_notes_text.replace('{0}', user_name);
				cf_notes_text = cf_notes_text.replace('{1}', date.toDateString().substring(4));
				cf_notes_text = cf_notes_text.replace('{2}', comments);

				var old_cf_notes = BRG.Common.getDataValues('wr',['cf_notes'],'wr_id='+wr_id)["wr.cf_notes"];

				if (old_cf_notes != "")
				{
					old_cf_notes += "\n\n";
				}
				var cf_notes = old_cf_notes + cf_notes_text;

				var wrRecord = new Ab.data.Record();
				wrRecord.isNew = false;
				wrRecord.values["wr.wr_id"] = wr_id;
				wrRecord.values["wr.project_id"] = projectId;
				wrRecord.values["wr.cf_notes"] = cf_notes;

				// set the primary key
				wrRecord.oldValues = new Object();
				wrRecord.oldValues["wr.wr_id"] = wr_id;

				this.wrSaveDS.saveRecord(wrRecord);

				// reset the wR
				this.createButtonWR = null;
				this.wrprojectRequestEditPage1Grid.refresh();
				this.projectRequestEditPage1CreatedGrid.refresh();
				//this.projectRequestEditPage1Grid.refresh();
				if ($("projectCreateForm_summary_input") != undefined) {
					$("projectCreateForm_summary_input").value = "";
				}
				success = true;
			}
		}

		return success;
	},

	returnRequest: function()
	{
		var success = false;

		var returnCommentInput = $("projectRequestReturnForm_cf_notes_input");

		var user_name = View.user.employee.id;
		var date = new Date();
		var comments = returnCommentInput.value;

		// verify that comments have been filled.
		if (comments.replace(" ", "") == "") {
			this.projectRequestReturnForm.clearValidationResult();
			this.projectRequestReturnForm.addInvalidField('cf_notes_input', getMessage("ErrBlankComments"));
			this.projectRequestReturnForm.validationResult.valid = true;
			this.projectRequestReturnForm.displayValidationResult({});
			return success;
		}

		// Change status and tr_id to 'AA' and 'CCC' and append cf_notes.
		var cf_notes_text = "UserName: {0}, Date: {1}, Comments: {2}.";
		cf_notes_text = cf_notes_text.replace('{0}', user_name);
		cf_notes_text = cf_notes_text.replace('{1}', date.toDateString().substring(4));
		cf_notes_text = cf_notes_text.replace('{2}', comments);

		var old_cf_notes = this.projectRequestReturnForm.getFieldValue("wr.cf_notes");
		if (old_cf_notes != "")
		{
			old_cf_notes += "\n\n";
		}
		var cf_notes = old_cf_notes + cf_notes_text;

		this.projectRequestReturnForm.setFieldValue("wr.status", "AA");
		this.projectRequestReturnForm.setFieldValue("wr.tr_id", "CCC");
		this.projectRequestReturnForm.setFieldValue("wr.cf_notes", cf_notes);


		if (this.projectRequestReturnForm.save())
		{
			success = true;
			returnCommentInput.value = "";
			this.wrprojectRequestEditPage1Grid.refresh();
		}

		return success;
	},

	/**
	 * Helper function to append new Comments to old Comments.
	 */
	appendComments: function(oldComments, newComments)
	{
		var user_name = View.user.employee.id;
		var date = new Date();

		var commentsText = "UserName: {0}, Date: {1}, Comments: {2}.";
		commentsText = commentsText.replace('{0}', user_name);
		commentsText = commentsText.replace('{1}', date.toDateString().substring(4));
		commentsText = commentsText.replace('{2}', newComments);

		var oldCommentsText = oldComments;

		if (oldCommentsText != "")
		{
		oldCommentsText += "\n\n";
		}

		var retVal = oldCommentsText + commentsText;
		return retVal;
	},

	/**
	 * Updates and Saves the cf_notes.
	 */
	wr_report_onSaveWrNotes: function()
	{
		var newNotes = $('wrcfnoteInput').value;
		if (newNotes != undefined && newNotes != "") {
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

			var cfNotes = this.wr_report.getFieldValue('wr.cf_notes');

			// For Firefox: (replace lone \n chars with \r\n)
			newNotes = replaceLF(newNotes);

			var nextLine = cfNotes == "" ? "" : "\r\n";

			cfNotes = cfNotes + nextLine + currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;

			//this.nav_details_info.record.setValue('wr.cf_notes', cfNotes);
			this.wr_report.setFieldValue('wr.cf_notes', cfNotes);
			$('wrcfnoteInput').value = "";
		}

		this.wr_report.save();
	}
});

function onCreateProjectBtn(row)
{
	projectRequestEditPage1Controller.createButtonWR = row['wr.wr_id'];
	projectRequestEditPage1Controller.createButtonAC = row['wr.ac_id'];

	View.panels.get('projectCreateForm').refresh(null, true);
	View.panels.get('projectCreateForm').showInWindow({
					newRecord: true,
					closeButton: true
			});
	return;
}

function returnSubmitButtonHandler()
{
	return projectRequestEditPage1Controller.returnRequest();
}

function createSubmitButtonHandler()
{
	return projectRequestEditPage1Controller.createProjectFromRequest();
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