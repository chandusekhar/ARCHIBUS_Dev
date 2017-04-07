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

	// ***************************************************************************
	// Submits the request to Archibus SLA engine
	// ***************************************************************************
	wr_create_details_onSubmit: function() {

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

		var submitRecord = UC.Data.getDataRecordValuesFromForm(this.wr_create_details);

		// Submit Request
		try {
			var submitResult = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', activity_log_id,submitRecord);

			this.wr_create_details.actions.get("submit").enableButton(false);  // diable the submit button so it doesn't get submitted twice.


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

