//FILE: uc-wr-create-records-req1.js
//TO DO: Check Account code if there is a value. If null, fill in a default account code since we are automatically assigning a trade.


var createRecordController = View.createController('createRecordController', {
	createRecordPanel_afterRefresh: function()
	{
		// Autofill information
		var bl_id = "";
		var fl_id = "";
		var rm_id = "";
		var requestor = "";
		var wr_id = 0;
		var description = "";


		var openerView = View.getOpenerView();
		var openerPanel = null;
		var tableName = "";
		openerPanel=openerView.panels.get("nav_details_info");
		tableName="wr";

		// Found openerPanel, auto fill information.
		if (openerPanel != null) {
			bl_id = openerPanel.getFieldValue(tableName+".bl_id");
			fl_id = openerPanel.getFieldValue(tableName+".fl_id");
			rm_id = openerPanel.getFieldValue(tableName+".rm_id");
			wr_id = openerPanel.getFieldValue(tableName+".wr_id");
			ac_id = openerPanel.getFieldValue(tableName+".ac_id");
			description = replaceLF(openerPanel.getFieldValue(tableName+".description"));
			requestor = openerPanel.getFieldValue(tableName+".requestor");
			if (wr_id == "") { wr_id = 0; }
		}

		this.createRecordPanel.setFieldValue('activity_log.bl_id', bl_id);
		this.createRecordPanel.setFieldValue('activity_log.fl_id', fl_id);
		this.createRecordPanel.setFieldValue('activity_log.rm_id', rm_id);
		this.createRecordPanel.setFieldValue('activity_log.requestor', requestor);
		this.createRecordPanel.setFieldValue('activity_log.description', description);

		//AC_ID MAY NOT BE FILLED IN.  NEED TO FIX.
		this.createRecordPanel.setFieldValue('activity_log.ac_id', ac_id);
		this.createRecordPanel.setFieldValue('activity_log.tr_id', "RECORDS");
		this.createRecordPanel.setFieldValue('activity_log.activity_type', "SERVICE DESK - MAINTENANCE");


		//alert(this.createRecordPanel.getFieldValue("records_type"));

	},


	//FUNCTION createRecordPanel_submitRequest
	createRecordPanel_submitRequest: function()
	{

		var req_type = $('reqDropDownId').value;
		var prob_type = "";
		var add_desc = "";
		var openerView = View.getOpenerView();
		var openerPanel = openerView.panels.get("nav_details_info");
		var wr_id = openerPanel.getFieldValue("wr.wr_id");

		switch(req_type)
		{
			case "ELEC":
				prob_type = "REC-UPDATE ELEC";
				add_desc = "--ELECTRICAL DRAWING(S) NEED TO BE UPDATED.  Parent WR: " + wr_id + "--\r\n";
				break;
			case "MECH":
				prob_type = "REC-UPDATE MECH";
				add_desc = "--MECHANICAL DRAWING(S) NEED TO BE UPDATED.  Parent WR: " + wr_id + "--\r\n";
				break;
			case "ARCH":
				prob_type = "REC-UPDATE ARCH";
				add_desc = "--ARCHITECTURAL DRAWING(S) NEED TO BE UPDATED.  Parent WR: " + wr_id + "--\r\n";
				break;
		}

		this.createRecordPanel.setFieldValue('activity_log.prob_type', prob_type);

		var newNotes = $('additionalNotes2').value;
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
			// For Firefox: (replace lone \n chars with \r\n)

			newNotes = currentUser + " - " + dateString + "-" + timeString + " : " + newNotes;
			newNotes = replaceLF(newNotes);

		}

		var record = this.createRecordPanel.getRecord();

		var parsedDesc = add_desc + "\r\n" + newNotes + "\r\n" + replaceLF(record.values['activity_log.description']);

		// get the activity_log_id if it's from a "created" record.
		// Mostly for error checking as it should always be new.
		var activity_log_id = 0;
		var activity_log_id_value = this.createRecordPanel.getFieldValue("activity_log.activity_log_id").value
		if ( activity_log_id_value != undefined && activity_log_id_value != '') {
			activity_log_id = this.createRecordPanel.getFieldValue("activity_log.activity_log_id").value;
		}

		// Note: Can check for Duplication/Similar requests here.

		// Submit Request
		try {
			var submitRecord = UC.Data.getDataRecordValuesFromForm(this.createRecordPanel);
			// fixed linefeed for description.
			submitRecord['activity_log.description'] = parsedDesc;
            var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id,submitRecord);

			this.createRecordPanel.actions.get("save").enableButton(false);  // diable the submit button so it doesn't get submitted twice.

			// Email the Requestor
			//sendRequestorEmail();

		}
		catch (e) {
			Workflow.handleError(e);
		}

	},

	testing: function()
	{
		var notes = $('additionalNotes2').value;
		alert(notes);
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

function submitRequest()
{

	createRecordController.createRecordPanel_submitRequest();
}

function testing()
{
	createRecordController.testing();
}